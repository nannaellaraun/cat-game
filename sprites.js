// Pixel-art cat sprites, drawn in the browser so the cat can have any color and coat.
// Letters: K outline, Y fur, O stripes, L light fur (face/belly/paws), E/F iris of the left/right
// eye, D pupil, C closed/X eyes,
// P pink, B tear and sneeze, R/r/w ball, anger mark and thermometer tip, W claws, fangs and glass,
// h/d carrier wood and bars, V purple gloom lines. Regions are [x0, y0, x1, y1] boxes used by
// coats like Colorpoint and Van.

const SPRITES = {
  neutral: {
    art: [
      "..KK.........KK.......",
      ".KYYK.......KYYK......",
      ".KYPYK.....KYPYK......",
      ".KYYYYKKKKKYYYYK......",
      "KYYYYYOYYYOYYYYYK.....",
      "KYYYYYYOYOYYYYYYK.....",
      "KYYYEDYYYYYDFYYYK.....",
      "KYYYEDYYYYYDFYYYK.....",
      "KYLLLLLLKLLLLLLYK.....",
      "KLPPLLLPPPLLLPPLK.....",
      ".KLLLLLLLLLLLLLK......",
      "..KKYYYYYYYYYKK.......",
      "...KYYOYYYOYYK........",
      "..KYYYOYLYOYYYK.......",
      "..KYOYYLLLYYOYK....KK.",
      ".KYYYYLLLLLYYYYK..KYYK",
      ".KYOYYLLLLLYYOYK..KYOK",
      ".KYYYYLLLLLYYYYK..KYYK",
      ".KYOYKLLLLLKYOYK..KYK.",
      ".KYYYKLLKLLKYYYK.KYOK.",
      ".KYYYKLLKLLKYYYKKYYK..",
      ".KYOYKLLKLLKYOYYYOK...",
      ".KLLLKLLKLLKLLLKKK....",
      "..KKKKKKKKKKKKKK......",
    ],
    regions: {ears: [[0, 0, 6, 3], [10, 0, 16, 3]], mask: [[5, 7, 11, 10]], tail: [[15, 14, 21, 21]], paws: [[0, 21, 14, 22]]},
    hat: [8, 2], // party hat: middle column and bottom row
    happyEyes: [[3, 7], [4, 6], [5, 7], [11, 7], [12, 6], [13, 7]], // ^ ^ when petted
  },
  angry: {
    art: [
      "..KK.........KK...R.R.",
      ".KYYK.......KYYK.RR.RR",
      ".KYPYK.....KYPYK......",
      ".KYYYYKKKKKYYYYK.RR.RR",
      "KYYYYYOYYYOYYYYYK.R.R.",
      "KYYKKYYOYOYYKKYYK.....",
      "KYYYYKKYYYKKYYYYK.....",
      "KYYYEDYYYYYDFYYYK.....",
      "KYLLLLLLPLLLLLLYK.....",
      "KLLLLLLKKKLLLLLLK.....",
      ".KLLLLKLLLKLLLLK......",
      "..KKYYYYYYYYYKK.......",
      "...KYYOYYYOYYK........",
      "..KYYYOYLYOYYYK.......",
      "..KYOYYLLLYYOYK....KK.",
      ".KYYYYLLLLLYYYYK..KYYK",
      ".KYOYYLLLLLYYOYK..KYOK",
      ".KYYYYLLLLLYYYYK..KYYK",
      ".KYOYKLLLLLKYOYK..KYK.",
      ".KYYYKLLKLLKYYYK.KYOK.",
      ".KYYYKLLKLLKYYYKKYYK..",
      ".KYOYKLLKLLKYOYYYOK...",
      ".KLLLKLLKLLKLLLKKK....",
      "..KKKKKKKKKKKKKK......",
    ],
    regions: {ears: [[0, 0, 6, 3], [10, 0, 16, 3]], mask: [[5, 7, 11, 10]], tail: [[15, 14, 21, 21]], paws: [[0, 21, 14, 22]]},
    hat: [8, 2], // party hat: middle column and bottom row
  },
  scratch: {
    art: [
      "..KK.........KK.........",
      ".KYYK.......KYYK........",
      ".KYPYK.....KYPYK........",
      ".KYYYYKKKKKYYYYK..K.K.K.",
      "KYYYYYOYYYOYYYYYKKWKWKWK",
      "KYYKKYYOYOYYKKYYKKWKWKWK",
      "KYYYYKKYYYKKYYYYKKLKLKLK",
      "KYYYEDYYYYYDFYYYKKLLLLLK",
      "KYLLLLLLPLLLLLLYK.KLLLK.",
      "KLLLLLKKKKKLLLLLK.KYYK..",
      ".KLLLLKWKWKLLLLK.KYYK...",
      "..KKYYYYYYYYYKKKYYK.....",
      "...KYYOYYYOYYYYYYK......",
      "..KYYYOYLYOYYYKKK.......",
      "..KYOYYLLLYYOYK....KK...",
      ".KYYYYLLLLLYYYYK..KYYK..",
      ".KYOYYLLLLLYYOYK..KYOK..",
      ".KYYYYLLLLLYYYYK..KYYK..",
      ".KYOYKLLLLLKYOYK..KYK...",
      ".KYYYKLLKLLKYYYK.KYOK...",
      ".KYYYKLLKLLKYYYKKYYK....",
      ".KYOYKLLKLLKYOYYYOK.....",
      ".KLLLKLLKLLKLLLKKK......",
      "..KKKKKKKKKKKKKK........",
    ],
    regions: {ears: [[0, 0, 6, 3], [10, 0, 16, 3]], mask: [[5, 7, 11, 10]], tail: [[15, 14, 21, 21]], paws: [[0, 21, 14, 22]]},
    hat: [8, 2], // party hat: middle column and bottom row
  },
  playing: {
    art: [
      "....................................KK.",
      "...................................KYYK",
      "...................................KYOK",
      "...................................KYYK",
      "..................................KYYK.",
      ".......KK......KK.................KYOK.",
      "......KYYK....KYYK...............KYYK..",
      "......KYPYKKKKYPYK...............KYOK..",
      ".....KYYYYOYYOYYYYKKKKKKKKKKKKKKKYYK...",
      ".....KYYYYYOOYYYYYYKYYOYYYOYYYOYYYK....",
      ".....KYYEDYYYYDFYYYKYOYYYOYYYOYYYYK....",
      ".....KYYEDYYYYDFYYYYYYYYOYYYOYYYOYK....",
      ".....KLLLLLLKLLLLLLYYOYYYYYYYYYYYYK....",
      ".....KLPPLLPPPLLPPLYYYYYOYYYOYYYOYK....",
      "..KK..KLLLLLLLLLLLKYYYYYYYYYYYYYYYK....",
      ".KRRK..KKKKKKKKKKKLLLLLLLLLLLKYYYYK....",
      "KRwRRK..KLLK.KLLK.KKKKKKKKKKKKLLLK.....",
      "KRRRRK..KLLK..KLLK.........KLLKKLLK....",
      "KrRRrK...KKK...KKK..........KKK..KK....",
      ".KrrK..................................",
      "..KK...................................",
    ],
    regions: {ears: [[6, 5, 10, 7], [14, 5, 18, 7]], mask: [[9, 11, 15, 13]], tail: [[33, 0, 38, 8]], paws: [[7, 16, 18, 17], [27, 16, 34, 17]]},
    hat: [12, 6], // party hat: middle column and bottom row
  },
  chase: { // the playing pose without the ball, for the laser dot game
    art: [
      "....................................KK.",
      "...................................KYYK",
      "...................................KYOK",
      "...................................KYYK",
      "..................................KYYK.",
      ".......KK......KK.................KYOK.",
      "......KYYK....KYYK...............KYYK..",
      "......KYPYKKKKYPYK...............KYOK..",
      ".....KYYYYOYYOYYYYKKKKKKKKKKKKKKKYYK...",
      ".....KYYYYYOOYYYYYYKYYOYYYOYYYOYYYK....",
      ".....KYYEDYYYYDFYYYKYOYYYOYYYOYYYYK....",
      ".....KYYEDYYYYDFYYYYYYYYOYYYOYYYOYK....",
      ".....KLLLLLLKLLLLLLYYOYYYYYYYYYYYYK....",
      ".....KLPPLLPPPLLPPLYYYYYOYYYOYYYOYK....",
      "......KLLLLLLLLLLLKYYYYYYYYYYYYYYYK....",
      ".......KKKKKKKKKKKLLLLLLLLLLLKYYYYK....",
      "........KLLK.KLLK.KKKKKKKKKKKKLLLK.....",
      "........KLLK..KLLK.........KLLKKLLK....",
      ".........KKK...KKK..........KKK..KK....",
      ".......................................",
      ".......................................",
    ],
    regions: {ears: [[6, 5, 10, 7], [14, 5, 18, 7]], mask: [[9, 11, 15, 13]], tail: [[33, 0, 38, 8]], paws: [[7, 16, 18, 17], [27, 16, 34, 17]]},
    hat: [12, 6], // party hat: middle column and bottom row
  },
  sad: {
    art: [
      ".........................KK..",
      "........................KYYK.",
      "........................KYOK.",
      "........................KYYK.",
      "........................KYOK.",
      ".........................KYYK",
      ".........................KYOK",
      ".KKKK.......KKKK.........KYYK",
      "KYYYYK.....KYYYYK........KYK.",
      ".KKYPYKKKKKYPYKK.........KYK.",
      "..KYYYYOYOYYYYK.........KYK..",
      ".KYYYYYYOYYYYYYK........KYK..",
      ".KYKKKYYYYYKKKYK........KYK..",
      ".KYYYEYYYYYFYYYK.......KYK...",
      ".KYBYDYYYYYDYYYKKKKKKKKKKK...",
      ".KLBLLLLKLLLLLLYYYOYYYOYYK...",
      ".KLPPLLLPLLLLPPKYOYYYOYYYK...",
      "..KLLLLLKLLLLLKYYYYOYYYOYK...",
      "...KKKKKKKKKKKYOYYYYYYYYYK...",
      ".......KYYLLLLLLLLLLLYYYYK...",
      ".......KYYKKKKKKKKKKKKKYYK...",
      ".......KYYK..........KYYK....",
      ".......KLLK..........KLLK....",
      ".......KKKK..........KKKK....",
    ],
    regions: {ears: [[0, 7, 6, 9], [10, 7, 16, 9]], mask: [[5, 14, 11, 17]], tail: [[22, 0, 27, 13]], paws: [[7, 22, 10, 22], [21, 22, 24, 22]]},
    hat: [8, 8], // party hat: middle column and bottom row
  },
  sleepy: {
    art: [
      ".KK......KK.....................",
      "KYYK....KYYK....................",
      "KYPYKKKKKYPYK...................",
      "KYYYOYYOYYYYK...KKKKKKKKKK......",
      "KYYYYOOYYYYYKKKKYYOYYYOYYYKK....",
      "KYYYYYYYYYYYYYYYYYYOYYYOYYYYK...",
      "KYCCCYYYYCCCYYOYYYYYOYYYOYYYYK..",
      "KLLLLLLKLLLLLYOYYYYYYOYYYOYYYK..",
      "KLPPLLKKKLLPPLYYYYYYYYYYYYYYYYK.",
      ".KLLLLLLLLLLKYOYYYYYYOYYYOYYYYK.",
      "..KKKKKKKKKKYYYOYYYYYYYYYYYYYYK.",
      "..KLLLKLLLKYYYYYKKKKKKKYYYYYYK..",
      "..KLLLKLLLKKKKKKYYOYYOYYKKKKK...",
      "...KKKKKKKKYYYOYYYOYYYOYYK......",
      "..........KKKKKKKKKKKKKKK.......",
    ],
    regions: {ears: [[0, 0, 4, 2], [8, 0, 12, 2]], mask: [[5, 7, 9, 9]], tail: [[11, 12, 24, 13]], paws: [[2, 11, 10, 12]]},
    hat: [6, 1], // party hat: middle column and bottom row
  },
  belly: {
    art: [
      ".....................................",
      ".....................................",
      ".....................................",
      ".....................................",
      "...............KK...KK..KK..KK.......",
      "..KKKKKKKKKK..KLLK.KLLKKLLKKLLK..KK..",
      ".KLLLLLLLLLLK.KYYK.KYYKKYYKKYYK.KYYK.",
      "KLPPLLKKKLLPPKKYYK.KYYKKYYKKYYK.KYOK.",
      "KLLLLLLKLLLLLKKYYKKKYYKKYYKKYYK.KYYK.",
      "KYCYCYYYYCYCYLLLLLLLLLLLLLLLLLK.KYOK.",
      "KYYCYYYYYYCYYLLLLLLLLLLLLLLLLLLKKYYK.",
      "KYYYYOOYYYYYKLLLLLLLLLLLLLLLLLLKKYOK.",
      "KYYYOYYOYYYYKYYOYYYOYYYOYYYOYYYYYYYK.",
      "KYPYKKKKKYPYKYOYYYOYYYOYYYOYYYYKKKK..",
      "KYYK....KYYKKYYYYYYYYYYYYYYYYYK......",
      ".KK......KK.KKKKKKKKKKKKKKKKKK.......",
    ],
    regions: {ears: [[0, 13, 4, 15], [8, 13, 12, 15]], mask: [[5, 6, 9, 9]], tail: [[32, 5, 35, 12]], paws: [[14, 4, 31, 5]]},
  },
  face: { // just the head, for the row of cats to switch between
    art: [
      "..KK.........KK..",
      ".KYYK.......KYYK.",
      ".KYPYK.....KYPYK.",
      ".KYYYYKKKKKYYYYK.",
      "KYYYYYOYYYOYYYYYK",
      "KYYYYYYOYOYYYYYYK",
      "KYYYEDYYYYYDFYYYK",
      "KYYYEDYYYYYDFYYYK",
      "KYLLLLLLKLLLLLLYK",
      "KLPPLLLPPPLLLPPLK",
      ".KLLLLLLLLLLLLLK.",
      "..KKKKKKKKKKKKK..",
    ],
    regions: {ears: [[0, 0, 6, 3], [10, 0, 16, 3]], mask: [[5, 7, 11, 10]], tail: [], paws: []},
    hat: [8, 2], // party hat: middle column and bottom row
  },
  sick: { // tired eyes, wobbly mouth and purple gloom lines, when the cat has a cold
    art: [
      "..KK.........KK.........",
      ".KYYK.......KYYK....V...",
      ".KYPYK.....KYPYK..V.V.V.",
      ".KYYYYKKKKKYYYYK..V.V.V.",
      "KYYYYYOYYYOYYYYYK.V.V.V.",
      "KYYYYYYOYOYYYYYYK.V...V.",
      "KYYYYYYYYYYYYYYYK.......",
      "KYYCCCYYYYYCCCYYK.......",
      "KYLLLLLLKLLLLLLYK.......",
      "KLPPLLLKPKLLLPPLK.......",
      ".KLLLLKLKLKLLLLK........",
      "..KKYYYYYYYYYKK.........",
      "...KYYOYYYOYYK..........",
      "..KYYYOYLYOYYYK.........",
      "..KYOYYLLLYYOYK....KK...",
      ".KYYYYLLLLLYYYYK..KYYK..",
      ".KYOYYLLLLLYYOYK..KYOK..",
      ".KYYYYLLLLLYYYYK..KYYK..",
      ".KYOYKLLLLLKYOYK..KYK...",
      ".KYYYKLLKLLKYYYK.KYOK...",
      ".KYYYKLLKLLKYYYKKYYK....",
      ".KYOYKLLKLLKYOYYYOK.....",
      ".KLLLKLLKLLKLLLKKK......",
      "..KKKKKKKKKKKKKK........",
    ],
    regions: {ears: [[0, 0, 6, 3], [10, 0, 16, 3]], mask: [[5, 7, 11, 10]], tail: [[15, 14, 21, 21]], paws: [[0, 21, 14, 22]]},
    hat: [8, 2], // party hat: middle column and bottom row
  },
  sneeze: { // Achoo! shown for a moment now and then while sick
    art: [
      "..KK.........KK.........",
      ".KYYK.......KYYK........",
      ".KYPYK.....KYPYK........",
      ".KYYYYKKKKKYYYYK........",
      "KYYYYYOYYYOYYYYYK.......",
      "KYYYYYYOYOYYYYYYK.......",
      "KYYCYCYYYYYCYCYYK.......",
      "KYYYCYYYYYYYCYYYK.......",
      "KYLLLLLLKLLLLLLYK...B...",
      "KLPPLLLKKKLLLPPLKB.B....",
      ".KLLLLLKPKLLLLLK........",
      "..KKYYYYYYYYYKK...B.B...",
      "...KYYOYYYOYYK..........",
      "..KYYYOYLYOYYYK.........",
      "..KYOYYLLLYYOYK....KK...",
      ".KYYYYLLLLLYYYYK..KYYK..",
      ".KYOYYLLLLLYYOYK..KYOK..",
      ".KYYYYLLLLLYYYYK..KYYK..",
      ".KYOYKLLLLLKYOYK..KYK...",
      ".KYYYKLLKLLKYYYK.KYOK...",
      ".KYYYKLLKLLKYYYKKYYK....",
      ".KYOYKLLKLLKYOYYYOK.....",
      ".KLLLKLLKLLKLLLKKK......",
      "..KKKKKKKKKKKKKK........",
    ],
    regions: {ears: [[0, 0, 6, 3], [10, 0, 16, 3]], mask: [[5, 7, 11, 10]], tail: [[15, 14, 21, 21]], paws: [[0, 21, 14, 22]]},
    hat: [8, 2], // party hat: middle column and bottom row
  },
  carrier: { // the pet carrier on the way to the vet; the eyes peek out
    art: [
      "........KKKKKKKK........",
      ".......KhhhhhhhhK.......",
      "......KhK......KhK......",
      "..KKKKKKKKKKKKKKKKKKKK..",
      "..KhhhhhhhhhhhhhhhhhhK..",
      "..KhKKKKKKKKKKKKKKKKhK..",
      "..KhKdKdKdKdKdKdKdKKhK..",
      "..KhKdKdKdKdKdKdKdKKhK..",
      "..KhKdKEKdKdKdKFKdKKhK..",
      "..KhKdKdKdKdKdKdKdKKhK..",
      "..KhKdKdKdKdKdKdKdKKhK..",
      "..KhKKKKKKKKKKKKKKKKhK..",
      "..KhhhhhhhhhhhhhhhhhhK..",
      "..KKKKKKKKKKKKKKKKKKKK..",
      "...KK..............KK...",
    ],
    regions: {ears: [], mask: [], tail: [], paws: []},
  },
  gameOver: {
    art: [
      "..KK..........KK..",
      ".KYYK........KYYK.",
      ".KYPYK......KYPYK.",
      ".KYPYYKKKKKKYYPYK.",
      "KYYYYYYOYYOYYYYYYK",
      "KYYYYYYYOOYYYYYYYK",
      "KYYYYYYYYYYYYYYYYK",
      "KYYCYCYYYYYYCYCYYK",
      "KYYYCYYYYYYYYCYYYK",
      "KYYCYCYYYYYYCYCYYK",
      "KLLLLLLLLLLLLLLLLK",
      "KLPPLLLLPPLLLLPPLK",
      "KLPPLLLLKKLLLLPPLK",
      ".KLLLLLLLLLLLLLLK.",
      "..KKLLLLLLLLLLKK..",
      "....KKKKKKKKKK....",
    ],
    regions: {ears: [[0, 0, 6, 3], [11, 0, 17, 3]], mask: [[6, 10, 11, 13]], tail: [], paws: []},
  },
};

