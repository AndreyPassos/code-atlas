import { View, Image, Text as RNText } from 'react-native';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  uri?: string | null;
  name: string;
  size?: AvatarSize;
}

const sizeClasses: Record<AvatarSize, string> = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-14 h-14',
  xl: 'w-20 h-20',
};

const textSizeClasses: Record<AvatarSize, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-lg',
  xl: 'text-xl',
};

function getInitials(name: string): string {
  return name
    .split(/[\s._-]+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function Avatar({ uri, name, size = 'md' }: AvatarProps) {
  if (uri) {
    return (
      <Image
        source={{ uri }}
        className={`${sizeClasses[size]} rounded-full`}
        accessibilityLabel={`Avatar of ${name}`}
      />
    );
  }

  return (
    <View
      className={`${sizeClasses[size]} rounded-full bg-primary items-center justify-center`}
      accessibilityLabel={`Avatar of ${name}`}
    >
      <RNText className={`text-white font-semibold ${textSizeClasses[size]}`}>
        {getInitials(name)}
      </RNText>
    </View>
  );
}
