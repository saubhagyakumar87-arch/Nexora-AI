import express from "express";

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
            return res.status(400).json({
                error: "Please provide an image prompt."
            });
        }

        const apiKey = process.env.POLLINATIONS_API_KEY;

        if (!apiKey) {
            return res.status(500).json({
                error: "Pollinations API key is missing from .env"
            });
        }

        const imageUrl =
            `https://gen.pollinations.ai/image/${encodeURIComponent(prompt.trim())}`;

        const response = await fetch(imageUrl, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${apiKey}`
            }
        });

        if (!response.ok) {
            const errorText = await response.text();

            console.error("Pollinations API error:", response.status, errorText);

            return res.status(response.status).json({
                error: "Image generation failed. Please check your API key, credits, and model access."
            });
        }

        const contentType = response.headers.get("content-type") || "";

        if (!contentType.startsWith("image/")) {
            return res.status(502).json({
                error: "The API did not return an image."
            });
        }

        const imageBuffer = Buffer.from(await response.arrayBuffer());

        res.setHeader("Content-Type", contentType);
        res.setHeader("Cache-Control", "no-store");

        return res.status(200).send(imageBuffer);

    } catch (error) {
        console.error("Image generation error:", error);

        return res.status(500).json({
            error: "Something went wrong while generating the image."
        });
    }
});

export default router;