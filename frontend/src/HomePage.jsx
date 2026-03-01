import React from 'react';

function HomePage({ onNavigateToDemo, onNavigateToAbout }) {
  return (
    <div className="home-page">
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
          <a href="#hero">Home</a>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToAbout(); }}>About</a>
          <a href="#expertise">Expertise</a>
          <button onClick={onNavigateToDemo} className="nav-demo-btn">
            Live Demo
          </button>
          <a href="#contact">Contact</a>
        </div>
      </nav>

      {/* Hero Section - Centered */}
      <section id="hero" className="hero">
        <div className="hero-content-centered">
          <div className="hero-label">Database Engineer • Cloud Architect</div>
          <h1 className="hero-title">
            I Keep 5PB of Data
            <span className="hero-gradient"> Running</span>
            <br />
            While You Sleep
          </h1>
          <p className="hero-desc">
            Most companies lose six figures when their database crashes at 3 AM. I've architected systems 
            that haven't gone down in 3 years. Oracle RAC, PostgreSQL, AWS infrastructure — 99.99% uptime 
            isn't luck. It's engineering.
          </p>
          <div className="hero-cta">
            <button onClick={onNavigateToDemo} className="btn btn-primary">
              See Live Infrastructure →
            </button>
            <a href="#contact" className="btn btn-secondary">
              Let's Talk
            </a>
          </div>
          
          {/* Live Status Widget - Mini Preview */}
          <div className="live-status-widget">
            <div className="widget-header">
              <span className="widget-pulse">●</span>
              <span className="widget-title">Live Infrastructure Status</span>
            </div>
            <div className="widget-stats">
              <div className="widget-stat">
                <span className="widget-label">EC2 Instance</span>
                <span className="widget-value">● Active</span>
              </div>
              <div className="widget-stat">
                <span className="widget-label">Oracle Database</span>
                <span className="widget-value">● Running</span>
              </div>
              <div className="widget-stat">
                <span className="widget-label">Uptime</span>
                <span className="widget-value">99.99%</span>
              </div>
            </div>
            <button onClick={onNavigateToDemo} className="widget-cta">
              Try Live Controls →
            </button>
          </div>
        </div>
      </section>

      {/* Expertise Section - SINGLE ROW */}
      <section id="expertise" className="expertise">
        <div className="section-header">
          <h2 className="section-title">How I've Saved Companies from Disaster</h2>
          <p className="section-subtitle">Real problems solved, real metrics achieved</p>
        </div>

        <div className="expertise-row">
          <div className="expertise-card">
            <div className="card-icon">🗄️</div>
            <h3>Zero-Downtime Migration</h3>
            <p>
              Migrated 2.3TB Oracle database serving 10M users with zero downtime. They never knew it happened. 
              Planned the cutover for 18 months, executed in 4 hours on a Sunday morning.
            </p>
            <div className="tech-tags">
              <span>Oracle RAC</span>
              <span>Data Guard</span>
              <span>Golden Gate</span>
            </div>
          </div>

          <div className="expertise-card">
            <div className="card-icon">💰</div>
            <h3>$240K Cost Reduction</h3>
            <p>
              Found one misconfigured index causing full table scans. Fixed it in 20 minutes. 
              Reduced RDS costs by 40% annually. ROI of that consulting day: 12,000%.
            </p>
            <div className="tech-tags">
              <span>Query Tuning</span>
              <span>AWS RDS</span>
              <span>Performance</span>
            </div>
          </div>

          <div className="expertise-card">
            <div className="card-icon">🚨</div>
            <h3>3 AM Production Recovery</h3>
            <p>
              Database corruption at 2:47 AM. 50K transactions/sec at risk. Recovered from RMAN backup, 
              applied archived redo logs, and had system running by 3:32 AM. Total downtime: 45 minutes.
            </p>
            <div className="tech-tags">
              <span>RMAN</span>
              <span>PITR</span>
              <span>Disaster Recovery</span>
            </div>
          </div>

          <div className="expertise-card">
            <div className="card-icon">⚡</div>
            <h3>10x Performance Improvement</h3>
            <p>
              Query running 8 minutes was killing checkout flow. Rewrote it with proper indexing and 
              partitioning. New time: 0.4 seconds. Customer conversion rate jumped 23%.
            </p>
            <div className="tech-tags">
              <span>SQL Tuning</span>
              <span>Indexing</span>
              <span>Partitioning</span>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact">
        <div className="contact-content">
          <h2>Three Ways to Work Together</h2>
          <p className="contact-intro">
            Whether your database crashed at 3 AM or you're planning infrastructure for your next 10x growth, 
            here's how we can work together:
          </p>
          
          <div className="contact-options">
            <div className="contact-option">
              <div className="option-icon">🚨</div>
              <h3>Emergency Database Recovery</h3>
              <p>Production down? Data corrupted? I respond within 24 hours. Emergency consulting for critical database failures and performance issues.</p>
              <div className="option-meta">24-hour response • Fixed-rate engagement</div>
            </div>

            <div className="contact-option">
              <div className="option-icon">🔍</div>
              <h3>Infrastructure Audit</h3>
              <p>2-week deep dive into your database infrastructure. I'll find the bottlenecks, security gaps, and cost savings you're missing.</p>
              <div className="option-meta">2-week engagement • Detailed report + recommendations</div>
            </div>

            <div className="contact-option">
              <div className="option-icon">🚀</div>
              <h3>Full-Time Role</h3>
              <p>Building something massive? Need someone who can architect petabyte-scale systems? Let's talk about senior database/infrastructure engineering roles.</p>
              <div className="option-meta">Remote or hybrid • Senior IC or Lead roles</div>
            </div>
          </div>

          <div className="contact-cta-section">
            <p className="contact-cta-text">Ready to talk? Pick your preferred method:</p>
            <div className="contact-links">
              <a href="mailto:edgar.pecson@example.com" className="contact-link contact-link-primary">
                <span className="link-icon">📧</span>
                <span className="link-text">
                  <span className="link-title">Email Me</span>
                  <span className="link-subtitle">edgar.pecson@example.com</span>
                </span>
              </a>
              <a href="https://linkedin.com/in/edgarpecson" target="_blank" rel="noopener noreferrer" className="contact-link">
                <span className="link-icon">💼</span>
                <span className="link-text">
                  <span className="link-title">LinkedIn</span>
                  <span className="link-subtitle">Connect professionally</span>
                </span>
              </a>
              <a href="https://github.com/edgarpecson" target="_blank" rel="noopener noreferrer" className="contact-link">
                <span className="link-icon">🐙</span>
                <span className="link-text">
                  <span className="link-title">GitHub</span>
                  <span className="link-subtitle">See my code</span>
                </span>
              </a>
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

export default HomePage;
