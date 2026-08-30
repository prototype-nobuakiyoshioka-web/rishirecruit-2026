import { IslandCanvas } from "@/components/scene/IslandCanvas";
import { ColumnBoard } from "@/components/scene/ColumnBoard";
import { AreaSidePanels } from "@/components/scene/AreaSidePanels";
import { PinConnectorOverlay } from "@/components/scene/PinConnectorOverlay";
import { getAreaWithPosts } from "@/lib/wp/queries/areas";

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
