<?php

class Cat {
  public $name;
  public $age;
}

?>
<?php
session_start();
 if (!isset($_SESSION["cat_name"])) {
   $_SESSION["cat_name"] = "Cat";
   }
   
 if (!isset($_SESSION["cat_name"])) {
   $_SESSION["cat_name"] = "Cat";
   }
 if(isset($_POST["cat_name"])) {
 error_log("gjfjhfjfj");
   $_SESSION["cat_name"] = $_POST["cat_name"];
 }
 
// Create Cat's starting stats
if (!isset ($_SESSION["hunger"])) {
  $_SESSION["hunger"] = 40;
  $_SESSION["happiness"] = 70;
  $_SESSION["message"] = ($_SESSION["cat_name"]) . " is relaxing";
  $_SESSION["energy"] = 90;
  $_SESSION["mood"] = "Neutral";
  $_SESSION["lives"] = 3;
}

$action = "time_passed";
// Handle button clicks
if ($_SERVER["REQUEST_METHOD"] === "POST") {
  $action = $_POST["action"] ?? "";
}

if ($action === "feed") {
  $_SESSION["activity"] = "neutral";
  $_SESSION["hunger"] = max(0, $_SESSION["hunger"] - 20);
  $_SESSION["happiness"] = min(100, $_SESSION["happiness"] + 15);
  $_SESSION["message"] = ($_SESSION["cat_name"]) . " enjoyed their food!";
  $_SESSION["energy"] = min(100, $_SESSION["energy"] + 5);
}
elseif ($action === "play") {
  $_SESSION["activity"] = "playing";
  $_SESSION["happiness"] =min(100, $_SESSION["happiness"] + 15);
  $_SESSION["message"] = ($_SESSION["cat_name"]) . "  is playing!";
  $_SESSION["energy"] =max(0, $_SESSION["energy"] - 5);
  $_SESSION["hunger"] =min(100, $_SESSION["hunger"] + 5);
}
elseif ($action === "sleep") {
  $_SESSION["activity"] = "sleeping";
  $_SESSION["hunger"] = min(100, $_SESSION["hunger"] + 15);
  $_SESSION["happiness"] = min(100, $_SESSION["happiness"] + 5);
  $_SESSION["message"] = ($_SESSION["cat_name"]) . "  is taking a nap.";
  $_SESSION["energy"] = min(100, $_SESSION["energy"] + 30);
}
elseif ($action === "meow") {
  $_SESSION["activity"] = "neutral";
  $_SESSION["message"] = ($_SESSION["cat_name"]) . "  says: Meow!";
  $_SESSION["happiness"] = min(100, $_SESSION["happiness"] + 5);
}
elseif ($action === "reset") {
  $_SESSION["activity"] = "neutral";
  $_SESSION["hunger"] = 40;
  $_SESSION["happiness"] = 70;
  $_SESSION["message"] = ($_SESSION["cat_name"]) . "  is relaxing.";
  $_SESSION["energy"] = 90;
  $_SESSION["lives"] = 3;
  
  unset ($_SESSION["life_lost"]);
  $_SESSION["message"] = ($_SESSION["cat_name"]) . "  is relaxing.";
}
elseif ($action === "time_passed") {
  $_SESSION["hunger"] = min(100, $_SESSION["hunger"] + 2);
  $_SESSION["happiness"] = max(0, $_SESSION["happiness"] - 2);
  $_SESSION["energy"] = max(0, $_SESSION["energy"] - 2);
}
elseif ($action === "save_settings") {
 $new_name = trim($_POST["cat_name"] ?? "");
  $new_age = filter_var($_POST["cat_age"] ?? "", FILTER_VALIDATE_INT);
  
if ($new_name !== "" && $new_age !== null && $new_age >= 0 && $new_age <= 30) {
  $_SESSION["cat_name"] = $new_name;
  $_SESSION["cat_age"] = $new_age;
  $_SESSION["message"] = "Settings saved!";
 } else {
 $_SESSION["message"] = "Please enter a name and an age from 0 to 30.";
 }
}
// If Cat is very hungry, happiness decreases
if ($_SESSION["hunger"] > 80) {
  $_SESSION["happiness"] = max(0, $_SESSION["happiness"] - 15);
}
// Check if Cat loses a life
if (
  ($_SESSION["hunger"] >= 100) &&
  ($_SESSION["happiness"] <= 0) &&
  ($_SESSION["energy"] <= 0)
  ) {
  error_log($_SESSION["lives"]);
  $_SESSION["lives"] = max(0, $_SESSION["lives"] - 1);
  error_log($_SESSION["lives"]);
  $_SESSSION["life_lost"] = true;
  $_SESSSION["message"] = ($_SESSION["cat_name"]) . "  lost a life!";
  }
 
 // Check if game is over
 if ($_SESSION["lives"] <= 0) {
   $_SESSION["message"] = "GAME OVER! " . $_SESSION["cat_name"] . " ran out of lives.";
   }
