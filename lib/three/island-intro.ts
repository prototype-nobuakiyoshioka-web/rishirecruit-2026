// トップのオープニング。島が回りながら寄ってきて、着地の少し前に UI が出る。
// 状態は <html data-intro> に持つ。CSS(UI の表示)と 3D(カメラ・ピン)の両方がこれを見る。
//   pending: 読み込み中 / playing: 島が動いている / reveal: UI が出ている / なし: 通常表示

export type IntroPhase = "pending" | "playing" | "reveal";

export const INTRO_DURATION_S = 1.8;
export const INTRO_REVEAL_AT_S = 1.5;
// reveal の CSS アニメーションが終わるまでの時間(globals.css と合わせる)
export const INTRO_UI_DURATION_MS = 900;
// 鬼脇側から回り込むよう、最終位置からこの角度だけ戻した向きで始める
export const INTRO_ROTATION = Math.PI * 0.75;
// カメラの開始距離(最終位置に対する倍率)
export const INTRO_DISTANCE_SCALE = 2.2;
// 操作されたら残りをこの速さで終わらせる
export const INTRO_SKIP_SPEED = 6;

const PLAYED_KEY = "rishirecruit:intro-played";
// モデルの読み込みがこれより遅い端末では、UI を待たせず通常表示にする
const LOAD_TIMEOUT_MS = 4000;

// 最初の描画より前に UI を隠すため、layout の先頭でインライン実行する
export const INTRO_BOOT_SCRIPT = `(function(){try{var d=document.documentElement;if(location.pathname!=="/"||sessionStorage.getItem(${JSON.stringify(PLAYED_KEY)})||matchMedia("(prefers-reduced-motion: reduce)").matches)return;d.dataset.intro="pending";setTimeout(function(){if(d.dataset.intro==="pending")delete d.dataset.intro},${LOAD_TIMEOUT_MS})}catch(e){}})()`;

export function getIntroPhase(): IntroPhase | undefined {
  return document.documentElement.dataset.intro as IntroPhase | undefined;
}

export function setIntroPhase(phase: IntroPhase | null) {
  const { dataset } = document.documentElement;
  if (phase) dataset.intro = phase;
  else delete dataset.intro;
}

export function markIntroPlayed() {
  try {
    sessionStorage.setItem(PLAYED_KEY, "1");
  } catch {
    // 保存できない環境では、次回もう一度再生されるだけ
  }
}

// 経過秒 → 0〜1 の進み具合。最後にゆっくり止まる
export function getIntroEase(elapsedSeconds: number) {
  const progress = Math.min(Math.max(elapsedSeconds / INTRO_DURATION_S, 0), 1);
  return 1 - (1 - progress) ** 3;
}
