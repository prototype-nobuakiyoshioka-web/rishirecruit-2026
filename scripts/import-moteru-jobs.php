<?php
/**
 * Moteru の利尻富士町求人ページから抽出した 14 件を job_posting として一括作成する。
 *
 * 実行方法（Local by Flywheel の「Open Site Shell」内で）:
 *   wp eval-file wp-content/themes/rishirecruit2026/scripts/import-moteru-jobs.php
 *
 * 実行後、Tools > Export で「求人」を書き出し、Lolipop 側で Tools > Import する。
 *
 * 冪等性: post_name (slug) が一致する既存投稿があれば更新、なければ新規作成。
 * area タクソノミー（oshidomari / oniwaki）は住所ベースで自動割当。
 * 業務内容(description)は Moteru の [job-detail-section] p タグ原文をそのまま格納。
 * catch_copy は Moteru ページ先頭のキャッチフレーズをそのまま格納。
 */

if (!defined('ABSPATH')) {
    exit;
}

$jobs = [
    [
        'slug' => 'community-club-support',
        'title' => '地域クラブのサポートスタッフ',
        'area' => 'oshidomari',
        'catch_copy' => '島全体があなたを歓迎！北海道・利尻富士で始める、心あたたまる島暮らし',
        'description' => "島全体があなたを歓迎！北海道・利尻富士で始める、心あたたまる島暮らし\n\n「島ぐらし×地域貢献」で新しい働き方！《地域・学校コーディネーター》を募集\n\n【仕事内容】\n\n利尻富士町が取り組む、地域と教育をつなぐ行政サポート事業にて、町民、子どもたち、学校、地域団体を結ぶ\"つなぎ役\"としてご活躍いただきます。\n\n具体的には...\n\n地域クラブ活動の運営支援：地元団体と連携し、クラブ活動の運営（場所・人材）をバックアップ\n\n放課後教室の企画・運営：地域ボランティアと協力し、子どもたちの放課後の居場所づくり\n\n行政・学校・地域団体との調整業務：人材配置やスケジュール調整などの事務サポート\n\n未経験歓迎！専門知識は不要です。\n\n地域や子どもたちと関わる仕事に興味があればOK。先輩スタッフが1から丁寧にサポートするので安心してください。\n\n働く場所は、まるで一枚の絵のような島――利尻富士。\n\n利尻富士が堂々とそびえる風景、ミシュランにも選ばれた「姫沼」や「利尻島一周道路」など、圧倒的な自然美に囲まれて、毎日がリフレッシュできる非日常。都会では味わえない、心から深呼吸できる環境がここにあります。\n\n\"顔が見える安心感\"のある、あたたかな島暮らし。\n\n「おすそわけ」や「助け合い」があたりまえのようにある、昔ながらの人と人とのつながりが息づく地域。\n\n雇用主は利尻富士町。行政が関わる地域支援事業だからこそ、住まいのサポートあり。\n\n移住者も自然に溶け込めるような、やさしい風土が整っています。\n\n――― 島はさむいけど、人はあたたかい。 ―――\n\nまずは「自然の中で働くってどんな感じ？」という気持ちからで大丈夫。\n\nぜひお気軽にご応募ください。",
        'required_qualifications' => "未経験OK\n普通自動車免許必須",
        'employment_type' => 'part_time',
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
        'area' => 'oshidomari',
        'catch_copy' => '利尻富士を仰ぐ島で、暮らしも仕事もリスタート',
        'description' => "やさしい自然と人に囲まれた毎日。\n小さな島だからこそ人のあたたかさが身近に。顔が見える距離感で、人とのつながりが自然に育まれる。「困ったときはおたがいさま」そんな空気が、日々の安心につながります。\n\nそんな利尻富士町であなたの生活も暮らしも全面サポート。町役場の建設課にて、《土木技術職員》を募集。\n\n・工事業者からの工事の申請対応や書類処理などの窓口業務・事務作業\n・住民の方などのご依頼で道路や河川の維持管理や点検、補修の手配など\n\n「ここで働く」は、「ここで暮らす」を支えてくれる。\n都会の喧騒を離れて、新しい生き方を始めたい。そんな想いを胸に抱くあなたにとって、利尻富士町はその一歩をやさしく後押ししてくれる場所。\n仕事も生活も無理せず、心地よく。そんな未来を、利尻富士町ではじめてみませんか？",
        'required_qualifications' => "普通自動車免許（所持または取得見込）\n地方公務員法第16条の欠格条項に該当しない方\n大学・高専・専門学校・高等学校で土木専門課程を履修または卒業見込みの方",
        'employment_type' => 'seishain',
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
        'area' => 'oniwaki',
        'catch_copy' => '利尻富士町デイサービスセンターで働く看護スタッフを募集',
        'description' => "・看護業務全般（食事介助、排せつ、採血、通院付添 など）\n・夜勤・夜間待機・介護業務サポート\n・PCでの記録入力\n・医師の指示に基づく処置（注射、褥瘡処置、吸引等）\n\nをお任せします。",
        'required_qualifications' => "看護師免許（正看護師または准看護師のいずれか）",
        'employment_type' => 'seishain',
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
        'area' => 'oniwaki',
        'catch_copy' => '実務未経験の方も、気軽にご相談ください。研修・サポート体制が充実。',
        'description' => "・食事、入浴、排せつなど日常生活サポート\n・着替えや移乗、シーツ交換など身体介助\n・夜勤業務\n・レクリエーションの実施や見守り等\n・介護記録などシステム入力",
        'required_qualifications' => "介護福祉士、実務者研修、初任者研修のいずれか必須\n実務未経験者も相談可",
        'employment_type' => 'seishain',
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
        'slug' => 'care-management',
        'title' => 'ケアマネジメント担当',
        'area' => 'oshidomari',
        'catch_copy' => '利尻富士町総合保健福祉センターで働くケアマネジメント担当（正社員）',
        'description' => "・高齢者やご家族の相談対応\n・一人ひとりに合わせたケアプランの作成\n・地域資源やサービス事業者との連携\n・包括支援センターの業務（介護予防・総合相談など）",
        'required_qualifications' => "大学卒\n介護支援専門員および社会福祉士の資格\n普通自動車免許（所持または取得見込み）",
        'employment_type' => 'seishain',
        'job_category' => '福祉・介護（ケアマネジャー）',
        'recruitment_count' => '3名',
        'salary' => '月給220,000円〜',
        'salary_detail' => "扶養手当 / 住居手当 / 通勤手当\n期末・勤勉手当 / 寒冷地手当",
        'work_hours' => '8:30〜17:15',
        'work_hours_detail' => "実働7時間45分\n休憩60分\n月163時間",
        'holiday' => "完全週休2日制\n有給休暇 / 育児休暇 / 産前産後休暇 / 慶弔休暇 / 夏季休暇",
        'social_insurance' => "健康保険\n厚生年金保険\n雇用保険\n労災保険",
        'benefits' => "赴任旅費\n職員住宅\n退職金制度あり",
        'housing_support_available' => 1,
        'housing_support_detail' => "職員住宅あり\n赴任旅費支給",
        'smoking_policy' => '敷地内全面禁煙',
        'trial_period' => 'なし',
        'work_address' => '北海道利尻郡利尻富士町鴛泊字栄町117',
        'work_address_detail' => '利尻富士町総合保健福祉センター',
        'pin_location' => 'health_center',
        'application_flow' => "本フォームからご応募いただけます。担当より追ってご連絡いたします。\n電話でのお問い合わせ: 0163-82-1111",
    ],
    [
        'slug' => 'airport-guide-staff',
        'title' => '空港案内スタッフ',
        'area' => 'oshidomari',
        'catch_copy' => '町の窓口として「島の第一印象」をつくる、やりがいのあるお仕事',
        'description' => "・お客様へのお声がけ・ご案内\n・到着・出発時の誘導業務\n\n町の窓口として、観光客や地元の方々と接しながら「島の第一印象」をつくる、やりがいのあるお仕事です。\n\n「人と接するのが好き」「地域に貢献したい」そんな気持ちを活かせます。\n特別な資格や経験は必要ありません。\n\n・丁寧な研修＆フォロー体制あり\n・地方自治体が雇用主＝長く安定して働ける\n\n空港での案内という役割を通じて、島に来る人、暮らす人、すべての心に寄り添う毎日。",
        'required_qualifications' => "高校卒業以上\n未経験可",
        'employment_type' => 'part_time',
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
        'area' => 'oniwaki',
        'catch_copy' => '経験者向け正看護師（医療機関または福祉施設等8年以上）。年間休日125日以上・完全週休2日制。',
        'description' => "◆ 具体的な仕事内容 ◆\n利尻富士町が運営する施設にて、《看護スタッフ》を募集。\n\n【看護業務】\n・健康チェック・バイタル管理\n・医師の回診補助・服薬サポート・医療処置\n・記録や報告書類の作成・共有\n\n【介護サポート】\n・食事・移動・排せつなどの日常介助\n・環境整備（ベッドメイキング、レクサポート等）\n\nをお任せします。",
        'required_qualifications' => "経験者のみ（医療機関または福祉施設等で8年以上の実務経験）\n看護師または准看護師（いずれか必須）",
        'employment_type' => 'seishain',
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
        'area' => 'oniwaki',
        'catch_copy' => '「おかえり」が響く島で、支えるしごと。利尻富士町で「人の力になる」介護を。',
        'description' => "利尻富士町は、北海道の最北に浮かぶ小さな島。海と山に囲まれた自然の恵みと何より「人のあたたかさ」が自慢です。\n「知らない人同士でも挨拶が当たり前」そんな心地よさが、日常にあります。\n\n四季の移ろいを肌で感じながら、静かに、ていねいに暮らす。ここでは、介護も「仕事」というより「暮らしの延長線」。\n顔の見える距離で、地域全体で見守り合う関係が根づいているから、あなたの存在が、誰かの安心そのものになるんです。\n\n《介護スタッフ》として、高齢者施設での生活サポート業務をお任せします。\n\n・食事、入浴、排せつなどの日常生活のサポート\n・身体介助（着替え・移動・シーツ交換など）\n・レクリエーションの実施や見守り対応\n・介護記録や申し送り、システム入力業務\n・看護職との連携／歯科受診時の付き添い　など",
        'required_qualifications' => "介護福祉士、介護職員実務者研修、または初任者研修修了者（いずれか必須）",
        'employment_type' => 'seishain',
        'job_category' => '介護職（高齢者施設スタッフ）',
        'recruitment_count' => '3名',
        'salary' => '月給183,500〜188,000円',
        'salary_detail' => "昇給制度あり\n年2回賞与（前年度実績4.6ヶ月）\n期末手当 / 勤勉手当 / 通勤手当 / 扶養手当 / 住宅手当\n寒冷地手当（11〜3月）\n時間外勤務手当 / 夜間勤務手当 / 夜間看護等手当 3,300円/回",
        'work_hours' => 'シフト制(月163時間)',
        'work_hours_detail' => "日勤早出 7:15〜16:00\n日勤遅出 9:15〜18:00\n夜勤 16:15〜翌9:00（月4〜5回）",
        'holiday' => "年間休日125日以上\n完全週休2日制(4週8休)\n年末年始休暇\n年次有給休暇 初年度15日\n病気休暇 / 特別休暇（結婚・忌引等）/ 介護休暇 / 育児休暇",
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
        'area' => 'oniwaki',
        'catch_copy' => '資格があれば、経験は問いません。島での暮らしは、人のやさしさが支えになる。',
        'description' => "・食事・入浴・排せつなどの日常介助\n・車椅子の移乗、ベッドメイキングなど身体介助\n・レクリエーションや見守り\n・介護記録の入力・申し送り対応\n\n＼資格があれば、経験は問いません／\n介護福祉士・実務者研修・初任者研修をお持ちの方は大歓迎。\n未経験の方は業務内容に応じて応相談。\n\n島での暮らしは、人のやさしさが支えになる。\nあなたのケアが、誰かの明日を明るくする。\n\n「安定した仕事に就きたい」「地方であたたかく暮らしたい」\nそんな想いを抱くあなたへ。",
        'required_qualifications' => "有資格者（介護福祉士・実務者研修・初任者研修修了者）優遇\n無資格者は業務内容により相談可",
        'employment_type' => 'part_time',
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
        'area' => 'oniwaki',
        'catch_copy' => '地域に暮らす高齢の方々の健康を支える《通所リハビリ》でのお仕事',
        'description' => "地域に暮らす高齢の方々の健康を支える《通所リハビリ》でのお仕事。\n\n・健康チェックや服薬管理など日々のケア\n・入浴や食事など暮らしのサポート\n・レクリエーションや送迎時の見守り\n・医師の指示による処置の補助や記録業務\n\n日々の小さな変化に気づき、「あなたがいてくれてよかった」と思ってもらえる看護です。",
        'required_qualifications' => "看護師または准看護師（いずれか必須）",
        'employment_type' => 'part_time',
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
        'area' => 'oniwaki',
        'catch_copy' => 'まるで家族のように寄り添いながら、利用者さまの笑顔と毎日を支えるお仕事',
        'description' => "利尻富士町が運営する通所リハビリ施設にて、高齢者の方々の日常を支えるサポートをお願いします。\n\n・入浴・排せつ・食事などの身体介助\n・レクリエーション対応・見守り支援\n・送迎サポート・介護記録の入力\n・リハビリの補助業務　など\n\nまるで「家族」のように寄り添いながら、利用者さまの笑顔と毎日を支えていくお仕事です。",
        'required_qualifications' => "未経験者・無資格者歓迎\n介護福祉士、実務者研修、初任者研修修了者は優遇",
        'employment_type' => 'part_time',
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
        'area' => 'oniwaki',
        'catch_copy' => '「無事に着いた？」「ありがとうね」そんな日常のやりとりが、この仕事のやりがい',
        'description' => "利尻富士町が運営する通所リハビリ施設での、《送迎業務》\n\n・ご利用者さまのご自宅〜施設間の送迎\n・車両の点検・清掃など、安全運転の準備も大切なお仕事です\n・ご本人やご家族に、あたたかく声をかけるひと工夫も。\n\n「無事に着いた？」「ありがとうね」\nそんな日常のやりとりが、この仕事のやりがいです。",
        'required_qualifications' => "普通自動車第一種運転免許（必須）\n未経験OK",
        'employment_type' => 'part_time',
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
        'area' => 'oshidomari',
        'catch_copy' => '介護支援専門員として利用者に寄り添うケアマネジメント業務',
        'description' => "介護支援専門員として利用者の生活に合わせたケアマネジメント業務を担当します。\n\n【計画】\n・その人らしい生活を支えるケアプランの作成\n\n【相談】\n・利用者や家族からの相談受付・支援\n\n【調整】\n・介護サービス事業者との連絡・調整\n\n【見守り】\n・状態の確認やモニタリング、必要に応じたプラン見直し\n\n地域住民に寄り添いながらその人らしい暮らしを支える重要な役割です。",
        'required_qualifications' => "介護支援専門員の資格を有する方\n地方公務員法第16条各号の欠格条項に該当しない方\n普通自動車免許（所持または取得見込）\n未経験OK / U・Iターン歓迎",
        'employment_type' => 'seishain',
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
    [
        'slug' => 'care-manager-shuhoen',
        'title' => 'ケアマネ（特別養護老人ホーム秀峰園）',
        'area' => 'oniwaki',
        'catch_copy' => '「顔が見える支援」ができる環境で、島ならではの温かいコミュニティの中で活躍',
        'description' => "利尻富士町が運営する特別養護老人ホーム秀峰園にて、「顔が見える支援」ができる環境で活躍可能。\n島ならではの温かいコミュニティの中で専門性を発揮しながら利用者様の生活を支える職務です。\n\n【具体的な職務内容】\n・ご利用者の状況把握・アセスメント\n・ケアプランの作成\n・関係機関・ご家族との連絡・調整\n・モニタリング・プランの見直し",
        'required_qualifications' => "介護支援専門員資格の所有\n普通自動車免許（所持または取得見込み）\n地方公務員法第16条の欠格要件に該当しない方\n未経験OK / U・Iターン歓迎",
        'employment_type' => 'seishain',
        'job_category' => '介護支援専門員（ケアマネ）',
        'recruitment_count' => '3名',
        'salary' => '月給188,000円〜',
        'salary_detail' => "高卒 188,000円〜 / 短大卒 201,000円〜 / 大卒 220,000円〜\n固定残業代なし\n交通費支給あり",
        'work_hours' => '08:30〜17:15',
        'work_hours_detail' => "実働7時間45分\n休憩60分\n平均勤務日数 月20〜22日",
        'holiday' => "年間休日125日以上\n完全週休2日制（土日祝）\n年末年始（12/31〜1/5）\n年次有給休暇（初年度最大14日、2年目以降20日）\n夏季休暇 / 特別休暇 / 介護休暇 / 育児休暇",
        'social_insurance' => "雇用保険\n厚生年金保険\n労災保険\n健康保険\n市町村職員共済組合\n退職手当組合",
        'benefits' => "交通費支給\n住宅手当あり\n寮・社宅あり\n移住支援あり\n車・バイク通勤OK",
        'housing_support_available' => 1,
        'housing_support_detail' => "住宅手当あり\n寮・社宅あり\n移住支援あり",
        'smoking_policy' => '敷地内全面禁煙',
        'trial_period' => '6ヶ月（給与・勤務時間は本採用時と同じ）',
        'work_address' => '北海道利尻郡利尻富士町鬼脇字鬼脇205-1',
        'work_address_detail' => '特別養護老人ホーム秀峰園',
        'pin_location' => 'oniwaki',
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

    // area タクソノミー（鴛泊 / 鬼脇）を割当
    if (!empty($job['area'])) {
        wp_set_object_terms($post_id, $job['area'], 'area', false);
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