// ---------- Colors and coats ----------

// fur: main color, dark: stripes/shading, light: face and belly, outline: edges,
// closedEyes: sleeping eyes and the X eyes on game over.
const CAT_COLORS = {
  orange: { label: "Orange", fur: "#f8c430", dark: "#e08018", light: "#ffeca8", outline: "#5c1e0e", closedEyes: "#5c1e0e" },
  gray:   { label: "Gray",   fur: "#a9a9b6", dark: "#7a7a8c", light: "#e4e4ec", outline: "#2f2f3a", closedEyes: "#2f2f3a" },
  black:  { label: "Black",  fur: "#3c3c46", dark: "#26262e", light: "#6a6a78", outline: "#111116", closedEyes: "#9a9aa8" },
  white:  { label: "White",  fur: "#f4f4f4", dark: "#d6d6de", light: "#ffffff", outline: "#4a3a3a", closedEyes: "#4a3a3a" },
  beige:  { label: "Beige",  fur: "#e8d0a8", dark: "#c8a674", light: "#fff4e0", outline: "#5c3e22", closedEyes: "#5c3e22" },
  brown:  { label: "Brown",  fur: "#9c6438", dark: "#6e4020", light: "#e0b890", outline: "#3a1a0a", closedEyes: "#3a1a0a" },
};

