import { Link } from 'react-router-dom';
import './DevBanners.css';

export default function DevBottomBanner() {
  const links = [
    { path: '/', label: 'Login' },
    { path: '/pre-experiment', label: 'Pre-experiment' },
    { path: '/ciss-intro', label: 'CISS Intro' },
    { path: '/ciss', label: 'CISS' },
    { path: '/email-tasks-intro', label: 'Email Tasks Intro' },
    { path: '/email-tasks', label: 'Email Tasks' },
    { path: '/summary', label: 'Summary' },
    { path: '/end', label: 'End' },
    { path: '/download', label: 'Download' }
  ];

  return (
    <div className="dev-bottom-banner">
      <div className="dev-banner-content">
        <span className="dev-badge">DEV LINKS</span>
        <div className="dev-links">
          {links.map(link => (
            <Link key={link.path} to={link.path} className="dev-link">
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
