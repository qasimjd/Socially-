"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Search } from "lucide-react";
import Searchbar from "./Searchbar";

const MobileSearch = () => {
  const [open, setOpen] = useState(false);

  // Function to handle search and close sheet
  const handleSearch = () => {
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        onClick={() => setOpen(true)}
        className="px-1 py-2 rounded-md"
      >
        <Search className="w-5 h-5" />
      </SheetTrigger>
      <SheetContent side="top" className="h-auto">
        <div className="flex items-center justify-between py-4 w-full">
          {/* Pass handleSearch to Searchbar */}
          <Searchbar onSearch={handleSearch} />
        </div>

        <div className="flex flex-col items-center space-y-2 py-12">
          <SheetTitle>Search with @username</SheetTitle>
          <SheetDescription>
            Search your favorite users and see their profiles.
          </SheetDescription>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileSearch;