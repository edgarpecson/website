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
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingSteps, setLoadingSteps] = useState([]);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showWarmupNotice, setShowWarmupNotice] = useState(true);
  const [showTourWelcome, setShowTourWelcome] = useState(true);
  const [tourActive, setTourActive] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [tourStepCompleted, setTourStepCompleted] = useState(false);
  const [showContinueButton, setShowContinueButton] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
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
            setShowSuccessAnimation(true);
            setTimeout(() => setShowSuccessAnimation(false), 3000);
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
            setShowSuccessAnimation(true);
            setTimeout(() => setShowSuccessAnimation(false), 3000);
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
    return () => clearInterval(fetchOracleStatus);
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

  // Simulate loading progress
  const simulateProgress = (duration, steps) => {
    setLoadingProgress(0);
    setLoadingSteps(steps);
    setTimeRemaining(duration);
    
    const totalSteps = steps.length;
    const stepDuration = duration / totalSteps;
    let currentStep = 0;
    
    const progressInterval = setInterval(() => {
      currentStep++;
      const progress = (currentStep / totalSteps) * 100;
      setLoadingProgress(Math.min(progress, 95)); // Cap at 95% until actual completion
      
      if (currentStep < totalSteps) {
        setLoadingMessage(steps[currentStep].message);
      }
      
      if (currentStep >= totalSteps) {
        clearInterval(progressInterval);
      }
    }, stepDuration * 1000);
    
    const timeInterval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timeInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => {
      clearInterval(progressInterval);
      clearInterval(timeInterval);
    };
  };

  const startEC2 = async () => {
    setIsLoading(true);
    setTourStepCompleted(false);
    setShowContinueButton(false);
    addLog('Starting EC2 instance...', 'info');
    
    const steps = [
      { message: 'Sent start command to AWS', completed: true },
      { message: 'AWS accepted request', completed: false },
      { message: 'Instance state: pending', completed: false },
      { message: 'Booting operating system...', completed: false },
      { message: 'Waiting for network...', completed: false },
      { message: 'Checking SSH access...', completed: false }
    ];
    
    setLoadingMessage('Sending start command to AWS...');
    simulateProgress(30, steps);
    
    try {
      const res = await fetch(`${API_BASE}/start-ec2`, { method: 'POST' });
      const data = await res.json();
      setLoadingProgress(100);
      setTimeout(() => {
        setIsLoading(false);
        setLoadingProgress(0);
        setLoadingSteps([]);
        
        // Tour: Mark step completed and show success
        if (tourActive && tourStep === 0) {
          setTourStepCompleted(true);
          setShowSuccessAnimation(true);
          
          // Show Continue button AFTER success animation (3 seconds)
          setTimeout(() => {
            setShowSuccessAnimation(false);
            setShowContinueButton(true);
          }, 3000);
        }
      }, 1000);
    } catch (err) {
      addLog('Failed to start EC2 instance', 'error');
      setIsLoading(false);
      setLoadingProgress(0);
    }
  };

  const stopEC2 = async () => {
    setIsLoading(true);
    addLog('Stopping EC2 instance...', 'warning');
    
    const steps = [
      { message: 'Sent stop command to AWS', completed: true },
      { message: 'Gracefully shutting down services', completed: false },
      { message: 'Stopping instance', completed: false }
    ];
    
    simulateProgress(15, steps);
    
    try {
      const res = await fetch(`${API_BASE}/stop-ec2`, { method: 'POST' });
      const data = await res.json();
      setLoadingProgress(100);
      setTimeout(() => {
        setIsLoading(false);
        setLoadingProgress(0);
      }, 1000);
    } catch (err) {
      addLog('Failed to stop EC2 instance', 'error');
      setIsLoading(false);
    }
  };

  const startOracle = async () => {
    setIsLoading(true);
    setTourStepCompleted(false);
    setShowContinueButton(false);
    addLog('Starting Oracle Database...', 'info');
    
    const steps = [
      { message: 'Executing dbstart command', completed: true },
      { message: 'Reading init parameters', completed: false },
      { message: 'Allocating SGA memory', completed: false },
      { message: 'Opening control files', completed: false },
      { message: 'Mounting database...', completed: false },
      { message: 'Starting listener service...', completed: false }
    ];
    
    simulateProgress(45, steps);
    
    try {
      const res = await fetch(`${API_BASE}/start-oracle`, { method: 'POST' });
      const data = await res.json();
      if (data.output) {
        setConsoleOutput(data.output);
      }
      setLoadingProgress(100);
      setTimeout(() => {
        setIsLoading(false);
        setLoadingProgress(0);
        setLoadingSteps([]);
        
        // Tour: Mark step completed and show success
        if (tourActive && tourStep === 1) {
          setTourStepCompleted(true);
          setShowSuccessAnimation(true);
          
          // Show Continue button AFTER success animation (3 seconds)
          setTimeout(() => {
            setShowSuccessAnimation(false);
            setShowContinueButton(true);
          }, 3000);
        }
      }, 1000);
    } catch (err) {
      addLog('Failed to start Oracle Database', 'error');
      setIsLoading(false);
    }
  };

  const stopOracle = async () => {
    setIsLoading(true);
    addLog('Stopping Oracle Database...', 'warning');
    
    const steps = [
      { message: 'Executing dbshut command', completed: true },
      { message: 'Closing user connections', completed: false },
      { message: 'Flushing buffers to disk', completed: false },
      { message: 'Shutting down instance', completed: false }
    ];
    
    simulateProgress(20, steps);
    
    try {
      const res = await fetch(`${API_BASE}/stop-oracle`, { method: 'POST' });
      const data = await res.json();
      if (data.output) {
        setConsoleOutput(data.output);
      }
      setLoadingProgress(100);
      setTimeout(() => {
        setIsLoading(false);
        setLoadingProgress(0);
      }, 1000);
    } catch (err) {
      addLog('Failed to stop Oracle Database', 'error');
      setIsLoading(false);
    }
  };

  const runConsoleCommand = async (cmd, label) => {
    setIsLoading(true);
    setTourStepCompleted(false);
    setShowContinueButton(false);
    setLoadingMessage(`Executing ${label || cmd}...`);
    addLog(`Running: ${label || cmd}`, 'info');
    
    try {
      const res = await fetch(`${API_BASE}/console/${cmd}`);
      const data = await res.json();
      setConsoleOutput(data.output || data.message || 'No output');
      addLog(`Command completed: ${label || cmd}`, 'success');
      
      // Tour Step 3: Mark completed and show Continue after brief delay
      if (tourActive && tourStep === 2) {
        setTourStepCompleted(true);
        setTimeout(() => {
          setShowContinueButton(true);
        }, 1500);
      }
      
      // Tour Step 4: Auto-complete tour after any database command
      if (tourActive && tourStep === 3) {
        setShowSuccessAnimation(true);
        setTimeout(() => {
          setShowSuccessAnimation(false);
          setTourStep(4); // Go to completion screen
        }, 2000);
      }
    } catch (err) {
      setConsoleOutput('Command failed');
      addLog(`Command failed: ${label || cmd}`, 'error');
    }
    setIsLoading(false);
    setLoadingMessage('');
  };

  const runRMANDemo = async () => {
    setIsLoading(true);
    setTourStepCompleted(false);
    setShowContinueButton(false);
    addLog('Running RMAN backup simulation...', 'info');
    
    const steps = [
      { message: 'Connecting to RMAN', completed: true },
      { message: 'Allocating backup channel', completed: false },
      { message: 'Backing up datafiles...', completed: false },
      { message: 'Backing up archive logs', completed: false }
    ];
    
    simulateProgress(30, steps);
    
    try {
      const res = await fetch(`${API_BASE}/rman-demo`);
      const data = await res.json();
      setConsoleOutput(data.output || '');
      addLog('RMAN backup completed successfully', 'success');
      setLoadingProgress(100);
      setTimeout(() => {
        setIsLoading(false);
        setLoadingProgress(0);
        setLoadingSteps([]);
        
        // Tour Step 4: Auto-complete tour after any database command
        if (tourActive && tourStep === 3) {
          setShowSuccessAnimation(true);
          setTimeout(() => {
            setShowSuccessAnimation(false);
            setTourStep(4); // Go to completion screen
          }, 2000);
        }
      }, 1000);
    } catch (err) {
      addLog('RMAN demo failed', 'error');
      setIsLoading(false);
    }
  };

  const startTour = () => {
    setShowTourWelcome(false);
    setTourActive(true);
    
    // Smart detection: Skip already-running components
    if (ec2Status === 'running' && oracleStatus === 'OPEN') {
      setTourStep(2); // Both running, go to commands
    } else if (ec2Status === 'running') {
      setTourStep(1); // EC2 running, start with Oracle
    } else {
      setTourStep(0); // Start from beginning
    }
  };

  const skipTour = () => {
    setShowTourWelcome(false);
    setTourActive(false);
  };

  const nextTourStep = () => {
    setTourStepCompleted(false);
    setShowContinueButton(false);
    if (tourStep < 4) {
      setTourStep(tourStep + 1);
    } else {
      completeTour();
    }
  };

  const completeTour = () => {
    setTourActive(false);
    setTourStep(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const restartTour = () => {
    setTourActive(true);
    setTourStep(0);
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

        {/* Tour Welcome Screen */}
        {showTourWelcome && (
          <div className="tour-welcome">
            <div className="tour-welcome-content">
              <h2 className="tour-welcome-title">👋 Welcome to the Live Infrastructure Demo</h2>
              <p className="tour-welcome-text">
                Watch me control a real AWS EC2 instance and Oracle 19c database from this browser.
                <br />
                All interactions happen in real-time with actual cloud infrastructure.
              </p>
              <div className="tour-welcome-buttons">
                <button className="tour-btn tour-btn-primary" onClick={startTour}>
                  <span className="tour-btn-icon">🎯</span>
                  <span className="tour-btn-text">
                    <span className="tour-btn-title">Take the Tour</span>
                    <span className="tour-btn-subtitle">60 seconds</span>
                  </span>
                </button>
                <button className="tour-btn tour-btn-secondary" onClick={skipTour}>
                  <span className="tour-btn-icon">⚡</span>
                  <span className="tour-btn-text">
                    <span className="tour-btn-title">Explore Free</span>
                    <span className="tour-btn-subtitle">I know this</span>
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tour Progress Bar */}
        {tourActive && (
          <div className="tour-progress-bar">
            <div className="tour-progress-header">
              <span className="tour-progress-label">GUIDED TOUR</span>
              <span className="tour-progress-step">Step {tourStep + 1} of 5</span>
              <button className="tour-skip-btn" onClick={completeTour}>Skip Tour</button>
            </div>
            <div className="tour-progress-track">
              <div className="tour-progress-fill" style={{ width: `${((tourStep + 1) / 5) * 100}%` }}></div>
            </div>
          </div>
        )}

        {/* Main Description */}
        <p className="main-description-large">
          Live control panel for a real AWS EC2 instance running Oracle 19c. This is the same workflow 
          used in enterprise database operations — start/stop automation via boto3, with real-time 
          status polling every 8 seconds.
        </p>

        {/* Loading Overlay */}
        {isLoading && loadingSteps.length > 0 && (
          <div className="loading-overlay">
            <div className="loading-content">
              <div className="loading-header">
                <span className="loading-icon">🚀</span>
                <h3 className="loading-title">{loadingMessage || 'Processing...'}</h3>
              </div>
              
              <div className="loading-progress-bar">
                <div className="loading-progress-fill" style={{ width: `${loadingProgress}%` }}></div>
                <span className="loading-progress-text">{Math.round(loadingProgress)}%</span>
              </div>
              
              <div className="loading-steps">
                {loadingSteps.map((step, index) => (
                  <div key={index} className={`loading-step ${index < Math.floor(loadingSteps.length * (loadingProgress / 100)) ? 'completed' : index === Math.floor(loadingSteps.length * (loadingProgress / 100)) ? 'current' : 'pending'}`}>
                    <span className="loading-step-icon">
                      {index < Math.floor(loadingSteps.length * (loadingProgress / 100)) ? '✓' : 
                       index === Math.floor(loadingSteps.length * (loadingProgress / 100)) ? '⏳' : '⏹'}
                    </span>
                    <span className="loading-step-text">{step.message}</span>
                  </div>
                ))}
              </div>
              
              {timeRemaining > 0 && (
                <div className="loading-footer">
                  <p className="loading-time">Estimated time remaining: {timeRemaining} seconds</p>
                  <p className="loading-context">
                    💡 What's happening: {
                      loadingMessage.includes('EC2') ? 'AWS is allocating compute resources, booting the Linux OS, and initializing network services.' :
                      loadingMessage.includes('Oracle') ? 'Oracle is starting the instance, allocating memory (SGA), and opening the database files.' :
                      loadingMessage.includes('RMAN') ? 'RMAN is creating a full database backup to the fast recovery area.' :
                      'Executing command on the remote server via SSH.'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Success Animation */}
        {showSuccessAnimation && (
          <div className="success-animation">
            <div className="success-content">
              <div className="success-icon">🎉</div>
              <h3 className="success-title">Success!</h3>
              <p className="success-message">Operation completed successfully</p>
            </div>
          </div>
        )}

        {/* EC2 Instance Console Section */}
        <div className={`console-section ${tourActive && tourStep === 0 ? 'tour-highlight' : tourActive ? 'tour-dimmed' : ''}`}>
          {tourActive && tourStep === 0 && (
            <div className="tour-instruction">
              {!tourStepCompleted ? (
                <>
                  <h3 className="tour-instruction-title">Step 1: Start the Virtual Server</h3>
                  <p className="tour-instruction-text">
                    The EC2 instance is the virtual machine that hosts our Oracle database. 
                    We need to boot it first before we can do anything.
                  </p>
                  <p className="tour-instruction-status">
                    Current Status: <strong>{ec2Status}</strong> {ec2Status === 'stopped' ? '🔴' : ec2Status === 'running' ? '🟢' : '🟡'}
                  </p>
                  <p className="tour-instruction-cta">Click the button below to start it:</p>
                </>
              ) : showContinueButton ? (
                <>
                  <h3 className="tour-instruction-title">✅ EC2 is Running!</h3>
                  <p className="tour-instruction-text">
                    Great job! The virtual server is now online and ready. 
                    Let's move on to starting the Oracle database.
                  </p>
                  <button className="tour-continue-btn tour-spotlight" onClick={nextTourStep}>
                    Continue to Step 2 →
                  </button>
                </>
              ) : (
                <>
                  <h3 className="tour-instruction-title">⏳ Success!</h3>
                  <p className="tour-instruction-text">
                    EC2 instance is starting up...
                  </p>
                </>
              )}
            </div>
          )}
          
          <div className={`section-content ${tourActive ? 'tour-dimmed' : ''}`}>
            <h2 className="section-heading">EC2 Instance Console</h2>
            <p className="section-description">
              Your virtual server running in AWS. Start it up to access your Oracle database, 
              or shut it down to save costs when not in use.
            </p>
            
            <div className={`status-pill-large status-${ec2Status}`}>
              <span className="status-dot"></span>
              EC2: {ec2Status}
            </div>
          </div>

          <div className="action-buttons-compact">
            <button 
              onClick={startEC2}
              className={`action-btn action-btn-start ${tourActive && tourStep === 0 && canStartEc2 && !tourStepCompleted ? 'tour-spotlight' : ''}`}
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
        <div className={`oracle-section ${tourActive && tourStep === 1 ? 'tour-highlight' : tourActive ? 'tour-dimmed' : ''}`}>
          {tourActive && tourStep === 1 && (
            <div className="tour-instruction">
              {!tourStepCompleted ? (
                <>
                  <h3 className="tour-instruction-title">Step 2: Start the Oracle Database</h3>
                  <p className="tour-instruction-text">
                    Now that the server is running, we can start the Oracle database that's installed on it. 
                    This uses Oracle's dbstart command under the hood, same as you'd do via SSH.
                  </p>
                  <p className="tour-instruction-status">
                    Current Status: <strong>{oracleStatus}</strong> {oracleStatus === 'SHUTDOWN' ? '🔴' : oracleStatus === 'OPEN' ? '🟢' : '🟡'}
                  </p>
                  <p className="tour-instruction-cta">Click to start the database:</p>
                </>
              ) : showContinueButton ? (
                <>
                  <h3 className="tour-instruction-title">✅ Oracle Database is Running!</h3>
                  <p className="tour-instruction-text">
                    Perfect! The database is now OPEN and ready for queries. 
                    Next, we'll run some diagnostic commands.
                  </p>
                  <button className="tour-continue-btn tour-spotlight" onClick={nextTourStep}>
                    Continue to Step 3 →
                  </button>
                </>
              ) : (
                <>
                  <h3 className="tour-instruction-title">⏳ Success!</h3>
                  <p className="tour-instruction-text">
                    Oracle database is starting up...
                  </p>
                </>
              )}
            </div>
          )}
          
          <div className={`section-content ${tourActive ? 'tour-dimmed' : ''}`}>
            <h2 className="section-heading">Oracle 19c Instance Console</h2>
            <p className="section-description">
              Your production Oracle database. Always stop the database gracefully before 
              stopping the EC2 instance to prevent data corruption.
            </p>
            
            <div className={`status-pill-large status-${getDbPillStatus()}`}>
              <span className="status-dot"></span>
              {getDbPillText()}
            </div>
          </div>

          <div className="action-buttons-compact">
            <button 
              onClick={startOracle}
              className={`action-btn action-btn-start ${tourActive && tourStep === 1 && canStartDb && !tourStepCompleted ? 'tour-spotlight' : ''}`}
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
        <div className={`activity-section-standalone ${tourActive ? 'tour-dimmed' : ''}`}>
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
        <div className={`commands-section ${tourActive && (tourStep === 2 || tourStep === 3) ? 'tour-highlight' : tourActive ? 'tour-dimmed' : ''}`}>
          {tourActive && tourStep === 2 && (
            <div className="tour-instruction">
              {!tourStepCompleted ? (
                <>
                  <h3 className="tour-instruction-title">Step 3: Run System Diagnostics</h3>
                  <p className="tour-instruction-text">
                    Let's check the server's resources. These are safe, read-only commands 
                    that won't change anything on the system.
                  </p>
                  <p className="tour-instruction-cta">Try clicking any one of the system commands:</p>
                </>
              ) : showContinueButton ? (
                <>
                  <h3 className="tour-instruction-title">✅ Command Executed Successfully!</h3>
                  <p className="tour-instruction-text">
                    Nice! You can see the output in the terminal below. 
                    Now let's try a database-specific command.
                  </p>
                  <button className="tour-continue-btn tour-spotlight" onClick={nextTourStep}>
                    Continue to Step 4 →
                  </button>
                </>
              ) : (
                <>
                  <h3 className="tour-instruction-title">⏳ Running Command...</h3>
                  <p className="tour-instruction-text">
                    Executing diagnostic command...
                  </p>
                </>
              )}
            </div>
          )}
          
          {tourActive && tourStep === 3 && (
            <div className="tour-instruction">
              <h3 className="tour-instruction-title">Step 4: Run Oracle Database Command</h3>
              <p className="tour-instruction-text">
                Now let's interact with the actual database. Click any Oracle command below 
                to complete the tour!
              </p>
              <p className="tour-instruction-context">
                💡 The listener is the service that accepts database connections. 
                Think of it like a receptionist for your database.
              </p>
              <p className="tour-instruction-cta">Try clicking any Oracle command:</p>
            </div>
          )}
          
          <div className={`section-content ${tourActive ? 'tour-dimmed' : ''}`}>
            <h2 className="section-heading">Commands</h2>
            <p className="section-description">
              Quick diagnostic tools and database utilities. Click any command to see 
              real-time output in the terminal below.
            </p>
          </div>
          
          <div className="command-category">
            <h3 className={`command-category-title ${tourActive ? 'tour-dimmed' : ''}`}>💻 System Diagnostics</h3>
            <div className="command-buttons">
              <button 
                onClick={() => runConsoleCommand('df', 'df -h (Disk)')} 
                className={`cmd-button ${tourActive && tourStep === 2 && !tourStepCompleted ? 'tour-spotlight' : ''}`}
                disabled={!canRunSystemCommands}
                title="Check disk usage"
              >
                💾 Disk<br/>
                <span className="cmd-subtitle">df -h</span>
              </button>
              <button 
                onClick={() => runConsoleCommand('uptime', 'uptime')} 
                className={`cmd-button ${tourActive && tourStep === 2 && !tourStepCompleted ? 'tour-spotlight' : ''}`}
                disabled={!canRunSystemCommands}
                title="Check server uptime"
              >
                ⏱️ Uptime<br/>
                <span className="cmd-subtitle">uptime</span>
              </button>
              <button 
                onClick={() => runConsoleCommand('free', 'free -h (Memory)')} 
                className={`cmd-button ${tourActive && tourStep === 2 && !tourStepCompleted ? 'tour-spotlight' : ''}`}
                disabled={!canRunSystemCommands}
                title="Check memory usage"
              >
                🧠 RAM<br/>
                <span className="cmd-subtitle">free -h</span>
              </button>
              <button 
                onClick={() => runConsoleCommand('top', 'top (Brief)')} 
                className={`cmd-button ${tourActive && tourStep === 2 && !tourStepCompleted ? 'tour-spotlight' : ''}`}
                disabled={!canRunSystemCommands}
                title="Check CPU usage"
              >
                📊 CPU<br/>
                <span className="cmd-subtitle">top</span>
              </button>
            </div>
          </div>

          <div className="command-category">
            <h3 className={`command-category-title ${tourActive ? 'tour-dimmed' : ''}`}>🗄️ Database Operations</h3>
            <div className="command-buttons">
              <button 
                onClick={runRMANDemo} 
                className={`cmd-button ${tourActive && tourStep === 3 && !tourStepCompleted ? 'tour-spotlight' : ''}`}
                disabled={!canRunOracleCommands}
                title="Run RMAN backup simulation (~30 seconds)"
              >
                💾 RMAN<br/>
                <span className="cmd-subtitle">Backup</span>
              </button>
              <button 
                onClick={() => runConsoleCommand('listener_status', 'Listener Status')} 
                className={`cmd-button ${tourActive && tourStep === 3 && !tourStepCompleted ? 'tour-spotlight' : ''}`}
                disabled={!canRunOracleCommands}
                title="Check listener service status"
              >
                🎧 Listener<br/>
                <span className="cmd-subtitle">Status</span>
              </button>
              <button 
                onClick={() => runConsoleCommand('view_startup_log', 'Startup Log')} 
                className={`cmd-button ${tourActive && tourStep === 3 && !tourStepCompleted ? 'tour-spotlight' : ''}`}
                disabled={!canRunOracleCommands}
                title="View database startup logs"
              >
                📜 Startup<br/>
                <span className="cmd-subtitle">Log</span>
              </button>
              <button 
                onClick={() => runConsoleCommand('view_shutdown_log', 'Shutdown Log')} 
                className={`cmd-button ${tourActive && tourStep === 3 && !tourStepCompleted ? 'tour-spotlight' : ''}`}
                disabled={!canRunOracleCommands}
                title="View database shutdown logs"
              >
                📜 Shutdown<br/>
                <span className="cmd-subtitle">Log</span>
              </button>
            </div>
          </div>
        </div>

        {/* Terminal Output */}
        <div className={`output-section ${tourActive ? 'tour-dimmed' : ''}`}>
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

        {/* Tour Completion Screen */}
        {tourActive && tourStep === 4 && (
          <div className="tour-completion">
            <div className="tour-completion-content">
              <div className="tour-completion-icon">🎉</div>
              <h2 className="tour-completion-title">Tour Complete! You're a Pro Now!</h2>
              
              <div className="tour-completion-checklist">
                <h3>You just:</h3>
                <div className="tour-completion-item">
                  <span className="tour-completion-check">✓</span>
                  <span>Started an AWS EC2 instance</span>
                </div>
                <div className="tour-completion-item">
                  <span className="tour-completion-check">✓</span>
                  <span>Booted an Oracle 19c database</span>
                </div>
                <div className="tour-completion-item">
                  <span className="tour-completion-check">✓</span>
                  <span>Ran system diagnostic commands</span>
                </div>
                <div className="tour-completion-item">
                  <span className="tour-completion-check">✓</span>
                  <span>Checked database services</span>
                </div>
              </div>

              <p className="tour-completion-message">
                All of this was controlling <strong>REAL infrastructure</strong> running in AWS. 
                Not a simulation. Not a demo backend. Actual cloud resources.
              </p>

              <div className="tour-completion-actions">
                <button className="tour-completion-btn tour-completion-btn-primary" onClick={completeTour}>
                  🚀 Explore on Your Own
                </button>
                <button className="tour-completion-btn tour-completion-btn-secondary" onClick={restartTour}>
                  🔄 Restart Tour
                </button>
              </div>

              <div className="tour-completion-cta">
                <p className="tour-completion-cta-text">Like what you see?</p>
                <div className="tour-completion-links">
                  <button className="tour-completion-link" onClick={() => {
                    completeTour();
                    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                  }}>
                    📧 Get in Touch
                  </button>
                  <button className="tour-completion-link" onClick={() => {
                    completeTour();
                    onNavigateToHome('home');
                  }}>
                    🏠 Back to Portfolio
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DemoPage;
