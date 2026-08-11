import { createSlice } from '@reduxjs/toolkit'

export const receiverAcceptedReducer = createSlice({
  name: 'receiverAccepted',
  initialState: {
    value: false
  },
  reducers: {
    setReceiverAccepted: (state, { payload }) => {

      state.value = payload
    }
  }
})

// Action creators are generated for each case reducer function
export const { setReceiverAccepted } = receiverAcceptedReducer.actions

export default receiverAcceptedReducer.reducer