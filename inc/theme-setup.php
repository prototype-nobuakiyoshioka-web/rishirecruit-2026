<?php
/**
 * テーマの基本設定。
 *
 * 翻訳ファイルの読み込みと、ヘッドレスCMSとして必要なテーマサポートを登録します。
 */

if (!defined('ABSPATH')) {
    exit;
}

add_action('after_setup_theme', function (): void {
    // テーマ内の翻訳ファイルを読み込みます。
    load_theme_textdomain('rishirecruit2026', get_template_directory() . '/languages');

    // 各CPTでアイキャッチ画像を扱えるようにします。
    add_theme_support('post-thumbnails');
});
