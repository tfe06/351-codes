import React from "react";
import { Button } from "@mui/material";

/**
 * A component that allows users to remove a product.
 *
 * @param {string} username - The username of the user removing the product.
 * @param {string} productName - The name of the product to be removed.
 * @param {function} onSnackbarOpen - Function to open a snackbar with a message.
 * @param {function} onProductChange - Function to handle product changes.
 * @returns {JSX.Element} The RemoveProduct component.
 */
export default function RemoveProduct({ username, productName, onSnackbarOpen, onProductChange }) {
    /**
     * Handles the product removal action.
     *
     * Sends a POST request to remove the product and updates the state based on the response.
     */
    const handleRemoveProduct = async () => {
        try {
            const response = await fetch("http://127.0.0.1:30000/remove_product", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username,
                    name: productName, 
                }),
            });

            if (response.ok) {
                onSnackbarOpen("Product removed successfully!", "success");
                onProductChange(); 
            } else {
                const errorData = await response.json();
                onSnackbarOpen(errorData.message || "Failed to remove product.", "error");
            }
        } catch (error) {
            console.error("Error removing product:", error);
            onSnackbarOpen("An error occurred while removing the product.", "error");
        }
    };

    return (
        <Button
            variant="contained"
            color="secondary"
            fullWidth
            onClick={handleRemoveProduct}
        >
            Remove Product
        </Button>
    );
}
