#!/usr/bin/env python3
"""
ローカル WordPress の投稿画像（サムネイル + ギャラリー）を本番 Lolipop WP へ同期する。

使用方法:
  export PROD_USER="ユーザー名"
  export PROD_APP_PASSWORD="Application Password"
  python3 -u scripts/sync-images-to-prod.py [--dry-run]

冪等性: 本番投稿のACF thumbnail 添付ID >= 300 なら既に同期済みとしてスキップ。
"""
import os
import sys
import json
import time
import mimetypes
from pathlib import Path
from typing import Optional
from urllib.parse import urlparse

import requests

# stdout をラインバッファリング(即時flush)
sys.stdout.reconfigure(line_buffering=True)

LOCAL_GQL = "http://rishirecruit-2026.local/graphql"
LOCAL_UPLOADS = Path("/Users/mushoku/Local Sites/rishirecruit-2026/app/public/wp-content/uploads")
PROD_API = "https://wp.rishirecruit.com/wp-json/wp/v2"

PROD_USER = os.environ.get("PROD_USER")
PROD_APP_PASSWORD = os.environ.get("PROD_APP_PASSWORD")
DRY_RUN = "--dry-run" in sys.argv

if not PROD_USER or not PROD_APP_PASSWORD:
    sys.exit("環境変数 PROD_USER と PROD_APP_PASSWORD を指定してください")

AUTH = (PROD_USER, PROD_APP_PASSWORD)

# CPT ごとの設定
# (GraphQL 名, REST エンドポイント名, ACF fields キー, サムネイルフィールド名, ギャラリーフィールド名 or None)
CPTS = [
    ("touristspots", "touristspot", "touristspotFields", "thumbnail_image", "gallery_images"),
    ("events",       "event",       "eventFields",       "thumbnail_image", "gallery_images"),
    ("testimonials", "testimonial", "testimonialFields", "photo",           None),
    ("jobPostings",  "job_posting", "jobPostingFields",  "thumbnail_image", None),
]

# 全 CPT の投稿 + 画像を1回で取得する
QUERY = """
{
  touristspots(first: 50) { nodes { slug touristspotFields {
    thumbnailImage { node { sourceUrl altText title } }
    galleryImages  { nodes { sourceUrl altText title } }
  } } }
  events(first: 50) { nodes { slug eventFields {
    thumbnailImage { node { sourceUrl altText title } }
    galleryImages  { nodes { sourceUrl altText title } }
  } } }
  testimonials(first: 50) { nodes { slug testimonialFields {
    photo { node { sourceUrl altText title } }
  } } }
  jobPostings(first: 50) { nodes { slug jobPostingFields {
    thumbnailImage { node { sourceUrl altText title } }
  } } }
}
"""

def local_url_to_path(url: str) -> Optional[Path]:
    """http://rishirecruit-2026.local/wp-content/uploads/2026/09/foo.jpg → ローカルファイルパス"""
    try:
        parsed = urlparse(url)
        if "/wp-content/uploads/" not in parsed.path:
            return None
        rel = parsed.path.split("/wp-content/uploads/", 1)[1]
        return LOCAL_UPLOADS / rel
    except Exception:
        return None


def fetch_local_data() -> dict:
    print(f"[fetch] ローカルGraphQL: {LOCAL_GQL}")
    r = requests.post(LOCAL_GQL, json={"query": QUERY}, timeout=60)
    r.raise_for_status()
    d = r.json()
    if "errors" in d:
        sys.exit(f"GraphQL エラー: {d['errors']}")
    return d["data"]


def find_prod_post(cpt_rest: str, slug: str) -> Optional[dict]:
    """本番投稿を取得（id + 既存ACFを返す）。ACF 更新時に既存値をマージするため必要。"""
    for attempt in range(5):
        try:
            r = requests.get(
                f"{PROD_API}/{cpt_rest}",
                auth=AUTH,
                params={"slug": slug, "_fields": "id,acf"},
                headers={"User-Agent": "MediaSyncBot/1.0"},
                timeout=30,
            )
            r.raise_for_status()
            data = r.json()
            return data[0] if data else None
        except requests.exceptions.RequestException as e:
            wait = 5 * (attempt + 1)  # 5s, 10s, 15s, 20s, 25s
            print(f"    ⚠️ find_prod_post retry {attempt + 1}/5 after {wait}s: {e}")
            time.sleep(wait)
    return None


