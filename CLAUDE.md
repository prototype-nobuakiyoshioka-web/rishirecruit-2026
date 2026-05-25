# CLAUDE.md

このプロジェクトの仕様・規約・運用ルールは **`AGENTS.md`** に集約しています（Single Source of Truth）。
ファイル内容の更新は **必ず `AGENTS.md` 側**で行ってください。

@AGENTS.md

---

## Claude Code 固有の注意

> Claude Code 専用の挙動・機能（Artifacts / MCP / Extended Thinking / Skill 等）に関するルールはここに追記します。
> Codex など他ツールにも適用すべきルールは `AGENTS.md` 側に書いてください。

- **拡張思考 (extended thinking)**: 設計判断・トレードオフ評価・3D 最適化方針の検討時に使用してよい。単純な編集タスクでは不要。
- **MCP / Skill**: 現状プロジェクト固有の MCP サーバ・カスタム Skill は未導入。導入時はここに利用条件を追記する。
- **ファイル編集ポリシー**: AGENTS.md の Karpathy 原則「Surgical Changes」を厳守。`Edit` ツールで最小差分にすること。
