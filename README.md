# WishList React Native

A premium React Native application built with Expo for managing your wish lists.

## Features

- ✨ Modern, high-end UI design
- 🔐 Secure authentication
- 📝 Manage multiple wish list items
- 🏎️ Fast and responsive performance

## Technology Stack

- **Framework**: [Expo](https://expo.dev/) (React Native)
- **Navigation**: [React Navigation](https://reactnavigation.org/)
- **Styling**: Vanilla `StyleSheet` with premium design principles
- **Animations**: [React Native Reanimated](https://docs.expo.dev/versions/latest/sdk/reanimated/)
- **Data Fetching**: [SWR](https://swr.vercel.app/)
- **Icons**: [Lucide React Native](https://lucide.dev/guide/packages/lucide-react-native)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Expo Go](https://expo.dev/expo-go) app on your mobile device (for testing)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example` and fill in the required environment variables.

### Running the App

Start the development server:

```bash
npm start
```

- Open the Expo Go app on your phone and scan the QR code.
- Or press `i` to open in iOS simulator.
- Or press `a` to open in Android emulator.

## Development Workflows

### Linting and Formatting

We use ESLint and Prettier to maintain code quality and consistency.

- **Check linting**: `npm run lint`
- **Format code**: `npm run format`

### Testing

We use Jest and React Native Testing Library for unit and component testing.

- **Run tests**: `npm run test`
- **Run tests in watch mode**: `npm run test -- --watch`

## Project Structure

- `src/components`: Reusable UI components
- `src/screens`: Main application screens
- `src/navigation`: Navigation configuration
- `src/lib`: Core libraries, providers, and utilities
- `src/hooks`: Custom React hooks
- `src/types`: TypeScript type definitions
- `src/__tests__`: Test files
