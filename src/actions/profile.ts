"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getDbUserId } from "./user";

export async function getProfileByUsername(username: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { username },
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

        if (!user) return;

        return {
            ...user,
            followers: user.followers.map(f => f.follower),
            following: user.following.map(f => f.following),
        };

    } catch (error) {
        console.error("Error fetching profile:", error);
        return null;
    }
};

export async function getUserPosts(userId: string) {
    try {
        const posts = await prisma.post.findMany({
            where: {
                authorId: userId,
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true,
                    },
                },
                comments: {
                    include: {
                        author: {
                            select: {
                                id: true,
                                name: true,
                                username: true,
                                image: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: "asc",
                    },
                },
                likes: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                username: true,
                                image: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        likes: true,
                        comments: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return posts;
    } catch (error) {
        console.error("Error fetching user posts:", error);
        throw new Error("Failed to fetch user posts");
    }
}

export async function getUserLikedPosts(userId: string) {
    try {
        const likedPosts = await prisma.post.findMany({
            where: {
                likes: {
                    some: {
                        userId,
                    },
                },
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true,
                    },
                },
                comments: {
                    include: {
                        author: {
                            select: {
                                id: true,
                                name: true,
                                username: true,
                                image: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: "asc",
                    },
                },
                likes: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                username: true,
                                image: true,
                            },
                        },
                    }
                },
                _count: {
                    select: {
                        likes: true,
                        comments: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return likedPosts || [];
    } catch (error) {
        console.error("Error fetching liked posts:", error);
        throw new Error("Failed to fetch liked posts");
    }
};

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
export async function updateProfile(formData: FormData) {
    try {
        // Extract form data
        const userId = formData.get("userId") as string;
        const name = formData.get("name") as string;
        const newUsername = formData.get("username") as string;
        const bio = formData.get("bio") as string;
        const location = formData.get("location") as string;
        const website = formData.get("website") as string;
        const currentUsername = formData.get("currentUsername") as string;

        if (!userId) {
            return { success: false, message: "User ID is required" };
        }

        // Update user in database
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                name: name || null,
                username: newUsername,
                bio: bio || null,
                location: location || null,
                website: website || null,
            },
        });

        // Revalidate old and new paths
        if (currentUsername !== newUsername) {
            revalidatePath(`/${currentUsername}`);
        }
        revalidatePath(`/${updatedUser.username}`);

        return { success: true, newUsername: updatedUser.username };
    } catch (error) {
        console.error("Error updating profile:", error);
        return { success: false, message: "Failed to update profile" };
    }
}