# AEGIS Capital - Aplicativo Interno de Gestão de Alocação de Investimentos

## Visão Geral

O AEGIS Capital é uma aplicação web desenvolvida para equipes de investimentos, permitindo criar, armazenar e gerenciar recomendações de alocação de ativos baseadas em diferentes perfis de risco e horizontes de investimento. A aplicação utiliza armazenamento local para metadados e oferece geração de relatórios personalizados em PDF.

## Funcionalidades Principais

- **Formulário de Entrada**: Interface para seleção de perfil de risco (Conservador/Moderado/Agressivo), horizonte de investimento e classes de ativos desejadas.
- **Motor de Cálculo**: Implementação de múltiplas estratégias de alocação (Permanent Portfolio, All Weather, etc.) com ajustes baseados no perfil e horizonte.
- **Gerador de Relatórios**: Exportação de PDFs detalhados com recomendações de alocação, comparativos entre estratégias e metadados.
- **Gerenciador de Histórico**: Tabela de consulta para visualizar, filtrar e reabrir relatórios anteriormente gerados.
- **Design Funcional**: Interface minimalista e eficiente focada em usuários internos, com validação de dados e mensagens de erro claras.

## Requisitos do Sistema

- Node.js 18.x ou superior
- NPM 9.x ou superior
- Navegador moderno (Chrome, Firefox, Edge)

## Instalação e Configuração

### Instalação como Aplicação Web

1. Clone o repositório:
   ```bash
   git clone https://github.com/sua-organizacao/aegis-capital.git
   cd aegis-capital
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

4. Acesse a aplicação em `http://localhost:5173`

### Instalação como Aplicação Desktop (Electron)

1. Clone o repositório e instale as dependências conforme acima.

2. Execute a aplicação Electron em modo de desenvolvimento:
   ```bash
   npm run electron:dev
   ```

3. Para criar um executável para distribuição:
   ```bash
   npm run electron:build
   ```
   Os arquivos de distribuição serão gerados na pasta `dist`.

## Estrutura do Projeto

```
├── electron/           # Arquivos para a versão desktop (Electron)
├── public/             # Arquivos estáticos
├── src/                # Código fonte da aplicação
│   ├── components/     # Componentes React
│   ├── lib/            # Bibliotecas e utilitários
│   ├── App.tsx         # Componente principal
│   └── main.tsx        # Ponto de entrada
└── package.json        # Dependências e scripts
```

## Uso da Aplicação

### Criação de Recomendações

1. Na página inicial, clique em "Nova Recomendação".
2. Preencha os dados do cliente e selecione o perfil de risco.
3. Defina o horizonte de investimento.
4. Selecione as classes de ativos desejadas.
5. Escolha a estratégia de alocação.
6. Visualize e confirme a recomendação.

### Geração de Relatórios

1. Após criar uma recomendação, acesse a seção "Relatórios".
2. Personalize o relatório conforme necessário.
3. Visualize a prévia do relatório.
4. Clique em "Exportar como PDF" para gerar o documento.

### Acesso ao Histórico

1. Acesse a seção "Histórico" para visualizar todas as recomendações salvas.
2. Utilize os filtros para encontrar recomendações específicas.
3. Clique em uma recomendação para visualizar seus detalhes ou gerar um novo relatório baseado nela.

## Backup e Restauração de Dados

### Exportação de Dados

1. Acesse a seção "Configurações".
2. Na aba "Dados", clique em "Exportar Todos os Dados".
3. Salve o arquivo JSON gerado em um local seguro.

### Importação de Dados

1. Acesse a seção "Configurações".
2. Na aba "Dados", clique em "Importar Dados".
3. Selecione o arquivo JSON previamente exportado.

## Solução de Problemas

### Problemas na Geração de PDF

Se encontrar problemas ao gerar PDFs:

1. Verifique se o navegador não está bloqueando pop-ups.
2. Certifique-se de que há espaço suficiente em disco.
3. Tente exportar os dados e importá-los em outra instância da aplicação.

### Problemas de Desempenho

Se a aplicação estiver lenta:

1. Limpe o histórico de navegação e cache.
2. Reinicie a aplicação.
3. Se o problema persistir, considere exportar e fazer backup dos dados, e então resetar o banco de dados local.

## Desenvolvimento

### Tecnologias Utilizadas

- React + TypeScript
- Vite
- Tailwind CSS
- Dexie.js (IndexedDB)
- jsPDF
- Electron (para versão desktop)

### Comandos Úteis

- `npm run dev`: Inicia o servidor de desenvolvimento
- `npm run build`: Compila a aplicação para produção
- `npm run electron:dev`: Inicia a aplicação Electron em modo de desenvolvimento
- `npm run electron:build`: Cria executáveis da aplicação Electron

## Implantação em Produção

### Implantação Web

1. Compile a aplicação para produção:
   ```bash
   npm run build
   ```

2. Os arquivos compilados estarão na pasta `dist`.

3. Implante esses arquivos em qualquer servidor web estático (Nginx, Apache, Vercel, Netlify, etc.).

### Implantação Desktop

1. Crie os executáveis para as plataformas desejadas:
   ```bash
   npm run electron:build
   ```

2. Distribua os instaladores gerados na pasta `dist` para os usuários finais.

## Suporte e Contribuição

Para reportar problemas ou sugerir melhorias, abra uma issue no repositório do projeto ou entre em contato com a equipe de desenvolvimento.

## Licença

Este projeto é propriedade da AEGIS Capital e seu uso é restrito aos funcionários e colaboradores autorizados.
