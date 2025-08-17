import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import EmailBroadcast from './Components/Emailbroadcast'
import GmailCompose from './Components/Emailbroadcast'
import EmailApp from './Components/Emailbroadcast'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <EmailApp/>  </>
  )
}

export default App
