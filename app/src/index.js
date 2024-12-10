import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';  // Import App component where CurrencyConverter is used
import reportWebVitals from './reportWebVitals';
import SearchAppBar from './Navbar';  // Import your Navbar component
import { createTheme } from "@mui/material";
import { green } from "@mui/material/colors";
import { ThemeProvider } from '@emotion/react';

// Create a theme with Material UI
const theme = createTheme({
    palette: {
        primary: green,  // Set the primary color to green
    },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <SearchAppBar />  {/* Render the Navbar at the top */}
      <App />  {/* Render your main App component */}
    </ThemeProvider>
  </React.StrictMode>
);

// Performance measuring (optional)
reportWebVitals();
