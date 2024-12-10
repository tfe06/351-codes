from Database import *
from request import *
from response import *
from product import *
from user import *
from Authentication import *
import json

def insert_product_handler(request):
    """Handles adding a product."""
    response = HttpResponse()
    conn = sqlite3.connect("auboutique.db")
    try:
        body = json.loads(request.split("\r\n\r\n")[1])
        username = body.get("username")
        name = body.get("name")
        picture = body.get("picture")  
        price = body.get("price")
        description = body.get("description")
        quantity = body.get("quantity")
        if not picture or picture.strip() == "":
            picture = "http://127.0.0.1:30000/static/default_image.png"  
        if not all([username, name, picture, price, description, quantity]):
            response.set_status_code(400)
            response.set_body(json.dumps({"message": "Missing required fields"}))
            return response

        if insertProducts(username, name, picture, price, description, quantity, conn):
            response.set_status_code(201)
            response.set_body(json.dumps({"message": "Product added successfully"}))
        else:
            response.set_status_code(400)
            response.set_body(json.dumps({"message": "Failed to add product"}))
    except json.JSONDecodeError:
        response.set_status_code(400)
        response.set_body(json.dumps({"message": "Invalid JSON format"}))
    except Exception as e:
        print(f"[SERVER] Error in insert_product_handler: {e}")
        response.set_status_code(500)
        response.set_body(json.dumps({"message": "Internal server error"}))
    finally:
        conn.close()
    return response


def remove_product_handler(request, client_address):
    """Handles removing a product with validation."""
    response = HttpResponse()
    conn = sqlite3.connect("auboutique.db")
    try:
        body = json.loads(request.split("\r\n\r\n")[1])
        username = body.get("username")  
        name = body.get("name") 
        if not all([username, name]):
            response.set_status_code(400)
            response.set_body(json.dumps({"message": "Missing required fields"}))
            return response

        if removeProducts(username, name, conn, client_address, online_users):
            response.set_status_code(200)
            response.set_body(json.dumps({"message": "Product removed successfully"}))
        else:
            response.set_status_code(403)
            response.set_body(json.dumps({"message": "Unauthorized or product not found"}))
    except json.JSONDecodeError:
        response.set_status_code(400)
        response.set_body(json.dumps({"message": "Invalid JSON format"}))
    except Exception as e:
        print(f"[SERVER] Error in remove_product_handler: {e}")
        response.set_status_code(500)
        response.set_body(json.dumps({"message": "Internal server error"}))
    finally:
        conn.close()
    return response




def update_product_handler(request, client_address):
    """Handles updating a product with validation."""
    response = HttpResponse()
    conn = sqlite3.connect("auboutique.db")
    try:
        body = json.loads(request.split("\r\n\r\n")[1])
        username = body.get("username")
        name = body.get("name")
        picture = body.get("picture")
        price = body.get("price")
        description = body.get("description")
        quantity = body.get("quantity")

        if not all([username, name, picture, price, description, quantity]):
            response.set_status_code(400)
            response.set_body(json.dumps({"message": "Missing required fields"}))
            return response

        if updateProducts(username, name, picture, price, description, quantity, conn, client_address, online_users):
            response.set_status_code(200)
            response.set_body(json.dumps({"message": "Product updated successfully"}))
        else:
            response.set_status_code(403)  
            response.set_body(json.dumps({"message": "Unauthorized or product not found"}))
    except json.JSONDecodeError:
        response.set_status_code(400)
        response.set_body(json.dumps({"message": "Invalid JSON format"}))
    except Exception as e:
        print(f"[SERVER] Error in update_product_handler: {e}")
        response.set_status_code(500)
        response.set_body(json.dumps({"message": "Internal server error"}))
    finally:
        conn.close()
    return response


def buy_product_handler(request):
    response = HttpResponse()
    conn = sqlite3.connect("auboutique.db")

    try:
        body = json.loads(request.split("\r\n\r\n")[1])
        product_name = body.get("product_name")
        buyer_username = body.get("buyer_username")
        quantity_to_buy = body.get("quantity_to_buy")

        if not all([product_name, buyer_username, quantity_to_buy]):
            response.set_status_code(400)
            response.set_body(json.dumps({"message": "Missing required fields"}))
            return response

        quantity_to_buy = int(quantity_to_buy)

        if buyProducts(product_name, buyer_username, quantity_to_buy, conn, online_users):
            response.set_status_code(200)
            response.set_body(json.dumps({"message": "Product purchased successfully"}))
        else:
            response.set_status_code(400)
            response.set_body(json.dumps({"message": "Failed to purchase product"}))
    except ValueError:
        response.set_status_code(400)
        response.set_body(json.dumps({"message": "Invalid quantity format"}))
    except json.JSONDecodeError:
        response.set_status_code(400)
        response.set_body(json.dumps({"message": "Invalid JSON format"}))
    except Exception as e:
        print(f"[SERVER] Error in buy_product_handler: {e}")
        response.set_status_code(500)
        response.set_body(json.dumps({"message": "Internal server error"}))
    finally:
        conn.close()

    return response



