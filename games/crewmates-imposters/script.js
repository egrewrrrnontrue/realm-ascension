// Game State
let gameState = {
    players: [],
    round: 1,
    gameActive: false,
    meetingCalled: false,
    votedOut: []
};

// Player Roles
class Player {
    constructor(id, name, role) {
        this.id = id;
        this.name = name;
        this.role = role; // 'crewmate' or 'imposter'
        this.alive = true;
        this.completedTask = false;
    }
}

// Start Game
function startGame() {
    const playerCount = parseInt(document.getElementById('playerCount').value);
    const imposterCount = parseInt(document.getElementById('imposterCount').value);

    if (imposterCount >= playerCount) {
        alert('Imposters must be less than total players!');
        return;
    }

    // Create players
    gameState.players = [];
    gameState.round = 1;
    gameState.votedOut = [];

    for (let i = 0; i < playerCount; i++) {
        const role = i < imposterCount ? 'imposter' : 'crewmate';
        gameState.players.push(new Player(i, `Player ${i + 1}`, role));
    }

    // Shuffle players
    gameState.players.sort(() => Math.random() - 0.5);

    gameState.gameActive = true;

    // Show game screen
    switchScreen('gameScreen');
    updateGameDisplay();
}

// Update Game Display
function updateGameDisplay() {
    // Update round counter
    document.getElementById('roundCounter').textContent = gameState.round;

    // Update players list
    const crewmatesList = document.getElementById('crewmatesList');
    const impostersList = document.getElementById('impostersList');

    crewmatesList.innerHTML = '';
    impostersList.innerHTML = '';

    gameState.players.forEach(player => {
        if (!gameState.votedOut.includes(player.id)) {
            const playerEl = document.createElement('div');
            playerEl.className = `player ${player.role} ${!player.alive ? 'dead' : ''}`;
            playerEl.textContent = player.name + (player.completedTask ? ' ✓' : '');

            if (player.role === 'crewmate') {
                crewmatesList.appendChild(playerEl);
            } else {
                impostersList.appendChild(playerEl);
            }
        }
    });

    // Update tasks
    const tasksList = document.getElementById('tasksList');
    tasksList.innerHTML = '';

    const tasks = ['Fix Wires', 'Scan Card', 'Submit Samples', 'Empty Trash', 'Water Plants', 'Refuel Engine'];
    tasks.forEach((task, index) => {
        const taskEl = document.createElement('div');
        taskEl.className = 'task';
        taskEl.textContent = task;
        taskEl.onclick = () => completeTask(index, taskEl);
        tasksList.appendChild(taskEl);
    });
}

// Complete Task
function completeTask(index, element) {
    element.classList.add('completed');
    element.onclick = null;

    // Mark a random crewmate as completed
    const crewmates = gameState.players.filter(p => p.role === 'crewmate' && p.alive);
    if (crewmates.length > 0) {
        const randomCrewmate = crewmates[Math.floor(Math.random() * crewmates.length)];
        randomCrewmate.completedTask = true;
    }

    // Check win condition
    checkWinCondition();
}

// Call Meeting
function callMeeting() {
    gameState.meetingCalled = true;
    switchScreen('meetingScreen');

    // Create voting list
    const votingList = document.getElementById('votingList');
    votingList.innerHTML = '';

    gameState.players
        .filter(p => !gameState.votedOut.includes(p.id) && p.alive)
        .forEach(player => {
            const voteBtn = document.createElement('button');
            voteBtn.className = 'vote-btn';
            voteBtn.textContent = player.name;
            voteBtn.onclick = () => voteOut(player.id);
            votingList.appendChild(voteBtn);
        });
}

// Vote Out Player
function voteOut(playerId) {
    const player = gameState.players.find(p => p.id === playerId);
    gameState.votedOut.push(playerId);
    player.alive = false;

    // Show results
    const voteResults = document.getElementById('voteResults');
    const role = player.role === 'imposter' ? '👹 IMPOSTER' : '👤 Crewmate';
    voteResults.innerHTML = `<p><strong>${player.name}</strong> was voted out!</p><p>${role}</p>`;

    setTimeout(() => {
        gameState.meetingCalled = false;
        switchScreen('gameScreen');
        updateGameDisplay();
        checkWinCondition();
    }, 2000);
}

// Skip Vote
function skipVote() {
    const voteResults = document.getElementById('voteResults');
    voteResults.innerHTML = '<p>Vote skipped!</p>';

    setTimeout(() => {
        gameState.meetingCalled = false;
        switchScreen('gameScreen');
        updateGameDisplay();
    }, 1500);
}

// End Round
function endRound() {
    gameState.round++;
    updateGameDisplay();
}

// Check Win Condition
function checkWinCondition() {
    const aliveCrewmates = gameState.players.filter(
        p => p.role === 'crewmate' && p.alive && !gameState.votedOut.includes(p.id)
    );
    const aliveImposters = gameState.players.filter(
        p => p.role === 'imposter' && p.alive && !gameState.votedOut.includes(p.id)
    );

    let winner = null;

    // All imposters dead = Crewmates win
    if (aliveImposters.length === 0) {
        winner = 'crewmates';
    }
    // Imposters >= Crewmates = Imposters win
    else if (aliveImposters.length >= aliveCrewmates.length) {
        winner = 'imposters';
    }

    if (winner) {
        endGame(winner);
    }
}

// End Game
function endGame(winner) {
    gameState.gameActive = false;

    const title = document.getElementById('gameOverTitle');
    const content = document.getElementById('gameOverContent');

    if (winner === 'crewmates') {
        title.textContent = '🎉 Crewmates Win!';
        title.style.color = '#5cb85c';
        content.innerHTML = '<p class="winner">The crew successfully identified all imposters!</p>';
    } else {
        title.textContent = '👹 Imposters Win!';
        title.style.color = '#d9534f';
        content.innerHTML = '<p class="winner imposters">The imposters have taken over the ship!</p>';
    }

    // Show all imposters
    content.innerHTML += '<p><strong>Imposters were:</strong></p>';
    const imposters = gameState.players.filter(p => p.role === 'imposter');
    imposters.forEach(imp => {
        content.innerHTML += `<p>👹 ${imp.name}</p>`;
    });

    switchScreen('gameOverScreen');
}

// Reset Game
function resetGame() {
    gameState = {
        players: [],
        round: 1,
        gameActive: false,
        meetingCalled: false,
        votedOut: []
    };
    switchScreen('setupScreen');
}

// Switch Screen
function switchScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}
