let socket = null;

export const initializeWebSocket = (username, onMessageHandler) => {
    socket = new WebSocket("ws://127.0.0.1:30001");
    
    socket.onopen = () => {
        console.log("WebSocket connection established.");
        // Register the username with the server
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

export const closeWebSocket = () => {
    if (socket) {
        socket.close();
    }
};
