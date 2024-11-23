import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://admin_LiveLaunchBazaar:Ashish2003@livelaunchbazaar.arod5r7.mongodb.net/?retryWrites=true&w=majority&appName=LiveLaunchBazaar";
const client = new MongoClient(uri);

// Connect to the MongoDB database
const connectDb = async () => {
  await client.connect();
  return client.db("homeAutomation");
};

// POST method to update temperature and humidity data (Insert new record every time)
export async function POST(req) {
  const db = await connectDb();
  const collection = db.collection("sensorData");
  const { temperature, humidity } = await req.json(); // Parse the body for the temperature and humidity data

  if (temperature === undefined || humidity === undefined) {
    // Return a JSON response with status 400 if no temperature or humidity is provided
    return new Response(JSON.stringify({ message: 'Temperature and humidity are required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Insert a new temperature and humidity record every time
    await collection.insertOne({
      temperature,
      humidity,
      updatedAt: new Date()
    });

    // Return a success message with status 200
    return new Response(JSON.stringify({ message: 'Temperature and humidity data inserted successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error inserting temperature and humidity data:', error);
    // Return an internal server error if something goes wrong
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// GET method to retrieve the most recent temperature and humidity data
export async function GET() {
  const db = await connectDb();
  const collection = db.collection("sensorData");

  try {
    // Get the most recent data (latest record)
    const sensorData = await collection.findOne({}, { sort: { updatedAt: -1 } });

    if (sensorData) {
      return new Response(JSON.stringify({ temperature: sensorData.temperature, humidity: sensorData.humidity }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      return new Response(JSON.stringify({ message: 'No temperature and humidity data found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('Error fetching temperature and humidity:', error);
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
