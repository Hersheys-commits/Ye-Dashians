import React from 'react'

function Loading({tail}) {
  return (
    <div className={`${tail}`}>
        <span className={`loading loading-spinner loading-xl`}></span>
    </div>
  )
}

export default Loading