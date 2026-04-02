// Basic Display Elements
const playersSection = document.getElementById('players');
const operationsDisplay = document.getElementById('operations-display');
const initialNumberSection = document.getElementById('initial-number');

// Control Group Elements
const controlsSection = document.getElementById('controls');
const finalNumberSection = document.getElementById('final-number');
const initialNumberInput = document.getElementById('initial-number-input');
const operationsSection = document.getElementById('operations');
const startButton = document.getElementById('start-button');
const durationSlider= document.getElementById('duration');

// Operation Buttons and Elements
const addButton = document.getElementById('add');
const subtractButton = document.getElementById('diff');
const multiplyButton = document.getElementById('mul');
const divideButton = document.getElementById('div');
const powerButton = document.getElementById('pow');
const valueInput = document.getElementById('operation-value');
const resetButton = document.getElementById('reset-operation');

addButton.addEventListener('click', () => addOperation('+', valueInput.value));
subtractButton.addEventListener('click', () => addOperation('-', valueInput.value));
multiplyButton.addEventListener('click', () => addOperation('*', valueInput.value));
divideButton.addEventListener('click', () => addOperation('/', valueInput.value));
powerButton.addEventListener('click', () => addOperation('^', valueInput.value));
resetButton.addEventListener('click', () => {
    operationsDisplay.dataset.operations = '';
    operationsDisplay.textContent = "Operations:\n";
    finalNumberSection.innerHTML = "<h2>Final Number</h2>\n";
});

function updatePlayerList(players) {
    playersSection.innerHTML = '<h2>Players</h2>';
    const list = document.createElement('ul');
    for (const player in players) {
        const item = document.createElement('li');
        item.textContent = `${player}: ${players[player]} points`;
        list.appendChild(item);
    }
    playersSection.appendChild(list);
}

function updateOperations(operations) {
    if (operations.length === 0) {
        operationsDisplay.textContent = "No operations yet.";
        return;
    }
    console.log("Updating operations display with:", operations);
    var num=initialNumberInput.value;
    operationsDisplay.textContent = "Operations:\n";
    for (const op of operations.split(',')) { // Starts from the second one because it always starts with a comma
        operationsDisplay.textContent += `${op}`;
        const operator = op[0];
        const operand = parseFloat(op.slice(1));
        if (operator === '+') {
            num = parseInt(num) + operand;
        } else if (operator === '-') {
            num = parseInt(num) - operand;
        } else if (operator === '*') {
            num = parseInt(num) * operand;
        } else if (operator === '/') {
            num = parseInt(num) / operand;
        } else if (operator === '^') {
            num = Math.pow(parseInt(num), operand);
        }
    }
    finalNumberSection.innerHTML = "<h2>Final Number</h2>\n"+num;
}

function addOperation(operation, operand) {
    if (operand === '' || isNaN(operand)) {
        alert('Please enter a valid number for the operation.');
        return;
    }   
    operationsDisplay.dataset.operations += `,${operation}${operand}`;
}

function getOperations() {
    return operationsDisplay.dataset.operations.slice(1);
}

startButton.addEventListener('click', () => {
    const initialNumber = initialNumberInput.value;
    if (initialNumber === '' || isNaN(initialNumber)) {
        alert('Please enter a valid initial number.');
        return;
    }
    fetch('/multiplayer/start', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            current_number: initialNumber,
            operations: getOperations(),
            duration: durationSlider.value,
            admin_id:window.location.href.split('/').pop() // Grabs the admin link that allowed it in the first place
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            alert('Game started successfully!');
        } else {
            alert('Error starting game: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while starting the game.');
    });
});


function waitForGameStart() {
    fetch('/multiplayer/status')
        .then(response => response.json())
        .then(data => {
            updatePlayerList(data.players);
            updateOperations(getOperations());
        });
    setTimeout(waitForGameStart, 1000);
}

waitForGameStart();