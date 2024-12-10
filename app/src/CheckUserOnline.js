import React, { useState } from "react";
import { Box, TextField, Button, Typography, Stack } from "@mui/material";

export default function CheckUserOnline() {
  const [username, setUsername] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
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
