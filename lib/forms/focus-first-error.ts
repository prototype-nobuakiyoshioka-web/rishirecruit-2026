// 送信時のエラーが画面外に出て気づけないのを防ぐため、最初のエラー欄へ移動する。
// エラー表示の描画を待ってから探す(ラジオは aria-invalid が使えないので data-invalid)。
export function focusFirstError(form: HTMLFormElement) {
  requestAnimationFrame(() => {
    const field = form.querySelector<HTMLElement>(
      '[aria-invalid="true"], [data-invalid="true"]',
    );
    if (!field) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    field.scrollIntoView({
      block: "center",
      behavior: reduceMotion ? "auto" : "smooth",
    });
    field.focus({ preventScroll: true });
  });
}
