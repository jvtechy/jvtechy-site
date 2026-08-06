# JVTechy — Site Institucional

Site da empresa **JVTechy — Desenvolvimento e Licenciamento de Softwares**.

Domínio de produção: [https://jvtechy.com/](https://jvtechy.com/) (Hostinger)

## Estrutura

```
jvtechy-site/
├── index.html
├── privacidade.html
├── termos.html
├── assets/           # logo.svg, logo-icon.svg
├── css/styles.css
├── js/
│   ├── config.js     # WhatsApp, e-mail, links dos produtos
│   └── main.js
└── package.json
```

## Desenvolvimento local

```bash
cd jvtechy-site
npm run dev
```

Abre em **http://localhost:4322**

## Configuração

Edite `js/config.js` antes do deploy:

```js
window.JVTECHY_CONFIG = {
  whatsapp: '5531972485122',
  emailContato: 'contato@jvtechy.com',
  telefoneExibicao: '(31) 97248-5122',
  produtos: {
    agendaserviceLanding: 'https://agendaservice-landing.vercel.app',
    agendaserviceApp: 'https://agendaservice.vercel.app',
  },
};
```

## Deploy na Hostinger (substitui o site atual)

1. Gere/confirme os arquivos locais (este repositório já é estático).
2. No painel Hostinger → **Gerenciador de Arquivos** → pasta `public_html` do domínio `jvtechy.com`.
3. Faça backup do site antigo (opcional, recomendado).
4. Envie **todo o conteúdo** deste repositório para `public_html`:
   - `index.html` na raiz de `public_html`
   - pastas `assets/`, `css/`, `js/`
   - `privacidade.html`, `termos.html`
5. Remova arquivos antigos do site anterior que não forem mais usados.
6. Teste: [https://jvtechy.com/](https://jvtechy.com/)

### Checklist pós-deploy

- [ ] Logo e favicon carregam
- [ ] Menu e âncoras funcionam
- [ ] Formulário abre WhatsApp `(31) 97248-5122`
- [ ] Links do AgendaService abrem corretamente
- [ ] Mobile ok

## Contato padrão

- WhatsApp: (31) 97248-5122
- E-mail: contato@jvtechy.com

---

© JVTechy
