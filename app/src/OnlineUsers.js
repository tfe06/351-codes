import React from "react";

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
