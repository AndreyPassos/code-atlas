module.exports = {
  preset: 'jest-expo',
  setupFiles: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    // No trailing slash after each alternative — "react-native" must also
    // match "react-native-gesture-handler", "react-native-reanimated", etc.,
    // not just an exact "node_modules/react-native/" segment.
    'node_modules/(?!(react-native|@react-native|@testing-library|@gorhom|nativewind|react-native-css-interop|expo|expo-modules|expo-modules-core|@expo))',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleNameMapper: {
    // Native-only ESM package with no host binding under Jest — swapped for
    // a plain <Text> stub so screens that pull it in transitively (via the
    // components barrel) are still testable.
    '^react-native-enriched-markdown$':
      '<rootDir>/src/test-mocks/react-native-enriched-markdown.tsx',
    // @gorhom/bottom-sheet pulls in react-native-reanimated/react-native-worklets,
    // whose native part isn't initialized under Jest (no working official mock
    // for this reanimated 4 / worklets combo yet) — swapped for plain <View>
    // stubs so screens that pull it in transitively are still testable.
    '^@gorhom/bottom-sheet$': '<rootDir>/src/test-mocks/gorhom-bottom-sheet.tsx',
  },
};
