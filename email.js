const fetch = require("node-fetch");

// Define the Sendinblue API endpoint
const url = "https://api.brevo.com/v3/smtp/email";

// Define the API key and email data
const apiKey =
  "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";
const emailData = {
  sender: {
    name: "Sender Alex",
    email: "omagaowi@gmail.com",
  },
  to: [
    {
      email: "omagadvd@gmail.com",
      name: "John Doe",
    },
  ],
  subject: "Hello world",
  htmlContent:
    "<html><head></head><body><p>Hello,</p>This is my first transactional email sent from Brevo.</p></body></html>",
};

// Send the POST request
fetch(url, {
  method: "POST",
  headers: {
    accept: "application/json",
    "api-key": apiKey,
    "content-type": "application/json",
  },
  body: JSON.stringify(emailData),
})
  .then((response) => response.json())
  .then((data) => {
    console.log("Email sent successfully:", data);
  })
  .catch((error) => {
    console.error("Error sending email:", error);
  });
