# 🚀 Crewmates vs Imposters

A simple web-based deduction game where players are assigned roles as either crewmates or imposters. Crewmates must complete tasks and vote out imposters, while imposters try to remain hidden.

## Game Overview

- **Crewmates**: Complete tasks and identify who the imposters are
- **Imposters**: Hidden among crewmates, try to avoid being voted out
- **Gameplay**: Players complete tasks, hold meetings, and vote to eliminate suspects

## How to Play

1. **Setup**: Enter the number of players and imposters
2. **Gameplay**: 
   - Crewmates complete tasks
   - Anyone can call an emergency meeting
   - Players vote on who to eliminate
3. **Win Conditions**:
   - **Crewmates win** if all imposters are voted out
   - **Imposters win** if they equal or outnumber the crewmates

## Features

✅ Player role assignment (Crewmates & Imposters)  
✅ Task system  
✅ Emergency meetings with voting  
✅ Win condition detection  
✅ Round tracking  
✅ Beautiful, responsive UI  
✅ Smooth animations  

## Files

- `index.html` - Main game structure
- `style.css` - Game styling and animations
- `script.js` - Game logic and mechanics

## How to Run

1. Open `index.html` in your web browser
2. Configure the number of players and imposters
3. Click "Start Game" and enjoy!

## Game Mechanics

### Tasks
Players can complete various tasks to progress toward crewmate victory:
- Fix Wires
- Scan Card
- Submit Samples
- Empty Trash
- Water Plants
- Refuel Engine

### Voting
During emergency meetings, players vote to eliminate someone:
- If an imposter is voted out, it's revealed
- If a crewmate is voted out, it's revealed
- Players can skip the vote

### Win Conditions
- **Crewmates Win**: All imposters have been voted out
- **Imposters Win**: Imposters equal or outnumber crewmates

## Future Features

- Multiplayer with chat
- Kill mechanics for imposters
- Sabotage mechanics
- Custom roles and tasks
- Leaderboard system
- Sound effects and music
