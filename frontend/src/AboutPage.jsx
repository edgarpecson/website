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
            <p className="section-subtitle">Welcome to My AI + AWS Laboratory</p>
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
                
              </p>
              
              <p>
               This site is basically my Lab — a place where I get to mess around with the latest AI stuff and see how it actually works when I plug it into real tools I already use every day. I’m having fun building React interfaces that feel smooth and responsive, writing Python scripts to handle the behind-the-scenes work, hooking everything up to AWS so I can spin up servers, storage, and APIs without much hassle, and — the part I enjoy most — creating actual Oracle databases that run in a real cloud environment and then controlling them straight from the webpage. A lot of the code here gets started or cleaned up with help from AI models, and I love experimenting with how far I can push them while still keeping things practical and useful. It’s not super polished or corporate; it’s just me testing ideas, breaking things, fixing them, and figuring out what’s possible when you mix current tech with the newest AI tricks.  I hope this site inspires you to do the same!
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
