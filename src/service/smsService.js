const config = require("../config");

// Multi factor auth implementation
async function sendSMS(to, message) {
  const url = "https://api.managepoint.co/api/sms/send"; // ManagePoint API URL
  const apiKey = config.SMS_API_KEY;
  const payload = {
    apiKey,
    to,
    message,
  };
  const headers = {
    "Content-Type": "application/json",
  };
  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
    return await response.json();
  } catch (error) {
    throw new Error(error.message);
  }
}

module.exports = {
  sendSMS,
};
