import Link from "next/link";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

import styles from "./Button.module.css";

/** ブルー系の、角を丸めた玩具のプレート。リンクと送信ボタンで質感を共通化する。 */
type ButtonVariant = "primary" | "gold" | "aqua";
type ButtonSize = "md" | "lg";
type ButtonIcon = "arrow" | "mail" | "loading";

const SIZES: Record<ButtonSize, string> = {
  md: "min-h-12 px-5 py-2.5 text-sm",
  lg: "min-h-14 px-6 py-3 text-base",
};

// gold は既存呼び出しとの互換性を保ち、配色はアイスブルーに統一する。
const VARIANTS: Record<ButtonVariant, string> = {
  primary: "",
  gold: styles.ice,
  aqua: styles.aqua,
};

function ButtonSymbol({ icon }: { icon: ButtonIcon }) {
  return (
    <span className={styles.icon} aria-hidden="true">
      {icon === "loading" ? (
        <span className={styles.spinner} />
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" focusable="false">
          {icon === "mail" ? (
            <><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m4 7 8 6 8-6" /></>
          ) : (
            <path d="M5 12h14m-6-6 6 6-6 6" />
          )}
        </svg>
      )}
    </span>
  );
}

type BaseProps = {
  variant?: ButtonVariant;
  icon?: ButtonIcon | null;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
  children: ReactNode;
};

type ButtonAsButton = BaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps> & {
    href?: undefined;
  };

type ButtonAsLink = BaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseProps> & {
    href: string;
  };

type ButtonProps = ButtonAsButton | ButtonAsLink;

export function Button(props: ButtonProps) {
  const {
    variant = "primary",
    icon = "arrow",
    size = "lg",
    fullWidth = false,
    className = "",
    children,
    ...rest
  } = props;

  const classes = [
    styles.button,
    SIZES[size],
    VARIANTS[variant],
    fullWidth ? "w-full" : "w-full md:w-fit",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      <span className={styles.label}>{children}</span>
      {icon && <ButtonSymbol icon={icon} />}
    </>
  );

  if (props.href !== undefined) {
    return (
      <Link
        className={classes}
        {...(rest as AnchorHTMLAttributes<HTMLAnchorElement> & { href: string })}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      className={classes}
      {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {content}
    </button>
  );
}
