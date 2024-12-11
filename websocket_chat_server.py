import asyncio
import json
import websockets
from dict import *

async def notify_online_users():
    """
    Notifies all online users about the current list of online users.
    """
    if online_users:
        message = {
            "action": "update_online_users",
            "online_users": list(online_users.keys())
        }
        await asyncio.gather(
            *(user["websocket"].send(json.dumps(message)) for user in online_users.values())
        )


async def handler(websocket):
    """
    Handles incoming WebSocket connections and messages.

    :param websocket: The WebSocket connection.
    :type websocket: websockets.WebSocketServerProtocol
    """
    try:
        initial_msg = await websocket.recv()
        data = json.loads(initial_msg)

        if data.get("action") == "register_username" and "username" in data:
            username = data["username"]

            with online_users_lock:
                online_users[username] = {
                    "ip": websocket.remote_address[0],
                    "port": websocket.remote_address[1],
                    "websocket": websocket
                }
            await notify_online_users()
        else:
            await websocket.close()
            return

        async for message in websocket:
            data = json.loads(message)
            action = data.get("action")

            if action == "send_message":
                sender = data.get("sender")
                recipient = data.get("recipient")
                msg = data.get("message", "")

                if recipient in online_users:
                    payload = {
                        "action": "receive_message",
                        "sender": sender,
                        "message": msg
                    }
                    await online_users[recipient]["websocket"].send(json.dumps(payload))
                else:
                    payload = {
                        "action": "receive_message",
                        "sender": "System",
                        "message": f"{recipient} is not online."
                    }
                    await online_users[sender]["websocket"].send(json.dumps(payload))

    except websockets.ConnectionClosed:
        disconnected_username = None
        with online_users_lock:
            for username, user_data in list(online_users.items()):
                if user_data["websocket"] == websocket:
                    disconnected_username = username
                    del online_users[username]
                    break
        await notify_online_users()



async def main():
    """
    Starts the WebSocket server.
    """
    async with websockets.serve(handler, "127.0.0.1", 30001):
        print("WebSocket chat server listening on ws://127.0.0.1:30001")
        await asyncio.Future() 

if __name__ == "__main__":
    asyncio.run(main())
