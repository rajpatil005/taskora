import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Header({ title }: { title: string }) {
  const router = useRouter();

  return (
    <header className="border-b border-white/10 bg-transparent/90 backdrop-blur-xl sticky top-0 z-40">
      <div className="container mx-auto px-4 py-5 flex items-center gap-4">
        <Button onClick={() => router.back()} size="sm" variant="outline">
          Back
        </Button>

        <h1 className="text-2xl font-bold">{title}</h1>
      </div>
    </header>
  );
}
