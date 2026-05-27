// Game State
const gameState = {
    currentZone: 'grasslands',
    resources: {},
    buildings: {},
    upgrades: {},
    stats: {
        totalGathered: 0,
        buildingsBuilt: 0,
        timePlayedSeconds: 0
    }
};

// Zone Definitions
const zones = {
    grasslands: {
        name: 'Grasslands',
        description: 'The starting realm. Gather resources and build your first structures.',
        unlockedAt: 0,
        icon: '🌾',
        primaryAction: 'gather',
        primaryResource: 'grass',
        nextZone: 'forest',
        unlockRequirement: { wood: 50 }
    },
    forest: {
        name: 'Forest',
        description: 'Lush woodlands. Harvest timber and discover nature spirits.',
        unlockedAt: 50,
        icon: '🌲',
        primaryAction: 'chop',
        primaryResource: 'wood',
        nextZone: 'mountains',
        unlockRequirement: { wood: 200, stone: 100 }
    },
    mountains: {
        name: 'Mountains',
        description: 'Treacherous peaks hide valuable ore deposits.',
        unlockedAt: 200,
        icon: '⛰️',
        primaryAction: 'mine',
        primaryResource: 'ore',
        nextZone: 'caves',
        unlockRequirement: { ore: 150, wood: 300 }
    },
    caves: {
        name: 'Caves',
        description: 'Dark caverns filled with danger and rare crystals.',
        unlockedAt: 150,
        icon: '🕳️',
        primaryAction: 'delve',
        primaryResource: 'crystal',
        nextZone: 'temple',
        unlockRequirement: { crystal: 100, ore: 300 }
    },
    temple: {
        name: 'Lost Temple',
        description: 'Ancient ruins humming with magical energy.',
        unlockedAt: 100,
        icon: '🏛️',
        primaryAction: 'commune',
        primaryResource: 'essence',
        nextZone: null,
        unlockRequirement: { essence: 500 }
    }
};

// Resource Definitions
const resources = {
    grass: {
        name: 'Grass',
        icon: '🌿',
        zoneAvailable: ['grasslands'],
        initialAmount: 0
    },
    wood: {
        name: 'Wood',
        icon: '🪵',
        zoneAvailable: ['grasslands', 'forest'],
        initialAmount: 0
    },
    stone: {
        name: 'Stone',
        icon: '🪨',
        zoneAvailable: ['grasslands', 'mountains'],
        initialAmount: 0
    },
    ore: {
        name: 'Ore',
        icon: '⛏️',
        zoneAvailable: ['mountains'],
        initialAmount: 0
    },
    crystal: {
        name: 'Crystal',
        icon: '💎',
        zoneAvailable: ['caves'],
        initialAmount: 0
    },
    essence: {
        name: 'Essence',
        icon: '✨',
        zoneAvailable: ['temple'],
        initialAmount: 0
    }
};

// Building Definitions
const buildings = {
    woodcutter: {
        name: 'Woodcutter',
        icon: '👨‍🌾',
        description: 'Gathers wood passively',
        zone: 'forest',
        cost: { wood: 10 },
        production: { wood: 0.1 },
        count: 0
    },
    stoneMason: {
        name: 'Stone Mason',
        icon: '🔨',
        description: 'Quarries stone from the earth',
        zone: 'mountains',
        cost: { wood: 20, stone: 10 },
        production: { stone: 0.15 },
        count: 0
    },
    miner: {
        name: 'Miner',
        icon: '⛏️',
        description: 'Extracts ore from deep veins',
        zone: 'mountains',
        cost: { wood: 50, stone: 30 },
        production: { ore: 0.2 },
        count: 0
    },
    crystalHunter: {
        name: 'Crystal Hunter',
        icon: '🔦',
        description: 'Searches caves for crystals',
        zone: 'caves',
        cost: { ore: 20, crystal: 5 },
        production: { crystal: 0.25 },
        count: 0
    },
    priest: {
        name: 'Priest',
        icon: '👼',
        description: 'Channels essence from the temple',
        zone: 'temple',
        cost: { crystal: 50, essence: 10 },
        production: { essence: 0.3 },
        count: 0
    }
};

// Upgrade Definitions
const upgrades = {
    improvedGathering: {
        name: 'Improved Gathering',
        description: '+50% gathering speed',
        cost: { wood: 25 },
        requirement: { buildings: { woodcutter: 1 } },
        effect: { gatherSpeed: 1.5 },
        purchased: false
    },
    betterTools: {
        name: 'Better Tools',
        description: '+75% mining efficiency',
        cost: { ore: 10, wood: 50 },
        requirement: { buildings: { miner: 2 } },
        effect: { miningSpeed: 1.75 },
        purchased: false
    },
    ancientKnowledge: {
        name: 'Ancient Knowledge',
        description: 'Unlock Temple zone permanently',
        cost: { crystal: 100 },
        requirement: { zoneVisited: 'caves' },
        effect: { unlockZone: 'temple' },
        purchased: false
    }
};