def view_all_products_handler():
    response = HttpResponse()
    conn = sqlite3.connect("auboutique.db")
    try:
        products = getAllProducts(conn)
        if products:
            product_list = [
                {
                    "username": p[0],
                    "name": p[1],
                    "picture": p[2],
                    "price": p[3],
                    "description": p[4],
                    "quantity": p[5],  
                }
                for p in products
            ]
            response.set_status_code(200)
            response.set_body(json.dumps({"products": product_list}))
        else:
            response.set_status_code(200)
            response.set_body(json.dumps({"products": []}))
    except sqlite3.Error as e:
        print(f"[SERVER] Error in view_all_products_handler: {e}")
        response.set_status_code(500)
        response.set_body(json.dumps({"message": "Internal server error"}))
    finally:
        conn.close()
    return response

def search_product_handler(request):
    """Handles searching for products."""
    response = HttpResponse()
    conn = connect_to_database()

    try:
        # Extract search query from request
        body = json.loads(request.split("\r\n\r\n")[1])
        query = body.get("query", "").strip()

        if not query:
            response.set_status_code(400)
            response.set_body(json.dumps({"message": "Missing search query"}))
            return response

        cursor = conn.cursor()
        cursor.execute("""
            SELECT * FROM Products 
            WHERE LOWER(name) LIKE LOWER(?) OR LOWER(description) LIKE LOWER(?)
        """, (f"%{query}%", f"%{query}%"))
        
        products = cursor.fetchall()

        if products:
            product_list = [
                {
                    "username": p[0],
                    "name": p[1],
                    "picture": p[2],
                    "price": p[3],
                    "description": p[4],
                    "quantity": p[5],
                }
                for p in products
            ]
            response.set_status_code(200)
            response.set_body(json.dumps({"products": product_list}))
        else:
            response.set_status_code(404)
            response.set_body(json.dumps({"message": "No products found"}))

    except Exception as e:
        print(f"[SERVER] Error in search_product_handler: {e}")
        response.set_status_code(500)
        response.set_body(json.dumps({"message": "Internal server error"}))

    finally:
        conn.close()
    return response


def rate_product_handler(request):
    """
    Handles rating a product by a user.
    Adds or updates the rating and recalculates the average rating for the product.
    """
    response = HttpResponse()
    conn = sqlite3.connect("auboutique.db")

    try:
        # Parse the request body
        body = json.loads(request.split("\r\n\r\n")[1])
        product_name = body.get("product_name")
        username = body.get("username")
        rating = body.get("rating")

        # Debug: Log received data
        print("[DEBUG] Received data in rate_product_handler:", flush=True)
        print(f"Product Name: {product_name}", flush=True)
        print(f"Username: {username}", flush=True)
        print(f"Rating: {rating}", flush=True)

        # Validation
        if not all([product_name, username, rating]):
            response.set_status_code(400)
            response.set_body(json.dumps({"message": "Missing required fields"}))
            print("[ERROR] Missing required fields for rating.", flush=True)
            return response

        if not (1 <= rating <= 5):
            response.set_status_code(400)
            response.set_body(json.dumps({"message": "Rating must be between 1 and 5"}))
            print(f"[ERROR] Invalid rating value: {rating}", flush=True)
            return response

        cursor = conn.cursor()

        # Check if the user has already rated the product
        print(f"[DEBUG] Checking if user '{username}' has already rated product '{product_name}'...", flush=True)
        cursor.execute(
            "SELECT id FROM Ratings WHERE product_name = ? AND username = ?",
            (product_name, username),
        )
        existing_rating = cursor.fetchone()

        if existing_rating:
            # Update the existing rating
            print(f"[DEBUG] User '{username}' already rated '{product_name}'. Updating rating...", flush=True)
            cursor.execute(
                "UPDATE Ratings SET rating = ? WHERE id = ?",
                (rating, existing_rating[0]),
            )
        else:
            # Insert a new rating
            print(f"[DEBUG] Inserting new rating for user '{username}' on product '{product_name}'...", flush=True)
            cursor.execute(
                "INSERT INTO Ratings (product_name, username, rating) VALUES (?, ?, ?)",
                (product_name, username, rating),
            )

        # Calculate the new average rating for the product
        print(f"[DEBUG] Calculating new average rating for product '{product_name}'...", flush=True)
        cursor.execute(
            "SELECT AVG(rating) FROM Ratings WHERE product_name = ?",
            (product_name,),
        )
        new_average = cursor.fetchone()[0] or 0
        print(f"[DEBUG] New average rating for '{product_name}': {new_average:.2f}", flush=True)

        # Update the product table with the new average rating
        print(f"[DEBUG] Updating Products table with the new average rating for '{product_name}'...", flush=True)
        cursor.execute(
            "UPDATE Products SET average_rating = ? WHERE name = ?",
            (round(new_average, 2), product_name),
        )

        # Commit changes
        conn.commit()
        print("[DEBUG] Rating successfully updated and committed to the database.", flush=True)

        # Send the new average rating back to the client
        response.set_status_code(201)
        response.set_body(json.dumps({
            "message": "Rating submitted successfully",
            "new_average": round(new_average, 2),  # Rounded for better display
        }))

    except json.JSONDecodeError:
        response.set_status_code(400)
        response.set_body(json.dumps({"message": "Invalid JSON format"}))
        print("[ERROR] JSON decode error in rating handler.", flush=True)
    except sqlite3.Error as e:
        response.set_status_code(500)
        response.set_body(json.dumps({"message": "Database error"}))
        print(f"[ERROR] SQLite error in rating handler: {e}", flush=True)
    except Exception as e:
        response.set_status_code(500)
        response.set_body(json.dumps({"message": "Internal server error"}))
        print(f"[ERROR] Unexpected error in rating handler: {e}", flush=True)
    finally:
        conn.close()

    return response
