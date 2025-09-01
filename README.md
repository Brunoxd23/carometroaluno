### Diagrama de Arquitetura

```mermaid
graph TD
  Usuário -->|Acessa| Frontend[Next.js + Tailwind + TypeScript]
  Frontend -->|Chama| API[API Routes (Next.js)]
  API -->|Consulta| MongoDB[MongoDB Atlas]
  API -->|Autentica| NextAuth[NextAuth.js]
  API -->|Upload/Busca| Cloudinary[Cloudinary]
  Frontend -->|Renderiza| Componentes[Componentes UI]
  Frontend -->|Notifica| Toast[Toast Notificações]
  API -->|Valida| Permissões[Controle de Acesso]
  Permissões -->|Define| Papéis[Admin, Secretaria, Coordenador, Docente, Funcionário]
```

# Carometro Alunos

Sistema de gerenciamento de fotos e informações de alunos por curso e período, desenvolvido para facilitar o trabalho de coordenadores, docentes e secretarias acadêmicas.

## 🚀 Tecnologias

- Next.js 15 com App Router
- TypeScript
- TailwindCSS para UI responsiva
- MongoDB para persistência de dados
- NextAuth.js para autenticação
- Cloudinary para armazenamento de imagens

## 💡 Funcionalidades

### Autenticação e Controle de Acesso

- Sistema de login seguro
- Diferentes níveis de acesso:
  - **Admin:** acesso total ao sistema
  - **Secretaria:** gerenciamento de todos os carometros
  - **Coordenador:** acesso a carometros específicos por curso
  - **Docente:** visualização de carometros específicos por curso
  - **Funcionário:** visualização de todos os carometros

### Área da Secretaria

- Criação e gerenciamento de grupos por curso
- Adição de alunos via RA
- Upload e edição de fotos dos alunos
- Organização por períodos acadêmicos

### Visualização de Carometros

- Navegação intuitiva por curso e período
- Estatísticas de alunos e grupos
- Filtro por nome ou RA
- Interface adaptada para cada curso

### Dashboard

- Visão geral personalizada por tipo de usuário
- Acesso rápido aos carometros disponíveis
- Informações sobre cursos e períodos

## 🔧 Instalação e Configuração

```bash
# Clonar o repositório
git clone https://github.com/seuusuario/carometroaluno.git

# Entrar na pasta do projeto
cd carometroaluno

# Instalar dependências
npm install

# Criar arquivo .env.local com as variáveis necessárias
MONGODB_URI=sua_uri_mongodb
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=seu_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=seu_upload_preset
NEXT_PUBLIC_CLOUDINARY_API_KEY=sua_api_key
NEXTAUTH_SECRET=sua_chave_secreta
NEXTAUTH_URL=http://localhost:3000

# Iniciar o servidor de desenvolvimento
npm run dev
```

## 🛠️ Estrutura do Projeto

```
carometro-alunos/
├── src/
│   ├── app/
│   │   ├── carometros/
│   │   ├── secretaria/
│   │   └── page.tsx
│   ├── components/
│   │   ├── GroupManager.tsx
│   │   ├── PhotoModal.tsx
│   │   └── Toast.tsx
│   └── types/
├── public/
│   └── background.svg
└── package.json
```

## 🏗️ Arquitetura do Sistema

- **Frontend:** Next.js (App Router) + TailwindCSS + TypeScript
- **Backend:** API Routes do Next.js para lógica de negócio e integração com banco
- **Autenticação:** NextAuth.js, com controle de acesso por função (admin, secretaria, coordenador, docente, funcionário)
- **Banco de Dados:** MongoDB Atlas, collections para usuários, grupos, alunos, cursos
- **Armazenamento de Imagens:** Cloudinary, integrado via API
- **Notificações:** Toast customizado para feedback de ações
- **Organização:** Estrutura modular em `src/app`, `src/components`, `src/lib`, `src/types`

## 🤝 Como Contribuir

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

Desenvolvido por Bruno com ❤️
Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

Desenvolvido por Bruno com ❤️
