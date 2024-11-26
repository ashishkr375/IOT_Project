
import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://admin_LiveLaunchBazaar:Ashish2003@livelaunchbazaar.arod5r7.mongodb.net/?retryWrites=true&w=majority&appName=LiveLaunchBazaar";
const client = new MongoClient(uri);
let currentIp = null;


const connectDb = async () => {
  await client.connect();
  return client.db("homeAutomation");
};

export async function POST(req) {
  const db = await connectDb();
  const collection = db.collection("IPData");
  const { ip } = await req.json();

  if (!ip) {
   
    return new Response(JSON.stringify({ message: 'IP address is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const existingIp = await collection.findOne({});

    if (existingIp) {
      
      await collection.updateOne(
        {},
        {
          $set: {
            ip: ip,
            updatedAt: new Date()
          }
        }
      );
    } else {
      
      await collection.insertOne({
        ip,
        updatedAt: new Date()
      });
    }

    currentIp = ip; 
    return new Response(JSON.stringify({ message: 'IP updated successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error updating IP:', error);
   
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function GET() {
    const db = await connectDb();
    const collection = db.collection("IPData");
  
    try {
      const ipData = await collection.findOne({}, { sort: { updatedAt: -1 } });
      if (ipData) {
        return new Response(JSON.stringify({ ip: ipData.ip }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } else {
        return new Response(JSON.stringify({ message: 'No IP found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    } catch (error) {
      console.error('Error fetching IP:', error);
      return new Response(JSON.stringify({ message: 'Internal Server Error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }