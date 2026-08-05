// Basic Display Elements
const playersSection = document.getElementById("players");
const operationsDisplay = document.getElementById("operations-display");
const initialNumberSection = document.getElementById("initial-number");
const correctPlayers = document.getElementById("correct-players");
const currentNumber = document.getElementById("current-number");
const currentOperation = document.getElementById("current-operation");

// Control Group Elements
const controlsSection = document.getElementById("controls");
const finalNumberSection = document.getElementById("final-number");
const initialNumberInput = document.getElementById("initial-number-input");
const operationsSection = document.getElementById("operations");
const startButton = document.getElementById("start-button");
const durationSlider = document.getElementById("duration");
const presetText = document.getElementById("preset");

// Operation Buttons and Elements
const addButton = document.getElementById("add");
const subtractButton = document.getElementById("diff");
const multiplyButton = document.getElementById("mul");
const divideButton = document.getElementById("div");
const powerButton = document.getElementById("pow");
const valueInput = document.getElementById("operation-value");
const resetButton = document.getElementById("reset-operation");

const admin_id = window.location.href.split("/").pop();

addButton.addEventListener("click", () => addOperation("+", valueInput.value));
subtractButton.addEventListener("click", () =>
  addOperation("-", valueInput.value),
);
multiplyButton.addEventListener("click", () =>
  addOperation("*", valueInput.value),
);
divideButton.addEventListener("click", () =>
  addOperation("/", valueInput.value),
);
powerButton.addEventListener("click", () =>
  addOperation("^", valueInput.value),
);
resetButton.addEventListener("click", () => {
  operationsDisplay.dataset.operations = "";
  operationsDisplay.textContent = "Operations:\n";
  finalNumberSection.innerHTML = "<h2>Final Number</h2>\n";
});

presetText.addEventListener("change", () => {
  const presetValue = presetText.value.split(";"); // ; is the split for the initial number and preset like: 39;/3,+9
  const initialNumber = presetValue[0];
  const operations = presetValue[1];
  initialNumberInput.value = initialNumber;
  operationsDisplay.dataset.operations = operations;
  updateOperations(operations);
});

function updatePlayerList(players) {
  playersSection.innerHTML = "<h2>Players</h2>";
  const list = document.createElement("ul");
  for (const player in players) {
    const item = document.createElement("li");
    const removeButton = document.createElement("button");

    removeButton.textContent = "Remove";

    removeButton.addEventListener("click", () => {
      const reasonPrompt = prompt("Why do you want to remove this player?");
      const reason = reasonPrompt ? reasonPrompt.trim() : null;
      if (!reason) {
        reason = "No reason provided";
      }
      fetch("/admin/remove_player", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          admin_id: admin_id,
          player_name: player,
          reason: reason,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.status === "success") {
            updatePlayerList(data.players);
          } else {
            alert(data.message);
          }
        });
    });

    item.textContent = `${player}: ${players[player]} points`;
    list.appendChild(item);
    list.appendChild(removeButton);
  }
  playersSection.appendChild(list);
}

function updateOperations(operations) {
  if (operations.length === 0) {
    operationsDisplay.textContent = "No operations yet.";
    return;
  }

  console.log("Updating operations display with:", operations);
  var num = initialNumberInput.value;
  operationsDisplay.textContent = "Operations:\n";
  for (const op of operations.split(",")) {
    // Starts from the second one because it always starts with a comma
    operationsDisplay.textContent += `${op}`;
    const operator = op[0];
    const operand = parseFloat(op.slice(1));
    if (operator === "+") {
      num = parseInt(num) + operand;
    } else if (operator === "-") {
      num = parseInt(num) - operand;
    } else if (operator === "*") {
      num = parseInt(num) * operand;
    } else if (operator === "/") {
      num = parseInt(num) / operand;
    } else if (operator === "^") {
      num = Math.pow(parseInt(num), operand);
    }
  }
  if (operations[0] == ",") {
    operations = operations.slice(1);
  }
  // Save as a preset
  presetText.value = `${initialNumberInput.value};${operations}`;
  finalNumberSection.innerHTML = "<h2>Final Number</h2>\n" + num;
}

function addOperation(operation, operand) {
  if (operand === "" || isNaN(operand)) {
    alert("Please enter a valid number for the operation.");
    return;
  }
  operationsDisplay.dataset.operations += `,${operation}${operand}`;
}

function getOperations() {
  var operations = operationsDisplay.dataset.operations;
  if (operations[0] == ",") {
    operations = operations.slice(1);
  }
  return operations;
}

startButton.addEventListener("click", () => {
  const initialNumber = initialNumberInput.value;
  if (initialNumber === "" || isNaN(initialNumber)) {
    alert("Please enter a valid initial number.");
    return;
  }
  fetch("/multiplayer/start", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      current_number: initialNumber,
      operations: getOperations(),
      duration: durationSlider.value,
      admin_id, // Grabs the admin link that allowed it in the first place
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.status === "success") {
        alert("Game started successfully!");
      } else {
        alert("Error starting game: " + data.message);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("An error occurred while starting the game.");
    });
});

const operators = {
  "+": "Add it by",
  "-": "Subtract it by",
  "*": "Multiply it by",
  "/": "Divide it by",
  "^": "Raised to",
};

function current_number_status(msg, iteration = null) {
  op = msg[0];
  value = msg.slice(1);
  if (operators[op]) {
    currentOperation.textContent = `${iteration}. ${operators[op]} ${value}`;
  } else {
    currentOperation.textContent = msg;
  }
}

function updateStatus(data) {
  correctPlayers.innerHTML = "<h2>Correct Players</h2>\n";
  for (const player in data.correct_players) {
    const item = document.createElement("li");
    if (data.correct_players[player] === true) {
      item.textContent = `${player}`;
    }
    correctPlayers.appendChild(item);
  }

  current_number_status(`${data.current_operation}`, data.iteration);
  currentNumber.innerHTML = "<h2>Current Number</h2>\n" + data.current_number;
}

function waitForGameStart() {
  fetch("/multiplayer/admin/status", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ admin_id }),
  })
    .then((response) => response.json())
    .then((data) => {
      updatePlayerList(data.players);
      updateOperations(operationsDisplay.dataset.operations);
      updateStatus(data);
    });
  setTimeout(waitForGameStart, 1000);
}

waitForGameStart();
