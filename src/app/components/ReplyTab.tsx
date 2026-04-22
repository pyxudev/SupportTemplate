"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocalStorage } from "@/app/hooks/useLocalStorage";
import { Panel, CopyBtn, Btn, Field } from "./ui";
import styles from "./ReplyTab.module.css";

/* ── Types ───────────────────────────────────────────────────────────── */
type ReplyData = {
  name:     string;
  compname: string;
  simpname: string;
  spname:   string;
  greeting: string;
  answer:   string;
  unclear:  string;
  use:      boolean;
  isEn:     boolean;
};

type Template = {
  title:   string;
  content: string;
};

/* ── Constants ───────────────────────────────────────────────────────── */
const INITIAL: ReplyData = {
  name: "",
  compname: process.env.NEXT_PUBLIC_COMPANY_NAME || "",
  simpname: process.env.NEXT_PUBLIC_MY_NAME || "",
  spname: process.env.NEXT_PUBLIC_ENGINEER_NAME || "",
  greeting: "お問い合わせいただき、誠にありがとうございます。",
  answer: "",
  unclear:  "ご不明な点等ございましたらお知らせください。",
  use: false,
  isEn: false,
};

const GREETING_OPTS = [
  "お問い合わせいただき、誠にありがとうございます。",
  "前回のご案内内容を確認いただき、誠にありがとうございます。",
  "調査にお時間をいただき、誠にありがとうございます。",
  "ご対応いただき、誠にありがとうございます。",
  "本件対応が遅れまして、大変申し訳ございません。",
  "この度はご迷惑をおかけしまして、誠に申し訳ございません。",
  "度重なるご連絡失礼いたします。",
  "お客様の環境にてスクリプトを実施いたしました。",
  "",
];

const UNCLEAR_OPTS = [
  "ご不明な点等ございましたらお知らせください。",
  "上記手順より事象が解消されない場合はお知らせください。",
  "大変お手数ですが、お客様にてご確認をお願いいたします。",
  "",
];

/* ── Build preview text ──────────────────────────────────────────────── */
function buildText(d: ReplyData): string {
  const intcom = d.use ? "#### [Internal Comment for review]\n" : "";

  if (d.isEn) {
    const greet = d.greeting
      ? "\nThank you for reaching out to us regarding the issue.\n\n"
      : "\n";
    const unc = d.unclear
      ? "\n\nIf you have any further questions, please feel free to let us know."
      : "";
    return `${intcom}Hello ${d.name},\n${greet}${d.answer}${unc}\n\nBest regards,\n${d.spname}`;
  }

  const client = d.name     ? `${d.name} 様\n\n` : "";
  const greet  = d.greeting ? `${d.greeting}\n\n` : "\n";
  const unc    = d.unclear  ? `\n\n${d.unclear}` : "";
  return `${intcom}${client}いつもお世話になっております、${d.compname} サポートの${d.simpname}です。\n${greet}${d.answer}${unc}\n\n何卒よろしくお願いいたします。\n${d.spname}`;
}

