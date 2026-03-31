# TugLife Sim

Simulador estático de rebocador `Damen ASD 2411`, com:

- planta interativa
- recebimento de óleo e água
- transferência FO/LO
- QEP e motores
- Z-Drives com intertravamentos
- sistema de ar de acoplamento dos propulsores
- visual 3D do rebocador com propulsão vetorial

## Publicação

O projeto é estático e pode ser publicado diretamente no GitHub + Netlify, sem build.

### Estrutura principal

- `index.html`: apresentação e ponto de entrada do projeto
- `tuglife_sim.html`: entrada principal do simulador
- `docs/manual.html`: manual do projeto
- `docs/implementation-tags.md`: rastreabilidade por TAG das implementacoes e correcoes
- `src/styles/`: estilos da aplicação
- `src/scripts/core/`: estado global, utilitários e bootstrap
- `src/scripts/ui/`: renderização e eventos da interface
- `src/scripts/simulation/`: motor principal da simulação
- `src/scripts/visual3d/`: cena 3D, amarração e controles visuais
- `vendor/three/`: bibliotecas locais do Three.js e loader GLTF
- `assets/`: modelos e texturas do simulador
- `docs/references/`: PDFs e materiais de apoio

### Deploy no Netlify

Configuração recomendada:

- Build command: vazio
- Publish directory: `.`

Como alternativa, o arquivo `netlify.toml` já define o publish em `.`.

## Execução local

Abra `tuglife_sim.html` no navegador.

Para a melhor compatibilidade do visual 3D e carregamento dos scripts, prefira rodar o projeto publicado online.

## Atualizações recentes

- painel de propulsão reorganizado para melhor uso em mobile
- aba dedicada para `Ar Acopl.` no módulo de propulsão
- compressores de ar modelados como equipamentos elétricos
- compressores só operam com o QEP energizado
- um compressor em serviço alimenta simultaneamente as garrafas BB e BE
- alternância manual entre compressor BB e compressor BE, com o outro em `standby`
- lógica automática de carga com entrada em `10 bar` e corte em `14 bar`
- acoplamento do Z-Drive exigindo pressão mínima de ar na caixa de controle
