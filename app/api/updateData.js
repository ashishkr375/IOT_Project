import { MongoClient } from "mongodb";

const uri = "mongodb+srv://admin_LiveLaunchBazaar:Ashish2003@livelaunchbazaar.arod5r7.mongodb.net/?retryWrites=true&w=majority&appName=LiveLaunchBazaar";
const client = new MongoClient(uri);

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { temperature, humidity, acState, lightState } = req.body;

    await client.connect();
    const db = client.db("homeAutomation");
    const collection = db.collection("sensorData");

    await collection.insertOne({ temperature, humidity, acState, lightState, timestamp: new Date() });

    let acCommand = "OFF";
    if (temperature > 40) acCommand = "HIGH";
    else if (temperature > 30) acCommand = "MEDIUM";
    else if (temperature > 20) acCommand = "LOW";

    let lightCommand = new Date().getHours() >= 18 || new Date().getHours() < 6 ? "ON" : "OFF";

    res.status(200).json({ acCommand, lightCommand });
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
