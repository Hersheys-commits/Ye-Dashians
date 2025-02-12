import React, { useState } from "react";
import User from "./User";
import useGetAllFriends from "../../../hooks/useGetAllFriends";
import useGetFriendsWithLastMessages from "../../../hooks/useGetFriendsWithLastMessages";
import Loading from "../../Loading";
import { useSocket } from "../../../hooks/socketHook";

function Users() {
    const [allFriends] = useGetAllFriends();
    const [friendsWithMessages, messagesLoading] =
        useGetFriendsWithLastMessages();
    const { onlineUsers } = useSocket();
    const [showOnlineOnly, setShowOnlineOnly] = useState(false);

    // If messages are still loading, show a loading spinner.
    if (messagesLoading) {
        return (
            <div>
                <div className="my-2 p-1 pl-3 bg-base-300 rounded-lg text-base-content">
                    Messages
                </div>
                <div className="flex justify-center mt-10">
                    <Loading />
                </div>
            </div>
        );
    }

    // Filter friends based on online status when the checkbox is checked.
    const filteredFriends = showOnlineOnly
        ? allFriends.filter((friend) =>
              // Ensure friend?._id and the onlineUsers values are of the same type.
              onlineUsers.includes(friend?._id.toString())
          )
        : allFriends;

    return (
        <div>
            {/* Header with "Messages" label and the checkbox for filtering online friends */}
            <div className="my-2 p-1 pl-3 bg-base-300 rounded-lg text-base-content flex justify-between items-center">
                <span>Messages</span>
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="onlineFriends"
                        className="checkbox"
                        checked={showOnlineOnly}
                        onChange={(e) => setShowOnlineOnly(e.target.checked)}
                    />
                    <label htmlFor="onlineFriends" className="ml-2 italic">
                        Online Friends
                    </label>
                </div>
            </div>

            {/* Friends list (filtered if "Online Friends" is checked) */}
            <div
                className="flex-1 overflow-y-auto"
                style={{ maxHeight: "calc(75vh)" }}
            >
                {filteredFriends.map((friend) => (
                    <User key={friend?._id} user={friend} />
                ))}
            </div>
        </div>
    );
}

export default Users;
