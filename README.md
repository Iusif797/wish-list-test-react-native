# Project Overview

Wish List App is a React Native mobile application engineered for robust wishlist management. Built with TypeScript, it follows a feature-based architecture that prioritizes modularity, testability, and separation of concerns between UI layers, business logic, and data synchronization.

# Tech Stack

- React Native
- Expo
- TypeScript
- React Navigation (Native Stack)
- SWR (Data fetching and caching)
- React Native Reanimated
- AsyncStorage & SecureStore
- Jest & React Native Testing Library
- ESLint & Prettier

# Architecture

The project adheres to a structurally separated folder layout to facilitate code navigation, maintain boundary enforcement, and reduce the mental overhead of locating domain-specific logic.

```
src/
├── components/       # Shared, stateless UI primitives (buttons, inputs)
├── hooks/            # Shared React hooks for cross-cutting concerns
├── lib/              # Core infrastructure (API client, Auth, WebSocket, Theme)
├── navigation/       # Route definitions and stack navigators
├── screens/          # Feature-specific composite components
└── __tests__/        # Unit and component test suites
```

This architecture ensures scalability. As the application grows, new domains can be encapsulated within their specific feature directories without cluttering global namespaces. The separation of concerns is explicitly maintained: screens compose components and consume hooks; components define pure UI; hooks and core libraries handle external data and side effects independently of the view layer.

# State Management Strategy

The application state is categorically divided to avoid the bottleneck of a single monolithic store:

- **Server State**: Managed by SWR. This handles caching, deduplication, and conditional re-validation, offloading the complexity of network synchronization from the UI components.
- **Global UI State**: Managed via React Context patterns (e.g., AuthProvider, ThemeProvider) specifically for immutable or infrequently changing data that must be accessed universally.
- **Local Component State**: Kept within individual components for ephemeral UI concerns.

This decoupled approach was chosen over heavy centralized stores to reduce boilerplate and prevent unnecessary re-renders across disjointed component trees, prioritizing performance and isolation.

# Engineering Decisions

- **Strict Typing**: TypeScript is configured stringently to catch data shape mismatches at compile time, eliminating a large class of runtime exceptions.
- **Separation of Concerns**: Business logic, including authentication handling, API abstractions, and biometrics, is isolated in the `lib` layer. This keeps React components focused strictly on presentation and user interaction.
- **Reusable Components**: Foundational UI elements are built as pure, controlled components, ensuring visual consistency and ease of testing without relying on implicit internal state.
- **Validation and Edge-Case Handling**: API requests implement resilient mechanisms including request timeouts, implicit token handling, and explicit error mapping. Network latency and localized failures are defensively handled within the API client layer.

# Testing Strategy

- **Unit Testing**: Tests validate the behavior of core utilities, logic, and pure functions within the `lib` and `hooks` directories.
- **Component Testing**: Critical UI flows are verified using React Native Testing Library, focusing on accessibility queries and simulated user interactions to ensure the UI behaves predictably against varied state injections.
- Mocks are strictly defined at the boundary of external dependencies (e.g., AsyncStorage, local authentication) to ensure test determinism and execution speed.

# Performance Considerations

- **FlatList Optimization**: List views utilize `keyExtractor`, `initialNumToRender`, `maxToRenderPerBatch`, and `removeClippedSubviews` to maintain 60FPS scrolling performance on large data sets.
- **Render Control**: Callbacks passed to child components or effect dependencies are stabilized using `useCallback`. Computationally expensive derivations are memoized via `useMemo`.
- **Animation Offloading**: Animations are driven via `react-native-reanimated` on the UI thread, preventing JavaScript thread contention during transitions.

# Setup Instructions

1. Install project dependencies:

```bash
npm install
```

2. Configure environment variables mapping to the provided example template:

```bash
cp .env.example .env
```

3. Start the local bundler process:

```bash
npm start
```

# Future Improvements

- **CI/CD Pipeline**: Implementation of GitHub Actions for automated linting, test execution, and continuous deployment via Fastlane or EAS Build.
- **Offline Persistence**: Integration of specialized storage mechanisms (e.g., MMKV or WatermelonDB) for true offline-first cache capability and optimistic mutations.
- **End-to-End Testing**: Introduction of Detox or Maestro to validate complete navigation flows and critical user journeys against native simulator environments.
