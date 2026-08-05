import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { translations } from './locals';
import './App.css';

function App() {
  // 1. Initialize state from localStorage. 
  // If nothing is saved, it defaults to 'JP'
  const [lang, setLang] = useState<'EN' | 'JP'>(() => {
    const savedLang = localStorage.getItem('app_lang');
    return (savedLang === 'EN' || savedLang === 'JP') ? savedLang : 'JP';
  });

  // 2. The "Translation" object for the current language
  const t = translations[lang];

  // 3. Update localStorage whenever the language changes
  useEffect(() => {
    localStorage.setItem('app_lang', lang);
    // Optional: Update the document language attribute for SEO/Accessibility
    document.documentElement.lang = lang.toLowerCase();
  }, [lang]);

  return (
    <div className="site-wrapper">
      {/* Passing state and the setter function to the Header */}
      <Header lang={lang} setLang={setLang} t={t} />
      
      <main className="main-content">
        <section className="hero">
          <div className="container">
            <h1>{t.hero.title}</h1>
            <p className="hero-description">
              {t.hero.description}
            </p>
            {/* You can add more data sections here later */}
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container">
          <p>{t.footer.rights}</p>
        </div>
      </footer>
    </div>
  );
}

export default App;