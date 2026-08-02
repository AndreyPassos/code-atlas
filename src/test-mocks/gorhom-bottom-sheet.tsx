import { forwardRef, useImperativeHandle } from 'react';
import { View, type ViewProps } from 'react-native';

export const BottomSheetModal = forwardRef<{ present: () => void; dismiss: () => void }, ViewProps>(
  function BottomSheetModal({ children, ...props }, ref) {
    useImperativeHandle(ref, () => ({ present: () => {}, dismiss: () => {} }), []);
    return <View {...props}>{children}</View>;
  }
);

export function BottomSheetView({ children, ...props }: ViewProps) {
  return <View {...props}>{children}</View>;
}

export function BottomSheetBackdrop({ children, ...props }: ViewProps) {
  return <View {...props}>{children}</View>;
}

export interface BottomSheetBackdropProps extends ViewProps {
  appearsOnIndex?: number;
  disappearsOnIndex?: number;
}
