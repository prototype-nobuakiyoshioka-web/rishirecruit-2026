"use client";

import Link from "next/link";
import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";
import { submitCf7, isCf7Success } from "@/lib/wp/submit-cf7";
import { Button } from "@/components/ui/Button";

// CF7 求人応募フォームの数値ID（管理画面の post=ID）
const CF7_APPLY_ID = process.env.NEXT_PUBLIC_CF7_APPLY_ID ?? "177";
const SUBMIT_ERROR_MESSAGE =
  "送信に失敗しました。時間をおいて、もう一度お試しください。";

interface ApplyFormProps {
  jobTitle: string;
  jobSlug: string;
}

type FormState = {
  fullName: string;
  fullNameKana: string;
  gender: string;
  birthDate: string;
  phone: string;
  email: string;
  zipCode: string;
  prefecture: string;
  addressLine: string;
  privacy: boolean;
};

type FieldName = keyof FormState;
type ValidationErrors = Partial<Record<FieldName, string>>;

type ZipCloudResult = {
  address1: string;
  address2: string;
  address3: string;
};

type ZipCloudResponse = {
  results: ZipCloudResult[] | null;
  status: number;
  message: string | null;
};

const REQUIRED_MESSAGE = "入力してください";
const EMAIL_MESSAGE = "メールアドレスを確認してください。";
const KANA_MESSAGE = "カタカナで入力してください。";
const ZIP_NOT_FOUND_MESSAGE = "該当する住所が見つかりませんでした。";

const INITIAL_FORM_STATE: FormState = {
  fullName: "",
  fullNameKana: "",
  gender: "",
  birthDate: "",
  phone: "",
  email: "",
  zipCode: "",
  prefecture: "",
  addressLine: "",
  privacy: false,
};

const PREFECTURES = [
  "北海道",
  "青森県",
  "岩手県",
  "宮城県",
  "秋田県",
  "山形県",
  "福島県",
  "茨城県",
  "栃木県",
  "群馬県",
  "埼玉県",
  "千葉県",
  "東京都",
  "神奈川県",
  "新潟県",
  "富山県",
  "石川県",
  "福井県",
  "山梨県",
  "長野県",
  "岐阜県",
  "静岡県",
  "愛知県",
  "三重県",
  "滋賀県",
  "京都府",
  "大阪府",
  "兵庫県",
  "奈良県",
  "和歌山県",
  "鳥取県",
  "島根県",
  "岡山県",
  "広島県",
  "山口県",
  "徳島県",
  "香川県",
  "愛媛県",
  "高知県",
  "福岡県",
  "佐賀県",
  "長崎県",
  "熊本県",
  "大分県",
  "宮崎県",
  "鹿児島県",
  "沖縄県",
];

function normalizeZipCode(value: string) {
  return value.replace(/-/g, "").replace(/\D/g, "");
}

