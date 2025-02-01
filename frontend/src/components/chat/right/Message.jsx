import React from 'react'
import { useSelector } from 'react-redux';
import { formatMessageTime } from '../../../utils/time';

function Message({message}) {
    const selectedFriend = useSelector((store) => store.chat.selectedFriend);
    // let userIsSender=true;
    // if(message.senderId==selectedFriend._id)userIsSender=false;
    const userIsSender = (message.senderId!=selectedFriend._id)
    const time = formatMessageTime(message.createdAt);
    // console.log(time);

  return (
    <div>
        <div className={`chat ${userIsSender?"chat-end":"chat-start"} px-3 pt-3`}>
            <div className={`chat-bubble ${userIsSender?"chat-bubble-neutral":"chat-bubble-info"}`}>{message.text}</div>
        </div>
        <div className={`mx-5 ${userIsSender?"flex flex-row-reverse":""}`}>
            <p className='text-sm text-slate-400'>{time}</p>
        </div>
    </div>
  )
}

export default Message