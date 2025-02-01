import React from 'react'
import User from '../left/User'
import { useSelector } from 'react-redux'

function ChatHeader() {
    const selectedFriend = useSelector((state)=>state.chat.selectedFriend)

  return (
    <div className='flex justify-center bg-slate-600'>
        <User user={selectedFriend}/>
    </div>
  )
}

export default ChatHeader