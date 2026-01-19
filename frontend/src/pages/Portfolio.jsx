// src/pages/Portfolio.jsx
import React, { useRef, useEffect, useState } from 'react';

export default function Portfolio({
  ec2Status,
  isLoadingEC2,
  handleStartEC2,
  handleStopEC2,
  ec2Log,
  handleClearLog
}) {
  const logRef = useRef(null);
  const [consoleData, setConsoleData] = useState({}); // outputs by command key
  const [activeCmd, setActiveCmd] = useState('df');

  const BASE_URL = 'http://localhost:8000'; // change to live backend URL when deployed

  // Auto-scroll EC2 log to bottom
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [ec2Log]);

  // Poll EC2 status & log real AWS state changes + fetch EC2 console output on state change
  useEffect(() => {
    const fetchStatusAndConsole = async () => {
      try {
        // 1. Fetch current EC2 status
        const statusRes = await fetch(`${BASE_URL}/ec2-status`);
        const statusData = await statusRes.json();
        const newStatus = statusData.status || 'error';

        // Log every real AWS status change
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

          // Add AWS state change to log
          const timestamp = new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          });
          setEc2Log(prev => [...prev, `${timestamp} - ${logMessage}`]);

          setEc2Status(newStatus);

          // 2. If instance just started (now running), fetch console output from EC2
          if (newStatus === 'running') {
            try {
              const consoleRes = await fetch(`${BASE_URL}/console/df`);
              const consoleData = await consoleRes.json();

              if (consoleData.output) {
                // Add real EC2 df -h output to log
                const lines = consoleData.output.split('\n');
                lines.forEach(line => {
                  if (line.trim()) {
                    setEc2Log(prev => [...prev, `${timestamp} - EC2 DF: ${line.trim()}`]);
                  }
                });
              } else if (consoleData.error) {
                setEc2Log(prev => [...prev, `${timestamp} - EC2 DF error: ${consoleData.error}`]);
              }
            } catch (consoleErr) {
              setEc2Log(prev => [...prev, `${timestamp} - Failed to fetch EC2 console: ${consoleErr.message}`]);
            }
          }
        }
      } catch (err) {
        const timestamp = new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
        setEc2Log(prev => [...prev, `${timestamp} - Connection error`]);
        setEc2Status('error');
      }
    };

    fetchStatusAndConsole(); // initial fetch
    const interval = setInterval(fetchStatusAndConsole, 8000); // 8-second polling
    return () => clearInterval(interval);
  }, [ec2Status, BASE_URL]);

  // Fetch console output when user switches command
  useEffect(() => {
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
  }, [activeCmd, BASE_URL]);

  // Safe console commands (must match backend ALLOWED_COMMANDS)
  const consoleCommands = [
    { key: 'df', label: 'df -h (Disk Usage)' },
    { key: 'uptime', label: 'uptime' },
    { key: 'free', label: 'free -h (Memory)' },
    { key: 'top', label: 'top (brief)' },
    { key: 'ls_home', label: 'ls -lh /home/oracle' },
  ];

  return (
    <div className="page-container">
      <h1>Portfolio</h1>
      <p style={{ marginBottom: '32px' }}>
        A selection of technical projects and demonstrations showcasing database automation, AWS cloud infrastructure, and full-stack development.
      </p>

      <ul style={{ marginBottom: '48px', lineHeight: 1.8 }}>
        <li><strong>AWS EC2 Automation – Oracle 19c Database Instance Control</strong> (interactive demo below)</li>
        <li>Full-Stack Applications using React + FastAPI</li>
        <li>Python-based Database Backup & Recovery Scripts (RMAN integration)</li>
        <li>Cloud Migration & Infrastructure Automation Workflows</li>
        <li>PL/SQL & Multi-DB (Postgres, MongoDB, Amazon RDS) Solutions</li>
      </ul>

      {/* Oracle 19c Demo Instance Control */}
      <div className="ec2-card">
        <h2>Oracle 19c Demo Instance Control</h2>

        <p className={`ec2-status status-${ec2Status}`}>
          Status: {ec2Status.charAt(0).toUpperCase() + ec2Status.slice(1)}
        </p>

        <div className="ec2-buttons">
          <button
            className="cta-primary"
            onClick={handleStartEC2}
            disabled={ec2Status === 'running' || isLoadingEC2 || ec2Status === 'pending'}
          >
            {isLoadingEC2 ? 'Starting...' : 'Start Instance'}
          </button>

          <button
            className="cta-primary"
            style={{ background: '#dc3545', boxShadow: '0 4px 12px rgba(220,53,69,0.3)' }}
            onClick={handleStopEC2}
            disabled={ec2Status === 'stopped' || isLoadingEC2 || ec2Status === 'stopping'}
          >
            {isLoadingEC2 ? 'Stopping...' : 'Stop Instance'}
          </button>
        </div>

        {/* Instance Activity Log */}
        <div className="ec2-log" ref={logRef}>
          <div className="ec2-log-header">
            <h4>Instance Activity Log</h4>
            <button
              className="ec2-log-clear"
              onClick={handleClearLog}
              disabled={ec2Log.length === 0}
            >
              Clear Log
            </button>
          </div>

          {ec2Log.length === 0 ? (
            <p style={{ color: '#6b7280', fontStyle: 'italic', textAlign: 'left' }}>
              No activity yet...
            </p>
          ) : (
            ec2Log.map((entry, i) => (
              <p
                key={i}
                style={{
                  margin: '4px 0',
                  padding: '0 8px',
                  fontFamily: "'Courier New', Courier, monospace",
                  whiteSpace: 'pre',
                  textAlign: 'left',
                  color: entry.includes('AWS confirmed') ? '#006699' :
                         entry.includes('failed') || entry.includes('error') ? '#dc3545' :
                         entry.includes('AWS Request ID') ? '#4b5563' :
                         '#0f0f0f'
                }}
              >
                {entry}
              </p>
            ))
          )}
        </div>

        {isLoadingEC2 && (
          <p className="ec2-loading">Command sent — watching for status change...</p>
        )}
      </div>

      {/* EC2 Instance Status Console */}
      <div className="console-card" style={{ marginTop: '60px' }}>
        <h2>EC2 Instance Status Console</h2>
        <p style={{ marginBottom: '16px', color: '#6b7280' }}>
          Real-time read-only output from safe system commands running directly on the Oracle 19c EC2 instance (refreshes every 30 seconds).
        </p>

        <div style={{ marginBottom: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {consoleCommands.map(cmd => (
            <button
              key={cmd.key}
              onClick={() => setActiveCmd(cmd.key)}
              style={{
                padding: '8px 16px',
                background: activeCmd === cmd.key ? '#006699' : '#e5e7eb',
                color: activeCmd === cmd.key ? 'white' : '#111827',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.95rem'
              }}
            >
              {cmd.label}
            </button>
          ))}
        </div>

        <div style={{
          background: '#0d1117',
          color: consoleData[activeCmd]?.status === 'down' ? '#ff6b6b' : '#c9d1d9',
          fontFamily: "'Courier New', Courier, monospace",
          padding: '16px',
          borderRadius: '8px',
          maxHeight: '400px',
          overflowY: 'auto',
          whiteSpace: 'pre-wrap',
          fontSize: '0.95rem',
          lineHeight: 1.4,
          border: '1px solid #30363d'
        }}>
          <div style={{ color: '#58a6ff', marginBottom: '8px' }}>
            $ {consoleCommands.find(c => c.key === activeCmd)?.label || activeCmd}
          </div>

          {consoleData[activeCmd] ? (
            <>
              {consoleData[activeCmd].status === 'down' ? (
                <div style={{ color: '#ff6b6b', fontWeight: 'bold' }}>
                  {consoleData[activeCmd].message || 'Instance is down or unavailable'}
                </div>
              ) : (
                <>
                  {consoleData[activeCmd].output ? (
                    <div>{consoleData[activeCmd].output}</div>
                  ) : null}
                  {consoleData[activeCmd].error ? (
                    <div style={{ color: '#f85149' }}>{consoleData[activeCmd].error}</div>
                  ) : null}
                </>
              )}
            </>
          ) : (
            'Loading EC2 instance status...'
          )}
        </div>
      </div>
    </div>
  );
}