def upload_media(image_node: dict) -> Optional[int]:
    """ローカル画像を本番メディアライブラリへアップロード。attachment IDを返す。"""
    src = image_node.get("sourceUrl")
    if not src:
        return None
    path = local_url_to_path(src)

    if path and path.exists():
        data = path.read_bytes()
        filename = path.name
    else:
        # フォールバック: HTTP ダウンロード
        try:
            r = requests.get(src, timeout=60)
            r.raise_for_status()
            data = r.content
            filename = Path(urlparse(src).path).name
        except Exception as e:
            print(f"      ❌ download failed: {src} — {e}")
            return None

    mime = mimetypes.guess_type(filename)[0] or "application/octet-stream"

    if DRY_RUN:
        print(f"      🟡 [dry-run] upload {filename} ({len(data)} bytes, {mime})")
        return -1  # dummy

    # 403 / Connection reset (WAF) 対策: リトライ + 長めの遅延
    last_err = None
    for attempt in range(5):
        try:
            r = requests.post(
                f"{PROD_API}/media",
                auth=AUTH,
                data=data,
                headers={
                    "Content-Type": mime,
                    "Content-Disposition": f'attachment; filename="{filename}"',
                    "User-Agent": "MediaSyncBot/1.0",
                },
                timeout=180,
            )
            if r.status_code in (200, 201):
                break
            last_err = f"[{r.status_code}] {r.text[:200]}"
        except requests.exceptions.RequestException as e:
            last_err = str(e)
        # 指数バックオフ (WAF クールダウン)
        wait = 5 * (2 ** attempt)  # 5s, 10s, 20s, 40s, 80s
        print(f"      ⚠️ upload retry {attempt + 1}/5 after {wait}s: {last_err}")
        time.sleep(wait)
    else:
        print(f"      ❌ upload failed after 5 tries: {last_err}")
        return None

    media_id = r.json()["id"]

    # 代替テキスト・タイトル更新
    update = {}
    if image_node.get("altText"):
        update["alt_text"] = image_node["altText"]
    if image_node.get("title"):
        update["title"] = image_node["title"]
    if update:
        try:
            requests.post(f"{PROD_API}/media/{media_id}", auth=AUTH, json=update, timeout=30)
        except Exception as e:
            print(f"      ⚠️ media meta update warn: {e}")

    return media_id


def update_post_acf(cpt_rest: str, post_id: int, existing_acf: dict, new_fields: dict) -> bool:
    """既存ACF値と新規フィールドをマージして全体を送信する（ACF REST の必須項目検証を通すため）。"""
    if DRY_RUN:
        print(f"      🟡 [dry-run] update {cpt_rest}/{post_id} new={list(new_fields.keys())}")
        return True

    # 既存ACFを土台に、新規画像IDだけ上書き
    merged = dict(existing_acf or {})
    merged.update(new_fields)

    # image field のみ ID(int) にする必要はない (ACF は array形式でも受け付ける模様)
    # ただし select フィールドは配列で返ってくることがあるため、そのまま送る

    r = requests.post(f"{PROD_API}/{cpt_rest}/{post_id}", auth=AUTH, json={"acf": merged}, timeout=60)
    if r.status_code not in (200, 201):
        print(f"      ❌ ACF update failed [{r.status_code}]: {r.text[:300]}")
        return False
    return True


def sync_all():
    data = fetch_local_data()
    total_success, total_fail = 0, 0

    for gql_key, rest_ep, fields_key, thumb_field_acf, gallery_field_acf in CPTS:
        # GraphQL のフィールド名は camelCase、ACF フィールド名は snake_case
        gql_thumb_field = "photo" if thumb_field_acf == "photo" else "thumbnailImage"
        gql_gallery_field = "galleryImages" if gallery_field_acf else None

        nodes = data.get(gql_key, {}).get("nodes", []) or []
        print(f"\n=== {gql_key} ({len(nodes)}件) ===")

        for node in nodes:
            slug = node["slug"]
            fields = node.get(fields_key) or {}

            thumb_node = (fields.get(gql_thumb_field) or {}).get("node")
            gallery_nodes = ((fields.get(gql_gallery_field) or {}).get("nodes") or []) if gql_gallery_field else []

            if not thumb_node and not gallery_nodes:
                continue

            print(f"  [{slug}]")

            # 本番投稿取得（既存ACFも含む）
            prod = find_prod_post(rest_ep, slug)
            if not prod:
                print(f"    ⚠️ 本番に見つからず、スキップ")
                total_fail += 1
                continue
            prod_id = prod["id"]
            existing_acf = prod.get("acf", {}) or {}

            # 冪等性チェック: 既にサムネイルが新IDならスキップ
            existing_thumb = existing_acf.get(thumb_field_acf)
            if isinstance(existing_thumb, int) and existing_thumb >= 300:
                print(f"    ⏭  既に同期済み (thumb id={existing_thumb})")
                total_success += 1
                continue

            acf_update = {}

            # サムネイル
            if thumb_node:
                new_id = upload_media(thumb_node)
                if new_id:
                    acf_update[thumb_field_acf] = new_id
                    print(f"    ✅ thumbnail uploaded → id={new_id}")
                time.sleep(3)  # WAFレート制限回避

            # ギャラリー
            if gallery_nodes and gallery_field_acf:
                gallery_ids = []
                for i, gnode in enumerate(gallery_nodes, 1):
                    print(f"    gallery [{i}/{len(gallery_nodes)}]")
                    gid = upload_media(gnode)
                    if gid:
                        gallery_ids.append(gid)
                    time.sleep(3)  # WAFレート制限回避
                if gallery_ids:
                    acf_update[gallery_field_acf] = gallery_ids
                    print(f"    ✅ gallery {len(gallery_ids)}枚 uploaded")

            # ACF更新（既存値とマージ）
            if acf_update:
                ok = update_post_acf(rest_ep, prod_id, existing_acf, acf_update)
                if ok:
                    total_success += 1
                    print(f"    ✅ {slug} 完了")
                else:
                    total_fail += 1

            time.sleep(0.5)

    print(f"\n=== 完了: 成功 {total_success} 件 / 失敗 {total_fail} 件 ===")


if __name__ == "__main__":
    if DRY_RUN:
        print("🟡 DRY-RUN モード（実際のアップロードは行いません）\n")
    sync_all()
