# Overview
Lô Tô Game is a digital adaptation of the traditional Vietnamese Lô Tô (Bingo) game. It allows users to create virtual game rooms, invite friends using a unique room code, select playing cards, and enjoy the game in real-time. The host can call numbers manually or enable auto-calling, while players mark their cards when their numbers are called. The first player to complete a row wins the game.

The game provides a modern, accessible way to enjoy this cultural pastime online, making it possible for friends and family to play together regardless of physical location. It combines the traditional gameplay elements with digital convenience features like automatic number calling and win detection.

# Core Features

## Room Management
- **Room Creation**: Users can create new game rooms and become the host
- **Room Joining**: Players can join existing rooms using a 6-digit room code
- **Player Management**: Hosts can see all players in the room and have the ability to start the game

## Game Preparation
- **Nickname Selection**: Players choose a nickname before joining or creating a room
- **Card Selection**: Players select their Lô Tô card from available templates before the game starts
- **Game Initialization**: Host can start the game when all players have selected their cards

## Gameplay
- **Number Calling**: Host can call numbers manually or enable auto-calling (every 5 seconds)
- **Number Marking**: Players mark numbers on their cards when called
- **Win Detection**: Automatic detection when a player completes a row (5 numbers)
- **Victory Celebration**: Visual celebration when a player wins
- **Game Reset**: Option to start a new game with the same players

## Real-time Communication
- **Room Status Updates**: All players see real-time updates of room status
- **Player Actions**: Card selections and number markings are synchronized across all players
- **Audio Feedback**: Numbers are read aloud in Vietnamese when called

# User Experience

## User Personas

### Casual Player
- Wants to play a quick game with friends or family
- May not be familiar with digital adaptations of traditional games
- Values simplicity and ease of use

### Game Host
- Organizes game sessions for a group
- Needs tools to manage the game flow and players
- Appreciates control over game pace (manual vs. auto-calling)

### Traditional Game Enthusiast
- Familiar with physical Lô Tô games
- Expects the digital version to maintain traditional elements
- Values authentic experience (Vietnamese number calling)

## Key User Flows

### Creating and Joining a Room
1. User enters nickname
2. User creates a new room or joins existing room with code
3. System generates/validates room code and places user in the room

### Game Preparation
1. Players select their cards from available templates
2. Host sees player readiness status
3. Host starts the game when all players are ready

### Gameplay
1. Host calls numbers (manually or automatically)
2. Players mark called numbers on their cards
3. System detects winning condition
4. Winner is announced and celebrated
5. Option to start a new game

### Leaving a Room
1. Player clicks "Leave Room" button
2. System removes player from room
3. If host leaves, game ends for all players

## UI/UX Considerations
- Clean, intuitive interface suitable for all age groups
- Responsive design for various device sizes
- Visual feedback for player actions
- Clear indication of game state (waiting, playing, ended)
- Accessibility features for diverse users

# Technical Architecture

## System Components

### Frontend
- Next.js React application with client-side rendering for game components
- Context API for game state management
- Tailwind CSS for responsive styling
- Real-time updates using Supabase Realtime

### Backend
- Server actions for game logic and database operations
- PostgreSQL database with Prisma ORM
- Supabase for real-time communication

## Data Models

### Room
- id: String (primary key, cuid)
- code: String (unique 6-digit code)
- hostId: String (reference to host player)
- status: RoomStatus enum (waiting, selecting, playing, ended)
- calledNumbers: Int[] (array of called numbers)
- winnerId: String (optional, reference to winning player)
- createdAt/updatedAt: DateTime

### Player
- id: String (primary key, cuid)
- nickname: String
- isHost: Boolean
- cardId: String (reference to selected card)
- markedNumbers: Int[] (numbers marked by player)
- roomId: String (foreign key to Room)
- createdAt/updatedAt: DateTime

### Relationships
- One Room has many Players
- Each Player belongs to one Room

