const express = require("express");
const axios = require("axios");
const multer = require("multer");
const fs = require("fs");
const FormData = require("form-data");
require("dotenv").config();

const app = express();
app.use(express.json());

// Multer temp file storage
const upload = multer({ dest: "uploads/" });

app.get("/", (req, res) => {
  res.send("D-ID Video API Server Working");
});

// Upload route
app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const filePath = req.file.path;

    const form = new FormData();
    form.append("file", fs.createReadStream(filePath));

    const uploadRes = await axios.post(
      "https://api.d-id.com/images",
      form,
      {
        headers: {
          ...form.getHeaders(),
          "Authorization": `Basic ${process.env.DID_KEY}`
        }
      }
    );

    fs.unlinkSync(filePath);

    return res.json({ id: uploadRes.data.id });

  } catch (err) {
    console.error(err.response?.data || err.message);
    return res.status(500).json({ error: "Image upload failed" });
  }
});

// Video create route
app.post("/create", async (req, res) => {
  try {
    const { image_id, text, voice } = req.body;

    const createRes = await axios.post(
      "https://api.d-id.com/talks",
      {
        script: {
          type: "text",
          subtitles: "false",
          provider: { type: "microsoft", voice_id: voice || "hi-IN-MadhurNeural" },
          ssml: false,
          text
        },
        config: { stitch: true },
        source_url: `https://api.d-id.com/images/${image_id}`
      },
      {
        headers: {
          "Authorization": `Basic ${process.env.DID_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    return res.json({ id: createRes.data.id });

  } catch (err) {
    console.error(err.response?.data || err.message);
    return res.status(500).json({ error: "Video creation failed" });
  }
});

// Check status route
app.get("/video/:id", async (req, res) => {
  try {
    const videoId = req.params.id;

    const result = await axios.get(
      `https://api.d-id.com/talks/${videoId}`,
      {
        headers: { "Authorization": `Basic ${process.env.DID_KEY}` }
      }
    );

    if (result.data?.result_url) {
      return res.json({ url: result.data.result_url });
    }

    return res.json({ url: null });

  } catch (err) {
    console.error(err.response?.data || err.message);
    return res.status(500).json({ error: "Status fetch failed" });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server Running on PORT: " + PORT));
