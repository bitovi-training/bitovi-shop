import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Input from './Input';

describe('Input', () => {
  it('associates the label with the field when given an id', () => {
    render(<Input id="email" label="Email" />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('reports typed values through onValueChange', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Input id="name" label="Name" onValueChange={onValueChange} />);
    await user.type(screen.getByLabelText('Name'), 'Bob');
    expect(onValueChange).toHaveBeenLastCalledWith('Bob', expect.anything());
  });

  it('shows a clear button once there is a value, and clearing empties the field', async () => {
    const user = userEvent.setup();
    render(<Input id="name" label="Name" />);
    const field = screen.getByLabelText('Name');
    expect(screen.queryByRole('button', { name: 'Clear input' })).not.toBeInTheDocument();

    await user.type(field, 'Bob');
    await user.click(screen.getByRole('button', { name: 'Clear input' }));

    expect(field).toHaveValue('');
    expect(field).toHaveFocus();
  });

  it('hides the clear button when disabled', () => {
    render(<Input id="name" label="Name" defaultValue="Bob" disabled />);
    expect(screen.queryByRole('button', { name: 'Clear input' })).not.toBeInTheDocument();
  });
});
