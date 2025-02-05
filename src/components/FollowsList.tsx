import Link from "next/link";
import { Avatar, AvatarImage } from "./ui/avatar";
import FollowButton from "./FollowButton";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "./ui/drawer";

type FollowsListProps = {
    users: any[];
    title: string;
    count: number;
    initialIsFollowing: boolean;
};

const FollowsList = ({ users = [], title, count, initialIsFollowing }: any) => {
    return (
        <Drawer>
            <DrawerTrigger asChild>
                <div className="cursor-pointer">
                    <p className="font-semibold">{count}</p>
                    <p className="text-muted-foreground">{title}</p>
                </div>
            </DrawerTrigger>
            <DrawerContent className="h-[80vh] sm:w-1/2 mx-auto px-8">
                <DrawerHeader className="flex items-center justify-center mb-4">
                    <DrawerTitle>{title} List</DrawerTitle>
                </DrawerHeader>
                <div className="space-y-4">
                    {users.length > 0 ? (
                        users.map((user: any) => (
                            <div key={user.id} className="flex gap-2 items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Link href={`/profile/${user.username}`}>
                                        <Avatar>
                                            <AvatarImage src={user.image ?? "/avatar.png"} />
                                        </Avatar>
                                    </Link>
                                    <div className="text-xs">
                                        <Link href={`/profile/${user.username}`} className="font-medium cursor-pointer">
                                            {user.name}
                                        </Link>
                                        <p className="text-muted-foreground">@{user.username}</p>
                                        <p className="text-muted-foreground">{count} followers</p>
                                    </div>
                                </div>
                                <FollowButton initialIsFollowing={initialIsFollowing} userId={user.id} />
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-muted-foreground">No {title} yet</p>
                    )}
                </div>
            </DrawerContent>
        </Drawer>
    );
};

export default FollowsList;
