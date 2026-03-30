"use client";

import { useCallback } from "react";
import { useLocalStorage } from "@/app/hooks/useLocalStorage";
import { Panel, CopyBtn, Btn, SectionLabel } from "./ui";
import styles from "./MemoTab.module.css";

/* ── Types & Constants ───────────────────────────────────────────────── */
type MemoData = {
  invstp: string;
  cosd:   string;
  nxtstp: string;
};

const INITIAL: MemoData = { invstp: "", cosd: "", nxtstp: "" };

const SECTIONS = [
  {
    key:         "invstp" as const,
    label:       "Investigations",
    placeholder: "調査内容・確認した事項を入力...",
  },
  {
    key:         "cosd" as const,
    label:       "Considerations",
    placeholder: "考慮事項・懸念点を入力...",
  },
  {
    key:         "nxtstp" as const,
    label:       "Conclusion & Next Steps",
    placeholder: "結論・次のアクションを入力...",
  },
] as const;

function buildMemoText(data: MemoData): string {
  const sections = SECTIONS.filter((s) => data[s.key])
    .map((s) => `#### ${s.label}:\n${data[s.key]}`)
    .join("\n");
  return `#### [Internal Investigating Memo]\n${sections}`;
}

/* ── Component ───────────────────────────────────────────────────────── */
export default function MemoTab() {
  const [data, setData] = useLocalStorage<MemoData>("memoData", INITIAL);

  const handleChange = useCallback(
    (key: keyof MemoData) =>
      (e: React.ChangeEvent<HTMLTextAreaElement>) =>
        setData((prev) => ({ ...prev, [key]: e.target.value })),
    [setData]
  );

  const handleClear = useCallback(() => setData(INITIAL), [setData]);

  return (
    <div className={styles.wrap}>
      <Panel
        title="Internal Investigating Memo"
        actions={
          <>
            <Btn variant="ghost" size="sm" onClick={handleClear} type="button">
              Clear
            </Btn>
            <CopyBtn text={buildMemoText(data)} label="Copy All" />
          </>
        }
      >
        <div className={styles.grid}>
          {SECTIONS.map(({ key, label, placeholder }) => (
            <div key={key} className={styles.section}>
              <SectionLabel>{label}</SectionLabel>
              <textarea
                className={styles.textarea}
                value={data[key]}
                onChange={handleChange(key)}
                placeholder={placeholder}
              />
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
