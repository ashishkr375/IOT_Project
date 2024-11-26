
import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://admin_LiveLaunchBazaar:Ashish2003@livelaunchbazaar.arod5r7.mongodb.net/?retryWrites=true&w=majority&appName=LiveLaunchBazaar";
const client = new MongoClient(uri);


const connectDb = async () => {
  await client.connect();
  return client.db("homeAutomation");
};


export async function POST(req) {
  const db = await connectDb();
  const collection = db.collection("sensorData");
  const { temperature, humidity } = await req.json(); 

  if (temperature === undefined || humidity === undefined) {
    
    return new Response(JSON.stringify({ message: 'Temperature and humidity are required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    await collection.insertOne({
      temperature,
      humidity,
      updatedAt: new Date()
    });

    
    return new Response(JSON.stringify({ message: 'Temperature and humidity data inserted successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error inserting temperature and humidity data:', error);
    
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}


export async function GET() {
  const db = await connectDb();
  const collection = db.collection("sensorData");

  try {
    
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
