let canStartNewGame = true; // Boolean flag to control game start

// Add an event listener for the control toggle checkbox
document.getElementById('controlToggle').addEventListener('change', function() {
    if (canStartNewGame) {
        // Re-initialize the game to apply the new control scheme, if needed
        stratagemSelection();
    }
});

document.addEventListener('keydown', function(event) {
    if (event.key === 'Enter' && canStartNewGame) {
        stratagemSelection();
    }
});

function stratagemSelection() {
    canStartNewGame = false; // Prevent new game start
    document.removeEventListener('keydown', handleKeyDown);
    document.getElementById('feedback').textContent = '';
    document.getElementById('trauma-guy').style.display = 'none';
    document.getElementById('helldivers-logo').style.display = 'none';
    const stratagems = getStratagems()

    // Select a stratagem at random
    let selectedStratagem = stratagems[Math.floor(Math.random() * stratagems.length)];
    displayStratagemInfo(selectedStratagem);

    let startTime = performance.now()
    let correctInput = selectedStratagem.sequence;
    let currentInput = [];
    let timerStarted = false; // Flag to track if the timer has started

    // Update the timer every 100 milliseconds for accuracy
    let timerInterval; // Declare timerInterval here but don't start it yet

    document.getElementById('timer').textContent = ``

    document.addEventListener('keydown', handleKeyDown);

    function handleKeyDown(event) {
        if (event.key === 'Enter') return; // Ignore Enter key

        if (!timerStarted) {
            startTime = performance.now(); // Reset startTime at the first key press
            timerInterval = setInterval(function() { // Start the timer only once
                let elapsedTime = (performance.now() - startTime) / 1000; // Convert milliseconds to seconds
                document.getElementById('timer').textContent = `Time: ${elapsedTime.toFixed(3)}s`;
            }, 10);
            timerStarted = true; // Prevent the timer from starting again
        }

        let keyPressed = mapKey(event.key);

        if (currentInput.length < correctInput.length) {
            currentInput.push(keyPressed);
            let currentIndex = currentInput.length - 1;
            let arrows = document.querySelectorAll('#stratagem-display img');

            if (correctInput[currentIndex] === keyPressed) {
                arrows[currentIndex].style.filter = 'drop-shadow(0 0 5px green)';
            } else {
                arrows[currentIndex].style.filter = 'drop-shadow(0 0 5px red)';
                document.getElementById('feedback').textContent = "Incorrect - Press ENTER for another try!";
                document.removeEventListener('keydown', handleKeyDown);
                canStartNewGame = true; // Allow for new game start
                clearInterval(timerInterval); // Stop the timer
                return;
            }

            if (currentInput.length === correctInput.length) {
                clearInterval(timerInterval); // Stop the timer
                document.getElementById('feedback').textContent = `Correct - Press ENTER for another try!`;
                document.removeEventListener('keydown', handleKeyDown);
                canStartNewGame = true; // Allow for new game start
            }
        }
    }

    document.addEventListener('keydown', handleKeyDown);

    function mapKey(keyPressed) {
        let isWASD = document.getElementById('controlToggle').checked;
        if (isWASD) {
            switch (keyPressed) {
                case 'w':
                    return 'Up';
                case 'a':
                    return 'Left';
                case 's':
                    return 'Down';
                case 'd':
                    return 'Right';
                default:
                    return ''; // Ignore other keys
            }
        } else {
            switch (keyPressed) {
                case 'ArrowUp':
                    return 'Up';
                case 'ArrowDown':
                    return 'Down';
                case 'ArrowLeft':
                    return 'Left';
                case 'ArrowRight':
                    return 'Right';
                default:
                    return ''; // Ignore other keys
            }
        }
    }


    function displayStratagemInfo(stratagem) {
        document.getElementById('stratagem-name').textContent = stratagem.name;
        let iconElement = document.getElementById('stratagem-icon');
        iconElement.src = stratagem.icon;
        iconElement.style.display = 'block';

        let sequenceDisplay = document.getElementById('stratagem-display');
        let isWASD = document.getElementById('controlToggle').checked;
        sequenceDisplay.innerHTML = '';
        stratagem.sequence.forEach(direction => {
            let img = document.createElement('img');
            // Choose the icon set based on the control scheme
            img.src = isWASD ? `img/${direction.toLowerCase()}_icon.jpg` : `img/arrow_${direction.toLowerCase()}.jpg`;
            img.alt = direction;
            img.style.width = '50px';
            img.style.margin = '5px';
            sequenceDisplay.appendChild(img);
        });
    }
}