import { render, fireEvent, screen } from '@testing-library/react-native';
import { Input } from './input';

describe('Input', () => {
  it('renders with placeholder', async () => {
    await render(<Input placeholder="Search..." onChangeText={() => {}} />);
    expect(screen.getByPlaceholderText('Search...')).toBeTruthy();
  });

  it('calls onChangeText when text changes', async () => {
    const onChangeText = jest.fn();
    await render(<Input placeholder="Search..." onChangeText={onChangeText} />);
    // getByPlaceholderText targets the host TextInput directly. getByTestId
    // would be ambiguous here: both the composite <Input> element and the
    // TextInput it wraps carry the same testID when one is passed, and
    // fireEvent only dispatches on the host node.
    const input = screen.getByPlaceholderText('Search...');
    await fireEvent.changeText(input, 'react');
    expect(onChangeText).toHaveBeenCalledWith('react');
  });

  it('renders with label', async () => {
    await render(<Input label="Search" placeholder="Search..." onChangeText={() => {}} />);
    expect(screen.getByText('Search')).toBeTruthy();
  });

  it('renders with error message', async () => {
    await render(<Input error="Required" placeholder="Search..." onChangeText={() => {}} />);
    expect(screen.getByText('Required')).toBeTruthy();
  });
});
