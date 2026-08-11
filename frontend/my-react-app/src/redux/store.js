import { configureStore } from '@reduxjs/toolkit'
import banCheckReducer from './banCheck.js'
import checkSuspectReducer from './checkSuspect.js'
import authenticationReducer  from './authentication.js'
import  deviceFingerPrintReducer  from './deviceFingerPrint.js'
import  locationReducer  from './location.js'
import  roleReducer  from './role.js'
import  pickupReqsReducer  from './pickupReq.js'
import  requesterRequestedReducer  from './requesterRequested.js'
import  receiverAcceptedReducer  from './receiverAccepted.js'
import receiverTabReducer from "./receiverTab.js"
import requesterTabReducer from "./requesterTab.js"
 

export default configureStore({

 reducer: {banCheck: banCheckReducer,
           checkSuspect:checkSuspectReducer,
           authentication:authenticationReducer,
           deviceFingerPrint:deviceFingerPrintReducer,
           location:locationReducer,
           role:roleReducer,
           pickupReqs:pickupReqsReducer,
           requesterRequested:requesterRequestedReducer,
           receiverAccepted:receiverAcceptedReducer, 
           receiverTab:receiverTabReducer,
           requesterTab:requesterTabReducer


 }

})