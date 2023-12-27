var searchInputText = "Important";
var searchInputElement = $("#search");
var wordDefinitionArea = $(".definition");
var wordPronunciationArea = $("#audio");
var audioEl = $(".source");
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
const wordsBaseURL = "https://wordsapiv1.p.rapidapi.com/words/";
const wordsDefinitions = "/definitions";
const wordsExamples = "/examples";
const wordsURLDefinitions = wordsBaseURL + searchInputText + wordsDefinitions;
const wordsURLExamples = wordsBaseURL + searchInputText + wordsExamples;
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
  //renderWord(wordData);
  //validateResponse(data);
  //addHistoryItem(word);
}

onsearch();
