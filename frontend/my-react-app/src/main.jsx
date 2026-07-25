import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import store from './redux/store.js'
import { Provider } from 'react-redux'
import './main.css'
import Home from "./components/home.jsx"


const development =false

createRoot(document.getElementById('root')).render(
  <StrictMode>
   <Provider store={store}>
     {!development ? ( <App />) :(<> </>)}
    </Provider>
  </StrictMode>,
)
