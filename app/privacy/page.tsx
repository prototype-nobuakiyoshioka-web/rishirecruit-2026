import type { Metadata } from "next";
import { FooterOfficeInfo } from "@/components/layout/FooterInfo";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "プライバシーポリシー",
  description: "リシリクルート2026における個人情報の取り扱いについて。",
  path: "/privacy",
});

// 本文の原稿：project/利尻富士-リシリクルート2026/プライバシーポリシー_本文_2026-11-16.md
// 本文の中の章番号の参照（「7. 〜を参照」など）は、章の並びを変えたら一緒に直す。
type PrivacyBlock =
  | { kind: "p"; text: string }
  | { kind: "h3"; text: string }
  | { kind: "ul"; items: (string | { label: string; text: string })[] };

const PRIVACY_SECTIONS: { title: string; blocks: PrivacyBlock[] }[] = [
  {
    title: "1. 基本方針",
    blocks: [
      { kind: "p", text: "当町は、個人情報の保護に関する法律その他の関係法令を守り、当サイトで取得する個人情報を適切に取り扱います。" },
    ],
  },
  {
    title: "2. 収集する情報",
    blocks: [
      { kind: "p", text: "当サイトでは、次の情報を取得します。" },
      { kind: "h3", text: "応募フォーム" },
      {
        kind: "ul",
        items: [
          "氏名、氏名（フリガナ）",
          "性別",
          "生年月日",
          "電話番号",
          "メールアドレス",
          "住所（郵便番号、都道府県、市区町村以下）",
          "応募する求人の情報",
        ],
      },
      { kind: "h3", text: "お問い合わせフォーム" },
      {
        kind: "ul",
        items: ["お問い合わせの項目", "名前、フリガナ", "メールアドレス", "電話番号（任意）", "お問い合わせの内容"],
      },
      { kind: "h3", text: "フォームの送信時に自動で取得する情報" },
      {
        kind: "ul",
        items: [
          "フォームの送信が人によるものかを確認するため、送信元のIPアドレスなどの接続情報を確認します（「9. 外部サービス」を参照）。",
          "どこから当サイトに来られたかの情報を、フォームの内容と一緒に受け取ります（「8. 訪問経路の記録」を参照）。",
        ],
      },
      { kind: "h3", text: "アクセス状況に関する情報" },
      {
        kind: "ul",
        items: [
          "当サイトの利用状況を把握するため、閲覧したページ、利用環境（ブラウザの種類、端末の種類など）といった情報を、Cookie 等を通じて取得します（「7. アクセス解析・Cookie 等」を参照）。",
        ],
      },
    ],
  },
  {
    title: "3. 利用目的",
    blocks: [
      { kind: "p", text: "取得した個人情報は、次の目的のために利用します。" },
      {
        kind: "ul",
        items: [
          "求人への応募の受付、選考、およびそれに関する連絡",
          "お問い合わせへの回答、およびそれに関する連絡",
          "当サイトの運営、改善、利用状況の把握",
          "不正な利用やスパム送信の防止",
        ],
      },
      { kind: "p", text: "法令に基づく場合を除き、上記の目的以外には利用しません。" },
    ],
  },
  {
    title: "4. 第三者への提供",
    blocks: [
      { kind: "p", text: "当町は、次の場合を除き、取得した個人情報を本人の同意なく第三者に提供しません。" },
      {
        kind: "ul",
        items: [
          "法令に基づく場合",
          "人の生命、身体または財産の保護のために必要がある場合で、本人の同意を得ることが困難なとき",
          "国の機関や地方公共団体などが法令に定める事務を行うにあたり、協力する必要がある場合",
        ],
      },
    ],
  },
  {
    title: "5. 業務の委託",
    blocks: [
      { kind: "p", text: "当町は、当サイトの運営やフォームの受付などの業務を、外部の事業者に委託する場合があります。この場合、個人情報の取り扱いを含む業務については、委託先が適切に取り扱うよう、必要な措置を講じます。" },
    ],
  },
  {
    title: "6. 安全管理",
    blocks: [
      { kind: "p", text: "当町は、取得した個人情報の漏えい、滅失、毀損を防ぐため、必要かつ適切な安全管理の措置を講じます。個人情報は、利用目的の達成に必要な範囲で保管し、不要になったときは、適切な方法で廃棄または消去します。" },
    ],
  },
  {
    title: "7. アクセス解析・Cookie 等",
    blocks: [
      { kind: "p", text: "当サイトでは、利用状況を把握し、内容を改善するために、Google 合同会社が提供するアクセス解析サービス「Google アナリティクス 4」を利用しています。このサービスは、Cookie などを通じて、閲覧したページや利用環境などの情報を収集します。" },
      {
        kind: "ul",
        items: [
          "収集される情報に、氏名などの個人を特定する情報は含まれません。",
          "収集された情報は、Google 社のプライバシーポリシーに基づいて管理されます。",
          "Cookie は、お使いのブラウザの設定で、受け入れないようにすることができます。その場合、当サイトの一部の機能が使えなくなることがあります。",
          "Google アナリティクスによるデータの収集は、Google 社が提供するオプトアウトアドオンなどで無効にすることもできます。",
        ],
      },
      { kind: "p", text: "Google アナリティクスの詳細は、Google 社のウェブサイトをご覧ください。" },
    ],
  },
  {
    title: "8. 訪問経路の記録",
    blocks: [
      { kind: "p", text: "当サイトでは、応募やお問い合わせが、どの経路から届いたのかを把握するため、次の情報をお使いのブラウザ（ローカルストレージ）に記録します。" },
      {
        kind: "ul",
        items: [
          "参照元のサイトのドメイン名（検索キーワードや閲覧履歴は記録しません）",
          "当サイトのURLに付けられた、広告や紹介の区別のための値（キャンペーン名など）",
          "最初に開いたページ",
          "記録した日時",
        ],
      },
      { kind: "p", text: "これらの情報は、最長で90日間保存し、その後は新しい情報に置き換わります。ブラウザの設定から、いつでも削除できます。" },
      { kind: "p", text: "記録した情報は、応募フォームまたはお問い合わせフォームを送信したときに限り、入力内容と一緒に当町に送られます。フォームを送信しない限り、当町に送られることはありません。この情報は、広報の効果を確かめ、サイトを改善するために利用します。" },
    ],
  },
  {
    title: "9. 外部サービス",
    blocks: [
      { kind: "p", text: "当サイトでは、次の外部サービスを利用しています。各サービスでの情報の取り扱いは、それぞれの提供事業者の定めによります。" },
      {
        kind: "ul",
        items: [
          {
            label: "スパム対策（Cloudflare Turnstile）",
            text: "フォームの送信が人によるものかを確認するため、Cloudflare, Inc. が提供するサービスを利用しています。確認のために、お使いのブラウザや接続元に関する情報が、同社に送られることがあります。",
          },
          {
            label: "動画の表示（YouTube）",
            text: "当サイトでは、YouTube の動画を埋め込んで表示しています。動画の画像は、ページを開いたときに YouTube 側から読み込まれます。動画は、再生のボタンを押したときに、はじめて YouTube のプレーヤーが読み込まれます。再生時には、YouTube 側で Cookie などが利用されることがあります。",
          },
          {
            label: "郵便番号からの住所検索",
            text: "応募フォームでは、入力された郵便番号をもとに住所を補うため、外部の郵便番号検索サービスに、郵便番号を送信しています。",
          },
          {
            label: "外部サイトへのリンク",
            text: "当サイトには、note をはじめとする外部のサイトへのリンクがあります。リンク先のサイトでの個人情報の取り扱いについては、当町は責任を負いません。リンク先の方針をご確認ください。",
          },
        ],
      },
    ],
  },
  {
    title: "10. 開示・訂正等の求め",
    blocks: [
      { kind: "p", text: "ご本人から、当町が保有する個人情報について、開示、訂正、利用の停止などの求めがあったときは、ご本人であることを確認したうえで、法令に基づき、適切に対応します。ご希望の場合は、下記のお問い合わせ先までご連絡ください。" },
    ],
  },
  {
    title: "11. 改定",
    blocks: [
      { kind: "p", text: "当町は、法令の変更や、当サイトの内容の変更などにあわせて、このプライバシーポリシーを改定することがあります。改定した内容は、このページに掲載した時点から効力を持つものとします。" },
    ],
  },
];

