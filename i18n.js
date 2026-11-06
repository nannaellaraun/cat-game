// Translations. Each language lives in lang/<code>.js and adds itself to TEXTS.
// English (below) is complete; any text missing in another language falls back to English.
//
// How a text can look:
//   "Feed {name}"                                    – {name} is filled in
//   { female: "…her…", male: "…his…", none: "…their…" } – picked by the cat's gender
//   { one: "…{count} time!", other: "…{count} times!" } – picked by the number (Intl.PluralRules)
//   "{name/이/가}" (Korean)                           – particle picked by how the name ends

const LANGUAGES = {
  en: "English",
  da: "Dansk",
  de: "Deutsch",
  ru: "Русский",
  es: "Español",
  fi: "Suomi",
  it: "Italiano",
  fr: "Français",
  zh: "中文",
  ja: "日本語",
  ko: "한국어",
};

const TEXTS = {};

TEXTS.en = {
  "page.title": "Cat Game",

  // Top bar and cat row
  "top.reset": "Reset this cat",
  "top.info": "What the buttons do",
  "top.looks": "Cat's looks",
  "top.settings": "Settings",
  "switcher.label": "Your cats",
  "switcher.adopt": "Adopt a cat",
  "switcher.needs": "{name} needs you!",

  // Main screen
  "age": "Age: {age}",
  "birthday": "🎂 Birthday today!",
  "mood.label": "Mood:",
  "stat.hunger": "Hunger",
  "stat.happiness": "Happiness",
  "stat.energy": "Energy",
  "stat.cleanliness": "Cleanliness",
  "lives": "Lives",
  "history.button": "Earlier messages",
  "history.empty": "No earlier messages yet.",
  "cat.alt": "Cat",

  "mood.veryHungry": "Very hungry",
  "mood.sad": "Sad",
  "mood.veryHappy": "Very happy",
  "mood.sleepy": "Sleepy",
  "mood.messy": "Messy",
  "mood.jealous": "Jealous",
  "mood.neutral": "Neutral",
  "health.sick": "🤒 Sick",
  "health.stiff": "🦴 Stiff joints",

  // Buttons
  "group.care": "Care",
  "group.play": "Play",
  "group.cuddle": "Cuddle",
  "btn.vet": "🩺 Take {name} to the vet",
  "btn.feed": "Feed {name}",
  "btn.brush": "Brush {name}",
  "btn.sleep": "Sleep",
  "btn.play": "Play with {name}",
  "btn.laser": "Laser dot",
  "btn.together": "Play together",
  "btn.pet": "Pet {name}",
  "btn.bellyRub": "Belly rub",
  "btn.meow": "Meow",

  // Game over
  "gameover.title": "GAME OVER",
  "gameover.text": "💔️ {name} ran out of lives 💔️",
  "gameover.restart": "Restart Game",
  "gameover.alt": "Cat with X eyes",

  // Settings
  "close": "Close",
  "settings.title": "Settings",
  "settings.cat": "Cat",
  "settings.name": "Cat's name:",
  "settings.age": "Cat's age:",
  "settings.gender": "Choose gender:",
  "gender.female": "Female",
  "gender.male": "Male",
  "gender.none": "Not chosen",
  "settings.personality": "Personality:",
  "settings.relationships": "Relationships",
  "settings.game": "Game (all cats)",
  "settings.language": "Language:",
  "settings.textSize": "Text size:",
  "size.normal": "Normal",
  "size.large": "Large",
  "size.extra-large": "Extra large",
  "settings.contrast": "Contrast:",
  "contrast.normal": "Normal",
  "contrast.high": "High",
  "contrast.dark": "Dark",
  "settings.motion": "Reduce motion:",
  "settings.flash": "Red flash when scratched:",
  "settings.illness": "Cats can get ill (colds, sore joints):",
  "settings.save": "Save Settings",
  "settings.remove": "Remove this cat",
  "rel.with": "With {name}:",
  "rel.auto": "Let it grow",
  "err.nameAge": "Please enter a name and an age from 0 to 30.",
  "err.twoCouples": "A cat can only be in a couple with one other cat.",
  "err.kittenCouple": "Only grown-up cats (age {age} or older) can be a couple.",

  // Looks
  "looks.title": "{name}'s looks",
  "looks.preview": "Preview of the cat",
  "looks.color": "Color:",
  "looks.coat": "Coat:",
  "looks.eyes": "Eye color:",
  "looks.save": "Save Looks",

  // How to play
  "info.title": "How to play",
  "info.intro": "Keep your cat fed, happy, rested and clean. The bars show how your cat is doing, and time keeps passing even when the page is closed.",
  "info.feed.term": "Feed",
  "info.feed": "Less hungry and a bit happier, but a little messy.",
  "info.brush.term": "Brush",
  "info.brush": "Cleaner and happier. Some cats don't like it.",
  "info.sleep.term": "Sleep",
  "info.sleep": "Lots of energy back, but the cat wakes up hungry.",
  "info.vet.term": "🩺 Vet",
  "info.vet": "Shows up when your cat is sick or has sore joints.",
  "info.play.term": "Play with",
  "info.play": "Much happier, but tired, hungry and messy.",
  "info.laser.term": "Laser dot",
  "info.laser": "Catch the red dot as many times as you can.",
  "info.together.term": "Play together",
  "info.together": "Two of your cats play; they can become friends, or rivals.",
  "info.pet.term": "Pet",
  "info.pet": "Happier, but too much petting in a row annoys the cat.",
  "info.bellyRub.term": "Belly rub",
  "info.bellyRub": "Very happy, or a scratch, depending on the cat.",
  "info.meow.term": "Meow",
  "info.meow": "Say hi. A little happier.",
  "info.top": "Buttons at the top",
  "info.reset": "Reset this cat's stats (it asks first).",
  "info.faces.term": "Cat faces",
  "info.faces": "Switch between your cats; + adopts a new one.",
  "info.looks.term": "Half-white cat",
  "info.looks": "Change the cat's color, coat and eyes.",
  "info.settings": "Name, age, personality, relationships and game settings.",
  "info.history": "Next to the message: the cat's earlier messages.",

  // Are you sure?
  "confirm.title": "Are you sure?",
  "confirm.no": "No",
  "confirm.reset": "This resets {name}'s hunger, happiness, energy, cleanliness and lives.",
  "confirm.resetYes": "Yes, reset",
  "confirm.remove": "Remove {name}? This can't be undone.",
  "confirm.removeYes": "Yes, remove",

  // Laser dot game
  "laser.score": "Caught: {caught} · {seconds}s",
  "laser.stop": "Stop",
  "laser.dot": "Laser dot",

  // Relationships
  "rel.friends": "Friends",
  "rel.best": "Best friends",
  "rel.couple": "Couple",
  "rel.rivals": "Rivals",
  "rel.friends.with": "Friends with {name}",
  "rel.best.with": "Best friends with {name}",
  "rel.couple.with": "In a couple with {name}",
  "rel.rivals.with": "Rivals with {name}",

  // New cats get these names
  "name.cat": "Cat",
  "name.numbered": "Cat {n}",
  "name.kitten": "Kitten",

  // Looks and personality choices
  "color.orange": "Orange",
  "color.gray": "Gray",
  "color.black": "Black",
  "color.white": "White",
  "color.beige": "Beige",
  "color.brown": "Brown",
  "coat.solid": "Solid",
  "coat.tabby": "Tabby",
  "coat.spotted": "Spotted",
  "coat.tuxedo": "Tuxedo",
  "coat.tortoiseshell": "Tortoiseshell",
  "coat.calico": "Calico",
  "coat.colorpoint": "Colorpoint (Siamese)",
  "coat.van": "Van",
  "eyes.black": "Black",
  "eyes.darkBlue": "Dark blue",
  "eyes.blue": "Blue",
  "eyes.lightBlue": "Light blue",
  "eyes.darkBrown": "Dark brown",
  "eyes.brown": "Brown",
  "eyes.lightBrown": "Light brown",
  "eyes.grey": "Grey",
  "eyes.lightPink": "Light pink",
  "eyes.darkGreen": "Dark green",
  "eyes.green": "Green",
  "eyes.lightGreen": "Light green",
  "eyes.amber": "Amber",
  "eyes.yellow": "Yellow",
  "eyes.blueBrown": "Heterochromia (blue + brown)",
  "eyes.blueYellow": "Heterochromia (blue + yellow)",
  "eyes.blueGreen": "Heterochromia (blue + green)",
  "eyes.brownGreen": "Heterochromia (brown + green)",
  "eyes.brownYellow": "Heterochromia (brown + yellow)",
  "eyes.yellowGreen": "Heterochromia (yellow + green)",
  "eyes.blind": "Blind (cloudy)",
  "personality.default": "Default",
  "personality.neurotic": "Neurotic",
  "personality.extraverted": "Extraverted",
  "personality.bossy": "Bossy",
  "personality.agreeable": "Agreeable",

  // Messages
  "msg.relaxing": "{name} is relaxing.",
  "msg.feed": {
    female: "{name} enjoyed her food!",
    male: "{name} enjoyed his food!",
    none: "{name} enjoyed their food!",
  },
  "msg.play": {
    female: "{name} is playing with her ball!",
    male: "{name} is playing with his ball!",
    none: "{name} is playing with their ball!",
  },
  "msg.sleep": {
    female: "{name} curled up for her nap.",
    male: "{name} curled up for his nap.",
    none: "{name} curled up for their nap.",
  },
  "msg.angry": {
    female: "{name} has had enough petting! Give her a break.",
    male: "{name} has had enough petting! Give him a break.",
    none: "{name} has had enough petting! Give them a break.",
  },
  "msg.purr": {
    female: "{name} purrs and swishes her tail.",
    male: "{name} purrs and swishes his tail.",
    none: "{name} purrs and swishes their tail.",
  },
  "msg.bellyRub": "{name} rolls over and purrs. Belly rubs are the best!",
  "msg.brush": {
    female: "{name} loves being brushed. Look at her shiny fur!",
    male: "{name} loves being brushed. Look at his shiny fur!",
    none: "{name} loves being brushed. Look at their shiny fur!",
  },
  "msg.meow": "{name} says: Meow!",
  "msg.together": "{name} and {friend} play together!",
  "msg.squabble": "{name} and {friend} got into a squabble!",
  "msg.now.friends": "They are now friends!",
  "msg.now.best": "They are now best friends!",
  "msg.now.couple": "They are now a couple!",
  "msg.now.rivals": "They are now rivals!",
  "msg.hadKitten": "🍼 They had a kitten!",
  "msg.kittenBorn": "{name} was born to {a} and {b}! Give it a name in the settings.",
  "msg.vetCured": "{name} is all better after the vet!",
  "msg.vetPain": "The vet gave {name} pain medicine for the stiff joints. It helps for 12 hours.",
  "msg.vetTrip": "{name} didn't enjoy the trip, though.",
  "msg.laserStart": "Catch the laser dot! Click or tap it.",
  "msg.laserNone": "{name} watched the laser dot, but nobody caught it.",
  "msg.laserCaught": {
    one: "{name} caught the laser dot {count} time!",
    other: "{name} caught the laser dot {count} times!",
  },
  "msg.arthritis": {
    female: "{name} has stiff, sore joints (arthritis) 🦴. The vet can give her pain medicine.",
    male: "{name} has stiff, sore joints (arthritis) 🦴. The vet can give him pain medicine.",
    none: "{name} has stiff, sore joints (arthritis) 🦴. The vet can give them pain medicine.",
  },
  "msg.sickLife": {
    female: "{name} is very sick and lost a life! Take her to the vet.",
    male: "{name} is very sick and lost a life! Take him to the vet.",
    none: "{name} is very sick and lost a life! Take them to the vet.",
  },
  "msg.cold": {
    female: "{name} caught a cold! 🤒 Take her to the vet.",
    male: "{name} caught a cold! 🤒 Take him to the vet.",
    none: "{name} caught a cold! 🤒 Take them to the vet.",
  },
  "msg.tooSick": {
    female: "{name} is too sick to play. Take her to the vet.",
    male: "{name} is too sick to play. Take him to the vet.",
    none: "{name} is too sick to play. Take them to the vet.",
  },
  "msg.scratch": "Ouch! {name} scratched you!",
  "msg.birthday": "🎂 Happy birthday, {name}!",
  "msg.turned": "{name} turned {age}!",
  "msg.lostLife": "{name} lost a life!",
  "msg.gameOver": "GAME OVER! {name} ran out of lives.",
  "msg.calmAngry": {
    female: "{name} has calmed down. You can pet her again.",
    male: "{name} has calmed down. You can pet him again.",
    none: "{name} has calmed down. You can pet them again.",
  },
  "msg.calm": "{name} has calmed down.",
  "msg.welcome": "Welcome home, {name}! Give your new cat a name in the settings.",
  "msg.looksSaved": "{name}'s new look is saved!",
  "msg.settingsSaved": "Settings saved!",
};

