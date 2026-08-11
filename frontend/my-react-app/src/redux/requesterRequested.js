import { createSlice } from '@reduxjs/toolkit'

export const requesterRequestedReducer = createSlice({
  name: 'requesterRequested',
  initialState: {
    value: false
  },
  reducers: {
    setRequesterRequested: (state, { payload }) => {

      state.value = payload
    }
  }
})

export const { setRequesterRequested } = requesterRequestedReducer.actions

export default requesterRequestedReducer.reducer