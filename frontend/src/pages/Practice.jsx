import React from "react";

function Practice() {
  return (
    <div>
      <div id="Header" className="bg-black text-white py-5 px-20 flex items-center gap-1">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white">
          <path d="M8.31 10.28a2.5 2.5 0 1 0 2.5 2.49 2.5 2.5 0 0 0-2.5-2.49zm0 3.8a1.31 1.31 0 1 1 0-2.61 1.31 1.31 0 1 1 0 2.61zm7.38-3.8a2.5 2.5 0 1 0 2.5 2.49 2.5 2.5 0 0 0-2.5-2.49zM17 12.77a1.31 1.31 0 1 1-1.31-1.3 1.31 1.31 0 0 1 1.31 1.3z"></path>
          <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm7.38 10.77a3.69 3.69 0 0 1-6.2 2.71L12 16.77l-1.18-1.29a3.69 3.69 0 1 1-5-5.44l-1.2-1.3H7.3a8.33 8.33 0 0 1 9.41 0h2.67l-1.2 1.31a3.71 3.71 0 0 1 1.2 2.72z"></path>
          <path d="M14.77 9.05a7.19 7.19 0 0 0-5.54 0A4.06 4.06 0 0 1 12 12.7a4.08 4.08 0 0 1 2.77-3.65z"></path>
        </svg>

        <span className="font-semibold">Abstract</span>
        <span>|</span>
        <span>Help Center</span>
      </div>
      <div className="bg-[#dadbf1] h-60 flex justify-center items-center flex-col">
        <span className="text-5xl block py-5">How can we help?</span>
        <div className="relative w-120">
            <input type="text" placeholder="Search" className="bg-white w-full pl-4 pr-10 py-2 border-1 rounded focus:outline-none"/>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="black">
            <path d="M8.31 10.28a2.5 2.5 0 1 0 2.5 2.49 2.5 2.5 0 0 0-2.5-2.49zm0 3.8a1.31 1.31 0 1 1 0-2.61 1.31 1.31 0 1 1 0 2.61zm7.38-3.8a2.5 2.5 0 1 0 2.5 2.49 2.5 2.5 0 0 0-2.5-2.49zM17 12.77a1.31 1.31 0 1 1-1.31-1.3 1.31 1.31 0 0 1 1.31 1.3z"></path>
            <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm7.38 10.77a3.69 3.69 0 0 1-6.2 2.71L12 16.77l-1.18-1.29a3.69 3.69 0 1 1-5-5.44l-1.2-1.3H7.3a8.33 8.33 0 0 1 9.41 0h2.67l-1.2 1.31a3.71 3.71 0 0 1 1.2 2.72z"></path>
            <path d="M14.77 9.05a7.19 7.19 0 0 0-5.54 0A4.06 4.06 0 0 1 12 12.7a4.08 4.08 0 0 1 2.77-3.65z"></path>
            </svg></div>
        </div>
      </div>
      <div className="w-full">
        <div className="flex justify-center flex-wrap w-full mx-auto gap-4 my-20">
            <div className="relative">
                <div className="absolute bg-amber-300 w-10 h-full"></div>
                <h3 className="ml-10px">Branches</h3>
                <p className="ml-10px">
                    Lorem ipsum dolor sit amet consectetur <br />
                    adipisicing elit. Commodi quas at, saepe <br />
                    cupiditate dolor deserunt possimus, aperiam <br />
                    qui ipsam cons
                </p>
            </div>
            <div>
                <h3>Manage Your Account</h3>
                <p>
                    Lorem ipsum dolor sit amet consectetur <br />
                    adipisicing elit. Commodi quas at, saepe <br />
                    cupiditate dolor deserunt possimus, aperiam <br />
                    qui ipsam cons
                </p>
            </div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
        </div>
      </div>
    </div>
  );
}

export default Practice;

{/*
     {Array.from({ length: 6 }, (_, index) => (
    <div
    key={index}
    className="w-1/3 h-24 bg-blue-500 flex items-center justify-center text-white text-xl font-bold"
    >
    {index + 1}
    </div>
))} 
    */}