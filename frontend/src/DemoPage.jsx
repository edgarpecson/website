import React, { useState, useEffect, useRef } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function DemoPage({ onNavigateToHome }) {
  const [ec2Status, setEc2Status] = useState('checking');
  const [oracleStatus, setOracleStatus] = useState('checking');
  const [prevEc2Status, setPrevEc2Status] = useState('checking');
  const [prevOracleStatus, setPrevOracleStatus] = useState('checking');
  const [consoleOutput, setConsoleOutput] = useState('');
  const [activityLog, setActivityLog] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showWarmupNotice, setShowWarmupNotice] = useState(true);
  const logEndRef = useRef(null);
  const lastLogMessageRef = useRef('');

  // Auto-scroll activity log only when new entries appear
  useEffect(() => {
    if (activityLog.length > 0) {
      logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activityLog.length]);

  // Poll EC2 status
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch(`${API_BASE}/ec2-status`);
        const data = await res.json();
        const newStatus = data.status || 'unknown';
        
        // Update last log message if status changed
        if (prevEc2Status !== newStatus && prevEc2Status !== 'checking') {
          if (newStatus === 'running' && lastLogMessageRef.current.includes('Starting EC2')) {
            updateLastLog('Instance is now running');
          } else if (newStatus === 'stopped' && lastLogMessageRef.current.includes('Stopping EC2')) {
            updateLastLog('Instance is now stopped');
          }
        }
        
        setPrevEc2Status(newStatus);
        setEc2Status(newStatus);
        
        if (data.status) {
          setShowWarmupNotice(false);
        }
      } catch (err) {
        console.error('Status check failed:', err);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 8000);
    return () => clearInterval(interval);
  }, [prevEc2Status]);

  // Poll Oracle status
  useEffect(() => {
    const fetchOracleStatus = async () => {
      try {
        const res = await fetch(`${API_BASE}/oracle-status`);
        const data = await res.json();
        const newStatus = data.status || 'unknown';
        
        // Update last log message if status changed
        if (prevOracleStatus !== newStatus && prevOracleStatus !== 'checking') {
          if (newStatus === 'OPEN' && lastLogMessageRef.current.includes('Starting Oracle')) {
            updateLastLog('Database is now running');
          } else if (newStatus === 'SHUTDOWN' && lastLogMessageRef.current.includes('Stopping Oracle')) {
            updateLastLog('Database is now stopped');
          }
        }
        
        setPrevOracleStatus(newStatus);
        setOracleStatus(newStatus);
      } catch (err) {
        console.error('Oracle status check failed:', err);
      }
    };

    fetchOracleStatus();
    const interval = setInterval(fetchOracleStatus, 10000);
    return () => clearInterval(interval);
  }, [prevOracleStatus]);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    lastLogMessageRef.current = message;
    setActivityLog(prev => [...prev, { timestamp, message, type, id: Date.now() }].slice(-100));
  };

  const updateLastLog = (newMessage) => {
    lastLogMessageRef.current = newMessage;
    setActivityLog(prev => {
      const newLog = [...prev];
      if (newLog.length > 0) {
        newLog[newLog.length - 1] = {
          ...newLog[newLog.length - 1],
          message: newMessage
        };
      }
      return newLog;
    });
  };

  const clearLog = () => {
    setActivityLog([]);
    lastLogMessageRef.current = '';
  };

  const startEC2 = async () => {
    setIsLoading(true);
    addLog('Starting EC2 instance...', 'info');
    try {
      await fetch(`${API_BASE}/start-ec2`, { method: 'POST' });
    } catch (err) {
      addLog('Failed to start EC2 instance', 'error');
    }
    setIsLoading(false);
  };

  const stopEC2 = async () => {
    setIsLoading(true);
    addLog('Stopping EC2 instance...', 'warning');
    try {
      await fetch(`${API_BASE}/stop-ec2`, { method: 'POST' });
    } catch (err) {
      addLog('Failed to stop EC2 instance', 'error');
    }
    setIsLoading(false);
  };

  const startOracle = async () => {
    setIsLoading(true);
    addLog('Starting Oracle Database...', 'info');
    try {
      const res = await fetch(`${API_BASE}/start-oracle`, { method: 'POST' });
      const data = await res.json();
      if (data.output) {
        setConsoleOutput(data.output);
      }
    } catch (err) {
      addLog('Failed to start Oracle Database', 'error');
    }
    setIsLoading(false);
  };

  const stopOracle = async () => {
    setIsLoading(true);
    addLog('Stopping Oracle Database...', 'warning');
    try {
      const res = await fetch(`${API_BASE}/stop-oracle`, { method: 'POST' });
      const data = await res.json();
      if (data.output) {
        setConsoleOutput(data.output);
      }
    } catch (err) {
      addLog('Failed to stop Oracle Database', 'error');
    }
    setIsLoading(false);
  };

  const runConsoleCommand = async (cmd, label) => {
    setIsLoading(true);
    addLog(`Running: ${label || cmd}`, 'info');
    try {
      const res = await fetch(`${API_BASE}/console/${cmd}`);
      const data = await res.json();
      setConsoleOutput(data.output || data.message || 'No output');
      addLog(`Command completed: ${label || cmd}`, 'success');
    } catch (err) {
      setConsoleOutput('Command failed');
      addLog(`Command failed: ${label || cmd}`, 'error');
    }
    setIsLoading(false);
  };

  const runRMANDemo = async () => {
    setIsLoading(true);
    addLog('Running RMAN backup simulation...', 'info');
    try {
      const res = await fetch(`${API_BASE}/rman-demo`);
      const data = await res.json();
      setConsoleOutput(data.output || '');
      addLog('RMAN backup completed successfully', 'success');
    } catch (err) {
      addLog('RMAN demo failed', 'error');
    }
    setIsLoading(false);
  };

  // Button state logic
  const isEc2Stopped = ec2Status === 'stopped';
  const isEc2Running = ec2Status === 'running';
  const isEc2Transitioning = ['pending', 'starting', 'stopping'].includes(ec2Status);
  const isDbOpen = oracleStatus === 'OPEN';
  const isDbShutdown = oracleStatus === 'SHUTDOWN';
  const isDbTransitioning = ['pending', 'starting', 'stopping'].includes(oracleStatus);
  
  // Button enabled states
  const canStartEc2 = isEc2Stopped && !isLoading;
  const canStopEc2 = isEc2Running && isDbShutdown && !isLoading;
  const canStartDb = isEc2Running && isDbShutdown && !isLoading && !isDbTransitioning;
  const canStopDb = isEc2Running && isDbOpen && !isLoading && !isDbTransitioning;
  const canRunSystemCommands = isEc2Running && !isLoading;
  const canRunOracleCommands = isEc2Running && isDbOpen && !isLoading;

  // Warning message
  const showWarning = isEc2Running && isDbOpen;

  // Database pill status
  const getDbPillStatus = () => {
    if (isDbTransitioning) return 'pending';
    return oracleStatus;
  };

  const getDbPillText = () => {
    if (oracleStatus === 'stopping') return 'Pending Shutdown';
    if (oracleStatus === 'starting') return 'Starting';
    if (oracleStatus === 'pending') return 'Pending';
    return `Database: ${oracleStatus}`;
  };

  return (
    <div className="demo-page-app">
      {/* App Header */}
      <div className="app-header">
        <button onClick={onNavigateToHome} className="back-button">
          ← Portfolio
        </button>
        <div className="app-title">INFRASTRUCTURE COMMAND CENTER</div>
        <div className="app-status-pills">
          <span className={`pill-badge pill-${ec2Status}`}>EC2</span>
          <span className={`pill-badge pill-${oracleStatus}`}>ORACLE</span>
        </div>
      </div>

      <div className="app-container">
        {/* Warmup Notice */}
        {showWarmupNotice && (
          <div className="warmup-banner">
            <span className="warmup-icon">⏱️</span>
            <span className="warmup-text">
              Backend hosted on Render's free tier. May take 30-60 seconds to wake up on first load.
            </span>
            <button className="warmup-close" onClick={() => setShowWarmupNotice(false)}>×</button>
          </div>
        )}

        {/* Main Description */}
        <p className="main-description-large">
          Live control panel for a real AWS EC2 instance running Oracle 19c. This is the same workflow 
          used in enterprise database operations — start/stop automation via boto3, with real-time 
          status polling every 8 seconds.
        </p>

        {/* EC2 Instance Console Section */}
        <div className="console-section">
          <h2 className="section-heading">EC2 Instance Console</h2>
          <p className="section-description">
            Your virtual server running in AWS. Start it up to access your Oracle database, 
            or shut it down to save costs when not in use.
          </p>
          
          <div className={`status-pill-large status-${ec2Status}`}>
            <span className="status-dot"></span>
            EC2: {ec2Status}
          </div>

          <div className="action-buttons-compact">
            <button 
              onClick={startEC2}
              className="action-btn action-btn-start"
              disabled={!canStartEc2}
            >
              ▶ Start EC2
            </button>
            <button 
              onClick={stopEC2}
              className="action-btn action-btn-stop"
              disabled={!canStopEc2}
            >
              ■ Stop EC2
            </button>
          </div>

          {showWarning && (
            <div className="warning-message">
              ⚠️ Oracle 19c is running - stop the database before stopping EC2
            </div>
          )}
        </div>

        {/* Oracle 19c Instance Console Section */}
        <div className="oracle-section">
          <h2 className="section-heading">Oracle 19c Instance Console</h2>
          <p className="section-description">
            Your production Oracle database. Always stop the database gracefully before 
            stopping the EC2 instance to prevent data corruption.
          </p>
          
          <div className={`status-pill-large status-${getDbPillStatus()}`}>
            <span className="status-dot"></span>
            {getDbPillText()}
          </div>

          <div className="action-buttons-compact">
            <button 
              onClick={startOracle}
              className="action-btn action-btn-start"
              disabled={!canStartDb}
            >
              ▶ Start Oracle DB
            </button>
            <button 
              onClick={stopOracle}
              className="action-btn action-btn-stop"
              disabled={!canStopDb}
            >
              ■ Shutdown Oracle DB
            </button>
          </div>
        </div>

        {/* Extra spacing before Activity Log */}
        <div className="section-spacer"></div>

        {/* Activity Log moved here from EC2 section */}
        <div className="activity-section-standalone">
          <div className="activity-header">
            <span className="activity-title">ACTIVITY LOG</span>
            <button className="clear-btn" onClick={clearLog}>Clear</button>
          </div>
          <div className="activity-body">
            {activityLog.length === 0 ? (
              <div className="activity-empty">Waiting for activity...</div>
            ) : (
              <>
                {activityLog.map((log) => (
                  <div key={log.id} className={`activity-line activity-${log.type}`}>
                    <span className="activity-timestamp">{log.timestamp}</span>
                    <span className="activity-message"> → {log.message}</span>
                  </div>
                ))}
                <div ref={logEndRef} />
              </>
            )}
          </div>
        </div>

        {/* Commands Section */}
        <div className="commands-section">
          <h2 className="section-heading">Commands</h2>
          <p className="section-description">
            Quick diagnostic tools and database utilities. Click any command to see 
            real-time output in the terminal below.
          </p>
          
          <div className="command-buttons">
            <button 
              onClick={() => runConsoleCommand('df', 'df -h (Disk)')} 
              className="cmd-button" 
              disabled={!canRunSystemCommands}
            >
              df -h (Disk)
            </button>
            <button 
              onClick={() => runConsoleCommand('uptime', 'uptime')} 
              className="cmd-button" 
              disabled={!canRunSystemCommands}
            >
              uptime
            </button>
            <button 
              onClick={() => runConsoleCommand('free', 'free -h (Memory)')} 
              className="cmd-button" 
              disabled={!canRunSystemCommands}
            >
              free -h (Memory)
            </button>
            <button 
              onClick={() => runConsoleCommand('top', 'top (Brief)')} 
              className="cmd-button" 
              disabled={!canRunSystemCommands}
            >
              top (Brief)
            </button>
            <button 
              onClick={runRMANDemo} 
              className="cmd-button" 
              disabled={!canRunOracleCommands}
            >
              RMAN Backup
            </button>
            <button 
              onClick={() => runConsoleCommand('listener_status', 'Listener Status')} 
              className="cmd-button" 
              disabled={!canRunOracleCommands}
            >
              Listener Status
            </button>
            <button 
              onClick={() => runConsoleCommand('view_startup_log', 'View Startup Log')} 
              className="cmd-button" 
              disabled={!canRunOracleCommands}
            >
              View Startup Log
            </button>
            <button 
              onClick={() => runConsoleCommand('view_shutdown_log', 'View Shutdown Log')} 
              className="cmd-button" 
              disabled={!canRunOracleCommands}
            >
              View Shutdown Log
            </button>
          </div>
        </div>

        {/* Terminal Output */}
        <div className="output-section">
          <div className="output-header">
            <span className="output-title">$ Terminal</span>
          </div>
          <div className="output-body">
            {consoleOutput ? (
              <pre className="output-text">{consoleOutput}</pre>
            ) : (
              <div className="output-placeholder">
                {isEc2Stopped ? 'Instance is stopped - console commands unavailable' : 'Waiting for command...'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DemoPage;
