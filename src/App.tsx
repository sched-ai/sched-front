import { Route, Routes } from 'react-router-dom'
import { SignIn } from './pages/SignIn'
import { SignUp } from './pages/SignUp'
import { FirstLogin } from './pages/FirstLogin'

function App() {

  return (
    <>
     <Routes>
      <Route path="/" element={<SignIn />}  />
      <Route path="/signup" element={<SignUp />}  />
      <Route path="/FirstLogin" element={<FirstLogin />}  />
     </Routes>
    </>
  )
}

export default App
