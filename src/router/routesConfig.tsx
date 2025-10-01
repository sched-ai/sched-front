import { type ReactElement } from 'react'
import { SignIn } from '../pages/SignIn'
import { SignUp } from '../pages/SignUp'
import { FirstLogin } from '../pages/FirstLogin'
import { Home } from '../pages/Home'
import { Atendimentos } from '@/pages/Atendimentos'

export interface RouteConfig {
  path: string
  element: ReactElement
  template?: boolean
  authRoute: boolean
}

export const routesConfig: RouteConfig[] = [
  {
    path: "/",
    element: <SignIn />,
    template: false,
    authRoute: false
  },
  {
    path: "/signup",
    element: <SignUp />,
    template: false,
    authRoute: false
  },
  {
    path: "/firstLogin",
    element: <FirstLogin />,
    template: false,
    authRoute: true
  },
  {
    path: "/home",
    element: <Home />,
    template: true,
    authRoute: true
  },
  {
    path: "/atendimentos",
    element: <Atendimentos />,
    template: true,
    authRoute: true
  },
]