let language = "en";

// Korean particles: "{name/이/가}" gives the first one after a name ending in a consonant (batchim).
function koreanParticle(word, withBatchim, without) {
  const code = String(word).charCodeAt(String(word).length - 1);
  const hangul = code >= 0xac00 && code <= 0xd7a3;
  return word + (hangul && (code - 0xac00) % 28 !== 0 ? withBatchim : without);
}

// Translate one text. params: values for {placeholders}, plus gender and count when needed.
function t(key, params = {}) {
  let text = (TEXTS[language] && TEXTS[language][key]) ?? TEXTS.en[key] ?? key;
  if (typeof text === "object") {
    if ("count" in params && text.other !== undefined) {
      text = text[new Intl.PluralRules(language).select(params.count)] ?? text.other;
    } else {
      text = text[params.gender] ?? text.none;
    }
  }
  return text
    .replace(/\{(\w+)\/([^/}]+)\/([^}]+)\}/g, (all, name, a, b) => koreanParticle(params[name] ?? "", a, b))
    .replace(/\{(\w+)\}/g, (all, name) => (params[name] ?? all));
}

// A message is stored as { key, params } (or a list of them), so it can be shown in any language.
function messageText(message) {
  if (!message) return "";
  if (typeof message === "string") return message; // saved by an older version
  if (Array.isArray(message)) return message.map(messageText).join(" ");
  return t(message.key, message.params);
}

// The browser's language if we have it, otherwise English.
function guessLanguage() {
  for (const wanted of navigator.languages || [navigator.language || "en"]) {
    const code = String(wanted).slice(0, 2).toLowerCase();
    if (LANGUAGES[code]) return code;
  }
  return "en";
}
