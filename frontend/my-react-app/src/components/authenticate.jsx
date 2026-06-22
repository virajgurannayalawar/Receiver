import React from "react"
import { useState } from "react"
import Login from "./login.jsx"
import Register from "./register.jsx"
import Google from "./google.jsx"

export default function Authenticate() {
    const [activeScreen, setActiveScreen] = useState(null)


    return (
        <>
            <div className=" bg-blue-200 flex items-center justify-center  h-screen">
                <div className=" bg-white text-xl flex flex-col items-center justify-between font-bold p-56">

                    {!activeScreen && (
                        <div className="flex flex-col gap-4 ">
                            <button onClick={() => setActiveScreen('login')} className="bg-blue-400 p-4 rounded-b-lg text-center text-2xl text-gray-700-mb hover:bg-blue-500 shadow-l rounded-xl cursor-pointer" >
                                login
                            </button>
                            <button onClick={() => setActiveScreen('register')} className="bg-blue-400 p-4 rounded-b-lg text-center text-2xl text-gray-700-mb hover:bg-blue-500 shadow-l rounded-xl cursor-pointer" >
                                register
                            </button>
                            <button onClick={() => setActiveScreen('google')} className="bg-blue-400 p-4 rounded-b-lg text-center text-2xl text-gray-700-mb hover:bg-blue-500 shadow-l rounded-xl cursor-pointer" >
                                continue with google
                            </button>
                            </div>
              )}
              {activeScreen && (
                <div>
                    <button onClick={()=>setActiveScreen(null)} className="flex items-baseline text-sm hover:bg-gray-100 cursor-pointer">
                        ← Back to options
                    </button>
                </div>
              )}
                            {activeScreen === 'login' && <Login onNavigate={activeScreen} />}
                            {activeScreen === 'register' && <Register onNavigate={activeScreen} />}
                            {activeScreen === 'google' && <Google onNavigate={activeScreen} />}

                    
            </div>

            </div>
        </>
    )
}