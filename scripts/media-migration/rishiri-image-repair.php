<?php
/**
 * Plugin Name: Rishiri Image Repair
 * Description: 利尻の投稿画像だけを、FTPS転送済みの固定パッケージから照合・復元する一時管理ツール。
 * Version: 1.0.0
 */
if (!defined('ABSPATH')) exit;

final class RishiriImageRepair {
    private const STATE = 'rishiri_image_repair_20260925';
    private const LOCK = 'rishiri_image_repair_lock';
    private const MANIFEST_SHA = '594658afcfaa5679e2723d2ed85edae2fe6807dc5c3bf8da26cecf65d803784a';
    private const FIELDS = [
        'touristspot' => ['thumbnail_image' => 'field_ts_thumbnail_image', 'gallery_images' => 'field_ts_gallery_images'],
        'event' => ['thumbnail_image' => 'field_ev_thumbnail_image', 'gallery_images' => 'field_ev_gallery_images'],
        'testimonial' => ['photo' => 'field_tm_photo'],
        'job_posting' => ['thumbnail_image' => 'field_jp_thumbnail_image'],
    ];
    private $zip;
    private $manifest;
    private $files = [];
    private $hash_ids = [];
    private $id_hashes = [];

    /** 固定パッケージ以外は扱わず、公開HTTPからのファイル指定や実行を許さない。 */
    private function load(): void {
        if (!current_user_can('manage_options') || !current_user_can('upload_files')) throw new RuntimeException('管理者権限が必要です。');
        if (!in_array(wp_parse_url(home_url(), PHP_URL_HOST), ['wp.rishirecruit.com', 'rishirecruit-2026.local'], true)) throw new RuntimeException('対象サイトではありません。');
        if (!function_exists('update_field') || !class_exists('ZipArchive')) throw new RuntimeException('ACF と ZipArchive が必要です。');
        $this->zip = new ZipArchive();
        if ($this->zip->open(__DIR__ . '/payload.bin') !== true) throw new RuntimeException('FTPS画像パッケージが見つかりません。');
        $json = $this->zip->getFromName('manifest.json');
        if (!$json || !hash_equals(self::MANIFEST_SHA, hash('sha256', $json))) throw new RuntimeException('対応表のハッシュが一致しません。');
        $this->manifest = json_decode($json, true, 512, JSON_THROW_ON_ERROR);
        foreach ($this->manifest['files'] as $file) {
            $rel = $file['relative_path'];
            if (str_contains($rel, '..') || !preg_match('~^20[0-9]{2}/[0-9]{2}/[^/]+\.(webp|jpg|jpeg|png|gif)$~i', $rel)) throw new RuntimeException('画像パス不正');
            $bytes = $this->zip->getFromName('files/' . $rel);
            if ($bytes === false || strlen($bytes) !== $file['bytes'] || !hash_equals($file['sha256'], hash('sha256', $bytes))) throw new RuntimeException('転送画像の破損: ' . $rel);
            $this->files[$rel] = $file;
        }
        // 元画像とWPの縮小版の双方を照合する。IDやファイル名の大小で完了判定しない。
        $ids = get_posts(['post_type' => 'attachment', 'post_status' => 'inherit', 'post_mime_type' => 'image', 'posts_per_page' => -1, 'fields' => 'ids', 'orderby' => 'ID', 'order' => 'ASC']);
        $uploads = realpath(wp_get_upload_dir()['basedir']);
        foreach ($ids as $id) {
            $attached = get_attached_file($id);
            if (!$attached || !is_file($attached)) continue;
            foreach (array_unique([$attached, wp_get_original_image_path($id)]) as $path) {
                $real = $path ? realpath($path) : false;
                if (!$real || !$uploads || !str_starts_with($real, $uploads . DIRECTORY_SEPARATOR)) continue;
                $hash = hash_file('sha256', $real);
                $this->hash_ids[$hash][] = (int) $id;
                $this->id_hashes[(int) $id][] = $hash;
            }
        }
    }

