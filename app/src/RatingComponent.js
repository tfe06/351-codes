import React, { useState, useEffect } from "react";

const RatingComponent = ({ productName, username, averageRating, onRatingSubmit }) => {
    const [userRating, setUserRating] = useState(0);
    const [average, setAverageRating] = useState(averageRating || 0);

    // Sync the average rating whenever the prop changes
    useEffect(() => {
        setAverageRating(averageRating || 0);
    }, [averageRating]);

    const handleStarClick = (star) => {
        setUserRating(star);
    };

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
