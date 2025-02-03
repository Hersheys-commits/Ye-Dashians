import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";
import useGetAllFriends from "../../../hooks/useGetAllFriends";
import { setSelectedFriend } from "../../../store/chatSlice";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";

function Search() {
    const [search, setSearch] = useState("");
    const [allFriends, friendLoading] = useGetAllFriends();
    console.log(allFriends);
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
        <div className=" h-[10vh]">
            <div className="px-6 py-4">
                <form onSubmit={handleSubmit}>
                    <div className="flex space-x-3">
                        <label className=" border-[1px] border-gray-700 bg-slate-900 rounded-lg p-3 flex items-center gap-2 w-[80%]">
                            <input
                                type="text"
                                className="grow outline-none bg-transparent border-0"
                                placeholder="Search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </label>
                        <button>
                            <FaSearch className="text-4xl p-2 hover:bg-gray-600 rounded-full duration-300" />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Search;
