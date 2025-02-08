import axios from "axios";
import React, { useEffect, useState } from "react";

function useGetAllFriends() {
    const [allFriends, setAllFriends] = useState([]);
    const [friendLoading, setFriendLoading] = useState(false);

    useEffect(() => {
        const getUsers = async () => {
            setFriendLoading(true);
            try {
                const response = await axios.get(
                    "https://nexus-xwdr.onrender.com/api/message/friends",
                    {
                        withCredentials: true,
                    }
                );
                // console.log(response.data)
                setAllFriends(response.data);
                setFriendLoading(false);
            } catch (error) {
                console.log("Error in useGetAllFriends: " + error);
            }
        };
        getUsers();
    }, []);
    return [allFriends, friendLoading];
}

export default useGetAllFriends;
