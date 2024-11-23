import cron from 'node-cron';
import fetch from 'node-fetch'; // To fetch data from external APIs

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'; // Use environment variable or fallback to localhost
const POST_API_URL = `${BASE_URL}/api/data`; // Adjust the endpoint if necessary

// Function to fetch temperature and humidity data and post it to your API
const fetchAndStoreData = async () => {
  let currentIp = null;

  // Fetch the current IP from the Next.js API (GET request)
  try {
    console.log('Fetching IP from API...');
    const ipResponse = await fetch(`${BASE_URL}/api/add`);
    const ipData = await ipResponse.json();
    console.log("Fetched IP data:", ipData);

    if (ipData.ip) {
      currentIp = ipData.ip;
    } else {
      throw new Error('No IP found in the database');
    }
  } catch (error) {
    console.error('Error fetching IP:', error);
    return; // Exit the function if IP cannot be fetched
  }

  try {
    // Define URLs for temperature and humidity APIs using the fetched IP
    const TEMP_API_URL = `http://${currentIp}/temperature`;
    const HUMIDITY_API_URL = `http://${currentIp}/humidity`;

    // Fetch temperature data
    const tempResponse = await fetch(TEMP_API_URL);
    const temperature = parseFloat(await tempResponse.text()); // Parse as float

    // Fetch humidity data
    const humidityResponse = await fetch(HUMIDITY_API_URL);
    const humidity = parseFloat(await humidityResponse.text()); // Parse as float

    console.log(`Fetched Temperature: ${temperature}, Humidity: ${humidity}`);

    // Validate temperature and humidity
    if (isNaN(temperature) || isNaN(humidity)) {
      throw new Error('Invalid temperature or humidity data');
    }

    // Prepare the data to send to your POST API
    const postData = { temperature, humidity };

    // Send the data to your POST API endpoint
    const postResponse = await fetch(POST_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    });

    // Check if the POST request was successful
    if (postResponse.ok) {
      console.log('Data successfully stored in the database');
    } else {
      const errorText = await postResponse.text();
      console.error('Error posting data:', errorText);
    }
  } catch (error) {
    console.error('Error fetching or posting data:', error);
  }
};

// Set up a cron job to run every 1 minute (*/1 * * * *)
cron.schedule('*/1 * * * *', () => {
  console.log('Running cron job to fetch and store data');
  fetchAndStoreData(); // Call the function to fetch and store data
});

// Optional handler (only if needed for serverless frameworks)
export default function handler(req, res) {
  res.status(200).json({ message: 'Cron job is running every 1 minute' });
}
