import sqlite3

def connect_to_database() -> sqlite3.Connection:
    """Connects to the SQLite database."""
    return sqlite3.connect("auboutique.db")

def create_tables(conn: sqlite3.Connection):
    """Creates necessary tables in the database and adds missing columns."""
    try:
        cursor = conn.cursor()
        
        # Create Users table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS Users(
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                address VARCHAR(255) NOT NULL,
                username VARCHAR(255) NOT NULL PRIMARY KEY,
                password VARCHAR(255) NOT NULL
            )
        """)

        # Create Products table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS Products(
                username VARCHAR(255) NOT NULL,
                name VARCHAR(255) NOT NULL PRIMARY KEY,
                picture VARCHAR(255) NOT NULL,
                price FLOAT(4) NOT NULL,
                description TEXT,
                quantity INTEGER NOT NULL,
                FOREIGN KEY (username) REFERENCES Users(username)
            )
        """)

        # Check if 'average_rating' column exists in Products
        cursor.execute("PRAGMA table_info(Products);")
        columns = [column[1] for column in cursor.fetchall()]
        if 'average_rating' not in columns:
            cursor.execute("""
                ALTER TABLE Products ADD COLUMN average_rating FLOAT DEFAULT 0
            """)
            print("[SERVER] Added 'average_rating' column to Products table.")

        # Create Purchases table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS Purchases(
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                product_name VARCHAR(255) NOT NULL,
                buyer_username VARCHAR(255) NOT NULL,
                seller_username VARCHAR(255) NOT NULL,
                FOREIGN KEY (product_name) REFERENCES Products(name),
                FOREIGN KEY (buyer_username) REFERENCES Users(username),
                FOREIGN KEY (seller_username) REFERENCES Users(username)
            )
        """)

        # Create Ratings table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS Ratings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                product_name TEXT NOT NULL,
                username TEXT NOT NULL,
                rating INTEGER NOT NULL,
                FOREIGN KEY (product_name) REFERENCES Products(name),
                FOREIGN KEY (username) REFERENCES Users(username)
            )
        """)

        conn.commit()
        print("[SERVER] Tables created successfully.")
    except sqlite3.Error as e:
        print(f"[SERVER] Error creating tables: {e}")

