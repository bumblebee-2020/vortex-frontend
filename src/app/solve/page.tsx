import dynamic from "next/dynamic";

const SolvePageClient = dynamic(() => import("./SolvePageClient"), {
  ssr: false,
});

export default function SolvePage() {
  return <SolvePageClient />;
}
