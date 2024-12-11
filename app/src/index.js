import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';  
import reportWebVitals from './reportWebVitals';
import SearchAppBar from './Navbar';  
import { createTheme } from "@mui/material";
import { green } from "@mui/material/colors";
import { ThemeProvider } from '@emotion/react';

/**
 * Creates a theme with Material UI.
 *
 * Sets the primary color to green.
 */
const theme = createTheme({
    palette: {
        primary: green,  // Set the primary color to green
    },
});

/**
 * The root element where the React application will be rendered.
 */
const root = ReactDOM.createRoot(document.getElementById('root'));

/**
 * Renders the React application.
 *
 * Wraps the application in React.StrictMode and ThemeProvider to apply the custom theme.
 * Renders the SearchAppBar component at the top and the main App component.
 */
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <SearchAppBar />  {/* Render the Navbar at the top */}
      <App />  {/* Render your main App component */}
    </ThemeProvider>
  </React.StrictMode>
);

/**
 * Optional function to measure performance.
 */
reportWebVitals();