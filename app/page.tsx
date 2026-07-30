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
          background:
            "linear-gradient(to bottom, #87CEEB 0%, #B0E0F5 35%, #E8F4FD 50%, #1B5F8C 55%, #0A2E4E 100%)",
        }}
      >
        <IslandCanvas pins={pins} />
      </main>
      <ColumnBoard />
    </>
  );
}
