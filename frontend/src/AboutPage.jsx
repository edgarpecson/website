import React from 'react';

function AboutPage({ onNavigateToHome }) {
  return (
    <div className="about-page">
      {/* Animated Background */}
      <div className="bg-grid"></div>
      <div className="bg-gradient"></div>

      {/* Desktop Navigation */}
      <nav className="nav desktop-nav">
        <div className="nav-logo">
          <span className="logo-bracket">{'<'}</span>
          <span className="logo-name">Edgar Pecson</span>
          <span className="logo-bracket">{'/>'}</span>
        </div>
        <div className="nav-links">
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToHome('home'); }}>Home</a>
          <a href="#" className="active">About</a>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToHome('expertise'); }}>Expertise</a>
          <button onClick={() => onNavigateToHome('demo')} className="nav-demo-btn">
            Live Demo
          </button>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToHome('contact'); }}>Contact</a>
        </div>
      </nav>

      {/* Mobile Top Bar */}
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

      {/* Hamburger Menu Overlay */}
      <div className="hamburger-menu">
        <button className="hamburger-close" onClick={() => {
          document.querySelector('.hamburger-menu')?.classList.remove('open');
        }}>
          ✕
        </button>
        <nav className="hamburger-nav">
          <a href="#" onClick={(e) => { 
            e.preventDefault(); 
            onNavigateToHome('home'); 
            document.querySelector('.hamburger-menu')?.classList.remove('open');
          }}>Home</a>
          <a href="#" onClick={(e) => { 
            e.preventDefault(); 
            onNavigateToHome('expertise'); 
            document.querySelector('.hamburger-menu')?.classList.remove('open');
          }}>Expertise</a>
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

      {/* About Section */}
      <section className="about-full-page">
        <div className="about-container">
          <div className="section-header">
            <h2 className="section-title">About Me</h2>
            <p className="section-subtitle">How one mistake at 3 AM turned into a 10-year career</p>
          </div>

          <div className="about-content">
            <div className="about-text">
              <p className="about-intro">
                I crashed a production database at 3:47 AM on a Tuesday. That's how I became a database engineer.
              </p>
              
              <p>
                I was a junior developer at a startup, running what I thought was a harmless UPDATE query. 
                Forgot the WHERE clause. 8 million rows updated. Website went down. CEO called at 4 AM. 
                I spent the next 6 hours learning everything about Oracle RMAN backups and point-in-time recovery.
              </p>

              <p>
                That was 10 years ago. Since then, I've prevented that exact scenario from happening to dozens 
                of companies. I've architected systems managing 5+ petabytes of data for Fortune 500 companies 
                and fast-growing startups. Oracle, PostgreSQL, MySQL, AWS RDS — if it stores data at scale, 
                I've probably broken it, fixed it, and optimized it.
              </p>

              <p>
                These days, I specialize in the problems that wake CTOs up at night: zero-downtime migrations, 
                disaster recovery planning, and making databases run so well that nobody thinks about them. 
                Because the best database is the one you never worry about.
              </p>

              <div className="about-highlights">
                <div className="highlight-item">
                  <div className="highlight-icon">🎯</div>
                  <div className="highlight-content">
                    <h4>What Drives Me</h4>
                    <p>Building systems so reliable that 3 AM pages become rare events, not regular occurrences</p>
                  </div>
                </div>

                <div className="highlight-item">
                  <div className="highlight-icon">💡</div>
                  <div className="highlight-content">
                    <h4>My Approach</h4>
                    <p>Automate everything, monitor obsessively, and plan for failure before it happens</p>
                  </div>
                </div>

                <div className="highlight-item">
                  <div className="highlight-icon">🚀</div>
                  <div className="highlight-content">
                    <h4>What I'm Best At</h4>
                    <p>Turning "our database is too slow" into "wait, did we just handle Black Friday traffic?"</p>
                  </div>
                </div>
              </div>

              <p className="about-closer">
                Want to know if I can help with your database challenges? The live demo on this site is 
                actually controlling a real Oracle database on AWS. If that doesn't prove I know what I'm 
                doing, I don't know what will.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>© 2026 Edgar Pecson • Database Engineer • Cloud Architect</p>
      </footer>

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-bottom-nav">
        <button className="bottom-nav-item" onClick={() => onNavigateToHome('home')}>
          <span className="nav-icon">🏠</span>
          <span className="nav-label">Home</span>
        </button>
        <button className="bottom-nav-item bottom-nav-demo" onClick={() => onNavigateToHome('demo')}>
          <span className="nav-icon">⚡</span>
          <span className="nav-label">DEMO</span>
          <span className="live-badge">Live</span>
        </button>
        <button className="bottom-nav-item" onClick={() => onNavigateToHome('contact')}>
          <span className="nav-icon">📧</span>
          <span className="nav-label">Contact</span>
        </button>
      </nav>
    </div>
  );
}

export default AboutPage;
