import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Sparkles } from "lucide-react";
import { useDispatch } from "react-redux";
import { useState } from "react";
import { setQuery } from "@/lib/features/searchSlice";

export default function AISearch() {
  const dispatch = useDispatch();

  const [value, setValue] = useState("");

  function handleSearch(event) {
    event?.preventDefault();
    const trimmedValue = value.trim();
    if (!trimmedValue) {
      return;
    }

    dispatch(setQuery(trimmedValue));
    setValue(trimmedValue);
  }

  return (
    <div className="z-10 w-full max-w-lg">
      <form className="relative flex items-center" onSubmit={handleSearch}>
        <div className="relative flex-grow">
          <Input
            placeholder="Search for the experience you want"
            name="query"
            value={value}
            className="bg-[#1a1a1a] text-sm sm:text-base text-white placeholder:text-white/70 border-0 rounded-full py-6 pl-4 pr-12 sm:pr-32 w-full transition-all"
            onChange={(e) => setValue(e.target.value)}
          />
        </div>

        <Button
          type="submit"
          className="absolute right-2 h-[80%] my-auto bg-black text-white rounded-full px-2 sm:px-4 flex items-center gap-x-2 border-white border-2 hover:bg-black/80 transition-colors"
        >
          <Sparkles className="w-4 h-4 fill-white" />
          <span className="text-sm">AI Search</span>
        </Button>
      </form>
    </div>
  );
}
