import {
    getProfileByUsername,
    getUserLikedPosts,
    getUserPosts,
    isFollowing,
  } from "@/actions/profile";
  import { notFound } from "next/navigation";
  import ProfilePageClient from "./ProfilePageClient";
import { getDbUserId } from "@/actions/user";
  
  export async function generateMetadata({ params }: { params: Promise<{ username: string }> }) {
    const username = (await params).username;
    const user = await getProfileByUsername(username);
    if (!user) return;
  
    return {
      title: `${user.name ?? user.username}`,
      description: user.bio || `Check out ${user.username}'s profile.`,
    };
  }
  
  async function ProfilePageServer({ params }: { params: Promise<{ username: string }> }) {

    const username = (await params).username;
    const user = await getProfileByUsername(username);
  
    if (!user) notFound();
  
    const [posts, likedPosts, isCurrentUserFollowing, dbUserId] = await Promise.all([
      getUserPosts(user.id),
      getUserLikedPosts(user.id),
      isFollowing(user.id),
      getDbUserId() ?? "",
    ]);
  
    return (
      <ProfilePageClient
        user={user}
        posts={posts}
        dbUserId={dbUserId || ""}
        likedPosts={likedPosts}
        isFollowing={isCurrentUserFollowing}
      />
    );
  }
  export default ProfilePageServer;