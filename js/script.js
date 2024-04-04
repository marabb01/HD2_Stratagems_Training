document.addEventListener('DOMContentLoaded', () => {
    initPageElements();
    setupGameControls();
});

function initPageElements() {
    const versionBanner = document.getElementById('version-banner');
    const feedbackLink = document.getElementById('feedback-link');

    if (versionBanner) versionBanner.textContent = `Version: ${APP_VERSION}`;
    if (feedbackLink) {
        feedbackLink.href = "https://github.com/marabb01/HD2_Stratagems_Training/issues";
        feedbackLink.target = "_blank";
        feedbackLink.textContent = "Feedback";
    }
}

function setupGameControls() {
    document.getElementById('controlToggle').addEventListener('change', stratagemSelection);
    document.addEventListener('keydown', event => {
        if (event.key === 'Enter' && canStartNewGame) stratagemSelection();
    });
}

let canStartNewGame = true;

function stratagemSelection() {
    canStartNewGame = false;
    const elementsToHide = ['feedback', 'trauma-guy', 'helldivers-logo'];
    elementsToHide.forEach(id => document.getElementById(id).style.display = 'none');

    const selectedStratagem = getStratagems()[Math.floor(Math.random() * getStratagems().length)];
    displayStratagemInfo(selectedStratagem);

    const gameSession = new GameSession(selectedStratagem.sequence);
    gameSession.init();
}

function displayStratagemInfo(stratagem) {
    document.getElementById('stratagem-name').textContent = stratagem.name;
    const iconElement = document.getElementById('stratagem-icon');
    iconElement.src = stratagem.icon;
    iconElement.style.display = 'block';

    const sequenceDisplay = document.getElementById('stratagem-display');
    sequenceDisplay.innerHTML = '';

    stratagem.sequence.forEach(direction => {
        const imgElement = createDirectionIcon(direction);
        sequenceDisplay.appendChild(imgElement);
    });
}

function createDirectionIcon(direction) {
    const isWASD = document.getElementById('controlToggle').checked;
    const img = document.createElement('img');
    img.src = isWASD ? `img/${direction.toLowerCase()}_icon.jpg` : `img/arrow_${direction.toLowerCase()}.jpg`;
    img.alt = direction;
    img.style.width = '50px';
    img.style.margin = '5px';
    return img;
}

class GameSession {
    constructor(correctInput) {
        this.correctInput = correctInput;
        this.currentInput = [];
        this.timerStarted = false;
        this.startTime = null;
        this.timerInterval = null;
    }

    init() {
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
    }

    handleKeyDown(event) {
        if (event.key === 'Enter') this.resetGameSession();

        const keyPressed = this.mapKey(event.key);
        if (!keyPressed) return;

        this.startTimerIfNeeded();

        this.currentInput.push(keyPressed);
        this.checkInputAccuracy();
    }

    startTimerIfNeeded() {
        if (!this.timerStarted) {
            this.startTime = performance.now();
            this.timerStarted = true;
            this.timerInterval = setInterval(() => this.updateTimer(), 10);
        }
    }

    updateTimer() {
        const elapsedTime = (performance.now() - this.startTime) / 1000;
        document.getElementById('timer').textContent = `Time: ${elapsedTime.toFixed(3)}s`;
    }

    checkInputAccuracy() {
        const currentIndex = this.currentInput.length - 1;
        const arrows = document.querySelectorAll('#stratagem-display img');

        if (this.correctInput[currentIndex] === this.currentInput[currentIndex]) {
            arrows[currentIndex].style.filter = 'drop-shadow(0 0 5px green)';
            if (this.currentInput.length === this.correctInput.length) this.endGame(true);
        } else {
            arrows[currentIndex].style.filter = 'drop-shadow(0 0 5px red)';
            this.endGame(false);
        }
    }

    endGame(isSuccess) {
        clearInterval(this.timerInterval);
        const feedback = document.getElementById('feedback');
        feedback.textContent = isSuccess ? "Correct - Press ENTER for another try!" : "Incorrect - Press ENTER for another try!";
        canStartNewGame = true;
        document.removeEventListener('keydown', this.handleKeyDown.bind(this));
    }

    resetGameSession() {
        if (canStartNewGame) stratagemSelection();
    }

    mapKey(keyPressed) {
        const isWASD = document.getElementById('controlToggle').checked;
        const keyMap = {
            w: 'Up', a: 'Left', s: 'Down', d: 'Right',
            ArrowUp: 'Up', ArrowDown: 'Down', ArrowLeft: 'Left', ArrowRight: 'Right'
        };
        return isWASD ? keyMap[keyPressed.toLowerCase()] : keyMap[keyPressed];
    }
}
