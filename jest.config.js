module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@testing-library|nativewind|react-native-css-interop|expo|expo-modules|expo-modules-core|@expo|@react-native/js-polyfills)/)',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
};
