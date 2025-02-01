import React from "react";
import Search from "./Search";
import Users from "./Users";

function Sidebar() {
    return (
        <div className="w-[30%] bg-black">
            <Search />
            <Users />
        </div>
    );
}

export default Sidebar;
