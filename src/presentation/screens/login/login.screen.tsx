import { View } from 'react-native';
import { Text, Button } from '../../components';
import { useAuthStore } from '../../../infrastructure/hooks';

export function LoginScreen() {
  const setUser = useAuthStore((state) => state.setUser);

  const handleLogin = () => {
    // OAuth flow would be implemented here
    setUser({ login: 'demo', avatarUrl: '' });
  };

  return (
    <View className="flex-1 bg-background items-center justify-center p-xxl gap-xl">
      <Text variant="heading">Code Atlas</Text>
      <Text variant="body" color="secondary" className="text-center">
        Browse repositories from GitHub and GitLab
      </Text>
      <Button onPress={handleLogin}>Sign in with GitHub</Button>
      <Button variant="secondary" onPress={handleLogin}>
        Sign in with GitLab
      </Button>
    </View>
  );
}
