<?php
/**
 * リシリクルートで使用するカスタム投稿タイプの登録。
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * 求人・観光地・イベント・移住者の声のCPTを登録します。
 */
function rishirecruit2026_register_custom_post_types(): void
{
    register_post_type(
        'job_posting',
        [
            'labels' => [
                'name'               => __('求人', 'rishirecruit2026'),
                'singular_name'      => __('求人', 'rishirecruit2026'),
                'menu_name'          => __('求人', 'rishirecruit2026'),
                'name_admin_bar'     => __('求人', 'rishirecruit2026'),
                'add_new'            => __('新規追加', 'rishirecruit2026'),
                'add_new_item'       => __('求人を新規追加', 'rishirecruit2026'),
                'new_item'           => __('新規求人', 'rishirecruit2026'),
                'edit_item'          => __('求人を編集', 'rishirecruit2026'),
                'view_item'          => __('求人を表示', 'rishirecruit2026'),
                'all_items'          => __('求人一覧', 'rishirecruit2026'),
                'search_items'       => __('求人を検索', 'rishirecruit2026'),
                'not_found'          => __('求人が見つかりませんでした。', 'rishirecruit2026'),
                'not_found_in_trash' => __('ゴミ箱に求人はありません。', 'rishirecruit2026'),
            ],
            'public'              => true,
            'show_in_rest'        => true,
            'show_in_graphql'     => true,
            'graphql_single_name' => 'jobPosting',
            'graphql_plural_name' => 'jobPostings',
            'supports'            => ['title', 'editor', 'thumbnail'],
            'menu_icon'           => 'dashicons-businessperson',
        ]
    );

    register_post_type(
        'touristspot',
        [
            'labels' => [
                'name'               => __('観光地', 'rishirecruit2026'),
                'singular_name'      => __('観光地', 'rishirecruit2026'),
                'menu_name'          => __('観光地', 'rishirecruit2026'),
                'name_admin_bar'     => __('観光地', 'rishirecruit2026'),
                'add_new'            => __('新規追加', 'rishirecruit2026'),
                'add_new_item'       => __('観光地を新規追加', 'rishirecruit2026'),
                'new_item'           => __('新規観光地', 'rishirecruit2026'),
                'edit_item'          => __('観光地を編集', 'rishirecruit2026'),
                'view_item'          => __('観光地を表示', 'rishirecruit2026'),
                'all_items'          => __('観光地一覧', 'rishirecruit2026'),
                'search_items'       => __('観光地を検索', 'rishirecruit2026'),
                'not_found'          => __('観光地が見つかりませんでした。', 'rishirecruit2026'),
                'not_found_in_trash' => __('ゴミ箱に観光地はありません。', 'rishirecruit2026'),
            ],
            'public'              => true,
            'show_in_rest'        => true,
            'show_in_graphql'     => true,
            'graphql_single_name' => 'touristspot',
            'graphql_plural_name' => 'touristspots',
            'supports'            => ['title', 'editor', 'thumbnail'],
            'menu_icon'           => 'dashicons-location',
        ]
    );

    register_post_type(
        'event',
        [
            'labels' => [
                'name'               => __('イベント', 'rishirecruit2026'),
                'singular_name'      => __('イベント', 'rishirecruit2026'),
                'menu_name'          => __('イベント', 'rishirecruit2026'),
                'name_admin_bar'     => __('イベント', 'rishirecruit2026'),
                'add_new'            => __('新規追加', 'rishirecruit2026'),
                'add_new_item'       => __('イベントを新規追加', 'rishirecruit2026'),
                'new_item'           => __('新規イベント', 'rishirecruit2026'),
                'edit_item'          => __('イベントを編集', 'rishirecruit2026'),
                'view_item'          => __('イベントを表示', 'rishirecruit2026'),
                'all_items'          => __('イベント一覧', 'rishirecruit2026'),
                'search_items'       => __('イベントを検索', 'rishirecruit2026'),
                'not_found'          => __('イベントが見つかりませんでした。', 'rishirecruit2026'),
                'not_found_in_trash' => __('ゴミ箱にイベントはありません。', 'rishirecruit2026'),
            ],
            'public'              => true,
            'show_in_rest'        => true,
            'show_in_graphql'     => true,
            'graphql_single_name' => 'event',
            'graphql_plural_name' => 'events',
            'supports'            => ['title', 'editor', 'thumbnail'],
            'menu_icon'           => 'dashicons-calendar-alt',
        ]
    );

    register_post_type(
        'testimonial',
        [
            'labels' => [
                'name'               => __('移住者の声', 'rishirecruit2026'),
                'singular_name'      => __('移住者の声', 'rishirecruit2026'),
                'menu_name'          => __('移住者の声', 'rishirecruit2026'),
                'name_admin_bar'     => __('移住者の声', 'rishirecruit2026'),
                'add_new'            => __('新規追加', 'rishirecruit2026'),
                'add_new_item'       => __('新規追加', 'rishirecruit2026'),
                'new_item'           => __('新規移住者の声', 'rishirecruit2026'),
                'edit_item'          => __('編集', 'rishirecruit2026'),
                'view_item'          => __('移住者の声を表示', 'rishirecruit2026'),
                'all_items'          => __('移住者の声一覧', 'rishirecruit2026'),
                'search_items'       => __('移住者の声を検索', 'rishirecruit2026'),
                'not_found'          => __('移住者の声が見つかりませんでした。', 'rishirecruit2026'),
                'not_found_in_trash' => __('ゴミ箱に移住者の声はありません。', 'rishirecruit2026'),
            ],
            'public'              => true,
            'show_in_rest'        => true,
            'show_in_graphql'     => true,
            'graphql_single_name' => 'testimonial',
            'graphql_plural_name' => 'testimonials',
            'supports'            => ['title', 'editor', 'thumbnail'],
            'menu_icon'           => 'dashicons-format-quote',
        ]
    );
}
add_action('init', 'rishirecruit2026_register_custom_post_types');
