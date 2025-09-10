import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { routesConfig } from './router/routesConfig'

function App() {
  return (
    <>
      <Routes>
        {routesConfig.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={
              route.template ? (
                <Layout>{route.element}</Layout>
              ) : (
                route.element
              )
            }
          />
        ))}
      </Routes>
    </>
  )
}

export default App
