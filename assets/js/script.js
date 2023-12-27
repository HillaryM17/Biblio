var searchInputText = "Important";
var searchInputElement = $("#search");
var wordDefinitionsArea = $("#result");
var wordPronunciationArea = $("#pronunciation");
var wordExamples = $("#examples");
var historyContainer = $(".previous-searches");
var history = [];
var favourites = [];


const speechOptions = {
  method: "GET",
  headers: {
    "X-RapidAPI-Key": "6258e18b25mshd96a594dcf7fcb5p1b1fd6jsn955bae6d8f8b",
    "X-RapidAPI-Host": "voicerss-text-to-speech.p.rapidapi.com",
  },
};
const wordsBaseURL = "https://wordsapiv1.p.rapidapi.com/words/";
const wordsDefinitions = "/definitions";
const wordsExamples = "/examples";

const wordsOptions = {
  method: "GET",
  headers: {
    "X-RapidAPI-Key": "6258e18b25mshd96a594dcf7fcb5p1b1fd6jsn955bae6d8f8b",
    "X-RapidAPI-Host": "wordsapiv1.p.rapidapi.com",
  },
};

function validateInput(word) {
   if (word.length < 1) {
      return false
   }
      return true 
}


function onsearch(word) {
   const speechURL =
   "https://voicerss-text-to-speech.p.rapidapi.com/?key=171ec3cab6f247b4b6e7f596d9171ae7&src=" +
   searchInputText +
   "&hl=en-us&r=0&c=mp3&f=8khz_8bit_mono";
   const wordsURLDefinitions = wordsBaseURL + searchInputText + wordsDefinitions;
   const wordsURLExamples = wordsBaseURL + searchInputText + wordsExamples;
   let wordDefinitions = [];
  let wordData = [];

  fetch(wordsURLDefinitions, wordsOptions)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      for (let i = 0; i < data.definitions.length; i++) {
        wordDefinitions.push(data.definitions[i].definition);
      }

      wordData.definitions = wordDefinitions;
      
    });
  fetch(wordsURLExamples, wordsOptions)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      wordData.examples = data.examples;
    });
  let audio = {
    context: new AudioContext(),
    buffer: null,
  };
  wordData["audio"] = audio;

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
  wordData.audio = audio;
  console.log("Word Data: ", wordData);
  renderWord(wordData);
  //validateResponse(data);
  //addHistoryItem(word);
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
function removeHistoryItem(event) {
  let index = $(event.currentTarget).attr("data-index");
  history.splice(index, 1);
  let stringHistory = JSON.stringify(history);
  localStorage.setItem("history", stringHistory);
  renderHistoryItems();
}

function addHistoryItem(item) {
  history.push(item);
  let stringHistory = JSON.stringify(history);
  localStorage.setItem("history", stringHistory);
  renderHistoryItems();
}

$(document).on("keypress", "#search", (event) => {
   if (event.key == "Enter") 
   {searchInputText = searchInputElement.val().trim()
   if (validateInput(searchInputText)){
      onsearch(searchInputText);
   }
   else {
      // TODO: Invalid Input Alert/Modal
      alert("Invalid Input");
   }
   }  
});

$(".remove").on("click", "#search", removeHistoryItem);

