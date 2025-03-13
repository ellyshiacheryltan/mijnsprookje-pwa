// ------------------------ INITIALIZE STORY DATA ------------------------ //

// UI elements
const buttons = document.querySelectorAll(".knop");

const heroButtons = document.querySelectorAll(".hero");
const villainButtons = document.querySelectorAll(".villain");
const genreButtons = document.querySelectorAll(".genre");

// dynamic variables for story prompt
let heroName = ``;
let villainName = ``;
let genre = ``;
let heroSpecies = ``;
let villainSpecies = ``;
let heroGender = ``;
let villainGender = ``;

// retrieve values stored in each button's data attributes and pass to declared hero, villain, and genre variables
let getData = (element) => {
  const dataName = element.dataset.name;
  const dataSpecies = element.dataset.species;
  const dataGender = element.dataset.gender;

  if (element.classList.contains("hero")) {
    heroName = dataName;
    heroSpecies = dataSpecies;
    heroGender = dataGender;
  } else if (element.classList.contains("villain")) {
    villainName = dataName;
    villainSpecies = dataSpecies;
    villainGender = dataGender;
  } else if (element.classList.contains("genre")) {
    genre = dataName;
  }

  console.log(genre, heroName, villainName);
};

buttons.forEach((button) => {
  button.addEventListener("click", () => getData(button));
});

// ------------------------ STORY GENERATION ------------------------ //

//UI elements
const storyContainerElem = document.getElementById("story-container");

let storyContext = "";
let imgPrompts = [];

// Voiceover generation
let generateVoiceover = async (prompt) => {
  try {
    // Send a request to the back-end text-to-speech endpoint
    const response = await fetch("/api/generate-speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }), // Send the text to be converted to audio
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    // Get the audio as a blob and create a URL for it
    const data = await response.json();
    const generatedAudio = data.audio;

    // Add a unique query parameter to prevent caching
    const audioUrl = `/assets/generated-speech/${generatedAudio}?t=${new Date().getTime()}`;

    // Play the audio
    const audioElem = document.createElement("audio");

    audioElem.autoplay = true;
    audioElem.style.display = "none";
    document.body.appendChild(audioElem); // Attach the audio element to the DOM

    // Reset the source to ensure fresh content
    audioElem.src = ""; // Clear the previous source
    audioElem.src = audioUrl; // Set the new source
    audioElem.load(); // Reload the audio element
    await audioElem.play();

    // Remove the element after playback to clean up
    audioElem.onended = () => {
      document.body.removeChild(audioElem);
    };
  } catch (error) {
    console.error("Error making character speak:", error);
  }
};

// Text generation
let generateText = async (prompt) => {
  try {
    // send request to API route in the server (app.js)
    const response = await fetch("/api/generate-text", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate text");
    }

    // retrieve and return generated text
    const data = await response.json();
    const generatedText = data.text;

    storyContext = generatedText;

    generateVoiceover(storyContext);

    displayText(storyContext);
  } catch (error) {
    console.error("Error:", error.message);
  }
};

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
    const generatedImages = data.images;

    // create img element for each images and display in HTML document
    generatedImages.forEach((image, index) => {
      if (index < generatedImages.length - 2) {
        displayImage(image, index);
      }
    });

    const choicesImages = generatedImages.slice(-2);
    console.log("choicesImages: ", choicesImages);
    displayChoices(choicesImages);
  } catch (error) {
    console.error("Error:", error.message);
    
  } finally {
    hideLoadingSection();
    displayContents(3000);
  }
};

// Continuation images
let generateContinuationImages = async (prompts) => {
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

    const imgElems = document.querySelectorAll('.generated-img');
    const displayedImg = imgElems.length - 1;

    console.log(displayedImg);

    const textElems = document.querySelectorAll(".generated-text");
    console.log(textElems);

    // retrieve generated images
    const data = await response.json();
    const generatedImages = data.images;

    // create img element for each images and display in HTML document
    generatedImages.forEach((image, index) => {
      if (index > displayedImg && index != imgPrompts.length - 1) {
        displayImage(image, index);
      }
    });
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    displayContents(3000);
  }
};

