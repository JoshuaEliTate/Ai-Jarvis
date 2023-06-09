// // const audioToText = require('./transcribe.js');

const fs = require('fs');
const { Configuration, OpenAIApi } = require("openai");
require('dotenv').config()
const axios = require('axios');
let audio = ""

const configuration = new Configuration({
    // organization: "org-1l6kIkYyw0yBegZcKwdNEvzb",
    apiKey: "API-KEY",
});
const openai = new OpenAIApi(configuration);



async function runChatCompletion() {
  const OPENAI_API_KEY = 'API-KEY';
  const url = 'https://api.openai.com/v1/chat/completions';
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer API-KEY`
  };
//this is getting the text version of the audio ready to be sent to the AI
  const data = {
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'user', content: `${audio}?` }
    ],
    temperature: 0.7
  };
//this posts the data from the data variable to the AI and runs it to get a response
  try {
    const response = await axios.post(url, data, { headers });
    const result = response.data;
    const messageContent = result.choices[0].message.content;
    console.log(result.choices[0].message.content);

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






// const { Configuration, OpenAIApi } = require('openai');
// require('dotenv').config();

// const configuration = new Configuration({
//   organization: 'org-1l6kIkYyw0yBegZcKwdNEvzb',
//   apiKey: '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',
// });
// const openai = new OpenAIApi(configuration);

// const axios = require('axios');
// const readline = require('readline');

// const rl = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout,
// });

// async function runChatCompletion() {
//   const OPENAI_API_KEY = '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';
//   const url = 'https://api.openai.com/v1/chat/completions';
//   const headers = {
//     'Content-Type': 'application/json',
//     'Authorization': `Bearer ${OPENAI_API_KEY}`,
//   };
//   const messages = [];
//   const data = {
//     model: 'gpt-3.5-turbo',
//     messages: messages,
//     temperature: 0.7,
//   };

//   try {
//     async function processUserInput(userInput) {
//       if (userInput.toLowerCase() === 'end') {
//         console.log('Conversation ended.');
//         rl.close();
//         return;
//       }
      
//       messages.push({ role: 'user', content: userInput });
//       data.messages = messages;
//       const response = await axios.post(url, data, { headers });
//       const result = response.data;
//       const assistantResponse = result.choices[0].message.content;
//       console.log('Assistant:', assistantResponse);
      
//       rl.question('User: ', processUserInput);
//     }
    
//     rl.question('User: ', (userInput) => {
//       if (userInput.trim() === '') {
//         console.log('No input provided. Conversation ended.');
//         rl.close();
//       } else {
//         processUserInput(userInput);
//       }
//     });
//   } catch (error) {
//     console.error('Error:', error.response.data);
//   }
// }

// runChatCompletion();