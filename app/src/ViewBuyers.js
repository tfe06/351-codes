import React, { useState } from "react";
import { Button, TextField, Box, Typography, Stack, Dialog } from "@mui/material";

/**
 * A component that allows users to view the buyers of their products.
 *
 * @param {string} username - The username of the user viewing the buyers.
 * @param {function} onClose - Function to close the view buyers dialog.
 * @param {function} onSnackbarOpen - Function to open a snackbar with a message.
 * @returns {JSX.Element} The ViewBuyers component.
 */
export default function ViewBuyers({ username, onClose, onSnackbarOpen }) {
    const [buyers, setBuyers] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");

    /**
     * Handles the action of viewing buyers.
     *
     * Sends a POST request to fetch the buyers and updates the state based on the response.
     */
    const handleViewBuyers = async () => {
        try {
            const response = await fetch("http://127.0.0.1:30000/view_buyers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username }),
            });
            const data = await response.json();
            if (response.ok) {
                setBuyers(data.buyers || []);
                setErrorMessage("");
            } else {
                setErrorMessage(data.message || "Failed to fetch buyers.");
            }
        } catch (error) {
            setErrorMessage("An error occurred. Please try again.");
        }
    };

    useState(() => {
        handleViewBuyers();
    }, []);

    return (
        <Dialog open>
            <Box sx={{ padding: 4, width: 400 }}>
                <Typography variant="h5" sx={{ marginBottom: 2 }}>Buyers</Typography>
                {buyers.length > 0 ? (
                    buyers.map((buyer, index) => (
                        <Box key={index} sx={{ marginBottom: 2 }}>
                            <Typography variant="body1">
                                <strong>Buyer:</strong> {buyer.buyer_username}
                            </Typography>
                            <Typography variant="body2">
                                <strong>Product:</strong> {buyer.product_name}
                            </Typography>
                            <Typography variant="body2">
                                <strong>Quantity:</strong> {buyer.quantity}
                            </Typography>
                        </Box>
                    ))
                ) : (
                    <Typography variant="body2">No buyers found.</Typography>
                )}
                <Button
                    variant="contained"
                    onClick={onClose}
                    sx={{ marginTop: 2 }}
                >
                    Close
                </Button>
            </Box>
        </Dialog>
    );
}
