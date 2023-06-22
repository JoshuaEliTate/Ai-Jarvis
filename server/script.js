// // const audioToText = require('./transcribe.js');

const fs = require('fs');
const { Configuration, OpenAIApi } = require("openai");
require('dotenv').config()
const axios = require('axios');
let audio = ""
let aiResponse = ""
const configuration = new Configuration({
    apiKey:  process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);



async function runChatCompletion() {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  const url = 'https://api.openai.com/v1/chat/completions';
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
  };
//this is getting the text version of the audio ready to be sent to the AI
  const data = {
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'user', content: `${audio}?` }
    ],
    max_tokens : 100,
    temperature: 1
  };
//this posts the data from the data variable to the AI and runs it to get a response
  try {
    const response = await axios.post(url, data, { headers });
    const result = response.data;
    const messageContent = result.choices[0].message.content;
    console.log(messageContent);
    receiveAudio(messageContent);
  } catch (error) {
    console.error('Error:', error.response.data);
  }
}


//this converts a mp3 into audio and puts that information onto an audio variable
const audioToText = async()=>{
const resp = await openai.createTranscription(
  fs.createReadStream("./audio/mjVoice.mp3"),
  "whisper-1"
);
audio = resp.data.text
console.log(resp.data.text)
}

//this makes sure that the audio to text runs before it messages the AI
async function main() {
    await audioToText();
    runChatCompletion();
  }
  
  main();



function receiveAudio(aiText) {
  const url = 'https://api.elevenlabs.io/v1/text-to-speech/rXXkqBiJdKlYp8wOIbM4?optimize_streaming_latency=0';
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
      fs.writeFile('received_audio.mp3', audioContent, 'binary', err => {
        if (err) {
          console.error('Error:', err);
        } else {
          console.log('Audio received and saved as received_audio.mp3');
        }
      });
    })
    .catch(error => {
      console.error('Error:', error.response.status);
    });
}

