import React from 'react'
import { FaSearch } from "react-icons/fa";

function Search() {
  return (
    <div className='flex'>
        <input type="text" placeholder="Search" className="input ml-3 my-3"  />
        <FaSearch className='m-2 h-12 w-4'/>
    </div>
  )
}

export default Search