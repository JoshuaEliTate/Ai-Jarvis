const axios = require('axios');
console.log("running")
const data = {
  text: "Once upon a time, there was a mischievous cat named Whiskers. Whiskers loved to explore, always getting into trouble. One day, he wandered into a magical garden and accidentally knocked over a potion. It turned him into a human! Whiskers was thrilled - now he could cause even more mischief!",
  voice: "larry"
};

const config = {
  headers: {
    'AUTHORIZATION': '',
    'X-USER-ID': '',
    'accept': 'text/event-stream',
    'content-type': 'application/json'
  }
};

axios.post('https://play.ht/api/v2/tts', data, config)
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.error(error);
  });