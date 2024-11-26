// ------------------------ INITIALIZE STORY DATA ------------------------ //

// UI elements
const buttons = document.querySelectorAll(".button");

const heroButtons = document.querySelectorAll(".hero");
const villainButtons = document.querySelectorAll(".villain");
const genreButtons = document.querySelectorAll(".genre");

const storyContainer = document.querySelectorAll(".story");

// dynamic variables for story prompt
let heroName = ``;
let villainName = ``;
let genre = ``;

// retrieve values stored in each button's data attributes and pass to declared hero, villain, and genre variables
let getData = (element) => {
  count++;

  const data = element.dataset.name;

  if (element.classList.contains("hero")) {
    heroName = data;
  } else if (element.classList.contains("villain")) {
    villainName = data;
  } else if (element.classList.contains("genre")) {
    genre = data;
  }

  // call story generating function once all needed data are present
  startStory();
};


let count = 0;

// display buttons by categories based on count
buttons.forEach((button) => {
  button.addEventListener("click", () => {
    getData(button);

    console.log(heroName, villainName, genre);

    if (count === 1) {
      heroButtons.forEach((button) => {
        button.classList.remove("show");
      });

      villainButtons.forEach((button) => {
        button.classList.add("show");
      });
    } else if (count === 2) {
      villainButtons.forEach((button) => {
        button.classList.remove("show");
      });

      genreButtons.forEach((button) => {
        button.classList.add("show");
      });
    } else if (count > 2) {
      buttons.forEach((button) => {
        button.classList.remove("show");
      });

      storyContainer.forEach((container) => {
        container.classList.add("show");
      });
    }
  });
});



// ------------------------ STORY GENERATION ------------------------ //

//UI elements
const textElem = document.getElementById("text");
const storyContainerElem = document.getElementById("story");

let generateText = async (prompt) => {
  try {
    // send request to API route in the server (app.js)
    const response = await fetch("/api/generate-text", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    })

    if (!response.ok) {
      throw new Error("Failed to generate text")
    }

    // retrieve generated text
    const data = await response.json();

    // display text in targeted element
    textElem.innerHTML = data.text;
  } catch (error) {
    console.error("Error:", error.message)
  }
}

// Image generation
let generateImages = async (prompts) => {
  try {
    // send request to API route in the server (app.js)
    const response = await fetch("/api/generate-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompts }),
    });
  
    if (!response.ok) {
      throw new Error("Failed to generate image");
    }
  
    // retrieve generated images
    const data = await response.json();

    // create img element for each images and display in HTML document
    data.images.forEach((imageUrl) => {
      const imgElem = document.createElement("img");
      imgElem.src = `/assets/generated-images/${imageUrl}`;
      imgElem.style.width = "300px";
      imgElem.style.margin = '20px';
  
      storyContainerElem.appendChild(imgElem);

      console.log(imgElem.src);
    });
  } catch (error) {
    console.error("Error:", error.message);
  }
}

let startStory = async () => {
  if(heroName && villainName && genre) {
    const textPrompt = `Start with the story immediately, 
    3 sentence story about protagonist ${heroName} and antagonist 
    ${villainName} with the genre of ${genre}. Each sentence consist of 5 words, 
    in the last sentence, make two choices of what ${heroName} does, seperated by "/"`

    // checks if dynamic variables are properly passed into the string
    // console.log(textPrompt);

    // generates story from provided prompt
    await generateText(textPrompt);

    const sentences = textElem.innerHTML.split('.');
    const lastSentence = sentences[sentences.length - 1].trim();

    // checks if variables hold the correct value
    // console.log(sentences);
    // console.log(lastSentence);

    const choices = lastSentence.split('/')
    const choiceOne = choices[0].trim();
    const choiceTwo = `${heroName} ` + choices[1].trim();

    // checks if variables hold the correct value
    // console.log(choices);
    // console.log(choiceOne);
    // console.log(choiceTwo);

    const imgPrompts = [`${choiceOne}, illustrated cartoon style`, 
      `${choiceTwo}, illustrated cartoon style`];

    // generates images from provided prompts array
    generateImages(imgPrompts);
  }
}