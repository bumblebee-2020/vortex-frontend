import dynamic from "next/dynamic";

const ExplorePageClient = dynamic(() => import("./ExplorePageClient"), {
  ssr: false,
});

export default function ExplorePage() {
  return <ExplorePageClient />;
}
