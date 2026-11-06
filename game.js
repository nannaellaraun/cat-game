// Cat Game – runs entirely in the browser.
// The PHP version kept the cat in $_SESSION; here it lives in localStorage.

const STORAGE_KEY = "cat-game";
const TICK_MS = 35 * 1000; // the PHP page refreshed itself every 35 seconds

// The cat pictures are drawn by sprites.js in the cat's chosen color and coat.

// The gender choices in Cat Settings. Messages pick her/his/their (or the language's own words) in i18n.js.
const PRONOUNS = {
  female: { subject: "she", object: "her", possessive: "her", possessivePronoun: "hers" },
  male: { subject: "he", object: "him", possessive: "his", possessivePronoun: "his" },
  none: { subject: "they", object: "them", possessive: "their", possessivePronoun: "theirs" },
};

const CALM_DOWN_MS = 10 * 1000; // an angry or scratching cat calms down after 10 seconds
const BIRTHDAY_MS = 7 * 24 * 60 * 60 * 1000; // the cat has a birthday every 7 days
const MAX_AGE = 30; // same limit as Cat Settings
const MESSY_AT = 30; // at this cleanliness or lower the cat looks messy
const MAX_CATS = 4;
const JEALOUS_MS = 10 * 60 * 1000; // a cat ignored this long gets jealous of the others
const COLD_CHANCE = 0.03; // chance per time step that a cat in bad shape catches a cold
const SICK_LIFE_MS = 30 * 60 * 1000; // a cold left untreated this long costs a life
const ARTHRITIS_CHANCE = 0.005; // chance per time step that an old cat gets arthritis
const PAIN_RELIEF_MS = 12 * 60 * 60 * 1000; // the vet's pain medicine works this long

// ---------- Personalities ----------

// How a Default cat behaves. Each personality changes only some of these.
const DEFAULT_TRAITS = {
  petsBeforeAngry: 5, // the next pet in a row annoys the cat
  angryCost: 15, // happiness lost when annoyed by petting
  hungryCost: 15, // happiness lost per action while very hungry
  playJoy: 15, // happiness from playing
  playTiredness: 5, // energy used by playing
  feedJoy: 15, // happiness from food
  feedEnergy: 5, // energy from food
  joyBonus: 0, // extra happiness from every action
  timeHunger: 2, // hunger gained as time passes
  timeHappiness: 2, // happiness lost as time passes
  timeEnergy: 2, // energy lost as time passes
  timeDirt: 2, // cleanliness lost as time passes
  mess: 1, // how much eating and playing dirty the fur (1 = normal)
  staysInMiddle: false, // happiness drifts back toward 50
  bellyScratchChance: 0.3, // chance of a scratch from a belly rub
  brushScratchChance: 0, // chance of a scratch from brushing
  petScratchChance: 0, // chance of a scratch from petting
  laserSeconds: 20, // how long a laser dot round lasts
  laserJoy: 1, // happiness from laser catches (1 = normal)
  bondRate: 10, // how fast friendships grow when playing together
  squabbleChance: 0.1, // chance that playing together turns into a squabble
};

const PERSONALITIES = {
  default: { label: "Default" },
  neurotic: {
    label: "Neurotic",
    staysInMiddle: true,
    bondRate: 8,
    squabbleChance: 0.25,
    hungryCost: 25,
    petsBeforeAngry: 4,
    angryCost: 25,
    bellyScratchChance: 0.45,
  },
  extraverted: {
    label: "Extraverted",
    playJoy: 25,
    playTiredness: 2,
    feedJoy: 20,
    feedEnergy: 10,
    joyBonus: 3,
    timeHappiness: 3, // needs more playing
    timeEnergy: 1, // energy stays high
    bellyScratchChance: 0.2,
    laserSeconds: 30, // loves the laser dot
    laserJoy: 1.5,
    bondRate: 12,
  },
  bossy: {
    label: "Bossy",
    petsBeforeAngry: 2,
    playJoy: 8,
    bellyScratchChance: 0.75,
    brushScratchChance: 0.25,
    petScratchChance: 0.2,
    laserSeconds: 10, // gets bored of the laser dot
    laserJoy: 0.5,
    bondRate: 5,
    squabbleChance: 0.4,
  },
  agreeable: {
    label: "Agreeable",
    timeHunger: 1,
    timeDirt: 1,
    mess: 0.5,
    bellyScratchChance: 0, // never scratches during belly rubs
    bondRate: 15,
    squabbleChance: 0.03,
  },
};

// The rules for this cat's personality.
// Old cats get messier, and sore joints (arthritis) make playing harder.
function traits() {
  const rules = { ...DEFAULT_TRAITS, ...PERSONALITIES[cat.personality] };
  if (cat.age >= OLD_AGE) {
    rules.timeDirt += 1; // old cats groom themselves less
    rules.mess *= 1.5;
  }
  if (inPain(cat)) {
    rules.playJoy = Math.round(rules.playJoy / 2);
    rules.playTiredness *= 2;
    rules.laserSeconds = Math.round(rules.laserSeconds / 2);
    rules.bellyScratchChance = Math.min(1, rules.bellyScratchChance + 0.15); // it hurts
    rules.timeHappiness += 1;
  }
  return rules;
}

// ---------- State ----------

function startingStats(name) {
  return {
    hunger: 40,
    happiness: 70,
    energy: 90,
    cleanliness: 90,
    lives: 3,
    activity: "neutral",
    petStreak: 0, // how many times in a row the cat has been petted
    angryUntil: 0, // time (ms) when an angry cat calms down
    sick: false, // has a cold
    sickSince: 0, // when the cold started (or the last life it cost)
    message: { key: "msg.relaxing", params: { name } },
  };
}

// A new cat with the default look and starting stats.
function newCat(name) {
  return {
    id: Math.random().toString(36).slice(2, 10), // never changes, used for relationships
    name,
    age: 0,
    gender: "none",
    color: "orange",
    coat: "solid",
    eyes: "black",
    personality: "default",
    lastBirthday: Date.now(), // the next birthday is 7 days after this
    partyUntil: 0, // the party hat is worn until this time (end of the birthday)
    lastAttention: Date.now(), // when you last did something with this cat (for jealousy)
    arthritis: false, // old cats can get stiff, sore joints; it doesn't go away
    painReliefUntil: 0, // pain medicine from the vet works until this time
    ...startingStats(name),
  };
}

// Fills in anything missing or broken in a saved cat (e.g. from an older version).
function repairCat(saved) {
  const fresh = newCat("Cat");
  const loaded = { ...fresh, ...saved };
  for (const [key, value] of Object.entries(fresh)) {
    if (typeof value === "number" && !Number.isFinite(loaded[key])) loaded[key] = value;
  }
  delete loaded.flash; // the flash setting now belongs to the whole game
  if (!saved.id) loaded.id = fresh.id;
  return loaded;
}

// The saved game: all the cats, which one you're looking at, and game-wide settings.
function loadState() {
  let saved = null;
  try {
    saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
  } catch {
    // A broken save starts a new game.
  }
  if (!saved) {
    language = guessLanguage();
    return { cats: [newCat(t("name.cat"))], current: 0, flash: true, illness: true, relations: {}, language };
  }

  // Saves from before multiple cats held just one cat.
  if (!Array.isArray(saved.cats)) {
    return { cats: [repairCat(saved)], current: 0, flash: saved.flash !== false, illness: true, relations: {} };
  }
  const cats = saved.cats.filter(Boolean).slice(0, MAX_CATS).map(repairCat);
  if (cats.length === 0) cats.push(newCat("Cat"));
  const current = Math.min(Math.max(0, Number(saved.current) || 0), cats.length - 1);
  const relations = saved.relations && typeof saved.relations === "object" ? saved.relations : {};
  return {
    cats,
    current,
    flash: saved.flash !== false,
    illness: saved.illness !== false,
    relations,
    textSize: saved.textSize,
    contrast: saved.contrast,
    reduceMotion: saved.reduceMotion === true,
    sound: saved.sound !== false,
    font: saved.font,
    shortTexts: saved.shortTexts === true,
    language: saved.language,
  };
}

function saveState() {
  game.cats.forEach(rememberMessage);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(game));
  } catch {
    // Private mode or storage disabled – the game still works, it just won't remember.
  }
}

