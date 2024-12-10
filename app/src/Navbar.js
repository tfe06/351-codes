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
  Grid,
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

export default function SearchAppBar() {
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [openDialog, setOpenDialog] = useState(null);
  const [snackbarMessage, setSnackbarMessage] = useState(null);
  const [username, setUsername] = useState(null);
  const [productToUpdate, setProductToUpdate] = useState(null);
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem("cart")) || []);
  const [anchorEl, setAnchorEl] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  // Chat states
  const [chatRecipient, setChatRecipient] = useState(null);
  const [chatLog, setChatLog] = useState([]);
  const [message, setMessage] = useState("");
  const [messagesByUser, setMessagesByUser] = useState({});
  const [unreadCountsByUser, setUnreadCountsByUser] = useState({});
  const [chatUsersDialog, setChatUsersDialog] = useState(false);

  const openSnackbar = (message, severity = "success") => {
    setSnackbarMessage({ message, severity });
  };

  const closeSnackbar = () => {
    setSnackbarMessage(null);
  };

  const handleDialogClose = () => {
    setOpenDialog(null);
    setSelectedProduct(null);
    setProductToUpdate(null);
  };

  const handleRegisterSuccess = () => {
    setIsRegistered(true);
    setOpenDialog(null);
    openSnackbar("Registration successful!", "success");
  };

  const handleLoginSuccess = (newUsername) => {
    setUsername(newUsername);
    setIsLoggedIn(true);
    setOpenDialog(null);
    openSnackbar("Login successful!", "success");
    fetchProducts();

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
          // If currently chatting, show message immediately
          setChatLog((prevLog) => [...prevLog, { sender: data.sender, message: data.message }]);
        } else {
          // Increment unread message count for this sender
          setUnreadCountsByUser((prev) => {
            const currentCount = prev[data.sender] || 0;
            return { ...prev, [data.sender]: currentCount + 1 };
          });
        }
      }
    });
  };

  const handleLogoutSuccess = () => {
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
     // This will signal the server that the user disconnected
  };

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

  const handleUpdateProduct = (product) => {
    setProductToUpdate(product);
    setOpenDialog("updateProduct");
  };

  const handleCartClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCartClose = () => {
    setAnchorEl(null);
  };

  const addToCart = (product) => {
    // Prevent adding own product to cart
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

  const updateQuantity = (productName, newQuantity) => {
    if (newQuantity < 1) return;
    const updatedCart = cart.map((product) =>
      product.name === productName ? { ...product, quantity: newQuantity } : product
    );
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const removeFromCart = (productName) => {
    const updatedCart = cart.filter((item) => item.name !== productName);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

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

      // Refetch products to reflect the updated quantities immediately
      await fetchProducts();
    } catch (error) {
      console.error("Error during purchase:", error);
      openSnackbar(error.message || "Error during purchase", "error");
    }
  };

  const totalUnread = Object.values(unreadCountsByUser).reduce((sum, count) => sum + count, 0);

  const openChatUsersDialog = () => {
    setChatUsersDialog(true);
  };

  const closeChatUsersDialog = () => {
    setChatUsersDialog(false);
  };

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

  // Check if the currently chatting recipient is online
  const isRecipientOnline = () => {
    return onlineUsers.includes(chatRecipient);
  };

  // If recipient goes offline after we started chatting, show a system message
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
            <Grid container spacing={2}>
              {filteredProducts.map((product) => (
                <Grid item xs={12} sm={6} md={4} key={product.name}>
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
                </Grid>
              ))}
            </Grid>
          )
        )}
      </Box>
    </Box>
  );
}
