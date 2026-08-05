import React from 'react';
import type { Translation } from '../locals/types.js';

interface HeaderProps {
  lang: 'EN' | 'JP';
  setLang: (lang: 'EN' | 'JP') => void;
  t: Translation;
}

export const Header: React.FC<HeaderProps> = ({ lang, setLang, t }) => {
  return (
    <header className="header-container">
      {/* 1. TOP BAR: Language Switcher & Login */}
      <div className="top-bar">
        <div className="top-bar-right">
          <div className="lang-switcher">
            <button 
              className={lang === 'JP' ? 'active-lang' : ''} 
              onClick={() => setLang('JP')}
            >
              日本語
            </button> 
            <span className="divider">|</span>
            <button 
              className={lang === 'EN' ? 'active-lang' : ''} 
              onClick={() => setLang('EN')}
            >
              English
            </button>
          </div>
          <a href="#login" className="login-link">
            {t.topBar.login}
          </a>
        </div>
      </div>

      {/* 2. MAIN NAVIGATION */}
      <nav className="main-nav">
        <ul>
          <li><a href="/">{t.nav.home}</a></li>
          <li><a href="/user/properties">{t.nav.properties}</a></li>
          <li><a href="/services">{t.nav.services}</a></li>
          <li><a href="/contacts">{t.nav.contacts}</a></li>
          <li><a href="/about">{t.nav.about}</a></li>
        </ul>
      </nav>
    </header>
  );
};