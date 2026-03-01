import React from 'react';

function AboutPage({ onNavigateToHome }) {
  return (
    <div className="about-page">
      {/* Animated Background */}
      <div className="bg-grid"></div>
      <div className="bg-gradient"></div>

      {/* Navigation */}
      <nav className="nav">
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

      {/* About Section */}
      <section className="about-full-page">
        <div className="about-container">
          <div className="section-header">
            <h2 className="section-title">About Me</h2>
            <p className="section-subtitle">Senior Database Engineer with a passion for building reliable systems</p>
          </div>

          <div className="about-content">
            <div className="about-text">
              <p className="about-intro">
                I'm Edgar Pecson, a Senior Database Engineer with over 10 years of experience designing, 
                implementing, and maintaining mission-critical database systems at enterprise scale.
              </p>
              
              <p>
                My expertise spans across Oracle Database administration, cloud infrastructure automation, 
                and high-performance data architectures. I specialize in building systems that need to run 
                24/7 with 99.99% uptime while handling millions of transactions per day.
              </p>

              <p>
                Throughout my career, I've worked with Fortune 500 companies and fast-growing startups, 
                helping them scale their database infrastructure from gigabytes to petabytes. I'm passionate 
                about automation, performance optimization, and disaster recovery planning.
              </p>

              <div className="about-highlights">
                <div className="highlight-item">
                  <div className="highlight-icon">🎯</div>
                  <div className="highlight-content">
                    <h4>Mission</h4>
                    <p>Building reliable, scalable database systems that power critical business operations</p>
                  </div>
                </div>

                <div className="highlight-item">
                  <div className="highlight-icon">💡</div>
                  <div className="highlight-content">
                    <h4>Approach</h4>
                    <p>Combining deep technical expertise with automation and modern DevOps practices</p>
                  </div>
                </div>

                <div className="highlight-item">
                  <div className="highlight-icon">🚀</div>
                  <div className="highlight-content">
                    <h4>Focus</h4>
                    <p>Performance tuning, disaster recovery, and infrastructure-as-code for database systems</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>© 2026 Edgar Pecson • Database Engineer • Cloud Architect</p>
      </footer>
    </div>
  );
}

export default AboutPage;
