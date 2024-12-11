import { render, screen } from '@testing-library/react';
import App from './App';

/**
 * Tests if the "learn react" link is rendered in the App component.
 *
 * This test uses the React Testing Library to render the App component and then checks if an element containing the text "learn react" is present in the document.
 */
test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});