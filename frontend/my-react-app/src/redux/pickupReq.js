import { createSlice } from "@reduxjs/toolkit";

export  const pickupReqsReducer=createSlice({
    name:"pickupReqs",
    initialState:{
        value:[]
    },
    reducers:{
        setPickupReqs:(state,action)=>{
            state.value=action.payload
        }
    }
})

export const { setPickupReqs } = pickupReqsReducer.actions

export default pickupReqsReducer.reducer