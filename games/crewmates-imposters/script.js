// Game State
let gameState = {
    players: [],
    round: 1,
    gameActive: false,
    meetingCalled: false,
    votedOut: [],
    map: {
        width: 800,
        height: 600,
        rooms: []
    }
};

// Room Class for Map
class Room {
    constructor(name, x, y, width, height, color) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.tasks = [];
    }

    contains(px, py) {
        return px > this.x && px < this.x + this.width && py > this.y && py < this.y + this.height;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);

        // Draw room name
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.name, this.x + this.width / 2, this.y + this.height / 2);
    }
}

// Player Class
class Player {
    constructor(id, name, role) {
        this.id = id;
        this.name = name;
        this.role = role;
        this.alive = true;
        this.completedTask = false;
        this.x = Math.random() * (gameState.map.width - 30);
        this.y = Math.random() * (gameState.map.height - 30);
        this.radius = 15;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off walls
        if (this.x - this.radius < 0 || this.x + this.radius > gameState.map.width) {
            this.vx *= -1;
        }
        if (this.y - this.radius < 0 || this.y + this.radius > gameState.map.height) {
            this.vy *= -1;
        }

        // Keep in bounds
        this.x = Math.max(this.radius, Math.min(gameState.map.width - this.radius, this.x));
        this.y = Math.max(this.radius, Math.min(gameState.map.height - this.radius, this.y));
    }

    draw(ctx) {
        if (!this.alive) return;

        // Draw player circle
        ctx.fillStyle = this.role === 'crewmate' ? '#5cb85c' : '#d9534f';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Draw outline
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw name
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.name.substring(0, 2), this.x, this.y + 3);
    }
}

// Initialize Map
function initializeMap() {
    gameState.map.rooms = [
        new Room('Cafeteria', 20, 20, 150, 150, '#3498db'),
        new Room('Upper Engine', 200, 20, 150, 150, '#e74c3c'),
        new Room('Reactor', 380, 20, 150, 150, '#f39c12'),
        new Room('Security', 560, 20, 220, 150, '#9b59b6'),
        new Room('Shields', 20, 200, 150, 150, '#1abc9c'),
        new Room('Medbay', 200, 200, 150, 150, '#16a085'),
        new Room('Comms', 380, 200, 150, 150, '#2980b9'),
        new Room('Storage', 560, 200, 220, 150, '#27ae60'),
        new Room('Electrical', 20, 380, 150, 150, '#c0392b'),
        new Room('Lower Engine', 200, 380, 150, 150, '#8e44ad'),
        new Room('Ventilation', 380, 380, 150, 150, '#34495e'),
        new Room('Admin', 560, 380, 220, 150, '#d35400')
    ];
}

// Draw Map
function drawMap() {
    const canvas = document.getElementById('gameMap');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Clear canvas
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(0, 0, gameState.map.width, gameState.map.height);

    // Draw rooms
    gameState.map.rooms.forEach(room => room.draw(ctx));

    // Update and draw players
    gameState.players.forEach(player => {
        if (player.alive) {
            player.update();
            player.draw(ctx);
        }
    });
}

// Animation loop
function animate() {
    if (gameState.gameActive && !gameState.meetingCalled) {
        drawMap();
        requestAnimationFrame(animate);
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

    // Initialize map
    initializeMap();

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
    drawMap();
    animate();
}

// Update Game Display
function updateGameDisplay() {
    document.getElementById('roundCounter').textContent = gameState.round;

    // Update player counts
    const crewmatesList = document.getElementById('crewmatesList');
    const impostersList = document.getElementById('impostersList');

    crewmatesList.innerHTML = '';
    impostersList.innerHTML = '';

    let crewmateCount = 0;
    let imposterCount = 0;

    gameState.players.forEach(player => {
        if (!gameState.votedOut.includes(player.id) && player.alive) {
            const playerEl = document.createElement('div');
            playerEl.className = `player ${player.role}`;
            playerEl.textContent = player.name;

            if (player.role === 'crewmate') {
                crewmatesList.appendChild(playerEl);
                crewmateCount++;
            } else {
                impostersList.appendChild(playerEl);
                imposterCount++;
            }
        }
    });

    document.getElementById('crewmateCount').textContent = crewmateCount;
    document.getElementById('imposterCount').textContent = imposterCount;

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

    const crewmates = gameState.players.filter(p => p.role === 'crewmate' && p.alive);
    if (crewmates.length > 0) {
        const randomCrewmate = crewmates[Math.floor(Math.random() * crewmates.length)];
        randomCrewmate.completedTask = true;
    }

    checkWinCondition();
}

// Call Meeting
function callMeeting() {
    gameState.meetingCalled = true;
    switchScreen('meetingScreen');

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

    const voteResults = document.getElementById('voteResults');
    const role = player.role === 'imposter' ? '👹 IMPOSTER' : '👤 Crewmate';
    voteResults.innerHTML = `<p><strong>${player.name}</strong> was voted out!</p><p>${role}</p>`;

    setTimeout(() => {
        gameState.meetingCalled = false;
        switchScreen('gameScreen');
        updateGameDisplay();
        drawMap();
        animate();
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
        drawMap();
        animate();
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

    if (aliveImposters.length === 0) {
        winner = 'crewmates';
    } else if (aliveImposters.length >= aliveCrewmates.length) {
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
        votedOut: [],
        map: {
            width: 800,
            height: 600,
            rooms: []
        }
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
