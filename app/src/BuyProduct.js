import {
    Box,
    Stack,
    Typography,
    TextField,
    Button
} from "@mui/material";
import React, {useState} from "react";
import CurrencyConverterTool from './CurrencySwitcher';

/**
 * A component that allows users to buy a product.
 *
 * @param {object} product - The product to be purchased.
 * @param {function} onSnackbarOpen - Function to open a snackbar with a message.
 * @param {function} onClose - Function to close the buy product dialog.
 * @param {function} onProductChange - Function to handle product changes.
 * @param {string} username - The username of the buyer.
 * @returns {JSX.Element} The BuyProduct component.
 */
export default function BuyProduct({ product, onSnackbarOpen, onClose, onProductChange, username }) {
    /**
     * Tracks the quantity of the product to be purchased.
     * Initially set to 0.
     *
     * @type {number}
     */
    const [quantityToBuy, setQuantityToBuy] = useState(0);

    /**
     * Handles the product purchase action.
     *
     * Validates the product and quantity, then sends a POST request to purchase the product.
     */
    const handleBuyProduct = async () => {
        if (!product || !quantityToBuy || quantityToBuy < 1) {
            onSnackbarOpen("Invalid product or quantity.", "error");
            return;
        }

        try {
            const response = await fetch("http://127.0.0.1:30000/buy_product", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    product_name: product.name,
                    buyer_username: username, 
                    quantity_to_buy: quantityToBuy,
                }),
            });
            const data = await response.json();

            if (response.ok) {
                onSnackbarOpen("Product purchased successfully!", "success");
                onProductChange();
                onClose();
            } else {
                onSnackbarOpen(data.message || "Failed to purchase product.", "error");
            }
        } catch (error) {
            onSnackbarOpen("An error occurred while purchasing the product.", "error");
        }
    };

    return (
        <Box sx={{ padding: 4 }}>   
            <Stack spacing={2}>
                <Typography variant="h4">Buy {product?.name}</Typography>
                <Typography variant="body1" color="text.secondary">
                    Description: {product?.description}
                </Typography>
                <Typography variant="body1" color="text.primary">
                
                <CurrencyConverterTool basePrice={product.price} />

                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Available Quantity: {product?.quantity}
                </Typography>
                <TextField
                    label="Quantity to Buy"
                    type="number"
                    value={quantityToBuy}
                    onChange={(e) => setQuantityToBuy(Math.max(1, parseInt(e.target.value, 10)))}
                />
                <Button variant="contained" onClick={handleBuyProduct}>
                    Buy Now
                </Button>
                <Button variant="outlined" color="error" onClick={onClose}>
                    Cancel
                </Button>
            </Stack>
        </Box>
    );
}
