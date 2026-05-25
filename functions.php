<?php
/**
 * リシリクルート2026テーマの機能読み込み。
 *
 * ヘッドレス運用に必要なWordPress側の最小機能だけを登録します。
 */

if (!defined('ABSPATH')) {
    exit;
}

// カスタム投稿タイプを登録します。
require_once get_template_directory() . '/inc/cpt-registration.php';
