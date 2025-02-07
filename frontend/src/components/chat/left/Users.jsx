import React from "react";
import User from "./User";
import useGetAllFriends from "../../../hooks/useGetAllFriends";
import useGetFriendsWithLastMessages from "../../../hooks/useGetFriendsWithLastMessages";
import Loading from "../../Loading";

function Users() {
    const [allFriends, friendLoading] = useGetAllFriends();
    const [friendsWithMessages, messagesLoading, setFriendsWithMessages] =
        useGetFriendsWithLastMessages();

    // console.log(friendsWithMessages);
    if (messagesLoading) {
        return (
            <div>
                <div className="my-2 p-1 pl-3 bg-slate-600 rounded-lg">
                    Messages
                </div>

                <div className="flex justify-center mt-10">
                    <Loading />
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="my-2 p-1 pl-3 bg-slate-600 rounded-lg">
                Messages
            </div>
            <div
                className="flex-1 overflow-y-auto"
                style={{ maxHeight: "calc(75vh)" }}
            >
                {allFriends.map((friend, index) => {
                    return <User key={index} user={friend} />;
                })}
            </div>
        </div>
    );
}

export default Users;
