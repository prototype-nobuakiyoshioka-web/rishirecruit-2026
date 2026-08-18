<?php
/**
 * カスタムタクソノミー登録
 *
 * エリア(area): 島内のエリア区分を管理する。
 * job_posting / touristspot / event の3CPTで共有し、
 * 3Dマップ上のエリアピンと投稿の紐付けに使用する。
 */

if (!defined('ABSPATH')) {
    exit;
}

add_action('init', function () {
    // 投稿・観光地・イベントを横断して使うエリア分類を登録します。
    register_taxonomy(
        'area',
        ['job_posting', 'touristspot', 'event'],
        [
            'labels' => [
                'name'          => 'エリア',
                'singular_name' => 'エリア',
                'add_new_item'  => '新規エリアを追加',
                'edit_item'     => 'エリアを編集',
                'search_items'  => 'エリアを検索',
                'all_items'     => 'すべてのエリア',
            ],
            'public'              => true,
            'hierarchical'        => true,
            'show_ui'             => true,
            'show_admin_column'   => true,
            'show_in_rest'        => true,
            'show_in_graphql'     => true,
            'graphql_single_name' => 'area',
            'graphql_plural_name' => 'areas',
            'rewrite'             => ['slug' => 'area'],
        ]
    );
});
