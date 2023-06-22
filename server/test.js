const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })
const http = require('http');
const express = require('express');
const twilio = require('twilio');
const axios = require('axios');
require('dotenv').config();
const bodyParser = require('body-parser');

const app = express();
const server = http.createServer(app);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Store the conversation state
const conversations = {};

async function createAiResponse(userSpeech) {
  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: `${userSpeech}?` }],
      max_tokens : 75,
      temperature: 0.7,
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    });

    const aiResponse = response.data.choices[0].message.content;
    console.log(aiResponse);

    return aiResponse;
  } catch (error) {
    console.error('Error:', error.response.data);
    return "Sorry, an error occurred.";
  }
}

app.post('/outgoing-call', (req, res) => {
  const twiml = new twilio.twiml.VoiceResponse();
  twiml.say('Welcome to the automated response system. Please wait while we connect you.');
  twiml.gather({
    input: 'speech',
    timeout: 5,
    action: '/gather-handler',
    method: 'POST',
  }).say('How may i assist you today?');

  res.type('text/xml');
  res.send(twiml.toString());
});

app.post('/gather-handler', async (req, res) => {
  const phoneNumber = req.body.From;
  const userSpeech = req.body.SpeechResult;

  // Check if there is an existing conversation, if not, create a new one
  if (!conversations[phoneNumber]) {
    conversations[phoneNumber] = { isActive: true, aiResponse: 'Welcome to the automated response system. Please wait while we connect you.' };
  }

  if (!phoneNumber || !conversations[phoneNumber] || !conversations[phoneNumber].isActive) {
    res.status(400).send('Invalid conversation');
    return;
  }

  if (userSpeech) {


    const aiResponse = await createAiResponse(userSpeech);
    conversations[phoneNumber].aiResponse = aiResponse;

    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say(aiResponse);
    twiml.pause({ length: 1 }); // Add a pause after AI response

    // Gather user's speech input
    twiml.gather({
      input: 'speech',
      timeout: 5,
      action: '/gather-handler',
      method: 'POST',
    }).say('How else can i assist you?.');


    res.type('text/xml');
    res.send(twiml.toString());
  } else {
    // No speech input received
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say("I'm sorry, but I didn't catch that.");
    res.type('text/xml');
    res.send(twiml.toString());
  }
});

server.listen(3000, () => {
    // Make the call immediately when the server starts
    const phoneNumber = process.env.RECIPIENT_PHONE_NUMBER;  // Set your phone number here
    twilioClient.calls
      .create({
        url: 'https://b922-173-160-242-66.ngrok-free.app/outgoing-call',  // Make sure to replace this with your public server URL
        to: phoneNumber,
        from: process.env.TWILIO_PHONE_NUMBER,  // Your Twilio phone number
      })
      .then(call => console.log(call.sid))
      .catch(err => console.error(err));
  });

