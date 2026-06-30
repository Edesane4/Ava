import { PawLoader } from "@/components/ui/Loaders";

export default function Loading() {
  return (
    <div className="mx-auto max-w-md px-4 pt-20">
      <PawLoader label="Fetching the good boys…" />
    </div>
  );
}
