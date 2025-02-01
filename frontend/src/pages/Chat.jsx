import React from 'react'
import Sidebar from '../components/chat/left/Sidebar'
import ChatArea from '../components/chat/right/ChatArea'
import Header from '../components/Header'

function Chat() {
  return (
    <div>
        <Header/>
        <div className='flex h-screen'>
            <Sidebar/>
            <ChatArea/>
        </div>
    </div>
  )
}

export default Chat