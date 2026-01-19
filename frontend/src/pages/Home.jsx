import React from 'react';

export default function Home({ handleRMAN, isLoadingRMAN, output }) {
  return (
    <section className="hero">
      <div className="hero-grid">
        <div className="hero-text">
          <p>Austin, Texas</p>
          <h1>Senior Database Engineer</h1>
          <p className="skills">
            AWS • Oracle • Python  • React • Node.js • 
          </p>
          <p className="description">
            Deep expertise in Oracle applications and databases combined with hands-on experience automating reliable systems across AWS services, Postgres, MongoDB, Amazon RDS, PL/SQL, Python/shell scripting, and full-stack web development with React/Node.js/FastAPI.
          </p>
          <div className="cta-buttons">
            <button
              className="cta-primary"
              onClick={handleRMAN}
              disabled={isLoadingRMAN}
            >
              {isLoadingRMAN ? 'Running...' : 'Run RMAN Demo'}
            </button>
            <button className="cta-secondary">View Projects</button>
          </div>
          {output && <div className="output-box">{output}</div>}
        </div>

        <div>
          <img
            src="/profile.jpg"
            alt="Edgar Pecson"
            className="profile-img"
          />
        </div>
      </div>
    </section>
  );
}