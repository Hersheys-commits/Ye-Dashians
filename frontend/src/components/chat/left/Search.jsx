import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";
import useGetAllFriends from "../../../hooks/useGetAllFriends";
import { setSelectedFriend } from "../../../store/chatSlice";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import api from "../../../utils/axiosRequest";

function Search() {
    const [search, setSearch] = useState("");
    const [allFriends, friendLoading] = useGetAllFriends();
    const dispatch = useDispatch();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!search) return;
        const conversation = allFriends.find((user) =>
            user.fullName?.toLowerCase().includes(search.toLowerCase())
        );
        if (conversation) {
            dispatch(setSelectedFriend(conversation));
            setSearch("");
        } else {
            toast.error("User not found");
        }
    };

    return (
        <div className="h-[10vh]">
            <div className="px-6 py-4">
                <form onSubmit={handleSubmit}>
                    <div className="flex space-x-3">
                        <label className="join w-[80%]">
                            <span className="join-item flex items-center px-3 bg-base-200 border border-base-300 rounded-lg">
                                <FaSearch className="w-5 h-5 text-base-content/50" />
                            </span>
                            <input
                                type="text"
                                className="join-item input input-bordered grow outline-none bg-transparent border-0"
                                placeholder="Search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </label>
                        <button className="btn btn-ghost">
                            <FaSearch className="text-4xl p-2 hover:bg-base-300 rounded-full duration-300" />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Search;
