"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("/api/updateData")
      .then((res) => res.json())
      .then((data) => setData(data));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-6">Home Automation Dashboard</h1>
        <div className="space-y-6">
          <div className="bg-blue-100 p-4 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Live Data</h2>
            <p className="text-lg text-gray-600">Temperature: <span className="font-bold">{data.temperature} °C</span></p>
            <p className="text-lg text-gray-600">Humidity: <span className="font-bold">{data.humidity} %</span></p>
            <p className="text-lg text-gray-600">AC State: <span className="font-bold">{data.acState}</span></p>
            <p className="text-lg text-gray-600">Light State: <span className="font-bold">{data.lightState}</span></p>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Temperature Chart</h2>
            {/* Chart.js graph */}
            <div className="h-64 bg-gray-300 rounded-lg flex items-center justify-center text-gray-500">
              {/* You can integrate the chart here */}
              <p className="text-lg">Chart will be displayed here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
