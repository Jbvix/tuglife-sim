# TugLife Sim

Simulador estático de rebocador ASD para treinamento operacional de tripulantes.  
Desenvolvido para uso educacional, com foco em realismo de processo, ergonomia mobile e visualização 3D interativa.

---

## Sistemas simulados

### Propulsão e Z-Drive
- Motores principais (MCP BB e BE) com partida, lubrificação, arrefecimento e consumo de diesel
- Z-Drives com intertravamentos de gearbox LO e óleo de governo hidráulico
- Sistema de ar de acoplamento com compressores BB e BE, garrafas de pressão e caixa de controle
- Automação de carga dos compressores (corte em 14 bar / entrada em 10 bar)
- Alternância manual entre compressor em serviço e standby
- Um compressor ativo alimenta simultaneamente as garrafas BB e BE

### Geração elétrica
- Quadro elétrico principal (QEP) com geradores MCA BB e BE
- Disjuntores, tensão, frequência, potência e fator de potência
- Detecção de blackout com desligamento em cascata das auxiliares

### Tanques e planta
- Planta interativa do casco com visualização volumétrica em tempo real
- Tanques de combustível, ballast, água doce, óleo lubrificante, hidráulico e overflow
- TK central de óleo diesel como ponto de distribuição para serviço e retorno
- Retorno por gravidade do TK03 overflow para o TK central OD
- Recirculação de óleo em operação de purificador

### Recebimentos e transferências
- Recebimento de combustível por caminhão bunker com seleção de compartimento
- Recebimento de água doce por caminhão com controle de fluxo
- Transferência interna FO/LO entre tanques com bomba e recirculação
- Reposição de lubrificante por tambor (MCA, MCP, Z-Drive, chiller)
- Reposição de óleo hidráulico por tambor (guincho, governo)
- Válvula de equalização cross-feed entre TK04 e TK05

### FiFi One
- Motor FiFi independente com partida, RPM e consumo
- Monitores com automação de abertura progressiva
- Adoçamento da rede com controle de água doce e intertravamento
- Alarmes de pressão, carter e combustível

### Guincho e amarração
- Guincho hidráulico com colher e pagar dependentes de pressão MCP
- Visualização 3D das linhas de amarração com pontos interativos calibráveis

### Visual 3D
- Cena Three.js com rebocador Rastar 3200 (modelo GLTF)
- Câmera orbital com controles touch e fullscreen
- Hidroestática simplificada: calado, trim e banda em resposta ao estado dos tanques
- Animação de balanço e propulsão vetorial com jato ASD

---

## Estrutura do projeto

```
tuglife-sim/
├── index.html                     # Tela de apresentação e ponto de entrada
├── tuglife_sim.html               # Simulador principal
├── netlify.toml                   # Configuração de deploy estático
├── assets/
│   └── models/                    # Modelo GLTF do rebocador
├── docs/
│   ├── manual.html                # Manual operacional do simulador
│   ├── implementation-tags.md     # Rastreabilidade por TAG das entregas
│   └── references/                # PDFs e materiais de apoio
├── src/
│   ├── styles/
│   │   └── tuglife_sim.css        # Estilos globais (Glassmorphism HUD)
│   └── scripts/
│       ├── core/
│       │   ├── tuglife_state.js   # Estado centralizado (gameState)
│       │   ├── tuglife_utils.js   # Utilitários e helpers de processo
│       │   └── tuglife_boot.js    # Bootstrap da aplicação
│       ├── simulation/
│       │   └── tuglife_physics.js # Motor de física e tick da simulação
│       ├── ui/
│       │   ├── tuglife_render.js  # Renderização de painéis e drawers
│       │   ├── tuglife_controls.js# Eventos de controle e interações
│       │   └── tuglife_pixi.js    # Planta interativa 2D (hull view)
│       └── visual3d/
│           └── tuglife_3d.js      # Cena Three.js, câmera e animações
└── vendor/
    └── three/                     # Three.js e GLTFLoader (local, sem CDN)
```

---

## Publicação

O projeto é **100% estático** — sem build, sem servidor, sem dependências npm.

### Deploy automático (Netlify)

O arquivo `netlify.toml` configura:
- `publish = "."` (raiz do repositório)
- Headers corretos para `.js`, `.css`, `.html`, `.gltf` e `.bin`

Configuração mínima no painel Netlify:
- **Build command**: *(vazio)*
- **Publish directory**: `.`

### GitHub Pages

Também compatível com GitHub Pages publicando direto na branch `main`.

---

## Execução local

Abra `tuglife_sim.html` diretamente no navegador **ou** sirva a pasta localmente:

```bash
# Python 3
python -m http.server 8080
```

> Para carregamento correto do modelo 3D (GLTF), prefira servir via HTTP ou usar a versão publicada online.

---

## Rastreabilidade

As entregas técnicas são registradas em [`docs/implementation-tags.md`](docs/implementation-tags.md) pelo padrão de TAGs:

| Prefixo | Escopo |
|---|---|
| `TAG-CORE` | Estrutura, bootstrap e deploy |
| `TAG-WEB` | Landing page e acesso web |
| `TAG-3D` | Cena 3D, modelo, câmera e amarração |
| `TAG-TANK` | Tanques, planta e layout do casco |
| `TAG-UI` | Painéis, drawers, abas e HUD |
| `TAG-RESP` | Responsividade mobile/desktop/tablet |
| `TAG-OPS` | Lógica operacional e regras de processo |
| `TAG-DATA` | Parâmetros, estoques e capacidades |
| `TAG-FIFI` | Sistema FiFi One |
| `TAG-AIR` | Ar de acoplamento e compressores |
| `TAG-DOC` | Manual e documentação |
| `TAG-TERM` | Padronização textual e nomenclatura |

---

## Atualizações recentes

- **Sistema de ar de acoplamento** — compressores BB e BE com automação de carga, alternância manual e interlock de pressão no Z-Drive
- **Painel de propulsão reorganizado** — aba dedicada `Ar Acopl.` e layout otimizado para mobile
- **Motor FIFI One** — painel em abas com automação de monitores, adoçamento e alarmes
- **Guincho hidráulico** — dependência de pressão MCP para operação
- **Hidroestática 3D** — calado, trim e banda responsivos ao estado dos tanques
- **Câmera orbital fullscreen** — controles touch e desktop aprimorados
- **Retorno por gravidade** — TK03 overflow drena automaticamente para TK central OD
- **Estrutura modular de scripts** — domínios separados: `core`, `simulation`, `ui`, `visual3d`
- **Tela de apresentação** — glassmorphism HUD com animação de balanço do rebocador e fontes Inter/Outfit
