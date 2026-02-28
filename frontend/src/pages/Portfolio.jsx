import React, { useRef, useEffect, useState } from 'react';
import { useScrollReveal } from '../App';

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
  setIsLoadingDb,
  addLog,
}) {
  useScrollReveal();

  const logRef = useRef(null);
  const [consoleData, setConsoleData] = useState({});
  const [activeCmd, setActiveCmd] = useState('df');
  const [backendWaking, setBackendWaking] = useState(false);
  const [wakeTimer, setWakeTimer] = useState(0);

  // Auto-scroll log to bottom
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [ec2Log]);

  // Cold-start: detect if backend is slow to respond
  useEffect(() => {
    let timer;
    if (ec2Status === 'unknown') {
      setBackendWaking(true);
      let t = 0;
      timer = setInterval(() => {
        t += 1;
        setWakeTimer(t);
        if (t >= 60) clearInterval(timer);
      }, 1000);
    } else {
      setBackendWaking(false);
      setWakeTimer(0);
    }
    return () => clearInterval(timer);
  }, [ec2Status]);

  const consoleCommands = [
    { key: 'df', label: 'df -h (Disk)' },
    { key: 'uptime', label: 'uptime' },
    { key: 'free', label: 'free -h (Memory)' },
    { key: 'top', label: 'top (brief)' },
    { key: 'start_db', label: 'Start Oracle DB', dbCommand: true },
    { key: 'shutdown_db', label: 'Shutdown Oracle DB', dbCommand: true },
    { key: 'view_startup_log', label: 'Startup Log', dbCommand: true, isView: true },
    { key: 'view_shutdown_log', label: 'Shutdown Log', dbCommand: true, isView: true },
  ];

  // Fetch console output on command change
  useEffect(() => {
    const fetchConsole = async () => {
      const cmdConfig = consoleCommands.find(c => c.key === activeCmd);
      if (cmdConfig?.dbCommand && !cmdConfig.isView) {
        if (dbStatus !== 'running') {
          setConsoleData(prev => ({
            ...prev,
            [activeCmd]: { output: `Database is ${dbStatus}. Start it first.` },
          }));
          return;
        }
      }

      try {
        const res = await fetch(`${BASE_URL}/console/${activeCmd}`);
        const data = await res.json();
        if (data.status === 'down') {
          setConsoleData(prev => ({
            ...prev,
            [activeCmd]: { output: data.message || 'Instance is down or unavailable' },
          }));
        } else {
          setConsoleData(prev => ({ ...prev, [activeCmd]: data }));
        }
      } catch (err) {
        setConsoleData(prev => ({
          ...prev,
          [activeCmd]: { error: 'Failed to load output' },
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
      if (data.error) throw new Error(data.error);
      await new Promise(resolve => setTimeout(resolve, 5000));
      setDbStatus(action === 'start' ? 'running' : 'stopped');
      setActiveCmd(cmdKey);
    } catch (err) {
      setDbStatus('unknown');
      alert(`Database ${action} failed: ${err.message}`);
    } finally {
      setIsLoadingDb(false);
    }
  };

  const statusLabel = ec2Status.charAt(0).toUpperCase() + ec2Status.slice(1);

  return (
    <div className="page-container">
      {/* ── Header ── */}
      <div className="portfolio-intro">
        <p className="section-label fade-up">Work</p>
        <h1 className="section-title fade-up delay-1" style={{ marginBottom: '1.25rem' }}>Portfolio</h1>
        <p className="fade-up delay-2">
          Live technical demonstrations showcasing Oracle database automation, AWS EC2
          infrastructure control, and full-stack integration — all running on real cloud infrastructure.
        </p>
      </div>

      {/* ── Project list ── */}
      <ul className="project-list fade-up delay-3">
        <li><strong>AWS EC2 Automation</strong> — Oracle 19c instance lifecycle control (live demo below)</li>
        <li><strong>Full-Stack Web App</strong> — React frontend + FastAPI backend deployed on Render</li>
        <li><strong>RMAN Backup Simulation</strong> — Python-based Oracle backup & recovery scripting</li>
        <li><strong>Cloud Migration Workflows</strong> — Infrastructure automation via boto3 and AWS SSM</li>
        <li><strong>Multi-DB Solutions</strong> — PL/SQL, PostgreSQL, MongoDB, Amazon RDS integrations</li>
      </ul>

      {/* ── Cold Start Warning ── */}
      {backendWaking && (
        <div className="cold-start-banner fade-up">
          <span className="icon">⏳</span>
          <span>
            <strong>Demo server warming up</strong> — The backend runs on Render's free tier and may
            take up to 60 seconds to wake from sleep. Hang tight!
            {wakeTimer > 5 && ` (${wakeTimer}s elapsed)`}
          </span>
        </div>
      )}

      {/* ── EC2 Instance Control Card ── */}
      <div className="glass-card fade-up delay-1">
        <h2>Oracle 19c Instance Control</h2>
        <p className="card-context">
          Live control panel for a real AWS EC2 instance running Oracle 19c.
          This is the same workflow used in enterprise database operations —
          start/stop automation via boto3, with real-time status polling every 8 seconds.
        </p>

        <div className={`ec2-status status-${ec2Status}`}>
          EC2: {statusLabel}
        </div>

        {dbStatus === 'running' && (
          <div className="db-warning">
            ⚠ Oracle 19c is running — stop the database before stopping EC2
          </div>
        )}

        <div className="ec2-buttons">
          <button
            onClick={handleStartEC2}
            disabled={
              ec2Status === 'running' || ec2Status === 'pending' ||
              isLoadingEC2 || dbStatus === 'running' ||
              dbStatus === 'shutting_down' || dbStatus === 'starting'
            }
          >
            {isLoadingEC2 && (ec2Status === 'stopped' || ec2Status === 'stopping')
              ? 'Starting…'
              : '▶ Start EC2'}
          </button>
          <button
            onClick={handleStopEC2}
            disabled={
              ec2Status === 'stopped' || ec2Status === 'stopping' ||
              isLoadingEC2 || dbStatus === 'running' ||
              dbStatus === 'shutting_down' || dbStatus === 'starting'
            }
          >
            {isLoadingEC2 && (ec2Status === 'running' || ec2Status === 'pending')
              ? 'Stopping…'
              : '■ Stop EC2'}
          </button>
        </div>

        <div className="ec2-log" ref={logRef}>
          <div className="ec2-log-header">
            <h3>Activity Log</h3>
            <button
              className="ec2-log-clear"
              onClick={handleClearLog}
              disabled={ec2Log.length === 0}
            >
              Clear
            </button>
          </div>

          {ec2Log.length === 0 ? (
            <p style={{ color: 'var(--text-dim)', fontStyle: 'italic', textAlign: 'center' }}>
              No activity yet — start or stop the instance to see log entries.
            </p>
          ) : (
            ec2Log.map((entry, i) => (
              <p
                key={i}
                style={{
                  color: entry.includes('running') ? 'var(--green)'
                       : entry.includes('failed') || entry.includes('error') ? 'var(--red)'
                       : entry.includes('stopping') || entry.includes('stop') ? 'var(--orange)'
                       : 'var(--text-muted)',
                }}
              >
                {entry}
              </p>
            ))
          )}
        </div>

        {isLoadingEC2 && (
          <p style={{ textAlign: 'center', marginTop: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>
            Command sent — polling for status change…
          </p>
        )}
      </div>

      {/* ── Console Card ── */}
      <div className="glass-card fade-up delay-2">
        <h2>EC2 Instance Console</h2>
        <p className="card-context">
          Real-time read-only output from safe system commands running directly on
          the Oracle 19c EC2 instance. Refreshes on demand.
        </p>

        <div className="console-buttons">
          {consoleCommands.filter(c => !c.isView).map(cmd => {
            const shouldDisable = cmd.dbCommand
              ? (cmd.key === 'start_db' && (dbStatus !== 'stopped' || isLoadingDb)) ||
                (cmd.key === 'shutdown_db' && (dbStatus !== 'running' || isLoadingDb)) ||
                ec2Status !== 'running'
              : false;

            return (
              <button
                key={cmd.key}
                className={`console-btn ${activeCmd === cmd.key ? 'active' : ''}`}
                style={{ opacity: shouldDisable ? 0.45 : 1, cursor: shouldDisable ? 'not-allowed' : 'pointer' }}
                onClick={() => {
                  if (cmd.dbCommand) {
                    if (shouldDisable) {
                      const viewKey = cmd.key === 'start_db' ? 'view_startup_log' : 'view_shutdown_log';
                      setActiveCmd(viewKey);
                    } else {
                      handleDbAction(cmd.key.includes('start') ? 'start' : 'shutdown');
                    }
                  } else {
                    setActiveCmd(cmd.key);
                  }
                }}
              >
                {isLoadingDb &&
                  ((cmd.key === 'start_db' && dbStatus === 'starting') ||
                   (cmd.key === 'shutdown_db' && dbStatus === 'shutting_down'))
                  ? 'Processing…'
                  : cmd.label}
              </button>
            );
          })}
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
                  {consoleData[activeCmd].output && (
                    <div className="console-text">{consoleData[activeCmd].output}</div>
                  )}
                  {consoleData[activeCmd].error && (
                    <div className="console-error">{consoleData[activeCmd].error}</div>
                  )}
                </>
              )}
            </>
          ) : (
            <div className="console-loading">Fetching output from EC2 instance…</div>
          )}
        </div>
      </div>
    </div>
  );
}
