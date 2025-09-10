import { Route, Routes } from 'react-router-dom'
import { SignIn } from './pages/SignIn'
import { SignUp } from './pages/SignUp'
import { FirstLogin } from './pages/FirstLogin'
import { Home } from './pages/Home'

function App() {

  return (
    <>
     <Routes>
      <Route path="/" element={<SignIn />}  />
      <Route path="/signup" element={<SignUp />}  />
      <Route path="/firstLogin" element={<FirstLogin />}  />
      <Route path="/home" element={<Home />}  />
     </Routes>
    </>
  )
}

export default App
