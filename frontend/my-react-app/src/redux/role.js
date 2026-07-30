import { createSlice } from '@reduxjs/toolkit'

export const roleReducer = createSlice({
  name: 'role',
  initialState: {
    value: "requester"
  },
  reducers: {
    setRole: (state, { payload }) => {

      state.value = payload
    }
  }
})

// Action creators are generated for each case reducer function
export const { setRole } = roleReducer.actions

export default roleReducer.reducer