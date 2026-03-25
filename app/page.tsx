import Image from "next/image";
import SmartRetailStore from "./component/SmartRetailStore";
import ProductFetcher from "./component/ProductFetcher";
import HeroCarousel from "./component/HeroCarousel";
import FooterComponent from "./component/Footer";

export default function Home() {
  return (
    // UPDATED: Changed bg-zinc-50 to bg-white and removed dark:bg-black
    <div className="flex flex-col min-h-screen items-center justify-center bg-white font-sans">
      <SmartRetailStore />
      {/* <ProductFetcher/> */}
      <FooterComponent />
    </div>
  );
}