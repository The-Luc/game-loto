# Vietnamese Lô Tô Multiplayer Web Game - Implementation Summary

This document outlines the implementation of a Vietnamese Lô Tô multiplayer web game based on the MVP plan.

## Project Structure

1. **Created a Next.js application** with TypeScript, TailwindCSS, and Supabase integration
2. **Set up Supabase client** for real-time functionality
3. **Implemented UI components** using shadcn/ui for a modern, responsive interface

## Core Features Implemented

### 1. Game Types and Utilities

- Created type definitions for Players, Rooms, Cards, and Game State
- Implemented utility functions for:
  - Generating random 6-digit room codes
  - Creating Lô Tô cards with 9 rows x 9 columns (5 numbers, 4 blank cells per row)
  - Reading numbers in Vietnamese using Web Speech API

### 2. Game Context Provider

- Implemented a comprehensive context provider for game state management
- Functions for:
  - Creating and joining rooms
  - Player management (kicking, leaving)
  - Card selection
  - Number calling (manual and automatic)
  - Marking numbers on cards

### 3. UI Components

- **LandingPage**: Nickname input and options to create/join rooms
- **Room**: Main game room with player list and game area
- **PlayerList**: Shows all players in the room with host controls
- **CardSelection**: Displays 10 random cards for players to choose from
- **LoToCard**: Interactive card component for selection and gameplay
- **NumberCaller**: Controls for calling numbers with auto-call functionality

### 4. Routing

- Set up dynamic routing for room pages using Next.js
- Implemented navigation between landing page and room pages

## Technical Implementation Details

1. **State Management**: Used React Context API for global game state
2. **Real-time Communication**: Prepared for Supabase Realtime integration
3. **Responsive Design**: Mobile-first UI with TailwindCSS
4. **Voice Integration**: Implemented Web Speech API for number reading

## Game Flow

1. **Landing Page**:

   - User enters nickname
   - User creates a new room or joins an existing room with a code

2. **Room Management**:

   - Host sees waiting room with player list
   - Players join using the shared 6-digit code
   - Host can kick players
   - Host starts the game when everyone is ready

3. **Card Selection**:

   - Each player chooses one card from 10 randomly generated options
   - Cards follow the Vietnamese Lô Tô format (9 rows x 9 columns)
   - Each row has 5 numbers and 4 blank cells
   - Numbers range from 1-90 with no duplicates per card

4. **Gameplay**:
   - Host manually draws numbers or enables auto-calling (5-second intervals)
   - Called numbers are shown in a scrollable list
   - Current number is prominently displayed
   - Players manually tap to mark cells on their card
   - Voice automatically reads called numbers in Vietnamese

## Next Steps

To complete the implementation, you would need to:

1. **Add additional features** like chat or voice chat for "Kinh!" calls
2. Add more features:
   - 'Chờ' indicator
   - Peak other players' cards
   - Choose 2 cards

Bugs:

- Some browser read English instead of Vietnamese
- Reset list of called numbers of users how are not the host

The current implementation provides a fully functional frontend with simulated multiplayer functionality that can be connected to Supabase for real-time features.

## Running the Application

1. Install dependencies:

   ```
   npm install
   ```

2. Set up your Supabase credentials in `.env.local`:

   ```
   SUPABASE_ANON_KEY=your_anon_key
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   DATABASE_URL=your_database_url
   ```

3. Run the development server:

   ```
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to play the game.
