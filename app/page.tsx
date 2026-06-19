import { IslandCanvas } from "@/components/scene/IslandCanvas";

export default function Home() {
  return (
    <main className="h-screen w-screen overflow-hidden bg-[var(--c-deep-ocean)]">
      <IslandCanvas />
    </main>
  );
}
