import React from 'react';
import { Link } from 'react-router-dom';

export default function End(){
  return (
    <div className="page-container">
      <div className="page-card">
        <div className="content-header">
          <h2>Dziękujemy</h2>
          <p className="subtitle">Badanie zostało ukończone</p>
        </div>

        <div className="content-body">
          <div className="end-content">
            <p>Twoje odpowiedzi zostały zapisane i będą wykorzystane do analizy badawczej.</p>
            <p>Dziękujemy za udział w badaniu dotyczącym wpływu stresu na decyzje cyberbezpieczeństwa.</p>
            <div className="end-actions">
              <Link to="/" className="btn-secondary">Powrót do strony głównej</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
