"use client";

import { useState } from "react";
import styles from "./Shell.module.css";
import MemoTab from "./MemoTab";
import ReplyTab from "./ReplyTab";
import FormTab from "./FormTab";

type TabId = "memo" | "reply" | "form";

const TABS: { id: TabId; label: string; kbd: string }[] = [
  { id: "memo",  label: "Memo",  kbd: "1" },
  { id: "reply", label: "Reply", kbd: "2" },
  { id: "form",  label: "Form",  kbd: "3" },
];

export default function Shell() {
  const [active, setActive] = useState<TabId>("memo");

  return (
    <div className={styles.shell}>
      {/* Top Bar */}
      <header className={styles.topbar}>
        <div className={styles.logo}>
          <span className={styles.logoDot} />
          Support Tools
        </div>
        <div className={styles.topbarSep} />
        <span className={styles.topbarMeta}>v2.0 · Internal</span>
      </header>

      {/* Tab Nav */}
      <nav className={styles.tabNav}>
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`${styles.tabBtn} ${active === t.id ? styles.tabBtnActive : ""}`}
            onClick={() => setActive(t.id)}
            role="tab"
            aria-selected={active === t.id}
          >
            {t.label}
            <kbd className={styles.tabKbd}>{t.kbd}</kbd>
          </button>
        ))}
      </nav>

      {/* Content */}
      <main className={styles.content}>
        {active === "memo"  && <MemoTab />}
        {active === "reply" && <ReplyTab />}
        {active === "form"  && <FormTab />}
      </main>
    </div>
  );
}
