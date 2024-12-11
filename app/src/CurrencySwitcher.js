import React, { useState, useEffect } from "react";
import { Typography, Select, MenuItem, Box } from "@mui/material";

/**
 * A component that allows users to switch between different currencies and see the converted price.
 *
 * @param {number} basePrice - The base price of the product in USD.
 * @returns {JSX.Element} The CurrencySwitcher component.
 */
export default function CurrencySwitcher({ basePrice }) {
    /**
     * Tracks the exchange rates for supported currencies.
     * Initially set to an empty object.
     *
     * @type {object}
     */
    const [currencies, setCurrencies] = useState({});

    /**
     * Tracks the currently selected currency.
     * Initially set to "USD".
     *
     * @type {string}
     */
    const [selectedCurrency, setSelectedCurrency] = useState("USD");

    /**
     * Tracks the converted price of the product in the selected currency.
     * Initially set to the base price.
     *
     * @type {number}
     */
    const [convertedPrice, setConvertedPrice] = useState(basePrice);

    /**
     * An array of supported currency codes.
     *
     * @type {Array<string>}
     */
    const supportedCurrencies = ["USD", "EUR", "GBP", "LBP"];

    /**
     * The API key for accessing the exchange rate API.
     *
     * @type {string}
     */
    const apiKey = "e519aa905dec9aa66e5b9e65"; // Replace with your actual API key

    /**
     * Fetches the currency exchange rates when the component mounts.
     * Filters the rates to include only the supported currencies and updates the state.
     */
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

    /**
     * Updates the converted price when currency or base price changes.
     */
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
