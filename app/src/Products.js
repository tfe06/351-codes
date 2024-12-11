import React from "react";
import { Box, Typography, Card, CardMedia, CardContent } from "@mui/material";
import RatingComponent from "./RatingComponent"; // Import RatingComponent once

/**
 * A component that displays a list of products.
 *
 * @param {Array<object>} products - An array of product objects to be displayed.
 * @param {string} username - The username of the logged-in user.
 * @param {function} fetchProducts - Function to fetch the list of products.
 * @returns {JSX.Element} The Products component.
 */
export default function Products({ products, username, fetchProducts }) {
    if (!products || products.length === 0) {
        return (
            <Typography variant="h6" sx={{ textAlign: "center", marginTop: "20px", color: "gray" }}>
                No products found.
            </Typography>
        );
    }

    return (
        <Box display="flex" flexWrap="wrap" justifyContent="center" gap={2} p={2}>
            {products.map((product, index) => (
                <Card key={index} sx={{ width: 300, boxShadow: 3 }}>
                    <CardMedia
                        component="img"
                        height="200"
                        image={product.picture || "/default.jpg"}
                        alt={product.name || "Product Image"}
                    />
                    <CardContent>
                        <Typography variant="h6">{product.name || "No Name"}</Typography>
                        <Typography variant="body2" color="text.secondary">
                            {product.description || "No Description"}
                        </Typography>
                        <Typography variant="body1" color="text.primary">
                            Price: ${product.price?.toFixed(2) || "0.00"}
                        </Typography>
                        <RatingComponent
                            productName={product.name} // Using product name
                            username={username}
                            averageRating={product.average_rating || 0}
                            onRatingSubmit={fetchProducts} // Refresh the product list after submission
                        />
                    </CardContent>
                </Card>
            ))}
        </Box>
    );
}
