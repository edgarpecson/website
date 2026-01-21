// src/pages/Portfolio.jsx
import React, { useRef, useEffect, useState } from 'react';

export default function Portfolio({
  ec2Status,
  isLoadingEC2,
  handleStartEC2,
  handleStopEC2,
  ec2Log,
  handleClearLog,
  BASE_URL
}) {
  const logRef = useRef(null);
  const [consoleData, setConsoleData] = useState({});
  const [activeCmd, setActiveCmd] = useState('df');

  // Auto-scroll EC2 log to bottom
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [ec2Log]);

  // Fetch console output when active command changes
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

  // Safe console commands (must match backend)
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
      <p style={{ marginBottom: 'clamp(24px, 5vw, 48px)' }}>
        A selection of technical projects and demonstrations showcasing database automation, AWS cloud infrastructure, and full-stack development.
      </p>

      <ul style={{ 
        marginBottom: 'clamp(32px, 6vw, 48px)', 
        lineHeight: 1.8,
        paddingLeft: '1.5rem'
      }}>
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
                         '#0f0f0f'
                }}
              >
                {entry}
              </p>
            ))
          )}
        </div>

        {isLoadingEC2 && (
          <p className="ec2-loading" style={{ textAlign: 'center' }}>
            Command sent — watching for status change...
          </p>
        )}
      </div>

      {/* EC2 Instance Status Console */}
      <div className="console-card">
        <h2>EC2 Instance Status Console</h2>
        <p style={{ marginBottom: 'clamp(12px, 4vw, 16px)', color: '#6b7280', textAlign: 'center' }}>
          Real-time read-only output from safe system commands running directly on the Oracle 19c EC2 instance (refreshes every 30 seconds).
        </p>

        <div className="console-buttons">
          {consoleCommands.map(cmd => (
            <button
              key={cmd.key}
              onClick={() => setActiveCmd(cmd.key)}
              className={`console-btn ${activeCmd === cmd.key ? 'active' : ''}`}
            >
              {cmd.label}
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