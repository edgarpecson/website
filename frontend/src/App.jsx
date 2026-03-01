import React, { useState } from 'react';
import HomePage from './HomePage';
import AboutPage from './AboutPage';
import DemoPage from './DemoPage';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [scrollTarget, setScrollTarget] = useState(null);

  const navigateToDemo = () => {
    setCurrentPage('demo');
  };

  const navigateToAbout = () => {
    setCurrentPage('about');
  };

  const navigateToHome = (target = 'home') => {
    setCurrentPage('home');
    setScrollTarget(target);
    
    // Scroll to section after navigation
    if (target !== 'home' && target !== 'demo') {
      setTimeout(() => {
        const element = document.getElementById(target);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  return (
    <div className="app">
      {currentPage === 'home' && (
        <HomePage 
          onNavigateToDemo={navigateToDemo} 
          onNavigateToAbout={navigateToAbout}
        />
      )}
      {currentPage === 'about' && (
        <AboutPage onNavigateToHome={navigateToHome} />
      )}
      {currentPage === 'demo' && (
        <DemoPage onNavigateToHome={navigateToHome} />
      )}
    </div>
  );
}

export default App;
