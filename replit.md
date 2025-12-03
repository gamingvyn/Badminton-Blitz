# Badminton Blitz

A 2D badminton game built with React Three Fiber where you play against AI.

## Features

- **Single Player vs AI**: Challenge the CPU at three difficulty levels
- **Difficulty Levels**: Beginner, Intermediate, Expert
- **Physics-Based Gameplay**: Realistic shuttlecock physics with gravity and air resistance
- **Jump Smash**: Press jump while smashing for extra power!
- **Scoring**: First to 21 points with 2-point lead wins

## Controls

- **Arrow Left/Right**: Move
- **Arrow Up**: Jump
- **Z**: Smash (powerful shot) - Jump + Smash = Extra Power!
- **X**: Lob (high arc shot to return smashes)

## Project Structure

```
client/
├── src/
│   ├── components/
│   │   └── game/
│   │       ├── BadmintonGame.tsx  # Main game component
│   │       ├── Court.tsx          # Badminton court
│   │       ├── Player.tsx         # Player physics & controls (includes AI)
│   │       ├── Shuttlecock.tsx    # Shuttlecock physics
│   │       ├── GameHUD.tsx        # Score display
│   │       ├── MenuScreen.tsx     # Game setup and settings
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

## AI Behavior

The AI opponent adjusts behavior based on difficulty:
- **Beginner**: Slower movement, lower reaction time, less likely to smash/jump
- **Intermediate**: Moderate speed and reactions, balanced gameplay
- **Expert**: Fast movement, quick reactions, aggressive smashing and jumping
