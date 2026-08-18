<?php
/**
 * リシリクルート2026テーマの機能読み込み。
 *
 * ヘッドレス運用に必要なWordPress側の最小機能だけを登録します。
 */

if (!defined('ABSPATH')) {
    exit;
}

// テーマの基本設定を登録します。
require_once get_template_directory() . '/inc/theme-setup.php';

// カスタム投稿タイプを登録します。
require_once get_template_directory() . '/inc/cpt-registration.php';

// 共有タクソノミーを登録します。
require_once get_template_directory() . '/inc/taxonomy-registration.php';

// WPGraphQLの安全性とパフォーマンス設定を登録します。
require_once get_template_directory() . '/inc/graphql-config.php';

// Next.jsフロントエンドからのCORSアクセスを制御します。
require_once get_template_directory() . '/inc/cors-config.php';

// ヘッドレス運用向けの不要機能無効化とSEO制御を登録します。
require_once get_template_directory() . '/inc/headless-config.php';

// ACF Local JSON の保存先・読み込み元を登録します。
require_once get_template_directory() . '/inc/acf-local-json.php';

// 求人CPTのACFフィールドグループを登録します。
require_once get_template_directory() . '/inc/acf-fields-job-posting.php';

// 観光地CPTのACFフィールドグループを登録します。
require_once get_template_directory() . '/inc/acf-fields-touristspot.php';

// イベントCPTのACFフィールドグループを登録します。
require_once get_template_directory() . '/inc/acf-fields-event.php';

// 移住者の声CPTのACFフィールドグループを登録します。
require_once get_template_directory() . '/inc/acf-fields-testimonial.php';
