import { IslandCanvas } from "@/components/scene/IslandCanvas";
import { ColumnBoard } from "@/components/scene/ColumnBoard";
import { AreaSidePanels } from "@/components/scene/AreaSidePanels";
import { PinConnectorOverlay } from "@/components/scene/PinConnectorOverlay";
import { JsonLd } from "@/components/seo/JsonLd";
import { absoluteUrl, SITE_URL } from "@/lib/seo";
import { getAreaWithPosts } from "@/lib/wp/queries/areas";

// Google のブランド/ナレッジパネル用ロゴ表示に必要。トップページのみに設置する(公式推奨)。
const organizationLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "リシリクルート",
  alternateName: "Rishiri Recruit",
  url: SITE_URL,
  logo: absoluteUrl("/images/logo/site-logo.png"),
  sameAs: ["https://note.com/ample_bear2942"],
};

export default async function Home() {
  const [oshidomariData, oniwakiData] = await Promise.all([
    getAreaWithPosts("oshidomari"),
    getAreaWithPosts("oniwaki"),
  ]);

  const areaData = {
    oshidomari: oshidomariData,
    oniwaki: oniwakiData,
  };

  return (
    <>
      <JsonLd data={organizationLd} />
      {/* in-flow の 100vh だと iOS で文書がスクロールして島だけずれるため fixed にする。
          高さは従来の 100vh と同じ lvh(ツールバーの裏まで描画し、島の見え方を保つ) */}
      <main data-home-island className="fixed inset-x-0 top-0 h-lvh overflow-hidden">
        <IslandCanvas />
      </main>
      <ColumnBoard />
      <AreaSidePanels areaData={areaData} />
      <PinConnectorOverlay />
    </>
  );
}
