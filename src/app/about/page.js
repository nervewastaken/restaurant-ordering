"use client";
import { Aboutdev } from "@/components/aboutdev";
import { FeaturesSectionDemo } from "@/components/cards";
import { Footer } from "@/components/footer";
import NavigationMenu from "@/components/navbar";

export default function page() {
  return (
    <div>
      <NavigationMenu />
      <div className="">
        <Aboutdev />
      </div>
      <Footer />
    </div>
  );
}
