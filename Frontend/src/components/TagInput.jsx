import { useMemo, useState } from 'react';

export default function TagInput({ label, value = [], onChange, placeholder, helperText, suggestions = [] }) {
  const [draft, setDraft] = useState('');

  const normalizedValue = useMemo(() => value.filter(Boolean), [value]);

  const addTag = () => {
    const nextValue = draft.trim();

    if (!nextValue) {
      return;
    }

    const safeValue = nextValue.replace(/\s+/g, ' ');
    const nextTags = [...normalizedValue];
    const duplicate = nextTags.some((tag) => tag.toLowerCase() === safeValue.toLowerCase());

    if (duplicate) {
      setDraft('');
      return;
    }

    onChange([...nextTags, safeValue]);
    setDraft('');
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addTag();
      return;
    }

    if (event.key === 'Backspace' && !draft && normalizedValue.length > 0) {
      event.preventDefault();
      onChange(normalizedValue.slice(0, -1));
    }
  };

  const addSuggestedTag = (suggestion) => {
    const safeSuggestion = suggestion.trim();
    if (!safeSuggestion || normalizedValue.some((tag) => tag.toLowerCase() === safeSuggestion.toLowerCase())) {
      return;
    }

    onChange([...normalizedValue, safeSuggestion]);
  };

  return (
    <div className="field-group full-width">
      {label && <span>{label}</span>}
      <div className="tag-input-shell">
        <div className="tag-list" aria-live="polite">
          {normalizedValue.map((tag, index) => (
            <button
              key={`${tag}-${index}`}
              type="button"
              className="tag-item"
              onClick={() => onChange(normalizedValue.filter((_, itemIndex) => itemIndex !== index))}
              aria-label={`Remove ${tag}`}
            >
              <span>{tag}</span>
              <span aria-hidden="true">×</span>
            </button>
          ))}
        </div>

        <input
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addTag}
          className="tag-input"
          placeholder={normalizedValue.length ? 'Add another...' : placeholder}
          aria-label={label || placeholder}
        />
      </div>
      {suggestions.length > 0 && (
        <div className="tag-suggestions">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              className="tag-suggestion-button"
              onClick={() => addSuggestedTag(suggestion)}
              disabled={normalizedValue.some((tag) => tag.toLowerCase() === suggestion.toLowerCase())}
            >
              + {suggestion}
            </button>
          ))}
        </div>
      )}
      {helperText && <small className="tag-helper">{helperText}</small>}
    </div>
  );
}
