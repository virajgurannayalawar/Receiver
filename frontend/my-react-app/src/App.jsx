import React from "react";
import Authenticate from "./components/authenticate.jsx";    
import axios from "axios";
 



function App(){
    const makeApiCall=async()=>{
       const  response =await axios.put("https://jsonplaceholder.typicode.com/posts/1", {
    title: "foo",
    body: "bar",
    userId: 1,
  })
  .then((response) => {
    console.log(response.data);
  })
  .catch((error) => {
    console.error(error);
  })
  .finally(() => {
    console.log("Request completed");
  });
    }

    return(
 
        <div className="flex items-center justify-center ">
            {/* <Authenticate/> */}
            <button onClick={makeApiCall} className="bg-red-50 rounded hover:bg-red-100 cursor-pointer">clcik me </button>
            
        </div>
    )
}
export default App;