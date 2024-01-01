var searchInputText = "Important";
var searchInputElement = $("#search");
var wordDefinitionsArea = $("#definitions");
var wordPronunciationButton = $("#pronunciation");
var wordExamples = $("#examples");
var historyContainer = $("#search-history-items");
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

function init() {
  onsearch(randomWords[Math.floor(Math.random() * randomWords.length)], true);
  renderHistory();
}

function validateInput(word) {
  if (word.length < 1) {
    return false;
  }
  return true;
}

function onsearch(word, init) {
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
      wordData.word = word;
      wordData.definitions = wordDefinitions;

      fetch(wordsURLExamples, wordsOptions)
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
          wordData.examples = data.examples;

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
          if (!init) {
            addHistoryItem(word);
          }
        });
    });
  //validateResponse(data);
}

function renderWord({ word, definitions, audio, examples }) {
  $("#word").text(word);
  wordDefinitionsArea.empty();
  for (let i = 0; i < definitions.length; i++) {
    renderDefinition(definitions[i], i);
  }
  attachAudioEventHandler(audio);

  wordExamples.empty();
  for (let i = 0; i < examples.length; i++) {
    renderExample(examples[i], i);
  }
}

function renderDefinition(definition, number) {
  // wordDefinitionsArea.find("p").remove();

  // Create element
  let definitionElement = $("<p>");
  console.log(definition);
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
  exampleTextElement.append(
    `${example.charAt(0).toUpperCase() + example.slice(1)}`
  );

  // Append sub-elements to example-element
  exampleElement.append(exampleTextElement);

  // Append to DOM
  wordExamples.append(exampleElement);
}

function attachAudioEventHandler(audio) {
  $("#pronunciation").on("click", function () {
    let bufferSource = audio.context.createBufferSource();
    bufferSource.buffer = audio.buffer;
    bufferSource.connect(audio.context.destination);
    bufferSource.start(audio.context.currentTime);
  });
}

function removeHistoryItem(event) {
  let index = $(event.currentTarget).attr("data-index");
  let historyArray = JSON.parse(localStorage.getItem("history"));
  historyArray.splice(index, 1);
  historyArray = JSON.stringify(historyArray);
  localStorage.setItem("history", historyArray);
  renderHistory();
}

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

$(document).on("keypress", "#search", (event) => {
  if (event.key == "Enter") {
    searchInputText = searchInputElement.val().trim();
    if (validateInput(searchInputText)) {
      onsearch(searchInputText, false);
    } else {
      // TODO: Invalid Input Alert/Modal
      alert("Invalid Input");
    }
  }
});

function renderHistory() {
  let historyArray = JSON.parse(localStorage.getItem("history"));
  historyContainer.empty();
  if (historyArray) {
    for (let i = 0; i < historyArray.length; i++) {
      let item = $(
        "<div class='rounded-pill search-history-item d-flex align-items-center justify-content-between py-1'>"
      );
      let p = $(`<p class='m-0'>`);
      let icon = $(`<i class='remove bi bi-x-lg' data-index=${i}>`);

      p.append(historyArray[i]);
      item.append(p, icon);
      historyContainer.append(item);
    }
  }
}

init();
$("#search-history-items").on("click", ".remove", removeHistoryItem);