let game = loadState();
let cat = game.cats[game.current]; // the cat you're looking at

// Text size, contrast and reduce motion apply to the whole page.
const TEXT_SIZES = ["normal", "large", "extra-large"];
const CONTRASTS = ["normal", "high", "dark"];
if (!TEXT_SIZES.includes(game.textSize)) game.textSize = "normal";
if (!CONTRASTS.includes(game.contrast)) game.contrast = "normal";
game.reduceMotion = game.reduceMotion === true;
game.sound = game.sound !== false; // sound is on unless switched off in settings
const FONTS = ["pixel", "atkinson", "lexend"];
if (!FONTS.includes(game.font)) game.font = "pixel";
game.shortTexts = game.shortTexts === true;
shortTexts = game.shortTexts; // used by messageText in i18n.js

// Plays a sound from sound.js, unless sound is switched off.
function sound(name, seconds) {
  if (game.sound) playSound(name, seconds);
}
if (!LANGUAGES[game.language]) game.language = guessLanguage();
language = game.language;

function applyDisplaySettings() {
  const root = document.documentElement;
  root.dataset.textSize = game.textSize;
  root.dataset.contrast = game.contrast;
  root.dataset.font = game.font;
  root.classList.toggle("reduce-motion", game.reduceMotion);
}
applyDisplaySettings();

// Motion is reduced when the setting is on or the device asks for it.
const motionReduced = () =>
  game.reduceMotion || window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Each cat keeps its last few messages, newest first, for the 🕘 history.
const HISTORY_LENGTH = 8;
const sameMessage = (a, b) => JSON.stringify(a) === JSON.stringify(b);
function rememberMessage(c) {
  if (!Array.isArray(c.history)) c.history = [];
  const last = c.history[0] && (c.history[0].message ?? c.history[0].text);
  if (!c.message || sameMessage(last, c.message)) return;
  c.history.unshift({ message: c.message, time: Date.now() });
  c.history.length = Math.min(c.history.length, HISTORY_LENGTH);
}

// Runs fn with `cat` set to another cat, e.g. to let time pass for cats in the background.
function withCat(other, fn) {
  const before = cat;
  cat = other;
  try {
    return fn();
  } finally {
    cat = before;
  }
}

const isCurrentCat = (c) => c === game.cats[game.current];

// Messages are saved as { key, params } so they can be shown in any language (see i18n.js).
// The cat's name and gender are always included; the gender picks her/his/their.
function note(key, params = {}, c = cat) {
  return { key, params: { name: c.name, gender: c.gender, ...params } };
}
function say(key, params = {}, c = cat) {
  c.message = note(key, params, c);
}

// ---------- Helpers ----------


const up = (value, amount) => Math.min(100, value + amount);
const down = (value, amount) => Math.max(0, value - amount);

// ---------- Actions (same numbers as the PHP version) ----------

const actions = {
  feed() {
    cat.activity = "neutral";
    cat.hunger = down(cat.hunger, 20);
    cat.happiness = up(cat.happiness, traits().feedJoy);
    cat.energy = up(cat.energy, traits().feedEnergy);
    cat.cleanliness = down(cat.cleanliness, Math.round(5 * traits().mess)); // a bit of food in the fur
    say("msg.feed");
  },
  play() {
    if (cat.sick) return tooSick();
    cat.activity = "playing";
    cat.happiness = up(cat.happiness, traits().playJoy);
    cat.energy = down(cat.energy, traits().playTiredness);
    cat.hunger = up(cat.hunger, 5);
    cat.cleanliness = down(cat.cleanliness, Math.round(15 * traits().mess)); // rolling around gets the fur messy
    say("msg.play");
  },
  sleep() {
    cat.activity = "sleeping";
    cat.hunger = up(cat.hunger, 15);
    cat.happiness = up(cat.happiness, 5);
    cat.energy = up(cat.energy, 30);
    say("msg.sleep");
  },
  pet() {
    if (Math.random() < traits().petScratchChance) return scratch();
    cat.petStreak += 1;
    if (cat.petStreak > traits().petsBeforeAngry) {
      cat.activity = "angry";
      cat.happiness = down(cat.happiness, traits().angryCost);
      say("msg.angry");
      // Every pet while angry restarts the countdown.
      cat.angryUntil = Date.now() + CALM_DOWN_MS;
      scheduleCalmDown();
    } else {
      cat.activity = "neutral";
      cat.happiness = up(cat.happiness, 5);
      say("msg.purr");
      sound("purr", 2);
      nextAnimation = "pet";
    }
  },
  bellyRub() {
    if (Math.random() < traits().bellyScratchChance) return scratch();
    cat.activity = "neutral";
    cat.happiness = up(cat.happiness, 10);
    say("msg.bellyRub");
    sound("purr", 3);
    nextAnimation = "belly";
  },
  brush() {
    if (Math.random() < traits().brushScratchChance) return scratch();
    cat.activity = "neutral";
    cat.cleanliness = up(cat.cleanliness, 30);
    cat.happiness = up(cat.happiness, 5);
    say("msg.brush");
    sound("brush");
  },
  meow() {
    cat.activity = "neutral";
    cat.happiness = up(cat.happiness, 5);
    say("msg.meow");
    sound("meow");
  },
  reset() {
    Object.assign(cat, startingStats(cat.name));
  },
  playTogether() {
    if (cat.sick) return tooSick();
    const friend = playFriend();
    if (!friend) return;
    const mine = traits();
    const theirs = withCat(friend, traits);
    const before = relationOf(cat, friend);
    const pair = bondOf(cat, friend);

    // Sometimes playing turns into a squabble; rivals squabble more.
    const squabbleChance = Math.max(mine.squabbleChance, theirs.squabbleChance) + (before === "rivals" ? 0.2 : 0);
    const squabble = Math.random() < squabbleChance;
    const growth = squabble ? -15 : Math.round((mine.bondRate + theirs.bondRate) / 2);
    pair.bond = Math.max(-100, Math.min(100, pair.bond + growth));
    const joy = squabble ? -5 : 10 + (before ? RELATIONS[before].joy : 0);

    const message = [note(squabble ? "msg.squabble" : "msg.together", { friend: friend.name })];
    const after = relationOf(cat, friend);
    if (after && after !== before) message.push(note("msg.now." + after));
    if (!squabble && after === "couple" && maybeKitten(cat, friend, pair)) message.push(note("msg.hadKitten"));

    for (const c of [cat, friend]) {
      c.activity = "chasing";
      c.happiness = joy >= 0 ? up(c.happiness, joy) : down(c.happiness, -joy);
      c.energy = down(c.energy, 5);
      c.hunger = up(c.hunger, 5);
      c.cleanliness = down(c.cleanliness, 5);
      c.lastAttention = Date.now();
      c.message = message;
    }
    togetherFriend = friend;
  },
  vet() {
    if (!needsVet(cat)) return;
    const hadCold = cat.sick;
    cat.sick = false;
    if (cat.arthritis) cat.painReliefUntil = Date.now() + PAIN_RELIEF_MS;
    cat.activity = "neutral";
    cat.happiness = down(cat.happiness, 10); // cats don't like the vet
    const parts = [];
    if (hadCold) parts.push(note("msg.vetCured"));
    if (cat.arthritis) parts.push(note("msg.vetPain"));
    parts.push(note("msg.vetTrip"));
    cat.message = parts;
    nextAnimation = "vet";
  },
  laserDone() {
    const caught = lastLaserCatches;
    cat.activity = "chasing";
    cat.happiness = up(cat.happiness, Math.min(30, Math.round(caught * 3 * traits().laserJoy)));
    cat.energy = down(cat.energy, 8);
    cat.hunger = up(cat.hunger, 5);
    if (caught === 0) say("msg.laserNone");
    else say("msg.laserCaught", { count: caught });
  },
  timePassed() {
    const rules = traits();
    cat.hunger = up(cat.hunger, rules.timeHunger);
    cat.happiness = down(cat.happiness, rules.timeHappiness);
    cat.energy = down(cat.energy, rules.timeEnergy);
    cat.cleanliness = down(cat.cleanliness, rules.timeDirt);
    checkBirthday();
    checkHealth();
  },
};