// Save the stats in variables
$cat = new Cat();

$cat->name = $_SESSION["cat_name"];
$cat->age = $_SESSION["cat_age"];

  $hunger = $_SESSION["hunger"];
  $happiness = $_SESSION["happiness"];
  $message = $_SESSION["message"];
  $energy = $_SESSION["energy"];
  $lives = $_SESSION["lives"];
  $cat_name = $_SESSION["cat_name"];
  $cat_age = $_SESSION["cat_age"];


$mood = [];
$emoji = [];

// Determine Cat's mood
if ($hunger >= 80) {
  $mood[] = "Very hungry";
  $emoji[] = "🍴️";
}
if ($happiness <= 20) {
  $mood[] = "Sad";
  $emoji[] = "💙️";
}
if ($happiness >= 80) {
  $mood[] = "Very happy";
  $emoji[] = "❤️";
}
if ($energy <= 20) {
  $mood[] = "Sleepy";
  $emoji[] = "💤️";
}
if (($happiness >= 30) && ($happiness <= 70)) {
  $mood[] = "Neutral";
  $emoji[] = "☁️";
}
// Choose Cat's picture
$image = "neutral-happy-hungry.png";
// Playing takes priority when they are playing
if (($_SESSION["activity"]??"") === "playing") {
  $image = "playing.png";
  }
if (($_SESSION["activity"]??"") === "sleeping") {
  $image = "sleepy-sleeping.png";
  }
 elseif ($_SESSION["lives"] < 3) {
   $image = "sad-losesaheart.png";
   }
elseif ($mood === "Sad") {
  $image = "sad-losesaheart.png";
  }
elseif ($mood === "Sleepy") {
 $image = "sleepy-sleeping.png";
}
?>
<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Refresh" content="35" />
<title>Cat Game</title>
<link rel="stylesheet" href="style.css">
</head>
<body>
<div class="game">
<?php if ($_SESSION["lives"] > 0): ?>
<h1><?php echo htmlspecialchars($cat_name); ?></h1>
<p> 
Age: <?php echo (int)$cat_age; ?>
</p>
<h3>Mood: <?php echo implode(", ", $mood); ?></h3>
<h3> <?php echo implode(", ", $emoji); ?></h3>
<h3>Hunger: <?php echo $hunger; ?>%</h3>
<div class="bar">
<div class="hunger"
style="width: <?php echo $hunger; ?>%">
</div>    
</div>
<h3>Happiness: <?php echo $happiness; ?>%</h3>
<div class="bar">
<div class="happy"
style="width: <?php echo $happiness; ?>%">
</div>
</div>
<h3>Energy: <?php echo $energy; ?>%</h3>
<div class="bar">
<div class="energy"
style="width: <?php echo $energy; ?>%">
</div>
</div>
<p class="message">
<?php echo htmlspecialchars($message); ?>
<h3>Lives <?php echo $lives ?>:</h3>
<p>
  <?php
  echo str_repeat("❤️", $lives);
  echo str_repeat("💔️", 3 - $lives);
  ?>
 </p>
 
 <img src="<?php echo htmlspecialchars($image); ?>" alt+"Cat">
 
<form method="POST">
<button name="action" value="feed">
Feed <?php echo htmlspecialchars($_SESSION["cat_name"]); ?>
</button>
<button name="action" value="play">
Play with <?php echo htmlspecialchars($_SESSION["cat_name"]); ?>
</button>
<button name="action" value="sleep">
Sleep
</button>
<button name="action" value="meow">
Meow
</button>
<button name="action" value="reset">
Reset
</button>
</form>
<?php else: ?>
  <h1>GAME OVER</h1>
  <h2>💔️ <?php echo htmlspecialchars($cat_name); ?> ran out of lives 💔️</h2>
  <form method="POST">
    <button name="action" value="reset">
      Restart Game
    </button>
  </form>
  
<?php endif; ?>
<h2>Cat Settings</h2>
<form method="POST">
  <input type="hidden" name="action" value="save_settings">
  <label>Cat's name:</label>
  <input
    type="text"
    name="cat_name"
    value="<?php echo htmlspecialchars ($cat_name); ?>"
    maxlength="30"
    required
 >
  <label>Cat's age</label>
  <input
    type="number"
    name="cat_age"
    value="<?php echo htmlspecialchars ($cat_age); ?>"
    min="0"
    max="30"
    required
<br><br>
  <button type="submit">Save Settings</button>
  </form>
 
</div>
</body>
</html>