// Initialize Game
function initGame() {
    // Load from localStorage
    const saved = localStorage.getItem('realmAscensionState');
    if (saved) {
        Object.assign(gameState, JSON.parse(saved));
    } else {
        // Initialize resources
        Object.keys(resources).forEach(key => {
            gameState.resources[key] = 0;
        });
        
        // Initialize buildings
        Object.keys(buildings).forEach(key => {
            gameState.buildings[key] = 0;
        });
    }
    
    render();
    startGameLoop();
}

// Save Game
function saveGame() {
    localStorage.setItem('realmAscensionState', JSON.stringify(gameState));
}

// Reset Game
function resetGame() {
    if (confirm('Reset your entire realm? This cannot be undone!')) {
        localStorage.removeItem('realmAscensionState');
        location.reload();
    }
}

// Main Click Handler
function primaryAction() {
    const zone = zones[gameState.currentZone];
    const resource = zone.primaryResource;
    
    gameState.resources[resource] = (gameState.resources[resource] || 0) + 1;
    gameState.stats.totalGathered++;
    
    saveGame();
    render();
}

// Buy Building
function buyBuilding(buildingKey) {
    const building = buildings[buildingKey];
    
    // Check if affordable
    let canAfford = true;
    for (let [resource, amount] of Object.entries(building.cost)) {
        if ((gameState.resources[resource] || 0) < amount) {
            canAfford = false;
            break;
        }
    }
    
    if (!canAfford) return;
    
    // Deduct cost
    for (let [resource, amount] of Object.entries(building.cost)) {
        gameState.resources[resource] -= amount;
    }
    
    gameState.buildings[buildingKey]++;
    gameState.stats.buildingsBuilt++;
    saveGame();
    render();
}

// Buy Upgrade
function buyUpgrade(upgradeKey) {
    const upgrade = upgrades[upgradeKey];
    if (upgrade.purchased) return;
    
    // Check if affordable
    let canAfford = true;
    for (let [resource, amount] of Object.entries(upgrade.cost)) {
        if ((gameState.resources[resource] || 0) < amount) {
            canAfford = false;
            break;
        }
    }
    
    if (!canAfford) return;
    
    // Deduct cost
    for (let [resource, amount] of Object.entries(upgrade.cost)) {
        gameState.resources[resource] -= amount;
    }
    
    upgrade.purchased = true;
    saveGame();
    render();
}

// Switch Zone
function switchZone(zoneKey) {
    if (zones[zoneKey]) {
        gameState.currentZone = zoneKey;
        saveGame();
        render();
    }
}

// Render UI
function render() {
    renderResources();
    renderPrimaryAction();
    renderBuildings();
    renderZoneInfo();
    renderZoneNav();
    renderStats();
    renderUpgrades();
}

function renderResources() {
    const grid = document.getElementById('resourcesGrid');
    grid.innerHTML = '';
    
    const zone = zones[gameState.currentZone];
    
    Object.entries(resources).forEach(([key, res]) => {
        if (!res.zoneAvailable.includes(gameState.currentZone)) return;
        
        const amount = gameState.resources[key] || 0;
        const production = calculateProductionRate(key);
        
        const card = document.createElement('div');
        card.className = 'resource-card';
        card.innerHTML = `
            <div class="resource-icon">${res.icon}</div>
            <div class="resource-name">${res.name}</div>
            <div class="resource-amount">${Math.floor(amount)}</div>
            ${production > 0 ? `<div class="resource-rate">+${production.toFixed(1)}/s</div>` : ''}
        `;
        grid.appendChild(card);
    });
}

function renderPrimaryAction() {
    const zone = zones[gameState.currentZone];
    const container = document.getElementById('primaryAction');
    
    const actionText = zone.primaryAction.charAt(0).toUpperCase() + zone.primaryAction.slice(1);
    
    container.innerHTML = `
        <button class="action-button" onclick="primaryAction()">${zone.icon}</button>
        <p style="color: #aaa; margin-top: 15px;">Click to ${zone.primaryAction}</p>
    `;
}

