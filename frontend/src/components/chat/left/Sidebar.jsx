import React from "react";
import Search from "./Search";
import Users from "./Users";

function Sidebar() {
    return (
        <div className="w-[20%] bg-base-200">
            <Search />
            <Users />
        </div>
    );
}

export default Sidebar;
