"use client";
import { useState, useEffect, useRef } from "react";
import { FaFan, FaLightbulb, FaPowerOff, FaRegSnowflake, FaTemperatureHigh } from "react-icons/fa";

const IotAutomate = () => {
  const [currentIp, setCurrentIp] = useState(null);
  const [temperature, setTemperature] = useState(0.000);
  const [humidity, setHumidity] = useState(0.0);
  const [acMode, setAcMode] = useState("automatic");
  const [led1Status, setLed1Status] = useState("OFF");
  const [led2Status, setLed2Status] = useState("OFF");
  const [led3Status, setLed3Status] = useState("OFF");
  const [lightStatus, setLightStatus] = useState("OFF");
  const [acManualMode, setAcManualMode] = useState("med");

  
  const ongoingRequest = useRef(null);


  useEffect(() => {
    const fetchIp = async () => {
      try {
        const response = await fetch('/api/add');
        const data = await response.json();
        if (data.ip) {
          setCurrentIp(data.ip);
          console.log('Current IP:', data.ip);
        } else {
          console.error('No IP found in the database');
        }
      } catch (error) {
        console.error('Error fetching IP:', error);
      }
    };

    fetchIp();
  }, []);

 
  useEffect(() => {
    if (!currentIp) return;

    const fetchData = async () => {
      try {
        const statusRes = await fetch(`http://${currentIp}/status`);
        const statusData = await statusRes.json();

    
        setAcMode(statusData.ac_mode);
        setLed1Status(statusData.led1_status);
        setLed2Status(statusData.led2_status);
        setLed3Status(statusData.led3_status);
        setLightStatus(statusData.light_status);

        
        const tempRes = await fetch(`http://${currentIp}/temperature`);
        const tempData = await tempRes.text();
        setTemperature(parseFloat(tempData)); 

        
        const humidityRes = await fetch(`http://${currentIp}/humidity`);
        const humidityData = await humidityRes.text(); 
        setHumidity(parseFloat(humidityData));
        
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 5000);
    return () => clearInterval(intervalId);
  }, [currentIp]);


  const handleAcModeChange = (newMode) => {
    setAcManualMode(newMode);
    setAcMode(newMode);
    console.log('New AC mode:', newMode);

    let controlUrl = `http://${currentIp}/control?mode=`;

    if (newMode === 'automatic') {
      controlUrl += 'automatic';
    } else {
      
      let ledParams = '';

      switch (newMode) {
        case 'off':
          ledParams = 'led1=0&led2=0&led3=0';
          break;
        case 'low':
          ledParams = 'led1=1&led2=0&led3=0';
          break;
        case 'med':
          ledParams = 'led1=1&led2=1&led3=0';
          break;
        case 'high':
          ledParams = 'led1=1&led2=1&led3=1';
          break;
        default:
          ledParams = 'led1=1&led2=1&led3=0'; 
      }

      controlUrl += `manual&${ledParams}`;
    }

    if (ongoingRequest.current) {
      ongoingRequest.current.abort();
    }

    
    const controller = new AbortController();
    ongoingRequest.current = controller;

    
    fetch(controlUrl, { signal: controller.signal })
      .then(response => response.json())
      .then(data => {
        console.log('Control response');
      })
      .catch(error => {
        if (error.name !== 'AbortError') {
          console.log('Error sending control request');
        }
      });
  };

  
  const handleLightToggle = () => {
    
    const controller = new AbortController();
    ongoingRequest.current = controller;

    fetch(`http://${currentIp}/control?light=${lightStatus === "ON" ? 0 : 1}`, { signal: controller.signal });
    setLightStatus(lightStatus === "ON" ? "OFF" : "ON");
  };

  return (
    <div className="p-6 bg-gray-800 text-white rounded-lg shadow-lg ">
      <h1 className="text-xl md:text-3xl font-bold text-center mb-6">IotAutomate - Home Automation and Control Server</h1>
      <div className="bg-gray-700 p-6 rounded-xl shadow-lg items-center justify-center mb-10">
  <h2 className="text-xl md:text-4xl font-bold text-yellow-200 flex items-center justify-center mb-8">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m0 0l3-3m-3 3V5m0 7H9m3 0V5m-3 7h6M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    Environment
  </h2>
  <div className="grid col-span-1 text-white mb-2 text-lg md:text-3xl md:mx-20 items-center justify-center">
    <div className="flex items-center font-bold justify-center">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v10m0 0l3-3m-3 3l-3-3m6 0v10m-6 0V10m0-1.5a1.5 1.5 0 103 0V12m-3-3.5a1.5 1.5 0 113-0V12a9 9 0 11-6-8.485A9 9 0 013 12v10h3m0-3a2.5 2.5 0 105 0v3h6a2.5 2.5 0 105 0v-3h3V12a9 9 0 01-18 0v10m3-7a2.5 2.5 0 104-2 2.5 2.5 0 00-4 0z" />
      </svg>
      Temperature: {temperature} °C
    </div>
    <div className="flex items-center font-bold justify-center">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9.986 9.986 0 0112 15a9.986 9.986 0 01-9-2.21M12 21a9 9 0 110-18 9 9 0 010 18zm-9-9h4a9.98 9.98 0 0111.06 0H21m0 0H3m0 0h18" />
      </svg>
      Humidity: {humidity} %
    </div>
  </div>
  <div className="bg-gray-700 p-4 rounded-lg mt-4 mx-auto justify-center">
    <p className="text-gray-500 text-sm">Updated in real-time</p>
  </div>
</div>

       
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        

        {/* AC Control */}
        <div className="bg-gray-700 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2 text-yellow-200">AC Control</h2>
          <h4 className="text-lg font-semibold mb-2">Mode : {acMode}</h4>
          
          <div className="flex justify-around mb-4">
            <button 
              onClick={() => handleAcModeChange('automatic')}
              className={`w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white ${acMode === 'automatic' ? 'opacity-100' : 'opacity-20'}`}
            >
              <FaRegSnowflake size={24} />
            </button>
            <button 
              onClick={() => handleAcModeChange('manual')}
              className={`w-16 h-16 rounded-full bg-yellow-600 flex items-center justify-center text-white ${acMode === 'manual' ? 'opacity-100' : 'opacity-20'}`}
            >
              <FaFan size={24} />
            </button>
          </div>

          {/* Manual Control (LED) */}
          {acMode === "manual" && (
            <><h4 className="mb-2">Manual Mode : {acManualMode}</h4>
            <div className="flex justify-around">
              
              <button onClick={() => handleAcModeChange('off')} className={`w-16 h-16 bg-red-600 flex rounded-full items-center justify-center ${acManualMode === 'off' ? 'opacity-100' : 'opacity-20'}`}>
                <FaPowerOff size={24} />
              </button>
              <button onClick={() => handleAcModeChange('low')} className={`w-16 h-16 bg-yellow-600 flex rounded-full items-center justify-center ${acManualMode === 'low' ? 'opacity-100' : 'opacity-20'}`}>
                <FaFan size={24} />
              </button>
              <button onClick={() => handleAcModeChange('med')} className={`w-16 h-16 bg-blue-600 flex rounded-full items-center justify-center ${acManualMode === 'med' ? 'opacity-100' : 'opacity-20'}`}>
                <FaRegSnowflake size={24} />
              </button>
              <button onClick={() => handleAcModeChange('high')} className={`w-16 h-16 bg-green-600 flex rounded-full items-center justify-center ${acManualMode === 'high' ? 'opacity-100' : 'opacity-20'}`}>
                <FaTemperatureHigh size={24} />
              </button>
            </div>
            </>
          )}
        </div>

        {/* Light Control */}
        <div className="bg-gray-700 p-4 rounded-lg ">
          <h2 className="text-xl font-semibold mb-2 text-yellow-200">Light Control</h2>
          <h4 className="mb-8 mt-8">Status : {lightStatus}</h4>
          <button 
            onClick={handleLightToggle}
            className={`w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center text-white ${lightStatus === "ON" ? 'opacity-100' : 'opacity-30'}`}
          >
            <FaLightbulb size={24} />
          </button>
        </div>
        {/* Teams Details */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg mb-6">
  <h4 className="text-2xl font-bold mb-4 text-white flex items-center">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9.75V6a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 6v3.75M3 9.75V15a2.25 2.25 0 002.25 2.25H18.75A2.25 2.25 0 0021 15V9.75m-18 0a2.25 2.25 0 002.25-2.25H6A2.25 2.25 0 018.25 9.75M6 12.75h12m-12 3h12M6 6.75h12m-12-3h12" />
    </svg>
    Group Members
  </h4>
  <div className="text-gray-200 text-sm grid gap-2">
    <div className="flex items-center">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-400" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 8a6 6 0 11-12 0 6 6 0 0112 0zM9 14a8 8 0 100 4h2v-4H9zM5.354 12.854A1 1 0 016 13.707v5.586a1 1 0 01-.293.707A1 1 0 013 19H2a1 1 0 110-2h1a3.1 3.1 0 00.235-.023 8.034 8.034 0 01-.176-.714 2.001 2.001 0 00-1.75-1.836 8.034 8.034 0 01-.423-.965zM15 14v4a1 1 0 001 1h1a1 1 0 011-1v-5.586a1 1 0 01.293-.707A1 1 0 0116 13.707a3.1 3.1 0 00-.707-1.293 1 1 0 00-1.586.586 3.01 3.01 0 00-.707-.586 1 1 0 00-1.586.586 3.1 3.1 0 00-.707 1.293z" clipRule="evenodd" />
      </svg>
      Ashish Kumar - 2247002
    </div>
    <div className="flex items-center">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 8a6 6 0 11-12 0 6 6 0 0112 0zM9 14a8 8 0 100 4h2v-4H9zM5.354 12.854A1 1 0 016 13.707v5.586a1 1 0 01-.293.707A1 1 0 013 19H2a1 1 0 110-2h1a3.1 3.1 0 00.235-.023 8.034 8.034 0 01-.176-.714 2.001 2.001 0 00-1.75-1.836 8.034 8.034 0 01-.423-.965zM15 14v4a1 1 0 001 1h1a1 1 0 011-1v-5.586a1 1 0 01.293-.707A1 1 0 0116 13.707a3.1 3.1 0 00-.707-1.293 1 1 0 00-1.586.586 3.01 3.01 0 00-.707-.586 1 1 0 00-1.586.586 3.1 3.1 0 00-.707 1.293z" clipRule="evenodd" />
      </svg>
      Diya Agrawal - 2206265
    </div>
    <div className="flex items-center">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-400" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 8a6 6 0 11-12 0 6 6 0 0112 0zM9 14a8 8 0 100 4h2v-4H9zM5.354 12.854A1 1 0 016 13.707v5.586a1 1 0 01-.293.707A1 1 0 013 19H2a1 1 0 110-2h1a3.1 3.1 0 00.235-.023 8.034 8.034 0 01-.176-.714 2.001 2.001 0 00-1.75-1.836 8.034 8.034 0 01-.423-.965zM15 14v4a1 1 0 001 1h1a1 1 0 011-1v-5.586a1 1 0 01.293-.707A1 1 0 0116 13.707a3.1 3.1 0 00-.707-1.293 1 1 0 00-1.586.586 3.01 3.01 0 00-.707-.586 1 1 0 00-1.586.586 3.1 3.1 0 00-.707 1.293z" clipRule="evenodd" />
      </svg>
      Mitali Dixit - 2246007
    </div>
    <div className="flex items-center">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 8a6 6 0 11-12 0 6 6 0 0112 0zM9 14a8 8 0 100 4h2v-4H9zM5.354 12.854A1 1 0 016 13.707v5.586a1 1 0 01-.293.707A1 1 0 013 19H2a1 1 0 110-2h1a3.1 3.1 0 00.235-.023 8.034 8.034 0 01-.176-.714 2.001 2.001 0 00-1.75-1.836 8.034 8.034 0 01-.423-.965zM15 14v4a1 1 0 001 1h1a1 1 0 011-1v-5.586a1 1 0 01.293-.707A1 1 0 0116 13.707a3.1 3.1 0 00-.707-1.293 1 1 0 00-1.586.586 3.01 3.01 0 00-.707-.586 1 1 0 00-1.586.586 3.1 3.1 0 00-.707 1.293z" clipRule="evenodd" />
      </svg>
      Rohit Raj - 2246013
    </div>
    <div className="flex items-center">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-400" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 8a6 6 0 11-12 0 6 6 0 0112 0zM9 14a8 8 0 100 4h2v-4H9zM5.354 12.854A1 1 0 016 13.707v5.586a1 1 0 01-.293.707A1 1 0 013 19H2a1 1 0 110-2h1a3.1 3.1 0 00.235-.023 8.034 8.034 0 01-.176-.714 2.001 2.001 0 00-1.75-1.836 8.034 8.034 0 01-.423-.965zM15 14v4a1 1 0 001 1h1a1 1 0 011-1v-5.586a1 1 0 01.293-.707A1 1 0 0116 13.707a3.1 3.1 0 00-.707-1.293 1 1 0 00-1.586.586 3.01 3.01 0 00-.707-.586 1 1 0 00-1.586.586 3.1 3.1 0 00-.707 1.293z" clipRule="evenodd" />
      </svg>
      Abdul Subhan - 2206270
    </div>
    </div>
      </div>
      </div>
    </div>
  );
};

export default IotAutomate;
