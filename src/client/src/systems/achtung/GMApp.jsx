// src/client/src/systems/achtung/GMApp.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Contrat plateforme :
//   activeSession     — session active ou null
//   onSessionChange   — callback(session)
//   onlineCharacters  — tableau de présences
//   darkMode          — booléen
//   onToggleDarkMode  — callback

import React from 'react';
import './theme.css';
import GMView from './gm/GMView.jsx';

// Le mode nuit passe par [data-theme] sur <html> (posé par la plateforme), plus par une classe .dark
const GMApp = ({ activeSession, onSessionChange, onlineCharacters, darkMode, onToggleDarkMode }) => (
    <div>
        <GMView
            activeSession={activeSession}
            onSessionChange={onSessionChange}
            onlineCharacters={onlineCharacters}
            darkMode={darkMode}
            onToggleDarkMode={onToggleDarkMode}
        />
    </div>
);

export default GMApp;