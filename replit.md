# Badminton Game

A 2D badminton game built with React Three Fiber where you can play against AI or a friend on the same keyboard.

## Features

- **Account System**: Create an account with username and password (stored in browser localStorage)
- **Two Game Modes**: Play against AI or local multiplayer (vs Friend)
- **Physics-Based Gameplay**: Realistic shuttlecock physics with gravity and air resistance
- **Jump Smash**: Press jump while smashing for extra power!
- **Scoring**: First to 21 points with 2-point lead wins

## Controls

### Player 1 (Left Side)
- **Arrow Left/Right**: Move
- **Arrow Up**: Jump
- **Z**: Smash (powerful shot)
- **X**: Lob (high arc shot)

### Player 2 (Right Side) - Local Multiplayer Only
- **A/D**: Move
- **W**: Jump
- **C**: Smash
- **V**: Lob

## Project Structure

```
client/
├── src/
│   ├── components/
│   │   └── game/
│   │       ├── BadmintonGame.tsx  # Main game component
│   │       ├── Court.tsx          # Badminton court
│   │       ├── Player.tsx         # Player physics & controls
│   │       ├── Shuttlecock.tsx    # Shuttlecock physics
│   │       ├── GameHUD.tsx        # Score display
│   │       ├── LoginScreen.tsx    # Login form
│   │       ├── RegisterScreen.tsx # Registration form
│   │       ├── MenuScreen.tsx     # Game mode selection
│   │       └── MatchEndScreen.tsx # End game screen
│   ├── lib/
│   │   └── stores/
│   │       ├── useBadminton.tsx   # Game state management
│   │       └── useAudio.tsx       # Audio management
│   └── App.tsx                    # Main app component
server/
├── index.ts                       # Express server
└── routes.ts                      # API routes
```

## Technical Details

- **Frontend**: React, React Three Fiber, Zustand for state management
- **Rendering**: Three.js with orthographic-style 2D perspective
- **Physics**: Custom physics implementation (gravity, collision detection)
- **Styling**: Tailwind CSS

## Game Mechanics

- Shuttlecock follows realistic trajectory with gravity
- Net collision detection - hitting the net gives opponent a point
- Out of bounds detection - going past court boundaries gives opponent a point
- Ground landing - shuttle hitting ground on your side gives opponent a point
- Serve rotation - winner of point serves next
