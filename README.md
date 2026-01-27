# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

## Docker

Build the production image and run a container that serves the Vite build with Nginx:

```bash
docker build -t sched-app .
docker run --rm -p 80:80 sched-app
```

The app will be available at http://localhost/ (port 80).

Notes:
- The Dockerfile uses a multi-stage build: installs deps, builds with `npm run build` and serves `dist/` with Nginx.
- If you need to run in development mode with HMR, run `npm run dev` locally (binding volumes and ports inside a container is possible but not included here).
You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

## Git hooks: impedir commits quando o build falha

Este repositório está configurado para impedir commits quando o comando `npm run build` falha. Para ativar os hooks (Husky) no seu ambiente local, execute na raiz do projeto:

```powershell
npm install
npm run prepare
```

Após isso, os hooks Git estarão instalados e o hook `pre-commit` irá executar `npm run build` antes de permitir o commit. Se preferir rodar o check somente no push (em vez do commit), mova o conteúdo de `.husky/pre-commit` para `.husky/pre-push`.

Arquivos relevantes:
- [package.json](package.json)
- [.husky/pre-commit](.husky/pre-commit)

