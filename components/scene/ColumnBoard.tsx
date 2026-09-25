"use client";

import Link from "next/link";
import styles from "./ColumnBoard.module.css";

export function ColumnBoard() {
  return (
    <Link href="/columns" aria-label="コラム一覧を見る" className={styles.board}>
      <span aria-hidden="true" className={styles.book}>
        <svg viewBox="0 0 32 36" fill="none" focusable="false">
          <path d="M7 3h18a3 3 0 0 1 3 3v26H8a4 4 0 0 1-4-4V6a3 3 0 0 1 3-3Z" fill="#eaf5fa" />
          <path d="M8 3v25M8 28h20v4H8a2 2 0 0 1 0-4Z" fill="#c9e2f0" />
          <path d="M8 3v24M8 28h20v4H8a3 3 0 0 1-3-3" stroke="#74a7b7" strokeWidth="1.5" strokeLinecap="round" />
          <path d="m12 20 5-9 3 5 2-2 3 6H12Z" fill="#8dcbd7" />
          <path d="m15 15 2-4 2.4 4-2.2-.8L15 15Z" fill="white" />
          <path d="M13 23h10" stroke="#74a7b7" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </span>
      <span className={styles.label}>
        <span className={styles.eyebrow}>NOTE</span>
        <span className={styles.title}>コラム</span>
      </span>
      <span aria-hidden="true" className={styles.arrow}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" focusable="false">
          <path d="M5 12h14m-6-6 6 6-6 6" />
        </svg>
      </span>
    </Link>
  );
}
