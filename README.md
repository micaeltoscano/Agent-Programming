# Tetris Arcade

Tetris Arcade is a Tetris game built with HTML, CSS, and vanilla JavaScript, rendered with Canvas. The project includes solo mode, online multiplayer with WebSocket, bot matches, advanced scoring, local rankings, visual effects, and pause support.

## Technologies

- HTML5
- CSS3
- Vanilla JavaScript
- Canvas API
- Node.js for the static server and multiplayer WebSocket

There are no external frameworks in the main game.

## How to Run

Install a recent version of Node.js and run:

```bash
npm start
```

Then open:

```text
http://localhost:8000
```

You can also open `index.html` directly in the browser to play solo or against bots. For Online Multiplayer, use the server with `npm start`.

## Structure

- `index.html`: main screen, panels, scoreboard, menus, and canvases.
- `styles/style.css`: layout, responsiveness, buttons, panels, and visual polish.
- `src/app.js`: all game logic, rendering, modes, scoring, bots, and effects.
- `server.js`: local HTTP server and WebSocket for multiplayer rooms.
- `Pipeline_Prompts.md`: project phase roadmap.
- `Agente_Validador.md` and `Agente_Testador.md`: validation and testing instructions.

## Game Modes

### Solo Player

Classic Tetris mode with one board, next piece preview, ghost piece, scoring, levels, combos, high score, and game over.

### Online Multiplayer

Allows players to create or join a room by code. The match starts when both players are connected and ready. Each player controls their own board, and the result is decided by survival or score.

### Against Bots

A match with three competitors:

- YOU
- PELICANO
- PELICANA

The player chooses the bot difficulty:

- Easy
- Medium
- Hard / Aura++

The bots analyze their own boards and perform moves automatically, including movement, rotation, soft drop, and hard drop.

## Implemented Features

- 10x20 Canvas playfield.
- Seven classic tetrominoes: I, J, L, O, S, T, and Z.
- Lateral movement, rotation, soft drop, and hard drop.
- Automatic falling with progressive speed.
- Collision detection and piece locking.
- Complete line clearing.
- Next piece preview and ghost piece.
- Scoring system with lines, T-Spin, Back-to-Back, Combo, Soft Drop, and Hard Drop.
- High score and ranking saved in `localStorage`.
- Line bomb when completing lines.
- Particles, screen shake, line effects, lock effects, and floating text.
- Start screen, high score screen, game over, and return to menu.
- Pause by button or keyboard.
- Responsive layout for solo, multiplayer, and bot modes.

## Controls

- `Left Arrow`: move left
- `Right Arrow`: move right
- `Up Arrow`: rotate
- `Down Arrow`: speed up fall
- `Space`: hard drop
- `P`: pause or resume
- `Esc`: return to menu
- `R`: restart match

## Scoring

Scoring considers:

- Cleared lines
- T-Spin
- Back-to-Back
- Combo
- Soft drop
- Hard drop
- Blocks destroyed by the line bomb

Main values:

- 1 line: 100 points
- 2 lines: 300 points
- 3 lines: 500 points
- 4 lines: 800 points
- Block destroyed by bomb: 25 points

Values are multiplied by the current level when applicable.

## Multiplayer

The server in `server.js` handles:

- Serving the game files.
- Creating rooms with codes.
- Allowing a second player to join.
- Managing player ready states.
- Synchronizing state and results between clients.

Basic flow:

1. Player 1 clicks `Create Room`.
2. Player 2 enters the code and clicks `Join`.
3. Both players click `Ready`.
4. The match starts automatically.

## Persistence

The game uses `localStorage` to save:

- Highest score
- Local ranking
- Selected bot difficulty

## Project Status

The project is in Phase 7, with interface refinements, visual effects, pause support, return to menu, and adjustments to multiplayer and bot modes.
