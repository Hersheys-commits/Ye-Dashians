import React from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedFriend } from '../../../store/chatSlice';

function User({user}) {
    const dispatch = useDispatch(); // Initialize dispatch
    const selectedFriend = useSelector((store) => store.chat.selectedFriend);
    const isSelected = selectedFriend?._id === user?._id; // Add optional chaining
    // console.log(selectedFriend)

    // Handle click with proper dispatch
    const handleUserClick = () => {
        dispatch(setSelectedFriend(user));
    };

    return (
        <div 
            className={`flex py-2 pr-2 hover:bg-slate-600 duration-300 cursor-pointer ${isSelected?"bg-slate-800":""}`}  
            onClick={handleUserClick}
        >
            <div className="avatar avatar-online w-10 h-10 mx-2">
                <div className="w-24 rounded-full">
                    <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
                </div>
            </div>
            <div className='flex flex-col text-sm pl-1'>
                <div className='font-bold'>
                    {user?.fullName || "Harsh Sharma"}
                </div>
                <div>
                    {user?.email || "harshsharma@gmail.com"}
                </div>
            </div>
        </div>
    )
}

export default User