// ---------- Getting sick ----------

// A dirty, very hungry or exhausted cat can catch a cold. Kittens and old cats catch one more
// easily, and colds go round: the chance doubles while another cat is sick.
function checkHealth() {
  if (game.illness === false) {
    cat.sick = false;
    return;
  }
  // Old cats can develop arthritis, slowly and only once.
  if (cat.age >= OLD_AGE && !cat.arthritis && Math.random() < ARTHRITIS_CHANCE) {
    cat.arthritis = true;
    say("msg.arthritis");
  }
  if (cat.sick) {
    cat.happiness = down(cat.happiness, 2);
    cat.energy = down(cat.energy, 2);
    if (Date.now() - cat.sickSince >= SICK_LIFE_MS) {
      cat.lives = Math.max(0, cat.lives - 1);
      cat.sickSince = Date.now();
      say("msg.sickLife");
    }
    return;
  }
  const inBadShape = cat.cleanliness <= 20 || cat.hunger >= 80 || cat.energy <= 10;
  if (!inBadShape) return;
  let chance = COLD_CHANCE;
  if (cat.age <= KITTEN_AGE || cat.age >= OLD_AGE) chance *= 2;
  if (game.cats.some((c) => c !== cat && c.sick && c.lives > 0)) chance *= 2;
  if (Math.random() < chance) {
    cat.sick = true;
    cat.sickSince = Date.now();
    say("msg.cold");
  }
}

// Arthritis hurts unless the vet's pain medicine is working (and illness is switched on).
const inPain = (c) => game.illness !== false && c.arthritis && Date.now() >= c.painReliefUntil;
const needsVet = (c) => game.illness !== false && (c.sick || inPain(c));

function tooSick() {
  say("msg.tooSick");
}

// ---------- Scratching ----------

// The cat scratches you: claws-out picture, a red flash, and the cat is a bit upset.
function scratch() {
  cat.activity = "scratching";
  cat.happiness = down(cat.happiness, 5);
  say("msg.scratch");
  cat.angryUntil = Date.now() + CALM_DOWN_MS;
  scheduleCalmDown();
  flashRed();
}

function flashRed() {
  if (!game.flash) return;
  const flash = document.createElement("div");
  flash.className = "scratch-flash";
  document.body.append(flash);
  setTimeout(() => flash.remove(), 700);
}

// ---------- Birthdays ----------

const isPartyTime = () => Date.now() < cat.partyUntil;

// Every 7 days the cat turns a year older (up to MAX_AGE) and gets a party for the rest of the day.
function checkBirthday() {
  let birthday = false;
  let grewUp = false;
  while (Date.now() - cat.lastBirthday >= BIRTHDAY_MS) {
    cat.lastBirthday += BIRTHDAY_MS;
    birthday = true;
    if (cat.age < MAX_AGE) {
      cat.age += 1;
      grewUp = true;
    }
  }
  if (!birthday) return;

  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  cat.partyUntil = midnight.getTime();
  cat.message = [note("msg.birthday")];
  if (grewUp) cat.message.push(note("msg.turned", { age: cat.age }));
  showConfetti();
}

// Pixel confetti falling over the card for a few seconds.
let confettiShown = false;
function showConfetti() {
  confettiShown = true;
  if (motionReduced()) return;
  const box = document.createElement("div");
  box.className = "confetti";
  const colors = ["#e84a8a", "#4aa8e0", "#f2d530", "#4caf50", "#e0961c"];
  for (let i = 0; i < 60; i++) {
    const piece = document.createElement("i");
    piece.style.left = Math.random() * 100 + "%";
    piece.style.background = colors[i % colors.length];
    piece.style.animationDelay = Math.random() * 1.5 + "s";
    piece.style.animationDuration = 2 + Math.random() * 1.5 + "s";
    box.append(piece);
  }
  document.querySelector(".game").append(box);
  setTimeout(() => box.remove(), 5000);
}

// Rules that run after every action, like the bottom half of the PHP script.
function applyRules() {
  // A very hungry cat gets sadder
  if (cat.hunger > 80) {
    cat.happiness = down(cat.happiness, traits().hungryCost);
  }

  // A dirty cat is a bit grumpy
  if (cat.cleanliness <= 20) {
    cat.happiness = down(cat.happiness, 5);
  }

  // A neurotic cat's happiness drifts back toward the middle
  if (traits().staysInMiddle) {
    const step = Math.min(5, Math.abs(50 - cat.happiness));
    cat.happiness += cat.happiness < 50 ? step : -step;
  }

  // Lose a life when everything is at rock bottom
  if (cat.hunger >= 100 && cat.happiness <= 0 && cat.energy <= 0) {
    cat.lives = Math.max(0, cat.lives - 1);
    say("msg.lostLife");
  }

  if (cat.lives <= 0) {
    say("msg.gameOver");
  }
}

// After CALM_DOWN_MS without petting, an angry cat is happy to be petted again.
function scheduleCalmDown() {
  const thisCat = cat;
  setTimeout(() => withCat(thisCat, calmDown), Math.max(0, cat.angryUntil - Date.now()));
}

function calmDown() {
  const upset = cat.activity === "angry" || cat.activity === "scratching";
  if (!upset || Date.now() < cat.angryUntil) return;
  say(cat.activity === "angry" ? "msg.calmAngry" : "msg.calm");
  cat.activity = "neutral";
  cat.petStreak = 0;
  saveState();
  if (isCurrentCat(cat)) render();
}

function doAction(name) {
  if (name !== "timePassed") stopAnimation();
  // Doing anything else breaks the petting streak; time passing doesn't.
  if (name !== "pet" && name !== "timePassed") cat.petStreak = 0;
  actions[name]();
  if (name !== "timePassed") giveAttention();
  // An extraverted cat enjoys any attention a little extra.
  if (name !== "timePassed" && name !== "reset" && cat.activity !== "scratching") {
    cat.happiness = up(cat.happiness, traits().joyBonus);
  }
  applyRules();
  saveState();
  render();
  if (nextAnimation) playAnimation(nextAnimation);
  nextAnimation = null;
  if (togetherFriend) showFriend(togetherFriend);
  togetherFriend = null;
}

// Time passes for every cat, also the ones you're not looking at.
function timePasses() {
  for (const c of game.cats) {
    if (c.lives > 0) {
      withCat(c, () => {
        actions.timePassed();
        applyRules();
      });
    }
  }
  saveState();
  render();
}

// ---------- More than one cat ----------

let togetherFriend = null; // the cat that just played with the current cat

const isJealous = (c) => game.cats.length > 1 && c.lives > 0 && Date.now() - c.lastAttention > JEALOUS_MS;

// Doing something with this cat: the other cats who have been ignored for long get a bit sadder.
function giveAttention() {
  cat.lastAttention = Date.now();
  for (const other of game.cats) {
    const close = ["friends", "best", "couple"].includes(relationOf(cat, other));
    if (other !== cat && isJealous(other) && !close) other.happiness = down(other.happiness, 3);
  }
}

// The cat to play with: the one that has been ignored the longest.
function playFriend() {
  const others = game.cats.filter((c) => c !== cat && c.lives > 0 && !c.sick);
  return others.sort((a, b) => a.lastAttention - b.lastAttention)[0] || null;
}

function switchCat(index) {
  if (laser || index === game.current || !game.cats[index]) return;
  stopAnimation();
  game.current = index;
  cat = game.cats[index];
  lookDirection = null;
  saveState();
  render();
}

// The + opens "Make a new cat!"; the cat is only made when the form is sent.
function adoptCat() {
  if (game.cats.length >= MAX_CATS || laser) return;
  $("new-name").value = t("name.numbered", { n: game.cats.length + 1 });
  $("new-age").value = 1;
  $("new-gender").value = "none";
  $("new-personality").value = "default";
  $("new-color").value = "orange";
  $("new-coat").value = "solid";
  $("new-eyes").value = "black";
  $("newcat-error").textContent = "";
  updateNewCatPreview();
  $("newcat-dialog").showModal();
}

function updateNewCatPreview() {
  const age = Number($("new-age").value);
  const preview = $("newcat-preview");
  preview.src = drawCat("neutral", $("new-color").value, $("new-coat").value, $("new-eyes").value, {
    grey: age >= OLD_AGE,
  });
  preview.classList.toggle("kitten", age <= KITTEN_AGE);
}

