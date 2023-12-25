var searchInputText = "Hello";
var searchInputElement = $("#search");
var wordDefinitionsArea = $("#result");
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

function renderWord({ definitions, audio, examples }) {
  renderFirstDefinition(definitions[0]);
  attachAudioEventHandler(audio);
  renderExamples(examples);
}

function renderFirstDefinition(definition) {
  // Clear wordExamples container
  wordDefinitionsArea.empty();

  // Reconstruct wordExamples header
  let wordDefinitionsHeader = $("<h2>");
  wordDefinitionsHeader.text("Definition");
  wordDefinitionsArea.append(wordDefinitionsHeader);

  // Create element
  let definitionElement = $("<p>");
  // Append definition to element
  definitionElement.append(definition);
  // Append to DOM
  wordDefinitionsArea.append(definitionElement);
}

function renderExamples(examples) {
  wordExamples.empty();

  // Reconstruct wordExamples header
  let examplesHeader = $("<h2>");
  examplesHeader.text("Examples");
  wordExamples.append(examplesHeader);

  examples.forEach(function (example) {
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

function attachAudioEventHandler(audio) {
  wordPronunciationArea.on("click", function () {
    let bufferSource = audio.context.createBufferSource();
    bufferSource.buffer = audio.buffer;
    bufferSource.connect(audio.context.destination);
    bufferSource.start(audio.context.currentTime);
  });
}

// =========================
// Functions and Objects - for testing
// =========================

let data = {
  definitions: [
    "Matt Definition One Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. ",
    "Matt Definition Two Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. ",
  ],
  audio: getDemoAudio(),
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

function getDemoAudio() {
  let speechURL =
    "https://voicerss-text-to-speech.p.rapidapi.com/?key=171ec3cab6f247b4b6e7f596d9171ae7&src=donkey";
  let otherStuff = "&hl=en-us&r=0&c=mp3&f=8khz_8bit_mono";
  speechURL += otherStuff;

  const speechOptions = {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": "6258e18b25mshd96a594dcf7fcb5p1b1fd6jsn955bae6d8f8b",
      "X-RapidAPI-Host": "voicerss-text-to-speech.p.rapidapi.com",
    },
  };

  let audio = {
    context: new AudioContext(),
    buffer: null,
  };

  fetch(speechURL, speechOptions)
    .then(function (response) {
      return response.arrayBuffer();
    })

    .then(function (buffer) {
      return audio.context.decodeAudioData(buffer);
    })

    .then(function (decodedAudio) {
      audio.buffer = decodedAudio;
    });

  return audio;
}

// =========================
// Call renderWord function - for testing
// =========================

renderWord(data);