const CAT_COATS = {
  solid: "Solid",
  tabby: "Tabby",
  spotted: "Spotted",
  tuxedo: "Tuxedo",
  tortoiseshell: "Tortoiseshell",
  calico: "Calico",
  colorpoint: "Colorpoint (Siamese)",
  van: "Van",
};

// Eye colors: left and right are the eyes on the viewer's left and right.
// pupil is optional; without it the pupil uses the cat's outline color.
const EYE_HUES = {
  darkBlue: "#1f4fa8",
  blue: "#3c8ce6",
  lightBlue: "#9ccff5",
  darkBrown: "#5a3418",
  brown: "#8a5a2b",
  lightBrown: "#c0915a",
  black: "#34343a", // very dark grey, so the black pupil still shows
  grey: "#8c8c96",
  lightPink: "#f5b8c8",
  darkGreen: "#2f7a32",
  green: "#4caf50",
  lightGreen: "#a5e08a",
  amber: "#e0961c",
  yellow: "#f2d530",
};

const CAT_EYES = {
  black: { label: "Black", left: EYE_HUES.black, right: EYE_HUES.black, pupil: "#000000" },
  darkBlue: { label: "Dark blue", left: EYE_HUES.darkBlue, right: EYE_HUES.darkBlue },
  blue: { label: "Blue", left: EYE_HUES.blue, right: EYE_HUES.blue },
  lightBlue: { label: "Light blue", left: EYE_HUES.lightBlue, right: EYE_HUES.lightBlue },
  darkBrown: { label: "Dark brown", left: EYE_HUES.darkBrown, right: EYE_HUES.darkBrown },
  brown: { label: "Brown", left: EYE_HUES.brown, right: EYE_HUES.brown },
  lightBrown: { label: "Light brown", left: EYE_HUES.lightBrown, right: EYE_HUES.lightBrown },
  grey: { label: "Grey", left: EYE_HUES.grey, right: EYE_HUES.grey },
  lightPink: { label: "Light pink", left: EYE_HUES.lightPink, right: EYE_HUES.lightPink },
  darkGreen: { label: "Dark green", left: EYE_HUES.darkGreen, right: EYE_HUES.darkGreen },
  green: { label: "Green", left: EYE_HUES.green, right: EYE_HUES.green },
  lightGreen: { label: "Light green", left: EYE_HUES.lightGreen, right: EYE_HUES.lightGreen },
  amber: { label: "Amber", left: EYE_HUES.amber, right: EYE_HUES.amber },
  yellow: { label: "Yellow", left: EYE_HUES.yellow, right: EYE_HUES.yellow },
  blueBrown: { label: "Heterochromia (blue + brown)", left: EYE_HUES.blue, right: EYE_HUES.brown },
  blueYellow: { label: "Heterochromia (blue + yellow)", left: EYE_HUES.blue, right: EYE_HUES.yellow },
  blueGreen: { label: "Heterochromia (blue + green)", left: EYE_HUES.blue, right: EYE_HUES.green },
  brownGreen: { label: "Heterochromia (brown + green)", left: EYE_HUES.brown, right: EYE_HUES.green },
  brownYellow: { label: "Heterochromia (brown + yellow)", left: EYE_HUES.brown, right: EYE_HUES.yellow },
  yellowGreen: { label: "Heterochromia (yellow + green)", left: EYE_HUES.yellow, right: EYE_HUES.green },
  // Blind eyes are cloudy and pale, with only a faint pupil.
  blind: { label: "Blind (cloudy)", left: "#dde8f0", right: "#dde8f0", pupil: "#c2d2de" },
};

