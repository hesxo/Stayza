import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Sparkles } from "lucide-react";
import { useDispatch } from "react-redux";
import { useState } from "react";
import { setQuery } from "@/lib/features/searchSlice";

export default function AISearch() {
  const dispatch = useDispatch();

  const [value, setValue] = useState("");

  function handleSearch() {
    dispatch(setQuery(value));
  }

  return (
    <div className="z-10 w-full max-w-lg">
      <div className="relative flex items-center">
        <div className="relative flex-grow">
          <Input
            placeholder="Search for the experience you want" 
            name="query"
            value={value}
            className="bg-[#1a1a1a] text-sm sm:text-base text-white placeholder:text-white/70 placeholder:text-sm sm:placeholder:text-base sm:placeholder:content-['Describe_your_destination...'] border-0 rounded-full py-6 pl-4 pr-12 sm:pr-32 w-full transition-all"
            onChange={(e) => setValue(e.target.value)}
          />
        </div>

        <Button
          type="button"
          className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-x-2 text-white rounded-full px-4 py-2 shadow-lg transition-transform hover:scale-105 bg-blue-600/30 backdrop-blur-md border border-white/20"
          onClick={handleSearch}
        >
          <Sparkles className="w-4 h-4" />
          <span className="text-sm">AI Search</span>
        </Button>
      </div>
    </div>
  );
}