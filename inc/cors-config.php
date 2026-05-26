<?php
/**
 * ヘッドレス運用のためのCORS設定。
 *
 * Next.jsフロントエンドからWordPress GraphQL APIへ安全にアクセスできるようにします。
 */

if (!defined('ABSPATH')) {
    exit;
}

add_action('init', function (): void {
    // 許可するフロントエンドのオリジンを明示的に管理します。
    $allowed_origins = [
        'http://localhost:3000',
        'https://rishirecruit.com',
        // 将来のステージング環境: 'https://staging.rishirecruit.com',
    ];

    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

    if (in_array($origin, $allowed_origins, true)) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: Authorization, Content-Type');
        header('Access-Control-Allow-Credentials: true');
        header('Vary: Origin', false);
    }

    // GraphQLのpreflightに対して早期に正常応答します。
    if ('OPTIONS' === ($_SERVER['REQUEST_METHOD'] ?? '')) {
        status_header(200);
        exit;
    }
});
