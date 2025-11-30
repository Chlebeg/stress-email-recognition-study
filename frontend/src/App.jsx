import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Login from './pages/Login';
import CISSIntro from './pages/CISSIntro';
import CISS from './pages/CISS';
import PhishingIntro from './pages/PhishingIntro';
import Phishing from './pages/Phishing';
import Summary from './pages/Summary';
import End from './pages/End';
import DataDownload from './pages/DataDownload';
import { useApp } from './state/AppContext';

export default function App() {
  const { settings } = useApp();

  return (
    <div className="app">
      <header className="header">
        <h1>MVP — Badanie: stres &amp; decyzje cyber</h1>
        <div className="small">Timer aktywny: {settings.stress_timer_enabled ? 'TAK' : 'NIE'} • Długość: {settings.stress_timer_duration}s</div>
      </header>

      <main className="main">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/ciss-intro" element={<CISSIntro />} />
          <Route path="/ciss" element={<CISS />} />
          <Route path="/phishing-intro" element={<PhishingIntro />} />
          <Route path="/phishing" element={<Phishing />} />
          <Route path="/summary" element={<Summary />} />
          <Route path="/end" element={<End />} />
          <Route path="/download" element={<DataDownload />} />
        </Routes>
      </main>

      <footer className="footer">
        <Link to="/">Logowanie</Link> — <Link to="/ciss-intro">CISS</Link> — <Link to="/phishing-intro">Phishing</Link> — <Link to="/summary">Podsumowanie</Link> — <Link to="/download">Pobierz dane</Link>
      </footer>
    </div>
  );
}
