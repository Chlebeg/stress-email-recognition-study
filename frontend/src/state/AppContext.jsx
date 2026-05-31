import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
  // Global application settings
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState({
    task_timer_enabled: true,
    task_timer_duration: 60, // seconds
    stress_negative_feedback_enabled: true
  });

  // Temporary answer collections
  const [cissAnswers, setCissAnswers] = useState({}); // {questionId: answer, ...}
  const [phishingAnswers, setPhishingAnswers] = useState([]); // per-task objects
  const [summary, setSummary] = useState({});

  return (
    <AppContext.Provider value={{
      user, setUser,
      settings, setSettings,
      cissAnswers, setCissAnswers,
      phishingAnswers, setPhishingAnswers,
      summary, setSummary
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
