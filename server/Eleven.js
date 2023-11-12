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
  messages.push({ role: 'assistant', content: userText });

  // Transform the chat history into the messages array

  // Prepare the data for the AI
  const data = {
    model: 'gpt-3.5-turbo-16k-0613',
    messages: messages,
    max_tokens: 100,
    temperature: 1
  };

  // Post the data to the AI and get a response
  try {
    const response = await axios.post(url, data, { headers });
    const result = response.data;
    messageContent = result.choices[0].message.content;
    console.log(messageContent);
    messageLength = messageContent.length * 30;
    if (messageLength > 8500) {
      messageLength = 8500;
    } else if (messageLength <3000){
      messageLength = 3000
    }
    return messageContent;
  } catch (error) {
    console.error('Error:', error.response.data);
  }
}

async function createAudio(aiText) {
  const url = 'https://api.elevenlabs.io/v1/text-to-speech//stream?optimize_streaming_latency=2';
  console.log("audio creation started")
  const headers = {
    'accept': 'audio/mpeg',
    'xi-api-key': process.env.XI_API_KEY,
    'Content-Type': 'application/json'
  };
  const payload = {
    "text": `${aiText}`,
    "model_id": "eleven_monolingual_v1",
    "voice_settings": {
      "stability": 0,
      "similarity_boost": 0
    }
  };

  axios.post(url, payload, { headers, responseType: 'arraybuffer' })
    .then(response => {

      const audioContent = Buffer.from(response.data, 'binary');
      fs.writeFile('aiResponse.mp3', audioContent, 'binary', err => {
        if (err) {
          console.error('Error:', err);
        } else {
          console.log('Audio received and saved as aiResponse.mp3');
        }
      });
    })
    .catch(error => {
      console.error('Error:', error.response.status);
    });
}

app.post('/callUser', async (req, res) => {
  const phoneNumber = req.body.Caller;
  console.log(req.body.Caller);
  console.log("call started");
  messages = [ {"role": "system", "content": "You are an assistant that knows a bit about the user, you want to be personable in your responses. The user is a software engineer who enjoys hiking and reading science fiction novels."}];
  const twiml = new twilio.twiml.VoiceResponse();
  twiml.play("https://a81bf325ec64.ngrok.app/audio/welcome.mp3");
  twiml.pause({ length: 2 }); // Add a pause intial prompt
  twiml.gather({
    input: 'speech',
    speechTimeout: 1,
    timeout: 10,
    action: '/gather-handler',
    method: 'POST',
  }).play('https://a81bf325ec64.ngrok.app/audio/howHelp.mp3');

  res.type('text/xml');
  res.send(twiml.toString());
});

app.post('/gather-handler', async (req, res) => {
  const phoneNumber = req.body.Caller;
  userText = req.body.SpeechResult;
  console.log(userText);

  // Check if there is an existing conversation, if not, create a new one
  if (!conversations[phoneNumber]) {
    conversations[phoneNumber] = { isActive: true, aiResponse: 'Welcome to the automated response system. Please wait while we connect you.' };
  }

  if (!phoneNumber || !conversations[phoneNumber] || !conversations[phoneNumber].isActive) {
    res.status(400).send('Invalid conversation');
    return;
  }

  if (userText) {

    const aiResponse = await createAiResponse(phoneNumber, userText);
    conversations[phoneNumber].aiResponse = aiResponse;
    // randomValue = audioResponse;


      // twiml.play("https://a81bf325ec64.ngrok.app/aiResponse.mp3");
      // twiml.pause({ length: 1 }); // Add a pause after AI response
      // //add a true false boolean at the end of the
      createAudio(messageContent).then(() => {
        setTimeout(function wait() {
        twiml.play("https://a81bf325ec64.ngrok.app/aiResponse.mp3");
        twiml.pause({ length: 1 }); // Add a pause after AI response
        // Gather user's speech input
        twiml.gather({
          input: 'speech',
          speechTimeout: 1,
          timeout: 10,
          action: '/gather-handler',
          method: 'POST',
        });

        res.type('text/xml');
        res.send(twiml.toString());
      }, 2000)
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
      timeout: 4,
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
        url: 'https://a81bf325ec64.ngrok.app/callUser',  // Make sure to replace this with your public server URL
        to: phoneNumber,
        from: process.env.TWILIO_PHONE_NUMBER,  // Your Twilio phone number
      })
      .then(call => console.log("server intitiated"))
      .catch(err => console.error(err));
  });


  
