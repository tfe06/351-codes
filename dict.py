from threading import Lock

online_users = {}
online_users_lock = Lock()