import React from 'react';
import './Footer.css';

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <span>Task Manager · v1.0</span>
      <span>© Ugochukwu Emmanuel - {year}. All rights reserved</span>
    </footer>
  );
}

export default Footer;