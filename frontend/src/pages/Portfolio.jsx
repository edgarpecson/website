// src/pages/Portfolio.jsx
import React, { useRef, useEffect, useState } from 'react';

export default function Portfolio({
  ec2Status,
  isLoadingEC2,
  handleStartEC2,
  handleStopEC2,
  ec2Log,
  handleClearLog,
  BASE_URL,
  dbStatus,
  setDbStatus,
  isLoadingDb,
  setIsLoadingDb
}) {
  const logRef = useRef(null);
  const [consoleData, setConsoleData] = useState({});
  const [activeCmd, setActiveCmd] = useState('df');

  // Auto-scroll log to bottom
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [ec2Log]);

  // Fetch console output on command change
  useEffect(() => {
    const cmd = consoleCommands.find(c => c.key === activeCmd);
    if (cmd?.dbCommand) {
      if (dbStatus !== 'running') {
        setConsoleData(prev => ({
          ...prev,
          [activeCmd]: { output: `Database is ${dbStatus}. Action not available.` }
        }));
      }
      return; // Skip fetch for DB commands
    }

    const fetchConsole = async () => {
      try {
        const res = await fetch(`${BASE_URL}/console/${activeCmd}`);
        const data = await res.json();

        if (data.status === 'down') {
          setConsoleData(prev => ({
            ...prev,
            [activeCmd]: { output: data.message || 'Instance is down or unavailable' }
          }));
        } else {
          setConsoleData(prev => ({ ...prev, [activeCmd]: data }));
        }
      } catch (err) {
        setConsoleData(prev => ({
          ...prev,
          [activeCmd]: { error: 'Failed to load' }
        }));
      }
    };

    fetchConsole();
  }, [activeCmd, BASE_URL, dbStatus]);

  const handleDbAction = async (action) => {
    if (ec2Status !== 'running') {
      alert('EC2 instance must be running to manage the database.');
      return;
    }

    setIsLoadingDb(true);
    const cmdKey = action === 'start' ? 'start_db' : 'shutdown_db';
    setDbStatus(action === 'start' ? 'starting' : 'shutting_down');

    try {
      const res = await fetch(`${BASE_URL}/console/${cmdKey}`);
      const data = await res.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Set console data directly from the response
      setConsoleData(prev => ({ ...prev, [cmdKey]: data }));

      // Simulate delay for DB operation (adjust based on real times)
      await new Promise(resolve => setTimeout(resolve, 5000));

      setDbStatus(action === 'start' ? 'running' : 'stopped');
      setActiveCmd(cmdKey); // Switch to show output
    } catch (err) {
      setDbStatus('unknown');
      alert(`Database ${action} failed: ${err.message}`);
    } finally {
      setIsLoadingDb(false);
    }
  };

  const consoleCommands = [
    { key: 'df', label: 'df -h (Disk Usage)' },
    { key: 'uptime', label: 'uptime' },
    { key: 'free', label: 'free -h (Memory)' },
    { key: 'top', label: 'top (brief)' },
    { key: 'start_db', label: 'Start Oracle Database', dbCommand: true },
    { key: 'shutdown_db', label: 'Shutdown Oracle Database', dbCommand: true },
  ];

  return (
    <div className="page-container">
      <h1 style={{ fontSize: 'clamp(2rem, 7vw, 3rem)', marginBottom: '1rem', textAlign: 'center' }}>
        Portfolio
      </h1>

      <p style={{ 
        marginBottom: 'clamp(1.5rem, 5vw, 2.5rem)', 
        fontSize: 'clamp(1rem, 4vw, 1.1rem)', 
        textAlign: 'center', 
        maxWidth: '800px', 
        marginLeft: 'auto', 
        marginRight: 'auto' 
      }}>
        A selection of technical projects and demonstrations showcasing database automation, AWS cloud infrastructure, and full-stack development.
      </p>

      <ul style={{ 
        marginBottom: 'clamp(2rem, 6vw, 3rem)', 
        lineHeight: 1.8, 
        paddingLeft: '1.5rem', 
        maxWidth: '800px', 
        marginLeft: 'auto', 
        marginRight: 'auto' 
      }}>
        <li><strong>AWS EC2 Automation – Oracle 19c Database Instance Control</strong> (interactive demo below)</li>
        <li>Full-Stack Applications using React + FastAPI</li>
        <li>Python-based Database Backup & Recovery Scripts (RMAN integration)</li>
        <li>Cloud Migration & Infrastructure Automation Workflows</li>
        <li>PL/SQL & Multi-DB (Postgres, MongoDB, Amazon RDS) Solutions</li>
      </ul>

      {/* Oracle 19c Demo Instance Control */}
      <div className="ec2-card">
        <h2 style={{ fontSize: 'clamp(1.6rem, 5vw, 2rem)', marginBottom: '1.5rem', textAlign: 'center' }}>
          Oracle 19c Demo Instance Control
        </h2>

        <p className={`ec2-status status-${ec2Status}`} style={{ fontSize: 'clamp(1.1rem, 4vw, 1.3rem)', marginBottom: '1.5rem', textAlign: 'center' }}>
          Status: {ec2Status.charAt(0).toUpperCase() + ec2Status.slice(1)}
        </p>

        {/* Warning when DB is running */}
        {dbStatus === 'running' && (
          <p style={{
            textAlign: 'center',
            color: '#dc3545',
            fontWeight: 'bold',
            background: '#fff2f2',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            border: '1px solid #ffcdd2'
          }}>
            Oracle Database is currently running.<br />
            <strong>Shut down the database first</strong> before stopping the EC2 instance.
          </p>
        )}

        <div className="ec2-buttons">
          <button
            className="cta-primary"
            onClick={handleStartEC2}
            disabled={
              ec2Status === 'running' ||
              isLoadingEC2 ||
              ec2Status === 'pending' ||
              dbStatus === 'running' ||
              dbStatus === 'starting'
            }
            style={{ width: '100%', maxWidth: '300px', marginBottom: '1rem' }}
          >
            {isLoadingEC2 ? 'Starting...' : 'Start Instance'}
          </button>

          <button
            className="cta-primary"
            style={{ 
              background: '#dc3545', 
              boxShadow: '0 4px 12px rgba(220,53,69,0.3)',
              width: '100%',
              maxWidth: '300px'
            }}
            onClick={handleStopEC2}
            disabled={
              ec2Status === 'stopped' ||
              isLoadingEC2 ||
              ec2Status === 'stopping' ||
              dbStatus === 'running' ||
              dbStatus === 'shutting_down'
            }
          >
            {isLoadingEC2 ? 'Stopping...' : 'Stop Instance'}
          </button>
        </div>

        {/* Instance Activity Log */}
        <div className="ec2-log" ref={logRef}>
          <div className="ec2-log-header">
            <h4 style={{ fontSize: 'clamp(1.1rem, 4vw, 1.25rem)' }}>Instance Activity Log</h4>
            <button
              className="ec2-log-clear"
              onClick={handleClearLog}
              disabled={ec2Log.length === 0}
              style={{ fontSize: '0.9rem' }}
            >
              Clear Log
            </button>
          </div>

          {ec2Log.length === 0 ? (
            <p style={{ color: '#6b7280', fontStyle: 'italic', textAlign: 'center' }}>
              No activity yet...
            </p>
          ) : (
            ec2Log.map((entry, i) => (
              <p
                key={i}
                style={{
                  margin: '6px 0',
                  padding: '4px 8px',
                  fontFamily: "'Courier New', Courier, monospace",
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  textAlign: 'left',
                  color: entry.includes('AWS confirmed') ? '#006699' :
                         entry.includes('failed') || entry.includes('error') ? '#dc3545' :
                         entry.includes('AWS Request ID') ? '#4b5563' :
                         '#0f0f0f',
                  fontSize: 'clamp(0.85rem, 3vw, 0.95rem)'
                }}
              >
                {entry}
              </p>
            ))
          )}
        </div>

        {isLoadingEC2 && (
          <p className="ec2-loading" style={{ textAlign: 'center', marginTop: '1rem' }}>
            Command sent — watching for status change...
          </p>
        )}
      </div>

      {/* EC2 Instance Status Console */}
      <div className="console-card" style={{ marginTop: 'clamp(40px, 8vw, 60px)' }}>
        <h2 style={{ fontSize: 'clamp(1.6rem, 5vw, 2rem)', marginBottom: '1rem', textAlign: 'center' }}>
          EC2 Instance Status Console
        </h2>

        <p style={{ marginBottom: 'clamp(12px, 4vw, 16px)', color: '#6b7280', textAlign: 'center', fontSize: 'clamp(0.95rem, 3vw, 1rem)' }}>
          Real-time read-only output from safe system commands running directly on the Oracle 19c EC2 instance (refreshes every 30 seconds).
        </p>

        <div className="console-buttons" style={{ marginBottom: 'clamp(16px, 4vw, 20px)' }}>
          {consoleCommands.map(cmd => (
            <button
              key={cmd.key}
              onClick={() => {
                if (cmd.dbCommand) {
                  const action = cmd.key.includes('start') ? 'start' : 'shutdown';
                  const isExecutable = 
                    (cmd.key === 'start_db' && dbStatus === 'stopped' && !isLoadingDb) ||
                    (cmd.key === 'shutdown_db' && dbStatus === 'running' && !isLoadingDb) &&
                    ec2Status === 'running';

                  if (isExecutable) {
                    handleDbAction(action);
                  } else {
                    setActiveCmd(cmd.key);
                  }
                } else {
                  setActiveCmd(cmd.key);
                }
              }}
              disabled={cmd.dbCommand ? (
                ec2Status !== 'running'
              ) : false}
              style={{
                padding: 'clamp(8px, 2vw, 12px) clamp(12px, 3vw, 20px)',
                background: activeCmd === cmd.key ? '#006699' : '#e5e7eb',
                color: activeCmd === cmd.key ? 'white' : '#111827',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: 'clamp(0.85rem, 3vw, 0.95rem)',
                flex: '1 1 45%',
                maxWidth: '220px',
                minWidth: '140px',
                opacity: cmd.dbCommand && (
                  (cmd.key === 'start_db' && dbStatus !== 'stopped') ||
                  (cmd.key === 'shutdown_db' && dbStatus !== 'running')
                ) ? 0.6 : 1
              }}
            >
              {isLoadingDb && (
                (cmd.key === 'start_db' && dbStatus === 'starting') ||
                (cmd.key === 'shutdown_db' && dbStatus === 'shutting_down')
              ) ? 'Processing...' : cmd.label}
            </button>
          ))}
        </div>

        <div className="console-output">
          <div className="console-prompt">
            $ {consoleCommands.find(c => c.key === activeCmd)?.label || activeCmd}
          </div>

          {consoleData[activeCmd] ? (
            <>
              {consoleData[activeCmd].status === 'down' ? (
                <div className="console-error">
                  {consoleData[activeCmd].message || 'Instance is down or unavailable'}
                </div>
              ) : (
                <>
                  {consoleData[activeCmd].output ? (
                    <div className="console-text">{consoleData[activeCmd].output}</div>
                  ) : null}
                  {consoleData[activeCmd].error ? (
                    <div className="console-error">{consoleData[activeCmd].error}</div>
                  ) : null}
                </>
              )}
            </>
          ) : (
            <div className="console-loading">Loading EC2 instance status...</div>
          )}
        </div>
      </div>
    </div>
  );
}