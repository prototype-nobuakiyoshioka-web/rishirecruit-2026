<?php
/**
 * WPGraphQLの基本設定。
 *
 * ヘッドレス運用で必要な公開APIの安全性とパフォーマンスを調整します。
 */

if (!defined('ABSPATH')) {
    exit;
}

add_filter(
    'graphql_get_setting_section_field_value',
    function ($value, $default_value, string $option_name, array $section_fields, string $section_name) {
        if ('graphql_general_settings' !== $section_name) {
            return $value;
        }

        // 深すぎるクエリと大きすぎるバッチリクエストをテーマ側で制限します。
        $is_development = in_array(wp_get_environment_type(), ['local', 'development'], true);
        $theme_settings = [
            'query_depth_enabled'          => 'on',
            'query_depth_max'              => 15,
            'batch_queries_enabled'        => 'on',
            'batch_limit'                  => 5,
            'query_analyzer_enabled'       => 'on',
            'public_introspection_enabled' => $is_development ? 'on' : 'off',
            'debug_mode_enabled'           => $is_development ? 'on' : 'off',
        ];

        return $theme_settings[$option_name] ?? $value;
    },
    10,
    5
);

add_filter(
    'graphql_validation_rules',
    function (array $validation_rules): array {
        // webonyx/graphql-php の複雑性ルールが利用できる場合のみ追加します。
        if (class_exists(\GraphQL\Validator\Rules\QueryComplexity::class)) {
            $validation_rules['query_complexity'] = new \GraphQL\Validator\Rules\QueryComplexity(500);
        }

        return $validation_rules;
    }
);

add_filter(
    'graphql_connection_max_query_amount',
    function (): int {
        // 一度に取得できる件数を抑え、Next.js側ではページング前提にします。
        return 100;
    }
);

add_filter(
    'graphql_debug_enabled',
    function (bool $enabled): bool {
        // デバッグ情報はローカル・開発環境だけで有効化します。
        return in_array(wp_get_environment_type(), ['local', 'development'], true);
    }
);