function isKatakana(value: string) {
  return /^[ァ-ヶー・　\s]+$/.test(value);
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validateForm(form: FormState) {
  const errors: ValidationErrors = {};
  const requiredFields: FieldName[] = [
    "fullName",
    "fullNameKana",
    "gender",
    "phone",
    "email",
    "zipCode",
    "prefecture",
    "addressLine",
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

  if (form.fullNameKana.trim() && !isKatakana(form.fullNameKana)) {
    errors.fullNameKana = KANA_MESSAGE;
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

export function ApplyForm({ jobTitle, jobSlug }: ApplyFormProps) {
  const [form, setForm] = useState<FormState>(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isZipLoading, setIsZipLoading] = useState(false);
  const [zipLookupError, setZipLookupError] = useState("");

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

  async function handleZipCode(value: string) {
    const zipCode = normalizeZipCode(value);
    if (zipCode.length !== 7) return;

    setIsZipLoading(true);
    setZipLookupError("");

    try {
      const response = await fetch(
        `https://zipcloud.ibsnet.co.jp/api/search?zipcode=${zipCode}`,
      );
      const data = (await response.json()) as ZipCloudResponse;

      if (!data.results?.length) {
        setZipLookupError(ZIP_NOT_FOUND_MESSAGE);
        return;
      }

      const { address1, address2, address3 } = data.results[0];
      setForm((current) => ({
        ...current,
        prefecture: address1,
        addressLine: `${address2}${address3}`,
      }));
      setErrors((current) => {
        const next = { ...current };
        delete next.prefecture;
        delete next.addressLine;
        return next;
      });
    } catch {
      setZipLookupError("接続が不安定なようです。");
    } finally {
      setIsZipLoading(false);
    }
  }

  function handleTextChange(field: FieldName) {
    return (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = event.target.value;
      updateField(field, value);

      if (field === "zipCode") {
        setZipLookupError("");
        void handleZipCode(value);
      }
    };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateForm(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    setSubmitError("");
    try {
      const result = await submitCf7(CF7_APPLY_ID, {
        full_name: form.fullName,
        full_name_kana: form.fullNameKana,
        gender: form.gender,
        birth_date: form.birthDate,
        phone: form.phone,
        email: form.email,
        zip_code: form.zipCode,
        prefecture: form.prefecture,
        address_line: form.addressLine,
        job_slug: jobSlug,
        privacy: form.privacy ? "1" : "",
      });
      if (isCf7Success(result)) {
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

  if (isSubmitted) {
    return (
      <section
        id="apply-form"
        className="scroll-mt-[calc(var(--space-6)*6)] rounded-[var(--radius-lg)] border border-[color:var(--c-border-subtle)] bg-[color:var(--c-snow)] p-[var(--space-6)] shadow-[var(--shadow-md)]"
      >
        {/* TODO: GA計測イベント発火ポイント */}
        <p className="text-2xl font-bold tracking-normal text-[color:var(--c-text-primary)]">
          届きました。3営業日以内にお返事します。
        </p>
        <p className="mt-[var(--space-3)] text-sm leading-6 text-[color:var(--c-text-secondary)]">
          応募先: {jobTitle}
        </p>
        <Link
          href="/jobs"
          className="mt-[var(--space-6)] inline-flex min-h-11 items-center font-bold text-[color:var(--c-deep-ocean)] hover:underline"
        >
          他の求人を見る →
        </Link>
      </section>
    );
  }

  const inputClassName =
    "min-h-12 w-full rounded-[var(--radius-md)] border border-[color:var(--c-border-subtle)] bg-[color:var(--c-paper)] px-[var(--space-4)] text-base text-[color:var(--c-text-primary)] outline-none transition-colors focus:border-[color:var(--c-deep-ocean)] focus:bg-[color:var(--c-snow)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--c-deep-ocean)]";
  const labelClassName =
    "text-sm font-bold tracking-normal text-[color:var(--c-text-primary)]";

  return (
    <section
      id="apply-form"
      className="scroll-mt-[calc(var(--space-6)*6)] rounded-[var(--radius-lg)] border border-[color:var(--c-border-subtle)] bg-[color:var(--c-snow)] p-[var(--space-6)] shadow-[var(--shadow-md)]"
    >
      <div>
        <p className="text-sm font-bold text-[color:var(--c-deep-ocean)]">Apply</p>
        <h2 className="mt-[var(--space-2)] text-2xl font-bold tracking-normal text-[color:var(--c-text-primary)]">
          応募フォーム
        </h2>
        <div className="mt-[var(--space-5)] rounded-[var(--radius-md)] border border-[color:var(--c-border-subtle)] bg-[color:var(--c-paper)] p-[var(--space-4)]">
          <p className="text-xs font-bold text-[color:var(--c-text-secondary)]">応募先</p>
          <p className="mt-[var(--space-1)] text-lg font-bold text-[color:var(--c-text-primary)]">
            {jobTitle}
          </p>
        </div>
      </div>

      <form noValidate onSubmit={handleSubmit} className="mt-[var(--space-6)] grid gap-[var(--space-5)]">
        <input type="hidden" name="job_slug" value={jobSlug} />

        <div className="grid gap-[var(--space-4)] md:grid-cols-2">
          <div>
            <label htmlFor="full-name" className={labelClassName}>
              氏名 <span aria-label="必須">*</span>
            </label>
            <input
              id="full-name"
              name="full_name"
              type="text"
              autoComplete="name"
              value={form.fullName}
              onChange={handleTextChange("fullName")}
              className={`${inputClassName} mt-[var(--space-2)]`}
              required
            />
            <FieldError message={errors.fullName} />
          </div>

          <div>
            <label htmlFor="full-name-kana" className={labelClassName}>
              氏名(フリガナ) <span aria-label="必須">*</span>
            </label>
            <input
              id="full-name-kana"
              name="full_name_kana"
              type="text"
              value={form.fullNameKana}
              onChange={handleTextChange("fullNameKana")}
              className={`${inputClassName} mt-[var(--space-2)]`}
              required
            />
            <FieldError message={errors.fullNameKana} />
          </div>
        </div>

        <div className="grid gap-[var(--space-4)] md:grid-cols-2">
          <div>
            <label htmlFor="gender" className={labelClassName}>
              性別 <span aria-label="必須">*</span>
            </label>
            <select
              id="gender"
              name="gender"
              value={form.gender}
              onChange={handleTextChange("gender")}
              className={`${inputClassName} mt-[var(--space-2)]`}
              required
            >
              <option value="">選択してください</option>
              <option value="男性">男性</option>
              <option value="女性">女性</option>
            </select>
            <FieldError message={errors.gender} />
          </div>

          <div>
            <label htmlFor="birth-date" className={labelClassName}>
              生年月日
            </label>
            <input
              id="birth-date"
              name="birth_date"
              type="date"
              value={form.birthDate}
              onChange={handleTextChange("birthDate")}
              className={`${inputClassName} mt-[var(--space-2)]`}
            />
          </div>
        </div>

        <div className="grid gap-[var(--space-4)] md:grid-cols-2">
          <div>
            <label htmlFor="phone" className={labelClassName}>
              電話番号 <span aria-label="必須">*</span>
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              value={form.phone}
              onChange={handleTextChange("phone")}
              className={`${inputClassName} mt-[var(--space-2)]`}
              required
            />
            <FieldError message={errors.phone} />
          </div>

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
        </div>

        <fieldset className="grid gap-[var(--space-4)]">
          <legend className={labelClassName}>
            住所 <span aria-label="必須">*</span>
          </legend>

          <div className="grid gap-[var(--space-4)] md:grid-cols-[12rem_1fr]">
            <div>
              <label htmlFor="zip-code" className={labelClassName}>
                郵便番号
              </label>
              <input
                id="zip-code"
                name="zip_code"
                type="text"
                inputMode="numeric"
                autoComplete="postal-code"
                value={form.zipCode}
                onChange={handleTextChange("zipCode")}
                className={`${inputClassName} mt-[var(--space-2)]`}
                required
              />
              <FieldError message={errors.zipCode} />
              {isZipLoading ? (
                <p className="mt-[var(--space-2)] text-sm text-[color:var(--c-text-secondary)]">
                  住所を確認しています。
                </p>
              ) : null}
              {zipLookupError ? (
                <p className="mt-[var(--space-2)] text-sm font-bold text-[color:var(--c-pin-job)]">
                  {zipLookupError}
                </p>
              ) : null}
            </div>

            <div>
              <label htmlFor="prefecture" className={labelClassName}>
                都道府県
              </label>
              <select
                id="prefecture"
                name="prefecture"
                value={form.prefecture}
                onChange={handleTextChange("prefecture")}
                className={`${inputClassName} mt-[var(--space-2)]`}
                required
              >
                <option value="">選択してください</option>
                {PREFECTURES.map((prefecture) => (
                  <option key={prefecture} value={prefecture}>
                    {prefecture}
                  </option>
                ))}
              </select>
              <FieldError message={errors.prefecture} />
            </div>
          </div>

          <div>
            <label htmlFor="address-line" className={labelClassName}>
              市区町村以降
            </label>
            <input
              id="address-line"
              name="address_line"
              type="text"
              autoComplete="street-address"
              value={form.addressLine}
              onChange={handleTextChange("addressLine")}
              className={`${inputClassName} mt-[var(--space-2)]`}
              required
            />
            <FieldError message={errors.addressLine} />
          </div>
        </fieldset>

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

        {submitError && (
          <p role="alert" className="text-sm font-bold text-[color:var(--c-pin-job)]">
            {submitError}
          </p>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          aria-disabled={!isReadyToSubmit || isSubmitting}
        >
          {isSubmitting
            ? "送信中..."
            : isReadyToSubmit
              ? "応募する"
              : "必須項目を入力してください"}
        </Button>
      </form>
    </section>
  );
}
