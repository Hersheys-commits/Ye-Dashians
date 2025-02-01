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
                    "http://localhost:4001/api/message/friends",
                    {
                        withCredentials: true,
                    }
                );
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
