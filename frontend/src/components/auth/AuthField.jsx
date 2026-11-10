export default function AuthField({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  autoComplete,
  showToggle,
  onToggle,
}) {
  return (
    <div className="auth-field">
      <label htmlFor={id} className="auth-field__label">
        {label}
      </label>
      <div className="auth-field__input-wrap">
        <input
          id={id}
          name={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="auth-field__input"
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        {showToggle && (
          <button
            type="button"
            className="auth-field__toggle"
            onClick={onToggle}
            aria-label={type === "password" ? "Show password" : "Hide password"}
          >
            {type === "password" ? "Show" : "Hide"}
          </button>
        )}
      </div>
      {error && (
        <span id={`${id}-error`} className="auth-field__error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}