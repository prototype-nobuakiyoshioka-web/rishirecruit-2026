<?php
/**
 * testimonial CPT 用 ACF フィールドグループ登録。
 *
 * 移住者の声の編集フィールドを2タブ構成で定義し、WPGraphQLにも公開します。
 */

if (!defined('ABSPATH')) {
    exit;
}

add_action('acf/init', function (): void {
    if (!function_exists('acf_add_local_field_group')) {
        return;
    }

    acf_add_local_field_group([
        'key' => 'group_testimonial',
        'title' => '移住者の声',
        'fields' => [
            [
                'key' => 'field_tm_tab_profile',
                'label' => 'プロフィール',
                'type' => 'tab',
                'instructions' => '一覧表示とプロフィール情報、関連求人を設定します。',
                'placement' => 'top',
                'show_in_graphql' => 1,
            ],
            [
                'key' => 'field_tm_catch_copy',
                'label' => 'キャッチコピー',
                'name' => 'catch_copy',
                'type' => 'text',
                'instructions' => '一覧ページの見出し文を入力してください。例: 子育てしながら、海の近くで働く',
                'required' => 1,
                'show_in_graphql' => 1,
            ],
            [
                'key' => 'field_tm_photo',
                'label' => 'メイン写真',
                'name' => 'photo',
                'type' => 'image',
                'instructions' => '顔写真または暮らしの様子の写真を選択してください。',
                'required' => 1,
                'return_format' => 'array',
                'preview_size' => 'medium',
                'library' => 'all',
                'show_in_graphql' => 1,
            ],
            [
                'key' => 'field_tm_profile_before',
                'label' => '移住前の暮らし',
                'name' => 'profile_before',
                'type' => 'text',
                'instructions' => '移住前の居住地や仕事を入力してください。例: 東京都・会社員',
                'required' => 0,
                'show_in_graphql' => 1,
            ],
            [
                'key' => 'field_tm_profile_after',
                'label' => '現在の暮らし',
                'name' => 'profile_after',
                'type' => 'text',
                'instructions' => '現在の居住地や仕事を入力してください。例: 利尻富士町・役場勤務',
                'required' => 0,
                'show_in_graphql' => 1,
            ],
            [
                'key' => 'field_tm_migration_year',
                'label' => '移住年',
                'name' => 'migration_year',
                'type' => 'text',
                'instructions' => '移住した年を入力してください。例: 2023年',
                'required' => 0,
                'show_in_graphql' => 1,
            ],
            [
                'key' => 'field_tm_related_job',
                'label' => '関連求人',
                'name' => 'related_job',
                'type' => 'post_object',
                'instructions' => 'この移住者が応募した求人があれば選択してください。任意項目です。',
                'required' => 0,
                'post_type' => ['job_posting'],
                'return_format' => 'id',
                'multiple' => 0,
                'allow_null' => 1,
                'ui' => 1,
                'show_in_graphql' => 1,
            ],
            [
                'key' => 'field_tm_tab_interview',
                'label' => 'インタビュー本文',
                'type' => 'tab',
                'instructions' => '導入文、本文、暮らしの写真を設定します。',
                'placement' => 'top',
                'show_in_graphql' => 1,
            ],
            [
                'key' => 'field_tm_lead_text',
                'label' => 'リード文',
                'name' => 'lead_text',
                'type' => 'textarea',
                'instructions' => '編集側が書く導入の要約文を2-3文程度で入力してください。',
                'required' => 1,
                'rows' => 4,
                'new_lines' => 'br',
                'show_in_graphql' => 1,
            ],
            [
                'key' => 'field_tm_interview_body',
                'label' => 'インタビュー本文',
                'name' => 'interview_body',
                'type' => 'wysiwyg',
                'instructions' => 'インタビュー本文を入力してください。写真を文中に挿入することも可能です。',
                'required' => 1,
                'tabs' => 'all',
                'toolbar' => 'full',
                'media_upload' => 1,
                'show_in_graphql' => 1,
            ],
            [
                'key' => 'field_tm_gallery_images',
                'label' => '暮らしの写真',
                'name' => 'gallery_images',
                'type' => 'gallery',
                'instructions' => '暮らしの様子の写真を選択してください。複数枚登録できます。',
                'required' => 0,
                'return_format' => 'array',
                'preview_size' => 'medium',
                'insert' => 'append',
                'library' => 'all',
                'show_in_graphql' => 1,
            ],
        ],
        'location' => [
            [
                [
                    'param' => 'post_type',
                    'operator' => '==',
                    'value' => 'testimonial',
                ],
            ],
        ],
        'menu_order' => 0,
        'position' => 'normal',
        'style' => 'default',
        'label_placement' => 'top',
        'instruction_placement' => 'label',
        'active' => true,
        'show_in_rest' => 1,
        'show_in_graphql' => 1,
        'graphql_field_name' => 'testimonialFields',
    ]);
});
