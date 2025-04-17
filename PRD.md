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
- **Audio Feedback**: Numbers are read aloud in Vietnamese when called (make sure work on browser on mobile as well)

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
3. If host leaves, a random user will be come host
4. If last player leaves, the room will be deleted

## UI/UX Considerations

- Clean, modern, intuitive interface suitable for all age groups
- Responsive design for various device sizes (focus on mobile size)
- Visual feedback for player actions
- Clear indication of game state (waiting, playing, ended)
- Accessibility features for diverse users

# Technical Architecture

## System Components

### Frontend

- Next.js React application with client-side rendering for game components
- Zustand for efficient global state management
- Shadcn UI for UI components & Tailwind CSS for responsive styling
- Follows standard Next.js project structure conventions for organization

### Backend

- Server actions for game logic and database operations
- PostgreSQL database with Prisma ORM (use Supabase for database)
- Real-time communication using Supabase

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

## Phase 4: Improvements

- Allow user to adjust auto-calling interval
- Host can initiate game with some about of points, bet rate
- If you win, you get all the points
- If you lose, you pay the points

# Logical Dependency Chain

## Foundation (Next Steps)

1. Database schema and models
2. Room creation and joining
3. Basic game state management
4. Real-time communication setup

## Core Gameplay (Future)

5. Card selection interface
6. Number calling mechanism
7. Number marking on cards
8. Win detection algorithm

## User Experience Enhancements (Future)

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

- **Risk**: Inconsistent experience across different browsers, especially mobile and TTS feature (to read number in Vietnamese)
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

- Traditional Vietnamese Lô Tô uses cards with 45 numbers arranged in 9 rows
- Numbers range from 1-90
- Players mark numbers as they are called
- First player to complete a row (5 numbers) wins
- Game is often played during holidays and family gatherings

## Technical Specifications

### Card Generation

- Each card contains 45 numbers arranged in 9 rows of 5 numbers each (some blank cells)
- Numbers are distributed according to traditional Lô Tô rules
- Cards are pre-generated and stored as templates

### Number Calling

- Random number generation without repetition
- Numbers are called in Vietnamese tradition
- Auto-calling interval set to 5 seconds by default