function makeNewCat(event) {
  event.preventDefault();
  const name = $("new-name").value.trim();
  const age = Number($("new-age").value);
  if (name === "" || !Number.isInteger(age) || age < 0 || age > 30) {
    $("newcat-error").textContent = t("err.nameAge");
    return;
  }
  const kitty = newCat(name);
  kitty.age = age;
  const pickFrom = (value, options, fallback) => (value in options ? value : fallback);
  kitty.gender = pickFrom($("new-gender").value, PRONOUNS, "none");
  kitty.personality = pickFrom($("new-personality").value, PERSONALITIES, "default");
  kitty.color = pickFrom($("new-color").value, CAT_COLORS, "orange");
  kitty.coat = pickFrom($("new-coat").value, CAT_COATS, "solid");
  kitty.eyes = pickFrom($("new-eyes").value, CAT_EYES, "black");
  say("msg.adopted", {}, kitty);
  game.cats.push(kitty);
  $("newcat-dialog").close();
  switchCat(game.cats.length - 1);
}

// Clicking the chosen cat's face again: "Delete this cat?", then "Are you sure?"
function askDelete() {
  if (game.cats.length <= 1 || laser) return;
  const dialog = $("delete-dialog");
  $("delete-face").src = drawCat(cat.lives > 0 ? "face" : "gameOver", cat.color, cat.coat, cat.eyes, {
    grey: cat.age >= OLD_AGE,
  });
  $("delete-name").textContent = cat.name;
  dialog.returnValue = "";
  dialog.showModal();
  dialog.addEventListener("close", () => {
    if (dialog.returnValue === "yes") removeCat();
  }, { once: true });
}

async function removeCat() {
  if (game.cats.length <= 1) return;
  if (!(await askSure(t("confirm.remove", { name: cat.name }), t("confirm.removeYes")))) return;
  stopAnimation();
  for (const key of Object.keys(game.relations)) {
    if (key.split("|").includes(cat.id)) delete game.relations[key];
  }
  game.cats.splice(game.current, 1);
  game.current = Math.max(0, game.current - 1);
  cat = game.cats[game.current];
  saveState();
  render();
}

// A cat needs you when a stat is low (same limits as the moods) or it should see the vet.
const needsAttention = (c) =>
  c.lives > 0 &&
  (c.hunger >= 80 || c.happiness <= 20 || c.energy <= 20 || c.cleanliness <= 20 || needsVet(c));

// The lines under the name: family first (❤️ Mother: Mimi), then friends, couples and rivals.
function relationLines(c) {
  const lines = [];
  for (const other of game.cats) {
    if (other === c) continue;
    const family = familyOf(c, other);
    if (family) lines.push("❤️ " + t("family." + family, { name: other.name, gender: other.gender }));
  }
  for (const other of game.cats) {
    const relation = other === c ? null : relationOf(c, other);
    // Family are friends from the start; the ❤️ already says that, so plain "friends" is left out.
    if (relation === "friends" && familyOf(c, other)) continue;
    if (relation) lines.push(RELATIONS[relation].sign + " " + t("rel." + relation + ".with", { name: other.name }));
  }
  return lines;
}

// The row of little cat faces at the top of the card, plus a + to adopt another cat.
function renderSwitcher() {
  const row = $("cat-switcher");
  row.replaceChildren();

  // The little tree on the left opens the family tree.
  const tree = document.createElement("button");
  tree.type = "button";
  tree.className = "cat-face family-button";
  tree.title = t("family.button");
  tree.setAttribute("aria-label", t("family.button"));
  const treeIcon = document.createElement("img");
  treeIcon.alt = "";
  treeIcon.src = drawTreeIcon();
  tree.append(treeIcon);
  tree.addEventListener("click", openFamilyTree);
  row.append(tree);

  game.cats.forEach((c, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "cat-face" + (index === game.current ? " selected" : "");
    button.setAttribute("aria-label", c.name);
    button.setAttribute("aria-pressed", index === game.current);
    button.title = c.name;
    const face = document.createElement("img");
    face.alt = "";
    face.src = drawCat(c.lives > 0 ? "face" : "gameOver", c.color, c.coat, c.eyes, {
      hat: Date.now() < c.partyUntil && c.lives > 0,
      grey: c.age >= OLD_AGE,
    });
    button.append(face);
    const relation = c === cat ? null : relationOf(cat, c);
    const family = c === cat ? null : familyOf(cat, c);
    if (family || relation) {
      const badge = document.createElement("span");
      badge.className = "relation-badge";
      badge.textContent = family ? "❤️" : RELATIONS[relation].sign;
      button.append(badge);
      button.title = c.name + " – " + (family ? t("relations.family") : t("rel." + relation));
    }
    // A red ! on the other cats that are low on something (or need the vet).
    if (c !== cat && needsAttention(c)) {
      const alert = document.createElement("span");
      alert.className = "attention-badge";
      alert.textContent = "!";
      button.append(alert);
      button.title += " – " + t("switcher.needs", { name: c.name });
      button.setAttribute("aria-label", c.name + " – " + t("switcher.needs", { name: c.name }));
    }
    button.addEventListener("click", () => (index === game.current ? askDelete() : switchCat(index)));
    row.append(button);
  });
  if (game.cats.length < MAX_CATS) {
    const adopt = document.createElement("button");
    adopt.type = "button";
    adopt.className = "cat-face adopt";
    adopt.textContent = "+";
    adopt.title = t("switcher.adopt");
    adopt.setAttribute("aria-label", t("switcher.adopt"));
    adopt.addEventListener("click", adoptCat);
    row.append(adopt);
  }
}

// ---------- Family tree ----------

// Generation 0 for cats without (known) parents, 1 for their kittens, and so on.
function generationOf(c, seen = new Set()) {
  if (!Array.isArray(c.parents) || seen.has(c)) return 0;
  seen.add(c);
  const parents = c.parents.map((id) => game.cats.find((p) => p.id === id)).filter(Boolean);
  return parents.length ? 1 + Math.max(...parents.map((p) => generationOf(p, seen))) : 1;
}

function openFamilyTree() {
  if (laser) return;
  renderFamilyTree();
  $("family-dialog").showModal();
}

// Rows of cats by generation; couples side by side with a 💕, kittens say whose child they are.
function renderFamilyTree() {
  const box = $("family-tree");
  box.replaceChildren();

  const rows = [];
  for (const c of game.cats) {
    const generation = generationOf(c);
    (rows[generation] = rows[generation] || []).push(c);
  }

  rows.filter(Boolean).forEach((row, rowIndex) => {
    if (rowIndex > 0) {
      const trunk = document.createElement("div");
      trunk.className = "family-trunk";
      box.append(trunk);
    }
    // Put partners next to each other.
    const ordered = [];
    for (const c of row) {
      if (ordered.includes(c)) continue;
      ordered.push(c);
      const partner = row.find((other) => other !== c && !ordered.includes(other) && relationOf(c, other) === "couple");
      if (partner) ordered.push(partner);
    }

    const line = document.createElement("div");
    line.className = "family-row";
    ordered.forEach((c, i) => {
      if (i > 0 && relationOf(ordered[i - 1], c) === "couple") {
        const heart = document.createElement("span");
        heart.className = "family-heart";
        heart.textContent = "💕";
        heart.title = t("rel.couple");
        line.append(heart);
      }
      line.append(familyCard(c));
    });
    box.append(line);
  });

  if (!game.cats.some((c) => Array.isArray(c.parents))) {
    const empty = document.createElement("p");
    empty.className = "family-empty";
    empty.textContent = shortTexts ? shorten(t("family.empty")) : t("family.empty");
    box.append(empty);
  }
}

