"use client";

import Link from "next/link";
import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";
import { EditorialIndexShell } from "@/components/ui/EditorialIndexShell";
import { submitForm, isCf7Success } from "@/lib/wp/submit-cf7";
import { trackEvent } from "@/lib/analytics";
import { Button } from "@/components/ui/Button";
import { Turnstile } from "@/components/ui/Turnstile";

// CF7 お問い合わせフォームの数値ID（管理画面の post=ID）
const CF7_CONTACT_ID = process.env.NEXT_PUBLIC_CF7_CONTACT_ID ?? "176";
const SUBMIT_ERROR_MESSAGE =
  "送信に失敗しました。時間をおいて、もう一度お試しください。";

type ContactFormState = {
  inquiryType: string;
  name: string;
  furigana: string;
  email: string;
  phone: string;
  message: string;
  privacy: boolean;
};

type FieldName = keyof ContactFormState;
type ValidationErrors = Partial<Record<FieldName, string>>;

const INQUIRY_OPTIONS = [
  "求人について",
  "イベントについて",
  "観光について",
  "その他",
];

const INITIAL_FORM_STATE: ContactFormState = {
  inquiryType: "",
  name: "",
  furigana: "",
  email: "",
  phone: "",
  message: "",
  privacy: false,
};

const REQUIRED_MESSAGE = "入力してください";

function validateForm(form: ContactFormState) {
  const errors: ValidationErrors = {};
  const requiredFields: FieldName[] = [
    "inquiryType",
    "name",
    "furigana",
    "email",
    "message",
    "privacy",
  ];

  requiredFields.forEach((field) => {
    const value = form[field];
    if (typeof value === "boolean") {
      if (!value) errors[field] = REQUIRED_MESSAGE;
    } else if (!value.trim()) {
      errors[field] = REQUIRED_MESSAGE;
    }
  });

  if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = "メールアドレスを確認してください。";
  }
  if (form.furigana.trim() && !/^[ァ-ヶー・　\s]+$/.test(form.furigana)) {
    errors.furigana = "カタカナで入力してください。";
  }

  return errors;
}

function FieldError({ message }: { message?: string }) {
  return message ? (
    <p className="mt-2 text-sm font-bold text-[color:var(--c-pin-job)]" role="alert">
      {message}
    </p>
  ) : null;
}

