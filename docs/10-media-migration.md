# 本番WordPress画像移行（2026-09-25）

## 対象と結果

ローカルの公開投稿を基準に、`wp.rishirecruit.com` の画像ファイルとACF画像参照を修復した。対象は観光地14件、イベント6件、移住者の声5件の計25投稿。求人19件はローカルに画像設定がなく、対象外。

| 項目 | 結果 |
| --- | --- |
| ローカルの参照ファイル | 109パス、内容が異なる画像は108枚、25,476,978 bytes |
| 初回の本番照合 | 29パス分が不足、21投稿で画像参照・ギャラリーの修復が必要 |
| 新規登録 | 28枚（attachment ID 451〜478） |
| 既存画像の再利用 | 内容が一致する80枚分 |
| 投稿画像設定の修復 | 21投稿、残り4投稿は既に一致 |
| 保存後の再照合 | 25投稿すべて一致、不足0、要修正0 |

「利尻山」のローカルギャラリーに同一内容の2ファイルがあり、1つの本番attachmentを2か所に参照した。ACF内の5枠と順序は保持しているが、公開側のGraphQL接続では同一attachmentが1件になるため、ギャラリー表示は異なる画像4枚となる。新規ファイルの重複は作っていない。過去の処理で生じた本番の重複ファイルは削除していない。

## 実行方法

1. ローカル公開投稿のGraphQLから画像の対応表を取得し、uploads内の実ファイルをサイズとSHA-256で照合した。
2. 固定対応表と画像を約25.5MBのパッケージにまとめ、ログイン済みFileZillaのFTPSで本番へ転送した。既存のFileZilla転送待ちキューは処理していない。
3. 一時プラグイン `Rishiri Image Repair` の管理者専用画面で、本番attachmentの実ファイルと原画像をSHA-256照合した。ファイル名やattachment IDの大小では一致判定しない。
4. 不足分だけをWordPress標準の `media_handle_sideload()` で最大5枚ずつ登録した。利用制限による中断後も、既登録ファイルのハッシュを再照合して続行した。
5. 全画像の登録後、CPTとslugで投稿を照合し、`update_field()` に既存のACFフィールドキーを渡して画像項目のみ更新した。ギャラリーは全件揃うまで更新せず、順序も一致させた。
6. 保存後に本番の実ファイルと投稿参照を再照合した。画像保存後の `wp_update_post()` で既存の公開キャッシュ再検証フックを通した。
7. 公開ページで表示を確認し、一時プラグインを無効化した。本番のプラグイン画面に「有効化 | 削除」が表示されることを確認済み。

WAF設定を変更せず、画像のHTTPアップロードを必要としないFTPS転送＋サーバー内登録を採用した。`period_month` など画像以外のACF値は更新していない。以前の403の原因がファイル名だったかは未確定であり、今回の方式で原因を特定したわけではない。

## 記録と再実行

- 実行コード: `scripts/media-migration/rishiri-image-repair.php`
- ローカル画像の固定スナップショット: `scripts/media-migration/manifest.json`
- 転送パッケージ作成: `python3 scripts/media-migration/prepare-bundle.py /tmp/rishiri-media-transfer`
- 変更前の本番画像設定: `scripts/media-migration/records/production-before.json`
- 保存後の本番参照: `scripts/media-migration/records/production-after.json`
- 本番DB内の変更前設定・登録ID・適用記録: option `rishiri_image_repair_20260925`（autoloadなし）

対応表は2026-09-25の固定スナップショットであり、将来の投稿・画像変更にそのまま使わないこと。新しい対応表を作る際はコード内のmanifestハッシュも合わせ、改めて差分を確認する。旧 `scripts/sync-images-to-prod.py` は部分ギャラリーの保存や重複登録を招くため、今回の修復後に再実行しない。

変更前バックアップは画像メタとACF参照キーに限定する。全DBバックアップではない。復元が必要な場合は対象投稿の現在値と適用後記録を先に比較し、作業後の編集を上書きせず、画像メタだけを復元する。自動の全体ロールバックUIは実装していない。

本番の一時ツールは無効化済みだが、`wp-content/plugins/rishiri-image-repair/` の3ファイルとDB内の作業記録は残している。画像パッケージ `payload.bin` は同梱の `.htaccess` でHTTPアクセスを拒否する設定。今回の作業ではプラグインの恒久削除は行っていない。

## 検証

- PHP構文検査: 合格。
- `php scripts/media-migration/test-repair.php`: 10項目合格。欠損時の停止、ギャラリーの順序・枚数、画像以外の保持、途中失敗した投稿の復元、同時編集の検出、一致済み投稿の再保存抑制を確認。
- ローカル実WordPress/ACFでの照合: 25投稿一致。
- 本番で保存後の再照合: 25投稿一致、不足0、要修正0。
- 公開サイトの再読込後に、沼浦展望台（サムネイル＋ギャラリー6枚）、神社例大祭（同7枚）、サイクリング（同5枚）、小川／北井さんと山上みゆきさんの写真、利尻山（サムネイル＋異なるギャラリー4枚）について `img.complete` と `naturalWidth > 0` を確認。遅延読み込みの画像はギャラリー末尾まで移動して確認した。全25投稿のブラウザ目視確認ではなく、全件のサーバー照合＋6ページのブラウザ確認。

## 参照

- [WordPress: media_handle_sideload](https://developer.wordpress.org/reference/functions/media_handle_sideload/)
- [WordPress: wp_get_original_image_path](https://developer.wordpress.org/reference/functions/wp_get_original_image_path/)
- [ACF: update_field](https://www.advancedcustomfields.com/resources/update_field/)
- [ACF REST API](https://www.advancedcustomfields.com/resources/wp-rest-api-integration/)（全項目送信は一般的な必須条件ではない）
