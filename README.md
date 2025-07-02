# Spendash - Aplicação de Controle Financeiro

Uma aplicação moderna para controle de despesas pessoais, construída com React, TypeScript e Supabase.

## 🚀 Funcionalidades

- **Autenticação completa**: Registro e login de usuários
- **Gestão de despesas**: Adicionar, editar e remover despesas
- **Categorização**: Organizar despesas por categorias
- **Dashboard interativo**: Visualizações gráficas dos gastos
- **Responsivo**: Interface adaptada para mobile e desktop
- **Tempo real**: Dados sincronizados com Supabase

## 🛠️ Tecnologias

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: shadcn/ui + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **Gráficos**: Recharts
- **Formulários**: React Hook Form + Zod
- **Roteamento**: React Router DOM

## 📦 Instalação

1. **Clone o repositório**
```bash
git clone <URL_DO_REPOSITORIO>
cd finance-app
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure o Supabase**
- Siga o guia em [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
- Crie um arquivo `.env` com suas credenciais

4. **Execute o projeto**
```bash
npm run dev
```

## 🔧 Configuração do Supabase

Para usar esta aplicação, você precisa configurar o Supabase:

1. Crie um projeto no [Supabase](https://supabase.com)
2. Execute o script SQL em `supabase-schema.sql`
3. Configure as variáveis de ambiente
4. Siga o guia completo em [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── auth/           # Componentes de autenticação
│   ├── dashboard/      # Componentes do dashboard
│   ├── expenses/       # Componentes de despesas
│   └── ui/             # Componentes de UI (shadcn/ui)
├── contexts/           # Contextos React
├── hooks/              # Hooks personalizados
├── lib/                # Utilitários e configurações
├── pages/              # Páginas da aplicação
└── types/              # Definições de tipos TypeScript
```

## 🎯 Funcionalidades Principais

### Autenticação
- Registro de novos usuários
- Login com email e senha
- Sessões persistentes
- Logout seguro

### Gestão de Despesas
- Adicionar novas despesas
- Editar despesas existentes
- Remover despesas
- Categorização automática

### Dashboard
- Visão geral dos gastos totais
- Gastos do mês atual
- Gráfico de pizza por categoria
- Gráfico de barras por dia

### Categorias
- Categorias padrão pré-configuradas
- Cores e ícones personalizados
- Categorias específicas por usuário

## 🔒 Segurança

- **Row Level Security (RLS)** habilitado
- Autenticação baseada em JWT
- Políticas de acesso por usuário
- Validação de dados no frontend e backend

## 🚀 Deploy

### Vercel
```bash
npm run build
vercel --prod
```

### Netlify
```bash
npm run build
netlify deploy --prod
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🆘 Suporte

Se você encontrar algum problema ou tiver dúvidas:

1. Verifique a documentação do Supabase
2. Consulte o arquivo [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
3. Abra uma issue no GitHub

## 🔄 Próximas Funcionalidades

- [ ] Relatórios mensais/anuais
- [ ] Exportação de dados
- [ ] Notificações por email
- [ ] Metas de gastos
- [ ] Receitas e orçamentos
- [ ] Integração com bancos
- [ ] App mobile (React Native)
