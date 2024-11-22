"use client"
import { useEffect, useState } from 'react';

export default function Home() {
  const [currentIp, setCurrentIp] = useState(null);

  useEffect(() => {
    // Fetch the current IP from your Next.js API
    const fetchIp = async () => {
      const response = await fetch('/api/update-ip');
      const data = await response.json();
      setCurrentIp(data.ip);
    };

    fetchIp();
  }, []);

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
