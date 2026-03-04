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
            <span className="hamburger-icon">📄</span> Download Resume (coming soon)
          </a>
        </nav>
      </div>

      {/* About Section */}
      <section className="about-full-page">
        <div className="about-container">
          <div className="section-header">
            <h2 className="section-title">About Me</h2>
            <p className="section-subtitle">30+ years evolving from reel-to-reel backups to AI automation</p>
          </div>

          <div className="about-picture-placeholder">
            <div className="picture-frame">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M6 21C6 17.134 8.68629 14 12 14C15.3137 14 18 17.134 18 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
          </div>

          <div className="about-content">
            <div className="about-text">
              <p className="about-intro">
                Welcome to My AI + AWS Laboratory
              </p>
              
              <p>
               This website is my passion project—a dedicated laboratory for creative experimentation and hands-on exploration of modern full-stack technologies. Here, I actively test and refine techniques in React to build responsive, interactive interfaces; Python for backend scripting, automation, and orchestration; and AWS APIs and services for cloud infrastructure, compute, storage, and seamless integration. 
              </p>

              <p>
                A central focus is the creation and management of real-world databases—particularly Oracle instances deployed in production-like environments on AWS EC2—allowing me to simulate realistic data scenarios, performance tuning, and operational workflows. Most importantly, the site enables direct, live control of these databases from the browser, providing a tangible demonstration of end-to-end connectivity, security considerations, and practical application. 

              <p>
                Every element you see here, much of it shaped and refined with AI assistance, represents an ongoing effort to push technical boundaries and explore what is possible when these tools are combined in creative ways. I hope these experiments inspire you to pursue the same sense of curiosity and possibilities!
              </p>
              </p>

          
              <p className="about-closer">
                Want to see my work in action? The live demo on this site is actually controlling a real 
                Oracle 19c database on AWS EC2. If that doesn't prove I know what I'm doing, I don't know what will.
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
