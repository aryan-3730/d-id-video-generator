const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
    res.send("D-ID Video API Server Working");
});

app.post("/generate", async (req, res) => {
    try {
        const { image_url, text } = req.body;

        const response = await axios.post(
            "https://api.d-id.com/talks",
            {
                "source_url": image_url,
                "script": {
                    "type": "text",
                    "input": text
                }
            },
            {
                headers: {
                    "Authorization": `Bearer ${process.env.DID_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        res.json(response.data);
    } catch (error) {
        res.json({ error: error.message, details: error.response?.data });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
