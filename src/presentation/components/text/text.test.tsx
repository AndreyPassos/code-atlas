import { render, screen } from '@testing-library/react-native';
import { Text } from './text';

describe('Text', () => {
  it('renders body text by default', async () => {
    await render(<Text>Hello</Text>);
    expect(screen.getByText('Hello')).toBeTruthy();
  });

  it('renders heading variant', async () => {
    await render(<Text variant="heading">Title</Text>);
    expect(screen.getByText('Title')).toBeTruthy();
  });

  it('renders caption variant', async () => {
    await render(<Text variant="caption">Caption</Text>);
    expect(screen.getByText('Caption')).toBeTruthy();
  });

  it('applies secondary color', async () => {
    await render(<Text color="secondary">Secondary</Text>);
    expect(screen.getByText('Secondary')).toBeTruthy();
  });
});
