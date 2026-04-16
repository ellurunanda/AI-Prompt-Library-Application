import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { promptService } from '../../services/promptService';
import './AddPrompt.css';

function validate(form) {
  const errors = {};
  if (!form.title.trim()) {
    errors.title = 'Title is required.';
  } else if (form.title.trim().length < 3) {
    errors.title = 'Title must be at least 3 characters.';
  }
  if (!form.content.trim()) {
    errors.content = 'Content is required.';
  } else if (form.content.trim().length < 20) {
    errors.content = 'Content must be at least 20 characters.';
  }
  if (form.complexity < 1 || form.complexity > 10) {
    errors.complexity = 'Complexity must be between 1 and 10.';
  }
  return errors;
}

export default function AddPrompt() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    content: '',
    complexity: 5,
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = {
      ...form,
      [name]: name === 'complexity' ? Number(value) : value,
    };
    setForm(updated);
    if (touched[name]) {
      setErrors(validate(updated));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors(validate(form));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const allTouched = { title: true, content: true, complexity: true };
    setTouched(allTouched);
    const validationErrors = validate(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    setServerError(null);
    try {
      const created = await promptService.createPrompt({
        title: form.title.trim(),
        content: form.content.trim(),
        complexity: form.complexity,
      });
      navigate(`/prompts/${created.id}`);
    } catch (err) {
      setServerError(
        err?.response?.data?.detail ?? 'Failed to create prompt. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const charCount = form.content.length;
  const complexityLabel =
    form.complexity <= 3 ? 'Low' : form.complexity <= 6 ? 'Medium' : 'High';
  const complexityClass =
    form.complexity <= 3 ? 'low' : form.complexity <= 6 ? 'medium' : 'high';

  return (
    <div className="add-prompt-page">
      <div className="form-header">
        <h2>Add New Prompt</h2>
        <p className="form-subtitle">
          Save an AI image generation prompt to your library.
        </p>
      </div>

      <form className="prompt-form" onSubmit={handleSubmit} noValidate>
        {serverError && (
          <div className="server-error">
            <span>⚠️</span> {serverError}
          </div>
        )}

        {/* Title */}
        <div className={`form-group ${touched.title && errors.title ? 'has-error' : ''}`}>
          <label htmlFor="title">
            Title <span className="required">*</span>
          </label>
          <input
            id="title"
            name="title"
            type="text"
            value={form.title}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="e.g. Cyberpunk cityscape at dusk"
            maxLength={255}
            autoComplete="off"
          />
          {touched.title && errors.title && (
            <span className="field-error">{errors.title}</span>
          )}
          <span className="char-hint">{form.title.length}/255</span>
        </div>

        {/* Content */}
        <div className={`form-group ${touched.content && errors.content ? 'has-error' : ''}`}>
          <label htmlFor="content">
            Prompt Content <span className="required">*</span>
          </label>
          <textarea
            id="content"
            name="content"
            value={form.content}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Describe the image you want to generate in detail…"
            rows={6}
          />
          {touched.content && errors.content && (
            <span className="field-error">{errors.content}</span>
          )}
          <span className={`char-hint ${charCount < 20 ? 'char-warn' : ''}`}>
            {charCount} characters {charCount < 20 ? `(${20 - charCount} more needed)` : ''}
          </span>
        </div>

        {/* Complexity */}
        <div className={`form-group ${touched.complexity && errors.complexity ? 'has-error' : ''}`}>
          <label htmlFor="complexity">
            Complexity <span className="required">*</span>
            <span className={`complexity-inline ${complexityClass}`}>
              {form.complexity}/10 — {complexityLabel}
            </span>
          </label>
          <input
            id="complexity"
            name="complexity"
            type="range"
            min={1}
            max={10}
            value={form.complexity}
            onChange={handleChange}
            onBlur={handleBlur}
            className="range-input"
          />
          <div className="range-labels">
            <span>1 — Simple</span>
            <span>5 — Moderate</span>
            <span>10 — Complex</span>
          </div>
          {touched.complexity && errors.complexity && (
            <span className="field-error">{errors.complexity}</span>
          )}
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate('/prompts')}
            disabled={submitting}
          >
            Cancel
          </button>
          <button type="submit" className="btn-submit" disabled={submitting}>
            {submitting ? (
              <>
                <span className="btn-spinner" /> Saving…
              </>
            ) : (
              'Save Prompt'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}