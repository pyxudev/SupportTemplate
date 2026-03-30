"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { Panel, Field, Btn } from "./ui";
import styles from "./FormTab.module.css";

/* Monaco: dynamic import to avoid SSR issues */
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className={styles.editorLoading}>Loading editor…</div>
  ),
});

/* ── Types & Constants ───────────────────────────────────────────────── */
type FormData = {
  clientBaseUrl: string;
  description:   string;
  ticketId:     string;
  SessionId:      string;
  outputFile:    string;
  sqlScript:     string;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

const INITIAL: FormData = {
  clientBaseUrl: "",
  description:   "",
  ticketId:     "",
  SessionId:      "",
  outputFile:    "",
  sqlScript:     "",
};

function validate(d: FormData): FormErrors {
  const e: FormErrors = {};
  if (!d.clientBaseUrl)
    e.clientBaseUrl = "クライアント環境 URL を入力してください、例：https://<client>.your_app.com/";
  if (!/^\d+$/.test(d.ticketId))
    e.ticketId = "数字のみで入力してください";
  if (!d.SessionId.trim())
    e.SessionId = "セッション ID を入力してください";
  if (!d.outputFile.trim())
    e.outputFile = "Output File Name を入力してください";
  if (!d.sqlScript.trim())
    e.sqlScript = "SQL スクリプトを入力してください";
  return e;
}

/* ── Component ───────────────────────────────────────────────────────── */
export default function FormTab() {
  const [form, setForm]     = useState<FormData>(INITIAL);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const set = useCallback(
    (key: keyof FormData) =>
      (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm((prev) => ({ ...prev, [key]: e.target.value })),
    []
  );

  const handleClear = useCallback(() => {
    setForm(INITIAL);
    setErrors({});
  }, []);

  const handleGetId = useCallback(async () => {
    try {
      const res  = await fetch("/api/generateSessionId", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setForm((prev) => ({ ...prev, SessionId: data.SessionId }));
      } else {
        alert("セッション ID の生成に失敗しました");
      }
    } catch {
      alert("セッション ID の生成に失敗しました");
    }
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const errs = validate(form);
      setErrors(errs);
      if (Object.keys(errs).length > 0) return;

      setLoading(true);
      try {
        const res  = await fetch("/api/CreateScript", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify(form),
        });
        const data = await res.json();

        if (res.ok) {
          const blob = new Blob([data.Script], { type: "text/sql" });
          const url  = URL.createObjectURL(blob);
          const a    = Object.assign(document.createElement("a"), {
            href:     url,
            download: `${form.ticketId}_${form.outputFile}.sql`,
          });
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(url);
        } else {
          alert("Error: " + data.message);
        }
      } catch {
        alert("スクリプトの生成中にエラーが発生しました");
      } finally {
        setLoading(false);
      }
    },
    [form]
  );

  return (
    <div className={styles.wrap}>
      <div className={styles.layout}>
        {/* ── Left: Form ── */}
        <div className={styles.formScroll}>
          <Panel title="Generate SQL Script">
            <form onSubmit={handleSubmit} className={styles.form} noValidate>
              <Field
                label="Client Base URL"
                required
                error={errors.clientBaseUrl}
              >
                <input
                  className={styles.input}
                  value={form.clientBaseUrl}
                  onChange={set("clientBaseUrl")}
                  placeholder="https://client.your_app.com/"
                />
              </Field>

              <Field label="Description">
                <input
                  className={styles.input}
                  value={form.description}
                  onChange={set("description")}
                  placeholder="Optional description"
                />
              </Field>

              <div className={styles.twoCol}>
                <Field
                  label="Ticket ID"
                  required
                  error={errors.ticketId}
                >
                  <input
                    className={styles.input}
                    value={form.ticketId}
                    onChange={set("ticketId")}
                    placeholder="123456"
                  />
                </Field>

                <Field label="Session ID" required error={errors.SessionId}>
                  <div className={styles.idRow}>
                    <input
                      className={styles.input}
                      value={form.SessionId}
                      onChange={set("SessionId")}
                      placeholder="Auto or manual"
                      style={{ flex: 1, width: "auto" }}
                    />
                    <Btn
                      variant="blue"
                      size="sm"
                      type="button"
                      onClick={handleGetId}
                      style={{ flexShrink: 0 }}
                    >
                      Get ID
                    </Btn>
                  </div>
                </Field>
              </div>

              <Field
                label="Output File Name"
                required
                error={errors.outputFile}
              >
                <input
                  className={styles.input}
                  value={form.outputFile}
                  onChange={set("outputFile")}
                  placeholder="output_filename"
                />
              </Field>

              <Field label="SQL Script" required error={errors.sqlScript}>
                <div className={styles.editorWrap}>
                  <MonacoEditor
                    height="320px"
                    defaultLanguage="sql"
                    theme="vs-dark"
                    value={form.sqlScript}
                    onChange={(v) =>
                      setForm((prev) => ({ ...prev, sqlScript: v ?? "" }))
                    }
                    options={{
                      wordWrap:                  "on",
                      suggestSelection:          "first",
                      quickSuggestions:          true,
                      minimap:                   { enabled: false },
                      fontSize:                  13,
                      automaticLayout:           true,
                      folding:                   true,
                      autoClosingBrackets:       "never",
                      formatOnType:              true,
                      formatOnPaste:             true,
                      suggestOnTriggerCharacters: true,
                      copyWithSyntaxHighlighting: false,
                      scrollBeyondLastLine:       false,
                      lineNumbers:               "on",
                      renderLineHighlight:       "line",
                    }}
                  />
                </div>
              </Field>

              <div className={styles.formActions}>
                <Btn
                  variant="danger"
                  type="button"
                  onClick={handleClear}
                >
                  Clear
                </Btn>
                <Btn
                  variant="primary"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Generating…" : "Generate .sql"}
                </Btn>
              </div>
            </form>
          </Panel>
        </div>

        {/* ── Right: Data Dictionary ── */}
        <div className={styles.dictWrap}>
          <div className={styles.dictHeader}>
            <span className={styles.dictTitle}>Data Dictionary</span>
          </div>
          <iframe
            src="/static/DataDictionary.htm"
            title="Data Dictionary"
            className={styles.dictFrame}
          />
        </div>
      </div>
    </div>
  );
}
