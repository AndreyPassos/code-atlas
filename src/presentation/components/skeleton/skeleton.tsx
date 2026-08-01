import { Animated } from 'react-native';
import { useEffect, useState } from 'react';

export interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  testID?: string;
}

export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius = 4,
  testID = 'skeleton',
}: SkeletonProps) {
  // Lazy useState initializer, not useRef().current: reading a ref's .current
  // during render is against the rules of hooks (React may discard/replay a
  // render), useState's lazy initializer is the correct "create once" escape
  // hatch for a value that's also needed during render (the `opacity` style).
  const [opacity] = useState(() => new Animated.Value(0.3));

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    // Without this, an infinite Animated.loop keeps ticking on the native
    // side after the component unmounts — every Skeleton ever rendered
    // during a loading state leaks a running animation.
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      testID={testID}
      style={{ width, height, borderRadius, opacity }}
      className="bg-skeleton"
    />
  );
}
