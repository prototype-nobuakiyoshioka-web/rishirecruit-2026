<?php
/**
 * WordPress更新時のNext.js On-demand Revalidation通知。
 *
 * 対象4CPTの公開状態が変化したら、Next.jsの /api/revalidate へ通知して
 * 該当ページのISRキャッシュを即時再検証させます。
 *
 * エンドポイントとシークレットはテーマに直書きせず、外部から注入します(行政案件の堅牢性重視)。
 *   1. 定数 RISHI_REVALIDATE_ENDPOINT / RISHI_REVALIDATE_SECRET (mu-plugin等で define)
 *   2. なければ環境変数 getenv('RISHI_REVALIDATE_ENDPOINT' / 'RISHI_REVALIDATE_SECRET')
 * どちらも無ければ何もしません(未設定時はサイレントに無効化)。
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * post_type から再検証すべきNext.js側パスを算出します。
 * 一覧パス・詳細パス・トップ(3Dシーンの投稿スライダー)を対象にします。
 */
function rishi_revalidate_paths_for(string $post_type, string $slug): array {
    // post_type → Next.jsのセグメント対応表。
    $segments = array(
        'job_posting' => 'jobs',
        'touristspot' => 'spots',
        'event'       => 'events',
        'testimonial' => 'voices',
    );

    if (!isset($segments[$post_type])) {
        return array();
    }

    $segment = $segments[$post_type];

    // トップは全CPTの投稿スライダーが載るため常に含めます。
    $paths = array('/', '/' . $segment);

    if ($slug !== '') {
        $paths[] = '/' . $segment . '/' . $slug;
    }

    return $paths;
}

add_action('transition_post_status', function (string $new_status, string $old_status, WP_Post $post): void {
    // リビジョン・自動保存は対象外。
    if (wp_is_post_revision($post->ID) || wp_is_post_autosave($post->ID)) {
        return;
    }

    // 公開状態の変化のみ通知(draft→draft等は無視)。公開/非公開化/削除の双方を拾う。
    if ($new_status !== 'publish' && $old_status !== 'publish') {
        return;
    }

    $paths = rishi_revalidate_paths_for($post->post_type, (string) $post->post_name);

    // 対象4CPT以外は何もしない。
    if (empty($paths)) {
        return;
    }

    // エンドポイントとシークレットを外部設定から取得(定数優先、なければ環境変数)。
    $endpoint = defined('RISHI_REVALIDATE_ENDPOINT')
        ? RISHI_REVALIDATE_ENDPOINT
        : getenv('RISHI_REVALIDATE_ENDPOINT');
    $secret = defined('RISHI_REVALIDATE_SECRET')
        ? RISHI_REVALIDATE_SECRET
        : getenv('RISHI_REVALIDATE_SECRET');

    // 未設定なら通知しない(ローカルで設定前でも管理画面を壊さない)。
    if (empty($endpoint) || empty($secret)) {
        return;
    }

    // 管理画面の保存操作をブロックしないよう非同期(blocking=false)で送信。
    wp_remote_post($endpoint, array(
        'method'      => 'POST',
        'timeout'     => 5,
        'blocking'    => false,
        'headers'     => array(
            'Content-Type'  => 'application/json',
            'Authorization' => 'Bearer ' . $secret,
        ),
        'body'        => wp_json_encode(array('paths' => $paths)),
    ));
}, 10, 3);