const characterSection = document.querySelector(".character-section");

// Continuation generation
let generateContinuation = async (prompt) => {
  try {
    const response = await fetch("/api/generate-text", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    characterSection.classList.add("hidden");

    const data = await response.json();
    const generatedText = data.text;

    storyContext += generatedText;


    displayContinuation(generatedText);
    await generateVoiceover(generatedText)
  } catch (error) {
    console.error("Error:", error);
  }
};

// Start story
let startStory = async () => {
  if (heroName && villainName && genre) {
    const textPrompt = `Write a short, engaging, and age-appropriate story.
    The story must feature:
    1. A main protagonist who is a ${heroSpecies}, the gender is ${heroGender}, and the name is ${heroName}.
    2. An antagonist who is a ${villainSpecies}, the gender is ${villainGender}, and the name is ${villainName}.
    3. Themes, tone, and elements that align with the ${genre}.
    The story should immediately begin with a captivating narrative, avoiding introductions, meta-comments, or 
    disclaimers. Ensure the story is suitable for children, with a simple yet imaginative plot that encourages 
    creativity and engagement, and also using easy first-time reader words. Should not be longer than 6 sentence, 
    each sentence consist of 5 words. Each sentence should seamlessly lead to the next, with no abrupt or 
    confusing jumps. Do not have a dialogue in double quotation mark. The 5th sentence should be a continuation
    question of what should the ${heroName} do next, always end the question with a "?". The 6th sentence should 
    provide two choices of possible answers to the previous question, separated by one "/" of what ${heroName} 
    does, don't use the word "or", sentence should start with the word immediately. Separate sentences with a full stop.`;

    // checks if dynamic variables are properly passed into the string
    // console.log(textPrompt);

    // generates story from provided prompt
    await generateText(textPrompt);

    const textElem = document.querySelectorAll(".generated-text");

    textElem.forEach((elem, index) => {
      const generatedText = elem.innerHTML;
      if (index < textElem.length - 2) {
        const prompt = `${generatedText}, illustrated cartoon  A magical theme park style`;
        imgPrompts.push(prompt);
      } else if (index == textElem.length - 1) {
        if (generatedText.includes("/")) {
          const choices = generatedText.split("/");
          const choiceOne = choices[0].trim();
          const choiceTwo = `${heroName} ` + choices[1].trim();

          const promptOne = `${choiceOne}, illustrated cartoon  efteling  A magical theme park style `;
          const promptTwo = `${choiceTwo}, illustrated cartoon  efteling  A magical theme park style `;

          imgPrompts.push(promptOne, promptTwo);
        }
      }
    });

    // generates images from provided prompts array
    await generateImages(imgPrompts);
  }
};

let textElems = []
let imgElems = []

// Display continuation of story after user input
let displayContinuation = async (data) => {
  textElems.length = 0;
  imgElems.length = 0;

  const sentences = data
    .split(/[.]/)
    .filter((sentence) => sentence.trim().length > 0);

  console.log(sentences);

  sentences.forEach((sentence, index) => {
    const textElem = document.createElement("p");
    textElem.className = "generated-text hidden";
    textElem.innerHTML = sentence;

    storyContainerElem.appendChild(textElem);
    textElems.push(textElem);

    const prompt = `${sentence}, illustrated cartoon style`;
    imgPrompts.push(prompt);
  });

  console.log("Img prompt after continuation:", imgPrompts);
  await generateContinuationImages(imgPrompts);
};

// Display choices of story continuation
let displayChoices = (data) => {
  const featureContainer = document.createElement("div");
  featureContainer.className = "user-choices hidden";
  featureContainer.id = "user-choices";

  data.forEach((data, index) => {
    const choiceContainer = document.createElement("div");
    const imgContainer = document.createElement("div");
    const imgElem = document.createElement("img");

    choiceContainer.className = "choice-full";
    imgContainer.className = "choice";
    imgElem.className = "generated-img";
    imgElem.src = `/assets/generated-images/${data}`;

    imgContainer.appendChild(imgElem);
    choiceContainer.appendChild(imgContainer);
    featureContainer.appendChild(choiceContainer);
    imgElems.push(featureContainer);
    textElems.push(featureContainer);

    const generatedText = document.querySelectorAll(".generated-text");
    const lastSentence = generatedText[generatedText.length - 1].innerHTML;
    const choices = lastSentence.split("/");

    if (choices[index]) {
      const textElem = document.createElement("p");
      textElem.className = "choice-text";
      textElem.innerHTML = choices[index].trim();

      choiceContainer.appendChild(textElem);
    }
  });

  storyContainerElem.appendChild(featureContainer);

  const choices = document.querySelectorAll(".choice-full");
  choices.forEach((choice) => {
    choice.addEventListener("click", () => {
      const choiceText = document.querySelectorAll(".choice-text");
      const generatedText = document.querySelectorAll(".generated-text");
      const featureContainer = document.getElementById("user-choices");

      generatedText[generatedText.length - 2].style.display = "none";
      featureContainer.style.display = "none";

      if (choiceText) {
        const textContent = choiceText.innerHTML;
        const continuationPrompt = `Continue the story including ${textContent}, based on the provided context, 
        ensuring seamless integration and by including a denouement in the story narrative. Present the 
        continuation immediately without summarizing the current context. Should not be longer than 6 sentence, 
        each sentence consist of 5 words. Separate sentences with a full stop. Only the last sentence should have
        a question from the character marked in a double quotation mark. Here is the context: ${storyContext}.`
        generateContinuation(continuationPrompt);
      }
    });
  });
};

// Function to create paragraph element for every generated text
let displayText = (data) => {
  const sentences = data
    .split(/[.?]/)
    .filter((sentence) => sentence.trim().length > 0);

  console.log(sentences);

  sentences.forEach((sentence) => {
    const textElem = document.createElement("p");
    textElem.className = "generated-text hidden";
    textElem.innerHTML = sentence;

    storyContainerElem.appendChild(textElem);
    textElems.push(textElem);
  });
};

// Function to create image element for every generated image
let displayImage = (data, index) => {
  const imgContainer = document.createElement("div");
  const imgElem = document.createElement("img");

  imgContainer.className = "generated-image hidden";
  imgElem.className = "generated-img";
  imgElem.src = `/assets/generated-images/${data}`;

  const indexNoGenerate = imgPrompts.findIndex(prompt => prompt.includes('"'))
  if ( index === indexNoGenerate){
    imgContainer.style.display = "none";
  }

  imgContainer.appendChild(imgElem);
  storyContainerElem.appendChild(imgContainer);
  imgElems.push(imgContainer);

  const textElem = document.querySelectorAll(".generated-text")[index];
  textElem.parentNode.insertBefore(imgContainer, textElem.nextSibling);
};

// Display generated contents one by one
let displayContents = (delay) => {
  let currentIndex = 0;

  console.log(textElems);

  let revealNextElement = () => {
    let textElem = textElems[currentIndex];
    let imgElem = imgElems[currentIndex];

    let textContent = textElem.innerHTML;
    console.log(textContent);

    if (!textContent.includes('/')){
      if (!textContent.includes('"')) {
        textElem.classList.remove("hidden");

        if (imgElem) {
          imgElem.classList.remove("hidden");
        }
      } else {
          textElem.classList.remove("hidden");
          
          if(currentIndex == textElems.length-1){
            console.log(textContent)
            characterSection.classList.remove("hidden");
          } else {
            imgElem.classList.remove("hidden");
          }
      }
    }

    document.body.scrollTop = document.body.scrollHeight;

    setTimeout(revealNextElement, delay);

    currentIndex++
  }

  revealNextElement();
}

// Add the event listener for the button
const button = document.querySelector(".talk-button .talk-btn");
if (button) {
  button.addEventListener("click", function () {
    console.log("Button clicked");
    // startRecording();
    handleSpeechInput();
  });
} else {
  console.error("Button not found");
}

// Handle speech input from speech recognition
let handleSpeechInput = () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition; 
  const recognition = new SpeechRecognition(); 
  recognition.lang = 'nl-NL';

  recognition.onstart = () => { 
    console.log('Speech recognition started...'); 
  }

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;

    console.log(event);
    console.log("Result: ", transcript);

    const continuationPrompt = `Continue the story with ${transcript}, based on the provided context.
    The story must feature:
    1. A main protagonist who is a ${heroSpecies}, the gender is ${heroGender}, and the name is ${heroName}.
    2. An antagonist who is a ${villainSpecies}, the gender is ${villainGender}, and the name is ${villainName}.
    3. Themes, tone, and elements that align with the ${genre}.

    Ensure seamless integration and by including a denouement in the story narrative. Present the 
    continuation immediately without summarizing the current context. Should not be longer than 6 sentence, 
    each sentence consist of 5 words. Do not have a dialogue. 
    Separate sentences with a full stop. End story with a "The end".
    Here is the context: ${storyContext}.`

    generateContinuation(continuationPrompt);

    const textElems = document.querySelectorAll(".generated-text");
      const lastText = textElems[textElems.length - 1];
      if (lastText) {
        lastText.style.display = "none";
    }
  }

  recognition.onend = () => { 
    console.log('Speech recognition stopped.'); 
  }

  recognition.start();

  setTimeout(() => {
    recognition.stop();
  }, 10000);
}

