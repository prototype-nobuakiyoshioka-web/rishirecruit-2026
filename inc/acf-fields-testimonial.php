<?php
/**
 * testimonial CPT 用 ACF フィールドグループ登録。
 *
 * 既存サイト rishirecruit.com のトップ移住者スライダー ".slide_txt" の
 * DOM 構造に忠実に合わせた最小構成:
 *   - .slide_name .name         → post_title（ACFフィールドは不要）
 *   - .slide_date .age          → age (text)
 *   - .slide_coppy-headeing     → catch_copy (textarea, <br>保持)
 *   - .slide_img (親li)          → photo (image)
 *   - dl > dt.question/dd.answer → qa_list (repeater: question + answer)
 *
 * WPGraphQL にも公開する（graphql_field_name: testimonialFields）。
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
                // 経過年ラベル。単独人物「移住6年目」、複数人「移住10年目・18年目」の両方に対応するため text で扱う。
                'key' => 'field_tm_age',
                'label' => '経過年',
                'name' => 'age',
                'type' => 'text',
                'instructions' => '移住からの経過年を「移住N年目」形式で入力してください。例: 移住6年目 / 移住10年目・18年目（複数人の場合は中黒で連結）',
                'required' => 1,
                'show_in_graphql' => 1,
            ],
            [
                // キャッチコピー。改行を <br> に変換して保持するため textarea + new_lines: 'br'。
                'key' => 'field_tm_catch_copy',
                'label' => 'キャッチコピー',
                'name' => 'catch_copy',
                'type' => 'textarea',
                'instructions' => "スライドの見出しコピー。改行位置は表示にそのまま反映されます。\n例:\n「また来たい」じゃなく、\n「ここで生きたい」と思えた島",
                'required' => 1,
                'rows' => 3,
                'new_lines' => 'br',
                'show_in_graphql' => 1,
            ],
            [
                // スライドで表示する顔写真・暮らしの写真。既存キー field_tm_photo を継続使用。
                'key' => 'field_tm_photo',
                'label' => 'メイン写真',
                'name' => 'photo',
                'type' => 'image',
                'instructions' => 'スライドで表示するメイン写真（顔写真または暮らしの様子）を選択してください。',
                'required' => 1,
                'return_format' => 'array',
                'preview_size' => 'medium',
                'library' => 'all',
                'show_in_graphql' => 1,
            ],
            [
                // 質問と回答のペア。人により5〜6組程度で可変。
                'key' => 'field_tm_qa_list',
                'label' => 'Q&A リスト',
                'name' => 'qa_list',
                'type' => 'repeater',
                'instructions' => '質問と回答のペアを追加してください。人によって5〜6組程度が目安です。',
                'required' => 1,
                'min' => 1,
                'max' => 0,
                'layout' => 'block',
                'button_label' => 'Q&A を追加',
                'show_in_graphql' => 1,
                'sub_fields' => [
                    [
                        'key' => 'field_tm_qa_question',
                        'label' => '質問',
                        'name' => 'question',
                        'type' => 'text',
                        'instructions' => '「Q.」から始まる質問文を入力してください。例: Q.お仕事は何をされていますか？',
                        'required' => 1,
                        'show_in_graphql' => 1,
                    ],
                    [
                        'key' => 'field_tm_qa_answer',
                        'label' => '回答',
                        'name' => 'answer',
                        'type' => 'textarea',
                        'instructions' => '回答本文を入力してください。改行位置は表示にそのまま反映されます。',
                        'required' => 1,
                        'rows' => 6,
                        'new_lines' => 'br',
                        'show_in_graphql' => 1,
                    ],
                ],
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
