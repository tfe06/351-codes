import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Dialog,
  Snackbar,
  Alert,
  Card,
  CardMedia,
  CardContent,
  Grid2,
  IconButton,
  Badge,
  Menu,
  TextField,
  Stack,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Avatar
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { ShoppingCart } from "@mui/icons-material";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import CurrencySwitcher from "./CurrencySwitcher";
import Login from "./Login";
import Register from "./Register";
import Logout from "./Logout";
import InsertProduct from "./InsertProduct";
import RemoveProduct from "./RemoveProduct";
import UpdateProduct from "./UpdateProduct";
import BuyProduct from "./BuyProduct";
import ViewBuyers from "./ViewBuyers";
import SearchBar from "./SearchBar";
import RatingComponent from "./RatingComponent";
import { initializeWebSocket, sendMessage, closeWebSocket } from "./socket";

// Styled components for chat bubbles
const MessageBubble = styled(Paper)(({ theme, own, system }) => ({
  padding: theme.spacing(1, 2),
  borderRadius: theme.shape.borderRadius * 2,
  maxWidth: '70%',
  marginBottom: theme.spacing(1),
  ...(system
    ? {
        backgroundColor: theme.palette.grey[300],
        color: theme.palette.text.secondary,
        fontStyle: 'italic'
      }
    : {
        backgroundColor: own ? theme.palette.primary.main : theme.palette.grey[200],
        color: own ? theme.palette.primary.contrastText : theme.palette.text.primary
      }
  ),
}));

const MessageContainer = styled('div')(({ own }) => ({
  display: 'flex',
  justifyContent: own ? 'flex-end' : 'flex-start',
}));

// Gradient top bar for the chat window
const ChatTopBar = styled('div')(({ theme }) => ({
  background: 'linear-gradient(to right, #4f9cf7, #4f80f7)',
  color: 'white',
  padding: theme.spacing(2),
  borderTopLeftRadius: theme.shape.borderRadius * 2,
  borderTopRightRadius: theme.shape.borderRadius * 2,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1)
}));


/**
 * The main component for the application's search app bar.
 *
 * @returns {JSX.Element} The SearchAppBar component.
 */
