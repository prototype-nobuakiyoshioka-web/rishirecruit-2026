<?php
/**
 * Moteru の利尻富士町求人ページから抽出した 12 件を job_posting として一括作成する。
 *
 * 実行方法（Local by Flywheel の「Open Site Shell」内で）:
 *   wp eval-file wp-content/themes/rishirecruit2026/scripts/import-moteru-jobs.php
 *
 * 実行後、Tools > Export で「求人」を書き出し、Lolipop 側で Tools > Import する。
 *
 * 冪等性: post_name (slug) が一致する既存投稿があれば更新、なければ新規作成。
 */

if (!defined('ABSPATH')) {
    exit;
}

$jobs = [
    [
        'slug' => 'community-club-support',
        'title' => '地域クラブのサポートスタッフ',
        'catch_copy' => '地域クラブ活動と放課後教室の運営をサポートするアルバイト・パート職員募集。',
        'description' => "地域クラブ活動の運営支援や放課後教室の企画・運営を担当します。\n行政・学校・地域団体との調整業務も行い、子どもたちや地域を支える仕事です。",
        'required_qualifications' => "未経験OK\n普通自動車免許必須",
        'employment_type' => 'fiscal_year_part',
        'job_category' => '地域・学校コーディネーター',
        'recruitment_count' => '3名',
        'salary' => '時給1,200円〜（月給例170,000〜200,000円）',
        'salary_detail' => "月157時間勤務、平均勤務日数20〜21日/月\n固定残業代なし",
        'work_hours' => 'シフト制 08:30〜17:00',
        'work_hours_detail' => "月157時間\n休憩60分",
        'holiday' => "週休2日制\n有給休暇\n介護休暇\n育児休業",
        'social_insurance' => "厚生年金保険\n雇用保険",
        'benefits' => "住まいのサポートあり\n車・バイク通勤OK",
        'housing_support_available' => 1,
        'housing_support_detail' => '住まいのサポートあり（詳細は面談にて）',
        'smoking_policy' => '敷地内全面禁煙',
        'trial_period' => 'なし',
        'work_address' => '北海道利尻富士町鴛泊字富士野6',
        'work_address_detail' => '利尻富士町役場',
        'pin_location' => 'town_hall',
        'application_flow' => "本フォームからご応募いただけます。担当より追ってご連絡いたします。\n電話でのお問い合わせ: 0163-82-1111",
    ],
    [
        'slug' => 'construction-department-staff',
        'title' => '建設課の受付事務スタッフ',
        'catch_copy' => '土木技術職員として建設課で窓口対応と現場業務を担う正社員募集。',
        'description' => "工事業者からの申請対応や書類処理などの窓口業務、\n住民からの依頼による道路・河川の維持管理・点検・補修の手配を行います。",
        'required_qualifications' => "普通自動車免許（所持または取得見込）\n地方公務員法第16条の欠格条項に該当しない方\n大学・高専・専門学校・高等学校で土木専門課程を履修または卒業見込みの方",
        'employment_type' => 'regular',
        'job_category' => '土木技術職員',
        'recruitment_count' => '3名',
        'salary' => '月給201,000〜220,000円',
        'salary_detail' => "短大卒 201,000円 / 大学卒 220,000円\n期末手当・勤勉手当・寒冷地手当・住居手当・通勤手当・扶養手当",
        'work_hours' => '8:00〜17:15',
        'work_hours_detail' => "月164時間\n休憩75分\n固定時間制",
        'holiday' => "完全週休2日制（土日祝）\n年末年始（12/31〜1/5）\n年次有給休暇（年20日付与、初年度最大15日）\n夏季休暇 / 結婚休暇 / 忌引休暇 / 出産休暇",
        'social_insurance' => "健康保険\n厚生年金保険\n雇用保険\n労災保険",
        'benefits' => "社保完備\n市町村職員共済組合加入\n退職手当組合加入\n住宅手当あり",
        'housing_support_available' => 1,
        'housing_support_detail' => '住宅手当あり',
        'smoking_policy' => '敷地内全面禁煙',
        'trial_period' => '6ヶ月（給与・勤務時間は本採用時と同じ）',
        'work_address' => '北海道利尻富士町鴛泊字富士野6',
        'work_address_detail' => '利尻富士町役場',
        'pin_location' => 'town_hall',
        'application_flow' => "本フォームからご応募いただけます。担当より追ってご連絡いたします。\n電話でのお問い合わせ: 0163-82-1111",
    ],
    [
        'slug' => 'nurse-day-service',
        'title' => 'デイサービスの看護職員',
        'catch_copy' => '利尻富士町デイサービスセンターの看護業務全般（看護師 / 准看護師）募集。',
        'description' => "看護業務全般（食事介助、排せつ、採血、通院付添）、\n夜勤・待機、介護サポート、記録入力、医師指示による処置を行います。",
        'required_qualifications' => "看護師免許（正看護師または准看護師のいずれか）",
        'employment_type' => 'regular',
        'job_category' => '看護師',
        'recruitment_count' => '3名',
        'salary' => '月給188,000円〜',
        'salary_detail' => "期末勤勉手当（年4.6月）\n寒冷地手当（11〜3月）\n住居手当 / 通勤手当 / 扶養手当 / 時間外勤務手当",
        'work_hours' => '変形労働時間制（月168時間）',
        'work_hours_detail' => "7:30〜16:15\n8:30〜17:15\n16:30〜翌9:00（仮眠・休憩別途あり）",
        'holiday' => "週休2日制（シフト制）\n有給休暇 / 夏季休暇 / 結婚休暇 / 忌引休暇 / 出産等特別休暇",
        'social_insurance' => "健康保険\n厚生年金保険\n雇用保険\n労災保険\n市町村職員共済組合\n退職手当組合",
        'benefits' => "交通費支給\n住宅手当\n社保完備",
        'housing_support_available' => 1,
        'housing_support_detail' => '住宅手当あり',
        'smoking_policy' => '敷地内全面禁煙',
        'trial_period' => '6ヶ月（本採用と同条件）',
        'work_address' => '北海道利尻郡利尻富士町鬼脇字鬼脇205-1',
        'work_address_detail' => '利尻富士町デイサービスセンター',
        'pin_location' => 'oniwaki',
        'application_flow' => "本フォームからご応募いただけます。担当より追ってご連絡いたします。\n電話でのお問い合わせ: 0163-82-1111",
    ],
    [
        'slug' => 'care-staff-day-service',
        'title' => 'デイサービスの介護職員（正社員）',
        'catch_copy' => '利尻富士町デイサービスセンターの介護職員（正社員）募集。',
        'description' => "食事、入浴、排せつなどの生活サポート、身体介助、夜勤業務、\nレクリエーション、介護記録入力などを行います。",
        'required_qualifications' => "介護福祉士、実務者研修、初任者研修のいずれか必須\n実務未経験者も相談可",
        'employment_type' => 'regular',
        'job_category' => '介護職',
        'recruitment_count' => '3名',
        'salary' => '月給188,000円〜',
        'salary_detail' => "収入例: 高卒188,000円（資格・経歴で加算あり）\n期末勤勉手当（年4.6月）\n寒冷地手当 / 住居手当 / 通勤手当 / 扶養手当 / 時間外勤務手当",
        'work_hours' => '変形労働時間制（月168時間）',
        'work_hours_detail' => "7:30〜16:15\n8:30〜17:15\n16:30〜翌9:00（夜勤、仮眠・休憩別途あり）\n休憩1時間",
        'holiday' => "週休2日制（シフト制）\n有給休暇 / 夏季休暇 / 結婚休暇 / 忌引休暇 / 出産特別休暇",
        'social_insurance' => "健康保険\n厚生年金保険\n雇用保険\n労災保険\n市町村職員共済組合\n退職手当組合",
        'benefits' => "住宅手当あり\n交通費支給\n研修・サポート体制完備\n車・バイク通勤OK",
        'housing_support_available' => 1,
        'housing_support_detail' => '住宅手当あり',
        'smoking_policy' => '敷地内全面禁煙',
        'trial_period' => '6ヶ月（給与・勤務時間は本採用時と同じ）',
        'work_address' => '北海道利尻郡利尻富士町鬼脇字鬼脇205-1',
        'work_address_detail' => "利尻富士町デイサービスセンター\n令和2年完成の新施設。鴛泊フェリーターミナルより車で30分。",
        'pin_location' => 'oniwaki',
        'application_flow' => "本フォームからご応募いただけます。担当より追ってご連絡いたします。\n電話でのお問い合わせ: 0163-82-1111",
    ],
    [
        'slug' => 'airport-guide-staff',
        'title' => '空港案内スタッフ',
        'catch_copy' => '利尻空港での案内業務。観光客や地元利用者に対応するアルバイト・パート募集。',
        'description' => "利尻空港での案内業務。顧客へのご案内、到着・出発時の誘導業務を担当し、\n観光客や地元利用者に対応します。",
        'required_qualifications' => "高校卒業以上\n未経験可",
        'employment_type' => 'fiscal_year_part',
        'job_category' => '観光・施設案内業務',
        'recruitment_count' => '3名',
        'salary' => '月給60,000〜100,000円（季節による）',
        'salary_detail' => "5月、10月〜3月: 60,000円\n6月〜9月: 100,000円\n通勤手当別途支給",
        'work_hours' => 'シフト制（月50時間）',
        'work_hours_detail' => "5月、10月〜3月: 14:00〜17:00\n6月〜9月: 13:00〜17:00\n※運航状況により変更あり",
        'holiday' => "シフト制\n有給休暇\n都合に合わせた勤務相談可",
        'social_insurance' => '記載なし',
        'benefits' => "丁寧な研修・フォロー体制\n公的機関による安定雇用\n移住・住まいサポート\n車・バイク通勤可",
        'housing_support_available' => 1,
        'housing_support_detail' => '移住・住まいサポートあり',
        'smoking_policy' => '敷地内全面禁煙',
        'trial_period' => 'なし',
        'work_address' => '北海道利尻郡利尻富士町鴛泊字本泊1143',
        'work_address_detail' => '利尻空港内',
        'pin_location' => 'airport',
        'application_flow' => "本フォームからご応募いただけます。担当より追ってご連絡いたします。\n電話でのお問い合わせ: 0163-82-1111",
    ],
    [
        'slug' => 'registered-nurse-senior-care',
        'title' => '正看護師（利尻島老人保健施設）',
        'catch_copy' => '経験者向け正看護師（医療機関または福祉施設等8年以上）。年間休日125日以上・完全週休2日制。',
        'description' => "健康チェック・バイタル管理、医師の回診補助、服薬サポート、医療処置、\n記録・報告書類の作成・共有、食事・移動・排せつなどの日常介助、\nベッドメイキングやレクリエーションサポートまで担当します。",
        'required_qualifications' => "経験者のみ（医療機関または福祉施設等で8年以上の実務経験）\n看護師または准看護師（いずれか必須）",
        'employment_type' => 'regular',
        'job_category' => '看護職',
        'recruitment_count' => '3名',
        'salary' => '月給183,500〜201,000円',
        'salary_detail' => "昇給あり / 賞与年2回（前年度実績4.6ヶ月）\n期末手当 / 勤勉手当 / 通勤手当 / 扶養手当 / 住宅手当 / 寒冷地手当（11〜3月）\n時間外勤務手当 / 夜間勤務手当\n夜間看護等手当 3,300円/回 / 看護師長手当 10,000円/月",
        'work_hours' => 'シフト制（月163時間）',
        'work_hours_detail' => "日勤 8:15〜17:00（休憩1時間）\n夜勤 16:15〜9:00（休憩3時間、月6〜7回）",
        'holiday' => "年間休日125日以上\n完全週休2日制（4週8休制）\n年末年始（12/31〜1/5）\n年次有給休暇（初年度15日、2年目以降20日）\n病気休暇 / 介護休暇 / 育児休暇\n特別休暇（結婚・忌引・出産・夏季3日）",
        'social_insurance' => "健康保険\n厚生年金保険\n雇用保険\n労災保険\n北海道市町村職員共済組合\n北海道市町村職員福祉協会\n地方公務員災害補償基金\n北海道市町村職員退職手当組合",
        'benefits' => "職員住宅あり / 住宅手当あり / 赴任旅費（支給要件・上限あり）\n離島割引制度（フェリー・航空機）\n医療技術者等職員就労奨励金（50歳未満1,000千円 / 50歳以上500千円）\n昼食・夕食提供（自己負担）\n町内保育所2箇所 / 車・バイク通勤可 / 交通費支給 / 退職金あり",
        'housing_support_available' => 1,
        'housing_support_detail' => "職員住宅あり / 住宅手当あり\n赴任旅費（支給要件・上限あり）",
        'smoking_policy' => '敷地内全面禁煙',
        'trial_period' => 'なし',
        'work_address' => '北海道利尻郡利尻富士町鬼脇字金崎332',
        'work_address_detail' => "利尻島老人保健施設\nバス停「鬼脇秀峰園」から徒歩3分",
        'pin_location' => 'oniwaki',
        'application_flow' => "本フォームからご応募いただけます。担当より追ってご連絡いたします。\n電話でのお問い合わせ: 0163-82-1111",
    ],
    [
        'slug' => 'care-helper-senior-facility',
        'title' => '介護ヘルパー（利尻島老人保健施設）',
        'catch_copy' => '年間125日以上休日・完全週休2日制で働く介護ヘルパー（正社員）募集。',
        'description' => "食事・入浴・排せつサポート、身体介助、レクリエーション実施、\n介護記録・申し送り・システム入力、看護職との連携、\n歯科受診付き添いなどを行います。",
        'required_qualifications' => "介護福祉士、介護職員実務者研修、または初任者研修修了者（いずれか必須）",
        'employment_type' => 'regular',
        'job_category' => '介護職（高齢者施設スタッフ）',
        'recruitment_count' => '3名',
        'salary' => '月給183,500〜188,000円',
        'salary_detail' => "昇給制度あり\n年2回賞与（前年度実績4.6ヶ月）\n期末手当 / 勤勉手当 / 通勤手当 / 扶養手当 / 住宅手当\n寒冷地手当（11〜3月）\n時間外勤務手当 / 夜間勤務手当 / 夜間看護等手当 3,300円/回",
        'work_hours' => 'シフト制（月163時間）',
        'work_hours_detail' => "日勤早出 7:15〜16:00\n日勤遅出 9:15〜18:00\n夜勤 16:15〜翌9:00（月4〜5回）",
        'holiday' => "年間休日125日以上\n完全週休2日制（4週8休）\n年末年始休暇\n年次有給休暇 初年度15日\n病気休暇 / 特別休暇（結婚・忌引等）/ 介護休暇 / 育児休暇",
        'social_insurance' => "健康保険\n厚生年金保険\n雇用保険\n労災保険\n北海道市町村職員共済組合\n福祉協会\n災害補償基金\n退職手当組合",
        'benefits' => "赴任旅費支給\n職員住宅\n各種離島割引制度\n職員就労奨励金（50歳未満500千円 / 50歳以上250千円）\n昼食・夕食提供\n町内保育所利用可\nマイカー通勤可",
        'housing_support_available' => 1,
        'housing_support_detail' => "職員住宅あり\n赴任旅費支給",
        'smoking_policy' => '敷地内全面禁煙',
        'trial_period' => 'なし',
        'work_address' => '北海道利尻郡利尻富士町鬼脇字金崎332',
        'work_address_detail' => "利尻島老人保健施設\nバス停「鬼脇秀峰園」から徒歩3分",
        'pin_location' => 'oniwaki',
        'application_flow' => "本フォームからご応募いただけます。担当より追ってご連絡いたします。\n電話でのお問い合わせ: 0163-82-1111",
    ],
    [
        'slug' => 'care-staff-part-time',
        'title' => '介護職員（アルバイト・パート）',
        'catch_copy' => '勤務日数・時間の相談可。時給1,200〜1,400円で働く介護職員募集。',
        'description' => "食事・入浴・排せつなどの日常介助、車椅子の移乗、ベッドメイキング、\nレクリエーションや見守り、介護記録の入力・申し送り対応を担当します。",
        'required_qualifications' => "有資格者（介護福祉士・実務者研修・初任者研修修了者）優遇\n無資格者は業務内容により相談可",
        'employment_type' => 'fiscal_year_part',
        'job_category' => '介護・福祉',
        'recruitment_count' => '3名',
        'salary' => '時給1,200〜1,400円',
        'salary_detail' => "通勤手当あり\n固定残業代なし",
        'work_hours' => '交替制シフト（月平均18〜20日）',
        'work_hours_detail' => "① 7:15〜11:15（実働4時間）\n② 9:00〜17:00（実働7時間）\n③ 12:15〜16:15（実働4時間）\n④ 12:00〜18:00（実働6時間）",
        'holiday' => "ご自身の都合に合わせて勤務日数・時間の相談可\n年次有給休暇あり",
        'social_insurance' => "健康保険\n厚生年金保険\n雇用保険\n労災保険",
        'benefits' => "離島割引制度（フェリー・航空機）\nマイカー通勤可\n住居支援\n公的ポジションで安定雇用",
        'housing_support_available' => 1,
        'housing_support_detail' => '住居支援あり',
        'smoking_policy' => '敷地内全面禁煙',
        'trial_period' => 'なし',
        'work_address' => '北海道利尻郡利尻富士町鬼脇字金崎332',
        'work_address_detail' => '利尻島老人保健施設',
        'pin_location' => 'oniwaki',
        'application_flow' => "本フォームからご応募いただけます。担当より追ってご連絡いたします。\n電話でのお問い合わせ: 0163-82-1111",
    ],
    [
        'slug' => 'rehabilitation-nurse',
        'title' => 'リハビリ看護師',
        'catch_copy' => '通所リハビリ施設での看護業務。時給1,600円〜・完全週休2日制。',
        'description' => "通所リハビリ施設での業務。健康チェック、服薬管理、\n入浴・食事サポート、レクリエーション、送迎見守り、\n医師指示による処置補助と記録業務を担当します。",
        'required_qualifications' => "看護師または准看護師（いずれか必須）",
        'employment_type' => 'fiscal_year_part',
        'job_category' => '医療・介護職（看護師）',
        'recruitment_count' => '3名',
        'salary' => '時給1,600円〜',
        'salary_detail' => '通勤手当あり',
        'work_hours' => '交替制（シフト制）平均月20日',
        'work_hours_detail' => "8:30〜16:30（実働7時間）\n9:30〜15:30（実働5時間）\n9:30〜12:30（実働3時間）\n12:30〜15:30（実働3時間）",
        'holiday' => "完全週休2日制（土日祝日休み）\n年次有給休暇",
        'social_insurance' => "健康保険\n厚生年金保険\n雇用保険\n労災保険\n北海道市町村職員共済組合",
        'benefits' => "離島割引制度（フェリー・航空機）\n住まいサポート\nマイカー・バイク通勤可",
        'housing_support_available' => 1,
        'housing_support_detail' => '住まいサポートあり',
        'smoking_policy' => '敷地内全面禁煙',
        'trial_period' => 'なし',
        'work_address' => '北海道利尻郡利尻富士町鬼脇字金崎332',
        'work_address_detail' => "利尻島老人保健施設\nバス停から徒歩3分",
        'pin_location' => 'oniwaki',
        'application_flow' => "本フォームからご応募いただけます。担当より追ってご連絡いたします。\n電話でのお問い合わせ: 0163-82-1111",
    ],
    [
        'slug' => 'rehabilitation-care-staff',
        'title' => 'リハビリ介護師',
        'catch_copy' => '未経験者・無資格者歓迎。時給1,600円〜のリハビリ介護スタッフ募集。',
        'description' => "利用者さんの日常を支えるサポート業務。\n入浴・排せつ・食事などの介助、レクリエーション対応、送迎支援、\n介護記録入力、リハビリ補助業務を担当します。",
        'required_qualifications' => "未経験者・無資格者歓迎\n介護福祉士、実務者研修、初任者研修修了者は優遇",
        'employment_type' => 'fiscal_year_part',
        'job_category' => '介護職',
        'recruitment_count' => '3名',
        'salary' => '時給1,600円〜',
        'salary_detail' => '通勤手当あり',
        'work_hours' => 'シフト制（実働3〜7時間、平均月20日）',
        'work_hours_detail' => "8:30〜16:30（実働7時間）\n9:30〜15:30（実働5時間）\n9:30〜12:30（実働3時間）\n12:30〜15:30（実働3時間）",
        'holiday' => "完全週休2日制（土日祝日休み）\n年間休日120日以上\n年次有給休暇",
        'social_insurance' => "健康保険\n厚生年金保険\n雇用保険\n労災保険\n北海道市町村職員共済組合",
        'benefits' => "離島割引制度\nマイカー通勤可\n移住支援あり",
        'housing_support_available' => 1,
        'housing_support_detail' => '移住支援あり',
        'smoking_policy' => '敷地内全面禁煙',
        'trial_period' => 'なし',
        'work_address' => '北海道利尻郡利尻富士町鬼脇字金崎332',
        'work_address_detail' => "利尻島老人保健施設\nバス停から徒歩3分",
        'pin_location' => 'oniwaki',
        'application_flow' => "本フォームからご応募いただけます。担当より追ってご連絡いたします。\n電話でのお問い合わせ: 0163-82-1111",
    ],
    [
        'slug' => 'facility-transportation-driver',
        'title' => '施設の送迎スタッフ',
        'catch_copy' => '施設利用者の送迎ドライバー。1日実働4時間・土日祝日休み。',
        'description' => "ご利用者さまのご自宅〜施設間の送迎業務、\nおよび車両点検・清掃を担当します。",
        'required_qualifications' => "普通自動車第一種運転免許（必須）\n未経験OK",
        'employment_type' => 'fiscal_year_part',
        'job_category' => '運転・送迎業務',
        'recruitment_count' => '3名',
        'salary' => '時給1,200円〜',
        'salary_detail' => '通勤手当あり',
        'work_hours' => 'シフト制（1日実働4時間・平均月20日）',
        'work_hours_detail' => "08:30〜10:30（迎え）\n14:30〜16:30（送り）",
        'holiday' => "土日祝日休み\n完全週休2日制\n年間休日120日以上\n年次有給休暇",
        'social_insurance' => "雇用保険\n労災保険",
        'benefits' => "車・バイク通勤OK\n離島割引制度（フェリー・航空機）\n赴任旅費サポート",
        'housing_support_available' => 1,
        'housing_support_detail' => '赴任旅費サポートあり',
        'smoking_policy' => '敷地内全面禁煙',
        'trial_period' => 'なし',
        'work_address' => '北海道利尻郡利尻富士町鬼脇字金崎332',
        'work_address_detail' => '利尻島老人保健施設',
        'pin_location' => 'oniwaki',
        'application_flow' => "本フォームからご応募いただけます。担当より追ってご連絡いたします。\n電話でのお問い合わせ: 0163-82-1111",
    ],
    [
        'slug' => 'welfare-care-manager',
        'title' => '福祉ケアマネジャー',
        'catch_copy' => '介護支援専門員として利用者に寄り添うケアマネジメント業務（正社員）。',
        'description' => "利用者の生活に合わせたケアマネジメント業務を担当します。\nケアプランの作成、利用者や家族からの相談受付・支援、\n介護サービス事業者との連絡・調整、\n状態の確認やモニタリング、プラン見直しを行います。",
        'required_qualifications' => "介護支援専門員の資格を有する方\n地方公務員法第16条各号の欠格条項に該当しない方\n普通自動車免許（所持または取得見込）\n未経験OK / U・Iターン歓迎",
        'employment_type' => 'regular',
        'job_category' => '介護・福祉関連',
        'recruitment_count' => '3名',
        'salary' => '月給188,000〜220,000円',
        'salary_detail' => "高校卒 188,000円〜 / 短大卒 201,000円〜 / 大学卒 220,000円〜\n固定残業代なし",
        'work_hours' => '08:30〜17:15',
        'work_hours_detail' => "実働7時間45分/日\n休憩60分\n平均勤務日数 月20〜22日",
        'holiday' => "年間休日125日以上\n完全週休2日制（土日祝）\n年末年始（12/31〜1/5）\n年次有給休暇（初年度最大14日、2年目以降20日）\n夏季休暇\n特別休暇（結婚・忌引・出産など）\n介護休暇 / 育児休暇",
        'social_insurance' => "雇用保険\n厚生年金保険\n労災保険\n健康保険\n市町村職員共済組合\n退職手当組合",
        'benefits' => "交通費支給\n住宅手当あり\n寮・社宅あり\n退職金あり\n車・バイク通勤OK",
        'housing_support_available' => 1,
        'housing_support_detail' => "住宅手当あり\n寮・社宅あり",
        'smoking_policy' => '敷地内全面禁煙',
        'trial_period' => '6か月（本採用時と同条件）',
        'work_address' => '北海道利尻郡利尻富士町鴛泊字栄町117',
        'work_address_detail' => "総合保健福祉センター\n（利尻島老人保健施設・特別養護老人ホーム秀峰園でも勤務あり）\nバス停「鴛泊診療所前」から徒歩2分",
        'pin_location' => 'health_center',
        'application_flow' => "本フォームからご応募いただけます。担当より追ってご連絡いたします。\n電話でのお問い合わせ: 0163-82-1111",
    ],
];

