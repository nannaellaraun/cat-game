// Cat Game – runs entirely in the browser.
// The PHP version kept the cat in $_SESSION; here it lives in localStorage.

const STORAGE_KEY = "cat-game";
const TICK_MS = 35 * 1000; // the PHP page refreshed itself every 35 seconds

// The cat pictures are drawn by sprites.js in the cat's chosen color and coat.

// Pronouns for each gender choice in Cat Settings.
const PRONOUNS = {
  female: { subject: "she", object: "her", possessive: "her", possessivePronoun: "hers" },
  male: { subject: "he", object: "him", possessive: "his", possessivePronoun: "his" },
  none: { subject: "they", object: "them", possessive: "their", possessivePronoun: "theirs" },
};

const CALM_DOWN_MS = 10 * 1000; // an angry or scratching cat calms down after 10 seconds
const BIRTHDAY_MS = 7 * 24 * 60 * 60 * 1000; // the cat has a birthday every 7 days
const MAX_AGE = 30; // same limit as Cat Settings
const MESSY_AT = 30; // at this cleanliness or lower the cat looks messy

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
};

const PERSONALITIES = {
  default: { label: "Default" },
  neurotic: {
    label: "Neurotic",
    staysInMiddle: true,
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
  },
  bossy: {
    label: "Bossy",
    petsBeforeAngry: 2,
    playJoy: 8,
    bellyScratchChance: 0.75,
    brushScratchChance: 0.25,
    petScratchChance: 0.2,
  },
  agreeable: {
    label: "Agreeable",
    timeHunger: 1,
    timeDirt: 1,
    mess: 0.5,
    bellyScratchChance: 0, // never scratches during belly rubs
  },
};

// The rules for this cat's personality.
const traits = () => ({ ...DEFAULT_TRAITS, ...PERSONALITIES[cat.personality] });

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
    message: name + " is relaxing.",
  };
}

function loadState() {
  const fresh = {
    name: "Cat",
    age: 0,
    gender: "none",
    color: "orange",
    coat: "solid",
    eyes: "black",
    personality: "default",
    flash: true, // red flash when the cat scratches
    lastBirthday: Date.now(), // the next birthday is 7 days after this
    partyUntil: 0, // the party hat is worn until this time (end of the birthday)
    ...startingStats("Cat"),
  };
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved) return fresh;
    const loaded = { ...fresh, ...saved };
    // A number that is missing or broken in the save (e.g. from an older version) gets its starting value.
    for (const [key, value] of Object.entries(fresh)) {
      if (typeof value === "number" && !Number.isFinite(loaded[key])) loaded[key] = value;
    }
    return loaded;
  } catch {
    return fresh;
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cat));
  } catch {
    // Private mode or storage disabled – the game still works, it just won't remember.
  }
}

let cat = loadState();

// ---------- Helpers ----------

// The cat's pronouns, e.g. pronoun().possessive is "her", "his" or "their".
const pronoun = () => PRONOUNS[cat.gender] || PRONOUNS.none;

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
    cat.message = cat.name + " enjoyed " + pronoun().possessive + " food!";
  },
  play() {
    cat.activity = "playing";
    cat.happiness = up(cat.happiness, traits().playJoy);
    cat.energy = down(cat.energy, traits().playTiredness);
    cat.hunger = up(cat.hunger, 5);
    cat.cleanliness = down(cat.cleanliness, Math.round(15 * traits().mess)); // rolling around gets the fur messy
    cat.message = cat.name + " is playing with " + pronoun().possessive + " ball!";
  },
  sleep() {
    cat.activity = "sleeping";
    cat.hunger = up(cat.hunger, 15);
    cat.happiness = up(cat.happiness, 5);
    cat.energy = up(cat.energy, 30);
    cat.message = cat.name + " curled up for " + pronoun().possessive + " nap.";
  },
  pet() {
    if (Math.random() < traits().petScratchChance) return scratch();
    cat.petStreak += 1;
    if (cat.petStreak > traits().petsBeforeAngry) {
      cat.activity = "angry";
      cat.happiness = down(cat.happiness, traits().angryCost);
      cat.message = cat.name + " has had enough petting! Give " + pronoun().object + " a break.";
      // Every pet while angry restarts the countdown.
      cat.angryUntil = Date.now() + CALM_DOWN_MS;
      scheduleCalmDown();
    } else {
      cat.activity = "neutral";
      cat.happiness = up(cat.happiness, 5);
      cat.message = cat.name + " purrs and swishes " + pronoun().possessive + " tail.";
      nextAnimation = "pet";
    }
  },
  bellyRub() {
    if (Math.random() < traits().bellyScratchChance) return scratch();
    cat.activity = "neutral";
    cat.happiness = up(cat.happiness, 10);
    cat.message = cat.name + " rolls over and purrs. Belly rubs are the best!";
    nextAnimation = "belly";
  },
  brush() {
    if (Math.random() < traits().brushScratchChance) return scratch();
    cat.activity = "neutral";
    cat.cleanliness = up(cat.cleanliness, 30);
    cat.happiness = up(cat.happiness, 5);
    cat.message = cat.name + " loves being brushed. Look at " + pronoun().possessive + " shiny fur!";
  },
  meow() {
    cat.activity = "neutral";
    cat.happiness = up(cat.happiness, 5);
    cat.message = cat.name + " says: Meow!";
  },
  reset() {
    Object.assign(cat, startingStats(cat.name));
  },
  timePassed() {
    const t = traits();
    cat.hunger = up(cat.hunger, t.timeHunger);
    cat.happiness = down(cat.happiness, t.timeHappiness);
    cat.energy = down(cat.energy, t.timeEnergy);
    cat.cleanliness = down(cat.cleanliness, t.timeDirt);
    checkBirthday();
  },
};

