const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

const PAGE_ACCESS_TOKEN = 'YOUR_PAGE_ACCESS_TOKEN';

app.get('/webhook', (req, res) => {
  const VERIFY_TOKEN = 'YOUR_VERIFY_TOKEN';
  const token = req.query['hub.verify_token'];
  if (token === VERIFY_TOKEN) {
    const challenge = req.query['hub.challenge'];
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

app.post('/webhook', (req, res) => {
  const body = req.body;
  if (body.object === 'page' && body.entry) {
    body.entry.forEach(entry => {
      const webhook_event = entry.messaging[0];
      console.log(webhook_event);
      if (webhook_event.message) {
        handleMessage(webhook_event.sender.id, webhook_event.message);
      }
    });
    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

function handleMessage(sender_psid, received_message) {
  const message_text = received_message.text;
  const response = {
    text: `You sent: "${message_text}". We received your message!`
  };
  callSendAPI(sender_psid, response);
}

function callSendAPI(sender_psid, response) {
  const messageData = {
    recipient: { id: sender_psid },
    message: response
  };
  request({
    uri: 'https://graph.facebook.com/v12.0/me/messages',
    qs: { access_token: PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: messageData
  }, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      console.log('Message sent successfully');
    } else {
      console.error('Unable to send message:', error);
    }
  });
}

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
