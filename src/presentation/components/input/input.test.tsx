import { render, fireEvent, screen } from '@testing-library/react-native';
import { Input } from './input';

describe('Input', () => {
  it('renders with placeholder', async () => {
    await render(<Input placeholder="Search..." onChangeText={() => {}} />);
    expect(screen.getByPlaceholderText('Search...')).toBeTruthy();
  });

  it('calls onChangeText when text changes', async () => {
    const onChangeText = jest.fn();
    await render(
      <Input testID="input" placeholder="Search..." onChangeText={onChangeText} />
    );
    const input = screen.getByTestId('input');
    input.props.onChangeText('react');
    expect(onChangeText).toHaveBeenCalledWith('react');
  });

  it('renders with label', async () => {
    await render(
      <Input label="Search" placeholder="Search..." onChangeText={() => {}} />
    );
    expect(screen.getByText('Search')).toBeTruthy();
  });

  it('renders with error message', async () => {
    await render(
      <Input error="Required" placeholder="Search..." onChangeText={() => {}} />
    );
    expect(screen.getByText('Required')).toBeTruthy();
  });
});