// Colors that never change with the cat's color.
const FIXED_COLORS = {
  P: "#f08c8c", // pink nose, ears and blush
  B: "#6eaae6", // tear
  R: "#c81c28", // ball and anger mark
  r: "#780a14", // ball shadow
  w: "#ff9696", // ball highlight
  W: "#ffffff", // claws and fangs
  h: "#b07c52", // pet carrier
  d: "#28201a", // carrier bars
  V: "#8a5cc4", // purple gloom lines when sick
};

const WHITE = "#fbfbfb";
const SCALE = 9; // each pixel-art pixel becomes 9x9 screen pixels

// Mix two "#rrggbb" colors; amount 0 gives a, 1 gives b.
function mix(a, b, amount) {
  const ch = (hex, i) => parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16);
  const parts = [0, 1, 2].map((i) => Math.round(ch(a, i) * (1 - amount) + ch(b, i) * amount));
  return "#" + parts.map((n) => n.toString(16).padStart(2, "0")).join("");
}

// A fixed pseudo-random number for a pair of numbers, so patterns look random but never change.
function hash2(a, b) {
  let hash = Math.imul(a, 374761393) + Math.imul(b, 668265263);
  hash = Math.imul(hash ^ (hash >>> 13), 1274126177);
  return (hash ^ (hash >>> 16)) >>> 0;
}

