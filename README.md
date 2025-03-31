# Carometro Alunos

Sistema de gerenciamento de fotos e informações de alunos por curso, desenvolvido com tecnologias modernas para facilitar a organização de turmas.

## 🚀 Tecnologias

- Next.js 13 (App Router)
- TypeScript
- Tailwind CSS
- Cloudinary (armazenamento de imagens)
- MongoDB (banco de dados)

## 💡 Funcionalidades

- **Área da Secretaria**

  - Criação e gerenciamento de grupos por curso
  - Adição de alunos via RA
  - Upload de fotos
  - Organização por períodos

- **Visualização de Carometros**
  - Visualização por curso
  - Filtro por períodos
  - Busca por nome ou RA
  - Interface responsiva

## 🎨 Layout

- Design moderno com Tailwind CSS
- Temas específicos por curso
- Animações suaves
- Interface adaptativa (mobile e desktop)

## 📦 Instalação

```bash
# Clonar o repositório
git clone [https://github.com/Brunoxd23/carometroaluno.git]

# Entrar na pasta do projeto
cd carometro-alunos

# Instalar dependências
npm install

# Configurar variáveis de ambiente
# Criar arquivo .env.local com as seguintes variáveis:
MONGODB_URI=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=

# Iniciar o servidor de desenvolvimento
npm run dev
```

## 🌟 Recursos Implementados

- [x] Sistema de navegação entre cursos
- [x] Gerenciamento de grupos por período
- [x] Upload e visualização de fotos
- [x] Busca e filtro de alunos
- [x] Layout responsivo
- [x] Temas por curso
- [x] Animações e transições
- [x] Integração com Cloudinary
- [x] Persistência local dos dados

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
