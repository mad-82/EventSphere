import { Clock, CheckCircle2, XCircle, FileEdit } from "lucide-react";
import "./ApplicationStatus.css";

const CONFIG = {
  pending:  { label: "Pending",  icon: Clock,        cls: "pending" },
  approved: { label: "Approved", icon: CheckCircle2, cls: "approved" },
  rejected: { label: "Rejected", icon: XCircle,      cls: "rejected" },
  draft:    { label: "Draft",    icon: FileEdit,     cls: "draft" },
};

export default function ApplicationStatus({ status, size = "md" }) {
  const key = String(status || "").toLowerCase();
  const cfg = CONFIG[key] || CONFIG.draft;
  const Icon = cfg.icon;

  return (
    <span className={`exb-status exb-status--${cfg.cls} exb-status--${size}`}>
      <Icon size={size === "sm" ? 11 : 13} />
      <span>{cfg.label}</span>
    </span>
  );
}