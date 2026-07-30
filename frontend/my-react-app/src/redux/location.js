import { createSlice } from '@reduxjs/toolkit'

export const locationReducer = createSlice({
  name: 'location',
  initialState: {
    value:{location:null,
           error:null
    }
  },
  reducers: {
    setLocation: (state,{payload}) => {
       
      state.value.location = payload
    },
    setError: (state,{payload})=>{
      state.value.error = payload
    }
  }
})

// Action creators are generated for each case reducer function
export const { setLocation,setError } = locationReducer.actions

export default locationReducer.reducer