import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { promptService } from '../../services/promptService';
import { getComplexityLabel, getComplexityClass, formatDate } from '../../utils/promptUtils';
import './PromptList.css';

export default function PromptList() {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    promptService
      .getPrompts()
      .then((data) => {
        if (!controller.signal.aborted) {
          setPrompts(Array.isArray(data) ? data : []);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setError('Failed to load prompts. Is the backend running?');
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
  }, []);

  if (loading) {
    return (
      <div className="state-container">
        <div className="spinner" />
        <p>Loading prompts…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="state-container error-state">
        <span className="state-icon">⚠️</span>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="prompt-list-page">
      <div className="page-header">
        <h2>Prompt Library</h2>
        <p className="page-subtitle">
          {prompts.length === 0
            ? 'No prompts yet — be the first to add one!'
            : `${prompts.length} prompt${prompts.length !== 1 ? 's' : ''} saved`}
        </p>
      </div>

      {prompts.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">🎨</span>
          <h3>Your library is empty</h3>
          <p>Start building your collection of AI image prompts.</p>
          <Link to="/add-prompt" className="btn-primary">
            Add Your First Prompt
          </Link>
        </div>
      ) : (
        <div className="prompt-grid">
          {Array.isArray(prompts) &&
            prompts.map((prompt) => (
            <Link
              key={prompt.id}
              to={`/prompts/${prompt.id}`}
              className="prompt-card"
            >
              <div className="card-header">
                <span className={`complexity-badge ${getComplexityClass(prompt.complexity)}`}>
                  {getComplexityLabel(prompt.complexity)} · {prompt.complexity}/10
                </span>
              </div>
              <h3 className="card-title">{prompt.title}</h3>
              <p className="card-date">{formatDate(prompt.created_at)}</p>
              <span className="card-arrow">→</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}