// Patches for tortoiseshell and calico: the same 3x3 blocks always get the same color.
function patch(x, y, choices) {
  return choices[hash2(Math.floor(x / 3), Math.floor(y / 3)) % choices.length];
}

function inRegion(regions, names, x, y) {
  return names.some((name) =>
    regions[name].some(([x0, y0, x1, y1]) => x >= x0 && x <= x1 && y >= y0 && y <= y1)
  );
}

// The color of one fur pixel (Y = fur, O = stripe, L = light fur).
function furColor(letter, x, y, color, coat, regions) {
  const orange = CAT_COLORS.orange;
  const blackOrOrange = color === CAT_COLORS.orange || color === CAT_COLORS.black;

  switch (coat) {
    case "tabby":
      return { Y: color.fur, O: color.dark, L: color.light }[letter];
    case "spotted": {
      if (letter === "L") return color.light;
      const spot = y % 2 === 0 && (x + Math.floor(y / 2) * 3) % 4 === 0;
      return spot ? color.dark : color.fur;
    }
    case "tuxedo":
      return letter === "L" ? WHITE : color.fur;
    case "tortoiseshell": {
      if (letter === "L") return color.light;
      const choices = blackOrOrange
        ? [CAT_COLORS.black.fur, orange.dark, CAT_COLORS.black.dark, orange.fur]
        : [color.fur, orange.dark, color.dark, orange.fur];
      return patch(x, y, choices);
    }
    case "calico": {
      if (letter === "L") return WHITE;
      const other = blackOrOrange ? CAT_COLORS.black.fur : color.fur;
      return patch(x, y, [WHITE, WHITE, orange.dark, other]);
    }
    case "colorpoint":
      if (inRegion(regions, ["ears", "mask", "tail", "paws"], x, y)) return color.dark;
      return letter === "L" ? mix(color.light, WHITE, 0.6) : mix(color.fur, WHITE, 0.75);
    case "van":
      if (inRegion(regions, ["ears", "tail"], x, y)) return letter === "O" ? color.dark : color.fur;
      return WHITE;
    default: // solid
      return letter === "L" ? color.light : color.fur;
  }
}