## APIs and Integrations

### Server Actions
- createRoom: Creates a new room and host player
- joinRoom: Adds a player to an existing room
- leaveRoom: Removes a player from a room
- startGame: Changes room status from waiting to playing
- callNumber: Adds a number to the calledNumbers array
- markNumber: Adds a number to player's markedNumbers array
- declareWinner: Sets winnerId and ends the game

### Real-time Events
- GAME_STARTED: Notifies all players when game starts
- PLAYER_JOINED: Notifies when a new player joins
- PLAYER_LEFT: Notifies when a player leaves
- NUMBER_CALLED: Notifies all players of newly called number
- CARD_SELECTED: Notifies when a player selects a card
- CARD_UPDATED: Notifies when a player marks a number
- WINNER_DECLARED: Notifies all players when someone wins

## Infrastructure Requirements
- PostgreSQL database for data persistence
- Supabase for real-time communication
- Vercel or similar for Next.js hosting

# Development Roadmap

## Phase 1: MVP (Current Implementation)
- Basic room creation and joining functionality
- Player management and game flow
- Card selection from predefined templates
- Manual and auto number calling
- Win detection and game reset
- Real-time updates for all players

## Phase 2: Enhanced Experience
- Improved UI/UX with animations and transitions
- Sound effects for various game events
- Multiple language support
- Custom card creation
- Game history and statistics

## Phase 3: Advanced Features
- User accounts and profiles
- Persistent game history
- Different game modes (classic, speed, patterns)
- Spectator mode for non-players
- Tournament functionality
- Mobile app versions

# Logical Dependency Chain

## Foundation (Completed)
1. Database schema and models
2. Room creation and joining
3. Basic game state management
4. Real-time communication setup

## Core Gameplay (Completed)
5. Card selection interface
6. Number calling mechanism
7. Number marking on cards
8. Win detection algorithm

## User Experience Enhancements (Next Steps)
9. Improved visual feedback for game events
10. Enhanced audio for number calling
11. Responsive design optimizations
12. Accessibility improvements

## Extended Features (Future)
13. User authentication and profiles
14. Game history and statistics
15. Additional game modes
16. Social features (friends, invitations)

# Risks and Mitigations

## Technical Challenges

### Real-time Synchronization
- **Risk**: Latency issues causing game state inconsistencies
- **Mitigation**: Implement robust error handling and state reconciliation

### Scalability
- **Risk**: Performance degradation with many concurrent games
- **Mitigation**: Optimize database queries and implement caching

### Browser Compatibility
- **Risk**: Inconsistent experience across different browsers
- **Mitigation**: Comprehensive testing and fallback mechanisms

## User Adoption

### Learning Curve
- **Risk**: New users unfamiliar with digital version of traditional game
- **Mitigation**: Intuitive UI and optional tutorial

### Engagement
- **Risk**: Players losing interest after novelty wears off
- **Mitigation**: Regular updates, new features, and game variations

## Resource Constraints

### Development Time
- **Risk**: Limited resources for implementing all desired features
- **Mitigation**: Prioritize core gameplay and gradually add enhancements

### Maintenance
- **Risk**: Ongoing support requirements
- **Mitigation**: Well-documented code and automated testing

# Appendix

## Traditional Lô Tô Rules
- Traditional Vietnamese Lô Tô uses cards with 15 numbers arranged in 3 rows
- Numbers range from 1-90
- Players mark numbers as they are called
- First player to complete a row (5 numbers) wins
- Game is often played during holidays and family gatherings

## Technical Specifications

### Card Generation
- Each card contains 15 numbers arranged in 3 rows of 5 numbers each
- Numbers are distributed according to traditional Lô Tô rules
- Cards are pre-generated and stored as templates

### Number Calling
- Random number generation without repetition
- Numbers are called in Vietnamese tradition
- Auto-calling interval set to 5 seconds by default