import asyncio
import json
import websockets

# Store connected users: username -> websocket
connected_users = {}

async def notify_online_users():
    # Broadcast the list of currently online users to all connected clients
    if connected_users:
        message = {
            "action": "update_online_users",
            "online_users": list(connected_users.keys())
        }
        # Use asyncio.gather for cleaner async call pattern
        await asyncio.gather(*(user.send(json.dumps(message)) for user in connected_users.values()))

async def handler(websocket):
    # When a client connects, it will send a message containing the username
    try:
        initial_msg = await websocket.recv()
        data = json.loads(initial_msg)
        
        if data.get("action") == "register_username" and "username" in data:
            username = data["username"]
            connected_users[username] = websocket
            await notify_online_users()
        else:
            # If the initial message is not correct, close the connection
            await websocket.close()
            return

        async for message in websocket:
            data = json.loads(message)
            action = data.get("action")

            if action == "send_message":
                sender = data.get("sender")
                recipient = data.get("recipient")
                msg = data.get("message", "")

                # Send the message to the recipient if online
                if recipient in connected_users:
                    payload = {
                        "action": "receive_message",
                        "sender": sender,
                        "message": msg
                    }
                    await connected_users[recipient].send(json.dumps(payload))
                else:
                    # Inform the sender that the recipient is offline
                    payload = {
                        "action": "receive_message",
                        "sender": "System",
                        "message": f"{recipient} is not online."
                    }
                    await connected_users[sender].send(json.dumps(payload))

    except websockets.ConnectionClosed:
        # Identify which user disconnected
        disconnected_username = None
        for uname, sock in list(connected_users.items()):
            if sock == websocket:
                disconnected_username = uname
                del connected_users[uname]
                break
        # Notify everyone else that a user went offline
        await notify_online_users()


async def main():
    # Start the WebSocket server on port 30001
    async with websockets.serve(handler, "127.0.0.1", 30001):
        print("WebSocket chat server listening on ws://127.0.0.1:30001")
        await asyncio.Future()  # run forever

if __name__ == "__main__":
    asyncio.run(main())