function familyCard(c) {
  const card = document.createElement("button");
  card.type = "button";
  card.className = "family-card" + (c === cat ? " selected" : "");
  const face = document.createElement("img");
  face.alt = "";
  face.src = drawCat(c.lives > 0 ? "face" : "gameOver", c.color, c.coat, c.eyes, { grey: c.age >= OLD_AGE });
  const name = document.createElement("strong");
  name.textContent = c.name;
  const age = document.createElement("small");
  age.textContent = t("age", { age: c.age });
  card.append(face, name, age);
  if (Array.isArray(c.parents)) {
    const parentName = (id, i) => (game.cats.find((p) => p.id === id) || {}).name || (c.parentNames || [])[i] || "?";
    const parents = document.createElement("small");
    parents.textContent = t("family.childOf", {
      a: parentName(c.parents[0], 0),
      b: parentName(c.parents[1], 1),
      gender: c.gender,
    });
    card.append(parents);
  }
  card.addEventListener("click", () => {
    $("family-dialog").close();
    switchCat(game.cats.indexOf(c));
  });
  return card;
}

// Play together: the friend appears next to the cat for a few seconds.
let friendTimer = null;
function showFriend(friend) {
  const image = $("friend-image");
  image.src = drawCat("chase", friend.color, friend.coat, friend.eyes, {
    hat: Date.now() < friend.partyUntil,
    messy: friend.cleanliness <= MESSY_AT,
    grey: friend.age >= OLD_AGE,
  });
  image.classList.toggle("kitten", friend.age <= KITTEN_AGE);
  image.alt = friend.name;
  image.hidden = false;
  $("cat-pictures").classList.add("together");
  clearTimeout(friendTimer);
  friendTimer = setTimeout(hideFriend, 3000);
}

function hideFriend() {
  clearTimeout(friendTimer);
  $("friend-image").hidden = true;
  $("cat-pictures").classList.remove("together");
}

// ---------- Drawing the page ----------

// Mood ids (used by chooseImage) and their translation keys.
const MOOD_KEYS = {
  "Very hungry": "mood.veryHungry",
  Sad: "mood.sad",
  "Very happy": "mood.veryHappy",
  Sleepy: "mood.sleepy",
  Messy: "mood.messy",
  Jealous: "mood.jealous",
  Neutral: "mood.neutral",
};

function getMoods() {
  const moods = [];
  if (cat.hunger >= 80) moods.push(["Very hungry", "🍴️"]);
  if (cat.happiness <= 20) moods.push(["Sad", "💙️"]);
  if (cat.happiness >= 80) moods.push(["Very happy", "❤️"]);
  if (cat.energy <= 20) moods.push(["Sleepy", "💤️"]);
  if (cat.cleanliness <= MESSY_AT) moods.push(["Messy", "🛁"]);
  if (isJealous(cat)) moods.push(["Jealous", "😾"]);
  // Neutral only when nothing else is going on. (Birthday and health have their own lines.)
  if (moods.length === 0) moods.push(["Neutral", "☁️"]);
  return moods;
}

function chooseImage(moodNames) {
  if (cat.activity === "scratching") return "scratch";
  if (cat.activity === "angry") return "angry";
  if (cat.activity === "playing") return "playing";
  if (cat.activity === "chasing") return "chase"; // laser dot game: playing pose without the ball
  if (cat.activity === "sleeping") return "sleepy";
  if (cat.sick) return "sick";
  if (cat.lives < 3 || moodNames.includes("Sad")) return "sad";
  if (moodNames.includes("Sleepy")) return "sleepy";
  return "neutral";
}

const $ = (id) => document.getElementById(id);

// Fills in every text on the page marked with data-i18n (and its labels) in the chosen language.
function applyTexts() {
  const params = { name: cat.name, gender: cat.gender, age: cat.age };
  document.documentElement.lang = language;
  document.title = t("page.title");
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const text = t(el.dataset.i18n, params);
    // Short texts: the explanations in How to play keep only their first sentence.
    el.textContent = shortTexts && el.matches(".info dd, .info > p") ? shortenHelp(text) : text;
  });
  document.querySelectorAll("[data-i18n-label]").forEach((el) => el.setAttribute("aria-label", t(el.dataset.i18nLabel, params)));
  document.querySelectorAll("[data-i18n-title]").forEach((el) => (el.title = t(el.dataset.i18nTitle, params)));
  document.querySelectorAll("[data-i18n-alt]").forEach((el) => (el.alt = t(el.dataset.i18nAlt, params)));
}

function render() {
  applyTexts();
  const gameOver = cat.lives <= 0;
  $("playing-view").hidden = gameOver;
  $("game-over-view").hidden = !gameOver;

  $("cat-name").textContent = cat.name;

  const moods = getMoods();
  const moodNames = moods.map((m) => m[0]);
  $("mood").textContent = moods.map(([id, emoji]) => emoji + " " + t(MOOD_KEYS[id])).join(", ");
  $("birthday-line").hidden = !isPartyTime();
  const health = [];
  if (cat.sick) health.push(t("health.sick"));
  if (inPain(cat)) health.push(t("health.stiff"));
  $("health").textContent = health.join(" · ");
  $("health").hidden = health.length === 0;

  for (const stat of ["hunger", "happiness", "energy", "cleanliness"]) {
    $(stat + "-value").textContent = cat[stat];
    $(stat + "-bar").style.width = cat[stat] + "%";
  }

  $("message").textContent = messageText(cat.message);
  renderHistory();
  renderSwitcher();
  $("together-button").hidden = !playFriend();
  $("vet-button").hidden = !needsVet(cat);
  $("lives-value").textContent = cat.lives;
  $("hearts").textContent = "❤️".repeat(cat.lives) + "💔️".repeat(3 - cat.lives);
  const sprite = chooseImage(moodNames);
  const look = {
    hat: isPartyTime(),
    messy: cat.cleanliness <= MESSY_AT,
    look: lookDirection,
    grey: cat.age >= OLD_AGE,
  };
  $("cat-image").classList.toggle("kitten", cat.age <= KITTEN_AGE);
  // The cat's relationships sit behind a small "💕 Relationships (3)" button under the age.
  const lines = relationLines(cat);
  const list = $("relations");
  list.replaceChildren(...lines.map((line) => Object.assign(document.createElement("li"), { textContent: line })));
  const toggle = $("relations-toggle");
  toggle.hidden = lines.length === 0;
  if (lines.length === 0) list.hidden = true;
  toggle.textContent = "💕 " + t("settings.relationships") + " (" + lines.length + ") " + (list.hidden ? "▾" : "▴");
  toggle.setAttribute("aria-expanded", String(!list.hidden));
  $("cat-icon").src = drawCat(cat.lives > 0 ? "face" : "gameOver", cat.color, cat.coat, cat.eyes, {
    grey: cat.age >= OLD_AGE,
  });
  $("relations-button").hidden = game.cats.length < 2;
  const draw = (extra) => drawCat(sprite, cat.color, cat.coat, cat.eyes, { ...look, ...extra });
  catFrames = { normal: draw(), blink: draw({ blink: true }), tail: draw({ tail: true }) };
  catLook = look;
  if (!animation) $("cat-image").src = catFrames.normal;
  $("game-over-image").src = drawCat("gameOver", cat.color, cat.coat, cat.eyes, { grey: cat.age >= OLD_AGE });
}

// The 🕘 list: the cat's earlier messages, newest first (the current one is already shown).
function renderHistory() {
  const list = $("history");
  list.replaceChildren();
  const earlier = (cat.history || []).filter(
    (entry, i) => !(i === 0 && sameMessage(entry.message ?? entry.text, cat.message))
  );
  if (earlier.length === 0) {
    const empty = document.createElement("li");
    empty.textContent = t("history.empty");
    list.append(empty);
  }
  for (const entry of earlier) {
    const item = document.createElement("li");
    const time = document.createElement("time");
    const when = new Date(entry.time);
    time.dateTime = when.toISOString();
    time.textContent = when.toLocaleTimeString(language, { hour: "2-digit", minute: "2-digit" });
    item.append(time, messageText(entry.message ?? entry.text));
    list.append(item);
  }
}

// ---------- Age and relationships ----------

const KITTEN_AGE = 1; // kittens (age 0–1) are drawn smaller
const OLD_AGE = 18; // old cats (age 18+) get grey hairs
const ADULT_AGE = 2; // only grown-up cats can be a couple
const KITTEN_CHANCE = 0.15; // chance a couple has a kitten when they play together
const KITTEN_GAP_MS = 7 * 24 * 60 * 60 * 1000; // at most one kitten a week per couple

