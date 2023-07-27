// app.js
const express = require('express');
const { sendEmail } = require('./mailer');

const app = express();
app.use(express.json());

app.post('/send-notification', async (req, res) => {
  const { to, subject, message } = req.body;
  try {
    await sendEmail(to, subject, message);
    res.status(200).send('Notification sent');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error sending notification');
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  const { address, port } = server.address();
  console.log(`Notification service listening at http://${address}:${port}`);
});

