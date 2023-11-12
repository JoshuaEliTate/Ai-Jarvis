const Sequelize = require('sequelize');
const express = require('express');
const app = express();
const http = require('http');
const twilio = require('twilio');
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const server = http.createServer(app);
require('dotenv').config()
const sequelize = new Sequelize({
  database: "aiJarvis_db",
  username: "root",
  password: "",
  host: 'localhost',
  dialect: 'mysql',
  port: 3306,
});

sequelize.sync()
  .then(() => {
    server.listen(3000, () => {
    //   Make the call immediately when the server starts
      const phoneNumber = process.env.RECIPIENT_PHONE_NUMBER;  // Set your phone number here
      twilioClient.calls
        .create({
          url: 'https://923554703120.ngrok.app/callUser',  // Make sure to replace this with your public server URL
          to: phoneNumber,
          from: process.env.TWILIO_PHONE_NUMBER,  // Your Twilio phone number
        })
        .then(call => console.log(call))
        .catch(err => console.error(err));
    });
  })
  .catch((error) => {
    console.error('Unable to sync models with the database:', error);
  });