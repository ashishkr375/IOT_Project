// pages/api/update-ip.js
let currentIp = null;

export default function handler(req, res) {
  if (req.method === 'POST') {
    currentIp = req.body.ip;  // Update the IP received from the ESP8266
    res.status(200).json({ message: 'IP updated successfully' });
  } else if (req.method === 'GET') {
    // Send the current IP if needed
    res.status(200).json({ ip: currentIp });
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}

export const getCurrentIp = () => currentIp;
