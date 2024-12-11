import React from "react";

/**
 * A component that displays a list of online users and allows starting a chat with them.
 *
 * @param {Array<string>} onlineUsers - An array of usernames representing the online users.
 * @param {function} startChat - A function to start a chat with a selected user.
 * @returns {JSX.Element} The OnlineUsers component.
 */
export default function OnlineUsers({ onlineUsers, startChat }) {
    return (
        <div>
            <h2>Online Users</h2>
            {onlineUsers.length > 0 ? (
                onlineUsers.map((user) => (
                    <button key={user} onClick={() => startChat(user)}>
                        {user}
                    </button>
                ))
            ) : (
                <p>No users online</p>
            )}
        </div>
    );
}