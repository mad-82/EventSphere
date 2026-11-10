import { useRef, useState } from "react";
import { Upload, FileText, X, CheckCircle2, AlertCircle } from "lucide-react";
import "./DocumentUpload.css";

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ACCEPT = ".pdf,.doc,.docx,.jpg,.jpeg,.png";

function fmtSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentUpload({ label, value = [], onChange, multiple = true }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState(null);

  const handleFiles = (fileList) => {
    setError(null);
    const files = Array.from(fileList || []);
    if (!files.length) return;

    const accepted = [];
    for (const f of files) {
      if (f.size > MAX_SIZE) {
        setError(`"${f.name}" is larger than 5 MB.`);
        continue;
      }
      accepted.push({
        id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: f.name,
        size: f.size,
        uploadedAt: new Date().toISOString(),
      });
    }
    if (accepted.length) onChange([...value, ...accepted]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleRemove = (id) => {
    onChange(value.filter((d) => d.id !== id));
  };

  return (
    <div className="exb-upload">
      {label && <span className="exb-upload__label">{label}</span>}

      <div
        className={`exb-upload__drop ${dragOver ? "is-drag" : ""}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
      >
        <div className="exb-upload__icon">
          <Upload size={22} />
        </div>
        <p className="exb-upload__title">
          Click to upload <span>or drag & drop</span>
        </p>
        <p className="exb-upload__hint">PDF, DOC, JPG, PNG · max 5 MB each</p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          multiple={multiple}
          hidden
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {error && (
        <div className="exb-upload__error">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {value.length > 0 && (
        <ul className="exb-upload__list">
          {value.map((doc) => (
            <li key={doc.id} className="exb-upload__item">
              <span className="exb-upload__file-icon">
                <FileText size={16} />
              </span>
              <div className="exb-upload__file-info">
                <span className="exb-upload__file-name">{doc.name}</span>
                <span className="exb-upload__file-meta">
                  {fmtSize(doc.size)} · <CheckCircle2 size={11} className="is-ok" /> uploaded
                </span>
              </div>
              <button
                type="button"
                className="exb-upload__remove"
                onClick={() => handleRemove(doc.id)}
                aria-label="Remove file"
              >
                <X size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}