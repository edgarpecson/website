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
            Building Scalable
            <span className="hero-gradient"> Database Systems</span>
            <br />
            At Enterprise Scale
          </h1>
          <p className="hero-desc">
            Specializing in Oracle, PostgreSQL, AWS infrastructure automation, and high-performance data architectures.
            Proven track record of managing petabyte-scale databases with 99.99% uptime.
          </p>
          <div className="hero-cta">
            <button onClick={onNavigateToDemo} className="btn btn-primary">
              Launch Live Demo →
            </button>
            <a href="#expertise" className="btn btn-secondary">
              View Expertise
            </a>
          </div>
          
          {/* Tech Stats */}
          <div className="tech-stats">
            <div className="stat">
              <div className="stat-value">10+</div>
              <div className="stat-label">Years Experience</div>
            </div>
            <div className="stat">
              <div className="stat-value">99.99%</div>
              <div className="stat-label">Uptime Achieved</div>
            </div>
            <div className="stat">
              <div className="stat-value">5PB+</div>
              <div className="stat-label">Data Managed</div>
            </div>
          </div>
        </div>
      </section>

      {/* Expertise Section - SINGLE ROW */}
      <section id="expertise" className="expertise">
        <div className="section-header">
          <h2 className="section-title">Core Competencies</h2>
          <p className="section-subtitle">Architecting mission-critical database infrastructure</p>
        </div>

        <div className="expertise-row">
          <div className="expertise-card">
            <div className="card-icon">🗄️</div>
            <h3>Database Architecture</h3>
            <p>
              Enterprise-grade Oracle RAC clusters handling 50K+ TPS. Expert in data modeling, 
              partitioning, and performance tuning.
            </p>
            <div className="tech-tags">
              <span>Oracle 19c</span>
              <span>PostgreSQL</span>
              <span>MySQL</span>
            </div>
          </div>

          <div className="expertise-card">
            <div className="card-icon">☁️</div>
            <h3>Cloud Infrastructure</h3>
            <p>
              Automated AWS infrastructure with Terraform and Python. Managed RDS, EC2, S3. 
              Reduced costs by 40% through optimization.
            </p>
            <div className="tech-tags">
              <span>AWS</span>
              <span>Terraform</span>
              <span>Docker</span>
            </div>
          </div>

          <div className="expertise-card">
            <div className="card-icon">⚡</div>
            <h3>Performance Engineering</h3>
            <p>
              Optimized query performance achieving 10x improvements. Implemented caching, 
              connection pooling, and read replicas.
            </p>
            <div className="tech-tags">
              <span>Redis</span>
              <span>Query Tuning</span>
              <span>Indexing</span>
            </div>
          </div>

          <div className="expertise-card">
            <div className="card-icon">🔐</div>
            <h3>Backup & Recovery</h3>
            <p>
              Architected RMAN backup strategies with cross-region replication. 
              RPO &lt; 5 min, RTO &lt; 15 min for critical systems.
            </p>
            <div className="tech-tags">
              <span>RMAN</span>
              <span>PITR</span>
              <span>DR Planning</span>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact">
        <div className="contact-content">
          <h2>Let's Build Something Scalable</h2>
          <p>
            Available for consulting, contract work, and full-time opportunities in database engineering
            and cloud infrastructure roles.
          </p>
          <div className="contact-links">
            <a href="mailto:edgar.pecson@example.com" className="contact-link">
              <span className="link-icon">📧</span>
              edgar.pecson@example.com
            </a>
            <a href="https://linkedin.com/in/edgarpecson" target="_blank" rel="noopener noreferrer" className="contact-link">
              <span className="link-icon">💼</span>
              LinkedIn
            </a>
            <a href="https://github.com/edgarpecson" target="_blank" rel="noopener noreferrer" className="contact-link">
              <span className="link-icon">🐙</span>
              GitHub
            </a>
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
