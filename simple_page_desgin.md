# Simple Page Design Context (Configurações)

Este documento descreve o padrão visual e estrutural observado na tela de **Configurações**, com foco em:
- paleta de cores;
- padding e estilo de botões;
- organização de conteúdo no estilo modal/subtela.

> Objetivo: servir como contexto para manter consistência visual em novas páginas/subtelas.

## 1) Paleta de cores (base)

### Superfícies
- Fundo geral da página: `bg-background`
- Cartões/seções: `bg-card`
- Cartão branco de conteúdo: `bg-white`
- Área expandida secundária: `bg-slate-50`

### Bordas
- Borda padrão de seção: `border-border`
- Bordas de cartão interno: `border-slate-200`
- Bordas de input: `border-slate-300`
- Hover de borda em input: `hover:border-slate-400`

### Texto
- Título principal: `text-foreground`
- Texto secundário: `text-muted-foreground`
- Texto base escuro: `text-slate-900`
- Texto auxiliar: `text-slate-600` / `text-slate-700`

### Ações e estados
- Primário (ações de salvar/adicionar):
  - Fundo: `bg-blue-600`
  - Hover: `hover:bg-blue-700`
  - Texto: `text-white`
- Destrutivo:
  - Fundo: `bg-red-600`
  - Hover: `hover:bg-red-700`
  - Texto: `text-white`
- Erro de validação textual: `text-red-500`

## 2) Botões (padding, tamanho e comportamento)

### Botão primário
- Classe base sugerida: `bg-blue-600 hover:bg-blue-700 text-white`
- Padding horizontal comum no projeto: `px-2` (compacto) ou `px-4` (padrão)
- Em contextos de ações principais, usar largura mínima quando necessário (`min-w-*`) para estabilidade visual.

### Botão secundário (outline/ghost)
- `variant="outline"` para ação neutra (ex.: Cancelar)
- `variant="ghost"` para ações leves de navegação (ex.: Voltar)
- Em ações compactas no rodapé: `className="px-2"`

### Botões de ícone (ação por item)
- Container quadrado compacto: `h-8 w-8`
- Estrutura padrão: `inline-flex items-center justify-center rounded-md border`
- Cores por ação:
  - Editar: `border-slate-200 text-slate-600 hover:bg-slate-100`
  - Excluir: `border-red-200 text-red-600 hover:bg-red-50`

## 3) Inputs e campos

### Input padrão
- `w-full rounded-lg border border-slate-300 bg-white px-3 py-2(.5) text-sm`
- Foco: `focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20`
- Hover: `hover:border-slate-400`

### Labels
- Label de campo: `text-sm font-medium text-slate-700`
- Label auxiliar de tempo: `text-xs text-slate-600`

### Erro de campo
- Mensagem curta abaixo do campo com `text-xs text-red-500`

## 4) Organização de layout (página simples)

## Estrutura macro
1. Header da página
   - Título (ex.: `text-2xl font-semibold`)
   - Subtítulo explicativo (`text-muted-foreground mt-2`)
2. Seções por domínio (Perfil, Locais, etc.)
   - Cada seção em cartão com `border rounded-lg p-6 shadow-sm`
3. Lista de itens com cards internos
   - Cada item com header resumido + ações à direita
   - Expansão opcional para configuração detalhada

### Espaçamentos recorrentes
- Container principal: `p-6 md:p-8`
- Distância entre blocos de seção: `space-y-8`
- Distância interna de título da seção: `mb-6`
- Distância entre elementos internos: `gap-2`, `gap-3`, `gap-4`, `space-y-4/5`

## 5) Organização de modal/subtela (referência)

### Cabeçalho
- Título + descrição curta no topo
- Ação de retorno/cancelamento no canto direito quando necessário

### Corpo
- Agrupar por blocos lógicos:
  1. Informações principais
  2. Dados complementares
  3. Configurações (dias/horários)
- Usar grids responsivos (`grid-cols-1 md:grid-cols-2`) para campos relacionados

### Rodapé de ações
- Alinhamento à direita: `flex justify-end gap-2`
- Ordem recomendada:
  1. Botão neutro (Cancelar)
  2. Botão principal (Salvar)

## 6) Regras de consistência

1. **Ação primária sempre azul** (`bg-blue-600`) e com hover definido.
2. **Ação destrutiva sempre vermelha** (`bg-red-600`) e isolada visualmente.
3. **Campos com foco azul** para manter feedback consistente.
4. **Textos auxiliares em muted/slate**, nunca competir com títulos.
5. **Espaçamentos previsíveis** (padrões de `p-6`, `gap-4`, `mb-6`).
6. **Responsividade mínima** com quebra em `md` para grids.

## 7) Template rápido (checklist para novas telas)

- [ ] Header com título + descrição
- [ ] Seções em cards (`border + rounded + p-6 + shadow-sm`)
- [ ] Inputs com foco azul e validação em vermelho
- [ ] Rodapé de ações alinhado à direita
- [ ] Botão primário azul, secundário outline, destrutivo vermelho
- [ ] Espaçamento consistente (`space-y-8`, `gap-4`, `mb-6`)

---

Se necessário, evoluir este guia para um **design token doc** (`color`, `spacing`, `radius`, `shadow`, `state`) centralizado para todo o projeto.