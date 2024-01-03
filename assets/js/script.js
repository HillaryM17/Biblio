///////////////////////////////////////////////////////////////
// Initialise Global Variables
///////////////////////////////////////////////////////////////

var searchInputElement = $("#search");
var wordContainer = $("#word");
var wordDefinitionsArea = $("#definitions");
var wordPronunciationButton = $("#pronunciation");
var wordExamples = $("#examples");
var historyContainer = $("#search-history-items");
var modalHeader = $(".modal-header");
var modalBody = $(".modal-body");
var randomWords = [
  "rupee",
  "oligarch",
  "Cacao",
  "Homer",
  "recession",
  "canny",
  "foray",
  "trove",
  "saute",
];
let audioController = new AudioController();

///////////////////////////////////////////////////////////////
// API STUFF
///////////////////////////////////////////////////////////////

// API Keys
const rapidAPIKey = "6258e18b25mshd96a594dcf7fcb5p1b1fd6jsn955bae6d8f8b";
const speechAPIKey = "17e8c83f04474613b13eb338fe823dd1";

// API Base URLs
const wordsBaseURL = "https://wordsapiv1.p.rapidapi.com/words/";
const speechBaseURL = "https://voicerss-text-to-speech.p.rapidapi.com/?";

// Words API Options Object
const wordsOptions = {
  method: "GET",
  headers: {
    "X-RapidAPI-Key": rapidAPIKey,
    "X-RapidAPI-Host": "wordsapiv1.p.rapidapi.com",
  },
};

// Speech API Options Object
const speechOptions = {
  method: "GET",
  headers: {
    "X-RapidAPI-Key": rapidAPIKey,
    "X-RapidAPI-Host": "voicerss-text-to-speech.p.rapidapi.com",
  },
};

// Helper (abstractor) Function for Constructing Full URLS

function constructFullURLs(word) {
  return {
    definitionsURL: "https://wordsapiv1.p.rapidapi.com/words/" + word + "/definitions",
    examplesURL: "https://wordsapiv1.p.rapidapi.com/words/" + word + "/examples",
    speechURL:
      "https://voicerss-text-to-speech.p.rapidapi.com/?" +
      "key=" +
      speechAPIKey +
      "&src=" +
      word +
      "&hl=en-us&r=0&c=mp3&f=8khz_8bit_mono",
  };
}

///////////////////////////////////////////////////////////////
// SEARCH FUNCTION
///////////////////////////////////////////////////////////////

function onSearch(word) {
  // Construct Full API Query URLS
  const { definitionsURL, examplesURL, speechURL } = constructFullURLs(word);

  // Declare new wordData object
  let wordData = {
    word: word,
    definitions: null,
    examples: null,
    audio: {
      context: new AudioContext(),
      buffer: null,
    },
  };

  // Fetch 1:  definitions data ...
  return fetch(definitionsURL, wordsOptions)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      // Definitions fetch is complete!

      // Load into the wordData object ...
      wordData.definitions = [];
      for (let i = 0; i < data.definitions.length; i++) {
        wordData.definitions.push(data.definitions[i].definition);
      }

      // Fetch 2: examples data
      return fetch(examplesURL, wordsOptions)
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
          // Examples fetch is complete!

          // Load into the wordData object ...
          wordData.examples = data.examples;

          // Fetch 3: audio data (buffer) ...
          fetch(speechURL, speechOptions)
            .then(function (response) {
              return response.arrayBuffer();
            })
            .then(function (arrayBuffer) {
              return wordData.audio.context.decodeAudioData(arrayBuffer);
            })
            .then(function (decodedAudioBuffer) {
              // Audio data fetch is complete!

              // Now just load into the wordData object ...
              wordData.audio.buffer = decodedAudioBuffer;
            });

          // wordData is now complete to point that can be used in renderWord()
          return wordData;
        });
    })
    .catch((err) => {
      showErrorMessage("invalidSearch");
    });
}

function searchEnteredWord(event) {
  if (event.key == "Enter") {
    let word = searchInputElement.val().trim();
    if (validateInput(word)) {
      onSearch(word).then((wordData) => {
        renderWord(wordData);
        addHistoryItem(word);
        searchInputElement.val("");
      });
    } else {
      showErrorMessage("emptySearch");
    }
  }
}

function searchHistoryItem(event) {
  let word = $(event.currentTarget).attr("data-word");
  onSearch(word).then((wordData) => {
    renderWord(wordData);
  });
}

///////////////////////////////////////////////////////////////
// RENDER FUNCTIONS
///////////////////////////////////////////////////////////////

