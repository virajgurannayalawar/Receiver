import { createSlice } from '@reduxjs/toolkit'

export const banCheckReducer = createSlice({
  name: 'isBanned',
  initialState: {
    value: false
  },
  reducers: {
    ban: state => {
       
      state.value =true
    },
    unBan: state => {
      state.value =false
    }
  }
})

// Action creators are generated for each case reducer function
export const { ban,unBan } = banCheckReducer.actions

export default banCheckReducer.reducer