// sign: shown on faces and under the name; joy: extra happiness when playing together.
const RELATIONS = {
  friends: { label: "Friends", sign: "🤝", joy: 5, with: "Friends with", now: "friends" },
  best: { label: "Best friends", sign: "💛", joy: 8, with: "Best friends with", now: "best friends" },
  couple: { label: "Couple", sign: "💕", joy: 12, with: "In a couple with", now: "a couple" },
  rivals: { label: "Rivals", sign: "⚡", joy: -10, with: "Rivals with", now: "rivals" },
};

// Each pair of cats has a bond from -100 (rivals) to 100 (couple), and maybe a relationship you chose.
const pairKey = (a, b) => [a.id, b.id].sort().join("|");
function bondOf(a, b) {
  const key = pairKey(a, b);
  if (!game.relations[key]) game.relations[key] = { bond: 0, chosen: null, lastKitten: 0 };
  return game.relations[key];
}

function relationOf(a, b) {
  const pair = game.relations[pairKey(a, b)];
  if (!pair) return null;
  if (pair.chosen && RELATIONS[pair.chosen]) return pair.chosen;
  if (pair.bond <= -30) return "rivals";
  if (pair.bond >= 90 && canBecomeCouple(a, b, pair.bond)) return "couple";
  if (pair.bond >= 60) return "best";
  if (pair.bond >= 30) return "friends";
  return null;
}

// Grown-ups only, and a cat's couple is its strongest bond (unless you chose someone else for it).
// Family: "parent" when other is a parent of c, "child" when other is c's kitten,
// "sibling" when they share a parent. Family is shown with a red ❤️ and can't be a couple.
function familyOf(c, other) {
  const parentsOf = (x) => (Array.isArray(x.parents) ? x.parents : []);
  if (parentsOf(c).includes(other.id)) return "parent";
  if (parentsOf(other).includes(c.id)) return "child";
  if (c !== other && parentsOf(c).some((id) => parentsOf(other).includes(id))) return "sibling";
  return null;
}

function canBecomeCouple(a, b, bond) {
  if (a.age < ADULT_AGE || b.age < ADULT_AGE) return false;
  if (familyOf(a, b)) return false;
  for (const c of [a, b]) {
    for (const other of game.cats) {
      if (other === a || other === b) continue;
      const pair = game.relations[pairKey(c, other)];
      if (!pair) continue;
      if (pair.chosen === "couple") return false;
      if (!pair.chosen && pair.bond > bond && other.age >= ADULT_AGE) return false;
    }
  }
  return true;
}

// A couple playing together may have a kitten that looks a bit like both parents.
function maybeKitten(a, b, pair) {
  if (game.cats.length >= MAX_CATS || a.lives <= 0 || b.lives <= 0) return false;
  if (Date.now() - (pair.lastKitten || 0) < KITTEN_GAP_MS || Math.random() >= KITTEN_CHANCE) return false;
  const pick = (options) => options[Math.floor(Math.random() * options.length)];
  const kitten = newCat(t("name.kitten"));
  kitten.color = pick([a.color, b.color]);
  kitten.coat = pick([a.coat, b.coat]);
  kitten.eyes = pick([a.eyes, b.eyes]);
  kitten.personality = pick([a.personality, b.personality]);
  kitten.parents = [a.id, b.id]; // for the family tree
  kitten.parentNames = [a.name, b.name]; // in case a parent is removed later
  say("msg.kittenBorn", { a: a.name, b: b.name }, kitten);
  game.cats.push(kitten);
  pair.lastKitten = Date.now();
  bondOf(a, kitten).bond = 40; // family starts out as friends
  bondOf(b, kitten).bond = 40;
  return true;
}

// ---------- Animations ----------

// The cat blinks now and then and swishes its tail every few seconds.
// (Breathing is a CSS animation in style.css.)
let catFrames = {};
let catLook = {};
const showFrame = (name) => {
  if (!animation) $("cat-image").src = catFrames[name];
};
const randomBetween = (min, max) => min + Math.random() * (max - min);

// Petting and belly rubs play a short animation, then the cat goes back to normal.
let nextAnimation = null; // set by an action, played after the page is drawn
let animation = null; // the animation playing right now

// Each animation is a list of pictures shown one after another: [sprite, extra drawing options, milliseconds].
const repeat = (steps, times) => Array.from({ length: times }, () => steps).flat();

const ANIMATIONS = {
  // happy ^ ^ eyes and a fast tail swish
  pet: {
    still: ["neutral", { happy: true }],
    steps: repeat([["neutral", { happy: true, tail: true }, 200], ["neutral", { happy: true }, 200]], 5),
  },
  // into the carrier to the vet, and back out cured
  vet: {
    still: ["carrier", {}],
    steps: [
      ["carrier", {}, 1800],
      ["neutral", {}, 400],
    ],
  },
  // Achoo!
  sneeze: {
    still: ["sick", {}],
    steps: [["sneeze", {}, 500]],
  },
  // lies down, rolls onto its back, then rolls back and sits up
  belly: {
    still: ["belly", {}],
    steps: [
      ["sleepy", {}, 300],
      ["belly", {}, 2400],
      ["sleepy", {}, 300],
      ["neutral", {}, 250],
    ],
  },
};

function playAnimation(name) {
  stopAnimation();
  const { still, steps } = ANIMATIONS[name];
  const draw = ([sprite, extra]) => drawCat(sprite, cat.color, cat.coat, cat.eyes, { ...catLook, ...extra });
  const image = $("cat-image");
  const length = steps.reduce((sum, step) => sum + step[2], 0);
  animation = { timers: [] };

  if (motionReduced()) {
    // With reduced motion the main picture stays still for the same time.
    image.src = draw(still);
  } else {
    let at = 0;
    for (const step of steps) {
      const url = draw(step);
      animation.timers.push(setTimeout(() => (image.src = url), at));
      at += step[2];
    }
  }
  animation.timers.push(setTimeout(stopAnimation, length));
}

function stopAnimation() {
  hideFriend();
  if (!animation) return;
  animation.timers.forEach(clearTimeout);
  animation = null;
  $("cat-image").src = catFrames.normal;
}

function blinkLoop() {
  setTimeout(() => {
    if (!motionReduced()) {
      showFrame("blink");
      setTimeout(() => showFrame("normal"), 160);
    }
    blinkLoop();
  }, randomBetween(2500, 6000));
}

function tailLoop() {
  setTimeout(() => {
    if (!motionReduced()) {
      [0, 300, 600, 900].forEach((delay, i) =>
        setTimeout(() => showFrame(i % 2 === 0 ? "tail" : "normal"), delay)
      );
    }
    tailLoop();
  }, randomBetween(4000, 8000));
}

// A sick cat sneezes now and then.
function sneezeLoop() {
  setTimeout(() => {
    if (cat.sick && !animation && !laser && chooseImage(getMoods().map((m) => m[0])) === "sick") {
      playAnimation("sneeze");
    }
    sneezeLoop();
  }, randomBetween(6000, 14000));
}

// The loops keep running; each step checks motionReduced(), so the setting works right away.
sneezeLoop();
blinkLoop();
tailLoop();

// ---------- Flying visitors ----------

// Now and then a butterfly, bird or bee flies across the card and the cat follows it with its eyes.
let lookDirection = null; // "left" or "right" while the cat watches a visitor
let visitorFlying = false; // only one visitor at a time, so the cat knows where to look

const VISITOR_FLIGHT = {
  butterfly: { speed: 70, wave: 18, waveSpeed: 3 }, // slow and fluttery
  bird: { speed: 150, wave: 5, waveSpeed: 2 }, // fast and smooth
  bee: { speed: 90, wave: 7, waveSpeed: 9 }, // buzzy zigzag
};

function setLook(side) {
  if (side === lookDirection) return;
  lookDirection = side;
  render();
}

