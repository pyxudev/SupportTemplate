"use client";

import { useState, useCallback, ReactNode, ButtonHTMLAttributes } from "react";
import styles from "./ui.module.css";

/* ─── Panel ───────────────────────────────────────────────────────────── */
interface PanelProps {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}
export function Panel({ title, actions, children, className = "" }: PanelProps) {
  return (
    <div className={`${styles.panel} ${className}`}>
      <div className={styles.panelHeader}>
        <span className={styles.panelTitle}>{title}</span>
        {actions && <div className={styles.panelActions}>{actions}</div>}
      </div>
      <div className={styles.panelBody}>{children}</div>
    </div>
  );
}

/* ─── Field ───────────────────────────────────────────────────────────── */
interface FieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}
export function Field({ label, required, error, children }: FieldProps) {
  return (
    <div className={styles.field}>
      <span className={styles.fieldLabel}>
        {label}
        {required && <span className={styles.fieldReq}>*</span>}
      </span>
      {children}
      {error && <span className={styles.fieldError}>{error}</span>}
    </div>
  );
}

/* ─── SectionLabel ────────────────────────────────────────────────────── */
export function SectionLabel({ children }: { children: ReactNode }) {
  return <div className={styles.sectionLabel}>{children}</div>;
}

/* ─── Btn ─────────────────────────────────────────────────────────────── */
interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "danger" | "blue";
  size?: "sm" | "md";
}
export function Btn({
  variant = "ghost",
  size = "md",
  children,
  className = "",
  ...rest
}: BtnProps) {
  const cls = [
    styles.btn,
    variant === "primary" ? styles.btnPrimary : "",
    variant === "ghost"   ? styles.btnGhost   : "",
    variant === "danger"  ? styles.btnDanger  : "",
    variant === "blue"    ? styles.btnBlue    : "",
    size === "sm"         ? styles.btnSm      : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}

/* ─── CopyBtn ─────────────────────────────────────────────────────────── */
interface CopyBtnProps {
  text: string;
  label?: string;
  variant?: "primary" | "ghost";
  size?: "sm" | "md";
}
export function CopyBtn({
  text,
  label = "Copy",
  variant = "ghost",
  size = "sm",
}: CopyBtnProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [text]);

  return (
    <Btn
      variant={variant}
      size={size}
      onClick={handleCopy}
      type="button"
      className={copied ? styles.flash : ""}
    >
      {copied ? "✓ Copied" : label}
    </Btn>
  );
}