export default function SearchAppBar() {
  /**
   * Tracks the registration state of the user.
   * Initially set to false.
   *
   * @type {boolean}
   */
  const [isRegistered, setIsRegistered] = useState(false);

  /**
   * Tracks the login state of the user.
   * Initially set to false.
   *
   * @type {boolean}
   */
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  /**
   * Tracks the list of products.
   * Initially set to an empty array.
   *
   * @type {Array<object>}
   */
  const [products, setProducts] = useState([]);

  /**
   * Tracks the list of filtered products based on search queries.
   * Initially set to an empty array.
   *
   * @type {Array<object>}
   */
  const [filteredProducts, setFilteredProducts] = useState([]);

  /**
   * Tracks the currently selected product.
   * Initially set to null.
   *
   * @type {object|null}
   */
  const [selectedProduct, setSelectedProduct] = useState(null);

  /**
   * Tracks the state of the currently open dialog.
   * Initially set to null.
   *
   * @type {string|null}
   */
  const [openDialog, setOpenDialog] = useState(null);

  /**
   * Tracks the message to be displayed in the snackbar.
   * Initially set to null.
   *
   * @type {object|null}
   */
  const [snackbarMessage, setSnackbarMessage] = useState(null);

  /**
   * Tracks the username of the logged-in user.
   * Initially set to null.
   *
   * @type {string|null}
   */
  const [username, setUsername] = useState(null);

  /**
   * Tracks the product to be updated.
   * Initially set to null.
   *
   * @type {object|null}
   */
  const [productToUpdate, setProductToUpdate] = useState(null);

  /**
   * Tracks the user's shopping cart.
   * Initially set to the cart stored in local storage or an empty array.
   *
   * @type {Array<object>}
   */
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem("cart")) || []);

  /**
   * Tracks the anchor element for the cart menu.
   * Initially set to null.
   *
   * @type {object|null}
   */
  const [anchorEl, setAnchorEl] = useState(null);

  /**
   * Tracks the list of online users.
   * Initially set to an empty array.
   *
   * @type {Array<string>}
   */
  const [onlineUsers, setOnlineUsers] = useState([]);

  /**
   * Tracks the recipient of the chat messages.
   * Initially set to null.
   *
   * @type {string|null}
   */
  const [chatRecipient, setChatRecipient] = useState(null);

  /**
   * Tracks the log of chat messages.
   * Initially set to an empty array.
   *
   * @type {Array<object>}
   */
  const [chatLog, setChatLog] = useState([]);

  /**
   * Tracks the current message being typed by the user.
   * Initially set to an empty string.
   *
   * @type {string}
   */
  const [message, setMessage] = useState("");

  /**
   * Tracks the messages grouped by user.
   * Initially set to an empty object.
   *
   * @type {object}
   */
  const [messagesByUser, setMessagesByUser] = useState({});

  /**
   * Tracks the count of unread messages by user.
   * Initially set to an empty object.
   *
   * @type {object}
   */
  const [unreadCountsByUser, setUnreadCountsByUser] = useState({});

  /**
   * Tracks the state of the chat users dialog.
   * Initially set to false.
   *
   * @type {boolean}
   */
  const [chatUsersDialog, setChatUsersDialog] = useState(false);

  /**
 * Opens a snackbar with a message.
 *
 * @param {string} message - The message to be displayed in the snackbar.
 * @param {string} [severity="success"] - The severity level of the message.
 */
  const openSnackbar = (message, severity = "success") => {
    setSnackbarMessage({ message, severity });
  };

  /**
   * Closes the snackbar.
   */
  const closeSnackbar = () => {
    setSnackbarMessage(null);
  };
  /**
  * Handles the action of closing the dialog.
  */
  const handleDialogClose = () => {
    setOpenDialog(null);
    setSelectedProduct(null);
    setProductToUpdate(null);
  };

  /**
  * Handles the action after a successful registration.
  */
  const handleRegisterSuccess = () => {
    setIsRegistered(true);
    setOpenDialog(null);
    openSnackbar("Registration successful!", "success");
  };

  /**
   * Handles the action after a successful login.
   *
   * @param {string} newUsername - The username of the logged-in user.
   */
  const handleLoginSuccess = (newUsername) => {
    setUsername(newUsername);
    setIsLoggedIn(true);
    setOpenDialog(null);
    openSnackbar("Login successful!", "success");
    fetchProducts();

    /**
     * Initializes the WebSocket connection and handles incoming messages.
     *
     * @param {string} newUsername - The username of the logged-in user.
     * @param {function} callback - The callback function to handle incoming WebSocket messages.
     */
    initializeWebSocket(newUsername, (data) => {
      if (data.action === "update_online_users") {
        setOnlineUsers(data.online_users);
      } else if (data.action === "receive_message") {
        setMessagesByUser((prev) => {
          const userMessages = prev[data.sender] || [];
          return {
            ...prev,
            [data.sender]: [...userMessages, { sender: data.sender, message: data.message }],
          };
        });

        if (data.sender === chatRecipient) {
          setChatLog((prevLog) => [...prevLog, { sender: data.sender, message: data.message }]);
        } else {
          setUnreadCountsByUser((prev) => {
            const currentCount = prev[data.sender] || 0;
            return { ...prev, [data.sender]: currentCount + 1 };
          });
        }
      }
    });
  };

  /**
   * Handles the action after a successful logout.
   */
  const handleLogoutSuccess = () => {
    closeWebSocket();
    setIsLoggedIn(false);
    setUsername(null);
    setOpenDialog(null);
    setProducts([]);
    setFilteredProducts([]);
    setOnlineUsers([]);
    setChatRecipient(null);
    setChatLog([]);
    setMessagesByUser({});
    setUnreadCountsByUser({});
    openSnackbar("Logout successful!", "success");
  };

  /**
   * Fetches the list of products from the server.
   *
   * Only fetches products if the user is logged in.
   * Updates the products and filtered products state with the fetched data.
   * Displays an error message if the fetch operation fails.
   */
  const fetchProducts = async () => {
    if (!isLoggedIn) return; // Only fetch if logged in
    try {
      const response = await fetch("http://127.0.0.1:30000/view_all_products", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (response.ok) {
        setProducts(data.products || []);
        setFilteredProducts(data.products || []);
      } else {
        openSnackbar("Failed to fetch products.", "error");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      openSnackbar("Error fetching products.", "error");
    }
  };

  /**
   * Handles the search functionality.
   *
   * Filters the products based on the search query and updates the filtered products state.
   *
   * @param {string} query - The search query entered by the user.
   */
  const handleSearch = (query) => {
    if (!query.trim()) {
      setFilteredProducts(products);
      return;
    }
    const results = products.filter((product) =>
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.description.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredProducts(results);
  };

  /**
   * Handles the action of updating a product.
   *
   * Sets the product to be updated and opens the update product dialog.
   *
   * @param {object} product - The product to be updated.
   */
  const handleUpdateProduct = (product) => {
    setProductToUpdate(product);
    setOpenDialog("updateProduct");
  };

  /**
   * Handles the action of clicking the cart icon.
   *
   * Sets the anchor element for the cart menu.
   *
   * @param {object} event - The event object from the cart icon click.
   */
  const handleCartClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  /**
   * Handles the action of closing the cart menu.
   *
   * Resets the anchor element for the cart menu.
   */
  const handleCartClose = () => {
    setAnchorEl(null);
  };

  /**
   * Adds a product to the cart.
   *
   * Prevents adding the user's own product to the cart and shows a warning message.
   *
   * @param {object} product - The product to be added to the cart.
   */
  const addToCart = (product) => {
    if (product.username === username) {
      openSnackbar("You cannot add your own product to the cart.", "warning");
      return;
    }

    let updatedCart = [...cart];
    const existingProductIndex = updatedCart.findIndex((item) => item.name === product.name);

    if (existingProductIndex > -1) {
      updatedCart[existingProductIndex].quantity += 1;
    } else {
      updatedCart.push({ ...product, quantity: 1 });
    }

    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  /**
   * Updates the quantity of a product in the cart.
   *
   * @param {string} productName - The name of the product to update.
   * @param {number} newQuantity - The new quantity of the product.
   */
  const updateQuantity = (productName, newQuantity) => {
    if (newQuantity < 1) return;
    const updatedCart = cart.map((product) =>
      product.name === productName ? { ...product, quantity: newQuantity } : product
    );
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  /**
   * Removes a product from the cart.
   *
   * @param {string} productName - The name of the product to remove.
   */
  const removeFromCart = (productName) => {
    const updatedCart = cart.filter((item) => item.name !== productName);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  /**
   * Handles the action of buying all products in the cart.
   */
  const handleCartBuyNow = async () => {
    try {
      for (const product of cart) {
        const response = await fetch("http://127.0.0.1:30000/buy_product", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            product_name: product.name,
            buyer_username: username,
            quantity_to_buy: product.quantity,
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || `Failed to buy ${product.name}`);
        }
      }

      setCart([]);
      localStorage.removeItem("cart");
      openSnackbar("All products purchased successfully!", "success");

      await fetchProducts();
    } catch (error) {
      console.error("Error during purchase:", error);
      openSnackbar(error.message || "Error during purchase", "error");
    }
  };

  /**
   * Calculates the total number of unread messages.
   *
   * @returns {number} The total number of unread messages.
   */
  const totalUnread = Object.values(unreadCountsByUser).reduce((sum, count) => sum + count, 0);

  /**
   * Opens the dialog showing online users.
   */
  const openChatUsersDialog = () => {
    setChatUsersDialog(true);
  };

  /**
   * Close the dialog showing online users.
   */
  const closeChatUsersDialog = () => {
    setChatUsersDialog(false);
  };

  /**
   * Handles the action of starting a chat with a recipient.
   *
   * @param {string} recipient - The recipient of the chat messages.
   */
  const handleStartChat = (recipient) => {
    setChatRecipient(recipient);
    setChatLog(messagesByUser[recipient] || []);
    setUnreadCountsByUser((prev) => {
      const updated = { ...prev };
      if (updated[recipient]) {
        updated[recipient] = 0;
      }
      return updated;
    });
    closeChatUsersDialog();
  };

  /**
   * Handles the action of sending a message.
   */
  const handleSendMessage = () => {
    if (!isRecipientOnline()) {
      return;
    }

    if (message.trim() !== "") {
      sendMessage(username, chatRecipient, message);

      setMessagesByUser((prev) => {
        const userMessages = prev[chatRecipient] || [];
        return {
          ...prev,
          [chatRecipient]: [...userMessages, { sender: username, message }],
        };
      });

      setChatLog((prevLog) => [...prevLog, { sender: username, message }]);
      setMessage("");
    }
  };

  /**
   * Checks if the currently chatting recipient is online.
   *
   * @returns {boolean} True if the recipient is online, false otherwise.
   */
  const isRecipientOnline = () => {
    return onlineUsers.includes(chatRecipient);
  };

  /**
   * Effect hook that shows a system message if the recipient goes offline after starting a chat.
   */
  useEffect(() => {
    if (chatRecipient && !isRecipientOnline()) {
      const alreadyNotified = chatLog.some(
        (msg) => msg.system && msg.message.includes("has disconnected")
      );
      if (!alreadyNotified) {
        setChatLog((prevLog) => [
          ...prevLog,
          { system: true, message: `${chatRecipient} has disconnected.` },
        ]);
      }
    }
  }, [onlineUsers, chatRecipient, chatLog]);

  /**
   * Effect hook that fetches products when the user logs in.
   */
  useEffect(() => {
    if (isLoggedIn) {
      fetchProducts();
    }
  }, [isLoggedIn]);

  const showNoProducts = isLoggedIn && filteredProducts.length === 0;

  return (
    <Box>
      <Snackbar open={Boolean(snackbarMessage)} autoHideDuration={6000} onClose={closeSnackbar}>
        {snackbarMessage && (
          <Alert onClose={closeSnackbar} severity={snackbarMessage.severity}>
            {snackbarMessage.message}
          </Alert>
        )}
      </Snackbar>

      {/* Dialogs for login/register/logout/etc. */}
      <Dialog open={openDialog === "login"} onClose={handleDialogClose}>
        <Login onSuccessfulLogin={handleLoginSuccess} fetchProducts={fetchProducts} />
      </Dialog>
      <Dialog open={openDialog === "register"} onClose={handleDialogClose}>
        <Register onSuccessfulRegistration={handleRegisterSuccess} />
      </Dialog>
      <Dialog open={openDialog === "logout"} onClose={handleDialogClose}>
        <Logout onSuccessfulLogout={handleLogoutSuccess} />
      </Dialog>
      <Dialog open={openDialog === "insertProduct"} onClose={handleDialogClose}>
        <InsertProduct
          username={username}
          onSnackbarOpen={openSnackbar}
          onClose={handleDialogClose}
          onProductChange={fetchProducts}
        />
      </Dialog>
      <Dialog open={openDialog === "viewBuyers"} onClose={handleDialogClose}>
        <ViewBuyers username={username} onClose={handleDialogClose} onSnackbarOpen={openSnackbar} />
      </Dialog>
      <Dialog open={openDialog === "updateProduct"} onClose={handleDialogClose}>
        <UpdateProduct
          product={productToUpdate}
          username={username}
          onSnackbarOpen={openSnackbar}
          onClose={handleDialogClose}
          onProductChange={fetchProducts}
        />
      </Dialog>
      <Dialog open={Boolean(selectedProduct)} onClose={handleDialogClose}>
        {selectedProduct && (
          <BuyProduct
            product={selectedProduct}
            username={username}
            onSnackbarOpen={openSnackbar}
            onClose={handleDialogClose}
            onProductChange={fetchProducts}
          />
        )}
      </Dialog>

      {/* Dialog showing online users */}
      <Dialog open={chatUsersDialog} onClose={closeChatUsersDialog}>
        <DialogTitle>Online Users</DialogTitle>
        <DialogContent>
          {onlineUsers.length === 0 ? (
            <Typography>No users are online.</Typography>
          ) : (
            onlineUsers.map((user) => {
              const userUnread = unreadCountsByUser[user] || 0;
              return (
                <Box key={user} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Button variant="outlined" color="success" onClick={() => handleStartChat(user)}>
                    CHAT WITH {user.toUpperCase()}
                  </Button>
                  {userUnread > 0 && (
                    <Typography variant="body2" color="error" sx={{ ml: 1 }}>
                      {userUnread} new message{userUnread > 1 ? 's' : ''}
                    </Typography>
                  )}
                </Box>
              );
            })
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeChatUsersDialog}>CLOSE</Button>
        </DialogActions>
      </Dialog>

      {/* Chat Box Dialog */}
      <Dialog open={Boolean(chatRecipient)} onClose={() => setChatRecipient(null)} PaperProps={{
        sx: {
          borderRadius: 4,
          overflow: 'hidden'
        }
      }}>
        {chatRecipient && (
          <Box sx={{ width: 360, display: 'flex', flexDirection: 'column', height: 500 }}>
            {/* Top bar shows the chat recipient and their status */}
            <ChatTopBar>
              <Avatar alt={chatRecipient} src="" sx={{ bgcolor: 'white', color: 'primary.main' }}>
                {chatRecipient.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  Chat with {chatRecipient}
                </Typography>
                <Typography variant="caption" sx={{ color: 'white' }}>
                  {isRecipientOnline() ? "Online" : "Offline"}
                </Typography>
              </Box>
              <Box flexGrow={1} />
              <IconButton onClick={() => setChatRecipient(null)} sx={{ color: 'white' }}>
                ✖
              </IconButton>
            </ChatTopBar>

            {/* Message area */}
            <Box
              sx={{
                flex: 1,
                padding: 2,
                overflowY: "auto",
                bgcolor: '#f9f9f9',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {chatLog.map((chat, index) => {
                const own = chat.sender === username;
                const system = chat.system;
                return (
                  <MessageContainer key={index} own={own}>
                    <MessageBubble own={own} system={system} elevation={1}>
                      <Typography variant="body2">{chat.message}</Typography>
                    </MessageBubble>
                  </MessageContainer>
                );
              })}
            </Box>

            {/* Input area */}
            <Box sx={{ p: 2, borderTop: '1px solid #ddd', bgcolor: 'white' }}>
              <Stack direction="row" spacing={1}>
                <TextField
                  variant="outlined"
                  size="small"
                  fullWidth
                  placeholder="Type your message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={!isRecipientOnline()}
                />
                <Button
                  variant="contained"
                  onClick={handleSendMessage}
                  sx={{ textTransform: 'none' }}
                  disabled={!isRecipientOnline()}
                >
                  Send
                </Button>
              </Stack>
            </Box>
          </Box>
        )}
      </Dialog>

      <AppBar position="fixed" sx={{ bgcolor: "green" }}>
        <Toolbar sx={{ justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6" sx={{ color: "white" }}>
            AUBoutique
          </Typography>
          {isLoggedIn && <SearchBar onSearch={handleSearch} />}
          <Box sx={{ display: "flex", gap: 1 }}>
            {!isLoggedIn ? (
              <>
                <Button variant="contained" onClick={() => setOpenDialog("login")} sx={{ color: "white", bgcolor: "green" }}>
                  Login
                </Button>
                <Button variant="contained" onClick={() => setOpenDialog("register")} sx={{ color: "white", bgcolor: "green" }}>
                  Register
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="contained"
                  onClick={() => setOpenDialog("insertProduct")}
                  sx={{ bgcolor: "white", color: "green" }}
                >
                  Insert Product
                </Button>
                <Button
                  variant="contained"
                  onClick={() => setOpenDialog("viewBuyers")}
                  sx={{ bgcolor: "white", color: "green" }}
                >
                  View Buyers
                </Button>
                <Button variant="contained" color="error" onClick={() => setOpenDialog("logout")}>
                  Logout
                </Button>
                <IconButton onClick={handleCartClick}>
                  <Badge badgeContent={cart.length} color="secondary">
                    <ShoppingCart sx={{ color: "white" }} />
                  </Badge>
                </IconButton>
                <IconButton onClick={openChatUsersDialog}>
                  <Badge badgeContent={totalUnread} color="error">
                    <ChatBubbleIcon sx={{ color: "white" }} />
                  </Badge>
                </IconButton>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCartClose}>
        <Box sx={{ width: 300, padding: 2 }}>
          <Typography variant="h6">Your Cart</Typography>
          {cart.length > 0 ? (
            <>
              {cart.map((product) => (
                <Box key={product.name} sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography>{product.name}</Typography>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <TextField
                      type="number"
                      value={product.quantity}
                      onChange={(e) => updateQuantity(product.name, parseInt(e.target.value))}
                      sx={{ width: "60px", marginRight: "10px" }}
                    />
                    <Button variant="outlined" color="error" onClick={() => removeFromCart(product.name)}>
                      Remove
                    </Button>
                  </Box>
                </Box>
              ))}
              <Button
                variant="contained"
                color="success"
                fullWidth
                sx={{ marginTop: "10px" }}
                onClick={handleCartBuyNow}
              >
                Buy Now
              </Button>
            </>
          ) : (
            <Typography variant="body2">Your cart is empty.</Typography>
          )}
        </Box>
      </Menu>

      <Box sx={{ mt: 10, padding: 2 }}>
        {showNoProducts ? (
          <Typography variant="h6" color="text.secondary" align="center">
            No products found.
          </Typography>
        ) : (
          isLoggedIn && (
            <Grid2 container spacing={2}>
              {filteredProducts.map((product) => (
                <Grid2 item xs={12} sm={6} md={4} key={product.name}>
                  <Card
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      boxShadow: 3,
                      "&:hover": { boxShadow: 6 },
                      maxWidth: 345,
                    }}
                  >
                    <CardMedia
                      component="img"
                      image={
                        (function getImage() {
                          try {
                            return require(`./images/${product.picture}`);
                          } catch (err) {
                            console.error(`Error loading image: ${product.picture}`, err);
                            return require(`./images/default.png`);
                          }
                        })()
                      }
                      alt={product.name}
                      sx={{ height: 145, objectFit: "contain" }}
                    />
                    <CardContent>
                      <Typography variant="h6">{product.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Owner: {product.username}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {product.description}
                      </Typography>
                      <Typography variant="body1" color="text.primary">
                        Price: ${product.price.toFixed(2)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Available Quantity: {product.quantity}
                      </Typography>
                      <RatingComponent
                        productName={product.name}
                        username={username}
                        averageRating={product.average_rating || 0}
                        onRatingSubmit={fetchProducts}
                      />
                      <CurrencySwitcher basePrice={product.price} />
                    </CardContent>
                    {username === product.username ? (
                      <>
                        <Button
                          variant="contained"
                          color="warning"
                          fullWidth
                          onClick={() => handleUpdateProduct(product)}
                        >
                          Update Product
                        </Button>
                        <RemoveProduct
                          username={username}
                          productName={product.name}
                          onSnackbarOpen={openSnackbar}
                          onProductChange={fetchProducts}
                        />
                      </>
                    ) : (
                      <Button variant="contained" color="primary" fullWidth onClick={() => addToCart(product)}>
                        Add to Cart
                      </Button>
                    )}
                  </Card>
                </Grid2>
              ))}
            </Grid2>
          )
        )}
      </Box>
    </Box>
  );
}
