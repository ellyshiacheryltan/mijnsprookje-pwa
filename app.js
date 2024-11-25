// Web app
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3000;

app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

// AI models
import Replicate from "replicate";
import { writeFile } from "node:fs/promises";

const replicate = new Replicate();

// text-generation API route
app.post("/generate-text", async (req, res) => {
  try {
    // prompt received from client (index.js)
    const prompt = req.body.prompt;

    // store generated text in a string
    let generatedText = "";

    const input = { prompt };

    // run text generation model with Replicate's API
    for await (const event of replicate.stream(
      "meta/meta-llama-3-8b-instruct",
      { input }
    )) {

      // pass generated text to variable
      generatedText += event;
    }

    // return response to client (index.js): send text string
    res.json({ text: generatedText });
  } catch (error) {
    console.error("Error:", error.message);
  }
});

// image generation API route
app.post("/generate-image", async (req, res) => {
  try {
    // prompts received from client (index.js)
    const prompts = req.body.prompts;

    // checks if prompts returns an array
    // console.log(prompts);

    // array holding file paths of generated images
    const filePaths = [];

    // iterate through array of prompts
    for (const [index, prompt] of prompts.entries()) {
      const input = { prompt };

      // run image generating model with Replicate's API
      const output = await replicate.run("black-forest-labs/flux-schnell", {
        input,
      });

      // save each generated image 
      for (const [subIndex, item] of output.entries()) {
        const filePath = path.join(
          "public",
          `/output_${index}_${subIndex}.webp`
        );
        await writeFile(filePath, item);
        filePaths.push(`/output_${index}_${subIndex}.webp`);
      }
    }

    // return response to client (index.js): send array of generated images
    res.json({ images: filePaths });
  } catch (error) {
    console.error("Error generating image:", error.message);
    res.status(500).json({ error: "Failed to generate image" });
  }
});

app.listen(port, () => {
  console.log(`Example app running on http://localhost:${port}`);
});