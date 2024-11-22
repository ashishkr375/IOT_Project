"use client";
import { useEffect, useState } from 'react';

export default function Home() {
  const [currentIp, setCurrentIp] = useState(null);

  useEffect(() => {
    // Fetch the current IP from the Next.js API (GET request)
    const fetchIp = async () => {
      try {
        const response = await fetch('/api/add'); // Adjust the endpoint if necessary
        const data = await response.json();
        if (data.ip) {
          setCurrentIp(data.ip);
        } else {
          console.error('No IP found in the database');
        }
      } catch (error) {
        console.error('Error fetching IP:', error);
      }
    };

    fetchIp();
  }, []); // Fetch on component mount

  return (
    <div>
      <h1>ESP8266 Dashboard</h1>
      {currentIp ? (
        <p>Current IP: {currentIp}</p>
      ) : (
        <p>Waiting for IP...</p>
      )}
    </div>
  );
}