    /** 投稿種別・slug・ACFキーを照合し、他の投稿や項目の変更を防ぐ。 */
    private function plan(): array {
        $rows = [];
        foreach ($this->manifest['posts'] as $source) {
            $type = $source['post_type'];
            if (!isset(self::FIELDS[$type])) throw new RuntimeException('対象外の投稿種別');
            $posts = get_posts(['post_type' => $type, 'name' => $source['slug'], 'post_status' => 'publish', 'posts_per_page' => 2]);
            if (count($posts) !== 1 || $posts[0]->post_name !== $source['slug']) throw new RuntimeException('本番投稿を一意に特定できません: ' . $source['slug']);
            $id = $posts[0]->ID;
            if (!current_user_can('edit_post', $id)) throw new RuntimeException('投稿の編集権限がありません。');
            $row = ['id' => $id, 'type' => $type, 'slug' => $source['slug'], 'fields' => [], 'complete' => true, 'changed' => false];
            foreach ($source['acf_fields'] as $name => $field) {
                if ((self::FIELDS[$type][$name] ?? '') !== $field['field_key']) throw new RuntimeException('ACFキー不一致');
                $definition = acf_get_field($field['field_key']);
                if (!$definition || $definition['name'] !== $name || $definition['type'] !== $field['type']) throw new RuntimeException('本番ACF定義不一致: ' . $name);
                $old = get_post_meta($id, $name, true);
                $old_ids = $field['type'] === 'gallery' ? array_map('intval', is_array($old) ? $old : []) : [(int) $old];
                $next = [];
                foreach ($field['files'] as $i => $rel) {
                    if (!isset($this->files[$rel])) throw new RuntimeException('対応表に画像がありません。');
                    $hash = $this->files[$rel]['sha256'];
                    $candidates = $this->hash_ids[$hash] ?? [];
                    // 正しい既存の参照は維持し、別の同一画像IDへ不用意に切り替えない。
                    $next[] = in_array($old_ids[$i] ?? 0, $candidates, true) ? $old_ids[$i] : ($candidates[0] ?? 0);
                }
                $complete = !in_array(0, $next, true);
                $changed = $old_ids !== $next;
                $row['complete'] = $row['complete'] && $complete;
                $row['changed'] = $row['changed'] || $changed;
                $row['fields'][$name] = ['key' => $field['field_key'], 'type' => $field['type'], 'old' => $old_ids, 'next' => $next, 'complete' => $complete, 'changed' => $changed];
            }
            $rows[] = $row;
        }
        return $rows;
    }

    /** 変更前の画像メタとACF参照キーをDB内に保管し、再実行で上書きしない。 */
    private function backup(array $rows): array {
        $state = get_option(self::STATE, []);
        if (!$state) {
            $state = ['manifest_sha' => self::MANIFEST_SHA, 'created_at' => gmdate('c'), 'before' => [], 'created_media' => [], 'applied' => []];
            foreach ($rows as $row) {
                foreach ($row['fields'] as $name => $field) {
                    foreach ([$name, '_' . $name] as $meta_key) {
                        $state['before'][$row['id']][$meta_key] = get_post_meta($row['id'], $meta_key, false);
                    }
                }
            }
            if (!add_option(self::STATE, $state, '', false)) throw new RuntimeException('変更前設定を保存できません。');
        }
        if ($state['manifest_sha'] !== self::MANIFEST_SHA) throw new RuntimeException('異なる移行記録が存在します。');
        return $state;
    }

    /** 画像登録は少数ずつ行い、中断後は実ファイルのハッシュから再開する。 */
    private function import(array $rows): string {
        $state = $this->backup($rows);
        require_once ABSPATH . 'wp-admin/includes/file.php';
        require_once ABSPATH . 'wp-admin/includes/media.php';
        require_once ABSPATH . 'wp-admin/includes/image.php';
        $count = 0;
        foreach ($this->files as $rel => $file) {
            if (!empty($this->hash_ids[$file['sha256']])) continue;
            $tmp = wp_tempnam(basename($rel));
            if (!$tmp || file_put_contents($tmp, $this->zip->getFromName('files/' . $rel)) !== $file['bytes']) throw new RuntimeException('作業ファイルの作成に失敗');
            $id = media_handle_sideload(['name' => basename($rel), 'tmp_name' => $tmp, 'error' => 0, 'size' => $file['bytes']], 0, $file['title']);
            if (is_file($tmp)) unlink($tmp);
            if (is_wp_error($id)) throw new RuntimeException($id->get_error_message());
            $state['created_media'][] = $id;
            update_option(self::STATE, $state, false);
            update_post_meta($id, '_wp_attachment_image_alt', sanitize_text_field($file['alt_text']));
            $this->hash_ids[$file['sha256']] = [(int) $id];
            if (++$count >= 5) break;
        }
        return $count . '件の不足画像を登録しました。投稿の紐付けはまだ変更していません。';
    }

