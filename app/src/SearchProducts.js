import React, { useState } from "react";
import { TextField, Button, Box, Typography, Card, CardContent, Stack } from "@mui/material";

/**
 * A component that allows users to search for products.
 *
 * @returns {JSX.Element} The SearchProducts component.
 */
export default function SearchProducts() {
    const [searchQuery, setSearchQuery] = useState("");
    const [products, setProducts] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");

    /**
     * Handles the search action.
     *
     * Sends a POST request to search for products and updates the state based on the response.
     */
    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            setErrorMessage("Search query is required.");
            setProducts([]); 
            return;
        }

        try {
            const response = await fetch("http://127.0.0.1:30000/search_product", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: searchQuery }),
            });

            const data = await response.json();

            if (response.ok && data.products && data.products.length > 0) {
                setProducts(data.products);
                setErrorMessage(""); // Clear the error message if search succeeds
            } else {
                setProducts([]); 
                setErrorMessage(data.message || "No products found.");
            }
        } catch (error) {
            console.error("Search error:", error);
            setProducts([]); 
            setErrorMessage("An error occurred. Please try again.");
        }
    };

    return (
        <Box sx={{ padding: 4 }}>
            <Typography variant="h4" sx={{ mb: 2 }}>
                Search Products
            </Typography>

            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                <TextField
                    label="Search by Name or Description"
                    fullWidth
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button variant="contained" onClick={handleSearch}>
                    Search
                </Button>
            </Stack>

            {errorMessage && (
                <Typography color="error" sx={{ mt: 2 }}>
                    {errorMessage}
                </Typography>
            )}

            <Box sx={{ mt: 3 }}>
                {products.length > 0 ? (
                    products.map((product, index) => (
                        <Card key={index} sx={{ mb: 2 }}>
                            <CardContent>
                                <Typography variant="h6">{product.name}</Typography>
                                <Typography>Price: ${product.price.toFixed(2)}</Typography>
                                <Typography>{product.description}</Typography>
                            </CardContent>
                        </Card>
                    ))
                ) : !errorMessage ? (
                    <Typography>No products found.</Typography>
                ) : null}
            </Box>
        </Box>
    );
}
