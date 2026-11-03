<?php

class Cat {
  public $name;
  public $age;
}
$athena = new Cat();

$athena->name = "Athena";
$athena->age = 3;

?>
<?php
session_start();

// Create Athena's starting stats
if (!isset ($_SESSION["hunger"])) {
  $_SESSION["hunger"] = 40;
  $_SESSION["happiness"] = 70;
  $_SESSION["message"] = "Athena is relaxing";
  $_SESSION["energy"] = 90;
  $_SESSION[$mood] = "Neutral";
  $_SESSION["lives"] = 3;
}

$action = "time_passed";
// Handle button clicks
if ($_SERVER["REQUEST_METHOD"] === "POST") {
  $action = $_POST["action"] ?? "";
}

if ($action === "feed") {
  $_SESSION["hunger"] = max(0, $_SESSION["hunger"] - 20);
  $_SESSION["happiness"] = min(100, $_SESSION["happiness"] + 15);
  $_SESSION["message"] = "Athena enjoyed her food!";
  $_SESSION["energy"] = min(100, $_SESSION["energy"] + 5);
}
elseif ($action === "play") {
  $_SESSION["happiness"] =min(100, $_SESSION["happiness"] + 15);
  $_SESSION["message"] = "Athena is playing!";
  $_SESSION["energy"] =max(0, $_SESSION["energy"] - 5);
  $_SESSION["hunger"] =min(100, $_SESSION["hunger"] + 5);
}
elseif ($action === "sleep") {
  $_SESSION["hunger"] = min(100, $_SESSION["hunger"] + 15);
  $_SESSION["happiness"] = min(100, $_SESSION["happiness"] + 5);
  $_SESSION["message"] = "Athena is taking a nap.";
  $_SESSION["energy"] = min(100, $_SESSION["energy"] + 30);
}
elseif ($action === "meow") {
  $_SESSION["message"] = "Athena says: Meow!";
  $_SESSION["happiness"] = min(100, $_SESSION["happiness"] + 5);
}
elseif ($action === "reset") {
  $_SESSION["hunger"] = 40;
  $_SESSION["happiness"] = 70;
  $_SESSION["message"] = "Athena is relaxing.";
  $_SESSION["energy"] = 90;
  $_SESSION["lives"] = 3;
  
  unset ($_SESSION["life_lost"]);
  $_SESSION["message"] = "Athena is relaxing";
}
elseif ($action === "time_passed") {
  $_SESSION["hunger"] = min(100, $_SESSION["hunger"] + 2);
  $_SESSION["happiness"] = max(0, $_SESSION["happiness"] - 2);
  $_SESSION["energy"] = max(0, $_SESSION["energy"] - 2);
}

// If Athena is very hungry, happiness decreases
if ($_SESSION["hunger"] > 80) {
  $_SESSION["happiness"] = max(0, $_SESSION["happiness"] - 15);
}
// Check if Athena loses a life
if (
  ($_SESSION["hunger"] >= 100) &&
  ($_SESSION["happiness"] <= 0) &&
  ($_SESSION["energy"] <= 0)
  ) {
  error_log($_SESSION["lives"]);
  $_SESSION["lives"] = max(0, $_SESSION["lives"] - 1);
  error_log($_SESSION["lives"]);
  $_SESSSION["life_lost"] = true;
  $_SESSSION["message"] = "Athena lost a life!";
  }
 
 // Check if game is over
 if ($_SESSION["lives"] <= 0) {
   $_SESSION["message"] = "GAME OVER! Athena ran out of lives.";
   }
// Save the stats in variables
  $hunger = $_SESSION["hunger"];
  $happiness = $_SESSION["happiness"];
  $message = $_SESSION["message"];
  $energy = $_SESSION["energy"];
  $lives = $_SESSION["lives"];


$mood = [];
$emoji = [];

// Determine Athena's mood
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



?>
<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Refresh" content="5" />
<title>Athena's Cat Game</title>
<link rel="stylesheet" href="style.css">
</head>
<body>
<div class="game">
<?php if ($_SESSION["lives"] > 0): ?>
<h1>Athena</h1>
<p>Cat &middot; 3 years old</p>
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
<form method="POST">
<button name="action" value="feed">
Feed Athena
</button>
<button name="action" value="play">
Play with Athena
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
  <h2>💔️ Athena ran out of lives 💔️</h2>
  <form method="POST">
    <button name="action" value="reset">
      Restart Game
    </button>
  </form>
  
<?php endif; ?>

</div>
</body>
</html>
