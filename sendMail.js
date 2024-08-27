const fetch = require("node-fetch");

const sendMail = async (content, data) => {
  try {
    const url = "https://api.brevo.com/v3/smtp/email";

    const emailData = {
      sender: {
        name: "NivanFX",
        email: "omagaowi@gmail.com",
      },
      to: [
        {
          email: data.email,
          name: "Hello User",
        },
      ],
      subject: "Your Payment was Sucessful",
      htmlContent: content,
      textContent: `Your payment of ${data.amoout} for ${data.plan} was successful`,
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "api-key": apikeys.email,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailData),
    });

    const data = await response.json();
  } catch (error) {
    console.error("Error:", error);
  }
};


module.exports = { sendMail }