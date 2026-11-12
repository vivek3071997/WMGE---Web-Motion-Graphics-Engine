"use strict";
const test = require("node:test"),
  assert = require("node:assert/strict"),
  M = require("../src/engine.js"),
  E = require("../src/examples.js"),
  D = require("../src/director.js");

// Synthetic filenames only; real third-party art is never part of the repository.
const LIBRARY = [
  "undraw_code-review_ab12.svg", "undraw_programming_cd34.svg", "undraw_mobile-app_ef56.svg", "undraw_launch-day_gh78.svg",
  "undraw_cooking_ij90.svg", "undraw_breakfast_kl12.svg", "undraw_eating-together_mn34.svg", "undraw_recipe_op56.svg",
  "undraw_travel-mode_qr78.svg", "undraw_visiting-japan_st90.svg", "undraw_adventure_uv12.svg", "undraw_mountains_wx34.svg",
  "undraw_data-trends_yz56.svg", "undraw_financial-data_ab78.svg", "undraw_growth-chart_cd90.svg", "undraw_report_ef12.svg",
  "undraw_team-meeting_gh34.svg", "undraw_presentation_ij56.svg", "undraw_celebration_kl78.svg", "undraw_friends_mn90.svg",
  "undraw_secure-login_op12.svg", "undraw_meditation_qr34.svg", "undraw_teaching_st56.svg", "undraw_ideas_uv78.svg",
  "undraw_workout_wx90.svg", "undraw_yoga_yz12.svg", "undraw_healthy-habit_ab34.svg",
].map((file) => ({ library: "undraw", file }));

const BRIEFS = {
  technology: "Launch video for our AI code review app",
  food: "Recipe for fluffy pancakes: flour, eggs, milk, butter",
  travel: "Weekend in Kyoto",
  data: "Quarterly results: revenue grew 42% to $3.5m, 1200 new customers",
  meeting: "Quarterly team meeting: wins, roadmap, hiring",
  social: "Celebrate 10k followers with our community",
  security: "How we keep your passwords safe with encryption",
  health: "Morning yoga routine for beginners",
  education: "Lesson explaining photosynthesis for students",
};
const box = (l) => ({ x: l.x, y: l.y, width: l.width, height: l.height });
const intersects = (p, q) => p.x < q.x + q.width && q.x < p.x + p.width && p.y < q.y + q.height && q.y < p.y + p.height;

test("detects the genre of short briefs, including synonyms", () => {
  for (const [genre, brief] of Object.entries(BRIEFS)) assert.equal(D.analyze(brief).genre, genre, brief);
});

test("every brief builds a valid project with a unique, library-backed illustration plan", () => {
  const files = new Set(LIBRARY.map((e) => e.file));
  for (const brief of Object.values(BRIEFS)) {
    const { project, plan } = D.build(brief, { library: LIBRARY });
    assert.doesNotThrow(() => M.assertValid(project), brief);
    assert.equal(project.width, 1600);
    assert.ok(project.scenes.length >= 3, brief);
    assert.ok(plan.length >= Math.min(3, project.scenes.length), `${brief}: ${plan.length} placements`);
    assert.equal(new Set(plan.map((p) => p.file)).size, plan.length, `${brief}: duplicate illustration`);
    const ids = new Set(project.scenes.map((s) => s.id));
    for (const p of plan) {
      assert.ok(files.has(p.file) && ids.has(p.scene), JSON.stringify(p));
      assert.ok(Number.isInteger(p.index) && p.width > 0 && p.height > 0, JSON.stringify(p));
    }
  }
});

test("front illustrations stay clear of text and cards", () => {
  for (const brief of Object.values(BRIEFS)) {
    const { project, plan } = D.build(brief, { library: LIBRARY });
    for (const p of plan.filter((q) => q.layer !== "back")) {
      const scene = project.scenes.find((s) => s.id === p.scene);
      const solid = scene.layers.filter((l) => !l.parentId && ["text", "counter", "chart"].includes(l.type) && l.width && l.height);
      for (const l of solid) assert.ok(!intersects(p, box(l)), `${brief} / ${scene.name}: ${p.file} overlaps "${l.name || l.text}"`);
    }
  }
});

test("works without any illustration library", () => {
  const { project, plan } = D.build("Product launch", { library: [] });
  assert.doesNotThrow(() => M.assertValid(project));
  assert.deepEqual(plan, []);
});

test("parses titles, figures, timing, colours and materials", () => {
  const a = D.analyze('A 30 second "Pancake Sunday" video in teal and gold with liquid metal and glass');
  assert.equal(a.title, "Pancake Sunday");
  assert.equal(a.duration, 30);
  assert.ok(a.colours.includes("teal") && a.colours.includes("gold"));
  assert.ok(a.features.metal && a.features.glass);
  assert.ok(a.beats.includes("hero3d"));

  const n = D.analyze("Quarterly results: revenue grew 42% to $3.5m, 10,000 new customers, churn down to 2.1%").numbers;
  assert.deepEqual(n.map((x) => [x.prefix, x.value, x.suffix, x.decimals]),
    [["", 42, "%", 0], ["$", 3.5, "m", 1], ["", 10000, "", 0], ["", 2.1, "%", 1]]);
  assert.deepEqual(n.map((x) => x.label), ["Revenue grew", "Revenue", "New customers", "Churn down"]);
  assert.ok(!D.analyze("Launch video for our app").beats.includes("stats"), "no invented statistics");
});

test("plans depth for an existing project without moving its layers", () => {
  const project = E.project(), before = JSON.stringify(project);
  const plan = D.depthPlan(project, LIBRARY);
  assert.equal(JSON.stringify(project), before);
  assert.ok(plan.length > 0);
  assert.equal(new Set(plan.map((p) => p.file)).size, plan.length);
  for (const p of plan) assert.ok(project.scenes.some((s) => s.id === p.scene) && p.index >= 0);
  assert.deepEqual(D.depthPlan(project, []), []);
});

test("expands a short brief into a detailed production prompt", () => {
  const { text, plan } = D.expandBrief("Recipe for pancakes", { library: LIBRARY });
  assert.match(text, /Food \/ recipe/);
  assert.match(text, /scene/i);
  assert.ok(plan.length > 0);
  assert.ok(plan.every((p) => text.includes(D.label(p.file))), "chosen illustrations are named in the brief");
  assert.equal(D.label("undraw_visiting-japan_st90.svg"), "visiting japan");
  assert.equal(D.suggest(LIBRARY, "japan trip", 1)[0].file, "undraw_visiting-japan_st90.svg");
});
