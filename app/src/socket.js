let socket = null;

/**
 * Initializes the WebSocket connection and handles incoming messages.
 *
 * @param {string} username - The username of the logged-in user.
 * @param {function} onMessageHandler - The callback function to handle incoming WebSocket messages.
 * @returns {WebSocket} The WebSocket connection.
 */
export const initializeWebSocket = (username, onMessageHandler) => {
    socket = new WebSocket("ws://127.0.0.1:30001");
    
    socket.onopen = () => {
        console.log("WebSocket connection established.");
        const payload = {
            action: "register_username",
            username: username
        };
        socket.send(JSON.stringify(payload));
    };

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("Message from server:", data);
        onMessageHandler(data);
    };

    socket.onerror = (error) => {
        console.error("WebSocket error:", error);
    };

    socket.onclose = () => {
        console.log("WebSocket connection closed.");
    };

    return socket;
};

/**
 * Sends a message through the WebSocket connection.
 *
 * @param {string} sender - The username of the sender.
 * @param {string} recipient - The username of the recipient.
 * @param {string} message - The message to be sent.
 */
export const sendMessage = (sender, recipient, message) => {
    const payload = {
        action: "send_message",
        sender,
        recipient,
        message,
    };
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(payload));
    } else {
        console.error("WebSocket is not open. Message not sent:", payload);
    }
};

/**
 * Closes the WebSocket connection.
 */
export const closeWebSocket = () => {
    if (socket) {
        socket.close();
        socket = null;
    }
};
