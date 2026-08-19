import Link from "next/link";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

/**
 * サイト共通の CTA / CV ボタン。
 *
 * ローポリ&ポップの世界観に合わせた「チャンキー・ブロック」スタイル:
 * ソリッド色のオフセット硬影(--shadow-pop-*)で分厚い積み木を表現し、
 * hover でわずかに浮き、active で影が消えてカチッと沈む(押した感)。
 *
 * href を渡すと <Link>、渡さなければ <button> としてレンダリングする。
 * 色の役割: primary=コーラル(応募/CV) / gold=ゴールド(資料・二次CTA) / aqua=一覧・回遊
 */

type ButtonVariant = "primary" | "gold" | "aqua";
type ButtonSize = "md" | "lg";

// チャンキー・ブロックの共通挙動（積み木。hoverは背景色がふわっと変わるのみ、clickでカチッと沈む）
const BASE =
  "inline-flex items-center justify-center gap-2 rounded-[var(--radius-lg)] font-black tracking-normal " +
  "transition-[background-color,box-shadow,transform] duration-150 ease-out " +
  "active:translate-y-[6px] active:shadow-none " +
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--c-warning)] " +
  "disabled:pointer-events-none disabled:opacity-60";

const SIZES: Record<ButtonSize, string> = {
  md: "min-h-12 px-6 text-sm",
  lg: "min-h-14 px-8 text-base",
};

// hover は各ベース色をわずかに明るくした色へふわっと変える
const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-[#2BA8C4] text-[color:var(--c-deep-ocean)] shadow-[var(--shadow-pop-teal)] hover:bg-[#3BBBD6]",
  gold:
    "bg-[color:var(--c-pin-spot)] text-[color:var(--c-deep-ocean)] shadow-[var(--shadow-pop-gold)] hover:bg-[#F7C766]",
  aqua:
    "bg-[color:var(--c-sky)] text-[color:var(--c-deep-ocean)] shadow-[var(--shadow-pop-sky)] hover:bg-[#78C2E8]",
};

type BaseProps = {
  variant?: ButtonVariant;
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
    size = "lg",
    fullWidth = false,
    className = "",
    children,
    ...rest
  } = props;

  const classes = [
    BASE,
    SIZES[size],
    VARIANTS[variant],
    fullWidth ? "w-full" : "w-full md:w-fit",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (props.href !== undefined) {
    return (
      <Link
        className={classes}
        {...(rest as AnchorHTMLAttributes<HTMLAnchorElement> & { href: string })}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      className={classes}
      {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  );
}
