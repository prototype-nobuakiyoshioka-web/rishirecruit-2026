<?php
/**
 * ACF Local JSON の保存先・読み込み元設定。
 *
 * フィールドグループ定義をテーマ内の acf-json に集約し、Gitで管理できるようにします。
 */

if (!defined('ABSPATH')) {
    exit;
}

add_filter('acf/settings/save_json', function (string $path): string {
    // ACF管理画面から保存したフィールド定義をテーマ配下に出力します。
    return get_stylesheet_directory() . '/acf-json';
});

add_filter('acf/settings/load_json', function (array $paths): array {
    $theme_acf_json_path = get_stylesheet_directory() . '/acf-json';

    // ACFや拡張プラグインの既定パスを残したまま、テーマの定義を追加します。
    if (!in_array($theme_acf_json_path, $paths, true)) {
        $paths[] = $theme_acf_json_path;
    }

    return $paths;
});
