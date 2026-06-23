"use client";

import Link from "next/link";
import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";
import { PageHero } from "@/components/ui/PageHero";

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

const REQUIRED_MESSAGE = "入力してください";
const EMAIL_MESSAGE = "メールアドレスを確認してください。";
const KANA_MESSAGE = "カタカナで入力してください。";

const INITIAL_FORM_STATE: ContactFormState = {
  inquiryType: "",
  name: "",
  furigana: "",
  email: "",
  phone: "",
  message: "",
  privacy: false,
};

function isKatakana(value: string) {
  return /^[ァ-ヶー・　\s]+$/.test(value);
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

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
      return;
    }
    if (typeof value !== "string" || !value.trim()) errors[field] = REQUIRED_MESSAGE;
  });

  if (form.email.trim() && !isValidEmail(form.email)) {
    errors.email = EMAIL_MESSAGE;
  }

  if (form.furigana.trim() && !isKatakana(form.furigana)) {
    errors.furigana = KANA_MESSAGE;
  }

  return errors;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <p className="mt-[var(--space-2)] text-sm font-bold text-[color:var(--c-pin-job)]">
      {message}
    </p>
  );
}

export default function ContactPage() {
  const [form, setForm] = useState<ContactFormState>(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validationErrors = validateForm(form);
  const isReadyToSubmit = Object.keys(validationErrors).length === 0;

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
      event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    ) => {
      updateField(field, event.target.value);
    };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateForm(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    // TODO: 実際の送信処理を後で実装
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitted(true);
    setIsSubmitting(false);
  }

  const inputClassName =
    "min-h-12 w-full rounded-[var(--radius-md)] border border-[color:var(--c-border-subtle)] bg-[color:var(--c-paper)] px-[var(--space-4)] text-base text-[color:var(--c-text-primary)] outline-none transition-colors focus:border-[color:var(--c-deep-ocean)] focus:bg-[color:var(--c-snow)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--c-deep-ocean)]";
  const labelClassName =
    "text-sm font-bold tracking-normal text-[color:var(--c-text-primary)]";

  return (
    <main className="bg-[color:var(--c-paper)]">
      <PageHero
        eyebrow="Contact"
        title="お気軽にどうぞ。"
        lead="求人・暮らし・取材まで、なんでも。"
      />

      <section className="mx-auto max-w-[var(--container-max)] px-[var(--space-6)] pb-[calc(var(--space-6)*4)]">
        {isSubmitted ? (
          <div className="rounded-[var(--radius-lg)] border border-[color:var(--c-border-subtle)] bg-[color:var(--c-snow)] p-[var(--space-6)] shadow-[var(--shadow-md)]">
            <p className="text-2xl font-bold tracking-normal text-[color:var(--c-text-primary)]">
              お問い合わせを受け付けました。
            </p>
            <Link
              href="/jobs"
              className="mt-[var(--space-6)] inline-flex min-h-11 items-center font-bold text-[color:var(--c-deep-ocean)] hover:underline"
            >
              求人を見る →
            </Link>
          </div>
        ) : (
          <form
            noValidate
            onSubmit={handleSubmit}
            className="grid gap-[var(--space-5)] rounded-[var(--radius-lg)] border border-[color:var(--c-border-subtle)] bg-[color:var(--c-snow)] p-[var(--space-6)] shadow-[var(--shadow-md)]"
          >
            <div>
              <label htmlFor="inquiry-type" className={labelClassName}>
                問い合わせ項目 <span aria-label="必須">*</span>
              </label>
              <select
                id="inquiry-type"
                name="inquiry_type"
                value={form.inquiryType}
                onChange={handleTextChange("inquiryType")}
                className={`${inputClassName} mt-[var(--space-2)]`}
                required
              >
                <option value="">選択してください</option>
                {INQUIRY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <FieldError message={errors.inquiryType} />
            </div>

            <div className="grid gap-[var(--space-4)] md:grid-cols-2">
              <div>
                <label htmlFor="name" className={labelClassName}>
                  名前 <span aria-label="必須">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={form.name}
                  onChange={handleTextChange("name")}
                  className={`${inputClassName} mt-[var(--space-2)]`}
                  required
                />
                <FieldError message={errors.name} />
              </div>

              <div>
                <label htmlFor="furigana" className={labelClassName}>
                  フリガナ <span aria-label="必須">*</span>
                </label>
                <input
                  id="furigana"
                  name="furigana"
                  type="text"
                  value={form.furigana}
                  onChange={handleTextChange("furigana")}
                  className={`${inputClassName} mt-[var(--space-2)]`}
                  required
                />
                <FieldError message={errors.furigana} />
              </div>
            </div>

            <div className="grid gap-[var(--space-4)] md:grid-cols-2">
              <div>
                <label htmlFor="email" className={labelClassName}>
                  メールアドレス <span aria-label="必須">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={handleTextChange("email")}
                  className={`${inputClassName} mt-[var(--space-2)]`}
                  required
                />
                <FieldError message={errors.email} />
              </div>

              <div>
                <label htmlFor="phone" className={labelClassName}>
                  電話番号
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={handleTextChange("phone")}
                  className={`${inputClassName} mt-[var(--space-2)]`}
                />
              </div>
            </div>

            <div>
              <label htmlFor="message" className={labelClassName}>
                問い合わせ内容 <span aria-label="必須">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                value={form.message}
                onChange={handleTextChange("message")}
                className={`${inputClassName} mt-[var(--space-2)] min-h-40 py-[var(--space-3)] leading-7`}
                required
              />
              <FieldError message={errors.message} />
            </div>

            <div>
              <label className="flex gap-[var(--space-3)] text-sm font-bold leading-6 text-[color:var(--c-text-primary)]">
                <input
                  name="privacy"
                  type="checkbox"
                  checked={form.privacy}
                  onChange={(event) => updateField("privacy", event.target.checked)}
                  className="mt-[0.2rem] size-5 rounded border-[color:var(--c-border-subtle)] accent-[color:var(--c-pin-job)]"
                  required
                />
                <span>
                  <Link href="/privacy" className="text-[color:var(--c-deep-ocean)] underline">
                    プライバシーポリシー
                  </Link>
                  に同意します <span aria-label="必須">*</span>
                </span>
              </label>
              <FieldError message={errors.privacy} />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              aria-disabled={!isReadyToSubmit || isSubmitting}
              className="min-h-14 rounded-[var(--radius-full)] bg-[color:var(--c-pin-job)] px-[var(--space-6)] text-base font-bold text-[color:var(--c-snow)] shadow-[var(--shadow-pop-coral)] transition-[filter] hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70 md:w-fit"
            >
              {isSubmitting
                ? "送信中..."
                : isReadyToSubmit
                  ? "送信する"
                  : "必須項目を入力してください"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
