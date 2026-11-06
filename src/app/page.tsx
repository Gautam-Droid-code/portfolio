import { Contact } from "@/components/sections/contact";
import { Faq } from "@/components/sections/faq";
import { Hero } from "@/components/sections/hero";
import { Services } from "@/components/sections/services";
import { Work } from "@/components/sections/work";

export default function Home() {
  return (
    <>
      {/* Hero + About live together in the top glass frame. */}
      <Hero />
      <Work />
      <Services />
      <Faq />
      <Contact />
    </>
  );
}
