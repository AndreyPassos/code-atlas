function createInteropElement(type, props, key) {
  const React = require('react');
  return React.createElement(type, props, key);
}

function jsx(type, props, key) {
  const React = require('react');
  return React.createElement(type, props, key);
}

function jsxs(type, props, key) {
  const React = require('react');
  return React.createElement(type, props, key);
}

module.exports = {
  jsx,
  jsxs,
  createInteropElement,
  Fragment: require('react').Fragment,
  wrap: (component) => component,
  StyleSheet: {
    create: (styles) => styles,
    flatten: (style) => style,
    compose: (...styles) => Object.assign({}, ...styles.filter(Boolean)),
  },
  rem: 14,
  useUnstableNativeVariable: (name, getter) => getter(),
  cssInterop: () => {},
  variableFactory: () => () => '',
  PlatformTypes: { OS: 'ios' },
};
