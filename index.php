<?php
/**
 * ヘッドレス運用のための最小テンプレート。
 *
 * このテーマはWPGraphQL経由でNext.jsにデータを供給するため、
 * WordPress側では画面表示を作り込みません。
 */

if (!defined('ABSPATH')) {
    exit;
}
?>
<!doctype html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title><?php bloginfo('name'); ?></title>
</head>
<body>
    <main>
        <p>このWordPressテーマはヘッドレス運用専用です。コンテンツはAPI経由で配信されます。</p>
    </main>
</body>
</html>