// Birthday party hat, drawn on top of the cat's head.
// h hat, s stripe, p pompom, K outline.
const PARTY_HAT = [
  "..p..",
  ".KhK.",
  ".KsK.",
  "KhhhK",
  "KsssK",
];
const HAT_COLORS = { h: "#4aa8e0", s: "#f2d530", p: "#e84a8a" };
const DIRT = "#6b4a2a";

// Blinking: the lower row of each open eye becomes a closed-eye line, the rest becomes fur.
function closeEyes(grid) {
  const isEye = (c) => c === "E" || c === "F" || c === "D";
  grid.forEach((row, y) => {
    row.forEach((c, x) => {
      if (isEye(c)) row[x] = grid[y + 1] && isEye(grid[y + 1][x]) ? "Y" : "C";
    });
  });
}

// Happy eyes: the open eyes become ^ ^ arcs (only for sprites that list happyEyes).
function happyEyes(grid, cells) {
  grid.forEach((row) => row.forEach((c, x) => {
    if (c === "E" || c === "F" || c === "D") row[x] = "Y";
  }));
  for (const [x, y] of cells) grid[y][x] = "C";
}

// Looking to one side: in each eye (a row of iris + pupil pixels) the pupil moves to the left or right end.
function lookAside(grid, side) {
  const isEye = (c) => c === "E" || c === "F" || c === "D";
  grid.forEach((row) => {
    let x = 0;
    while (x < row.length) {
      if (!isEye(row[x])) { x++; continue; }
      let end = x;
      while (end + 1 < row.length && isEye(row[end + 1])) end++;
      if (end > x) {
        const iris = row.slice(x, end + 1).find((c) => c !== "D") || "E";
        for (let i = x; i <= end; i++) row[i] = iris;
        row[side === "left" ? x : end] = "D";
      }
      x = end + 1;
    }
  });
}