export default function ContactPage() {
  const [form, setForm] = useState<ContactFormState>(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  // Turnstile トークン（未取得なら送信不可）とハニーポット（人間は空のまま）。
  const [turnstileToken, setTurnstileToken] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const isReadyToSubmit = Object.keys(validateForm(form)).length === 0;

  function updateField(field: FieldName, value: string | boolean) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function handleTextChange(field: FieldName) {
    return (
      event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => updateField(field, event.target.value);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateForm(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    // Turnstile 未完了なら送信しない。
    if (!turnstileToken) {
      setSubmitError("認証を完了してください。");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");
    try {
      const result = await submitForm(
        CF7_CONTACT_ID,
        {
          inquiry_type: form.inquiryType,
          name: form.name,
          furigana: form.furigana,
          email: form.email,
          phone: form.phone,
          message: form.message,
          privacy: form.privacy ? "1" : "",
        },
        turnstileToken,
        honeypot,
      );
      if (isCf7Success(result)) {
        // 問い合わせ完了をGA4へ送信。
        trackEvent("contact_submit", { inquiry_type: form.inquiryType });
        setIsSubmitted(true);
      } else {
        setSubmitError(result.message || SUBMIT_ERROR_MESSAGE);
      }
    } catch {
      setSubmitError(SUBMIT_ERROR_MESSAGE);
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputClass =
    "mt-2 min-h-13 w-full rounded-[var(--radius-lg)] border border-[color:var(--c-deep-ocean)]/15 bg-white/70 px-4 text-base text-[color:var(--c-text-primary)] outline-none transition-[border-color,background-color,box-shadow] focus:border-[color:var(--c-deep-ocean)] focus:bg-white focus:shadow-[0_0_0_3px_rgba(27,95,140,0.1)]";
  const labelClass = "text-sm font-black text-[color:var(--c-text-primary)]";

  return (
    <EditorialIndexShell
      eyebrow="Contact rishirecruit"
      title={<>気になることを、<br />話すところから。</>}
      lead={<>求人のことも、島での暮らしも。<br />まだ決めていない段階から相談できます。</>}
      introEyebrow="Before you contact"
      introLabel="お問い合わせの前に"
      introTitle={<>応募する前でも、<br />聞いて大丈夫です。</>}
      introBody="住まい、冬の生活、働き方、イベントや観光について。情報を見ても分からないことや、誰に聞けばよいか迷うことをお送りください。正式な求人応募は、各求人詳細ページの応募フォームから受け付けています。"
    >
      <section className="relative mx-auto max-w-[1080px] px-[var(--space-6)] pb-20 md:pb-28">
        {isSubmitted ? (
          <div className="border-y border-[color:var(--c-deep-ocean)]/15 py-20 md:py-28" aria-live="polite">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[color:var(--c-warning)]">
              Thank you
            </p>
            <h2 className="mt-5 text-balance text-3xl font-black leading-tight text-[color:var(--c-deep-ocean)] md:text-5xl">
              お問い合わせを受け付けました。
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-8 text-[color:var(--c-text-secondary)] md:text-lg">
              内容を確認のうえ、ご入力いただいたメールアドレスへご連絡します。
            </p>
            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-4 font-black text-[color:var(--c-deep-ocean)]">
              <Link href="/jobs" className="hover:underline">募集中の仕事を見る →</Link>
              <Link href="/" className="hover:underline">トップへ戻る →</Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-12 border-t border-[color:var(--c-deep-ocean)]/15 pt-14 md:grid-cols-[15rem_1fr] md:gap-20 md:pt-20">
            <aside>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[color:var(--c-warning)]">
                Contact form
              </p>
              <h2 className="mt-4 text-2xl font-black text-[color:var(--c-deep-ocean)]">
                お問い合わせ
              </h2>
              <div className="mt-6 grid gap-4 text-sm leading-7 text-[color:var(--c-text-secondary)]">
                <p><span className="font-black text-[color:var(--c-text-primary)]">*</span> は必須項目です。</p>
                <p>求人への応募は、求人詳細ページの「応募する」からお進みください。</p>
                <Link href="/jobs" className="font-black text-[color:var(--c-deep-ocean)] hover:underline">
                  求人一覧を見る →
                </Link>
              </div>
            </aside>

            <form noValidate onSubmit={handleSubmit} className="grid gap-10">
              <fieldset>
                <legend className={labelClass}>問い合わせ項目 <span aria-hidden="true">*</span></legend>
                <p className="mt-2 text-sm text-[color:var(--c-text-secondary)]">最も近いものを選んでください。</p>
                <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                  {INQUIRY_OPTIONS.map((option) => (
                    <label key={option} className="flex min-h-14 cursor-pointer items-center justify-center rounded-[var(--radius-lg)] border border-[color:var(--c-deep-ocean)]/15 bg-white/60 px-3 text-center text-sm font-black text-[color:var(--c-text-primary)] transition-colors has-checked:border-[color:var(--c-deep-ocean)] has-checked:bg-[color:var(--c-deep-ocean)] has-checked:text-white">
                      <input type="radio" name="inquiry_type" value={option} checked={form.inquiryType === option} onChange={(event) => updateField("inquiryType", event.target.value)} className="sr-only" required />
                      {option}
                    </label>
                  ))}
                </div>
                <FieldError message={errors.inquiryType} />
              </fieldset>

              <div className="grid gap-6 md:grid-cols-2">
                <div><label htmlFor="name" className={labelClass}>名前 <span aria-hidden="true">*</span></label><input id="name" name="name" autoComplete="name" value={form.name} onChange={handleTextChange("name")} className={inputClass} required /><FieldError message={errors.name} /></div>
                <div><label htmlFor="furigana" className={labelClass}>フリガナ <span aria-hidden="true">*</span></label><input id="furigana" name="furigana" value={form.furigana} onChange={handleTextChange("furigana")} className={inputClass} required /><FieldError message={errors.furigana} /></div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div><label htmlFor="email" className={labelClass}>メールアドレス <span aria-hidden="true">*</span></label><input id="email" name="email" type="email" autoComplete="email" value={form.email} onChange={handleTextChange("email")} className={inputClass} required /><FieldError message={errors.email} /></div>
                <div><label htmlFor="phone" className={labelClass}>電話番号 <span className="ml-2 font-normal text-[color:var(--c-text-secondary)]">任意</span></label><input id="phone" name="phone" type="tel" autoComplete="tel" value={form.phone} onChange={handleTextChange("phone")} className={inputClass} /></div>
              </div>

              <div><label htmlFor="message" className={labelClass}>問い合わせ内容 <span aria-hidden="true">*</span></label><textarea id="message" name="message" value={form.message} onChange={handleTextChange("message")} className={`${inputClass} min-h-48 py-4 leading-8`} placeholder="気になっていることや、確認したいことをご記入ください。" required /><FieldError message={errors.message} /></div>

              <div className="border-t border-[color:var(--c-deep-ocean)]/15 pt-8">
                <label className="flex cursor-pointer gap-3 text-sm font-bold leading-6 text-[color:var(--c-text-primary)]"><input name="privacy" type="checkbox" checked={form.privacy} onChange={(event) => updateField("privacy", event.target.checked)} className="mt-0.5 size-5 shrink-0 accent-[color:var(--c-pin-job)]" required /><span><Link href="/privacy" target="_blank" className="text-[color:var(--c-deep-ocean)] underline">プライバシーポリシー</Link>に同意します <span aria-hidden="true">*</span></span></label>
                <FieldError message={errors.privacy} />
              </div>

              {/* ハニーポット: 画面外に隠し、人間は入力しない。ボットが埋めると送信を無効化する。 */}
              <input
                type="text"
                name="company_website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                value={honeypot}
                onChange={(event) => setHoneypot(event.target.value)}
                className="absolute left-[-9999px] h-0 w-0 opacity-0"
              />

              <Turnstile onToken={setTurnstileToken} />

              {submitError && (
                <p role="alert" className="text-sm font-bold text-[color:var(--c-pin-job)]">
                  {submitError}
                </p>
              )}

              <Button type="submit" disabled={isSubmitting} aria-disabled={!turnstileToken || isSubmitting}>
                {isSubmitting ? "送信中..." : isReadyToSubmit ? "送信する" : "必須項目を入力してください"}
              </Button>
            </form>
          </div>
        )}
      </section>
    </EditorialIndexShell>
  );
}
