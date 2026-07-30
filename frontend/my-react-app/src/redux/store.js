import { configureStore } from '@reduxjs/toolkit'
import banCheckReducer from './banCheck.js'
import checkSuspectReducer from './checkSuspect.js'
import authenticationReducer  from './authentication.js'
import  deviceFingerPrintReducer  from './deviceFingerPrint.js'
import  locationReducer  from './location.js'
import  roleReducer  from './role.js'
 

export default configureStore({

 reducer: {banCheck: banCheckReducer,
           checkSuspect:checkSuspectReducer,
           authentication:authenticationReducer,
           deviceFingerPrint:deviceFingerPrintReducer,
           location:locationReducer,
           role:roleReducer


 }

})