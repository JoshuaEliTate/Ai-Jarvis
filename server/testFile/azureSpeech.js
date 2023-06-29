require('dotenv').config();

(function() {

    "use strict";

    var sdk = require("microsoft-cognitiveservices-speech-sdk");
    var readline = require("readline");

    var audioFile = "aiResponse.mp3"
    // This example requires environment variables named "SPEECH_KEY" and "SPEECH_REGION"
    const speechConfig = sdk.SpeechConfig.fromSubscription('8eecc57fbd89473c85773181f6371254', 'westus');
    const audioConfig = sdk.AudioConfig.fromAudioFileOutput(audioFile);

    // The language of the voice that speaks.
    speechConfig.speechSynthesisVoiceName = "en-US-JennyNeural"; 

    // Create the speech synthesizer.
    var synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

    var rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    var text = "Well Once upon a time, there was a mischievous cat named Whiskers. Whiskers loved to explore, always getting into trouble. One day, he wandered into a magical garden and accidentally knocked over a potion. It turned him into a human! Whiskers was thrilled - now he could cause even more mischief!"


      // Start the synthesizer and wait for a result.
      synthesizer.speakTextAsync(text,
          function (result) {
        if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
          console.log("synthesis finished.");
        } else {
          console.error("Speech synthesis canceled, " + result.errorDetails +
              "\nDid you set the speech resource key and region values?");
        }
        synthesizer.close();
        synthesizer = null;
      },
          function (err) {
        console.trace("err - " + err);
        synthesizer.close();
        synthesizer = null;
      });
      console.log("Now synthesizing to: " + audioFile);
    ;
}());


