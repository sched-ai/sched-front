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
}

export const routesConfig: RouteConfig[] = [
  {
    path: "/",
    element: <SignIn />,
    template: false
  },
  {
    path: "/signup",
    element: <SignUp />,
    template: false
  },
  {
    path: "/firstLogin",
    element: <FirstLogin />,
    template: false
  },
  {
    path: "/home",
    element: <Home />,
    template: true
  },
  {
    path: "/atendimentos",
    element: <Atendimentos />,
    template: true
  },
]
