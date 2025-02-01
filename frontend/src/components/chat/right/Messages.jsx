import React from 'react'
import Message from './Message'
import useGetMessage from '../../../hooks/useGetMessage'
import Loading from '../../Loading';
import { useSelector } from 'react-redux';

function Messages() {
    const {messageLoading, messages}= useGetMessage();
    console.log(messages)

    const selectedFriend= useSelector((store)=>store.chat.selectedFriend)
    if(!selectedFriend){
        return(
            <div>
                <p className='text-center mt-[20%]'>
                    Welcome!!!!!
                </p>
            </div>
        )
    }

    if(messageLoading){
        return (
            <div>
                <Loading tail='flex justify-center items-center mt-10'/>
            </div>
        )
    }
  return (
    <div className='flex-1 overflow-y-auto' style={{minHeight:"calc(84vh - 8vh)"}}>
        
        {!messageLoading && messages.length===0 && (
            <div className='text-center mt-[20%]'>
                Say! Hi to start conversation
            </div>
        )}

        {messages.map((message,index)=>(
            <Message key={message._id} message={message}/>
        ))}

    </div>
  )
}

export default Messages