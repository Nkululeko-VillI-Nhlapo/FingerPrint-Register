const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// In-memory storage for credentials (in a real app, you'd use a database)
const storedCredentials = [];

app.post('/register', (req, res) => {
  const { id, credential } = req.body;

  // Save the credential to the server (in a real application, store in a database)
  storedCredentials.push({ id, credential });

  res.status(200).send("Fingerprint registered successfully!");
});

app.post('/authenticate', (req, res) => {
  const { id, credential } = req.body;

  // Verify if the credential matches the one stored for the user
  const storedCredential = storedCredentials.find((stored) => stored.id === id);

  if (storedCredential && storedCredential.credential === credential) {
    res.status(200).send("Fingerprint authenticated successfully!");
  } else {
    res.status(400).send("Fingerprint authentication failed.");
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
