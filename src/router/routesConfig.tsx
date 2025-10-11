import { type ReactElement } from 'react'
import { SignIn } from '../pages/SignIn'
import { SignUp } from '../pages/SignUp'
import { FirstLogin } from '../pages/FirstLogin'
import { Home } from '../pages/Home'
import { Atendimentos } from '@/pages/Atendimentos'
import { Error } from '@/pages/Error'
import { Servicos } from '@/pages/Servicos'

export interface RouteConfig {
  path: string
  element: ReactElement
  template?: boolean
  authRoute: boolean
}

export const routesConfig: RouteConfig[] = [
  {
    path: "/signin",
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
    path: "/onboarding",
    element: <FirstLogin />,
    template: false,
    authRoute: true
  },
  {
    path: "/",
    element: <Home />,
    template: true,
    authRoute: true
  },
  {
    path: "/appointment",
    element: <Atendimentos />,
    template: true,
    authRoute: true
  },
  {
    path: "/services",
    element: <Servicos />,
    template: true,
    authRoute: true
  },
  {
    path: "*",
    element: <Error />,
    template: false,
    authRoute: true
  },
]
