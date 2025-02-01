import React from 'react'
import User from './User'
import useGetAllFriends from '../../../hooks/useGetAllFriends'

function Users() {
    const [allFriends, friendLoading] = useGetAllFriends();

  return (
    <div>
        <div className='my-2 p-1 pl-3 bg-slate-600 rounded-lg' >
            Messages
        </div>
        <div className='flex-1 overflow-y-auto' style={{maxHeight: "calc(75vh)"}}>
            {allFriends.map((friend,index)=>{
                return <User key={index} user={friend}/>
            })}
        </div>
    </div>
  )
}

export default Users