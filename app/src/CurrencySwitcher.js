import React, { useState, useEffect } from "react";
import { Typography, Select, MenuItem, Box } from "@mui/material";

export default function CurrencySwitcher({ basePrice }) {
    const [currencies, setCurrencies] = useState({});
    const [selectedCurrency, setSelectedCurrency] = useState("USD");
    const [convertedPrice, setConvertedPrice] = useState(basePrice);

    const supportedCurrencies = ["USD", "EUR", "GBP", "LBP"];
    const apiKey = "e519aa905dec9aa66e5b9e65"; // Replace with your actual API key

    // Fetch currency rates
    useEffect(() => {
        const fetchCurrencies = async () => {
            try {
                const response = await fetch(
                    `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`
                );
                const data = await response.json();

                if (data.result === "success") {
                    const filteredRates = Object.fromEntries(
                        Object.entries(data.conversion_rates).filter(([key]) =>
                            supportedCurrencies.includes(key)
                        )
                    );
                    setCurrencies(filteredRates);
                } else {
                    console.error("Failed to fetch exchange rates.");
                }
            } catch (error) {
                console.error("Error fetching currencies:", error);
            }
        };

        fetchCurrencies();
    }, []);

    // Update converted price when currency or base price changes
    useEffect(() => {
        if (currencies && basePrice && selectedCurrency) {
            const rate = currencies[selectedCurrency];
            if (rate) {
                setConvertedPrice((basePrice * rate).toFixed(2));
            }
        }
    }, [basePrice, selectedCurrency, currencies]);

    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography variant="h6">
                Price: {convertedPrice} {selectedCurrency}
            </Typography>
            <Select
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
                sx={{ minWidth: 100 }}
            >
                {supportedCurrencies.map((currency) => (
                    <MenuItem key={currency} value={currency}>
                        {currency}
                    </MenuItem>
                ))}
            </Select>
        </Box>
    );
}
