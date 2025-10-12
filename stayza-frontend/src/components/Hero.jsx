import React, { useState, useEffect, forwardRef } from "react";
import { useDispatch } from "react-redux";
import { setQuery } from "@/lib/features/searchSlice";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import CountUp from "react-countup";

// Images to show inside the card (user-facing picture switcher)
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
		const [destination, setDestination] = useState("");
		const dispatch = useDispatch();

	// Card image switcher state
	const [currentIndex, setCurrentIndex] = useState(0);
	const prevImage = () => setCurrentIndex((i) => (i - 1 + cardImages.length) % cardImages.length);
	const nextImage = () => setCurrentIndex((i) => (i + 1) % cardImages.length);

	// Auto-advance images every 3 seconds
	useEffect(() => {
		const id = setInterval(() => {
			setCurrentIndex((i) => (i + 1) % cardImages.length);
		}, 3000);
		return () => clearInterval(id);
	}, []);

		const stats = statistics ?? { hotelsCount: 0, usersCount: 0, appRating: 0 };

		const handleSubmit = (e) => {
			e.preventDefault();
			const searchValue = e.target.search?.value?.trim();
			if (searchValue) dispatch(setQuery(searchValue));
			if (typeof scrollToHotelList === "function") scrollToHotelList();
		};

		if (isStatisticsLoading) {
			return (
				<div className="flex justify-center items-center min-h-screen">
					<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
				</div>
			);
		}

		if (isStatisticsError) {
			return (
				<div className="container mx-auto px-4 py-12">
					<div className="flex flex-col lg:flex-row gap-8 items-center" ref={ref}>
						<div className="w-full lg:w-1/2 space-y-6">
							<h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
								Find Your Perfect <br />
								<span className="text-black">Luxury Staycation</span>
							</h1>
							<p className="text-lg text-gray-600 max-w-md">
								Discover handpicked luxury accommodations for unforgettable
								experiences, all in one place.
							</p>

							<form
								onSubmit={handleSubmit}
								className="flex items-center bg-white shadow-md rounded-full overflow-hidden w-full max-w-xl h-14 border border-gray-200"
							>
								<Input
									name="search"
									value={destination}
									onChange={(e) => setDestination(e.target.value)}
									placeholder="Describe the experience you are looking for"
									className="flex-grow px-4 py-3 border-none ring-0 focus-visible:ring-0 focus:outline-none h-full"
								/>
								<Button
									type="submit"
									variant="default"
									className="rounded-full px-6 h-12 flex mr-1 items-center gap-2 bg-black text-white hover:bg-gray-800 transition-colors"
								>
									<Sparkles className="animate-pulse text-sky-400" />
									AI Search
								</Button>
							</form>
							<div className="text-sm text-gray-500 italic">
								Try: Hotels with rooftop views in Sydney, Australia
							</div>
							<div className="flex items-center space-x-6 pt-4">
								<p className="text-sm text-gray-500 italic">
									Statistics are currently unavailable
								</p>
							</div>
						</div>

						<div className="w-full lg:w-1/2">
							<div className="rounded-3xl overflow-hidden shadow-2xl bg-white border border-gray-100 h-[500px] relative flex items-center justify-center">
								<img
									src={cardImages[currentIndex]}
									alt={`Slide ${currentIndex + 1}`}
									className="w-full h-[500px] object-cover"
								/>
								{/* Manual prev/next removed — auto-advance + dots remain */}
								<div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2">
									{cardImages.map((_, idx) => (
										<button
											key={idx}
											onClick={() => setCurrentIndex(idx)}
											className={`h-2 w-8 rounded-full ${currentIndex === idx ? "bg-black" : "bg-gray-300"}`}
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
			<div className="relative">
				{/* Background Slides */}
					<div className="absolute inset-0 -z-10 bg-white" />

				<div className="container mx-auto px-4 py-12">
					<div className="flex flex-col lg:flex-row gap-8 items-center" ref={ref}>
						<div className="w-full lg:w-1/2 space-y-6">
							<h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
								Find Your Perfect <br />
								<span className="text-black">Luxury Staycation</span>
							</h1>
							<p className="text-lg text-gray-600 max-w-md">
								Discover handpicked luxury accommodations for unforgettable
								experiences, all in one place.
							</p>

							<form
								onSubmit={handleSubmit}
								className="flex items-center bg-white shadow-md rounded-full overflow-hidden w-full max-w-xl h-14 border border-gray-200"
							>
								<Input
									name="search"
									value={destination}
									onChange={(e) => setDestination(e.target.value)}
									placeholder="Describe the experience you are looking for"
									className="flex-grow px-4 py-3 border-none ring-0 focus-visible:ring-0 focus:outline-none h-full"
								/>
								<Button
									type="submit"
									variant="default"
									className="rounded-full px-6 h-12 flex mr-1 items-center gap-2 bg-black text-white hover:bg-gray-800 transition-colors"
								>
									<Sparkles className="animate-pulse text-sky-400" />
									AI Search
								</Button>
							</form>
							<div className="text-sm text-gray-500 italic">
								Try: Hotels with rooftop views in Sydney, Australia
							</div>
							{/* Statistics */}
							<div className="flex items-center space-x-6 pt-4">
								<div>
									<p className="text-2xl font-bold">
										<CountUp end={stats.hotelsCount} duration={0.5} />+
									</p>
									<p className="text-gray-500">Luxury Hotels</p>
								</div>
								<div>
									<p className="text-2xl font-bold">
										<CountUp end={stats.usersCount} duration={0.5} />+
									</p>
									<p className="text-gray-500">Happy Guests</p>
								</div>
								<div>
									<p className="text-2xl font-bold">
										<CountUp end={stats.appRating} decimals={1} duration={0.5} />
										+
									</p>
									<p className="text-gray-500">Customer Rating</p>
								</div>
							</div>
						</div>

						<div className="w-full lg:w-1/2">
							<div className="rounded-3xl overflow-hidden shadow-2xl bg-white border border-gray-100 h-[500px] relative flex items-center justify-center">
								<img
									src={cardImages[currentIndex]}
									alt={`Slide ${currentIndex + 1}`}
									className="w-full h-[500px] object-cover"
								/>
								{/* Manual prev/next removed — auto-advance + dots remain */}
								<div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2">
									{cardImages.map((_, idx) => (
										<button
											key={idx}
											onClick={() => setCurrentIndex(idx)}
											className={`h-2 w-8 rounded-full ${currentIndex === idx ? "bg-black" : "bg-gray-300"}`}
											aria-label={`Go to slide ${idx + 1}`}
										/>
									))}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
);

export default Hero;