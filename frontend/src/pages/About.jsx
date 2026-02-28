import React from 'react';
import { useScrollReveal } from '../App';

export default function About() {
  useScrollReveal();

  return (
    <div className="page-container">
      <div className="page-hero fade-up">
        <p className="section-label">About</p>
        <h1>Database Engineer.<br />Cloud Builder.</h1>
        <p>
          I'm a database specialist with deep experience in Oracle applications and
          infrastructure, combined with hands-on expertise in AWS automation, Python
          scripting, PL/SQL, and modern full-stack development.
        </p>
      </div>

      <div className="about-grid fade-up delay-1">
        <div className="about-stat">
          <div className="about-stat-number">10+</div>
          <div className="about-stat-label">Years in database engineering</div>
        </div>
        <div className="about-stat">
          <div className="about-stat-number">Oracle</div>
          <div className="about-stat-label">Primary database specialty</div>
        </div>
        <div className="about-stat">
          <div className="about-stat-number">AWS</div>
          <div className="about-stat-label">Cloud infrastructure platform</div>
        </div>
        <div className="about-stat">
          <div className="about-stat-number">Full</div>
          <div className="about-stat-label">Stack capable (React + FastAPI)</div>
        </div>
      </div>

      <div className="about-section fade-up delay-2" style={{ marginTop: '2.5rem' }}>
        <h2>Background</h2>
        <p>
          Based in Austin, Texas, I specialize in designing and maintaining Oracle 19c
          database environments at enterprise scale. My work spans the full lifecycle —
          from architecture and implementation to automation, backup/recovery, and
          performance tuning. I've developed a strong second skillset in AWS cloud
          infrastructure, using EC2, SSM, IAM, and boto3 to automate the systems
          that databases run on.
        </p>
      </div>

      <div className="about-section fade-up delay-3">
        <h2>What I Build</h2>
        <p>
          Beyond pure DBA work, I build the tooling around databases: Python scripts
          for automation, FastAPI backends that expose database operations as APIs,
          and React frontends that make infrastructure visible and controllable. This
          site itself is a live example — the Portfolio page connects to a real Oracle
          19c EC2 instance on AWS.
        </p>
      </div>

      <div className="about-section fade-up delay-4">
        <h2>Currently</h2>
        <p>
          Open to senior database engineering, cloud infrastructure, and full-stack
          roles — particularly where Oracle expertise meets modern cloud automation.
          Remote-first, available for consulting engagements.
        </p>
      </div>
    </div>
  );
}
