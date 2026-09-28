#!/usr/bin/env python3
"""保存した画像対応表をハッシュ検証し、FTPS転送用フォルダを作る。ネットワーク・本番更新なし。"""
import hashlib
import json
import pathlib
import shutil
import sys
import zipfile

HERE = pathlib.Path(__file__).resolve().parent
UPLOADS = HERE.parents[3] / 'uploads'
DEST = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else '/tmp/rishiri-media-transfer') / 'rishiri-image-repair'
manifest_bytes = (HERE / 'manifest.json').read_bytes()
manifest = json.loads(manifest_bytes)
plugin = (HERE / 'rishiri-image-repair.php').read_text()
if hashlib.sha256(manifest_bytes).hexdigest() not in plugin:
    raise SystemExit('プラグインと対応表のハッシュが一致しません。')
for item in manifest['files']:
    path = (UPLOADS / item['relative_path']).resolve()
    if not path.is_relative_to(UPLOADS.resolve()) or hashlib.sha256(path.read_bytes()).hexdigest() != item['sha256']:
        raise SystemExit('画像が変更されています: ' + item['relative_path'])
DEST.mkdir(parents=True, exist_ok=True)
shutil.copy2(HERE / 'rishiri-image-repair.php', DEST / 'rishiri-image-repair.php')
(DEST / '.htaccess').write_text('<Files "payload.bin">\n    Require all denied\n</Files>\nOptions -Indexes\n')
with zipfile.ZipFile(DEST / 'payload.bin', 'w', compression=zipfile.ZIP_DEFLATED) as bundle:
    bundle.writestr('manifest.json', manifest_bytes)
    for item in manifest['files']:
        bundle.write(UPLOADS / item['relative_path'], 'files/' + item['relative_path'])
with zipfile.ZipFile(DEST / 'payload.bin') as bundle:
    if bundle.testzip():
        raise SystemExit('ZIP検証に失敗しました。')
print(DEST)
