import { createSlice } from '@reduxjs/toolkit'

export const deviceFingerPrintReducer = createSlice({
  name: 'deviceFingerPrint',
  initialState: {
    value:null
  },
  reducers: {
    setDeviceFingerPrint: (state,{payload}) => {
       
      state.value = payload
    }
  }
})

// Action creators are generated for each case reducer function
export const { setDeviceFingerPrint } = deviceFingerPrintReducer.actions

export default deviceFingerPrintReducer.reducer