<?php
/**
 * ヘッドレス運用向けのWordPress出力制御。
 *
 * WordPress側のフロントエンド露出を抑え、SEOはNext.js側に集約します。
 */

if (!defined('ABSPATH')) {
    exit;
}

add_filter('wp_robots', function (array $robots): array {
    // WordPress側は検索エンジンに登録させず、正式なSEOはNext.js側で管理します。
    $robots['noindex'] = true;
    $robots['nofollow'] = true;

    return $robots;
});

add_action('send_headers', function (): void {
    // テンプレート側のwp_head有無に依存しないよう、HTTPヘッダでもnoindexを明示します。
    header('X-Robots-Tag: noindex, nofollow', true);
});

add_action('init', function (): void {
    // ヘッドレス運用では不要な絵文字関連の出力を止めます。
    remove_action('wp_head', 'print_emoji_detection_script', 7);
    remove_action('admin_print_scripts', 'print_emoji_detection_script');
    remove_action('wp_print_styles', 'print_emoji_styles');
    remove_action('admin_print_styles', 'print_emoji_styles');

    // RSSフィードの自動リンク出力を止めます。
    remove_action('wp_head', 'feed_links', 2);
    remove_action('wp_head', 'feed_links_extra', 3);

    // oEmbed関連の自動出力を止めます。
    remove_action('wp_head', 'wp_oembed_add_discovery_links');
    remove_action('wp_head', 'wp_oembed_add_host_js');
    remove_action('rest_api_init', 'wp_oembed_register_route');
    remove_filter('oembed_dataparse', 'wp_filter_oembed_result', 10);
});
