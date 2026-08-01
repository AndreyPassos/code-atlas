import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { Card } from './card';

describe('Card', () => {
  it('renders children', async () => {
    await render(
      <Card>
        <Text>Card content</Text>
      </Card>
    );
    expect(screen.getByText('Card content')).toBeTruthy();
  });

  it('renders with multiple children', async () => {
    await render(
      <Card>
        <Text>First</Text>
        <Text>Second</Text>
      </Card>
    );
    expect(screen.getByText('First')).toBeTruthy();
    expect(screen.getByText('Second')).toBeTruthy();
  });
});
