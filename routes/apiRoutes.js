import express from "express";
import { generateText } from "../controllers/text-generation.js";
import { generateImage } from "../controllers/image-generation.js";
import { generateSpeech } from "../controllers/text-to-speech.js";

const router = express.Router();

router.post("/generate-text", generateText);
router.post("/generate-image", generateImage);
router.post("/generate-speech", generateSpeech);

export default router;