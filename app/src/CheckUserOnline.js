import React, { useState } from "react";
import { Box, TextField, Button, Typography, Stack } from "@mui/material";

/**
 * A component that allows users to check if a specific user is online.
 *
 * @returns {JSX.Element} The CheckUserOnline component.
 */
export default function CheckUserOnline() {
  /**
   * Tracks the username to be checked.
   * Initially set to an empty string.
   *
   * @type {string}
   */
  const [username, setUsername] = useState("");

  /**
   * Tracks the status message returned from the server.
   * Initially set to an empty string.
   *
   * @type {string}
   */
  const [statusMessage, setStatusMessage] = useState("");

  /**
   * Tracks the error message if the request fails.
   * Initially set to an empty string.
   *
   * @type {string}
   */
  const [errorMessage, setErrorMessage] = useState("");

  /**
   * Handles the action of checking if a user is online.
   *
   * Sends a POST request to the server with the username.
   * Updates the status or error message based on the server response.
   */
  const handleCheckOnline = async () => {
    try {
      console.log("Sending request with username:", username); // Debug log
      const response = await fetch("http://127.0.0.1:30000/check_online", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      console.log("Response status:", response.status); // Debug log
      if (response.ok) {
        const data = await response.json();
        console.log("Response data:", data); // Debug log
        setStatusMessage(data.message);
        setErrorMessage("");
      } else {
        const errorData = await response.json();
        console.error("Error data:", errorData); // Debug log
        setErrorMessage(errorData.message || "Failed to check user status.");
        setStatusMessage("");
      }
    } catch (error) {
      console.error("Fetch error:", error); // Debug log
      setErrorMessage("An error occurred. Please try again.");
      setStatusMessage("");
    }
  };
  
  return (
    <Box sx={{ padding: 4 }}>
      <Stack spacing={2}>
        <Typography variant="h5">Check User Online Status</Typography>
        <TextField
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        {errorMessage && <Typography color="error">{errorMessage}</Typography>}
        {statusMessage && <Typography color="primary">{statusMessage}</Typography>}
        <Button variant="contained" onClick={handleCheckOnline}>
          Check Online
        </Button>
      </Stack>
    </Box>
  );
}
