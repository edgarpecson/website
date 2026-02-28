import React from 'react';
import { useScrollReveal } from '../App';

export default function Contact() {
  useScrollReveal();

  return (
    <div className="page-container">
      <div className="page-hero fade-up">
        <p className="section-label">Contact</p>
        <h1>Let's Work<br />Together.</h1>
        <p>
          Open to senior database engineering roles, cloud infrastructure consulting,
          and full-stack projects. I typically reply within 24 hours.
        </p>
      </div>

      <div className="availability-badge fade-up delay-1">
        Available for new opportunities
      </div>

      <div className="contact-grid fade-up delay-2">
        <a
          href="mailto:garth@example.com"
          className="contact-item"
        >
          <div className="contact-item-label">Email</div>
          <div className="contact-item-value">garth@example.com</div>
        </a>

        <a
          href="https://linkedin.com/in/yourname"
          target="_blank"
          rel="noreferrer"
          className="contact-item"
        >
          <div className="contact-item-label">LinkedIn</div>
          <div className="contact-item-value">linkedin.com/in/yourname</div>
        </a>

        <a
          href="https://github.com/edgarpecson"
          target="_blank"
          rel="noreferrer"
          className="contact-item"
        >
          <div className="contact-item-label">GitHub</div>
          <div className="contact-item-value">github.com/edgarpecson</div>
        </a>

        <div className="contact-item" style={{ cursor: 'default' }}>
          <div className="contact-item-label">Location</div>
          <div className="contact-item-value">Austin, Texas · Remote OK</div>
        </div>
      </div>
    </div>
  );
}
