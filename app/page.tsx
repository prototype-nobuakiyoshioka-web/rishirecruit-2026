import { IslandCanvas } from "@/components/scene/IslandCanvas";
import { ColumnBoard } from "@/components/scene/ColumnBoard";
import { getPinData } from "@/lib/wp/queries/pins";

export default async function Home() {
  const pins = await getPinData();

  return (
    <>
      <main
        className="h-screen w-screen overflow-hidden"
        style={{
          width: "100vw",
          height: "100vh",
        }}
      >
        <IslandCanvas pins={pins} />
      </main>
      <ColumnBoard />
    </>
  );
}
