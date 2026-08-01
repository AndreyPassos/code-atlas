import { Animated } from 'react-native';
import { useEffect, useRef } from 'react';

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
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
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
    ).start();
  }, [opacity]);

  return (
    <Animated.View
      testID={testID}
      style={{ width, height, borderRadius, opacity }}
      className="bg-skeleton"
    />
  );
}