// Tail swish: the upper part of the tail moves one pixel sideways.
// Only the tail's own pixels move (not the body outline at the edge of the tail box).
function swishTail(grid, regions) {
  for (const [x0, y0, x1, y1] of regions.tail) {
    if (x1 - x0 >= y1 - y0) continue; // only upright tails, not tails lying flat
    const lastRow = y0 + Math.floor((y1 - y0) * 0.45);
    for (let y = y0; y <= lastRow; y++) {
      const row = grid[y];
      const moved = row.slice();
      for (let x = x0 + 2; x <= x1; x++) moved[x] = ".";
      for (let x = x0 + 2; x <= x1; x++) {
        if (row[x] !== "." && x + 1 < row.length) moved[x + 1] = row[x];
      }
      grid[y] = moved;
    }
  }
}

// Old cats: some fur pixels turn grey, more of them around the muzzle.
const GREY_HAIR = "#d6d3cf";
function isGreyHair(x, y, regions) {
  const onMuzzle = inRegion(regions, ["mask"], x, y);
  return hash2(x * 7 + 3, y * 11 + 5) % (onMuzzle ? 3 : 8) === 0;
}

// Messy fur: little tufts sticking out of the outline (T) and dirt spots on the fur (X).
function makeMessy(grid) {
  const at = (x, y) => (grid[y] && grid[y][x]) || ".";
  const isFur = (c) => "YOLEFD".includes(c);
  const touchesFur = (x, y) => [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => isFur(at(x + dx, y + dy)));
  grid.forEach((row, y) => {
    row.forEach((c, x) => {
      const nextToCat = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(
        ([dx, dy]) => at(x + dx, y + dy) === "K" && touchesFur(x + dx, y + dy)
      );
      if (c === "." && nextToCat && hash2(x, y) % 3 === 0) row[x] = "T";
      else if ((c === "Y" || c === "O") && hash2(y, x) % 9 === 0) row[x] = "X";
    });
  });
}

const spriteCache = {};

// Returns an image URL of the sprite in the given color, coat and eye color.
// Options: hat (birthday party hat), messy (tufts and dirt when the cat needs brushing),
// blink (eyes closed), tail (tail swished to the side) and happy (^ ^ eyes) for the animation frames,
// look ("left" or "right") to make the pupils look to one side, and grey (grey hairs for old cats).
function drawCat(spriteName, colorName, coatName, eyesName, options = {}) {
  const sprite = SPRITES[spriteName];
  const hat = Boolean(options.hat && sprite.hat);
  const messy = Boolean(options.messy);
  const blink = Boolean(options.blink);
  const tail = Boolean(options.tail);
  const happy = Boolean(options.happy && sprite.happyEyes);
  const look = options.look === "left" || options.look === "right" ? options.look : "";
  const grey = Boolean(options.grey);
  const split = Boolean(options.split); // left half white, right half the given color and coat
  const key = [spriteName, colorName, coatName, eyesName, hat, messy, blink, tail, happy, look, grey, split].join("/");
  if (spriteCache[key]) return spriteCache[key];

  const color = CAT_COLORS[colorName] || CAT_COLORS.orange;
  const coat = coatName in CAT_COATS ? coatName : "solid";
  const eyes = CAT_EYES[eyesName] || CAT_EYES.black;

  const grid = sprite.art.map((row) => [...row]);
  if (look) lookAside(grid, look);
  if (happy) happyEyes(grid, sprite.happyEyes);
  else if (blink) closeEyes(grid);
  if (tail) swishTail(grid, sprite.regions);
  if (messy) makeMessy(grid);

  // Room above the sprite if the hat sticks out over the top.
  let top = 0;
  if (hat) {
    const [middle, bottom] = sprite.hat;
    const hatTop = bottom - PARTY_HAT.length + 1;
    top = Math.max(0, -hatTop);
    for (let i = 0; i < top; i++) grid.unshift(Array(grid[0].length).fill("."));
    PARTY_HAT.forEach((row, i) => {
      [...row].forEach((c, j) => {
        if (c !== ".") grid[hatTop + top + i][middle - 2 + j] = "hat:" + c;
      });
    });
  }

  const canvas = document.createElement("canvas");
  canvas.width = grid[0].length * SCALE;
  canvas.height = grid.length * SCALE;
  const ctx = canvas.getContext("2d");

  grid.forEach((row, y) => {
    row.forEach((letter, x) => {
      let fill;
      if (letter === ".") return;
      else if (letter === "K" || letter === "T" || letter === "hat:K") fill = color.outline;
      else if (letter.startsWith("hat:")) fill = HAT_COLORS[letter.slice(4)];
      else if (letter === "X") fill = mix(furColor("Y", x, y - top, color, coat, sprite.regions), DIRT, 0.55);
      else if (letter === "E") fill = eyes.left;
      else if (letter === "F") fill = eyes.right;
      else if (letter === "D") fill = eyes.pupil || color.outline;
      else if (letter === "C") fill = color.closedEyes;
      else if ("YOL".includes(letter)) {
        const leftHalf = split && x < grid[0].length / 2;
        fill = leftHalf
          ? furColor(letter, x, y - top, CAT_COLORS.white, "solid", sprite.regions)
          : furColor(letter, x, y - top, color, coat, sprite.regions);
        if (grey && isGreyHair(x, y - top, sprite.regions)) fill = mix(fill, GREY_HAIR, 0.75);
      }
      else fill = FIXED_COLORS[letter];
      ctx.fillStyle = fill;
      ctx.fillRect(x * SCALE, y * SCALE, SCALE, SCALE);
    });
  });

  return (spriteCache[key] = canvas.toDataURL());
}