    /** 途中の不足ギャラリーを保存せず、全対象が揃ってから画像フィールドのみ更新する。 */
    private function apply(array $rows): string {
        foreach ($rows as $row) if (!$row['complete']) throw new RuntimeException('不足画像があります。先に登録を完了してください。');
        $state = $this->backup($rows);
        $count = 0;
        foreach ($rows as $row) {
            if (!$row['changed']) continue;
            $id = $row['id'];
            // 別編集者が作業中に変更した画像を上書きしない。
            $expected = $state['applied'][$id] ?? $state['before'][$id];
            foreach ($expected as $key => $values) {
                if (get_post_meta($id, $key, false) !== $values) throw new RuntimeException('画像設定が別途変更されました: ' . $row['slug']);
            }
            $before = [];
            foreach ($row['fields'] as $name => $field) {
                foreach ([$name, '_' . $name] as $key) $before[$key] = get_post_meta($id, $key, false);
            }
            try {
                foreach ($row['fields'] as $name => $field) {
                    $value = $field['type'] === 'gallery' ? $field['next'] : ($field['next'][0] ?? 0);
                    update_field($field['key'], $value, $id);
                    $actual = get_post_meta($id, $name, true);
                    $actual = $field['type'] === 'gallery' ? array_map('intval', (array) $actual) : (int) $actual;
                    if ($actual !== $value) throw new RuntimeException('画像設定の保存確認に失敗: ' . $row['slug']);
                }
            } catch (Throwable $error) {
                $this->restore_meta($id, $before);
                throw $error;
            }
            foreach ($before as $key => $_) $state['applied'][$id][$key] = get_post_meta($id, $key, false);
            update_option(self::STATE, $state, false);
            // 画像保存後に既存の公開キャッシュ再検証フックを通す。
            wp_update_post(['ID' => $id]);
            ++$count;
        }
        return $count . '投稿の画像設定を更新しました。';
    }

    /** 復元は画像メタだけを対象とし、新規・既存の画像ファイルは削除しない。 */
    private function restore_meta(int $id, array $values): void {
        foreach ($values as $key => $entries) {
            delete_post_meta($id, $key);
            foreach ($entries as $entry) add_post_meta($id, $key, $entry);
        }
        clean_post_cache($id);
    }

    /** 管理者の通常フォーム＋nonceで実行し、公開APIや任意コード実行口を設けない。 */
    public function page(): void {
        $notice = '';
        $locked = false;
        try {
            $this->load();
            $rows = $this->plan();
            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                check_admin_referer('rishiri-image-repair');
                if (!add_option(self::LOCK, time(), '', false)) throw new RuntimeException('別の移行処理が実行中です。');
                $locked = true;
                $action = sanitize_key($_POST['repair_action'] ?? '');
                if ($action === 'import') $notice = $this->import($rows);
                elseif ($action === 'apply') $notice = $this->apply($rows);
                elseif ($action !== 'audit') throw new RuntimeException('不明な操作');
                $rows = $this->plan();
            }
            echo '<div class="wrap"><h1>利尻 投稿画像の照合・移行</h1><p>対象は固定パッケージ内の公開投稿の画像のみ。既存画像はSHA-256で再利用し、画像ファイルの削除は行いません。</p>';
            if ($notice) echo '<div class="notice notice-success"><p>' . esc_html($notice) . '</p></div>';
            $missing = [];
            foreach ($this->files as $rel => $file) if (empty($this->hash_ids[$file['sha256']])) $missing[] = $rel;
            $changed = count(array_filter($rows, fn($row) => $row['changed']));
            echo '<p id="repair-summary">対象投稿: ' . count($rows) . ' / 対象ファイル: ' . count($this->files) . ' / 未登録ファイル: ' . count($missing) . ' / 要修正投稿: ' . $changed . '</p>';
            echo '<form method="post">';
            wp_nonce_field('rishiri-image-repair');
            echo '<button class="button" name="repair_action" value="audit">再照合</button> ';
            echo '<button class="button" name="repair_action" value="import"' . (!$missing ? ' disabled' : '') . '>不足画像を登録（最大5件）</button> ';
            echo '<button class="button button-primary" name="repair_action" value="apply"' . ($missing || !$changed ? ' disabled' : '') . '>画像の紐付けを反映</button></form>';
            echo '<h2>照合結果（0は未登録）</h2><pre id="repair-report" style="white-space:pre-wrap">' . esc_html(wp_json_encode(['missing' => $missing, 'posts' => $rows], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)) . '</pre>';
            echo '<h2>変更前の画像設定と実行記録</h2><pre id="repair-backup" style="white-space:pre-wrap">' . esc_html(wp_json_encode(get_option(self::STATE, []), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)) . '</pre></div>';
        } catch (Throwable $error) {
            echo '<div class="wrap"><h1>画像移行を停止しました</h1><p>' . esc_html($error->getMessage()) . '</p></div>';
        } finally {
            if ($locked) delete_option(self::LOCK);
            if ($this->zip instanceof ZipArchive) $this->zip->close();
        }
    }
}

add_action('admin_menu', function (): void {
    add_management_page('利尻画像移行', '利尻画像移行', 'manage_options', 'rishiri-image-repair', [new RishiriImageRepair(), 'page']);
});
