import React, { useState } from "react";
import { Button, Dialog, TextField, Stack, Typography } from "@mui/material";

/**
 * A component that allows users to insert a new product.
 *
 * @param {string} username - The username of the user adding the product.
 * @param {function} onSnackbarOpen - Function to open a snackbar with a message.
 * @param {function} onClose - Function to close the insert product dialog.
 * @param {function} onProductChange - Function to handle product changes.
 * @returns {JSX.Element} The InsertProduct component.
 */
export default function InsertProduct({ username, onSnackbarOpen, onClose, onProductChange }) {
    /**
     * Tracks the data of the product to be inserted.
     * Initially set to an object with empty fields for name, picture, price, description, and quantity.
     *
     * @type {object}
     */
    const [productData, setProductData] = useState({
        name: "",
        picture: "",
        price: "",
        description: "",
        quantity: "",
    });

    /**
     * Tracks the error message if the request fails.
     * Initially set to an empty string.
     *
     * @type {string}
     */
    const [errorMessage, setErrorMessage] = useState("");

    /**
     * Handles changes to the input fields.
     *
     * Updates the productData state with the new values.
     *
     * @param {object} e - The event object from the input field.
     */
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProductData((prev) => ({ ...prev, [name]: value }));
    };

    /**
     * Handles the submission of the product data.
     *
     * Validates the input fields, sends a POST request to add the product, and updates the state based on the response.
     */
    const handleSubmit = async () => {
        if (!productData.name || !productData.picture || !productData.price || !productData.description || !productData.quantity) {
            onSnackbarOpen("All fields are required.", "error");
            return;
        }
        try {
            const response = await fetch("http://127.0.0.1:30000/add_product", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...productData, username }),
            });
            const data = await response.json();
            if (response.ok) {
                onSnackbarOpen("Product added successfully!", "success");
                onProductChange();
                onClose();
                setProductData({ name: "", picture: "", price: "", description: "", quantity: "" });
            } else {
                setErrorMessage(data.message || "Failed to add product.");
            }
        } catch (error) {
            setErrorMessage("An error occurred. Please try again.");
        }
    };

    return (
        <Dialog open>
            <Stack spacing={2} sx={{ padding: 3, minWidth: 300 }}>
                <Typography variant="h6">Insert New Product</Typography>
                <TextField
                    label="Product Name"
                    name="name"
                    value={productData.name}
                    onChange={handleInputChange}
                />
                <TextField
                    label="Picture URL"
                    name="picture"
                    value={productData.picture}
                    onChange={handleInputChange}
                />
                <TextField
                    label="Price"
                    name="price"
                    type="number"
                    value={productData.price}
                    onChange={handleInputChange}
                />
                <TextField
                    label="Description"
                    name="description"
                    multiline
                    rows={3}
                    value={productData.description}
                    onChange={handleInputChange}
                />
                <TextField
                    label = "Quantity"
                    name="quantity"
                    type="number"
                    value={productData.quantity}
                    onChange={handleInputChange}
                />
                {errorMessage && (
                    <Typography color="error" variant="body2">
                        {errorMessage}
                    </Typography>
                )}
                <Button variant="contained" color="primary" onClick={handleSubmit}>
                    Submit
                </Button>
            </Stack>
        </Dialog>
    );
}
