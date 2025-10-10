import { type ReactElement } from 'react';
import { Link } from 'react-router-dom';

export function Error(): ReactElement {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-100">
      <h1 className="text-9xl font-extrabold tracking-widest text-gray-900">404</h1>
      <div className="absolute rotate-12 rounded bg-orange-600 px-2 text-sm text-white">
        Página não encontrada
      </div>
      <button className="mt-5">
        <Link
          to="/"
          className="group relative inline-block text-sm font-medium text-white focus:outline-none focus:ring"
        >
          <span
            className="absolute inset-0 translate-x-0.5 translate-y-0.5 bg-orange-600 transition-transform group-hover:translate-x-0 group-hover:translate-y-0"
          ></span>
          <span className="relative block border border-current bg-gray-900 px-8 py-3">
            <span>Voltar para o Início</span>
          </span>
        </Link>
      </button>
    </div>
  );
}
