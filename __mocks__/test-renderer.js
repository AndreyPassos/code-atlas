const ReactTestRenderer = require('react-test-renderer');
const { act } = ReactTestRenderer;

function createRoot(options) {
  let renderer = null;

  return {
    render(element) {
      act(() => {
        if (renderer) {
          renderer.update(element);
        } else {
          renderer = ReactTestRenderer.create(element);
        }
      });
    },
    unmount() {
      if (renderer) {
        act(() => {
          renderer.unmount();
        });
        renderer = null;
      }
    },
    get container() {
      if (!renderer) return null;
      const root = renderer.root;
      return {
        toJSON: () => renderer.toJSON() ?? null,
        queryAll: (predicate, opts) => {
          try {
            return root.findAll(predicate, opts);
          } catch {
            return [];
          }
        },
        children: root.children,
        props: root.props,
        type: root.type,
      };
    },
  };
}

module.exports = {
  ...ReactTestRenderer,
  act,
  createRoot,
};
