"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Hero from "@/components/hero";
import { AppleCardsCarouselDemo } from "@/components/cards-carousel";
import NavigationMenu from "@/components/navbar";
import { FeaturesSectionDemo } from "@/components/cards";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <div className="w-full h-screen">
      <NavigationMenu />
      <AppleCardsCarouselDemo />
      <div className="pt-[50px]">
        <FeaturesSectionDemo />
      </div>
      <Footer />
    </div>
  );
}
