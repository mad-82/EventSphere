export default function PasswordStrength({ password }) {
  const calc = () => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const score = calc();
  const label = ["", "Weak", "Fair", "Good", "Strong"][score];

  return (
    <div>
      <div className="auth-strength" aria-hidden="true">
        {[1, 2, 3, 4].map((n) => (
          <span
            key={n}
            className={`auth-strength__bar ${n <= score ? "is-active" : ""}`}
          />
        ))}
      </div>
      {password && (
        <p className="auth-strength__label">Password strength: {label}</p>
      )}
    </div>
  );
}