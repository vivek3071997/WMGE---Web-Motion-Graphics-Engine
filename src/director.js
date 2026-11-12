/* Motion Forge Smart Director - MIT. Turns a one-line brief into a complete, valid project plus an
   illustration depth plan, and plans depth for existing projects. Pure and deterministic; no DOM or network. */
(function (root, factory) {
  const api = factory(
    typeof module === "object" && module.exports ? require("./engine.js") : root.MotionForge,
  );
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.MotionDirector = api;
})(globalThis, function (M) {
  "use strict";
  const W = 1600, H = 900;
  const STOP = new Set(
    ("a an the and or of for to in on with without about into from by at as is are be this that these those our your my " +
      "their its it we you i me us make create build generate design produce animate want need please video motion graphics " +
      "graphic animation animated clip promo reel scene scenes shot shots second seconds sec secs minute minutes min long short " +
      "using use style show showing explain explaining explainer story simple modern clean cinematic quick nice cool awesome " +
      "high quality detailed some new how what why who where when can will should would could do does get one two three four five " +
      "six seven eight nine ten s x vs per via then also very more most all any each every like just ready").split(" "),
  );
  const stem = (w) =>
    w.length > 5 && w.endsWith("ies") ? w.slice(0, -3) + "y" :
    w.length > 5 && w.endsWith("ing") ? w.slice(0, -3) :
    w.length > 4 && /(ch|sh|x|ss)es$/.test(w) ? w.slice(0, -2) :
    w.length > 3 && w.endsWith("s") && !w.endsWith("ss") ? w.slice(0, -1) : w;
  const words = (s) =>
    String(s || "").toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 1 && !STOP.has(w)).map(stem);
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const round = (v) => Math.round(v);
  // Everyday words mapped to vocabulary that illustration names and genre detection understand.
  const SYNONYMS = {
    pancake: "breakfast food cook", waffle: "breakfast food", egg: "breakfast cook", coffee: "hot cocoa breakfast cafe food",
    cafe: "food breakfast hot cocoa", tea: "hot cocoa breakfast", pizza: "order food delivered", burger: "food truck order",
    sushi: "food order", restaurant: "order food truck", grocery: "online groceries", vegetable: "garden harvest", fruit: "garden harvest",
    bake: "cake birthday", cookie: "cake", dessert: "cake", wine: "special occasion together",
    kyoto: "visiting japan travel", tokyo: "visiting japan travel", japan: "visiting japan travel", paris: "travel destination",
    beach: "vacation travel", hotel: "booking travel", flight: "airplane travel", road: "route planning proud driver", car: "proud driver order ride",
    yoga: "meditation", gym: "personal training fitness", run: "fitness tracker walk", sleep: "starry window", diet: "healthy",
    instagram: "social media post", tiktok: "social media", youtube: "video tutorial social", follower: "followers social",
    birthday: "birthday cake celebrat", wedding: "love together celebrat", party: "online party celebrat",
    password: "biometric login online security", hacker: "online security bug detected", encrypt: "private data online security",
    revenue: "revenue analysis growth", sale: "online shopping revenue", ecommerce: "online shopping add to cart", shop: "online shopping",
    customer: "happy customer customer segments", invoice: "digital invoice printing invoices", payment: "mobile pay online transactions",
    hiring: "recruiter suggestions career", job: "career growth recruiter", interview: "person search recruiter",
    deadline: "tight deadline", email: "work emails mail sent", newsletter: "newsletter subscriber", calendar: "online calendar",
    bug: "bug detected fixing bugs", deploy: "code deployed push to production", website: "web development", chatbot: "ai personal assistant chat",
    kid: "school learning", child: "school learning", science: "studying science", math: "mathematics", book: "open book reading",
    planet: "astronomy", space: "astronomy artemis", star: "counting stars astronomy", energy: "electricity wind turbines", wind: "wind turbines",
    home: "sweet home working at home", dog: "walking the dog", music: "lost in music", movie: "cinema at home",
  };
  const expand = (tokens) => {
    const out = new Set(tokens);
    for (const t of tokens) if (SYNONYMS[t]) for (const w of words(SYNONYMS[t])) out.add(w);
    return out;
  };

  // Genre knowledge: detection words, art direction, beat structure, copy and illustration vocabulary.
  const GENRES = {
    technology: {
      label: "Technology / product", theme: "midnight", atmosphere: "particles",
      detect: "app software ai platform api cloud device code coding developer tech saas product feature launch startup robot chip digital automation server agent model machine learning gadget smartphone phone laptop web website plugin tool dashboard",
      beats: ["hook", "cards", "flow", "hero3d", "stats", "closing"],
      eyebrow: "PRODUCT STORY", tagline: (s) => `A clear look at how ${s} works, from the first click to full scale.`,
      cards: "What makes it different", flow: "How it works", hero: "Built to feel solid", stats: "By the numbers",
      steps: "Getting started", quote: "What people notice first",
      heroCaption: "Glass, metal and light show the product as a crafted object, not a flat screenshot.",
      cta: "Try it today", ctaSub: (s) => `${s}, ready when you are.`, button: "Get started",
      items: ["Connect", "Automate", "Scale"],
      symbols: ["cpu", "cloud", "zap", "sparkles", "rocket", "workflow"],
      illus: "app code coding developer software ai assistant server deploy cloud data dashboard system mobile tech engineer launch upload sync interface agent",
      model: [{ geometry: "knot", material: "glass", x: -0.9, s: 0.8 }, { geometry: "sphere", material: "liquidMetal", x: 1.2, y: -0.35, s: 0.62 }], mirror: true,
    },
    data: {
      label: "Data / finance", theme: "ocean", atmosphere: "grid",
      detect: "data analytics chart charts metric metrics kpi revenue growth finance financial budget money saving savings invest investment investor portfolio report quarterly sales profit stock crypto bank banking payment payments wallet market",
      beats: ["hook", "stats", "flow", "cards", "hero3d", "closing"],
      eyebrow: "THE NUMBERS", tagline: (s) => `${s}: the signal behind the numbers, made easy to read.`,
      cards: "What drives it", flow: "Where the value flows", hero: "A solid foundation", stats: "Key figures",
      steps: "The plan", quote: "The takeaway",
      heroCaption: "Liquid metal and glass columns turn abstract figures into something you can feel.",
      cta: "Make the next move", ctaSub: (s) => `${s}, measured and clear.`, button: "See the report",
      items: ["Collect", "Analyse", "Decide"],
      symbols: ["trending-up", "chart-column", "wallet", "coins", "piggy-bank", "target"],
      illus: "chart data analytic growth revenue budget saving money financial invest portfolio transaction investor business analysis report dashboard fund wallet",
      model: [{ geometry: "cylinder", material: "glass", x: -1.3, y: -0.4, s: 0.45, sy: 0.6 }, { geometry: "cylinder", material: "glass", x: 0, y: -0.1, s: 0.45, sy: 1 }, { geometry: "cylinder", material: "liquidMetal", x: 1.3, y: 0.25, s: 0.45, sy: 1.4 }], mirror: true,
    },
    food: {
      label: "Food / recipe", theme: "ember", atmosphere: "steam",
      detect: "food recipe recipes cook cooking kitchen chef bake baking bakery cafe café brunch cuisine menu meal dish breakfast lunch dinner pasta pizza cake dessert soup salad coffee tea restaurant ingredient ingredients delicious taste flavour flavor grill vegan bread cookie",
      beats: ["hook", "steps", "cards", "hero3d", "closing"],
      eyebrow: "FROM THE KITCHEN", tagline: (s) => `${s}, step by step, with every flavour in its place.`,
      cards: "On the table", flow: "From prep to plate", hero: "Plated with care", stats: "At a glance",
      steps: "The method", quote: "Fresh from the kitchen",
      heroCaption: "Warm light, rising steam and a slow turn of the plate set the mood before the first bite.",
      cta: "Bon appetit", ctaSub: (s) => `${s}, made at home.`, button: "Save the recipe",
      items: ["Prep", "Cook", "Plate", "Serve"],
      symbols: ["chef-hat", "utensils", "cooking-pot", "flame", "timer", "soup"],
      illus: "food cook cooking breakfast cake order delivered groceries garden harvest kitchen hot cocoa meal recipe truck birthday together",
      model: [{ geometry: "cylinder", material: "standard", color: "$surface", y: -0.7, s: 1.6, sy: 0.08 }, { geometry: "sphere", material: "standard", color: "$accent", y: -0.25, s: 0.55, sy: 0.4 }, { geometry: "sphere", material: "gas", color: "$secondary", y: 0.9, s: 0.9, sy: 1.1 }],
    },
    meeting: {
      label: "Meeting / business", theme: "graphite", atmosphere: "particles",
      detect: "meeting meetings team teams agenda standup stand-up workshop conference call quarterly review kickoff kick-off onboarding hr company business strategy plan planning presentation pitch board update all-hands office client project roadmap",
      beats: ["hook", "cards", "flow", "stats", "closing"],
      eyebrow: "TEAM BRIEFING", tagline: (s) => `${s}: what we cover, what we decide and who owns the next step.`,
      cards: "Agenda", flow: "From discussion to decision", hero: "Aligned and moving", stats: "Where we stand",
      steps: "Next steps", quote: "The decision",
      heroCaption: "One table, one direction: a calm 3D moment between agenda items.",
      cta: "Thanks, team", ctaSub: (s) => `${s}, see you at the next check-in.`, button: "Action items",
      items: ["Review", "Discuss", "Decide", "Assign"],
      symbols: ["users", "calendar", "presentation", "message-square", "handshake", "list-checks"],
      illus: "meeting team conference call remote collaboration co-worker work business plan pitch decision presentation organizing task schedule calendar meet handshake",
      model: [{ geometry: "cylinder", material: "glass", y: -0.5, s: 1.5, sy: 0.08 }, { geometry: "sphere", material: "liquidMetal", x: -0.9, y: 0, s: 0.3 }, { geometry: "sphere", material: "standard", color: "$secondary", x: 0, y: 0, s: 0.3 }, { geometry: "sphere", material: "standard", color: "$accent", x: 0.9, y: 0, s: 0.3 }], mirror: true,
    },
    social: {
      label: "Social / community", theme: "ember", atmosphere: "particles",
      detect: "social media instagram tiktok youtube twitter post posts follower followers like likes share sharing community friends influencer creator viral campaign brand story stories selfie party celebrate celebration birthday wedding event",
      beats: ["hook", "quote", "cards", "stats", "closing"],
      eyebrow: "COMMUNITY", tagline: (s) => `${s}: real people, shared moments, one conversation.`,
      cards: "Why people join in", flow: "How it spreads", hero: "Made to share", stats: "The buzz",
      steps: "Join in", quote: "In their words",
      heroCaption: "Glass bubbles and soft light mirror the way moments ripple through a community.",
      cta: "Join the conversation", ctaSub: (s) => `${s}, together.`, button: "Follow along",
      items: ["Share", "React", "Connect"],
      symbols: ["heart", "message-circle", "share-2", "thumbs-up", "camera", "smile"],
      illus: "social media post follower chat share selfie group together party happy feedback message love online celebrat friend",
      model: [{ geometry: "sphere", material: "glass", x: -1, s: 0.6 }, { geometry: "sphere", material: "glass", x: 0.4, y: 0.5, s: 0.42 }, { geometry: "sphere", material: "liquidMetal", x: 1.1, y: -0.4, s: 0.35 }],
    },
    travel: {
      label: "Travel / scenery", theme: "ocean", atmosphere: "mist",
      detect: "travel trip journey destination adventure holiday vacation tour tourism beach mountain mountains ocean sea lake river forest nature landscape scenery scenic city island hike hiking camping road sunset sunrise explore exploring world flight",
      beats: ["hook", "cards", "hero3d", "steps", "closing"],
      eyebrow: "THE JOURNEY", tagline: (s) => `${s}: slow mornings, wide horizons and the road in between.`,
      cards: "Along the way", flow: "The route", hero: "Where water meets light", stats: "The trip in numbers",
      steps: "Itinerary", quote: "Postcard from the road",
      heroCaption: "A living water surface and drifting mist bring the landscape into the frame.",
      cta: "Your next adventure", ctaSub: (s) => `${s}, waiting for you.`, button: "Plan the trip",
      items: ["Arrive", "Explore", "Unwind"],
      symbols: ["mountain", "plane", "compass", "map", "sun", "trees"],
      illus: "travel airplane destination adventure walk cabin japan world explor mode vacation trip next arriv route navigation village nature sunny winter autumn",
      model: [{ geometry: "plane", material: "water", y: -0.6, s: 2.6, rx: -90 }, { geometry: "sphere", material: "gas", y: 0.7, s: 1.6, sy: 0.9 }],
    },
    education: {
      label: "Education / explainer", theme: "paper", atmosphere: "grid",
      detect: "learn learning lesson course class student students teacher teach teaching school university study tutorial guide science math history explain concept concepts training workshop education knowledge quiz",
      beats: ["hook", "steps", "flow", "cards", "closing"],
      eyebrow: "LESSON", tagline: (s) => `${s}, explained one idea at a time.`,
      cards: "Key ideas", flow: "How it connects", hero: "See it in 3D", stats: "Quick facts",
      steps: "Step by step", quote: "Remember this",
      heroCaption: "A rotating model makes the idea tangible from every angle.",
      cta: "Now you know", ctaSub: (s) => `${s}, ready for the next lesson.`, button: "Keep learning",
      items: ["Observe", "Understand", "Apply"],
      symbols: ["graduation-cap", "book-open", "lightbulb", "brain", "atom", "pencil"],
      illus: "teacher study science reading book learning school knowledge idea question answer note grading mathematic open road research",
      model: [{ geometry: "torus", material: "glass", s: 0.9 }, { geometry: "sphere", material: "liquidMetal", s: 0.38 }],
    },
    health: {
      label: "Health / fitness", theme: "graphite", atmosphere: "particles",
      detect: "health healthy fitness workout exercise gym run running yoga meditation wellness sleep diet nutrition doctor medical care heart training habit habits mindfulness",
      beats: ["hook", "steps", "stats", "cards", "closing"],
      eyebrow: "WELLBEING", tagline: (s) => `${s}: small habits, steady progress.`,
      cards: "Why it matters", flow: "The routine", hero: "Balance", stats: "Progress",
      steps: "The routine", quote: "How it feels",
      heroCaption: "Smooth motion and soft reflections echo a calm, balanced routine.",
      cta: "Start today", ctaSub: (s) => `${s}, one day at a time.`, button: "Begin",
      items: ["Warm up", "Move", "Recover"],
      symbols: ["heart-pulse", "activity", "dumbbell", "timer", "sun", "bike"],
      illus: "fitness workout personal training meditation dance bike heavy lifting stat tracker walk happy doctor health",
      model: [{ geometry: "torus", material: "liquidMetal", s: 0.8 }, { geometry: "sphere", material: "glass", x: 1.3, s: 0.45 }],
    },
    security: {
      label: "Security / privacy", theme: "midnight", atmosphere: "grid",
      detect: "security secure privacy private password passwords encryption encrypt cyber cybersecurity hacker hack attack protect protection shield safe safety login authentication auth identity fraud compliance vault",
      beats: ["hook", "flow", "hero3d", "cards", "closing"],
      eyebrow: "SECURITY", tagline: (s) => `${s}: protection that works quietly in the background.`,
      cards: "Layers of protection", flow: "How data stays safe", hero: "Sealed in glass", stats: "Protection at a glance",
      steps: "Stay protected", quote: "Peace of mind",
      heroCaption: "A glass vault and a liquid-metal core show protection that is clear but unbreakable.",
      cta: "Stay protected", ctaSub: (s) => `${s}, always on.`, button: "Secure now",
      items: ["Encrypt", "Verify", "Monitor"],
      symbols: ["shield-check", "lock", "key", "fingerprint", "shield", "eye-off"],
      illus: "security secure protection private data biometric login lock usb shield safe online authentication fingerprint",
      model: [{ geometry: "box", material: "glass", s: 1.1 }, { geometry: "sphere", material: "liquidMetal", s: 0.45 }], mirror: true,
    },
    explainer: {
      label: "General explainer", theme: "midnight", atmosphere: "particles",
      detect: "",
      beats: ["hook", "cards", "flow", "hero3d", "closing"],
      eyebrow: "THE STORY", tagline: (s) => `${s}, told simply.`,
      cards: "The essentials", flow: "How it fits together", hero: "A closer look", stats: "In numbers",
      steps: "Step by step", quote: "The big idea",
      heroCaption: "Light, glass and reflection add depth to the central idea.",
      cta: "That's the story", ctaSub: (s) => `${s}.`, button: "Learn more",
      items: ["Discover", "Understand", "Act"],
      symbols: ["sparkles", "lightbulb", "target", "star", "compass", "zap"],
      illus: "idea process bright goal success plan solution thinking puzzle explor complete",
      model: [{ geometry: "knot", material: "glass", x: -0.8, s: 0.75 }, { geometry: "sphere", material: "liquidMetal", x: 1.2, y: -0.3, s: 0.55 }], mirror: true,
    },
  };
  const BEAT_WORDS = {
    hook: "hero welcome launch idea start",
    cards: "feature option list choose key point",
    flow: "process flow connect network step transfer sync",
    hero3d: "build design product",
    stats: "chart growth analytic data revenue stat",
    steps: "complete step check task progress list",
    quote: "review feedback chat happy message comment",
    closing: "success celebrat done winner goal happy completed accomplishment",
  };
  const CHAPTERS = { hook: "The idea", cards: "Highlights", flow: "How it works", hero3d: "Up close", stats: "The numbers", steps: "Step by step", quote: "Voices", closing: "Finale" };
  // Colour words: [accent for dark themes, accent for the light paper theme].
  const COLOURS = {
    cyan: ["#22d3ee", "#0e7490"], teal: ["#2dd4bf", "#0f766e"], blue: ["#60a5fa", "#1d4ed8"], navy: ["#6d8cff", "#1e3a8a"],
    purple: ["#a78bfa", "#6d28d9"], violet: ["#a78bfa", "#6d28d9"], indigo: ["#818cf8", "#4338ca"], pink: ["#f472b6", "#be185d"],
    magenta: ["#e879f9", "#a21caf"], red: ["#f87171", "#b91c1c"], coral: ["#ff8a73", "#c2410c"], orange: ["#fb923c", "#c2410c"],
    amber: ["#fbbf24", "#b45309"], gold: ["#fbbf24", "#a16207"], yellow: ["#facc15", "#a16207"], lime: ["#a3e635", "#4d7c0f"],
    green: ["#4ade80", "#15803d"], mint: ["#6ee7b7", "#047857"], emerald: ["#34d399", "#047857"],
  };
  const MOODS = [
    [/\b(light (?:theme|mode|background|look|palette)|bright|white background|paper|minimal|airy|pastel)\b/i, "paper"],
    [/\b(warm|sunset|cozy|cosy|ember|autumn)\b/i, "ember"],
    [/\b(ocean|sea|calm|aqua|underwater)\b/i, "ocean"],
    [/\b(neon|night|futuristic|sci-?fi|space|cyber)\b/i, "midnight"],
    [/\b(dark|moody|premium|luxury|elegant|noir)\b/i, "graphite"],
  ];

  function titleCase(s) {
    const small = new Set(["a", "an", "the", "and", "or", "of", "for", "to", "in", "on", "with", "at", "by"]);
    return s.split(/\s+/).filter(Boolean).map((w, i) =>
      /[A-Z]/.test(w.slice(1)) || /^\d/.test(w) ? w :
      i && small.has(w.toLowerCase()) ? w.toLowerCase() : w[0].toUpperCase() + w.slice(1)).join(" ");
  }
  function cleanPhrase(s, maxWords = 5) {
    const out = String(s).replace(/["'“”‘’()[\]]/g, "").replace(/^\s*(the|a|an|our|your|my|some)\s+/i, "")
      .replace(/\s+/g, " ").trim().split(" ").slice(0, maxWords).join(" ");
    return out ? out[0].toUpperCase() + out.slice(1) : "";
  }
  const FORMAT = "(?:motion graphics?|video|animation|animated|explainer|promo|reel|clip|teaser|trailer|ad|advert|commercial|intro|presentation|story|scene|showcase|short|film|piece|graphic)";
  function deriveTitle(brief, genre) {
    const quoted = brief.match(/["“]([^"”]{3,60})["”]/);
    if (quoted) return quoted[1].trim();
    let s = brief.split(/[.!?](?:\s|$)|\n/)[0];
    s = s.replace(/^\s*(please\s+)?(can you\s+)?(make|create|build|generate|design|produce|animate|i want|i need|give me|we need|show)\s+(me\s+|us\s+)?/i, "");
    s = s.replace(/\b\d+(?:\.\d+)?\s*-?\s*(?:seconds?|secs?|s|minutes?|mins?|scenes?|shots?|slides?)\b/gi, " ");
    const lead = new RegExp(`^.*?\\b${FORMAT}\\b\\s*(?:about|for|on|of|showing|explaining|introducing|celebrating|presenting|that shows|that explains|to explain|to show|called|named|titled)?\\s+`, "i");
    if (lead.test(s)) s = s.replace(lead, "");
    else s = s.replace(/^.*?\b(?:about|explaining|showing|introducing|celebrating|presenting)\s+/i, "");
    const colourWords = Object.keys(COLOURS).join("|");
    s = s.split(new RegExp(`[,;:]|\\s[-–—]\\s|\\b(?:with|using|in (?:a |an )?(?:[\\w-]+ ){0,2}(?:style|theme|colou?rs?|palette|tones?|look|mood)|in (?:${colourWords})\\b)\\b`, "i"))[0];
    s = s.replace(/^\s*(?:an?|the|some|our|your|my|their)\s+/i, "").replace(/\s+/g, " ").trim();
    s = s.replace(/^(?:(?:minimal|minimalist|light|dark|warm|calm|bold|neon|premium|elegant|playful|cinematic|bright|airy|pastel|cozy|cosy|moody|sleek|modern|clean)\s+)+(?:(?:look|style|feel|themed?|vibe)\s+)?/i, "") || s;
    const parts = s.split(" ").filter(Boolean).slice(0, 7);
    return parts.length ? titleCase(parts.join(" ")) : genre.label.split(" /")[0];
  }
  function parseItems(brief) {
    const m = brief.match(/(?::|\b(?:with|including|featuring|covering|steps?|agenda|ingredients|features|highlights|topics|stops)\b\s*:?)\s+([^.!?;\n]+)/i);
    if (!m) return [];
    const colourWords = Object.keys(COLOURS).join("|");
    const list = m[1].split(new RegExp(`\\bin (?:a |an )?(?:[\\w-]+ ){0,2}(?:style|theme|colou?rs?|palette|tones?|look|mood)\\b|\\bin (?:${colourWords})\\b`, "i"))[0];
    const parts = list.split(/,|;|\band\b|\bthen\b|->|→|\+|\//i).map((x) => cleanPhrase(x))
      .filter((x) => x.length >= 2 && x.length <= 40 && !/^\d+\s*(s|sec|seconds?|min|minutes?)$/i.test(x))
      .filter((x) => !/\b(colou?rs?|palette|theme|style|tone|mood)\b/i.test(x))
      .filter((x) => !/^(?:(?:very|more|soft)\s+)?(?:warm|cozy|cosy|bright|minimal|airy|pastel|calm|moody|premium|luxury|elegant|noir|dark|neon|futuristic|cinematic|playful|bold)(?:\s+(?:look|feel|vibe))?$/i.test(x))
      .filter((x) => !/^(?:(?:no|with|in)\s+)?(?:3d|glass|glassy|liquid metal|chrome|mirror|reflections?|refraction)(?:\s+(?:and|objects?|effects?))?$/i.test(x))
      .filter((x) => !new RegExp(`^(?:${Object.keys(COLOURS).join("|")})$`, "i").test(x));
    return parts.length >= 2 ? [...new Set(parts)].slice(0, 6) : [];
  }
  function parseNumbers(brief) {
    const text = brief.replace(/\b\d+(?:\.\d+)?\s*-?\s*(?:seconds?|secs?|minutes?|mins?|scenes?|shots?|slides?|fps|p)\b/gi, " ")
      .replace(/\b\d+\s*s\b/gi, " ").replace(/\b\d{3,4}\s*x\s*\d{3,4}\b/gi, " ");
    const out = [], re = /(\$|€|£)?(\d{1,3}(?:,\d{3})+(?!\d)|\d+(?:[.,]\d+)?)\s*(%|x|k|m|bn|b|\+)?(?![\w.])\s*([a-z][a-z-]*(?:\s+[a-z][a-z-]*){0,2})?/gi;
    let m;
    const LABEL_STOP = /^(a|an|the|to|of|in|on|at|by|for|and|or|with|from|into|than|is|are|was|were|be|our|your|its|their)$/i;
    const keep = (list) => list.filter((w) => w && !LABEL_STOP.test(w) && !/\d/.test(w));
    let prevEnd = 0;
    while ((m = re.exec(text)) && out.length < 4) {
      const thousands = /^\d{1,3}(,\d{3})+$/.test(m[2]), raw = thousands ? m[2].replace(/,/g, "") : m[2];
      const value = Number(raw.replace(",", "."));
      const before = text.slice(prevEnd, m.index);
      prevEnd = m.index + m[0].length - (m[4] || "").length;
      if (!Number.isFinite(value) || value > 1e12) continue;
      // Label from the words after the figure, else the words since the previous figure ("churn down to 2.1%"),
      // else the start of the clause ("revenue grew 42% to $3.5m").
      let label = keep((m[4] || "").split(/\s+/)).join(" ");
      if (!label) label = keep(before.split(/[,;:]/).pop().split(/[^A-Za-z-]+/)).slice(-2).join(" ");
      if (!label) label = keep(text.slice(0, m.index).split(/[,;:.]/).pop().split(/[^A-Za-z-]+/)).slice(0, 1).join(" ");
      label = cleanPhrase(label || "Key figure", 4);
      if (out.some((o) => o.label.toLowerCase() === label.toLowerCase())) label = cleanPhrase(`${label.split(" ")[0]} total`, 4);
      out.push({ value, prefix: m[1] || "", suffix: (m[3] || "").toUpperCase() === "X" ? "x" : (m[3] || ""), label,
        decimals: /[.,]/.test(raw) ? Math.min(2, raw.split(/[.,]/)[1].length) : 0 });
    }
    return out;
  }
  function pickTheme(brief, genre) {
    let name = genre.theme;
    for (const [re, theme] of MOODS) if (re.test(brief)) { name = theme; break; }
    const theme = { ...M.THEMES[name] }, light = name === "paper";
    const found = [];
    const re = new RegExp(`\\b(${Object.keys(COLOURS).join("|")})\\b`, "gi");
    let m;
    while ((m = re.exec(brief)) && found.length < 2) if (!found.includes(m[1].toLowerCase())) found.push(m[1].toLowerCase());
    if (found[0]) theme.accent = COLOURS[found[0]][light ? 1 : 0];
    if (found[1]) theme.secondary = COLOURS[found[1]][light ? 1 : 0];
    return { name, theme, colours: found };
  }

  // Reads a short brief and infers everything a motion designer would ask about.
  function analyze(brief, opts = {}) {
    brief = String(brief || "").slice(0, 2000).trim();
    const tokens = expand(words(brief));
    let genreKey = "explainer", best = 0;
    // Generic words ("app", "launch", "review") count half so a specific subject ("security app") wins.
    const GENERIC = new Set(words("app product launch tool feature platform plan project story event review update company business guide post brand campaign class"));
    for (const [key, g] of Object.entries(GENRES)) {
      const hit = new Set(words(g.detect));
      let score = 0;
      for (const t of tokens) if (hit.has(t)) score += GENERIC.has(t) ? 0.5 : 1;
      if (score > best) { best = score; genreKey = key; }
    }
    if (opts.genre && GENRES[opts.genre]) genreKey = opts.genre;
    const genre = GENRES[genreKey], lower = brief.toLowerCase();
    const features = {
      glass: /\b(glass|crystal|transparent|refract\w*|prism)\b/.test(lower),
      metal: /\b(metal|metallic|chrome|liquid metal|mercury|steel|silver)\b/.test(lower),
      water: /\b(water|ocean|sea|wave|waves|lake|river|liquid|rain)\b/.test(lower),
      gas: /\b(gas|smoke|steam|mist|fog|cloud|clouds|vapou?r)\b/.test(lower),
      mirror: /\b(reflect\w*|mirror\w*)\b/.test(lower),
      threeD: /\b(3d|three-?d|model|object|render|product shot)\b/.test(lower),
      no3D: /\b(no 3d|without 3d|flat|2d only)\b/.test(lower),
    };
    const numbers = parseNumbers(brief);
    let items = parseItems(brief);
    const itemsFromBrief = items.length > 0;
    if (!items.length) items = genre.items.slice();
    const sec = brief.match(/(\d+(?:\.\d+)?)\s*-?\s*(?:seconds?|secs?|s)\b/i),
      min = brief.match(/(\d+(?:\.\d+)?)\s*-?\s*(?:minutes?|mins?)\b/i),
      scenesAsked = brief.match(/(\d+)\s*-?\s*(?:scenes?|shots?|slides?|beats?|parts?)\b/i);
    let duration = sec ? Number(sec[1]) : min ? Number(min[1]) * 60 : 0;
    let count = scenesAsked ? clamp(Number(scenesAsked[1]), 2, 10) : 0;
    let beats = genre.beats.filter((b) => (b !== "stats" || numbers.length) && (b !== "hero3d" || !features.no3D));
    if ((features.threeD || features.glass || features.metal || features.water || features.gas || features.mirror) &&
        !features.no3D && !beats.includes("hero3d")) beats.splice(beats.length - 1, 0, "hero3d");
    if (numbers.length && !beats.includes("stats")) beats.splice(Math.min(2, beats.length - 1), 0, "stats");
    if (!count) count = duration ? clamp(Math.round(duration / 6), 2, 8) : beats.length;
    if (!duration) duration = count * 6;
    duration = clamp(duration, 6, 600);
    if (beats.length > count) {
      const middle = beats.slice(1, -1);
      // Keep requested features and real numbers when trimming the beat sheet.
      const keep = middle.filter((b) => (b === "hero3d" && (features.threeD || features.glass || features.metal || features.water || features.gas)) || (b === "stats" && numbers.length));
      const rest = middle.filter((b) => !keep.includes(b));
      const chosen = new Set([...keep, ...rest].slice(0, Math.max(0, count - 2)));
      beats = count >= 2 ? ["hook", ...middle.filter((b) => chosen.has(b)), "closing"] : ["hook"];
    }
    const pool = ["cards", "flow", "steps", "quote"];
    for (let i = 0; beats.length < count; i++) beats.splice(beats.length - 1, 0, pool[i % pool.length]);
    const sceneDuration = clamp(Math.round((duration / count) * 10) / 10, 3, 60);
    const title = deriveTitle(brief, genre);
    const { name: themeName, theme, colours } = pickTheme(brief, genre);
    const quote = (brief.match(/["“]([^"”]{12,140})["”]/g) || []).map((q) => q.slice(1, -1)).find((q) => q !== title);
    return {
      brief, genre: genreKey, genreLabel: genre.label, title, items, itemsFromBrief, numbers, features,
      duration: Math.round(sceneDuration * count * 10) / 10, sceneDuration, beats, themeName, theme, colours,
      quote: quote || "", keywords: [...tokens].slice(0, 40),
    };
  }

  // Text measurement is approximate (no DOM); wrapping keeps every line inside its box.
  function wrap(str, maxWidth, size, bold) {
    const per = size * (bold ? 0.56 : 0.5), lines = [];
    let line = "";
    for (const word of String(str).split(/\s+/).filter(Boolean)) {
      const next = line ? `${line} ${word}` : word;
      if (next.length * per > maxWidth && line) { lines.push(line); line = word; }
      else line = next;
    }
    if (line) lines.push(line);
    return lines;
  }
  function fit(str, maxWidth, size, maxLines, bold = true, minSize = 18) {
    let s = size, lines = wrap(str, maxWidth, s, bold);
    while ((lines.length > maxLines || lines.some((l) => l.length * s * (bold ? 0.56 : 0.5) > maxWidth)) && s > minSize) {
      s -= 2;
      lines = wrap(str, maxWidth, s, bold);
    }
    if (lines.length > maxLines) {
      lines = lines.slice(0, maxLines);
      lines[maxLines - 1] = lines[maxLines - 1].replace(/\s*\S*$/, "") + "…";
    }
    return { text: lines.join("\n"), size: s, lines: lines.length, height: Math.ceil(lines.length * s * 1.25) };
  }

  function builders(ctx) {
    let serial = 0;
    const id = (p) => `${p}-${ctx.scene}-${++serial}`;
    const kf = (pairs, easing = "easeInOut") => pairs.map(([time, value], i) => ({ time, value, easing: i ? easing : "linear" }));
    const track = (property, pairs, easing, loop = false) => ({ property, loop, keyframes: kf(pairs, easing) });
    const text = (value, x, y, size, extra = {}) => {
      const lines = String(value).split("\n").length;
      return { id: id("text"), type: "text", text: value, x, y, width: extra.width || W - x - 80, height: Math.ceil(size * 1.25 * lines),
        fontSize: size, fill: "$text", enter: "rise", enterDuration: 0.8, ...extra };
    };
    const rect = (x, y, width, height, fill, extra = {}) => ({ id: id("rect"), type: "rect", x, y, width, height, fill, radius: 18, enter: "fade", enterDuration: 0.7, ...extra });
    const circle = (x, y, size, fill, extra = {}) => ({ id: id("circle"), type: "circle", x, y, width: size, height: size, fill, enter: "scale", enterDuration: 0.8, ...extra });
    const symbol = (name, x, y, size, extra = {}) => ({ id: id("symbol"), type: "symbol", symbol: name, x, y, width: size, height: size, fill: "$accent", enter: "scale", enterDuration: 0.6, ...extra });
    const group = (x, y, width, height, extra = {}) => ({ id: id("group"), type: "group", x, y, width, height, enter: "rise", enterDuration: 0.7, ...extra });
    return { id, track, text, rect, circle, symbol, group };
  }

  // Each beat returns layers plus illustration slots that are kept clear of text and other content.
  function buildScene(beat, index, a, ctx) {
    const g = GENRES[a.genre], d = a.sceneDuration, b = builders({ scene: index + 1 });
    const { text, rect, circle, symbol, group, track } = b;
    const atmosphere = [], content = [], slots = [];
    const sym = (i) => g.symbols[i % g.symbols.length];
    // Background atmosphere: drifting light orbs, particles and an optional procedural effect.
    atmosphere.push(
      circle(-160 + (index % 2) * 1100, 380, 760, "$accent", { name: "Light orb", opacity: 0.05, enter: "fade", enterDuration: 1.4,
        tracks: [track("x", [[0, -160 + (index % 2) * 1100], [d, -100 + (index % 2) * 1040]], "linear"), track("scale", [[0, 0.92], [d / 2, 1.06], [d, 0.92]])] }),
      circle(980 - (index % 2) * 900, -220, 620, "$secondary", { name: "Fill light", opacity: 0.04, enter: "fade", enterDuration: 1.4,
        tracks: [track("y", [[0, -220], [d, -170]], "linear")] }),
    );
    if (g.atmosphere === "steam" || g.atmosphere === "mist") {
      atmosphere.push({ id: b.id("effect"), type: "effect", name: g.atmosphere === "steam" ? "Rising steam" : "Drifting mist", effect: "gas",
        x: 0, y: g.atmosphere === "steam" ? 0 : 420, width: W, height: g.atmosphere === "steam" ? H : 480, fill: "$secondary",
        intensity: 0.32, speed: 0.4, seed: 100 + index, opacity: 0.28, enter: "fade", enterDuration: 1.5 });
    }
    for (let i = 0; i < 14; i++) {
      const x = 90 + (i * 211 + index * 67) % 1420, y = 160 + (i * 149 + index * 31) % 560;
      atmosphere.push(circle(x, y, 3 + (i % 4), i % 3 ? "$secondary" : "$accent", { name: "Particle", enter: "none", opacity: 0.3,
        tracks: [track("y", [[0, y + 18], [d, y - 30]], "linear"), track("opacity", [[0, 0.08], [Math.min(d, 1 + (i % 3)), 0.55], [d, 0.12]])] }));
    }
    const heading = (value, maxWidth = 980) => {
      const f = fit(value, maxWidth, 62, 2);
      content.push(text(f.text, 70, 112, f.size, { name: "Heading", fontWeight: 700, width: maxWidth, height: f.height,
        shadowBlur: 18, shadowY: 6, shadowColor: "#00000055" }));
      return 112 + f.height;
    };
    const item = (i) => a.items[i % a.items.length];
    if (beat === "hook") {
      const t = fit(a.title, 760, 96, 3, true, 44);
      const top = t.lines === 1 ? 300 : t.lines === 2 ? 250 : 200;
      content.push(text(t.text, 76, top, t.size, { name: "Title", fontWeight: 800, width: 780, height: t.height, enterDuration: 1,
        shadowBlur: 24, shadowY: 10, shadowColor: "#00000066" }));
      const under = top + t.height + 18;
      content.push(rect(80, under, 0, 6, "$accent", { name: "Accent underline", radius: 3, enter: "none", start: 0.6,
        tracks: [track("width", [[0.6, 0], [1.6, 220]], "easeOut")] }));
      const sub = fit(g.tagline(a.title), 700, 28, 3, false, 20);
      content.push(text(sub.text, 80, under + 34, sub.size, { name: "Subtitle", fill: "$muted", width: 720, height: sub.height, start: 0.7, enter: "fade" }));
      let cx = 80;
      const chipY = under + 34 + sub.height + 30;
      a.items.slice(0, 3).forEach((label, i) => {
        const w = Math.min(260, Math.round(label.length * 18 * 0.56 + 44));
        if (cx + w > 860 || chipY + 44 > 770) return;
        const chip = group(cx, chipY, w, 44, { name: `Chip ${label}`, start: 1.2 + i * 0.2, enter: "scale" });
        content.push(chip, rect(0, 0, w, 44, "$surface", { parentId: chip.id, radius: 22, stroke: "$line", strokeWidth: 1, enter: "none" }),
          text(fit(label, w - 36, 18, 1).text, 18, 11, 18, { parentId: chip.id, width: w - 30, enter: "none", fontWeight: 600 }));
        cx += w + 14;
      });
      content.push(circle(930, 180, 560, "$accent", { name: "Halo", opacity: 0.12, enter: "fade", enterDuration: 1.2,
        tracks: [track("scale", [[0, 0.9], [d / 2, 1.04], [d, 0.9]])] }));
      [[905, 200], [1468, 330], [930, 690]].forEach(([x, y], i) =>
        content.push(symbol(sym(i), x, y, 44, { name: "Floating element", start: 0.8 + i * 0.25, opacity: 0.9, fill: i % 2 ? "$secondary" : "$accent",
          tracks: [track("y", [[0, y], [d / 2, y - 16], [d, y]])] })));
      slots.push({ layer: "front", box: { x: 960, y: 220, width: 500, height: 500 }, motion: "float", start: 0.3, words: `${BEAT_WORDS.hook} ${a.title}` });
    } else if (beat === "cards") {
      const after = heading(g.cards, 900);
      const n = Math.min(4, Math.max(3, a.items.length)), h = n === 4 ? 92 : 104, gap = 18;
      const y0 = Math.max(after + 30, 290);
      for (let i = 0; i < n; i++) {
        const y = y0 + i * (h + gap), card = group(80, y, 600, h, { name: `Card ${item(i)}`, start: 0.5 + i * 0.3,
          tracks: [track("x", [[0, 50], [0.5 + i * 0.3 + 0.8, 80]], "easeOut")] });
        const label = fit(item(i), 430, 28, 1);
        content.push(card,
          rect(0, 0, 600, h, "$surface", { parentId: card.id, stroke: "$line", strokeWidth: 1, enter: "none", shadowBlur: 22, shadowY: 10, shadowColor: "#00000040" }),
          rect(0, 18, 5, h - 36, "$accent", { parentId: card.id, radius: 3, enter: "none" }),
          circle(28, (h - 56) / 2, 56, "$accent", { parentId: card.id, opacity: 0.16, enter: "none" }),
          symbol(sym(i), 42, (h - 28) / 2, 28, { parentId: card.id, enter: "none" }),
          text(String(i + 1).padStart(2, "0"), 108, h / 2 - 32, 16, { parentId: card.id, width: 60, fill: "$accent", fontFamily: "mono", enter: "none" }),
          text(label.text, 108, h / 2 - 10, label.size, { parentId: card.id, width: 460, fontWeight: 700, enter: "none" }));
      }
      slots.push({ layer: "front", box: { x: 780, y: 230, width: 700, height: 520 }, motion: "float", start: 0.4, words: `${BEAT_WORDS.cards} ${a.items.join(" ")}` });
    } else if (beat === "flow") {
      heading(g.flow, 900);
      const n = clamp(a.items.length, 3, 4), w = 260, gap = (1440 - n * w) / (n - 1), ids = [];
      for (let i = 0; i < n; i++) {
        const x = 80 + i * (w + gap), node = group(x, 600, w, 150, { name: `Node ${item(i)}`, start: 0.5 + i * 0.45, enter: "scale" });
        const label = fit(item(i), w - 40, 24, 2);
        ids.push(node.id);
        content.push(node,
          rect(0, 0, w, 150, "$surface", { parentId: node.id, stroke: "$line", strokeWidth: 1, enter: "none", radius: 22, shadowBlur: 20, shadowY: 8, shadowColor: "#00000040" }),
          circle(w / 2 - 26, 16, 52, "$accent", { parentId: node.id, opacity: 0.18, enter: "none" }),
          symbol(sym(i), w / 2 - 14, 28, 28, { parentId: node.id, enter: "none" }),
          text(label.text, 20, 82, label.size, { parentId: node.id, width: w - 40, align: "center", fontWeight: 700, enter: "none" }));
      }
      for (let i = 0; i < n - 1; i++)
        content.push({ id: b.id("link"), type: "line", name: "Connector", from: ids[i], to: ids[i + 1], fromAnchor: "right", toAnchor: "left",
          curve: "bezier", arrow: true, particles: 3, stroke: "$accent", strokeWidth: 3, enter: "draw", start: 0.9 + i * 0.45, enterDuration: 0.6 });
      slots.push({ layer: "front", box: { x: 560, y: 270, width: 480, height: 300 }, motion: "float", start: 0.3, words: `${BEAT_WORDS.flow} ${a.items.join(" ")}` });
      slots.push({ layer: "back", box: { x: 1150, y: 120, width: 330, height: 250 }, opacity: 0.16, words: g.illus });
    } else if (beat === "hero3d") {
      const t = fit(g.hero, 600, 60, 3);
      content.push(text(t.text, 70, 112, t.size, { name: "Heading", fontWeight: 700, width: 620, height: t.height, shadowBlur: 18, shadowY: 6, shadowColor: "#00000055" }));
      const cap = fit(g.heroCaption, 560, 24, 4, false);
      content.push(text(cap.text, 74, 112 + t.height + 22, cap.size, { name: "Caption", fill: "$muted", width: 580, height: cap.height, enter: "fade", start: 0.5 }));
      const f = a.features, spec = g.model.map((o) => ({ ...o }));
      if (f.water && !spec.some((o) => o.material === "water")) spec.push({ geometry: "plane", material: "water", y: -0.9, s: 2.4, rx: -90 });
      if (f.gas && !spec.some((o) => o.material === "gas")) spec.push({ geometry: "sphere", material: "gas", y: 0.9, x: -1.2, s: 0.8 });
      if (f.metal && !spec.some((o) => o.material === "liquidMetal")) spec.push({ geometry: "sphere", material: "liquidMetal", x: 1.5, y: 0.5, s: 0.4 });
      if (f.glass && !spec.some((o) => o.material === "glass")) spec.push({ geometry: "knot", material: "glass", x: -1.5, y: 0.4, s: 0.5 });
      const objects = spec.slice(0, 6).map((o, i) => {
        const obj = { id: `obj${i + 1}`, geometry: o.geometry, material: o.material, color: o.color || (o.material === "liquidMetal" ? "$accent" : o.material === "glass" ? "#dbe7ff" : "$secondary"),
          x: o.x || 0, y: o.y || 0, scaleX: o.s, scaleY: o.sy ? o.s * o.sy : o.s, scaleZ: o.s };
        if (o.rx) obj.rotationX = o.rx;
        if (o.material === "glass") Object.assign(obj, { roughness: 0.05, transmission: 0.95, ior: 1.5, speed: 0.3 });
        if (o.material === "liquidMetal") Object.assign(obj, { amplitude: 0.14, frequency: 3, speed: 0.4 });
        if (o.material === "water") Object.assign(obj, { amplitude: 0.18, frequency: 5 });
        if (o.material === "gas") Object.assign(obj, { amplitude: 0.3, seed: 7 + i, opacity: 0.85 });
        if (o.material === "standard") obj.roughness = 0.3;
        if (o.geometry !== "plane" && o.material !== "gas" && !o.rx)
          obj.tracks = [{ property: "y", loop: false, keyframes: [{ time: 0, value: obj.y - 0.25 }, { time: Math.min(1.4, d), value: obj.y, easing: "backOut" }] }];
        return obj;
      });
      content.push({ id: b.id("stage"), type: "scene3d", name: "3D hero", x: 680, y: 150, width: 860, height: 620, enter: "fade", enterDuration: 0.9,
        cameraDistance: 6, cameraAzimuth: -18, cameraElevation: 16, fov: 40, lightIntensity: 4.5, ground: false,
        mirror: Boolean(g.mirror || f.mirror) && !spec.some((o) => o.material === "water"), objects,
        tracks: [track("cameraAzimuth", [[0, -22], [d, 22]], "easeInOut"), track("cameraDistance", [[0, 6.8], [d, 5.8]], "easeInOut")] });
      const capBottom = 112 + t.height + 22 + cap.height;
      if (capBottom < 520) slots.push({ layer: "mid", box: { x: 80, y: Math.max(capBottom + 30, 470), width: 540, height: 760 - Math.max(capBottom + 30, 470) }, motion: "float", start: 0.6, words: `${BEAT_WORDS.hero3d} ${g.illus}` });
    } else if (beat === "stats") {
      heading(g.stats, 900);
      const nums = a.numbers.slice(0, 4), cw = nums.length > 3 ? 205 : 270, step = cw + (nums.length > 3 ? 20 : 30);
      nums.forEach((n, i) => {
        const x = 80 + i * step, label = fit(n.label, cw - 40, 22, 2, false);
        const digits = `${n.prefix}${n.value.toFixed(n.decimals)}${n.suffix}`.length, fs = Math.min(70, Math.floor((cw - 44) / (digits * 0.62)));
        content.push(rect(x, 330, cw, 250, "$surface", { name: "Stat card", stroke: "$line", strokeWidth: 1, start: 0.4 + i * 0.3, enter: "rise", shadowBlur: 22, shadowY: 10, shadowColor: "#00000040" }),
          { id: b.id("counter"), type: "counter", name: `Counter ${n.label}`, x: x + 24, y: 360, width: cw - 40, height: 100, valueFrom: 0, valueTo: n.value,
            decimals: n.decimals, prefix: n.prefix, suffix: n.suffix, fontSize: fs, fontWeight: 800, fill: "$accent",
            start: 0.5 + i * 0.3, enter: "fade", tracks: [track("progress", [[0.5 + i * 0.3, 0], [2.6 + i * 0.3, 1]], "easeOut")] },
          rect(x + 24, 470, 60, 4, "$secondary", { radius: 2, start: 0.8 + i * 0.3 }),
          text(label.text, x + 24, 490, label.size, { width: cw - 40, fill: "$muted", height: label.height, start: 0.9 + i * 0.3, enter: "fade" }));
      });
      if (nums.length >= 2 && nums.every((n) => n.suffix === nums[0].suffix && n.prefix === nums[0].prefix))
        content.push({ id: b.id("chart"), type: "chart", name: "Comparison", x: 80, y: 610, width: 860, height: 150, values: nums.map((n) => n.value),
          labels: nums.map((n) => n.label.slice(0, 20)), fontSize: 16, fill: "$accent", start: 1.4, enter: "fade",
          tracks: [track("progress", [[1.4, 0], [3.2, 1]], "easeOut")] });
      slots.push({ layer: "front", box: { x: 1000, y: 240, width: 520, height: 510 }, motion: "float", start: 0.4, words: `${BEAT_WORDS.stats} ${nums.map((n) => n.label).join(" ")}` });
    } else if (beat === "steps") {
      const after = heading(g.steps, 900);
      const n = Math.min(5, Math.max(3, a.items.length)), row = n === 5 ? 82 : 96, y0 = Math.max(after + 30, 280);
      content.push(rect(105, y0 + 26, 3, 0, "$line", { name: "Timeline", radius: 0, enter: "none",
        tracks: [track("height", [[0.3, 0], [0.3 + n * 0.5, (n - 1) * row]], "linear")] }));
      for (let i = 0; i < n; i++) {
        const y = y0 + i * row, at = 0.4 + i * 0.5, label = fit(item(i), 520, 28, 1);
        content.push(circle(80, y, 52, "$accent", { name: `Step ${i + 1}`, start: at, shadowBlur: 16, shadowY: 6, shadowColor: "#00000050" }),
          text(String(i + 1), 80, y + 12, 22, { width: 52, align: "center", fill: "$background", fontWeight: 800, start: at, enter: "fade" }),
          text(label.text, 156, y + 10, label.size, { width: 540, fontWeight: 700, start: at + 0.1, enter: "slide" }),
          symbol("circle-check", 700, y + 12, 28, { name: "Done", fill: "$secondary", start: at + 1.2 }));
      }
      slots.push({ layer: "front", box: { x: 790, y: 230, width: 720, height: 520 }, motion: "float", start: 0.4, words: `${BEAT_WORDS.steps} ${a.items.join(" ")}` });
    } else if (beat === "quote") {
      heading(g.quote, 900);
      const q = fit(`"${a.quote || `${a.title}: shared, loved and remembered.`}"`, 660, 40, 4, false, 24);
      const card = group(80, 290, 760, 400, { name: "Quote card", start: 0.4 });
      content.push(card, rect(0, 0, 760, 400, "$surface", { parentId: card.id, radius: 28, stroke: "$line", strokeWidth: 1, enter: "none", shadowBlur: 30, shadowY: 14, shadowColor: "#00000050" }),
        symbol("quote", 44, 40, 52, { parentId: card.id, enter: "none" }),
        text(q.text, 48, 112, q.size, { parentId: card.id, width: 680, height: q.height, fontFamily: "serif", enter: "none" }),
        text(g.eyebrow.toLowerCase().replace(/^\w/, (c) => c.toUpperCase()), 48, 340, 20, { parentId: card.id, width: 600, fill: "$muted", enter: "none" }));
      ["heart", "thumbs-up", "message-circle", "heart", "sparkles"].forEach((s, i) => {
        const x = 700 + (i % 3) * 52, y0 = 700;
        content.push(symbol(s, x, y0, 34, { name: "Reaction", enter: "none", fill: i % 2 ? "$secondary" : "$accent", start: 1 + i * 0.5,
          tracks: [track("y", [[1 + i * 0.5, y0], [Math.min(d, 3 + i * 0.5), y0 - 380]], "easeOut"), track("opacity", [[1 + i * 0.5, 1], [Math.min(d, 3 + i * 0.5), 0]], "easeIn")] }));
      });
      slots.push({ layer: "front", box: { x: 900, y: 230, width: 620, height: 520 }, motion: "sway", start: 0.4, words: `${BEAT_WORDS.quote} ${g.illus}` });
    } else {
      const cta = fit(g.cta, 1200, 92, 2, true, 48);
      content.push(text(cta.text, 200, 140, cta.size, { name: "Call to action", width: 1200, height: cta.height, align: "center", fontWeight: 800, enterDuration: 1,
        shadowBlur: 26, shadowY: 10, shadowColor: "#00000066" }));
      const sub = fit(g.ctaSub(a.title), 1000, 28, 1, false, 20), subY = 140 + cta.height + 18;
      content.push(text(sub.text, 300, subY, sub.size, { name: "Sign-off", width: 1000, align: "center", fill: "$muted", start: 0.6, enter: "fade" }));
      const bw = Math.max(220, Math.round(g.button.length * 22 * 0.56 + 80)), by = subY + sub.height + 26;
      const button = group(800 - bw / 2, by, bw, 60, { name: "Button", start: 1.1, enter: "scale",
        tracks: [track("scale", [[1.8, 1], [2.4, 1.06], [3, 1]])] });
      content.push(button, rect(0, 0, bw, 60, "$accent", { parentId: button.id, radius: 30, enter: "none", shadowBlur: 24, shadowY: 8, shadowColor: "#00000055" }),
        text(g.button, 0, 17, 22, { parentId: button.id, width: bw, align: "center", fill: "$background", fontWeight: 800, enter: "none" }));
      const top = by + 60 + 26;
      slots.push({ layer: "front", box: { x: 560, y: top, width: 480, height: 770 - top }, motion: "float", start: 0.8, words: `${BEAT_WORDS.closing} ${a.title}` });
      slots.push({ layer: "back", box: { x: 110, y: 400, width: 380, height: 340 }, opacity: 0.16, words: g.illus });
      slots.push({ layer: "back", box: { x: 1110, y: 400, width: 380, height: 340 }, opacity: 0.16, words: g.illus });
    }
    // Rails: chapter eyebrow, scene counter and a progress bar, matching the showcase style.
    const total = a.beats.length, chapter = `${String(index + 1).padStart(2, "0")} · ${CHAPTERS[beat] || "Scene"}`;
    const rails = [
      rect(64, 54, 42, 4, "$accent", { name: "Rail accent", radius: 0, enter: "none" }),
      text((index === 0 ? g.eyebrow : chapter).toUpperCase(), 122, 41, 17, { name: "Chapter", fill: "$accent", fontWeight: 700, width: 900, enter: "fade" }),
      text(`${String(index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`, 1450, 43, 17, { name: "Counter", fill: "$muted", width: 80, fontFamily: "mono", align: "right", enter: "fade" }),
      rect(74, 800, 1452, 1, "$line", { name: "Timeline rule", radius: 0, opacity: 0.7 }),
      rect(74, 799, 0, 3, "$accent", { name: "Progress", radius: 0, enter: "none", tracks: [track("width", [[0, 0], [d, 1452]], "linear")] }),
      rect(0, 0, W, H, "$accent", { name: "Transition wipe", radius: 0, enter: "none", end: Math.min(d, 0.6), exitDuration: 0,
        tracks: [track("x", [[0, 0], [0.55, W]], "easeIn")] }),
    ];
    if (index === 0) rails.pop();
    return {
      scene: { id: `scene-${index + 1}`, name: `${String(index + 1).padStart(2, "0")} ${CHAPTERS[beat] || beat}`, duration: d,
        background: { type: "radial", color: "$background", color2: "$surface", grid: g.atmosphere === "grid", gridSize: 48, gridOpacity: 0.05 },
        layers: [...atmosphere, ...content, ...rails] },
      backIndex: atmosphere.length,
      slots,
    };
  }

  function label(file) {
    const base = String(file).replace(/\.(svg|png|jpe?g|webp)$/i, "").replace(/ \(\d+\)$/, "");
    return /^undraw_/i.test(base)
      ? base.replace(/^undraw_/i, "").replace(/_[a-z0-9]{4}$/i, "").replace(/-/g, " ")
      : base.replace(/[-_]+/g, " ").trim();
  }
  const entryOf = (e) => (typeof e === "string" ? { library: "undraw", file: e } : { library: e.library || "undraw", file: e.file });
  // Scores library entries against weighted words; distinctive matches beat long generic names.
  function rank(library, weights, used = new Set()) {
    const scored = [];
    for (const raw of library || []) {
      const e = entryOf(raw), key = `${e.library}/${e.file}`;
      if (used.has(key) || !/\.(svg|png|jpe?g|webp)$/i.test(e.file)) continue;
      const toks = [...new Set(words(label(e.file)))];
      let score = 0;
      for (const t of toks) {
        if (weights.has(t)) score += weights.get(t);
        else for (const [w, v] of weights) if (t.length >= 4 && w.length >= 4 && (t.startsWith(w) || w.startsWith(t))) { score += v / 2; break; }
      }
      if (score > 0) scored.push({ e, key, score: score / (1 + 0.12 * toks.length) });
    }
    return scored.sort((x, y) => y.score - x.score || x.e.file.localeCompare(y.e.file));
  }
  function weightsFor(a, slotWords) {
    const map = new Map(), add = (list, v) => { for (const t of list) map.set(t, Math.max(map.get(t) || 0, v)); };
    add(words(GENRES[a.genre].illus), 1.5);
    add(words(slotWords), 2.5);
    add(a.keywords || [], 3);
    return map;
  }
  function suggest(library, query, n = 12) {
    const toks = [...expand(words(query))], map = new Map(toks.map((t) => [t, 3]));
    return rank(library, map).slice(0, n).map((r) => ({ ...r.e, label: label(r.e.file), score: Math.round(r.score * 100) / 100 }));
  }

  // Builds a complete project and an illustration plan (filenames only) from a short brief.
  function build(brief, opts = {}) {
    const a = analyze(brief, opts), used = new Set(), plan = [], scenes = [];
    a.beats.forEach((beat, i) => {
      const built = buildScene(beat, i, a, opts);
      scenes.push(built.scene);
      for (const slot of built.slots) {
        const best = rank(opts.library, weightsFor(a, slot.words), used)[0];
        if (!best) continue;
        used.add(best.key);
        const p = { scene: built.scene.id, library: best.e.library, file: best.e.file, ...slot.box, start: slot.start || 0 };
        if (slot.layer === "back") Object.assign(p, { layer: "back", index: built.backIndex, opacity: slot.opacity ?? 0.16, distant: true });
        else if (slot.layer === "mid") Object.assign(p, { layer: "mid", index: built.scene.layers.length - (i ? 6 : 5), motion: slot.motion });
        else Object.assign(p, { motion: slot.motion, index: built.scene.layers.length - (i ? 6 : 5) });
        plan.push(p);
      }
    });
    const project = { version: 1, name: a.title, width: W, height: H, fps: 30, theme: a.theme, assets: {}, scenes };
    M.assertValid(project);
    return { project, plan, analysis: a };
  }

  // Plans illustration depth for any existing project: front placements in free space, otherwise faded back plates.
  function depthPlan(project, library, opts = {}) {
    const plan = [], used = new Set(), Wp = project.width, Hp = project.height;
    const area = (r) => Math.max(0, r.width) * Math.max(0, r.height);
    const overlap = (p, q) => Math.max(0, Math.min(p.x + p.width, q.x + q.width) - Math.max(p.x, q.x)) *
      Math.max(0, Math.min(p.y + p.height, q.y + q.height) - Math.max(p.y, q.y));
    const candidates = [[0.58, 0.22, 0.36, 0.62], [0.06, 0.28, 0.34, 0.56], [0.66, 0.48, 0.28, 0.36], [0.06, 0.5, 0.28, 0.36],
      [0.36, 0.5, 0.28, 0.36], [0.68, 0.14, 0.24, 0.3], [0.38, 0.2, 0.26, 0.3]]
      .map(([x, y, w, h]) => ({ x: round(x * Wp), y: round(y * Hp), width: round(w * Wp), height: round(h * Hp) }));
    const base = `${project.name} ${opts.brief || ""}`;
    const a = analyze(base);
    for (const s of project.scenes) {
      const roots = s.layers.filter((l) => !l.parentId && !l.hidden);
      if (!opts.force && roots.some((l) => l.type === "image" && (project.assets[l.asset]?.credit || "").length)) continue;
      const occupied = roots.filter((l) => l.type !== "line" && Number.isFinite(l.width) && Number.isFinite(l.height) &&
        area(l) < 0.5 * Wp * Hp && !(l.type === "circle" && (l.opacity ?? 1) < 0.2) && !(l.type === "rect" && (l.width < 8 || l.height < 8)))
        .map((l) => ({ x: l.x || 0, y: l.y || 0, width: l.width, height: l.height }));
      const text = s.layers.filter((l) => l.type === "text").map((l) => l.text).join(" ");
      const weights = weightsFor({ ...a, keywords: [...expand([...words(s.name), ...words(text), ...words(opts.brief)])] }, "");
      let best = rank(library, weights, used)[0], loose = false;
      if (!best) {
        // Nothing matches by keyword: any unused file still works as a faded background plate.
        const e = (library || []).map(entryOf).find((x) => /\.svg$/i.test(x.file) && !used.has(`${x.library}/${x.file}`)) ||
          (library || []).map(entryOf).find((x) => /\.(png|jpe?g|webp)$/i.test(x.file) && !used.has(`${x.library}/${x.file}`));
        if (e) { best = { e, key: `${e.library}/${e.file}` }; loose = true; }
      }
      if (!best) continue;
      used.add(best.key);
      let free = null, freeScore = Infinity;
      for (const c of candidates) {
        const hit = occupied.reduce((sum, r) => sum + overlap(c, r), 0) / area(c);
        if (hit < freeScore) { freeScore = hit; free = c; }
      }
      const backIndex = s.layers.findIndex((l) => !(["effect", "video"].includes(l.type) || area(l) >= 0.5 * Wp * Hp || (l.type === "circle" && (l.opacity ?? 1) < 0.2)));
      if (freeScore <= 0.04 && !loose) plan.push({ scene: s.id, library: best.e.library, file: best.e.file, ...free, motion: "float", start: Math.min(0.4, s.duration / 4) });
      else plan.push({ scene: s.id, library: best.e.library, file: best.e.file, ...candidates[0], layer: "back", distant: true,
        opacity: 0.16, index: Math.max(0, backIndex), start: 0 });
    }
    return plan;
  }

  // A production brief for any LLM: beats, copy, layout, motion, materials and illustration choices.
  function expandBrief(brief, opts = {}) {
    const { analysis: a, plan } = build(brief, opts), g = GENRES[a.genre];
    const lines = [
      `Genre: ${a.genreLabel}. Working title: "${a.title}". Total ${a.duration}s in ${a.beats.length} scenes of ${a.sceneDuration}s, 1600x900 at 30 fps.`,
      `Art direction: ${a.themeName} theme${a.colours.length ? ` with ${a.colours.join(" and ")} accents` : ""}; layered depth (background light orbs and particles${g.atmosphere === "steam" ? ", rising steam" : g.atmosphere === "mist" ? ", drifting mist" : ""}; midground illustrations with float and ground shadows; foreground type with soft drop shadows); one accent transition wipe between scenes.`,
      `Key items: ${a.items.join(", ")}${a.itemsFromBrief ? "" : " (genre defaults; replace with real ones if known)"}.`,
      a.numbers.length ? `Figures supplied by the user (use exactly, never invent others): ${a.numbers.map((n) => `${n.prefix}${n.value}${n.suffix} ${n.label}`).join("; ")}.` : "No figures supplied: do not invent statistics.",
      "Beat sheet:",
      ...a.beats.map((beat, i) => {
        const p = plan.filter((q) => q.scene === `scene-${i + 1}`).map((q) => `${label(q.file)} (${q.layer || "front"})`);
        const what = { hook: `title "${a.title}" with underline draw, tagline and item chips; hero illustration right with halo and floating ${g.symbols.slice(0, 3).join("/")} symbols`,
          cards: `heading "${g.cards}"; ${Math.min(4, Math.max(3, a.items.length))} staggered glass cards with icons; illustration right`,
          flow: `heading "${g.flow}"; ${clamp(a.items.length, 3, 4)} nodes joined by drawn bezier connectors with travelling particles; illustration above the flow`,
          hero3d: `heading "${g.hero}"; 3D stage with ${g.model.map((o) => `${o.material} ${o.geometry}`).join(", ")}${g.mirror ? ", planar mirror" : ""}; slow camera orbit`,
          stats: `heading "${g.stats}"; counters roll up to the supplied figures${a.numbers.length > 1 ? " with a comparison chart" : ""}`,
          steps: `heading "${g.steps}"; numbered timeline that draws down, each step checks off`,
          quote: "serif quote card with reactions rising past it",
          closing: `call to action "${g.cta}" with pulsing button "${g.button}"; illustration plus two faded side plates` }[beat];
        return `${i + 1}. ${CHAPTERS[beat]} (${a.sceneDuration}s): ${what}.${p.length ? ` Illustrations: ${p.join(", ")}.` : ""}`;
      }),
      "Quality bar: every scene has background, midground and foreground; staggered entrances 0.2-0.5s apart; nothing static for more than 2s; a readable hold of at least 1.5s after the last entrance; text stays inside 5% safe margins and never sits under illustrations.",
    ];
    return { text: lines.join("\n"), analysis: a, plan };
  }

  return { GENRES, CHAPTERS, analyze, build, depthPlan, expandBrief, suggest, label, fit, words };
});
