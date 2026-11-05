// Cat Game – runs entirely in the browser.
// The PHP version kept the cat in $_SESSION; here it lives in localStorage.

const STORAGE_KEY = "cat-game";
const TICK_MS = 35 * 1000; // the PHP page refreshed itself every 35 seconds

const IMAGES = {
  neutral: "neutral-happy-hungry.png",
  playing: "playing.png",
  sad: "sad-losesaheart.png",
  sleepy: "sleepy-sleeping.png",
  angry: "angry.png",
};

// Pronouns for each gender choice in Cat Settings.
const PRONOUNS = {
  female: { subject: "she", object: "her", possessive: "her", possessivePronoun: "hers" },
  male: { subject: "he", object: "him", possessive: "his", possessivePronoun: "his" },
  none: { subject: "they", object: "them", possessive: "their", possessivePronoun: "theirs" },
};

const PETS_BEFORE_ANGRY = 5; // the 6th pet in a row annoys the cat
const CALM_DOWN_MS = 10 * 1000; // an angry cat calms down after 10 seconds of no petting

// ---------- State ----------

function startingStats(name) {
  return {
    hunger: 40,
    happiness: 70,
    energy: 90,
    lives: 3,
    activity: "neutral",
    petStreak: 0, // how many times in a row the cat has been petted
    angryUntil: 0, // time (ms) when an angry cat calms down
    message: name + " is relaxing.",
  };
}

function loadState() {
  const fresh = { name: "Cat", age: 0, gender: "none", ...startingStats("Cat") };
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
  },
};

// Rules that run after every action, like the bottom half of the PHP script.
function applyRules() {
  // A very hungry cat gets sadder
  if (cat.hunger > 80) {
    cat.happiness = down(cat.happiness, 15);
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
  if (cat.happiness >= 30 && cat.happiness <= 70) moods.push(["Neutral", "☁️"]);
  return moods;
}

function chooseImage(moodNames) {
  if (cat.activity === "angry") return IMAGES.angry;
  if (cat.activity === "playing") return IMAGES.playing;
  if (cat.activity === "sleeping") return IMAGES.sleepy;
  if (cat.lives < 3 || moodNames.includes("Sad")) return IMAGES.sad;
  if (moodNames.includes("Sleepy")) return IMAGES.sleepy;
  return IMAGES.neutral;
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

  for (const stat of ["hunger", "happiness", "energy"]) {
    $(stat + "-value").textContent = cat[stat];
    $(stat + "-bar").style.width = cat[stat] + "%";
  }

  $("message").textContent = cat.message;
  $("lives-value").textContent = cat.lives;
  $("hearts").textContent = "❤️".repeat(cat.lives) + "💔️".repeat(3 - cat.lives);
  $("cat-image").src = chooseImage(moodNames);
}

// ---------- Wiring up buttons and the settings form ----------

document.querySelectorAll("[data-action]").forEach((button) => {
  button.addEventListener("click", () => doAction(button.dataset.action));
});

const nameInput = $("name-input");
const ageInput = $("age-input");
const genderInput = $("gender-input");
nameInput.value = cat.name;
ageInput.value = cat.age;
genderInput.value = cat.gender in PRONOUNS ? cat.gender : "none";

$("settings-form").addEventListener("submit", (event) => {
  event.preventDefault(); // stay on the page instead of reloading it
  const newName = nameInput.value.trim();
  const newAge = Number(ageInput.value);

  if (newName !== "" && Number.isInteger(newAge) && newAge >= 0 && newAge <= 30) {
    cat.name = newName;
    cat.age = newAge;
    cat.gender = genderInput.value in PRONOUNS ? genderInput.value : "none";
    cat.message = "Settings saved!";
  } else {
    cat.message = "Please enter a name and an age from 0 to 30.";
  }
  saveState();
  render();
});

// ---------- Time passing ----------

// Opening the page counts as time passing.
doAction("timePassed");

// If the page was closed while the cat was angry, let it calm down.
if (cat.activity === "angry") scheduleCalmDown();

setInterval(() => {
  if (cat.lives > 0) doAction("timePassed");
}, TICK_MS);
