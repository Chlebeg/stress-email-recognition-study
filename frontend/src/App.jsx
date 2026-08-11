import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import PreExperiment from './pages/PreExperiment';
import CISSIntro from './pages/CISSIntro';
import CISS from './pages/CISS';
import TasksIntro from './pages/TasksIntro';
import Tasks from './pages/Tasks';
import Summary from './pages/Summary';
import End from './pages/End';

const isDev = import.meta.env.MODE === 'development';
const DataDownload = isDev ? lazy(() => import('./pages/DataDownload')) : null;

export default function App() {

  return (
    <div className="app">
      <main className="main">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/pre-experiment" element={<PreExperiment />} />
          <Route path="/ciss-intro" element={<CISSIntro />} />
          <Route path="/ciss" element={<CISS />} />
          <Route path="/email-tasks-intro" element={<TasksIntro />} />
          <Route path="/email-tasks" element={<Tasks />} />
          <Route path="/summary" element={<Summary />} />
          <Route path="/end" element={<End />} />
          {isDev && DataDownload && (
            <Route path="/download" element={<Suspense fallback={null}><DataDownload /></Suspense>} />
          )}
        </Routes>
      </main>

      <footer className="footer">
        <p>© Chlebeg 2026</p>
      </footer>
    </div>
  );
}
