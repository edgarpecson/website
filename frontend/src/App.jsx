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

  // NEW: Hamburger menu state
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Toggle mobile menu
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // Close menu when clicking a link
  const closeMenu = () => setIsMenuOpen(false);

  // Use Vite environment variable (set in .env or Render dashboard)
  const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  useEffect(() => {
    console.log('API Base URL:', BASE_URL);
  }, []);

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
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
      <nav className="bg-gray-900 text-white py-4 px-6 shadow-md fixed w-full top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          {/* Logo */}
          <div className="logo text-2xl font-bold">Edgar Pecson</div>

          {/* Desktop Links */}
          <div className="hidden md:flex space-x-8">
            <Link to="/" className="hover:text-blue-400 transition" onClick={closeMenu}>Home</Link>
            <Link to="/about" className="hover:text-blue-400 transition" onClick={closeMenu}>About</Link>
            <Link to="/portfolio" className="hover:text-blue-400 transition" onClick={closeMenu}>Portfolio</Link>
            <Link to="/contact" className="hover:text-blue-400 transition" onClick={closeMenu}>Contact</Link>
          </div>

          {/* Hamburger Button - visible on mobile */}
          <button 
            className="md:hidden focus:outline-none"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <div className="w-8 h-8 flex flex-col justify-center items-center space-y-1.5">
              <span className={`block h-0.5 w-6 bg-white transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
              <span className={`block h-0.5 w-6 bg-white transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
              <span className={`block h-0.5 w-6 bg-white transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
            </div>
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        <div 
          className={`md:hidden transition-all duration-500 ease-in-out overflow-hidden ${
            isMenuOpen ? 'max-h-96 opacity-100 py-4' : 'max-h-0 opacity-0 py-0'
          } bg-gray-800`}
        >
          <div className="flex flex-col space-y-4 text-center">
            <Link to="/" className="hover:text-blue-400 transition py-3" onClick={closeMenu}>Home</Link>
            <Link to="/about" className="hover:text-blue-400 transition py-3" onClick={closeMenu}>About</Link>
            <Link to="/portfolio" className="hover:text-blue-400 transition py-3" onClick={closeMenu}>Portfolio</Link>
            <Link to="/contact" className="hover:text-blue-400 transition py-3" onClick={closeMenu}>Contact</Link>
          </div>
        </div>
      </nav>

      {/* Add top padding so content doesn't hide under fixed nav */}
      <main className="pt-20 md:pt-24">
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
                BASE_URL={BASE_URL}
              />
            }
          />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>

      <footer className="bg-gray-900 text-white py-6 text-center mt-10">
        © {new Date().getFullYear()} Edgar Pecson. Powered by React + FastAPI.
      </footer>
    </Router>
  );
}

export default App;