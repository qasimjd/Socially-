import { BellIcon, HomeIcon, UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SignInButton, UserButton } from "@clerk/nextjs";
import { ModeToggle } from "./Mode-toggle";
import { currentUser } from "@clerk/nextjs/server";
import Searchbar from "./Searchbar";
import { getUserByClerkId } from "@/actions/user";

async function DesktopNavbar() {
  const user = await currentUser();
  const dbUser = await getUserByClerkId(user?.id || "");

  return (
    <div className="hidden md:flex items-center space-x-1">

      <Searchbar />

      <ModeToggle />

      <Button variant="ghost" className="flex items-center " asChild>
        <Link href="/">
          <HomeIcon className="w-4 h-4" />
          {/* <span className="hidden lg:inline">Home</span> */}
        </Link>
      </Button>

      {user ? (
        <>
          <Button variant="ghost" className="flex items-center gap-2" asChild>
            <Link href="/notifications">
              <BellIcon className="w-4 h-4" />
              {/* <span className="hidden lg:inline">Notifications</span> */}
            </Link>
          </Button>
          <Button variant="ghost" className="flex items-center gap-2" asChild>
            <Link
              href={`/profile/${dbUser?.username}`}
            >
              <UserIcon className="w-4 h-4" />
              {/* <span className="hidden lg:inline">Profile</span> */}
            </Link>
          </Button>
          <UserButton />
        </>
      ) : (
        <SignInButton mode="modal">
          <Button variant="default">Sign In</Button>
        </SignInButton>
      )}
    </div>
  );
}
export default DesktopNavbar;