function renderBuildings() {
    const grid = document.getElementById('buildingsGrid');
    grid.innerHTML = '';
    
    const zone = zones[gameState.currentZone];
    
    Object.entries(buildings).forEach(([key, building]) => {
        if (building.zone !== gameState.currentZone) return;
        
        const count = gameState.buildings[key] || 0;
        const canAfford = checkAffordable(building.cost);
        
        const card = document.createElement('div');
        card.className = 'building-card';
        
        let costHtml = '<div class="building-cost">';
        for (let [res, amount] of Object.entries(building.cost)) {
            costHtml += `<div class="cost-item">${amount} ${resources[res].name}</div>`;
        }
        costHtml += '</div>';
        
        card.innerHTML = `
            <div class="building-icon">${building.icon}</div>
            <div class="building-name">${building.name}</div>
            <div class="building-description">${building.description}</div>
            <div class="building-count">Owned: ${count}</div>
            ${costHtml}
            <button class="buy-btn" onclick="buyBuilding('${key}')" ${!canAfford ? 'disabled' : ''}>
                Build
            </button>
        `;
        grid.appendChild(card);
    });
}

function renderZoneInfo() {
    const zone = zones[gameState.currentZone];
    
    document.getElementById('zoneName').textContent = `${zone.icon} ${zone.name}`;
    document.getElementById('zoneDescription').textContent = zone.description;
    document.getElementById('zoneLevel').textContent = Object.keys(zones).indexOf(gameState.currentZone) + 1;
}

function renderZoneNav() {
    const list = document.getElementById('zoneList');
    list.innerHTML = '';
    
    Object.entries(zones).forEach(([key, zone]) => {
        const btn = document.createElement('button');
        btn.className = 'zone-btn';
        if (key === gameState.currentZone) btn.classList.add('active');
        
        const isUnlocked = isZoneUnlocked(key);
        
        btn.innerHTML = `${zone.icon} ${zone.name}`;
        if (!isUnlocked) {
            btn.innerHTML += `<br><span class="locked">🔒 Locked</span>`;
            btn.disabled = true;
        }
        
        btn.onclick = () => switchZone(key);
        list.appendChild(btn);
    });
}

function renderStats() {
    const list = document.getElementById('statsList');
    list.innerHTML = `
        <div class="stats-item">
            <span class="stats-item-label">Buildings Built:</span>
            <span class="stats-item-value">${gameState.stats.buildingsBuilt}</span>
        </div>
        <div class="stats-item">
            <span class="stats-item-label">Resources Gathered:</span>
            <span class="stats-item-value">${gameState.stats.totalGathered}</span>
        </div>
        <div class="stats-item">
            <span class="stats-item-label">Current Zone:</span>
            <span class="stats-item-value">${zones[gameState.currentZone].name}</span>
        </div>
    `;
}

function renderUpgrades() {
    const list = document.getElementById('upgradesList');
    list.innerHTML = '';
    
    Object.entries(upgrades).forEach(([key, upgrade]) => {
        const item = document.createElement('div');
        item.className = 'upgrade-item';
        
        let costHtml = '';
        for (let [res, amount] of Object.entries(upgrade.cost)) {
            costHtml += `${amount} ${resources[res].name} `;
        }
        
        const canAfford = checkAffordable(upgrade.cost);
        const isPurchased = upgrade.purchased;
        
        item.innerHTML = `
            <div class="upgrade-name">${upgrade.name}</div>
            <div class="upgrade-desc">${upgrade.description}</div>
            <button class="upgrade-btn" onclick="buyUpgrade('${key}')" 
                    ${isPurchased || !canAfford ? 'disabled' : ''}>
                ${isPurchased ? '✓ Owned' : costHtml}
            </button>
        `;
        list.appendChild(item);
    });
}

// Helper Functions
function checkAffordable(cost) {
    for (let [resource, amount] of Object.entries(cost)) {
        if ((gameState.resources[resource] || 0) < amount) return false;
    }
    return true;
}

function calculateProductionRate(resource) {
    let rate = 0;
    
    Object.entries(buildings).forEach(([key, building]) => {
        if (building.production[resource]) {
            rate += (gameState.buildings[key] || 0) * building.production[resource];
        }
    });
    
    return rate;
}

function isZoneUnlocked(zoneKey) {
    if (zoneKey === 'grasslands') return true;
    
    const zone = zones[zoneKey];
    for (let [resource, amount] of Object.entries(zone.unlockRequirement)) {
        if ((gameState.resources[resource] || 0) < amount) return false;
    }
    return true;
}

// Game Loop
function startGameLoop() {
    setInterval(() => {
        // Production
        Object.entries(buildings).forEach(([key, building]) => {
            const count = gameState.buildings[key] || 0;
            
            Object.entries(building.production).forEach(([resource, amount]) => {
                gameState.resources[resource] = (gameState.resources[resource] || 0) + (amount * count * 0.1);
            });
        });
        
        gameState.stats.timePlayedSeconds++;
        saveGame();
        render();
    }, 100);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('saveBtn').onclick = saveGame;
    document.getElementById('resetBtn').onclick = resetGame;
    initGame();
});