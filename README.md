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

- `tuglife_sim.html`: entrada principal
- `tuglife_sim.css`: estilos
- `tuglife_state.js`: estado global
- `tuglife_controls.js`: eventos e comandos
- `tuglife_physics.js`: motor de simulação
- `tuglife_render.js`: renderização da UI
- `tuglife_3d.js`: visual 3D
- `three.global.js`: biblioteca local do Three.js

### Deploy no Netlify

Configuração recomendada:

- Build command: vazio
- Publish directory: `.`

Como alternativa, o arquivo `netlify.toml` já define o publish em `.`.

## Execução local

Abra `tuglife_sim.html` no navegador.

Para a melhor compatibilidade do visual 3D e carregamento dos scripts, prefira rodar o projeto publicado online.
