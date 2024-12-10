import React, { useState } from 'react';
import CurrencySwitcher from './CurrencySwitcher';  // Ensure it's imported
import { Button } from "@mui/material";

function App() {
  // Login state tracking
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Simulate login action
  const handleLogin = () => {
    setIsLoggedIn(true);  // Set to logged in
  };

  // Simulate logout action
  const handleLogout = () => {
    setIsLoggedIn(false);  // Set to logged out
  };


}

export default App;

