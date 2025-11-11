import { forwardRef, useEffect, useState } from "react";
import CountUp from "react-countup";
import AISearch from "./AISearch";

const cardImages = [
  "https://i.postimg.cc/3Jvz1RhZ/Heritance-Kandalama.jpg",
  "https://i.postimg.cc/VkTxWCr4/grand-hotel-graden-1920x1000-1.jpg",
  "https://i.postimg.cc/Jz4r2ZhL/588945741.jpg",
  "https://i.postimg.cc/nLXHHx7S/67d3c92725330.jpg",
];

export const Hero = forwardRef(
  (
    { scrollToHotelList, statistics, isStatisticsLoading, isStatisticsError },
    ref
  ) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
      const id = setInterval(
        () => setCurrentIndex((index) => (index + 1) % cardImages.length),
        3000
      );
      return () => clearInterval(id);
    }, []);

    const stats = statistics ?? {
      hotelsCount: 0,
      usersCount: 0,
      appRating: 0,
    };

    if (isStatisticsLoading) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary" />
        </div>
      );
    }

    if (isStatisticsError) {
      return (
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col items-center gap-8 lg:flex-row" ref={ref}>
            <div className="w-full space-y-6 lg:w-1/2">
              <h1 className="text-4xl font-bold leading-tight text-gray-900 md:text-5xl">
                Find Your Perfect <br />
                <span className="text-black">Luxury Staycation</span>
              </h1>
              <p className="text-lg text-gray-600">
                Discover handpicked luxury accommodations for unforgettable
                experiences, all in one place.
              </p>
              <AISearch />
              <div className="text-sm italic text-gray-500">
                Try: Hotels with rooftop views in Sydney, Australia
              </div>
              <div className="flex items-center space-x-6 pt-4">
                <p className="text-sm italic text-gray-500">
                  Statistics are currently unavailable
                </p>
              </div>
            </div>

            <div className="w-full lg:w-1/2">
              <div className="relative flex h-[500px] items-center justify-center overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl">
                <img
                  src={cardImages[currentIndex]}
                  alt={`Slide ${currentIndex + 1}`}
                  className="h-full w-full object-cover"
                />
                <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 space-x-2">
                  {cardImages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-2 w-8 rounded-full ${
                        currentIndex === idx ? "bg-black" : "bg-gray-300"
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <section className="section-shell" data-animate="fade-up" ref={ref}>
        <div className="flex flex-col items-center gap-10 lg:flex-row">
          <div className="w-full space-y-6 lg:w-1/2">
            <span className="text-pill text-foreground/70">
              Curated stays across the globe
            </span>
            <h1>
              Find your perfect <span className="text-primary">luxury stay</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Discover handpicked hideaways, design-forward hotels, and serene
              villas tailored to the way you want to travel.
            </p>
            <AISearch />
            <div className="text-sm text-muted-foreground">
              Try: Boutique stays with plunge pools in Lisbon
            </div>
            <div className="flex flex-wrap items-center gap-8 pt-4">
              <div>
                <p className="text-4xl font-semibold">
                  <CountUp end={stats.hotelsCount} duration={0.5} />+
                </p>
                <p className="text-sm text-muted-foreground">Luxury Hotels</p>
              </div>
              <div>
                <p className="text-4xl font-semibold">
                  <CountUp end={stats.usersCount} duration={0.5} />+
                </p>
                <p className="text-sm text-muted-foreground">Happy Guests</p>
              </div>
              <div>
                <p className="text-4xl font-semibold">
                  <CountUp end={stats.appRating} decimals={1} duration={0.5} />
                  +
                </p>
                <p className="text-sm text-muted-foreground">App Rating</p>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-1/2" data-animate="scale-in">
            <div className="relative flex h-[480px] items-center justify-center overflow-hidden rounded-[2rem] border border-border/50 bg-card shadow-[0_25px_80px_rgba(15,23,42,0.2)]">
              <img
                src={cardImages[currentIndex]}
                alt={`Slide ${currentIndex + 1}`}
                className="h-full w-full object-cover"
              />
              <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
                {cardImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-2 w-8 rounded-full transition-colors ${
                      currentIndex === idx
                        ? "bg-primary"
                        : "bg-white/50 hover:bg-white"
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
);

export default Hero;
