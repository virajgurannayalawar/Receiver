import { createSlice } from '@reduxjs/toolkit'

export const receiverTabReducer = createSlice({
  name: 'receiverTab',
  initialState: {
    value:"dashboard"
  },
  reducers: {
    setReceiverTab: (state, { payload }) => {

      state.value = payload
    }
  }
})

export const { setReceiverTab } = receiverTabReducer.actions

export default receiverTabReducer.reducer