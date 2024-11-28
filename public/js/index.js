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

// retrieve values stored in each button's data attributes and pass to declared hero, villain, and genre variables
let getData = (element) => {
  const data = element.dataset.name;

  if (element.classList.contains("hero")) {
    heroName = data;
  } else if (element.classList.contains("villain")) {
    villainName = data;
  } else if (element.classList.contains("genre")) {
    genre = data;
  }

  console.log(genre, heroName, villainName);
};

buttons.forEach(button => {
  button.addEventListener("click", () => getData(button));
})

// ------------------------ STORY GENERATION ------------------------ //

//UI elements
const storyContainerElem = document.getElementById("story-container");

let storyContext = "";
let imgPrompts = [];

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

    displayText(generatedText);
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

    // retrieve generated images
    const data = await response.json();
    const generatedImages = data.images;

    // create img element for each images and display in HTML document
    generatedImages.forEach((image, index) => {
      if (index < generatedImages.length - 1 && index > 5) {
        displayImage(image, index);
      }
    });
  } catch (error) {
    console.error("Error:", error.message);
  }
};

// Continuation generation
let generateContinuation = async(prompt) => {
  try {
    const response = await fetch('/api/generate-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    const data = await response.json();
    const generatedText = data.text;

    displayContinuation(generatedText);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Start story
let startStory = async () => {
  if (heroName && villainName && genre) {
    const textPrompt = `Write a short, engaging, and age-appropriate story.
    The story must feature:
    1. A main protagonist who is a ${heroName}.
    2. An antagonist represented by a ${villainName}.
    3. Themes, tone, and elements that align with the ${genre}.
    The story should immediately begin with a captivating narrative, avoiding introductions, meta-comments, or 
    disclaimers. Ensure the story is suitable for children, with a simple yet imaginative plot that encourages 
    creativity and engagement, and also using easy first-time reader words. Should not be longer than 6 sentence, 
    each sentence consist of 5 words. The 5th sentence should be a question of what should the ${heroName} do next,
    always end the question with a "?". The 6th sentence should provide two choices separated by one
    "/" of what ${heroName} does, don't use the word "or". Separate sentences with a full stop.`;

    // checks if dynamic variables are properly passed into the string
    // console.log(textPrompt);

    // generates story from provided prompt
    await generateText(textPrompt);

    const textElem = document.querySelectorAll(".generated-text");

    textElem.forEach((elem, index) => { 
      const generatedText = elem.innerHTML; 
      if (index < textElem.length - 2) { 
        const prompt = `${generatedText}, illustrated cartoon style`; 
        imgPrompts.push(prompt); 
      } else if(index == textElem.length - 1) {
        if(generatedText.includes("/")) {
          const choices = generatedText.split("/");
          const choiceOne = choices[0].trim();
          const choiceTwo = `${heroName} ` + choices[1].trim();
    
          const promptOne = `${choiceOne}, illustrated cartoon style`;
          const promptTwo = `${choiceTwo}, illustrated cartoon style`;

          imgPrompts.push(promptOne, promptTwo);
      }}
    });

    // generates images from provided prompts array
    await generateImages(imgPrompts);
  }
};

let displayContinuation = async (data) => {
  const sentences = data.split(/[.?]/).filter(sentence => sentence.trim().length > 0);

  sentences.forEach((sentence, index) => {
    // if(sentence.includes('"')){
    //   const textElem = document.createElement("p");
    //   textElem.className = "generated-text";
    //   textElem.style.display = "none";
    //   textElem.innerHTML = sentence;

    //   storyContainerElem.appendChild(textElem);
    // }
    const textElem = document.createElement("p");
    textElem.className = "generated-text";
    textElem.innerHTML = sentence;

    storyContainerElem.appendChild(textElem);

    if (index != sentences.length - 1){
      const prompt = `${sentence}, illustrated cartoon style`
      imgPrompts.push(prompt)
    }
  })

  console.log ("Img prompt after continuation:", imgPrompts)
  await generateContinuationImages(imgPrompts);
}

let displayChoices = (data) => {
  const featureContainer = document.createElement("div");
  featureContainer.className = "user-choices";
  featureContainer.id = "user-choices"

  data.forEach((data, index) => {
    const choiceContainer = document.createElement("div");
    const imgContainer = document.createElement("div");
    const imgElem = document.createElement("img");

    choiceContainer.className="choice-full";
    imgContainer.className="choice";
    imgElem.src=`/assets/generated-images/${data}`;

    imgContainer.appendChild(imgElem);
    choiceContainer.appendChild(imgContainer);
    featureContainer.appendChild(choiceContainer);

    const generatedText = document.querySelectorAll(".generated-text");
    const lastSentence = generatedText[generatedText.length - 1].innerHTML;
    const choices = lastSentence.split("/");

    if (choices[index]) {
      const textElem = document.createElement("p");
      textElem.className = "choice-text";
      textElem.innerHTML=choices[index].trim();

      choiceContainer.appendChild(textElem);
    }
  })

  storyContainerElem.appendChild(featureContainer);

  const choices = document.querySelectorAll(".choice-full");
  choices.forEach(choice => {
    choice.addEventListener ('click', () => {
      const choiceText = choice.querySelectorAll('.choice-text');
      const generatedText = document.querySelectorAll(".generated-text");
      generatedText[generatedText.length - 2].style.display = "none";

      if (choiceText){
        const textContent = choiceText.innerHTML
        handleChoice(textContent);

        const featureContainerElem = document.getElementById("user-choices");
        featureContainerElem.style.display = "none";
      }
    })
  })
}

let handleChoice = async(data) => {
  userChoice = data;

  const continuationPrompt = `Continue the story including ${userChoice}, based on the provided context, 
  ensuring seamless integration and by including a denouement in the story narrative. Present the 
  continuation immediatelly without summarizing the current context. Should not be longer than 6 sentence, 
  each sentence consist of 5 words. Separate sentences with a full stop. Only the last sentence should have
  a question from the character marked in a double quotation mark. Here is the context: ${storyContext}.`;

  await generateContinuation(continuationPrompt);
}

// Function to create paragraph element for every generated text
let displayText = (data) => {
  const sentences = data.split(/[.?]/).filter(sentence => sentence.trim().length > 0);

  console.log(sentences);

  sentences.forEach((sentence, index) => {
    if(sentence.includes("/")){
      const textElem = document.createElement("p");
      textElem.className = "generated-text";
      textElem.style.display = "none";
      textElem.innerHTML = sentence;

      storyContainerElem.appendChild(textElem);
    } else {
      const textElem = document.createElement("p");
      textElem.className = "generated-text";
      textElem.innerHTML = sentence;

      storyContainerElem.appendChild(textElem);
    }
  })
};

// Function to create image element for every generated image
let displayImage = (data, index) => {
    const imgContainer = document.createElement("div");
    const imgElem = document.createElement("img");

    imgContainer.className = "generated-image";
    imgElem.src = `/assets/generated-images/${data}`;

    imgContainer.appendChild(imgElem);
    storyContainerElem.appendChild(imgContainer);

    const textElem = document.querySelectorAll(".generated-text")[index]; 
    textElem.parentNode.insertBefore(imgContainer, textElem.nextSibling);
};

// Function to switch displayed section
function switchSection(currentId, nextId) {
  const currentSection = document.getElementById(currentId);
  const nextSection = document.getElementById(nextId);
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

// Switch to Story section
document.getElementById("go-to-verhaal").addEventListener("click", (e) => {
  e.preventDefault();
  switchSection("ba-section", "verhaal-section");

  startStory();
});

// ------------------------ Colour changing button elements ------------------------ //

//Buttons Genre, Bad/Good Characters background color changes
document.addEventListener('DOMContentLoaded', function () {
  // Selecteer every button
  const buttons = document.querySelectorAll('.knop');

  // Select random colour function
  function getRandomColor() {
      const letters = '0123456789ABCDEF';
      let color = '#';
      for (let i = 0; i < 6; i++) {
          color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
  }

  buttons.forEach(button => {
      button.addEventListener('click', function () {
          // Reset colours after a new click
          document.querySelectorAll('.knop-wrapper').forEach(wrapper => {
              wrapper.style.backgroundColor = ''; 
          });

         
          const randomColor = getRandomColor();

          // Older wrapper (parent) changer
          const parentWrapper = this.closest('.knop-wrapper');
          if (parentWrapper) {
              parentWrapper.style.backgroundColor = randomColor; 
          }
      });
  });
});
