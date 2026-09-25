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
      <main
        className="h-screen w-screen overflow-hidden"
        style={{
          width: "100vw",
          height: "100vh",
        }}
      >
        <IslandCanvas />
      </main>
      <ColumnBoard />
      <AreaSidePanels areaData={areaData} />
      <PinConnectorOverlay />
    </>
  );
}
