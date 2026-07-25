import { createSlice } from '@reduxjs/toolkit'

export const authenticationReducer = createSlice({
  name: 'authentication',
  initialState: {
    value: {isAuthenticated:false,  
            user: { id: "", email: "", role: "",token_version:null, 
        iat:null,
        exp:null}}
  },
  reducers: {
    setIsAuthenticated: (state,{payload}) => {
       
      state.value.isAuthenticated =payload
    },
    setUser:(state,{payload})=>{
      state.value.user= payload
    }
  }
})

// Action creators are generated for each case reducer function
export const { setIsAuthenticated,setUser } = authenticationReducer.actions

export default authenticationReducer.reducer