// ---------- Scratching ----------

// The cat scratches you: claws-out picture, a red flash, and the cat is a bit upset.
function scratch() {
  cat.activity = "scratching";
  cat.happiness = down(cat.happiness, 5);
  cat.message = "Ouch! " + cat.name + " scratched you!";
  cat.angryUntil = Date.now() + CALM_DOWN_MS;
  scheduleCalmDown();
  flashRed();
}

function flashRed() {
  if (!cat.flash) return;
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
  cat.message = "🎂 Happy birthday, " + cat.name + "!";
  if (grewUp) cat.message += " " + cat.name + " turned " + cat.age + "!";
  showConfetti();
}

// Pixel confetti falling over the card for a few seconds.
let confettiShown = false;
function showConfetti() {
  confettiShown = true;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
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
    cat.message = cat.name + " lost a life!";
  }

  if (cat.lives <= 0) {
    cat.message = "GAME OVER! " + cat.name + " ran out of lives.";
  }
}

// After CALM_DOWN_MS without petting, an angry cat is happy to be petted again.
function scheduleCalmDown() {
  setTimeout(() => {
    const upset = cat.activity === "angry" || cat.activity === "scratching";
    if (upset && Date.now() >= cat.angryUntil) {
      cat.message =
        cat.activity === "angry"
          ? cat.name + " has calmed down. You can pet " + pronoun().object + " again."
          : cat.name + " has calmed down.";
      cat.activity = "neutral";
      cat.petStreak = 0;
      saveState();
      render();
    }
  }, Math.max(0, cat.angryUntil - Date.now()));
}

function doAction(name) {
  if (name !== "timePassed") stopAnimation();
  // Doing anything else breaks the petting streak; time passing doesn't.
  if (name !== "pet" && name !== "timePassed") cat.petStreak = 0;
  actions[name]();
  // An extraverted cat enjoys any attention a little extra.
  if (name !== "timePassed" && name !== "reset" && cat.activity !== "scratching") {
    cat.happiness = up(cat.happiness, traits().joyBonus);
  }
  applyRules();
  saveState();
  render();
  if (nextAnimation) playAnimation(nextAnimation);
  nextAnimation = null;
}

// ---------- Drawing the page ----------

function getMoods() {
  const moods = [];
  if (cat.hunger >= 80) moods.push(["Very hungry", "🍴️"]);
  if (cat.happiness <= 20) moods.push(["Sad", "💙️"]);
  if (cat.happiness >= 80) moods.push(["Very happy", "❤️"]);
  if (cat.energy <= 20) moods.push(["Sleepy", "💤️"]);
  if (cat.cleanliness <= MESSY_AT) moods.push(["Messy", "🛁"]);
  if (isPartyTime()) moods.push(["Birthday", "🎂"]);
  if (cat.happiness >= 30 && cat.happiness <= 70) moods.push(["Neutral", "☁️"]);
  return moods;
}

function chooseImage(moodNames) {
  if (cat.activity === "scratching") return "scratch";
  if (cat.activity === "angry") return "angry";
  if (cat.activity === "playing") return "playing";
  if (cat.activity === "sleeping") return "sleepy";
  if (cat.lives < 3 || moodNames.includes("Sad")) return "sad";
  if (moodNames.includes("Sleepy")) return "sleepy";
  return "neutral";
}

const $ = (id) => document.getElementById(id);

function render() {
  const gameOver = cat.lives <= 0;
  $("playing-view").hidden = gameOver;
  $("game-over-view").hidden = !gameOver;

  document.querySelectorAll(".name").forEach((el) => (el.textContent = cat.name));
  $("cat-name").textContent = cat.name;
  $("cat-age").textContent = cat.age;

  const moods = getMoods();
  const moodNames = moods.map((m) => m[0]);
  $("mood").textContent = moodNames.join(", ");
  $("emoji").textContent = moods.map((m) => m[1]).join(", ");

  for (const stat of ["hunger", "happiness", "energy", "cleanliness"]) {
    $(stat + "-value").textContent = cat[stat];
    $(stat + "-bar").style.width = cat[stat] + "%";
  }

  $("message").textContent = cat.message;
  $("lives-value").textContent = cat.lives;
  $("hearts").textContent = "❤️".repeat(cat.lives) + "💔️".repeat(3 - cat.lives);
  const sprite = chooseImage(moodNames);
  const look = { hat: isPartyTime(), messy: cat.cleanliness <= MESSY_AT };
  const draw = (extra) => drawCat(sprite, cat.color, cat.coat, cat.eyes, { ...look, ...extra });
  catFrames = { normal: draw(), blink: draw({ blink: true }), tail: draw({ tail: true }) };
  catLook = look;
  if (!animation) $("cat-image").src = catFrames.normal;
  $("game-over-image").src = drawCat("gameOver", cat.color, cat.coat, cat.eyes);
}