function flyVisitor() {
  if (visitorFlying || laser || cat.lives <= 0 || document.hidden || motionReduced()) return;
  visitorFlying = true;
  const card = document.querySelector(".game");
  let sky = card.querySelector(".sky");
  if (!sky) {
    sky = document.createElement("div");
    sky.className = "sky"; // keeps visitors inside the card
    card.append(sky);
  }
  const names = Object.keys(CRITTERS);
  const name = names[Math.floor(Math.random() * names.length)];
  const { speed, wave, waveSpeed } = VISITOR_FLIGHT[name];
  const frames = [drawCritter(name, 0), drawCritter(name, 1)];

  const cardBox = card.getBoundingClientRect();
  const catBox = $("cat-image").getBoundingClientRect();
  const catMiddle = catBox.left - cardBox.left + catBox.width / 2;
  const height = catBox.top - cardBox.top + Math.random() * catBox.height * 0.5;
  const fromLeft = Math.random() < 0.5;
  const startX = fromLeft ? -70 : cardBox.width + 10;
  const endX = fromLeft ? cardBox.width + 10 : -70;
  const duration = (Math.abs(endX - startX) / speed) * 1000;

  const visitor = document.createElement("img");
  visitor.className = "visitor";
  visitor.alt = "";
  visitor.src = frames[0];
  if (!fromLeft) visitor.style.scale = "-1 1"; // the pictures face right
  sky.append(visitor);

  const start = performance.now();
  let shown = 0;
  function step(now) {
    const seconds = (now - start) / 1000;
    const progress = (now - start) / duration;
    if (progress >= 1) {
      visitor.remove();
      visitorFlying = false;
      setLook(null);
      return;
    }
    const x = startX + (endX - startX) * progress;
    visitor.style.left = x + "px";
    visitor.style.top = height + Math.sin(seconds * waveSpeed) * wave + "px";
    const frame = Math.floor(seconds / 0.15) % 2; // flap the wings
    if (frame !== shown) visitor.src = frames[(shown = frame)];
    setLook(x + visitor.width / 2 < catMiddle ? "left" : "right");
    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function visitorLoop(first) {
  setTimeout(() => {
    flyVisitor();
    visitorLoop(false);
  }, first ? randomBetween(8000, 20000) : randomBetween(20000, 60000));
}

visitorLoop(true);

// ---------- Laser dot game ----------

// A red dot zips around the card; click or tap it to catch it. The cat watches it with its eyes.
let laser = null; // the round being played right now
let lastLaserCatches = 0; // catches in the round that just ended, for actions.laserDone

function startLaserGame() {
  if (laser || cat.lives <= 0) return;
  if (cat.sick) {
    tooSick();
    render();
    return;
  }
  stopAnimation();
  const card = document.querySelector(".game");
  const area = document.createElement("div");
  area.className = "laser-area";
  area.innerHTML =
    '<p class="laser-score"></p>' +
    '<button type="button" class="laser-stop"></button>' +
    '<button type="button" class="laser-dot"></button>';
  area.querySelector(".laser-stop").textContent = t("laser.stop");
  area.querySelector(".laser-dot").setAttribute("aria-label", t("laser.dot"));
  card.append(area);

  const seconds = traits().laserSeconds;
  laser = { area, dot: area.querySelector(".laser-dot"), caught: 0, start: Date.now(), seconds, moveTimer: null };
  cat.activity = "chasing";
  say("msg.laserStart");
  render();

  laser.dot.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    catchDot();
  });
  area.querySelector(".laser-stop").addEventListener("click", endLaserGame);
  laser.clock = setInterval(updateLaserScore, 200);
  updateLaserScore();
  moveDot();
}

function updateLaserScore() {
  const left = Math.max(0, laser.seconds - (Date.now() - laser.start) / 1000);
  laser.area.querySelector(".laser-score").textContent = t("laser.score", { caught: laser.caught, seconds: Math.ceil(left) });
  if (left <= 0) endLaserGame();
}

// Jump to a new random spot; the jumps get quicker as the round goes on.
function moveDot() {
  clearTimeout(laser.moveTimer);
  const box = laser.area.getBoundingClientRect();
  const x = 30 + Math.random() * (box.width - 60);
  const y = 60 + Math.random() * (box.height - 90);
  laser.dot.style.left = x + "px";
  laser.dot.style.top = y + "px";

  const catBox = $("cat-image").getBoundingClientRect();
  setLook(x < catBox.left - box.left + catBox.width / 2 ? "left" : "right");

  const progress = (Date.now() - laser.start) / (laser.seconds * 1000);
  laser.moveTimer = setTimeout(moveDot, 1100 - 500 * Math.min(1, progress));
}

function catchDot() {
  laser.caught += 1;
  const plus = document.createElement("span");
  plus.className = "laser-plus";
  plus.textContent = "+1";
  plus.style.left = laser.dot.style.left;
  plus.style.top = laser.dot.style.top;
  laser.area.append(plus);
  setTimeout(() => plus.remove(), 700);
  updateLaserScore(); // may end the round if time is up
  if (laser) moveDot();
}

function endLaserGame() {
  if (!laser) return;
  clearTimeout(laser.moveTimer);
  clearInterval(laser.clock);
  laser.area.remove();
  lastLaserCatches = laser.caught;
  laser = null;
  lookDirection = null;
  doAction("laserDone");
}

// ---------- Wiring up buttons and the settings form ----------

$("laser-button").addEventListener("click", startLaserGame);

document.querySelectorAll("[data-action]").forEach((button) => {
  button.addEventListener("click", () => doAction(button.dataset.action));
});

const nameInput = $("name-input");
const ageInput = $("age-input");
const genderInput = $("gender-input");

// Fill the Color, Coat, Eye color (Looks) and Personality (Settings) dropdowns from their lists.
const colorInput = $("color-input");
const coatInput = $("coat-input");
const eyesInput = $("eyes-input");
const personalityInput = $("personality-input");
const flashInput = $("flash-input");
const illnessInput = $("illness-input");
const textSizeInput = $("text-size-input");
const contrastInput = $("contrast-input");
const motionInput = $("motion-input");
const soundInput = $("sound-input");
const dropdowns = [
  [$("new-color"), CAT_COLORS],
  [$("new-coat"), CAT_COATS],
  [$("new-eyes"), CAT_EYES],
  [$("new-personality"), PERSONALITIES],
  [colorInput, CAT_COLORS],
  [coatInput, CAT_COATS],
  [eyesInput, CAT_EYES],
  [personalityInput, PERSONALITIES],
];
const DROPDOWN_KEYS = [
  [$("new-color"), "color."],
  [$("new-coat"), "coat."],
  [$("new-eyes"), "eyes."],
  [$("new-personality"), "personality."],
  [colorInput, "color."],
  [coatInput, "coat."],
  [eyesInput, "eyes."],
  [personalityInput, "personality."],
];
for (const [select, options] of dropdowns) {
  for (const value of Object.keys(options)) select.add(new Option(value, value));
}
const languageInput = $("language-input");
for (const [code, name] of Object.entries(LANGUAGES)) languageInput.add(new Option(name, code));

// Option names in the chosen language (the language list always shows each language in itself).
function labelDropdowns() {
  for (const [select, prefix] of DROPDOWN_KEYS) {
    for (const option of select.options) option.text = t(prefix + option.value);
  }
}
labelDropdowns();

// Show the cat's current settings in the form.
// The colored cat head: name, age, gender and personality of the cat you're looking at.
function openCatInfo() {
  if (laser) return;
  nameInput.value = cat.name;
  ageInput.value = cat.age;
  genderInput.value = cat.gender in PRONOUNS ? cat.gender : "none";
  personalityInput.value = cat.personality in PERSONALITIES ? cat.personality : "default";
  $("catinfo-error").textContent = "";
  $("catinfo-dialog").showModal();
}

// 💕 Relationships: the family, and a dropdown per other cat.
function openRelations() {
  if (laser || game.cats.length < 2) return;
  const family = $("family-list");
  family.replaceChildren();
  for (const other of game.cats) {
    const kind = other === cat ? null : familyOf(cat, other);
    if (!kind) continue;
    const item = document.createElement("li");
    item.textContent = "❤️ " + t("family." + kind, { name: other.name, gender: other.gender });
    family.append(item);
  }
  $("family-heading").hidden = family.children.length === 0;
  fillRelationSettings();
  $("relations-error").textContent = "";
  $("relations-dialog").showModal();
}

