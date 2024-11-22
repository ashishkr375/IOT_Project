import { MongoClient } from 'mongodb';

let currentIp = null;
const uri = "mongodb+srv://admin_LiveLaunchBazaar:Ashish2003@livelaunchbazaar.arod5r7.mongodb.net/?retryWrites=true&w=majority&appName=LiveLaunchBazaar";
const client = new MongoClient(uri);


const connectDb = async () => {
  if (!client.isConnected()) {
    await client.connect();
  }
  return client.db("homeAutomation");  // Use your DB name
};

export default async function handler(req, res) {
  const db = await connectDb();  // Ensure DB connection
  const collection = db.collection("sensorData");  // Use your collection name here

  if (req.method === 'POST') {
    const { ip } = req.body;

    if (!ip) {
      return res.status(400).json({ message: 'IP address is required' });
    }

    try {
      // Check if an IP address already exists in the database
      const existingIp = await collection.findOne({});

      if (existingIp) {
        // If an IP already exists, update it
        await collection.updateOne(
          {}, // Empty query to update the first record
          {
            $set: {
              ip: ip,
              updatedAt: new Date()
            }
          }
        );
      } else {
        // If no IP exists, create a new record
        await collection.insertOne({
          ip,
          updatedAt: new Date(),
        });
      }

      currentIp = ip;  // Update the current IP in memory
      res.status(200).json({ message: 'IP updated successfully' });
    } catch (error) {
      console.error('Error updating IP:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  } else if (req.method === 'GET') {
    try {
      // Fetch the most recent IP from the database
      const ipData = await collection.findOne({}, { sort: { updatedAt: -1 } });

      if (ipData) {
        res.status(200).json({ ip: ipData.ip });
      } else {
        res.status(404).json({ message: 'No IP found' });
      }
    } catch (error) {
      console.error('Error fetching IP:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}

export const getCurrentIp = () => currentIp;
