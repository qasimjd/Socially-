"use server";

import prisma from "@/lib/prisma";
import { getDbUserId } from "./user";

export async function getNotifications() {
    const userId = await getDbUserId();
    if (!userId) return [];

    try {
        const notifications = await prisma.notification.findMany({
            where: {
                userId,
            },
            include: {
                creator: {
                    select: {
                        username: true,
                        image: true,
                        id: true,
                        name: true,
                    },

                }, post: {
                    select: {
                        id: true,
                        image: true,
                        content: true,
                    },
                },
                comment: {
                    select: {
                        id: true,
                        content: true,
                        createdAt: true,

                    },
                },

            },orderBy: {
                createdAt: "desc",
            }
        });
        return notifications;
    } catch (error) {
        console.error(error);
        throw new Error("Failed to get notifications");
    }
}

export async function markNotificationsAsRead( notificationIds: string[]) {
    try {
        await prisma.notification.updateMany({
            where: {
                id: {
                    in: notificationIds,
                },
            },
            data: {
                read: true,
            },
        });
    } catch (error) {
        console.error(error);
        throw new Error("Failed to mark notifications as read");
    }
}

export async function deleteAllNotifications() {
    const userId = await getDbUserId();
    if (!userId) return { success: false, message: "User not found" };

    try {
        await prisma.notification.deleteMany({
            where: {
                userId,
            },
        });

        return { success: true, message: "All notifications deleted successfully" };
    } catch (error) {
        console.error("Error deleting notifications:", error);
        return { success: false, message: "Failed to delete notifications" };
    }
}
