import { useApp } from '../state/AppContext';
import './DevBanners.css';

export default function DevTopBanner() {
  const { user, settings } = useApp();

  return (
    <div className="dev-top-banner">
      <div className="dev-banner-content">
        <span className="dev-badge">DEV MODE</span>
        <span className="dev-info">
          User: {user?.user_id || 'none'} • Timer: {settings.task_timer_enabled ? 'ON' : 'OFF'} ({settings.task_timer_duration}s) • Negative Feedback: {settings.stress_negative_feedback_enabled ? 'ON' : 'OFF'}
        </span>
      </div>
    </div>
  );
}
