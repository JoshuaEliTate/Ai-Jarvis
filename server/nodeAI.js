
const { Configuration, OpenAIApi } = require('openai');
require('dotenv').config();

const configuration = new Configuration({
  organization: 'org-1l6kIkYyw0yBegZcKwdNEvzb',
  apiKey: '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',
});
const openai = new OpenAIApi(configuration);

const axios = require('axios');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function runChatCompletion() {
  const OPENAI_API_KEY = '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';
  const url = 'https://api.openai.com/v1/chat/completions';
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${OPENAI_API_KEY}`,
  };
  const messages = [];
  const data = {
    model: 'gpt-3.5-turbo',
    messages: messages,
    temperature: 0.7,
  };

  try {
    async function processUserInput(userInput) {
      if (userInput.toLowerCase() === 'end') {
        console.log('Conversation ended.');
        rl.close();
        return;
      }
      
      messages.push({ role: 'user', content: userInput });
      data.messages = messages;
      const response = await axios.post(url, data, { headers });
      const result = response.data;
      const assistantResponse = result.choices[0].message.content;
      console.log('Assistant:', assistantResponse);
      
      rl.question('User: ', processUserInput);
    }
    
    rl.question('User: ', (userInput) => {
      if (userInput.trim() === '') {
        console.log('No input provided. Conversation ended.');
        rl.close();
      } else {
        processUserInput(userInput);
      }
    });
  } catch (error) {
    console.error('Error:', error.response.data);
  }
}

runChatCompletion();