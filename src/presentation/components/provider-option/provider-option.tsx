import { Pressable, View } from 'react-native';
import { Text } from '../text';

export interface ProviderOptionProps {
  icon: string;
  name: string;
  selected: boolean;
  onPress: () => void;
  testID?: string;
}

/**
 * The active/inactive states must be readable from shape+icon alone, not color
 * alone (colorblind-safe): selected gets a filled checkmark circle, unselected
 * gets an empty ring. Color reinforces it but is never the only signal.
 */
export function ProviderOption({ icon, name, selected, onPress, testID }: ProviderOptionProps) {
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={selected ? `${name}, selecionado` : name}
      className={`flex-row items-center gap-md rounded-lg border-2 p-lg ${
        selected ? 'border-primary bg-primary/10' : 'border-border bg-surface'
      }`}>
      <Text className="text-2xl">{icon}</Text>
      <View className="flex-1">
        <Text variant="subheading" color={selected ? 'primary' : undefined}>
          {name}
        </Text>
      </View>
      <View
        className={`h-6 w-6 items-center justify-center rounded-full border-2 ${
          selected ? 'border-primary bg-primary' : 'border-border-hover bg-transparent'
        }`}>
        {selected && (
          <Text className="text-xs font-bold text-white" accessibilityElementsHidden>
            ✓
          </Text>
        )}
      </View>
    </Pressable>
  );
}
