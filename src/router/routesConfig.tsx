import { type ReactElement } from 'react'
import { SignIn } from '../pages/SignIn'
import { SignUp } from '../pages/SignUp'
import { Onboarding } from '../pages/Onboarding'
import { Home } from '../pages/Home'
import { Atendimentos } from '@/pages/Atendimentos'
import PatientDetails from '@/pages/Atendimentos/PatientDetails'
import { Error } from '@/pages/Error'
import { Servicos } from '@/pages/Servicos'
import Pacientes from '@/pages/Pacientes'
import LandingPage from '../pages/LandingPage'

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
    path: "/newUser",
    element: <>TESTE</>,
    template: false,
    authRoute: false
  },
  {
    path: "/landing",
    element: <LandingPage />,
    template: false,
    authRoute: false
  },
  {
    path: "/onboarding",
    element: <Onboarding />,
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
    path: "/patients",
    element: <Pacientes />,
    template: true,
    authRoute: true
  },
  {
    path: "/appointment/:id",
    element: <PatientDetails />,
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