// ---------- Flying visitors ----------

// Small animals that fly past now and then. Each has two wing frames that take turns.
const CRITTERS = {
  butterfly: {
    colors: { K: "#3a2440", p: "#e86aa8", y: "#f2d530" },
    frames: [
      [
        "..K...K..",
        "...K.K...",
        ".KK.K.KK.",
        "KpppKpppK",
        "KpyyKyypK",
        ".KppKppK.",
        "..KK.KK..",
      ],
      [
        "..K...K..",
        "...K.K...",
        "...KKK...",
        "..KpKpK..",
        "..KyKyK..",
        "..KpKpK..",
        "...KKK...",
      ],
    ],
  },
  bird: {
    colors: { K: "#1e2a44", b: "#4a8ad8", l: "#cfe3f7", o: "#f2a33a", e: "#1e2a44" },
    frames: [
      [
        "...KK.....",
        "...KbK....",
        "...KbbK.KK.",
        ".KKKbbbKbeK",
        "KbbbbbbbbbKo",
        ".KKllllllK.",
        "...KKKKKK...",
      ],
      [
        ".........",
        ".........",
        "........KK.",
        ".KKKKKKKbeK",
        "KbbbbbbbbbKo",
        ".KKlbbbllK.",
        "...KbbKKK...",
        "....KK......",
      ],
    ],
  },
  bee: {
    colors: { K: "#2a2018", y: "#f2c230", w: "#e8f4ff" },
    frames: [
      [
        ".KK.KK..",
        "KwwKwwK.",
        ".KKKKK..",
        "KyKyKyK.",
        "KyKyKyKK",
        ".KKKKK..",
      ],
      [
        "........",
        "........",
        ".KKKKK..",
        "KyKyKyK.",
        "KyKyKyKK",
        ".KwwKwwK",
        "..KK.KK.",
      ],
    ],
  },
};

// Visitors are drawn with smaller pixels than the cat, so they look further away.
const CRITTER_SCALE = 5;

// Returns an image URL of one wing frame of a flying visitor.
function drawCritter(name, frame) {
  const key = "critter/" + name + "/" + frame;
  if (spriteCache[key]) return spriteCache[key];
  const { colors, frames } = CRITTERS[name];
  const art = frames[frame];
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(...art.map((row) => row.length)) * CRITTER_SCALE;
  canvas.height = art.length * CRITTER_SCALE;
  const ctx = canvas.getContext("2d");
  art.forEach((row, y) => {
    [...row].forEach((letter, x) => {
      if (!colors[letter]) return;
      ctx.fillStyle = colors[letter];
      ctx.fillRect(x * CRITTER_SCALE, y * CRITTER_SCALE, CRITTER_SCALE, CRITTER_SCALE);
    });
  });
  return (spriteCache[key] = canvas.toDataURL());
}

// ---------- Family tree button ----------

// A little pixel tree. g leaves, l light leaves, K outline, t trunk.
const TREE_ICON = [
  "...KKKK...",
  "..KglggK..",
  ".KggggglK.",
  "KgglgggggK",
  "KggggglggK",
  ".KglggggK.",
  "..KKKtKK..",
  "....Kt....",
  "....Kt....",
  "...KKttK..",
];
const TREE_COLORS = { K: "#2f4a24", g: "#4f9a3a", l: "#7fc95a", t: "#8a5a2b" };

function drawTreeIcon() {
  const key = "tree-icon";
  if (spriteCache[key]) return spriteCache[key];
  const scale = 4;
  const canvas = document.createElement("canvas");
  canvas.width = TREE_ICON[0].length * scale;
  canvas.height = TREE_ICON.length * scale;
  const ctx = canvas.getContext("2d");
  TREE_ICON.forEach((row, y) => {
    [...row].forEach((letter, x) => {
      if (!TREE_COLORS[letter]) return;
      ctx.fillStyle = TREE_COLORS[letter];
      ctx.fillRect(x * scale, y * scale, scale, scale);
    });
  });
  return (spriteCache[key] = canvas.toDataURL());
}
