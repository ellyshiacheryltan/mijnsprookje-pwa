import express from "express";
import { generateText } from "../controllers/text-generation.js";
import { generateImage } from "../controllers/image-generation.js";

const router = express.Router();

router.post("/generate-text", generateText);
router.post("/generate-image", generateImage);

export default router;