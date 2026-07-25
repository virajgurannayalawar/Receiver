import { createSlice } from '@reduxjs/toolkit'

export const locationReducer = createSlice({
  name: 'location',
  initialState: {
    value:null
  },
  reducers: {
    setLocation: (state,{payload}) => {
       
      state.value = payload
    }
  }
})

// Action creators are generated for each case reducer function
export const { setLocation } = locationReducer.actions

export default locationReducer.reducer