const BODY_TEXT = "text-base leading-8 text-[color:var(--c-text-secondary)]";
const H2_CLASS = "text-xl font-bold tracking-normal text-[color:var(--c-text-primary)]";

function PrivacyBlockView({ block }: { block: PrivacyBlock }) {
  if (block.kind === "h3") {
    return (
      <h3 className="mt-[var(--space-5)] text-base font-bold tracking-normal text-[color:var(--c-text-primary)]">
        {block.text}
      </h3>
    );
  }
  if (block.kind === "ul") {
    return (
      <ul className={`mt-[var(--space-2)] list-disc space-y-[var(--space-2)] pl-[1.25em] marker:text-[color:var(--c-deep-ocean)] ${BODY_TEXT}`}>
        {block.items.map((item) =>
          typeof item === "string" ? (
            <li key={item}>{item}</li>
          ) : (
            <li key={item.label}>
              <span className="font-bold text-[color:var(--c-text-primary)]">{item.label}</span>
              <span className="block">{item.text}</span>
            </li>
          ),
        )}
      </ul>
    );
  }
  return <p className={`mt-[var(--space-3)] ${BODY_TEXT}`}>{block.text}</p>;
}

export default function PrivacyPage() {
  return (
    <main className="bg-[color:var(--c-paper)]">
      <section className="pt-[calc(var(--space-6)*6)] pb-[calc(var(--space-6)*2)]">
        <div className="mx-auto max-w-[720px] px-[var(--space-6)]">
          <h1 className="text-phrase text-4xl font-bold leading-tight tracking-normal text-[color:var(--c-text-primary)] md:text-6xl">
            プライバシー<wbr />ポリシー
          </h1>
        </div>
      </section>

      <article className="mx-auto max-w-[720px] px-[var(--space-6)] pb-[calc(var(--space-6)*4)]">
        <p className={BODY_TEXT}>
          利尻富士町役場（以下「当町」といいます。）は、リシリクルート2026（https://www.rishirecruit.com 、以下「当サイト」といいます。）をご利用いただく方の個人情報を、次の方針に基づいて取り扱います。
        </p>

        <div className="mt-[var(--space-6)] grid gap-[calc(var(--space-6)*1.5)]">
          {PRIVACY_SECTIONS.map((section) => (
            <section key={section.title}>
              <h2 className={H2_CLASS}>{section.title}</h2>
              {section.blocks.map((block, index) => (
                <PrivacyBlockView key={index} block={block} />
              ))}
            </section>
          ))}

          <section>
            <h2 className={H2_CLASS}>12. お問い合わせ先</h2>
            <p className={`mt-[var(--space-3)] ${BODY_TEXT}`}>
              個人情報の取り扱いに関するお問い合わせは、次の窓口までお願いします。
            </p>
            <FooterOfficeInfo className={`mt-[var(--space-3)] ${BODY_TEXT}`} />
          </section>
        </div>

        <p className="mt-[calc(var(--space-6)*2)] border-t border-[color:var(--c-border-subtle)] pt-[var(--space-4)] text-sm leading-6 text-[color:var(--c-text-secondary)]">
          制定日：2026年11月16日
        </p>
      </article>
    </main>
  );
}