// Function to switch displayed section
function switchSection(currentId, nextId) {
  const currentSection = document.getElementById(currentId);
  const nextSection = document.getElementById(nextId);

  // console.log("Current Section:", currentSection);    // Debug logs
  // console.log("Next Section:", nextSection);          // Debug logs
  if (currentSection && nextSection) {
    currentSection.classList.remove("active");
    nextSection.classList.add("active");
  }
}

// Switch to Good characters section
document.getElementById("to-personagesgood").addEventListener("click", (e) => {
  e.preventDefault();
  switchSection("genres-section", "personagesgood-section");
});

// Switch to Bad characters section
document.getElementById("to-ba").addEventListener("click", (e) => {
  e.preventDefault();
  switchSection("personagesgood-section", "ba-section");
});

// Back to Genre section
document.getElementById("back-to-genres").addEventListener("click", (e) => {
  e.preventDefault();
  switchSection("personagesgood-section", "genres-section");
});

// Back to Good characters section
document
  .getElementById("back-to-personagesgood")
  .addEventListener("click", (e) => {
    e.preventDefault();
    switchSection("ba-section", "personagesgood-section");
  });

//  Adds transition screen for while the generation is being executed
document.getElementById("go-to-verhaal").addEventListener("click", (e) => {
  e.preventDefault();
  switchSection("ba-section", "loading-screen");
  startStory();
});
  // Hides the loading screen. This function is being called as "finally" in the image generation fetch
function hideLoadingSection() {
  switchSection("loading-screen", "verhaal-section");
}
// ------------------------ Colour changing button elements ------------------------ //

//Buttons Genre, Bad/Good Characters background color changes
document.addEventListener("DOMContentLoaded", function () {
  // Selecteer every button
  const buttons = document.querySelectorAll(".knop");

  // Select random colour function
  function getRandomColor() {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  buttons.forEach((button) => {
    button.addEventListener("click", function () {
      // Reset colours after a new click
      document.querySelectorAll(".knop-wrapper").forEach((wrapper) => {
        wrapper.style.backgroundColor = "";
      });

      const randomColor = getRandomColor();

      // Older wrapper (parent) changer
      const parentWrapper = this.closest(".knop-wrapper");
      if (parentWrapper) {
        parentWrapper.style.backgroundColor = randomColor;
      }
    });
  });
});
