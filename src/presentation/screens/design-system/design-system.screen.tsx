import { ScrollView, View } from 'react-native';
import {
  Button,
  Input,
  Text,
  Card,
  Avatar,
  Badge,
  Spinner,
  Skeleton,
  EmptyState,
  ErrorState,
  Divider,
  Surface,
} from '../../components';

export function DesignSystemScreen() {
  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-lg gap-xl">
        {/* Typography */}
        <View className="gap-sm">
          <Text variant="heading">Typography</Text>
          <Divider />
          <Text variant="heading">Heading</Text>
          <Text variant="subheading">Subheading</Text>
          <Text variant="body">Body text</Text>
          <Text variant="caption">Caption</Text>
          <Text variant="label">Label</Text>
        </View>

        {/* Colors */}
        <View className="gap-sm">
          <Text variant="heading">Colors</Text>
          <Divider />
          <Text color="primary">Primary text</Text>
          <Text color="secondary">Secondary text</Text>
          <Text color="tertiary">Tertiary text</Text>
          <Text color="error">Error text</Text>
          <Text color="success">Success text</Text>
        </View>

        {/* Buttons */}
        <View className="gap-sm">
          <Text variant="heading">Buttons</Text>
          <Divider />
          <Button onPress={() => {}}>Primary</Button>
          <Button variant="secondary" onPress={() => {}}>Secondary</Button>
          <Button variant="ghost" onPress={() => {}}>Ghost</Button>
          <Button disabled onPress={() => {}}>Disabled</Button>
        </View>

        {/* Input */}
        <View className="gap-sm">
          <Text variant="heading">Input</Text>
          <Divider />
          <Input placeholder="Search..." onChangeText={() => {}} />
          <Input label="With Label" placeholder="Enter value" onChangeText={() => {}} />
          <Input error="This is an error" placeholder="Error state" onChangeText={() => {}} />
        </View>

        {/* Card */}
        <View className="gap-sm">
          <Text variant="heading">Card</Text>
          <Divider />
          <Card>
            <Text variant="body">Card content goes here</Text>
          </Card>
        </View>

        {/* Avatar */}
        <View className="gap-sm">
          <Text variant="heading">Avatar</Text>
          <Divider />
          <View className="flex-row gap-md">
            <Avatar name="John Doe" size="sm" />
            <Avatar name="John Doe" size="md" />
            <Avatar name="John Doe" size="lg" />
            <Avatar name="John Doe" size="xl" />
          </View>
        </View>

        {/* Badge */}
        <View className="gap-sm">
          <Text variant="heading">Badge</Text>
          <Divider />
          <View className="flex-row gap-sm flex-wrap">
            <Badge label="Default" />
            <Badge label="Success" variant="success" />
            <Badge label="Error" variant="error" />
            <Badge label="Warning" variant="warning" />
          </View>
        </View>

        {/* Loading */}
        <View className="gap-sm">
          <Text variant="heading">Loading States</Text>
          <Divider />
          <Spinner size="sm" />
          <Spinner size="md" />
          <Spinner size="lg" />
        </View>

        {/* Skeleton */}
        <View className="gap-sm">
          <Text variant="heading">Skeleton</Text>
          <Divider />
          <Skeleton height={20} />
          <Skeleton height={20} width="80%" />
          <Skeleton height={20} width="60%" />
        </View>

        {/* Empty State */}
        <View className="gap-sm">
          <Text variant="heading">Empty State</Text>
          <Divider />
          <EmptyState
            icon="📭"
            title="No data"
            description="There's nothing to show here"
          />
        </View>

        {/* Error State */}
        <View className="gap-sm">
          <Text variant="heading">Error State</Text>
          <Divider />
          <ErrorState
            message="Something went wrong while loading data"
            onRetry={() => {}}
          />
        </View>

        {/* Surface */}
        <View className="gap-sm">
          <Text variant="heading">Surface</Text>
          <Divider />
          <Surface className="p-lg">
            <Text variant="body">Surface content</Text>
          </Surface>
        </View>
      </View>
    </ScrollView>
  );
}
