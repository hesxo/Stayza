import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Plus, Sparkles } from "lucide-react";
// import { useDispatch } from "react-redux";
// import { submit } from "@/lib/features/searchSlice";
import { cn } from "@/lib/utils";

const heroImages = [
  "https://i.postimg.cc/3Jvz1RhZ/Heritance-Kandalama.jpg",
  "https://i.postimg.cc/VkTxWCr4/grand-hotel-graden-1920x1000-1.jpg",
  "https://i.postimg.cc/Jz4r2ZhL/588945741.jpg",
  "https://i.postimg.cc/nLXHHx7S/67d3c92725330.jpg",
  "https://i.postimg.cc/Y2YCGtPJ/Cinnamon-Bentota-Beach-header.jpg",
  "https://i.postimg.cc/sDMK90Yd/R-P-B-H-hd-1400x715-1.webp",
  "https://i.postimg.cc/c4z9pNxL/490937419.jpg",
  "https://i.postimg.cc/7h9v3t0T/6526649-halcyon-mawella-kotuwaththawewatta-sri-lanka.webp",
];

export default function Hero() {
  //   const dispatch = useDispatch();

  // Logic for animating slides
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goToSlide = useCallback(
    (index) => {
      if (index === currentSlide || isTransitioning) return;
      setIsTransitioning(true);
      setCurrentSlide(index);
    },
    [currentSlide, isTransitioning]
  );

  useEffect(() => {
    let transitionTimeout;
    if (isTransitioning) {
      transitionTimeout = setTimeout(() => setIsTransitioning(false), 500);
    }
    return () => clearTimeout(transitionTimeout);
  }, [isTransitioning]);

  useEffect(() => {
    let intervalId;
    if (!isTransitioning) {
      intervalId = setInterval(() => {
        const nextSlide = (currentSlide + 1) % heroImages.length;
        goToSlide(nextSlide);
      }, 3000);
    }
    return () => clearInterval(intervalId);
  }, [currentSlide, isTransitioning, goToSlide]);

  //   const handleSearch = useCallback(
  //     (e) => {
  //       e.preventDefault();
  //       const searchQuery = e.target.search.value.trim();
  //       if (!searchQuery) return;

  //       try {
  //         dispatch(submit(searchQuery));
  //       } catch (error) {
  //         console.error("Search failed:", error);
  //       }
  //     },
  //     [dispatch]
  //   );

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Hey");
  };

  return (
    <div className="relative h-[500px] md:h-[600px] py-3 mx-4 overflow-hidden rounded-3xl bg-black z-0">
      {/* Background Images */}
      {heroImages.map((image, index) => (
        <div
          key={index}
          className={cn(
            "absolute inset-0 bg-cover bg-center transition-opacity duration-500",
            currentSlide === index ? "opacity-100" : "opacity-0"
          )}
          style={{ backgroundImage: `url(${image})` }}
        >
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
      ))}

      {/* Hero Content */}
      <div className="relative z-10 flex flex-col items-center text-white justify-center h-full px-4 sm:px-8 z-0">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 text-center">
          Find Your Best Staycation
        </h1>
        <p className="text-base md:text-lg mb-8 text-center max-w-2xl">
          Describe your dream destination and experience, and we'll find the
          perfect place for you.
        </p>

        {/* Modern Search Form */}
<form onSubmit={handleSearch} className="w-full max-w-lg">
  <div className="relative flex items-center p-1.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl">
    <Input
      type="text"
      name="search"
      placeholder="Describe your destination or experience..."
      className="bg-transparent text-white placeholder:text-white/60 border-0 rounded-full py-5 pl-6 pr-36 w-full focus:ring-2 focus:ring-white/40 transition-all"
    />
    <button
  type="submit"
className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-x-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full px-5 py-2 shadow-md hover:scale-105 transition-transform"
>
  <Sparkles className="w-5 h-5" />
  <span className="font-semibold text-base">AI Search</span>
</button>
  </div>
</form>

        <div className="absolute bottom-6 flex space-x-3">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "h-3 transition-all rounded-full",
                currentSlide === index
                  ? "bg-white w-8"
                  : "bg-white/50 w-3 hover:bg-white/70"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
