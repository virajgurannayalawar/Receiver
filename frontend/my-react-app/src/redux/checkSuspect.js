import { createSlice } from '@reduxjs/toolkit'

export const checkSuspectReducer = createSlice({
  name: 'isSuspected',
  initialState: {
    value: false
  },
  reducers: {
    suspect: state => {
       
      state.value =true
    },
    unSuspect: state => {
      state.value =false
    }
  }
})

// Action creators are generated for each case reducer function
export const { suspect,unSuspect } = checkSuspectReducer.actions

export default checkSuspectReducer.reducer