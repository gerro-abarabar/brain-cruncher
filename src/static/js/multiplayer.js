const titleElement = document.getElementById("title");
var adminName = "";
const playerName = localStorage.getItem("username") || "Unknown Player";
const playersElement = document.getElementById("players");
const setupSection = document.getElementById("setup-section");
const gameSection = document.getElementById("game-section");
const current_operation = document.getElementById("question-text");
const answerElement = document.getElementById("answer");
const submitButton = document.getElementById("submit-answer");
const scoreElement = document.getElementById("score");
var hasClicked = false;

function refreshState() {
  fetch("/get_admin_name")
    .then((response) => response.json())
    .then((data) => {
      adminName = data.admin_name;
      titleElement.textContent = `Hello, ${playerName}\n(Admin: ${adminName})`;
      document.title = `Brain Cruncher - ${playerName}`;
    });
  hasClicked = false;
  gameSection.style.display = "none";
  setupSection.style.display = "block";
  loopUntilStart();
}
const operators = {
  "+": "Add it by",
  "-": "Subtract it by",
  "*": "Multiply it by",
  "/": "Divide it by",
  "^": "Raised to",
};
function status(msg, iteration = null) {
  op = msg[0];
  value = msg.slice(1);
  if (operators[op]) {
    currentOperation.textContent = `${iteration}. ${operators[op]} ${value}`;
  } else {
    currentOperation.textContent = msg;
  }
}

function gameStarted(data) {
  submitButton.disabled = true;
  setupSection.style.display = "none";
  gameSection.style.display = "block";

  // Display the operations
  const operations = data.operations;
  const current_operation = data.current_operation;
  const duration = data.duration;
  const iteration = data.iteration;

  if (iteration == 0) {
    status("The number is: " + data.initial_number);
  } else {
    status(current_operation, iteration);
  }
  setTimeout(loopUntilStart, duration * 1000);
}

function loopUntilStart() {
  if (hasClicked) {
    // If the user has submitted their own submission,  they don't need to do it again.
    return;
  }
  fetch("/multiplayer/status")
    .then((response) => response.json())
    .then((data) => {
      if (data.started) {
        gameStarted(data);
      } else {
        // The game hasn't started yet
        // Display the players
        players = Object.keys(data.players);
        playersElement.textContent = document.createElement("p").textContent =
          "";
        for (let i = 0; i < players.length; i++) {
          // playersElement.appendChild(document.createElement("br"));
          playersElement.appendChild(document.createElement("p")).textContent =
            `- ${players[i]}`;
        }
        scoreElement.textContent = data.players[playerName]; // Display the player's score
        submitButton.disabled = false; // Allows the button to be clicked
        setTimeout(loopUntilStart, 2000); // Check again after 1 second
      }
    });
}

submitButton.addEventListener("click", () => {
  const answer = answerElement.value;
  hasClicked = true;
  const player_name = localStorage.getItem("username");
  submitButton.disabled = true; // disable when clicked
  status("Checking answer...");
  fetch("/multiplayer/answer", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ answer, player_name }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.status === "success") {
        status(data.message);
      } else {
        status(data.message);
      }
      setTimeout(refreshState, 5000);
    });
});

document.addEventListener("DOMContentLoaded", function () {
  refreshState(); // FIXME: multiplayer.js:39 Uncaught (in promise) ReferenceError: currentOperation is not defined
});