function renderWord({ word, definitions, audio, examples }) {
  wordContainer.text(word);
  wordDefinitionsArea.empty();
  for (let i = 0; i < definitions.length; i++) {
    renderDefinition(definitions[i], i);
  }
  wordExamples.empty();
  for (let i = 0; i < examples.length; i++) {
    renderExample(examples[i], i);
  }
  audioControls.setAudio(audio);
}

function renderDefinition(definition, number) {
  // Create element
  let definitionElement = $("<p>");
  // Append definition to element
  definitionElement.text(
    `${number + 1}. ${definition.charAt(0).toUpperCase() + definition.slice(1)}`
  );
  // Append to DOM
  wordDefinitionsArea.append(definitionElement);
}

function renderExample(example, number) {
  // Create elements
  let exampleElement = $("<div class='col'>");
  let exampleTextElement = $("<p>");
  let exampleTitle = $("<span class='fw-bold'>");
  exampleTitle.append(`Example ${number + 1}: `);
  // Append to elements
  exampleTextElement.append(exampleTitle);
  exampleTextElement.append(`${example.charAt(0).toUpperCase() + example.slice(1)}`);
  // Append sub-elements to example-element
  exampleElement.append(exampleTextElement);
  // Append to DOM
  wordExamples.append(exampleElement);
}

function renderHistory() {
  let historyArray = JSON.parse(localStorage.getItem("history"));
  historyContainer.empty();
  if (historyArray) {
    for (let i = 0; i < historyArray.length; i++) {
      let item = $(
        "<div class='rounded-pill search-history-item d-flex align-items-center justify-content-between py-1'>"
      );
      let p = $(`<p class='m-0 searched-word' data-word=${historyArray[i]}>`);
      let icon = $(`<i class='remove bi bi-x-lg' data-index=${i}>`);

      p.append(historyArray[i]);
      item.append(p, icon);
      historyContainer.append(item);
    }
  }
}

///////////////////////////////////////////////////////////////
// LOCAL STORAGE FUNCTIONS
///////////////////////////////////////////////////////////////

function addHistoryItem(item) {
  if (localStorage.getItem("history")) {
    historyArray = JSON.parse(localStorage.getItem("history"));
    historyArray.push(item);
    let stringHistory = JSON.stringify(historyArray);
    localStorage.setItem("history", stringHistory);
  } else {
    localStorage.setItem("history", JSON.stringify([`${item}`]));
  }
  renderHistory();
}

function removeHistoryItem(event) {
  let index = $(event.currentTarget).attr("data-index");
  let historyArray = JSON.parse(localStorage.getItem("history"));
  historyArray.splice(index, 1);
  historyArray = JSON.stringify(historyArray);
  localStorage.setItem("history", historyArray);
  renderHistory();
}

///////////////////////////////////////////////////////////////
// VALIDATION FUNCTIONS
///////////////////////////////////////////////////////////////

function validateInput(word) {
  if (word.length < 1) {
    return false;
  }
  return true;
}

function showErrorMessage(errorType) {
  if (errorType == "emptySearch") {
    modalHeader.text("Empty Search");
    modalBody.text("Search cannot be empty.");
  } else if (errorType == "invalidSearch") {
    modalHeader.text("Invalid Search");
    modalBody.text("Word not found. Please check spelling and try again");
  } else {
    return;
  }
  var myModal = new bootstrap.Modal(document.getElementById("myModal"), {
    keyboard: false,
  });
  myModal.show();
}

///////////////////////////////////////////////////////////////
// ATTACH EVENT LISTENERS / ASSIGN EVENT HANDLERS
///////////////////////////////////////////////////////////////

$(document).on("keypress", "#search", searchEnteredWord);
historyContainer.on("click", ".searched-word", searchHistoryItem);
historyContainer.on("click", ".remove", removeHistoryItem);
wordPronunciationButton.on("click", audioController.playAudio);

///////////////////////////////////////////////////////////////
// AUDIO CONTROLS (Object Constructor)
///////////////////////////////////////////////////////////////

function AudioController() {
  let _audio;

  this.playAudio = function () {
    let bufferSource = _audio.context.createBufferSource();
    bufferSource.buffer = _audio.buffer;
    bufferSource.connect(_audio.context.destination);
    bufferSource.start(_audio.context.currentTime);
  };

  this.setAudio = function (audio) {
    _audio = audio;
  };
}

///////////////////////////////////////////////////////////////
// INITIALISE
///////////////////////////////////////////////////////////////

function init() {
  let randomWord = randomWords[Math.floor(Math.random() * randomWords.length)];
  onSearch(randomWord).then((wordData) => {
    renderWord(wordData);
  });
  renderHistory();
}

init();
