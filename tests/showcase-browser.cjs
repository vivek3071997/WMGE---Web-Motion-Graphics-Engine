"use strict";
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const { chromium } = require("playwright");
const root = path.resolve(__dirname, "..");
const base = process.env.SHOWCASE_URL || "http://127.0.0.1:4173";
const keys = ["technology", "scenery", "food", "meeting", "social"];

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
    await page.goto(`${base}/examples/showcase/`);
    await page.locator("#autoplay-next").uncheck();
    assert.equal(await page.locator("#stories button").count(), 5);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      await page.locator("#stories button").nth(i).click();
      await page.waitForFunction((key) => {
        const video = document.querySelector("#film");
        return video.readyState >= 2 && video.currentSrc.endsWith(`/${key}.mp4`);
      }, key);
      const metadata = await page.locator("#film").evaluate((video) => {
        video.pause();
        return { width: video.videoWidth, height: video.videoHeight, duration: video.duration };
      });
      assert.deepEqual(metadata, { width: 1280, height: 720, duration: 18 }, key);
      const webm = await page.evaluate(async (key) => {
        const video = document.createElement("video");
        video.preload = "metadata";
        try {
          await new Promise((resolve, reject) => {
            video.onloadedmetadata = resolve;
            video.onerror = () => reject(new Error(`${key}: WebM metadata failed`));
            video.src = `renders/${key}.webm`;
          });
          return { width: video.videoWidth, height: video.videoHeight, duration: video.duration };
        } finally { video.removeAttribute("src"); video.load(); }
      }, key);
      assert.equal(webm.width, 1280, `${key}: WebM width`);
      assert.equal(webm.height, 720, `${key}: WebM height`);
      assert.ok(Math.abs(webm.duration - 18) < 0.01, `${key}: WebM duration`);
      assert.equal(await page.locator("#shots article").count(), 3);
      for (const selector of ["#open-editor", "#open-prompt", "#download-project", "#download-mp4", "#download-webm"]) {
        const href = await page.locator(selector).evaluate((link) => link.href);
        const response = await page.request.head(href);
        assert.equal(response.status(), 200, `${key}: ${selector}`);
      }
      await page.locator("#shots button").nth(2).click();
      await page.waitForFunction(() => {
        const video = document.querySelector("#film");
        return !video.paused && !video.seeking && video.currentTime > 12.2 && video.currentTime < 14;
      });
      await page.locator("#film").evaluate((video) => { video.pause(); });
      console.log("PASS", key, "real MP4+WebM metadata / links / third-shot seek / playback");
    }
    await page.locator("#autoplay-next").check();
    await page.locator("#film").evaluate(async (video) => {
      video.currentTime = 17.8;
      await video.play();
    });
    await page.waitForFunction(() => {
      const video = document.querySelector("#film");
      return location.search === "?story=technology" && video.readyState >= 2 &&
        video.currentSrc.endsWith("/technology.mp4") && !video.paused && video.currentTime > 0;
    });
    await page.locator("#autoplay-next").uncheck();
    await page.locator("#film").evaluate((video) => { video.pause(); });
    console.log("PASS automatic continuation wraps from social to technology");
    for (const key of keys) {
      console.log("Checking editable story", key);
      await page.goto(`${base}/?demo=${key}`);
      await page.waitForFunction(() => window.ready).catch((error) => {
        throw new Error(`${key}: editor readiness failed; browser errors: ${errors.join("; ")}; ${error.message}`);
      });
      const project = await page.evaluate(() => MotionForgeApp.getProject());
      assert.equal(project.scenes.length, 3, key);
      assert.ok(project.scenes.every((scene) => scene.id.startsWith(key + "-")), key);
    }
    console.log("PASS all five editor demo links load the correct editable story");
    await page.goto(`${base}/examples/showcase/`);
    await page.locator("#autoplay-next").uncheck();
    await page.setViewportSize({ width: 390, height: 844 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), "mobile overflow");
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.locator("#stories").scrollIntoViewIfNeeded();
    const out = path.join(root, "test-output");
    fs.mkdirSync(out, { recursive: true });
    await page.screenshot({ path: path.join(out, "showcase-gallery.png"), fullPage: true });
    assert.deepEqual(errors, []);
    console.log("PASS responsive gallery, no browser exceptions or console errors");
  } finally { await browser.close(); }
})().catch((error) => { console.error(error); process.exitCode = 1; });
