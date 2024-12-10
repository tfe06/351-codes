import sqlite3

def connect_to_database() -> sqlite3.Connection:
    """Connects to the SQLite database."""
    return sqlite3.connect("auboutique.db")


def insertProducts(username, name, picture, price, description, quantity, conn: sqlite3.Connection):
    """
    Inserts a new product into the database.
    """
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO Products (username, name, picture, price, description, quantity, average_rating)
            VALUES (?, ?, ?, ?, ?, ?, 0)
            """,
            (username, name, picture, price, description, quantity),
        )
        conn.commit()
        print("[SERVER] Product Successfully Inserted!")
        return True
    except sqlite3.Error as e:
        print(f"[SERVER] Error inserting product: {e}")
        return False


def buyProducts(name, buyer_username, quantity_to_buy, conn: sqlite3.Connection, online_users):
    """
    Handles purchasing a product.
    """
    try:
        cursor = conn.cursor()

        # Fetch product information
        cursor.execute("SELECT username, quantity FROM Products WHERE name = ?", (name,))
        product = cursor.fetchone()

        if not product:
            print("[SERVER] Product Not Found")
            return False

        seller_username, current_quantity = product

        # Validate quantity
        if quantity_to_buy > current_quantity:
            print("[SERVER] Requested quantity exceeds available stock")
            return False

        # Check if buyer is online
        if buyer_username not in online_users:
            print("[SERVER] Buyer is not a valid online user")
            return False

        if buyer_username == seller_username:
            print("[SERVER] Buyer cannot be the same as the seller")
            return False

        # Insert purchase record
        cursor.execute(
            "INSERT INTO Purchases (product_name, buyer_username, seller_username) VALUES (?, ?, ?)",
            (name, buyer_username, seller_username),
        )

        # Update or remove the product stock
        if quantity_to_buy == current_quantity:
            cursor.execute("DELETE FROM Products WHERE name = ?", (name,))
        else:
            cursor.execute(
                "UPDATE Products SET quantity = quantity - ? WHERE name = ?",
                (quantity_to_buy, name),
            )

        conn.commit()
        print("[SERVER] Product purchase recorded and stock updated successfully!")
        return True
    except sqlite3.Error as e:
        print(f"[SERVER] Error buying product: {e}")
        return False


def removeProducts(username, name, conn: sqlite3.Connection, client_address, online_users):
    """
    Removes a product from the database.
    """
    try:
        if username not in online_users or online_users[username]["ip"] != client_address[0]:
            print("[SERVER] Unauthorized access attempt for product removal.")
            return False

        cursor = conn.cursor()
        cursor.execute("SELECT username FROM Products WHERE name = ?", (name,))
        product = cursor.fetchone()

        if not product or product[0] != username:
            print("[SERVER] Product not found or user is not the owner.")
            return False

        cursor.execute("DELETE FROM Products WHERE name = ? AND username = ?", (name, username))
        conn.commit()
        print("[SERVER] Product successfully removed.")
        return True
    except sqlite3.Error as e:
        print(f"[SERVER] Error removing product: {e}")
        return False


def updateProducts(username, name, picture, price, description, quantity, conn: sqlite3.Connection, client_address, online_users):
    """
    Updates product information.
    """
    try:
        if username not in online_users or online_users[username]["ip"] != client_address[0]:
            print("[SERVER] Unauthorized access attempt for product update.")
            return False

        cursor = conn.cursor()
        cursor.execute("SELECT username FROM Products WHERE name = ?", (name,))
        product = cursor.fetchone()

        if not product or product[0] != username:
            print("[SERVER] Product not found or user is not the owner.")
            return False

        cursor.execute(
            """
            UPDATE Products
            SET picture = ?, price = ?, description = ?, quantity = ?
            WHERE name = ?
            """,
            (picture, price, description, quantity, name),
        )
        conn.commit()
        print("[SERVER] Product successfully updated.")
        return True
    except sqlite3.Error as e:
        print(f"[SERVER] Error updating product: {e}")
        return False


def getProducts(conn: sqlite3.Connection, username: str):
    """
    Retrieves all products listed by a specific user.
    """
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM Products WHERE username = ?", (username,))
        return cursor.fetchall()
    except sqlite3.Error as e:
        print(f"[SERVER] Error retrieving products for user {username}: {e}")
        return None


def getAllProducts(conn: sqlite3.Connection):
    """
    Retrieves all products from the database.
    """
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM Products")
        return cursor.fetchall()
    except sqlite3.Error as e:
        print(f"[SERVER] Error retrieving all products: {e}")
        return None


def updateAverageRating(product_name, conn: sqlite3.Connection):
    """
    Updates the average rating for a product.
    """
    try:
        cursor = conn.cursor()

        # Calculate the new average rating
        cursor.execute(
            "SELECT AVG(rating) FROM Ratings WHERE product_name = ?",
            (product_name,),
        )
        new_average = cursor.fetchone()[0] or 0

        # Update the product table
        cursor.execute(
            "UPDATE Products SET average_rating = ? WHERE name = ?",
            (new_average, product_name),
        )
        conn.commit()
        print(f"[SERVER] Updated average rating for {product_name} to {new_average:.2f}")
    except sqlite3.Error as e:
        print(f"[SERVER] Error updating average rating for {product_name}: {e}")


def viewBuyers(seller_username, conn: sqlite3.Connection):
    """
    Retrieves a list of buyers for a seller's products.
    """
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT Purchases.buyer_username, Purchases.product_name, COUNT(Purchases.product_name) AS quantity
            FROM Purchases
            WHERE Purchases.seller_username = ?
            GROUP BY Purchases.buyer_username, Purchases.product_name
            """,
            (seller_username,),
        )
        return [
            {"buyer_username": row[0], "product_name": row[1], "quantity": row[2]}
            for row in cursor.fetchall()
        ]
    except sqlite3.Error as e:
        print(f"[SERVER] Error retrieving buyers: {e}")
        return []
