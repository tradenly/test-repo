
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

export const SneakPeekSection = () => {
  const nftImages = [
    {
      src: "/lovable-uploads/4ca446ef-2981-4d2a-8c19-90fd5127b3e9.png",
      caption: "Lumberjack Fatty #1"
    },
    {
      src: "/lovable-uploads/aceca050-588e-4a86-8257-bf122689b8e4.png",
      caption: "Skateboard Hippo #420"
    },
    {
      src: "/lovable-uploads/c08942b4-de01-4ffd-8f25-aceb7456cf72.png",
      caption: "Rapper POOPEE #69"
    },
    {
      src: "/lovable-uploads/994f08f2-7a9a-4f04-9a6a-3ad9e2e4eb81.png",
      caption: "Teacher Hippo #101"
    },
    {
      src: "/lovable-uploads/b456bec3-2989-4045-8248-e96837155787.png",
      caption: "Miner Fatty #404"
    },
    {
      src: "/lovable-uploads/16e9f416-28c6-4320-b417-f57627247e77.png",
      caption: "Archer POOPEE #777"
    },
    {
      src: "/lovable-uploads/46117ec1-5e8a-4355-bd9a-c083ed2e0d6c.png",
      caption: "Forest Guardian #888"
    },
    {
      src: "/lovable-uploads/b6139b25-d85f-449d-bcb1-58aa8da9288e.png",
      caption: "Gentleman Hippo #999"
    },
    {
      src: "/lovable-uploads/5593da65-3fe4-44fd-8fec-2b9d4e8aee64.png",
      caption: "Bridge Walker #1337"
    }
  ];

  return (
    <section id="sneak-peek" className="py-20 px-4 bg-gradient-to-b from-gray-800 via-black to-gray-900">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-5xl md:text-6xl font-bold text-white mb-4">
          What is POOPEE? 🦛
        </h2>
        <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
          POOPEE is a meme coin and NFT collection with no use case, no promises, and no future. Basically, what all of them are anyway, but we're just more upfront and forthcoming about it.
        </p>
        
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-gray-300 mb-8 italic">
            "We are not here to moon. We're here to float." 🌙
          </h3>
        </div>

        <h3 className="text-4xl font-bold text-white mb-12">
          The Fattys You'll Regret Minting 😅
        </h3>
        
        <div className="relative">
          <Carousel className="w-full max-w-5xl mx-auto">
            <CarouselContent>
              {nftImages.map((nft, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                  <div className="p-4">
                    <div className="bg-gray-800 rounded-xl p-4 hover:scale-105 transition-transform duration-300 hover:bg-gray-700 border border-gray-700">
                      <img
                        src={nft.src}
                        alt={nft.caption}
                        className="w-full h-64 object-cover rounded-lg mb-4"
                      />
                      <p className="text-white font-bold text-lg">{nft.caption}</p>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600" />
            <CarouselNext className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600" />
          </Carousel>
        </div>

        <div className="mt-12">
          <p className="text-2xl text-gray-300 font-bold">
            Coming to the toilet near you! 🚽✨
          </p>
        </div>
      </div>
    </section>
  );
};
