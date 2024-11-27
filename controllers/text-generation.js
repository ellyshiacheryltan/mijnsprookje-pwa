import Replicate from "replicate";

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

export const generateText = async (req, res) => {
  try {
    // prompt received from client (index.js)
    const prompt = req.body.prompt;

    // store generated text in a string
    let generatedText = "";

    const input = {
      prompt,
      system_prompt: `You are a helpful, respectful, and honest narrator. Always answer as helpfully as 
      possible, while being safe. Your stories should under any circumstances include violence, harmfull 
      behaviour, sexual, racist or illegal activities. You are determined to narrate stories for young 
      kids aged 4-6 years-old so do not use techical or academic language. You start the story immediatelly 
      without any additional comments or polite responses. It should be no longer than 5 words.`,
    };

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