// ⚙️ Game settings for all cats.
function fillSettingsForm() {
  flashInput.checked = game.flash !== false;
  illnessInput.checked = game.illness !== false;
  textSizeInput.value = game.textSize;
  $("font-input").value = game.font;
  $("short-input").checked = game.shortTexts;
  languageInput.value = language;
  contrastInput.value = game.contrast;
  motionInput.checked = game.reduceMotion;
  soundInput.checked = game.sound;
}

// One dropdown per other cat: let the relationship grow by itself, or choose it.
function fillRelationSettings() {
  const box = $("relation-settings");
  box.replaceChildren();
  const others = game.cats.filter((c) => c !== cat);
  for (const other of others) {
    const row = document.createElement("div");
    row.className = "setting";
    const label = document.createElement("label");
    label.htmlFor = "relation-" + other.id;
    label.textContent = t("rel.with", { name: other.name });
    const select = document.createElement("select");
    select.id = "relation-" + other.id;
    select.dataset.catId = other.id;
    select.add(new Option(t("rel.auto"), "auto"));
    for (const value of Object.keys(RELATIONS)) select.add(new Option(t("rel." + value), value));
    const pair = game.relations[pairKey(cat, other)];
    select.value = (pair && pair.chosen) || "auto";
    row.append(label, select);
    box.append(row);
  }
}

// Reads the relationship dropdowns. Returns an error message, or "" when everything is fine.
function saveRelationSettings(newAge) {
  const choices = [...$("relation-settings").querySelectorAll("select")].map((select) => ({
    other: game.cats.find((c) => c.id === select.dataset.catId),
    chosen: select.value === "auto" ? null : select.value,
  }));
  const couples = choices.filter((choice) => choice.chosen === "couple");
  if (couples.length > 1) return t("err.twoCouples");
  if (couples.length === 1 && (newAge < ADULT_AGE || couples[0].other.age < ADULT_AGE)) {
    return t("err.kittenCouple", { age: ADULT_AGE });
  }
  if (couples.length === 1 && familyOf(cat, couples[0].other)) return t("err.familyCouple");
  for (const { other, chosen } of choices) {
    if (chosen === "couple") {
      // Both cats leave any other couple they were chosen into.
      for (const [key, pair] of Object.entries(game.relations)) {
        const ids = key.split("|");
        if (pair.chosen === "couple" && (ids.includes(cat.id) || ids.includes(other.id))) pair.chosen = null;
      }
    }
    bondOf(cat, other).chosen = chosen;
  }
  return "";
}

// The gear opens the settings pop-up; closing it without saving throws away changes.
const settingsDialog = $("settings-dialog");
const settingsError = $("settings-error");
function openSettings() {
  fillSettingsForm();
  settingsError.textContent = "";
  settingsDialog.showModal();
}
$("settings-button").addEventListener("click", openSettings);
$("newcat-form").addEventListener("submit", makeNewCat);
["new-color", "new-coat", "new-eyes", "new-age"].forEach((id) => $(id).addEventListener("input", updateNewCatPreview));
$("together-button").addEventListener("click", () => doAction("playTogether"));
// Every pop-up's ✕ closes it.
document.querySelectorAll(".dialog-close").forEach((button) => {
  button.addEventListener("click", () => button.closest("dialog").close());
});

// ℹ️ How to play
$("info-button").addEventListener("click", () => $("info-dialog").showModal());
$("info-tree-icon").src = drawTreeIcon();
$("info-cat-icon").src = drawCat("face", "orange", "solid", "black");

// ↺ Reset this cat, after "Are you sure?"
$("reset-button").addEventListener("click", async () => {
  if (laser) return;
  const sure = await askSure(t("confirm.reset", { name: cat.name }), t("confirm.resetYes"));
  if (sure) doAction("reset");
});

// A small "Are you sure?" pop-up. Resolves to true when the player chooses Yes.
function askSure(text, yesLabel) {
  const dialog = $("confirm-dialog");
  $("confirm-text").textContent = text;
  $("confirm-yes").textContent = yesLabel;
  dialog.returnValue = "";
  dialog.showModal();
  return new Promise((resolve) => {
    dialog.addEventListener("close", () => resolve(dialog.returnValue === "yes"), { once: true });
  });
}

// Looks: color, coat and eyes, with a live preview.
const looksDialog = $("looks-dialog");
$("looks-icon").src = drawCat("face", "black", "tortoiseshell", "green", { split: true });

function updateLooksPreview() {
  $("looks-preview").src = drawCat("neutral", colorInput.value, coatInput.value, eyesInput.value, {
    grey: cat.age >= OLD_AGE,
  });
}
$("looks-button").addEventListener("click", () => {
  if (laser) return;
  colorInput.value = cat.color in CAT_COLORS ? cat.color : "orange";
  coatInput.value = cat.coat in CAT_COATS ? cat.coat : "solid";
  eyesInput.value = cat.eyes in CAT_EYES ? cat.eyes : "black";
  updateLooksPreview();
  looksDialog.showModal();
});
[colorInput, coatInput, eyesInput].forEach((select) => select.addEventListener("change", updateLooksPreview));
$("looks-form").addEventListener("submit", (event) => {
  event.preventDefault();
  cat.color = colorInput.value in CAT_COLORS ? colorInput.value : "orange";
  cat.coat = coatInput.value in CAT_COATS ? coatInput.value : "solid";
  cat.eyes = eyesInput.value in CAT_EYES ? eyesInput.value : "black";
  say("msg.looksSaved");
  saveState();
  render();
  looksDialog.close();
});

// 💕 Relationships list under the age
$("relations-toggle").addEventListener("click", () => {
  $("relations").hidden = !$("relations").hidden;
  render();
});

// 🕘 Earlier messages
$("history-button").addEventListener("click", () => {
  const list = $("history");
  list.hidden = !list.hidden;
  $("history-button").setAttribute("aria-expanded", String(!list.hidden));
});

$("cat-button").addEventListener("click", openCatInfo);
$("relations-button").addEventListener("click", openRelations);

$("catinfo-form").addEventListener("submit", (event) => {
  event.preventDefault(); // stay on the page instead of reloading it
  const newName = nameInput.value.trim();
  const newAge = Number(ageInput.value);
  if (newName === "" || !Number.isInteger(newAge) || newAge < 0 || newAge > 30) {
    $("catinfo-error").textContent = t("err.nameAge");
    return;
  }
  cat.name = newName;
  cat.age = newAge;
  cat.gender = genderInput.value in PRONOUNS ? genderInput.value : "none";
  cat.personality = personalityInput.value in PERSONALITIES ? personalityInput.value : "default";
  say("msg.settingsSaved");
  saveState();
  render();
  $("catinfo-dialog").close();
});

$("relations-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const relationError = saveRelationSettings(cat.age);
  if (relationError) {
    $("relations-error").textContent = relationError;
    return;
  }
  say("msg.settingsSaved");
  saveState();
  render();
  $("relations-dialog").close();
});

$("settings-form").addEventListener("submit", (event) => {
  event.preventDefault(); // stay on the page instead of reloading it
  game.flash = flashInput.checked;
  game.illness = illnessInput.checked;
  if (!game.illness) game.cats.forEach((c) => (c.sick = false)); // switching illness off cures colds
  game.textSize = TEXT_SIZES.includes(textSizeInput.value) ? textSizeInput.value : "normal";
  game.font = FONTS.includes($("font-input").value) ? $("font-input").value : "pixel";
  game.shortTexts = $("short-input").checked;
  shortTexts = game.shortTexts;
  game.contrast = CONTRASTS.includes(contrastInput.value) ? contrastInput.value : "normal";
  game.reduceMotion = motionInput.checked;
  game.sound = soundInput.checked;
  applyDisplaySettings();
  game.language = LANGUAGES[languageInput.value] ? languageInput.value : "en";
  language = game.language;
  labelDropdowns();
  say("msg.settingsSaved");
  saveState();
  render();
  settingsDialog.close();
});

// ---------- Time passing ----------

// Opening the page counts as time passing.
timePasses();

// Opening the game on the birthday shows the confetti again.
if (isPartyTime() && !confettiShown) showConfetti();

// If the page was closed while the cat was upset, let it calm down.
for (const c of game.cats) {
  if (c.activity === "angry" || c.activity === "scratching") withCat(c, scheduleCalmDown);
}

setInterval(timePasses, TICK_MS);
