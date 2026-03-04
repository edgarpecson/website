import React, { useState, useEffect } from 'react';

function HomePage({ onNavigateToDemo, onNavigateToAbout }) {
  const [liveStatus, setLiveStatus] = useState({
    ec2: 'checking',
    oracle: 'checking',
    lastUpdate: null,
    isLive: false
  });
  
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  useEffect(() => {
    const fetchLiveStatus = async () => {
      const startTime = Date.now();
      
      try {
        const ec2Res = await fetch(`${API_BASE}/ec2-status`);
        const ec2Data = await ec2Res.json();
        
        const oracleRes = await fetch(`${API_BASE}/oracle-status`);
        const oracleData = await oracleRes.json();
        
        const responseTime = Date.now() - startTime;
        
        setLiveStatus({
          ec2: ec2Data.status || 'unknown',
          oracle: oracleData.status || 'unknown',
          lastUpdate: new Date(),
          responseTime: responseTime,
          isLive: true
        });
      } catch (err) {
        console.error('Failed to fetch live status:', err);
        setLiveStatus(prev => ({ ...prev, isLive: false }));
      }
    };

    fetchLiveStatus();
    const interval = setInterval(fetchLiveStatus, 8000);
    return () => clearInterval(interval);
  }, []);

  const getTimeSinceUpdate = () => {
    if (!liveStatus.lastUpdate) return 'checking...';
    const seconds = Math.floor((Date.now() - liveStatus.lastUpdate.getTime()) / 1000);
    if (seconds < 5) return 'just now';
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ago`;
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="home-page">
      <div className="bg-grid"></div>
      <div className="bg-gradient"></div>

      <nav className="nav desktop-nav">
        <div className="nav-logo">
          <span className="logo-bracket">{'<'}</span>
          <span className="logo-name">Edgar Pecson</span>
          <span className="logo-bracket">{'/>'}</span>
        </div>
        <div className="nav-links">
          <a href="#hero">Home</a>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToAbout(); }}>About</a>
          <button onClick={onNavigateToDemo} className="nav-demo-btn">Live Demo</button>
          <a href="#contact">Contact</a>
        </div>
      </nav>

      <div className="mobile-top-bar">
        <div className="mobile-logo">
          <span className="logo-bracket">{'<'}</span>
          <span className="logo-name">Edgar</span>
          <span className="logo-bracket">{'/>'}</span>
        </div>
        <button className="hamburger-btn" onClick={() => {
          document.querySelector('.hamburger-menu')?.classList.toggle('open');
        }}>
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      <div className="hamburger-menu">
        <button className="hamburger-close" onClick={() => {
          document.querySelector('.hamburger-menu')?.classList.remove('open');
        }}>✕</button>
        <nav className="hamburger-nav">
          <a href="#" onClick={(e) => { 
            e.preventDefault(); 
            onNavigateToAbout(); 
            document.querySelector('.hamburger-menu')?.classList.remove('open');
          }}>About Me</a>
          <div className="hamburger-divider"></div>
          <a href="https://github.com/edgarpecson" target="_blank" rel="noopener noreferrer">
            <span className="hamburger-icon">🐙</span> GitHub
          </a>
          <a href="https://linkedin.com/in/edgarpecson" target="_blank" rel="noopener noreferrer">
            <span className="hamburger-icon">💼</span> LinkedIn
          </a>
          <a href="/resume.pdf" target="_blank" rel="noopener noreferrer">
            <span className="hamburger-icon">📄</span> Download Resume
          </a>
        </nav>
      </div>

      <section id="hero" className="hero">
        <div className="hero-content">
          <h1 className="hero-title-compact">Senior Oracle DBA | AWS Cloud | Full-Stack Development | Automation | AI</h1>
          <p className="hero-subtitle">
            Full-time opportunities | Contract work | Ongoing support for enterprise Oracle systems transitioning to AWS
          </p>

          <div className="live-status-widget">
            <div className="widget-header">
              <span className={`widget-pulse ${liveStatus.isLive ? 'pulse-active' : ''}`}>●</span>
              <span className="widget-title">Live Infrastructure Status</span>
              <span className="widget-update-time">{getTimeSinceUpdate()}</span>
            </div>
            <div className="widget-stats">
              <div className="widget-stat">
                <span className="widget-label">EC2 Instance</span>
                <span className={`widget-value widget-value-${liveStatus.ec2}`}>
                  ● {liveStatus.ec2 === 'checking' ? 'Checking...' : liveStatus.ec2}
                </span>
              </div>
              <div className="widget-stat">
                <span className="widget-label">Oracle Database</span>
                <span className={`widget-value widget-value-${liveStatus.oracle}`}>
                  ● {liveStatus.oracle === 'checking' ? 'Checking...' : liveStatus.oracle}
                </span>
              </div>
              <div className="widget-stat">
                <span className="widget-label">Response Time</span>
                <span className="widget-value widget-value-metric">
                  {liveStatus.responseTime ? `${liveStatus.responseTime}ms` : '--'}
                </span>
              </div>
            </div>
            <button onClick={onNavigateToDemo} className="widget-cta">
              Try Live Controls →
            </button>
          </div>
        </div>
      </section>

      <section id="contact" className="contact-section">
        <div className="contact-options">
          <div className="contact-option">
            <span className="option-icon">🚨</span>
            <h3>Oracle Database Mastery</h3>
            <p>Advanced performance tuning, high-availability architectures, PL/SQL development, large-scale migration projects</p>
            <span className="option-meta">Oracle 19c • PostgreSQL • MongoDB</span>
          </div>

          <div className="contact-option">
            <span className="option-icon">🔍</span>
            <h3>Full-Stack Development</h3>
            <p>End-to-end application building with modern JavaScript ecosystems, integrating robust backends with responsive frontends and efficient data layers</p>
            <span className="option-meta">React + Python FastAPI backend and AWS boto3</span>
          </div>

          <div className="contact-option">
            <span className="option-icon">🎯</span>
            <h3>AI-Leveraged Development & Automation</h3>
            <p>Scripting, code generation, and autonomous agents using leading LLMs</p>
            <span className="option-meta">Claude • Grok • OpenClaw • OpenAI</span>
          </div>
        </div>
      </section>

      <section id="companies" className="companies-section">
  <h2 className="section-title">Companies I've Worked With</h2>
  <div className="companies-grid">
    <div className="company-logo">
      <img 
        src="https://www.amd.com/content/dam/amd/en/logos/amd-logo.svg" 
        alt="AMD" 
        loading="lazy" 
      />
    </div>
    <div className="company-logo">
      <img 
        src="https://www.aecom.com/wp-content/uploads/2023/02/AECOM_logo.svg" 
        alt="AECOM" 
        loading="lazy" 
      />
    </div>
    <div className="company-logo">
      <img 
        src="https://seeklogo.com/images/B/baylor-scott-white-logo-9A8E7E5E5E-seeklogo.com.svg" 
        alt="Baylor Scott & White Health" 
        loading="lazy" 
      />
      {/* Fallback if SVG not loading: <span className="company-text">Baylor Scott & White</span> */}
    </div>
    <div className="company-logo">
      {/* FirstCare logo: Use brand asset or text fallback; no prominent public SVG found */}
      <span className="company-text">FirstCare Health Plans</span>
      {/* Alternative: If you obtain an official SVG, replace with <img src="..." alt="FirstCare Health Plans" loading="lazy" /> */}
    </div>
    <div className="company-logo">
      <img 
        src="https://www.kw.com/images/kw-logo.svg" 
        alt="Keller Williams" 
        loading="lazy" 
      />
    </div>
    <div className="company-logo">
      <img 
        src="https://csvcus.homeaway.com/rsrcs/cdn-logos/2.10.0/sitename/vr-logo-new-2.svg" 
        alt="VRBO" 
        loading="lazy" 
      />
    </div>
    <div className="company-logo">
      <img 
        src="https://upload.wikimedia.org/wikipedia/commons/0/0f/Expedia_Group_logo.svg" 
        alt="Expedia Group" 
        loading="lazy" 
      />
    </div>
    <div className="company-logo">
      <img 
        src="https://www2.deloitte.com/content/dam/assets/logos/deloitte.svg" 
        alt="Deloitte" 
        loading="lazy" 
      />
    </div>
  </div>
</section>

      <footer className="footer">
        <div className="footer-links">
          <a href="mailto:edgar.pecson@gmail.com">edgar.pecson@gmail.com</a>
          <span className="footer-separator">•</span>
          <a href="https://linkedin.com/in/edgarpecson" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <span className="footer-separator">•</span>
          <a href="https://github.com/edgarpecson" target="_blank" rel="noopener noreferrer">GitHub</a>
        </div>
        <p className="footer-copyright">© 2026 Edgar Pecson</p>
      </footer>

      <nav className="mobile-bottom-nav">
        <button className="bottom-nav-item" onClick={() => scrollToSection('hero')}>
          <span className="nav-icon">🏠</span>
          <span className="nav-label">Home</span>
        </button>
        <button className="bottom-nav-item bottom-nav-demo" onClick={onNavigateToDemo}>
          <span className="nav-icon">⚡</span>
          <span className="nav-label">DEMO</span>
          <span className="live-badge">Live</span>
        </button>
        <button className="bottom-nav-item" onClick={() => scrollToSection('contact')}>
          <span className="nav-icon">📧</span>
          <span className="nav-label">Contact</span>
        </button>
      </nav>
    </div>
  );
}

export default HomePage;
