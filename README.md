# TugLife Sim

Simulador estático de rebocador `Damen ASD 2411`, com:

- planta interativa
- recebimento de óleo e água
- transferência FO/LO
- QEP e motores
- Z-Drives com intertravamentos
- visual 3D do rebocador com propulsão vetorial

## Publicação

O projeto é estático e pode ser publicado diretamente no GitHub + Netlify, sem build.

### Estrutura principal

- `index.html`: apresentação e ponto de entrada do projeto
- `tuglife_sim.html`: entrada principal do simulador
- `docs/manual.html`: manual do projeto
- `src/styles/`: estilos da aplicação
- `src/scripts/`: scripts da aplicação
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
