import React, { useState, useEffect } from "react";

/**
 * A component that allows users to rate a product and displays the average rating.
 *
 * @param {string} productName - The name of the product being rated.
 * @param {string} username - The username of the user submitting the rating.
 * @param {number} averageRating - The average rating of the product.
 * @param {function} onRatingSubmit - Function to call after a rating is submitted.
 * @returns {JSX.Element} The RatingComponent component.
 */
const RatingComponent = ({ productName, username, averageRating, onRatingSubmit }) => {
    /**
     * Tracks the user's rating.
     * Initially set to 0.
     *
     * @type {number}
     */
    const [userRating, setUserRating] = useState(0);
    /**
     * Tracks the average rating of the product.
     * Initially set to the provided averageRating prop.
     *
     * @type {number}
     */
    const [average, setAverageRating] = useState(averageRating || 0);

    useEffect(() => {
        setAverageRating(averageRating || 0);
    }, [averageRating]);

    /**
     * Handles the action of clicking a star to set the user's rating.
     *
     * @param {number} star - The rating value of the clicked star.
     */
    const handleStarClick = (star) => {
        setUserRating(star);
    };

    /**
     * Handles the submission of the user's rating.
     *
     * Sends the rating to the server and updates the average rating.
     */
    const handleSubmitRating = async () => {
        if (!username) {
            alert("You must be logged in to rate products.");
            return;
        }

        if (!productName) {
            alert("Product name is missing.");
            return;
        }

        try {
            const response = await fetch("http://127.0.0.1:30000/rate_product", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    product_name: productName,
                    username: username,
                    rating: userRating,
                }),
            });

            const data = await response.json();
            if (response.ok) {
                setAverageRating(data.new_average || 0); // Update the average rating
                onRatingSubmit(); // Refresh product data if needed
            } else {
                alert(`Failed to submit rating: ${data.message}`);
            }
        } catch (error) {
            alert("Error during submission. Please try again later.");
        }
    };

    return (
        <div>
            <div>
                <span>Rating:</span>
                {[1, 2, 3, 4, 5].map((star) => (
                    <span
                        key={star}
                        onClick={() => handleStarClick(star)}
                        style={{
                            cursor: "pointer",
                            color: userRating >= star ? "gold" : "gray",
                            marginLeft: "5px"
                        }}
                    >
                        ★
                    </span>
                ))}
                <button onClick={handleSubmitRating} disabled={userRating === 0}>
                    Submit
                </button>
            </div>
            <div style={{ marginTop: "5px" }}>
                <span>Average Rating: {average.toFixed(1)}/5</span>
            </div>
        </div>
    );
};

export default RatingComponent;
