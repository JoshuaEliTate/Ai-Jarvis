const path = require('path');
const fs = require('fs');
const { Configuration } = require("openai");
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const http = require('http');
const express = require('express');
const twilio = require('twilio');
const axios = require('axios');
require('dotenv').config();
let userText = "";
let messageContent = "";
let messageLength = 0;
const bodyParser = require('body-parser');
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const VoiceResponse2 = require('twilio').twiml.VoiceResponse;
const app = express();
const twiml = new twilio.twiml.VoiceResponse();

let messages = []
var sdk = require("microsoft-cognitiveservices-speech-sdk");

app.use(express.json());
app.use(express.static(path.join(__dirname)));
console.log(__dirname, 'public');
const server = http.createServer(app);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Define the User and Chat models

// Store the conversation state
const conversations = {};

async function createAiResponse(phoneNumber, userText) {
  const url = 'https://api.openai.com/v1/chat/completions';
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
  };

  // Push the new user message to the messages array before sending the data
  messages.push({ role: 'user', content: userText });

  // Prepare the data for the AI
  const data = {
    model: 'gpt-3.5-turbo-16k-0613',
    messages: messages,
    max_tokens: 75,
    temperature: .6,
    frequency_penalty: 2,
    presence_penalty: 2
  };

  // Post the data to the AI and get a response
  try {
    const response = await axios.post(url, data, { headers });
    const result = response.data;
    messageContent = result.choices[0].message.content;
    console.log(messageContent);
    return messageContent;
  } catch (error) {
    console.error('Error:', error.response.data);
  }
}



async function createAudio(aiText) {
  console.log("audio creation started")

  // The output audio file path.
  const audioFile = "aiResponse.wav";

  // This example requires environment variables named "SPEECH_KEY" and "SPEECH_REGION"
  const speechConfig = sdk.SpeechConfig.fromSubscription(`${process.env.SPEECH_KEY}`, 'westus');
  const audioConfig = sdk.AudioConfig.fromAudioFileOutput(audioFile);

  // The language of the voice that speaks.
  speechConfig.speechSynthesisVoiceName = "en-US-JennyNeural"; 

  // Create the speech synthesizer.
  let synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

  // Start the synthesizer and wait for a result.
  synthesizer.speakTextAsync(
    aiText,
    function (result) {
      if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
        console.log("synthesis finished. Audio saved as " + audioFile);
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
    }
  );
  console.log("Now synthesizing to: " + audioFile);
}




app.post('/callUser', async (req, res) => {
  const phoneNumber = req.body.Caller;
  console.log(req.body.Caller);
  console.log("call started");
  messages = [ {"role": "system", "content": "First off, ONLY RESPOND TO THE NEWEST QUESTION ASKED, AND DO NOT REPLY WITH THE QUESTION IN YOUR RESPONSE. Please provide brief and concise answers, while still responding as if you are having a conversation with someone. you are friendly, engaging, empathetic, curious, and respectful. you try to understand the user's perspective and provide relevant and helpful information. you don't make assumptions or judgments, and you always try to be understanding and supportive. The user is a software engineer who enjoys hiking and reading science fiction novels. they are located in bellevue, washington 98005 United states. Please provide brief and concise answers, while still responding as if you are having a conversation with someone. you are friendly, engaging, empathetic, curious, and respectful. you try to understand the user's perspective and provide relevant and helpful information. you don't make assumptions or judgments, and you always try to be understanding and supportive"}];
  const twiml = new twilio.twiml.VoiceResponse();
  // twiml.play("https://a81bf325ec64.ngrok.app/audio/welcome.mp3");
  // twiml.pause({ length: 2 }); // Add a pause intial prompt
  twiml.gather({
    input: 'speech',
    speechTimeout: .8,
    timeout: 10,
    action: '/gather-handler',
    method: 'POST',
  }).play(`${process.env.NGROK_IP}/audio/howHelp.mp3`);

  res.type('text/xml');
  res.send(twiml.toString());
});





app.post('/gather-handler', async (req, res) => {
  const phoneNumber = req.body.Caller;
  userText = req.body.SpeechResult;
  console.log(userText);

  if (userText) {

    const aiResponse = await createAiResponse(phoneNumber, userText);

      // //add a true false boolean at the end of the
      createAudio(messageContent).then(() => {
        setTimeout(function wait() {
        twiml.play(`${process.env.NGROK_IP}/aiResponse.wav`);

        // Gather user's speech input
        twiml.gather({
          input: 'speech',
          speechTimeout: .8,
          timeout: 10,
          action: '/gather-handler',
          method: 'POST',
        });

        res.type('text/xml');
        res.send(twiml.toString());
      }, 1250)
      }).catch(error => {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
      });
  } else {
    // No speech input received
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say("I'm sorry, but I didn't catch that.");
    twiml.gather({
      input: 'speech',
      speechTimeout: .8,
      timeout: 10,
      action: '/gather-handler',
      method: 'POST',
    });
    res.type('text/xml');
    res.send(twiml.toString());
  }
});





  server.listen(3000, () => {
    // Make the call immediately when the server starts
    const phoneNumber = process.env.RECIPIENT_PHONE_NUMBER;  // Set your phone number here
    twilioClient.calls
      .create({
        url: `${process.env.NGROK_IP}/callUser`,  // Make sure to replace this with your public server URL
        to: phoneNumber,
        from: process.env.TWILIO_PHONE_NUMBER,  // Your Twilio phone number
      })
      .then(call => console.log("server intitiated"))
      .catch(err => console.error(err));
  });


  
