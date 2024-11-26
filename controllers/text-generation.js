import Replicate from "replicate";

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

export const generateText = async (req, res) => {
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
    console.error("Error generating text: ", error.message);
    res.status(500).json({ error: "Failed to generate text" });
  }
};
