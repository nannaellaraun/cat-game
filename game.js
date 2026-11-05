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

const PETS_BEFORE_ANGRY = 5; // the 6th pet in a row annoys the cat
const CALM_DOWN_MS = 10 * 1000; // an angry cat calms down after 10 seconds of no petting
const BIRTHDAY_MS = 7 * 24 * 60 * 60 * 1000; // the cat has a birthday every 7 days
const MAX_AGE = 30; // same limit as Cat Settings
const MESSY_AT = 30; // at this cleanliness or lower the cat looks messy

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
    lastBirthday: Date.now(), // the next birthday is 7 days after this
    partyUntil: 0, // the party hat is worn until this time (end of the birthday)
    ...startingStats("Cat"),
  };
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved ? { ...fresh, ...saved } : fresh;
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
    cat.happiness = up(cat.happiness, 15);
    cat.energy = up(cat.energy, 5);
    cat.message = cat.name + " enjoyed " + pronoun().possessive + " food!";
  },
  play() {
    cat.activity = "playing";
    cat.happiness = up(cat.happiness, 15);
    cat.energy = down(cat.energy, 5);
    cat.hunger = up(cat.hunger, 5);
    cat.cleanliness = down(cat.cleanliness, 10);
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
    cat.petStreak += 1;
    if (cat.petStreak > PETS_BEFORE_ANGRY) {
      cat.activity = "angry";
      cat.happiness = down(cat.happiness, 15);
      cat.message = cat.name + " has had enough petting! Give " + pronoun().object + " a break.";
      // Every pet while angry restarts the countdown.
      cat.angryUntil = Date.now() + CALM_DOWN_MS;
      scheduleCalmDown();
    } else {
      cat.activity = "neutral";
      cat.happiness = up(cat.happiness, 5);
      cat.message = cat.name + " purrs and swishes " + pronoun().possessive + " tail.";
    }
  },
  brush() {
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
    cat.hunger = up(cat.hunger, 2);
    cat.happiness = down(cat.happiness, 2);
    cat.energy = down(cat.energy, 2);
    cat.cleanliness = down(cat.cleanliness, 2);
    checkBirthday();
  },
};

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
    cat.happiness = down(cat.happiness, 15);
  }

  // A dirty cat is a bit grumpy
  if (cat.cleanliness <= 20) {
    cat.happiness = down(cat.happiness, 5);
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
    if (cat.activity === "angry" && Date.now() >= cat.angryUntil) {
      cat.activity = "neutral";
      cat.petStreak = 0;
      cat.message = cat.name + " has calmed down. You can pet " + pronoun().object + " again.";
      saveState();
      render();
    }
  }, Math.max(0, cat.angryUntil - Date.now()));
}

function doAction(name) {
  // Doing anything else breaks the petting streak; time passing doesn't.
  if (name !== "pet" && name !== "timePassed") cat.petStreak = 0;
  actions[name]();
  applyRules();
  saveState();
  render();
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
  $("cat-image").src = drawCat(chooseImage(moodNames), cat.color, cat.coat, cat.eyes, {
    hat: isPartyTime(),
    messy: cat.cleanliness <= MESSY_AT,
  });
  $("game-over-image").src = drawCat("gameOver", cat.color, cat.coat, cat.eyes);
}

// ---------- Wiring up buttons and the settings form ----------

document.querySelectorAll("[data-action]").forEach((button) => {
  button.addEventListener("click", () => doAction(button.dataset.action));
});

const nameInput = $("name-input");
const ageInput = $("age-input");
const genderInput = $("gender-input");

// Fill the Color, Coat and Eye color dropdowns from the lists in sprites.js.
const colorInput = $("color-input");
const coatInput = $("coat-input");
const eyesInput = $("eyes-input");
for (const [select, options] of [[colorInput, CAT_COLORS], [coatInput, CAT_COATS], [eyesInput, CAT_EYES]]) {
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

// If the page was closed while the cat was angry, let it calm down.
if (cat.activity === "angry") scheduleCalmDown();

setInterval(() => {
  if (cat.lives > 0) doAction("timePassed");
}, TICK_MS);
