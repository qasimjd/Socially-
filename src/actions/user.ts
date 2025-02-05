"use server";

import prisma from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export const syncUser = async () => {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) return;

    const existingUser = await prisma.user.findUnique({
      where: {
        clerkId: userId,
      },
    });

    if (existingUser) return;

    const dbUser = await prisma.user.create({
      data: {
        clerkId: userId,
        name: `${user.firstName || ""} ${user.lastName || ""}`,
        username: user.username ?? user.emailAddresses[0].emailAddress.split("@")[0],
        email: user.emailAddresses[0].emailAddress,
        image: user.imageUrl,
      },
    });
    return dbUser;

  } catch (error) {
    console.log("Error in syncUser", error);
  }
};

export const getUserByClerkId = async (clerkId: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        clerkId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        bio: true,
        image: true,
        location: true,
        website: true,
        createdAt: true,
        _count: {
          select: {
            followers: true,
            following: true,
            posts: true,
            likes: true,
          },
        },
        followers: {
          select: {
            follower: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true
              }
            }
          }
        },
        following: {
          select: {
            following: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true
              }
            }
          }
        }
      },
    });
    if (!user) return ;

        return {
            ...user,
            followers: user.followers.map(f => f.follower),
            following: user.following.map(f => f.following),
        };
  } catch (error) {
    console.log("Error in getUserByClerkId", error);
  }
};

export const getDbUserId = async () => {
  try {
    const { userId } = await auth();
    if (!userId) return;

    const user = await getUserByClerkId(userId);

    return user?.id;
  } catch (error) {
    console.log("Error in getDbUserId", error);
  }
};

export const getRandomUsers = async () => {
  try {
    const userId = await getDbUserId();
    if (!userId) return [];

    const users = await prisma.user.findMany({
      where: {
        AND: [
          { NOT: { id: userId } },
          { NOT: { followers: { some: { followerId: userId } } } },
        ],
      },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        _count: {
          select: {
            followers: true,
          },
        },
      },
      take: 3,
    });
    return users;
  } catch (error) {
    console.log("Error in getRandomUsers", error);
  }
};

export async function toggleFollow(targetUserId: string) {
  try {
    const userId = await getDbUserId();
    if (!userId) return { success: false, error: "Not authenticated" };
    if (userId === targetUserId) return { success: false, error: "Can't follow yourself" };

    const existingFollow = await prisma.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId: targetUserId,
        },
      },
    });

    if (existingFollow) {
      await prisma.follows.delete({
        where: {
          followerId_followingId: {
            followerId: userId,
            followingId: targetUserId,
          },
        },
      });
    } else {
      await prisma.$transaction([
        prisma.follows.create({
          data: {
            followerId: userId,
            followingId: targetUserId,
          },
        }),
        prisma.notification.create({
          data: {
            type: "FOLLOW",
            userId: targetUserId,
            creatorId: userId,
          },
        }),
      ]);
    }

    // Revalidate relevant paths
    revalidatePath(`/profile/${targetUserId}`);
    revalidatePath("/");
    
    return { success: true };
  } catch (error) {
    console.log("Error in toggleFollow", error);
    return { success: false, error: "Error toggling follow" };
  }
}

// actions/user.ts
export const isFollowing = async (targetUserId: string) => {
  try {
    const currentUserId = await getDbUserId();
    if (!currentUserId) return false;

    const follow = await prisma.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: targetUserId,
        },
      },
    });

    return !!follow;
  } catch (error) {
    console.error("Error checking if following:", error);
    return false;
  }
};

export const isFollowedBy = async (targetUserId: string) => {
  try {
    const currentUserId = await getDbUserId();
    if (!currentUserId) return false;

    const follow = await prisma.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId: targetUserId,
          followingId: currentUserId,
        },
      },
    });

    return !!follow;
  } catch (error) {
    console.error("Error checking if followed by:", error);
    return false;
  }
};