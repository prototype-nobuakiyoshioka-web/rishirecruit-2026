<?php
/**
 * ヘッドレス運用のための最小テンプレート。
 *
 * このテーマはWPGraphQL経由でNext.jsにデータを供給するため、
 * WordPress側では画面表示を作り込みません。
 * ただしプラグイン互換性のため、wp_head() / wp_body_open() / wp_footer()
 * の各フックは必ず呼び出します。
 *
 * SEO 制御（noindex,nofollow 等）は `inc/headless-config.php` の
 * `wp_robots` フィルタに集約します。本ファイルでは meta タグを直接書きません。
 */

if (!defined('ABSPATH')) {
    exit;
}
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title><?php bloginfo('name'); ?></title>
    <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
    <main>
        <p>このサイトはヘッドレス運用です。コンテンツはAPI経由で配信されます。</p>
    </main>
    <?php wp_footer(); ?>
</body>
</html>
