const ROLES = [
  { value: "attendee", label: "Attendee", desc: "Join events & exhibitions" },
  { value: "exhibitor", label: "Exhibitor", desc: "Showcase your business" },
];

export default function RoleSelector({ value, onChange, error }) {
  return (
    <div style={{ marginBottom: "1.25rem" }}>
      <span
        className="auth-field__label"
        style={{ display: "block", marginBottom: "0.6rem" }}
      >
        Select Your Role
      </span>
      <div
        className="auth-roles"
        role="radiogroup"
        aria-label="Select your role"
      >
        {ROLES.map((r) => (
          <button
            key={r.value}
            type="button"
            role="radio"
            aria-checked={value === r.value}
            className={`auth-role ${value === r.value ? "is-selected" : ""}`}
            onClick={() => onChange(r.value)}
          >
            <span className="auth-role__name">{r.label}</span>
            <span className="auth-role__desc">{r.desc}</span>
          </button>
        ))}
      </div>
      {error && <span className="auth-field__error">{error}</span>}
    </div>
  );
}