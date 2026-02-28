import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Portfolio from './pages/Portfolio';
import Contact from './pages/Contact';
import './App.css';

// ── Scroll animation observer hook ──
export function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.fade-up');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  });
}

function App() {
  const [output, setOutput] = useState('');
  const [isLoadingRMAN, setIsLoadingRMAN] = useState(false);
  const [ec2Status, setEc2Status] = useState('unknown');
  const [isLoadingEC2, setIsLoadingEC2] = useState(false);
  const [ec2Log, setEc2Log] = useState([]);
  const [dbStatus, setDbStatus] = useState('stopped');
  const [isLoadingDb, setIsLoadingDb] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(prev => !prev);
  const closeMenu = () => setIsMenuOpen(false);

  const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString([], {
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
    setEc2Log(prev => [...prev, `${timestamp} — ${message}`]);
  };

  // EC2 status polling
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch(`${BASE_URL}/ec2-status`);
        const data = await res.json();
        const newStatus = data.status || 'error';

        if (newStatus !== ec2Status) {
          const messages = {
            pending: 'Instance is starting up…',
            running: 'Instance is now running',
            stopping: 'Instance is shutting down…',
            stopped: 'Instance is now stopped',
            error: 'Error fetching EC2 status',
          };
          addLog(messages[newStatus] || `Status changed to: ${newStatus}`);
          setEc2Status(newStatus);

          if (newStatus === 'running') {
            try {
              const dbRes = await fetch(`${BASE_URL}/console/db_status`);
              const dbData = await dbRes.json();
              if (dbData.output && dbData.output.trim() !== '') {
                setDbStatus('running');
                addLog('Oracle Database detected as running');
              } else {
                setDbStatus('stopped');
              }
            } catch {
              setDbStatus('unknown');
            }
          }
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

  useEffect(() => {
    if (ec2Status === 'stopped' || ec2Status === 'stopping') {
      setDbStatus('stopped');
    }
  }, [ec2Status]);

  const handleRMAN = async () => {
    setIsLoadingRMAN(true);
    setOutput('Starting simulated RMAN backup…');
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
    addLog('Sent start command to AWS…');
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
    addLog('Sent stop command to AWS…');
    try {
      await fetch(`${BASE_URL}/stop-ec2`, { method: 'POST' });
    } catch (err) {
      addLog(`Stop failed: ${err.message}`);
    } finally {
      setIsLoadingEC2(false);
    }
  };

  const handleClearLog = () => setEc2Log([]);

  return (
    <Router>
      {/* ── Navigation ── */}
      <nav>
        <div className="logo">
          Edgar<span>.</span>
        </div>

        <div className="desktop-links">
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/portfolio">Portfolio</Link>
          <Link to="/contact">Contact</Link>
        </div>

        <button className="hamburger" onClick={toggleMenu} aria-label="Toggle menu">
          <div className={`hamburger-lines ${isMenuOpen ? 'open' : ''}`}>
            <span /><span /><span />
          </div>
        </button>
      </nav>

      <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
        <Link to="/" onClick={closeMenu}>Home</Link>
        <Link to="/about" onClick={closeMenu}>About</Link>
        <Link to="/portfolio" onClick={closeMenu}>Portfolio</Link>
        <Link to="/contact" onClick={closeMenu}>Contact</Link>
      </div>

      {/* ── Routes ── */}
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
              dbStatus={dbStatus}
              setDbStatus={setDbStatus}
              isLoadingDb={isLoadingDb}
              setIsLoadingDb={setIsLoadingDb}
              addLog={addLog}
            />
          }
        />
        <Route path="/contact" element={<Contact />} />
      </Routes>

      <footer>
        © {new Date().getFullYear()} Edgar Pecson —{' '}
        <a href="https://github.com/edgarpecson" target="_blank" rel="noreferrer">GitHub</a>
        {' · '}Built with React + FastAPI + AWS
      </footer>
    </Router>
  );
}

export default App;