$created = 0;
$updated = 0;
$errors = [];

foreach ($jobs as $job) {
    $existing = get_page_by_path($job['slug'], OBJECT, 'job_posting');

    $post_data = [
        'post_title'   => $job['title'],
        'post_name'    => $job['slug'],
        'post_status'  => 'publish',
        'post_type'    => 'job_posting',
        'post_content' => '', // 本文は使わず ACF に集約
    ];

    if ($existing) {
        $post_data['ID'] = $existing->ID;
        $post_id = wp_update_post($post_data, true);
        $updated++;
    } else {
        $post_id = wp_insert_post($post_data, true);
        $created++;
    }

    if (is_wp_error($post_id)) {
        $errors[] = $job['slug'] . ': ' . $post_id->get_error_message();
        continue;
    }

    // ACF フィールドを更新
    update_field('employment_type', $job['employment_type'], $post_id);
    update_field('job_category', $job['job_category'], $post_id);
    update_field('recruitment_count', $job['recruitment_count'], $post_id);
    update_field('catch_copy', $job['catch_copy'], $post_id);
    update_field('description', $job['description'], $post_id);
    update_field('required_qualifications', $job['required_qualifications'], $post_id);
    update_field('salary', $job['salary'], $post_id);
    update_field('salary_detail', $job['salary_detail'], $post_id);
    update_field('work_hours', $job['work_hours'], $post_id);
    update_field('work_hours_detail', $job['work_hours_detail'], $post_id);
    update_field('holiday', $job['holiday'], $post_id);
    update_field('social_insurance', $job['social_insurance'], $post_id);
    update_field('benefits', $job['benefits'], $post_id);
    update_field('housing_support_available', $job['housing_support_available'], $post_id);
    update_field('housing_support_detail', $job['housing_support_detail'], $post_id);
    update_field('smoking_policy', $job['smoking_policy'], $post_id);
    update_field('trial_period', $job['trial_period'], $post_id);
    update_field('work_address', $job['work_address'], $post_id);
    update_field('work_address_detail', $job['work_address_detail'], $post_id);
    update_field('pin_location', $job['pin_location'], $post_id);
    update_field('application_flow', $job['application_flow'], $post_id);
}

WP_CLI::success(sprintf(
    'Moteru 求人インポート完了: 新規 %d 件 / 更新 %d 件',
    $created,
    $updated
));

if (!empty($errors)) {
    WP_CLI::warning('エラー: ' . implode(' / ', $errors));
}
