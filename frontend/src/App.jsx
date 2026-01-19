import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Portfolio from './pages/Portfolio';
import Contact from './pages/Contact';
import './App.css';

function App() {
  const [output, setOutput] = useState('');
  const [isLoadingRMAN, setIsLoadingRMAN] = useState(false);
  const [ec2Status, setEc2Status] = useState('unknown');
  const [isLoadingEC2, setIsLoadingEC2] = useState(false);
  const [ec2Log, setEc2Log] = useState([]);

  const BASE_URL = 'http://localhost:8000';

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setEc2Log(prev => [...prev, `${timestamp} - ${message}`]);
  };

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch(`${BASE_URL}/ec2-status`);
        const data = await res.json();
        const newStatus = data.status || 'error';

        if (newStatus !== ec2Status) {
          let logMessage = '';

          switch (newStatus) {
            case 'pending':
              logMessage = 'Instance is starting up...';
              break;
            case 'running':
              logMessage = 'Instance is now running';
              break;
            case 'stopping':
              logMessage = 'Instance is shutting down...';
              break;
            case 'stopped':
              logMessage = 'Instance is now stopped';
              break;
            case 'error':
              logMessage = 'Error fetching real EC2 status';
              break;
            default:
              logMessage = `Status changed to: ${newStatus}`;
          }

          addLog(logMessage);
          setEc2Status(newStatus);
        }
      } catch (err) {
        if (ec2Status !== 'error') {
          addLog(`Connection error: ${err.message}`);
          setEc2Status('error');
        }
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 8000);
    return () => clearInterval(interval);
  }, [ec2Status, BASE_URL]);

  const handleRMAN = async () => {
    setIsLoadingRMAN(true);
    setOutput('Starting simulated RMAN backup...');
    try {
      const res = await fetch(`${BASE_URL}/api/rman-backup`);
      const json = await res.json();
      setOutput(json.message || 'Backup simulation completed.');
    } catch (err) {
      setOutput(`Error: ${err.message}`);
    } finally {
      setIsLoadingRMAN(false);
    }
  };

  const handleStartEC2 = async () => {
    setIsLoadingEC2(true);
    addLog('Sent start command...');
    try {
      await fetch(`${BASE_URL}/start-ec2`, { method: 'POST' });
    } catch (err) {
      addLog(`Start failed: ${err.message}`);
    } finally {
      setIsLoadingEC2(false);
    }
  };

  const handleStopEC2 = async () => {
    setIsLoadingEC2(true);
    addLog('Sent stop command...');
    try {
      await fetch(`${BASE_URL}/stop-ec2`, { method: 'POST' });
    } catch (err) {
      addLog(`Stop failed: ${err.message}`);
    } finally {
      setIsLoadingEC2(false);
    }
  };

  const handleClearLog = () => {
    setEc2Log([]);
  };

  return (
    <Router>
      <nav>
        <div className="logo">Edgar Pecson</div>
        <div className="links">
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/portfolio">Portfolio</Link>
          <Link to="/contact">Contact</Link>
        </div>
      </nav>

      <Routes>
        <Route
          path="/"
          element={
            <Home
              handleRMAN={handleRMAN}
              isLoadingRMAN={isLoadingRMAN}
              output={output}
            />
          }
        />
        <Route path="/about" element={<About />} />
        <Route
          path="/portfolio"
          element={
            <Portfolio
              ec2Status={ec2Status}
              isLoadingEC2={isLoadingEC2}
              handleStartEC2={handleStartEC2}
              handleStopEC2={handleStopEC2}
              ec2Log={ec2Log}
              handleClearLog={handleClearLog}
            />
          }
        />
        <Route path="/contact" element={<Contact />} />
      </Routes>

      <footer>
        © {new Date().getFullYear()} Edgar Pecson. Powered by React + FastAPI.
      </footer>
    </Router>
  );
}

export default App;