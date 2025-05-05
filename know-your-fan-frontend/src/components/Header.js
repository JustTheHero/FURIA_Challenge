import React from 'react';
import './Header.css';
import furiaLogo from './Furia.png';

function Header({ onLoginClick }) {
  return (
    <header className="app-header">
      <div className="logo-container">
        <img src={furiaLogo} alt="Know Your Fan Logo" className="logo" />
      </div>
      <h1 className="app-title">Know Your Fan</h1>
      <nav className="main-nav">
        <ul>
          <li><a href="#">Home</a></li>
          <li><a href="#">Sobre</a></li>
          <li><a href="#">Contato</a></li>
          <li>
            <a 
              href="#" 
              className="btn-login" 
              onClick={(e) => {
                e.preventDefault();
                onLoginClick();
              }}
            >
              Login
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;