"use client";

import { Search } from "lucide-react";
import { Input } from "./ui/input";
import { useRouter } from "next/navigation";
import { useState, useCallback, KeyboardEvent } from "react";

interface SearchbarProps {
  onSearch?: () => void;
}

const Searchbar = ({ onSearch }: SearchbarProps) => {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!query.trim()) return; // Prevent empty searches
      router.push(`/profile/${encodeURIComponent(query)}`);
    },
    [query, router] // Dependencies for optimization
  );

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch(e as any); // Call the handleSearch function
      onSearch?.(); // Call the onSearch callback
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full sm:max-w-48">
      <div className="flex items-center rounded-md">
        <Input
          name="query"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search Users"
          className="flex-1 py-2 pl-3 pr-10 bg-transparent outline-none "
        />
        <button type="submit" className="absolute right-3 hover:text-white">
          <Search className="size-5" />
        </button>
      </div>
    </form>
  );
};

export default Searchbar;