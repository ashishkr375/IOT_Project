"use client"
import { useState, useEffect } from "react";
// import Chart from "chart.js/auto";

export default function Home() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("/api/getData")
      .then((res) => res.json())
      .then((data) => setData(data));
  }, []);

  return (
    <div>
      <h1>Home Automation Dashboard</h1>
      <div>
        <h2>Live Data</h2>
        <p>Temperature: {data.temperature} °C</p>
        <p>Humidity: {data.humidity} %</p>
        <p>AC State: {data.acState}</p>
        <p>Light State: {data.lightState}</p>
      </div>
      <div>
        <h2>Temperature Chart</h2>
        {/* Chart.js graph */}
      </div>
    </div>
  );
}
