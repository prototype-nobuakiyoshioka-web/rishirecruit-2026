import Link from "next/link";

export function FooterOfficeInfo({ className = "" }: { className?: string }) {
  return (
    <address className={["not-italic tracking-normal", className].join(" ")}>
      <span className="block font-bold">利尻富士町役場</span>
      <span className="mt-[var(--space-2)] block">〒097-0101</span>
      <span className="block">北海道利尻郡利尻富士町鴛泊富士野6</span>
      <span className="mt-[var(--space-2)] block">Tel: 0163-82-1111</span>
      <span className="block">Fax: 0163-82-1253</span>
    </address>
  );
}

export function FooterLegalLinks({ className = "" }: { className?: string }) {
  return (
    <nav className={["flex flex-wrap gap-[var(--space-3)]", className].join(" ")}>
      <Link href="/privacy" className="transition-colors hover:underline">
        プライバシーポリシー
      </Link>
      <Link href="/terms" className="transition-colors hover:underline">
        利用規約
      </Link>
    </nav>
  );
}

export function FooterCopyright({ className = "" }: { className?: string }) {
  return (
    <p className={["tracking-normal", className].join(" ")}>
      © 2026 rishirecruit ・ 利尻富士町
      <span className="mt-2 block text-[10px] leading-relaxed">
        3D地形：<a href="https://maps.gsi.go.jp/development/ichiran.html" className="underline">国土地理院</a>の標高タイルを加工 ／ 地図データ：© <a href="https://www.openstreetmap.org/copyright" className="underline">OpenStreetMap contributors</a>
      </span>
    </p>
  );
}
