import React, { useState } from "react";
import { Box, Typography, TextField, Button, Paper, Stack } from "@mui/material";
import { styled } from "@mui/material/styles";
import { sendMessage } from "./socket";

/**
 * Styled component for message bubbles.
 *
 * @param {object} theme - The theme object provided by Material-UI.
 * @param {boolean} own - Boolean indicating if the message is sent by the current user.
 */
const MessageBubble = styled(Paper)(({ theme, own }) => ({
  padding: theme.spacing(1, 2),
  borderRadius: theme.shape.borderRadius * 2,
  maxWidth: '70%',
  marginBottom: theme.spacing(1),
  backgroundColor: own ? theme.palette.primary.main : theme.palette.grey[200],
  color: own ? theme.palette.primary.contrastText : theme.palette.text.primary
}));

/**
 * Styled component for message alignment.
 *
 * @param {boolean} own - Boolean indicating if the message is sent by the current user.
 */
const MessageContainer = styled('div')(({ own }) => ({
  display: 'flex',
  justifyContent: own ? 'flex-end' : 'flex-start',
}));

/**
 * A component that provides a chat interface for users to send and receive messages.
 *
 * @param {string} recipient - The recipient of the messages.
 * @param {string} sender - The sender of the messages.
 * @param {function} onClose - Function to close the chat box.
 * @returns {JSX.Element} The ChatBox component.
 */
export default function ChatBox({ recipient, sender, onClose }) {
  const [message, setMessage] = useState("");
  const [chatLog, setChatLog] = useState([]);

  /**
   * Handles sending a message.
   *
   * Validates the message, sends it using the sendMessage function, and updates the chat log.
   */
  const handleSendMessage = () => {
    if (message.trim()) {
      sendMessage(sender, recipient, message);
      setChatLog([...chatLog, { sender, message, timestamp: new Date() }]);
      setMessage("");
    }
  };


  return (
    <Box
      sx={{
        width: 350,
        borderRadius: 2,
        border: "1px solid #ccc",
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper'
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h6" noWrap>
          Chat with {recipient}
        </Typography>
      </Box>

      {/* Message Area */}
      <Box
        sx={{
          flex: 1,
          padding: 2,
          overflowY: "auto",
          bgcolor: '#f9f9f9',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {chatLog.map((chat, index) => {
          const own = chat.sender === sender;
          return (
            <MessageContainer key={index} own={own}>
              <MessageBubble own={own} elevation={1}>
                <Typography variant="body2">{chat.message}</Typography>
                {/* Optional timestamp */}
                <Typography variant="caption" sx={{ display: 'block', textAlign: own ? 'right' : 'left', mt: 0.5, opacity: 0.7 }}>
                  {chat.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </Typography>
              </MessageBubble>
            </MessageContainer>
          );
        })}
      </Box>

      {/* Input Area */}
      <Box sx={{ p: 2, borderTop: '1px solid #ddd', bgcolor: 'white' }}>
        <Stack direction="row" spacing={1}>
          <TextField
            variant="outlined"
            size="small"
            fullWidth
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button variant="contained" onClick={handleSendMessage}>
            Send
          </Button>
          <Button variant="outlined" color="error" onClick={onClose}>
            Close
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
