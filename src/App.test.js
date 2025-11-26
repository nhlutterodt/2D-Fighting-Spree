import { render, screen } from '@testing-library/react';
import App from './App';

test('renders landing headline', () => {
  render(<App />);
  const heading = screen.getByText(/2d fighter - ui flow preview/i);
  expect(heading).toBeInTheDocument();
});
