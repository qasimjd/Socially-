"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import toast from "react-hot-toast";
import { toggleFollow } from "@/actions/user";
import { useUser } from "@clerk/nextjs";

function FollowButton({ userId, initialIsFollowing }: { userId: string; initialIsFollowing: boolean }) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isUpdatingFollow, setIsUpdatingFollow] = useState(false);
  const { user: currentUser } = useUser();

  const handleFollow = async () => {

    if (!currentUser) return;

    try {
      setIsUpdatingFollow(true);
      await toggleFollow(userId);
      setIsFollowing(!isFollowing);
    } catch (error) {
      toast.error("Failed to update follow status");
    } finally {
      setIsUpdatingFollow(false);
    }
  };

  // if (!currentUser) return (
  //   <SignInButton mode="modal">
  //     <Button className="w-full mt-2">Follow</Button>
  //   </SignInButton>
  // ) 

  return (
    <Button
      size={"sm"}
      onClick={handleFollow}
      disabled={isUpdatingFollow}
      className="w-20"
      variant={isFollowing ? "outline" : "default"}
      >
        {isFollowing ? "Unfollow" : "Follow"}
    </Button>
  );
}
export default FollowButton;