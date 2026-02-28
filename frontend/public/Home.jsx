import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useScrollReveal } from '../App';

export default function Home({ handleRMAN, isLoadingRMAN, output }) {
  useScrollReveal();

  return (
    <>
      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-grid">
          {/* Text */}
          <div className="hero-text">
            <div className="hero-eyebrow fade-up">Austin, Texas · Open to remote</div>

            <h1 className="fade-up delay-1">
              Senior<br />
              <span className="highlight">Database</span><br />
              Engineer
            </h1>

            <p className="hero-tagline fade-up delay-2">
              Oracle<span>·</span>AWS<span>·</span>Python<span>·</span>React<span>·</span>FastAPI
            </p>

            <p className="hero-description fade-up delay-3">
              Deep expertise in Oracle 19c and cloud database infrastructure,
              combined with hands-on AWS automation, PL/SQL, Python scripting,
              and full-stack development with React and FastAPI.
            </p>

            <div className="cta-buttons fade-up delay-4">
              <button
                className="cta-primary"
                onClick={handleRMAN}
                disabled={isLoadingRMAN}
              >
                {isLoadingRMAN ? '⏳ Running…' : '▶ Run RMAN Demo'}
              </button>
              <Link to="/portfolio">
                <button className="cta-secondary">View Projects →</button>
              </Link>
            </div>

            {output && (
              <div className="output-box fade-up">
                {output}
              </div>
            )}
          </div>

          {/* Profile image */}
          <div className="profile-wrap fade-up delay-2">
            <img
              src="/profile.jpg"
              alt="Edgar Pecson"
              className="profile-img"
            />
          </div>
        </div>
      </section>

      {/* ── Skills / Tech Stack ── */}
      <section className="skills-section">
        <p className="section-label fade-up">Technical Expertise</p>
        <h2 className="section-title fade-up delay-1">What I Work With</h2>

        <div className="skills-grid">
          <div className="skill-card fade-up delay-1">
            <div className="skill-card-icon">🗄️</div>
            <div className="skill-card-title">Database Engineering</div>
            <div className="skill-card-tags">
              <span className="skill-tag">Oracle 19c</span>
              <span className="skill-tag">PL/SQL</span>
              <span className="skill-tag">PostgreSQL</span>
              <span className="skill-tag">MongoDB</span>
              <span className="skill-tag">Amazon RDS</span>
              <span className="skill-tag">RMAN</span>
            </div>
          </div>

          <div className="skill-card fade-up delay-2">
            <div className="skill-card-icon">☁️</div>
            <div className="skill-card-title">AWS Cloud Infrastructure</div>
            <div className="skill-card-tags">
              <span className="skill-tag">EC2</span>
              <span className="skill-tag">SSM</span>
              <span className="skill-tag">boto3</span>
              <span className="skill-tag">IAM</span>
              <span className="skill-tag">RDS</span>
              <span className="skill-tag">S3</span>
            </div>
          </div>

          <div className="skill-card fade-up delay-3">
            <div className="skill-card-icon">🐍</div>
            <div className="skill-card-title">Backend & Scripting</div>
            <div className="skill-card-tags">
              <span className="skill-tag">Python</span>
              <span className="skill-tag">FastAPI</span>
              <span className="skill-tag">Shell</span>
              <span className="skill-tag">PL/SQL</span>
              <span className="skill-tag">REST APIs</span>
            </div>
          </div>

          <div className="skill-card fade-up delay-4">
            <div className="skill-card-icon">⚛️</div>
            <div className="skill-card-title">Full-Stack Development</div>
            <div className="skill-card-tags">
              <span className="skill-tag">React</span>
              <span className="skill-tag">Node.js</span>
              <span className="skill-tag">Vite</span>
              <span className="skill-tag">CSS</span>
              <span className="skill-tag">HTML</span>
            </div>
          </div>

          <div className="skill-card fade-up delay-5">
            <div className="skill-card-icon">🔒</div>
            <div className="skill-card-title">DB Ops & Recovery</div>
            <div className="skill-card-tags">
              <span className="skill-tag">RMAN Backup</span>
              <span className="skill-tag">DBA Ops</span>
              <span className="skill-tag">Performance Tuning</span>
              <span className="skill-tag">Migration</span>
            </div>
          </div>

          <div className="skill-card fade-up delay-6">
            <div className="skill-card-icon">🚀</div>
            <div className="skill-card-title">DevOps & Deployment</div>
            <div className="skill-card-tags">
              <span className="skill-tag">Render</span>
              <span className="skill-tag">Git</span>
              <span className="skill-tag">GitHub Actions</span>
              <span className="skill-tag">Docker</span>
              <span className="skill-tag">Linux</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
