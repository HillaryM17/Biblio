var searchInputText = "Hello";
var searchInputElement = $("#search");
var wordDefinitionArea = $("#definition");
var wordPronunciationArea = $("#pronunciation");
var wordExamples = $("#examples");
var historyContainer = $(".previous-searches");
var searchButton = $("#search-button");
var history = [];
var favourites = [];

const speechURL =
  "https://voicerss-text-to-speech.p.rapidapi.com/?key=171ec3cab6f247b4b6e7f596d9171ae7&src=" +
  searchInputText +
  "&hl=en-us&r=0&c=mp3&f=8khz_8bit_mono";
const speechOptions = {
  method: "GET",
  headers: {
    "X-RapidAPI-Key": "6258e18b25mshd96a594dcf7fcb5p1b1fd6jsn955bae6d8f8b",
    "X-RapidAPI-Host": "voicerss-text-to-speech.p.rapidapi.com",
  },
};

const wordsURL = "https://wordsapiv1.p.rapidapi.com/words/" + searchInputText + "/definitions";
const wordsOptions = {
  method: "GET",
  headers: {
    "X-RapidAPI-Key": "6258e18b25mshd96a594dcf7fcb5p1b1fd6jsn955bae6d8f8b",
    "X-RapidAPI-Host": "wordsapiv1.p.rapidapi.com",
  },
};

//$(".search-button").on("click", function () {

//});

function onsearch() {
  fetch(wordsURL, wordsOptions)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      console.log("words data: ", data);
    });

  fetch(speechURL, speechOptions).then(function (response) {
    console.log(response);
  });
}

// onsearch();

function renderWord(data) {
  let definition = data.definition;
  let audio = data.audio;
  let examples = data.examples;

  // Add word definition to DOM
  wordDefinitionArea.text(definition);

  // Add word audio data to DOM (COMING SOON!)
  // wordPronunciationArea.attr("src", audio);

  // Clear wordExamples container
  wordExamples.empty();

  // Reconstruct wordExamples header
  let wordExamplesHeader = $("<h2>");
  wordExamplesHeader.text("Examples");
  wordExamples.append(wordExamplesHeader);

  // Add each word example to DOM
  examples.forEach(function (example, index) {
    let title = example.title;
    let text = example.text;

    // Create elements
    let exampleElement = $("<div>");
    let exampleTitleElement = $("<h3 class='fs-5'>");
    let exampleTextElement = $("<p>");

    // Append to elements
    exampleTitleElement.append(title);
    exampleTextElement.append(text);

    // Append sub-elements to example-element
    exampleElement.append(exampleTitleElement, exampleTextElement);

    // Append to DOM
    wordExamples.append(exampleElement);
  });
}

// Placeholder Data object for testing renderWord(data) ... (exact structure will come from Hillary's onsearch function)
let data = {
  definition:
    "Matt Example Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. ",
  audio: "audioData",
  examples: [
    {
      title: "Matt Example One",
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
    },
    {
      title: "Matt Example Two",
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
    },
  ],
};

// Test call renderWord function
renderWord(data);
