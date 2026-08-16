import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import store from './redux/store.js'
import { Provider } from 'react-redux'
import './main.css'
import DummyStepper from './components/dummy.jsx'
import Dummy from './components/dummy2.jsx'

const development = false

createRoot(document.getElementById('root')).render(
  <StrictMode>
   <Provider store={store}>
     {!development ? ( <App />) : ( <DummyStepper /> )}
    </Provider>
  </StrictMode>,
)
