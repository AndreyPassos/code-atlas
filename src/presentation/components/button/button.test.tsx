import { render, fireEvent, screen } from '@testing-library/react-native';
import { Button } from './button';

describe('Button', () => {
  it('renders with label', async () => {
    await render(<Button onPress={() => {}}>Press me</Button>);
    expect(screen.getByText('Press me')).toBeTruthy();
  });

  it('calls onPress when pressed', async () => {
    const onPress = jest.fn();
    await render(<Button onPress={onPress}>Press me</Button>);
    const button = screen.getByTestId('button');
    button.props.onPress();
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders primary variant by default', async () => {
    await render(<Button onPress={() => {}}>Primary</Button>);
    expect(screen.getByText('Primary')).toBeTruthy();
  });

  it('renders secondary variant', async () => {
    await render(
      <Button variant="secondary" onPress={() => {}}>
        Secondary
      </Button>
    );
    expect(screen.getByText('Secondary')).toBeTruthy();
  });

  it('renders ghost variant', async () => {
    await render(
      <Button variant="ghost" onPress={() => {}}>
        Ghost
      </Button>
    );
    expect(screen.getByText('Ghost')).toBeTruthy();
  });

  it('disables when disabled prop is true', async () => {
    const onPress = jest.fn();
    await render(
      <Button disabled onPress={onPress}>
        Disabled
      </Button>
    );
    fireEvent.press(screen.getByTestId('button'));
    expect(onPress).not.toHaveBeenCalled();
  });
});
