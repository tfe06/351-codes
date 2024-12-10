import React, { useState } from "react";
import { TextField, Box, Button } from "@mui/material";

export default function SearchBar({ onSearch }) {
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearch = () => {
        onSearch(searchQuery);
    };

    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                width: "100%",
                justifyContent: "center",
                gap: 1,
            }}
        >
            <TextField
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products..."
                variant="outlined"
                size="small"
                sx={{
                    width: "300px",
                    backgroundColor: "white",
                    borderRadius: "5px",
                    boxShadow: 1,
                }}
            />
            <Button
                variant="contained"
                size="small"
                onClick={handleSearch}
                sx={{
                    backgroundColor: "green",
                    color: "white",
                    "&:hover": { backgroundColor: "#005f00" },
                    padding: "5px 15px",
                }}
            >
                Search
            </Button>
        </Box>
    );
}
