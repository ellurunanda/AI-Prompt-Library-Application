import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { promptService } from '../../services/promptService';
import { getComplexityLabel, getComplexityClass, formatDate } from '../../utils/promptUtils';
import './PromptDetail.css';

export default function PromptDetail() {
  const { id } = useParams();
  const [prompt, setPrompt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    setPrompt(null);
    setError(null);
    setLoading(true);

    const controller = new AbortController();

    promptService
      .getPrompt(Number(id))
      .then((data) => {
        if (!controller.signal.aborted) {
          setPrompt(data);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setError('Prompt not found or backend is unavailable.');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [id]);

  if (loading) {
    return (
      <div className="state-container">
        <div className="spinner" />
        <p>Loading prompt…</p>
      </div>
    );
  }

  if (error || !prompt) {
    return (
      <div className="state-container error-state">
        <span className="state-icon">⚠️</span>
        <p>{error ?? 'Prompt not found.'}</p>
        <Link to="/prompts" className="btn-back">← Back to Library</Link>
      </div>
    );
  }

  return (
    <div className="prompt-detail-page">
      <Link to="/prompts" className="back-link">← Back to Library</Link>

      <div className="detail-card">
        <div className="detail-header">
          <div className="detail-meta">
            <span className={`complexity-badge ${getComplexityClass(prompt.complexity)}`}>
              {getComplexityLabel(prompt.complexity)} · {prompt.complexity}/10
            </span>
            <span className="detail-date">{formatDate(prompt.created_at, true)}</span>
          </div>
          <h2 className="detail-title">{prompt.title}</h2>
        </div>

        <div className="detail-body">
          <h3 className="section-label">Prompt Content</h3>
          <div className="content-box">
            <p>{prompt.content}</p>
          </div>
        </div>

        <div className="detail-footer">
          <div className="view-counter">
            <span className="view-icon">👁</span>
            <div>
              <span className="view-count">{prompt.view_count ?? 0}</span>
              <span className="view-label">
                {(prompt.view_count ?? 0) === 1 ? 'view' : 'views'}
              </span>
            </div>
          </div>
          <p className="view-note">
            View count is tracked in real-time via Redis and increments on each page load.
          </p>
        </div>
      </div>
    </div>
  );
}