// ---------- Animations ----------

// The cat blinks now and then and swishes its tail every few seconds.
// (Breathing is a CSS animation in style.css.)
let catFrames = {};
let catLook = {};
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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

  if (reducedMotion) {
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
  if (!animation) return;
  animation.timers.forEach(clearTimeout);
  animation = null;
  $("cat-image").src = catFrames.normal;
}

function blinkLoop() {
  setTimeout(() => {
    showFrame("blink");
    setTimeout(() => showFrame("normal"), 160);
    blinkLoop();
  }, randomBetween(2500, 6000));
}

function tailLoop() {
  setTimeout(() => {
    [0, 300, 600, 900].forEach((delay, i) =>
      setTimeout(() => showFrame(i % 2 === 0 ? "tail" : "normal"), delay)
    );
    tailLoop();
  }, randomBetween(4000, 8000));
}

if (!reducedMotion) {
  blinkLoop();
  tailLoop();
}

// ---------- Wiring up buttons and the settings form ----------

document.querySelectorAll("[data-action]").forEach((button) => {
  button.addEventListener("click", () => doAction(button.dataset.action));
});

const nameInput = $("name-input");
const ageInput = $("age-input");
const genderInput = $("gender-input");

// Fill the Color, Coat, Eye color and Personality dropdowns from their lists.
const colorInput = $("color-input");
const coatInput = $("coat-input");
const eyesInput = $("eyes-input");
const personalityInput = $("personality-input");
const flashInput = $("flash-input");
const dropdowns = [
  [colorInput, CAT_COLORS],
  [coatInput, CAT_COATS],
  [eyesInput, CAT_EYES],
  [personalityInput, PERSONALITIES],
];
for (const [select, options] of dropdowns) {
  for (const [value, info] of Object.entries(options)) {
    select.add(new Option(info.label || info, value));
  }
}

// Show the cat's current settings in the form.
function fillSettingsForm() {
  nameInput.value = cat.name;
  ageInput.value = cat.age;
  genderInput.value = cat.gender in PRONOUNS ? cat.gender : "none";
  colorInput.value = cat.color in CAT_COLORS ? cat.color : "orange";
  coatInput.value = cat.coat in CAT_COATS ? cat.coat : "solid";
  eyesInput.value = cat.eyes in CAT_EYES ? cat.eyes : "black";
  personalityInput.value = cat.personality in PERSONALITIES ? cat.personality : "default";
  flashInput.checked = cat.flash !== false;
}

// The gear opens the settings pop-up; closing it without saving throws away changes.
const settingsDialog = $("settings-dialog");
const settingsError = $("settings-error");
$("settings-button").addEventListener("click", () => {
  fillSettingsForm();
  settingsError.textContent = "";
  settingsDialog.showModal();
});
$("settings-close").addEventListener("click", () => settingsDialog.close());

$("settings-form").addEventListener("submit", (event) => {
  event.preventDefault(); // stay on the page instead of reloading it
  const newName = nameInput.value.trim();
  const newAge = Number(ageInput.value);

  if (newName !== "" && Number.isInteger(newAge) && newAge >= 0 && newAge <= 30) {
    cat.name = newName;
    cat.age = newAge;
    cat.gender = genderInput.value in PRONOUNS ? genderInput.value : "none";
    cat.color = colorInput.value in CAT_COLORS ? colorInput.value : "orange";
    cat.coat = coatInput.value in CAT_COATS ? coatInput.value : "solid";
    cat.eyes = eyesInput.value in CAT_EYES ? eyesInput.value : "black";
    cat.personality = personalityInput.value in PERSONALITIES ? personalityInput.value : "default";
    cat.flash = flashInput.checked;
    cat.message = "Settings saved!";
    saveState();
    render();
    settingsDialog.close();
  } else {
    settingsError.textContent = "Please enter a name and an age from 0 to 30.";
  }
});

// ---------- Time passing ----------

// Opening the page counts as time passing.
doAction("timePassed");

// Opening the game on the birthday shows the confetti again.
if (isPartyTime() && !confettiShown) showConfetti();

// If the page was closed while the cat was upset, let it calm down.
if (cat.activity === "angry" || cat.activity === "scratching") scheduleCalmDown();

setInterval(() => {
  if (cat.lives > 0) doAction("timePassed");
}, TICK_MS);
