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
import PatientHistory from '@/pages/Pacientes/PatientHistory'
import LandingPage from '../pages/LandingPage'
import LegalPage from '../pages/LegalPage'

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
    path: "/patients/:id/history",
    element: <PatientHistory />,
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
  {
    path: "/politica-privacidade",
    element: <LegalPage title="Política de Privacidade" />,
    template: false,
    authRoute: false
  },
  {
    path: "/termos-uso",
    element: <LegalPage title="Termos de condições de uso" />,
    template: false,
    authRoute: false
  },
  {
    path: "/termos-medico",
    element: <LegalPage title="Termos e Condições de uso (Médico)" />,
    template: false,
    authRoute: false
  },
  {
    path: "/termos-paciente",
    element: <LegalPage title="Termos e Condições de Uso (Paciente)" />,
    template: false,
    authRoute: false
  },
]
