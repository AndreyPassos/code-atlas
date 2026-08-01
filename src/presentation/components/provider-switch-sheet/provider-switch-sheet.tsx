import { forwardRef, useCallback, useImperativeHandle, useMemo, useRef } from 'react';
import { View } from 'react-native';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';
import { Text } from '../text';
import { ProviderOption } from '../provider-option';
import { PROVIDER_DISPLAY } from '../../constants/provider-display';
import { notify } from '../../lib/notify';
import { useProviderStore } from '../../../infrastructure/hooks';
import { colors } from '../../../shared/design-tokens';
import type { ProviderType } from '../../../domain/value-objects';

const PROVIDERS: readonly ProviderType[] = ['github', 'gitlab'];

export interface ProviderSwitchSheetHandle {
  present: () => void;
  dismiss: () => void;
}

export const ProviderSwitchSheet = forwardRef<ProviderSwitchSheetHandle>(
  function ProviderSwitchSheet(_props, forwardedRef) {
    const sheetRef = useRef<BottomSheetModal>(null);
    const { activeProvider, setProvider } = useProviderStore();
    const { colorScheme } = useColorScheme();
    const scheme = colorScheme === 'dark' ? colors.dark : colors.light;
    const snapPoints = useMemo(() => ['35%'], []);
    const insets = useSafeAreaInsets();
    // At least 24px so content never sits flush against the edge; on devices
    // with a home indicator, respect that inset instead (it's often > 24px).
    const bottomPadding = Math.max(24, insets.bottom + 16);

    // Empty deps: sheetRef is a stable ref object, so the handle itself never
    // needs to change identity — without this it's recreated every render.
    useImperativeHandle(
      forwardedRef,
      () => ({
        present: () => sheetRef.current?.present(),
        dismiss: () => sheetRef.current?.dismiss(),
      }),
      []
    );

    const handleSelect = useCallback(
      (provider: ProviderType) => {
        if (provider !== activeProvider) {
          setProvider(provider);
          notify.success(`Fonte alterada para ${PROVIDER_DISPLAY[provider].name}`);
        }
        sheetRef.current?.dismiss();
      },
      [activeProvider, setProvider]
    );

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />
      ),
      []
    );

    return (
      <BottomSheetModal
        ref={sheetRef}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: scheme.surface }}
        handleIndicatorStyle={{ backgroundColor: scheme.border }}
        accessibilityLabel="Selecionar fonte de dados">
        <BottomSheetView>
          <View
            className="gap-md px-lg pt-lg"
            style={{ paddingBottom: bottomPadding }}
            accessibilityRole="radiogroup">
            <Text variant="heading">Selecionar fonte</Text>
            {PROVIDERS.map((provider) => (
              <ProviderOption
                key={provider}
                icon={PROVIDER_DISPLAY[provider].icon}
                name={PROVIDER_DISPLAY[provider].name}
                selected={activeProvider === provider}
                onPress={() => handleSelect(provider)}
                testID={`provider-sheet-option-${provider}`}
              />
            ))}
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);
