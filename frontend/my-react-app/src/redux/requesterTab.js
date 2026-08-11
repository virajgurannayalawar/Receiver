import { createSlice } from '@reduxjs/toolkit'

export const requesterTabReducer = createSlice({
  name: 'requesterTab',
  initialState: {
    value:"dashboard"
  },
  reducers: {
    setRequesterTab: (state, { payload }) => {

      state.value = payload
    }
  }
})

export const { setRequesterTab } = requesterTabReducer.actions

export default requesterTabReducer.reducer