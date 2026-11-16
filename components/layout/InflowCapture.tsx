"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { recordInternalNavigation, recordPageLoad } from "@/lib/forms/inflow-storage";

// 応募・お問い合わせのメールに添える流入元を記録する。画面には何も出さない。
// 読み込み時だけ入り方を読み取り、その後のサイト内移動では訪問の時刻だけ進める。
export function InflowCapture() {
  const pathname = usePathname();
  const loaded = useRef(false);

  useEffect(() => {
    if (!loaded.current) {
      loaded.current = true;
      recordPageLoad();
      return;
    }
    recordInternalNavigation();
  }, [pathname]);

  return null;
}