/* ── Component ───────────────────────────────────────────────────────── */
export default function ReplyTab() {
  console.log(process.env.COMPANY_NAME, process.env.MY_NAME, process.env.ENGINEER_NAME);
  const [d, setD] = useLocalStorage<ReplyData>("replyData", INITIAL);
  const [templates, setTemplates] = useState<Template[]>([]);

  /* Fetch templates */
  useEffect(() => {
    const ctrl = new AbortController();
    fetch("/api/template", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: ctrl.signal,
    })
      .then((r) => r.json())
      .then((data) => setTemplates(data.templates))
      .catch((err) => {
        if (err.name !== "AbortError") console.error("[template fetch]", err);
      });
    return () => ctrl.abort();
  }, []);

  /* Generic setter */
  const set = useCallback(
    (key: keyof ReplyData) =>
      (
        e: React.ChangeEvent<
          HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
      ) => {
        const value =
          e.target.type === "checkbox"
            ? (e.target as HTMLInputElement).checked
            : e.target.value;
        setD((prev) => ({ ...prev, [key]: value }));
      },
    [setD]
  );

  const handleClear = useCallback(() => setD(INITIAL), [setD]);
  const previewText = buildText(d);

  return (
    <div className={styles.wrap}>
      <div className={styles.layout}>
        {/* ── Main Panel ── */}
        <Panel
          title="Reply Draft"
          actions={
            <>
              <Btn variant="ghost" size="sm" onClick={handleClear} type="button">
                Clear
              </Btn>
              <CopyBtn text={previewText} label="Copy" />
            </>
          }
        >
          <div className={styles.formInner}>
            {/* Client name */}
            <Field label="Client Name">
              <div className={styles.inlineGroup}>
                <input
                  className={styles.inlineInput}
                  value={d.name}
                  onChange={set("name")}
                  placeholder="Shalock"
                />
                <span className={styles.inlineSuffix}>様</span>
              </div>
            </Field>

            {/* Company / Engineer */}
            <div className={styles.twoCol}>
              <Field label="Company Name">
                <input
                  className={styles.input}
                  value={ process.env.NEXT_PUBLIC_COMPANY_NAME || d.compname}
                  onChange={set("compname")}
                  placeholder="your_company"
                />
              </Field>
              <Field label="Engineer Name">
                <input
                  className={styles.input}
                  value={ process.env.NEXT_PUBLIC_MY_NAME || d.simpname}
                  onChange={set("simpname")}
                  placeholder="Adam"
                />
              </Field>
            </div>

            {/* Greeting */}
            <Field label="Greeting">
              <select
                className={styles.select}
                value={d.greeting}
                onChange={set("greeting")}
              >
                {GREETING_OPTS.map((o) => (
                  <option key={o} value={o}>
                    {o || "(none)"}
                  </option>
                ))}
              </select>
            </Field>

            {/* Answer body */}
            <Field label="Answer Body">
              <textarea
                className={styles.textarea}
                value={d.answer}
                onChange={set("answer")}
                placeholder="Text here"
                rows={6}
              />
            </Field>

            {/* Unclear / closing */}
            <Field label="Closing">
              <select
                className={styles.select}
                value={d.unclear}
                onChange={set("unclear")}
              >
                {UNCLEAR_OPTS.map((o) => (
                  <option key={o} value={o}>
                    {o || "(none)"}
                  </option>
                ))}
              </select>
            </Field>

            {/* Signature */}
            <Field label="Signature">
              <input
                className={styles.input}
                value={ process.env.NEXT_PUBLIC_ENGINEER_NAME || d.spname}
                onChange={set("spname")}
                placeholder="Signature_Name"
              />
            </Field>

            {/* Options */}
            <div className={styles.checkRow}>
              <label className={styles.checkItem}>
                <input
                  type="checkbox"
                  checked={d.use}
                  onChange={set("use")}
                />
                Internal Comment
              </label>
              <label className={styles.checkItem}>
                <input
                  type="checkbox"
                  checked={d.isEn}
                  onChange={set("isEn")}
                />
                English
              </label>
            </div>

            {/* Live Preview */}
            <div>
              <p className={styles.previewLabel}>Preview</p>
              <pre className={styles.preview}>{previewText}</pre>
            </div>
          </div>
        </Panel>

        {/* ── Template Sidebar ── */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>Templates</div>
          <div className={styles.templateList}>
            {templates.map((t, i) => (
              <div key={i} className={styles.templateItem}>
                <p className={styles.templateTitle}>{t.title}</p>
                <p className={styles.templateBody}>
                  {t.content.replace(/\\n/g, " ").slice(0, 70)}…
                </p>
                <CopyBtn
                  text={t.content.replace(/\\n/g, "\n")}
                  label="Copy"
                />
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
