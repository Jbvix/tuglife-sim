# TAGs de Implementacao e Correcao

Documento de rastreabilidade das implementacoes e correcoes registradas no projeto ate `31/03/2026`.

## Objetivo

Este registro cria uma trilha unica de referencia para:

- localizar rapidamente cada entrega tecnica
- relacionar implementacoes com seus commits de origem
- identificar o que esta ativo, substituido ou revertido
- apoiar documentacao, auditoria e manutencao futura

## Padrao de TAG

- `TAG-CORE-XXX`: base do projeto, estrutura, bootstrap e deploy
- `TAG-WEB-XXX`: landing page, navegacao e acessos web
- `TAG-3D-XXX`: cena 3D, modelo, camera, carregamento e controles visuais
- `TAG-TANK-XXX`: tanques, capacidades, layout de planta e logica de recebimento
- `TAG-UI-XXX`: paineis, drawers, abas e organizacao de interface
- `TAG-RESP-XXX`: responsividade e ajustes de distribuicao visual
- `TAG-OPS-XXX`: logica operacional e regras de processo
- `TAG-DATA-XXX`: parametrizacao, estoques e capacidades
- `TAG-TERM-XXX`: padronizacao textual e nomenclatura
- `TAG-DOC-XXX`: manual, guias e referencias
- `TAG-FIFI-XXX`: sistema FiFi
- `TAG-AIR-XXX`: sistema de ar de acoplamento e compressores

## Status de rastreabilidade

- `Ativa`: entrega vigente no estado atual do projeto
- `Substituida`: entrega absorvida ou refinada por implementacao posterior
- `Revertida`: alteracao explicitamente desfeita por commit posterior

## Registro completo

| TAG | Status | Tipo | Commit | Referencia | Descricao |
| --- | --- | --- | --- | --- | --- |
| `TAG-CORE-001` | Ativa | Implementacao | `2201026` | `Initial TugLife Sim project setup` | Estrutura inicial do projeto TugLife Sim. |
| `TAG-CORE-002` | Ativa | Implementacao | `d37e785` | `Add index entrypoint for Netlify` | Inclusao do ponto de entrada principal para publicacao estatica. |
| `TAG-WEB-001` | Substituida | Implementacao | `ad0ca39` | `Add landing page for project entry` | Criacao da primeira landing page de entrada do projeto. |
| `TAG-3D-001` | Substituida | Implementacao | `1733e1e` | `Improve 3D tug scene and mooring setup` | Melhoria inicial da cena 3D e da configuracao de amarracao. |
| `TAG-3D-002` | Ativa | Implementacao | `a74e66a` | `Add orbital camera controls to 3D view` | Inclusao de controles orbitais de camera na visualizacao 3D. |
| `TAG-3D-003` | Ativa | Implementacao | `803200a` | `Refactor 3D scene setup and enhance tugboat model details` | Refatoracao da configuracao da cena 3D e melhoria de detalhes do rebocador. |
| `TAG-3D-004` | Ativa | Implementacao | `dee3fb2` | `Add Rastar 3200 tugboat model and associated files` | Inclusao do modelo 3D principal do rebocador e arquivos associados. |
| `TAG-3D-005` | Ativa | Correcao | `78163e6` | `Remove old texture files and add new textures for the Rastar 3200 tugboat model. Include license information and scene files for proper attribution and usage.` | Atualizacao de texturas, arquivos de cena e informacoes de licenca do modelo. |
| `TAG-3D-006` | Ativa | Correcao | `e493220` | `Remove unused texture files and add new textures for the Rastar 3200 tugboat model. Include model license information and update GLTF scene structure.` | Limpeza de texturas nao utilizadas e ajuste da estrutura GLTF. |
| `TAG-3D-007` | Ativa | Correcao | `7a31395` | `Update 3D model path for tugboat configuration` | Correcao do caminho do modelo 3D na configuracao do rebocador. |
| `TAG-3D-008` | Ativa | Correcao | `0b689dd` | `Update GLTF loading status messages and improve external model usage instructions` | Ajuste das mensagens de carregamento GLTF e orientacoes de uso do modelo externo. |
| `TAG-3D-009` | Ativa | Correcao | `3007d87` | `Refine GLTF loading fallback behavior` | Refinamento do comportamento de fallback no carregamento do modelo 3D. |
| `TAG-3D-010` | Ativa | Correcao | `b9bcdc0` | `Fix GLTF loader global scope collision` | Correcao de colisao de escopo global do carregador GLTF. |
| `TAG-3D-011` | Ativa | Correcao | `8007a74` | `Adjust GLTF model orientation` | Ajuste da orientacao do modelo GLTF. |
| `TAG-3D-012` | Substituida | Correcao | `4f1f609` | `Refine waterline and mooring ropes` | Refinamento inicial da linha d'agua e dos cabos de amarracao. |
| `TAG-3D-013` | Substituida | Correcao | `1d8be9f` | `Tune waterline and mooring contact points` | Ajuste dos pontos de contato da linha d'agua e amarracao. |
| `TAG-3D-014` | Ativa | Implementacao | `71f10b0` | `Add interactive mooring anchor points` | Inclusao de pontos interativos de amarracao. |
| `TAG-3D-015` | Ativa | Correcao | `98174c0` | `Align mooring lines with tug anchor markers` | Alinhamento das linhas de amarracao com os marcadores do rebocador. |
| `TAG-3D-016` | Ativa | Implementacao | `8c6791e` | `Add tug anchor calibration panel` | Criacao do painel de calibracao dos pontos de amarracao. |
| `TAG-3D-017` | Ativa | Implementacao | `bf760e8` | `Add height slider to tug anchor calibration` | Inclusao do ajuste de altura na calibracao dos pontos de amarracao. |
| `TAG-UI-001` | Ativa | Implementacao | `701a483` | `Add 3D propulsion control panel and readiness gate` | Inclusao do painel de propulsao 3D e da logica de prontidao. |
| `TAG-DATA-001` | Ativa | Implementacao | `468811c` | `Update lubricant and hydraulic capacities` | Ajuste das capacidades de lubrificante e hidraulico. |
| `TAG-OPS-001` | Ativa | Implementacao | `efcd483` | `Add segregated bunker truck and lubricant drum receiving` | Inclusao da logica segregada de recebimento por caminhao bunker e tambores de lubrificante. |
| `TAG-TANK-001` | Ativa | Implementacao | `c2c17a4` | `Split TK15 display and add TK16 to hull layout` | Revisao da planta com separacao visual do TK15 e inclusao do TK16. |
| `TAG-UI-002` | Substituida | Implementacao | `b335c03` | `Add desktop side-panel layout around hull view` | Primeira versao do layout desktop com paineis laterais ao redor da vista do casco. |
| `TAG-UI-003` | Substituida | Correcao | `86f7fce` | `Persist dual desktop side panels and tighten widths` | Persistencia dos paineis laterais duplos e ajuste de larguras no desktop. |
| `TAG-UI-004` | Substituida | Correcao | `f670e02` | `Tighten desktop center and 3D panel widths` | Refinamento das larguras da coluna central e do painel 3D no desktop. |
| `TAG-UI-005` | Substituida | Correcao | `62dabb4` | `Add independent desktop drawer scrolling and QEP fit` | Inclusao de rolagem independente e ajuste de encaixe do QEP. |
| `TAG-RESP-001` | Substituida | Correcao | `83fc6fe` | `Fix desktop drawer scrolling and narrow hull column` | Correcao da rolagem dos drawers e ajuste da coluna do casco. |
| `TAG-RESP-002` | Substituida | Correcao | `63ba783` | `Raise desktop drawers and shrink side widths` | Reposicionamento dos drawers e reducao das larguras laterais. |
| `TAG-RESP-003` | Substituida | Correcao | `754a1c6` | `Shift width from hull column to desktop side drawers` | Redistribuicao de largura entre coluna do casco e drawers. |
| `TAG-RESP-004` | Substituida | Correcao | `1811b13` | `Center desktop layout cluster and extend drawer height` | Centralizacao do cluster desktop e aumento da altura util dos drawers. |
| `TAG-UI-006` | Ativa | Correcao | `84b3358` | `Refresh 3D stage when visual panel is selected` | Atualizacao do palco 3D ao selecionar o painel visual. |
| `TAG-UI-007` | Ativa | Implementacao | `d20383a` | `Map desktop tabs to fixed left and right drawers` | Mapeamento das abas desktop para drawers fixos laterais. |
| `TAG-TANK-002` | Ativa | Implementacao | `1a98688` | `Add truck selection and new ballast and OD tanks` | Inclusao de selecao de caminhoes e novos tanques de ballast e OD. |
| `TAG-TERM-001` | Ativa | Correcao | `757e783` | `Rename machine room title and hose action label` | Ajuste de nomenclaturas na sala de maquinas e acao de mangueira. |
| `TAG-RESP-005` | Substituida | Correcao | `681d0b1` | `Tighten desktop hull scaling after tank layout expansion` | Ajuste de escala do casco desktop apos expansao da planta. |
| `TAG-OPS-002` | Ativa | Implementacao | `a8a4502` | `Allow freshwater receiving to fore and aft peak tanks` | Inclusao do recebimento de agua doce para tanques de pique vante e re. |
| `TAG-OPS-003` | Ativa | Implementacao | `f60085c` | `Add more receiving truck selectors for oil and water` | Expansao dos seletores de recebimento de agua e oleo. |
| `TAG-3D-018` | Ativa | Implementacao | `e980b3f` | `Add simplified hydrostatics for 3D stability and draft` | Inclusao de hidrostatica simplificada para estabilidade e calado. |
| `TAG-3D-019` | Ativa | Correcao | `65aa77b` | `Calibrate 3D heel, trim, and draft response` | Calibracao da resposta 3D de banda, trim e calado. |
| `TAG-3D-020` | Ativa | Implementacao | `6a2864d` | `Add curve-based trim and stability model scaffold` | Estrutura inicial do modelo de trim e estabilidade baseado em curva. |
| `TAG-3D-021` | Substituida | Correcao | `4ab461c` | `Increase trim sensitivity and align TK12 capacity` | Ajuste inicial de sensibilidade de trim e capacidade do TK12. |
| `TAG-DATA-002` | Substituida | Correcao | `724f6d4` | `Set TK11 and TK12 capacity to 15 cubic meters` | Parametrizacao inicial da capacidade dos tanques TK11 e TK12. |
| `TAG-3D-022` | Ativa | Correcao | `8a7212d` | `Fix 3D trim direction and increase attitude response` | Correcao da direcao do trim 3D e aumento de resposta de atitude. |
| `TAG-OPS-004` | Ativa | Implementacao | `5daaa88` | `Start with empty service tanks and add hydraulic drum filling` | Inicio com tanques de servico vazios e inclusao de enchimento por tambores hidraulicos. |
| `TAG-3D-023` | Substituida | Correcao | `96f12fc` | `Rebalance initial trim and fix 3D trim sign` | Rebalanceamento inicial do trim e ajuste do sinal visual no 3D. |
| `TAG-3D-024` | Revertida | Correcao | `6dbb588` | `Invert visual trim sign for 3D model` | Inversao do sinal visual de trim do modelo 3D, posteriormente substituida. |
| `TAG-TANK-003` | Ativa | Implementacao | `7bdd785` | `Add TK central OD to oil receiving targets` | Inclusao do TK central OD como destino de recebimento de oleo. |
| `TAG-TANK-004` | Ativa | Implementacao | `d590230` | `Adjust plant tank layout and add central OD purifier source` | Ajuste da planta de tanques e adicao da fonte central do purificador OD. |
| `TAG-DATA-003` | Substituida | Implementacao | `2c1b889` | `Increase lubricant drum stock to 20` | Aumento inicial do estoque de tambores de lubrificante. |
| `TAG-WEB-002` | Ativa | Implementacao | `0ffe6f5` | `Add fullscreen toggle to 3D tug view` | Inclusao do modo fullscreen para a visualizacao 3D. |
| `TAG-TERM-002` | Ativa | Correcao | `5926757` | `Rename winch controls to colher and pagar` | Ajuste da nomenclatura dos controles do guincho. |
| `TAG-RESP-006` | Ativa | Correcao | `2385c2c` | `Fix mobile QEP layout and hide 3D model status` | Correcao do layout mobile do QEP e ocultacao do status do modelo 3D. |
| `TAG-OPS-005` | Ativa | Correcao | `facb892` | `Reduce MCP and MCA lubricant consumption rates` | Ajuste das taxas de consumo de lubrificante dos MCP e MCA. |
| `TAG-OPS-006` | Ativa | Implementacao | `97d58bc` | `Add OD recirculation and overflow gravity return` | Inclusao da recirculacao de OD e do retorno por gravidade do overflow. |
| `TAG-3D-025` | Ativa | Correcao | `28b1e28` | `Fix fullscreen 3D controls and tune tug motion` | Correcao dos controles 3D em fullscreen e ajuste do movimento do rebocador. |
| `TAG-RESP-007` | Revertida | Correcao | `72b566b` | `Refine desktop and mobile layout responsiveness` | Refinamento geral de responsividade de desktop e mobile, depois revertido. |
| `TAG-RESP-008` | Revertida | Correcao | `9cbce82` | `Fix desktop drawer vertical alignment` | Correcao de alinhamento vertical dos drawers desktop, depois revertida. |
| `TAG-RESP-009` | Ativa | Correcao | `780a628` | `Revert "Fix desktop drawer vertical alignment"` | Reversao da correcao de alinhamento vertical anterior. |
| `TAG-RESP-010` | Ativa | Correcao | `67ba269` | `Revert "Refine desktop and mobile layout responsiveness"` | Reversao do refinamento de responsividade anterior. |
| `TAG-WEB-003` | Substituida | Correcao | `fa3595a` | `Refine landing page for educational positioning` | Refinamento da landing page com foco em posicionamento educacional. |
| `TAG-WEB-004` | Ativa | Implementacao | `682e27e` | `Add manual access button to landing page` | Inclusao do botao de acesso ao manual na landing page. |
| `TAG-DOC-001` | Ativa | Implementacao | `38411ae` | `Replace PDF manual with HTML manual page` | Substituicao do manual em PDF por pagina HTML. |
| `TAG-RESP-011` | Substituida | Correcao | `56ee3d8` | `Improve tablet landscape panel layout` | Melhoria do layout dos paineis em tablet landscape. |
| `TAG-RESP-012` | Ativa | Correcao | `87738e0` | `Increase side drawer space on tablet landscape` | Aumento do espaco lateral dos drawers em tablet landscape. |
| `TAG-TERM-003` | Ativa | Correcao | `4b8bb4d` | `Update cooling and starboard terminology` | Atualizacao da terminologia de arrefecimento e boreste. |
| `TAG-DATA-004` | Ativa | Implementacao | `0801d20` | `Increase initial lubricant drum stock` | Aumento do estoque inicial de tambores de lubrificante. |
| `TAG-DATA-005` | Ativa | Implementacao | `968557e` | `Increase HDR tank capacities` | Ajuste das capacidades dos tanques HDR. |
| `TAG-DOC-002` | Ativa | Implementacao | `4a0d6b2` | `Add vessel characteristics tables to manual` | Inclusao das tabelas de caracteristicas da embarcacao no manual. |
| `TAG-FIFI-001` | Ativa | Implementacao | `7cdd7c3` | `Add FiFi One firefighting system panel` | Inclusao do painel do sistema FiFi One. |
| `TAG-FIFI-002` | Ativa | Correcao | `8a0e406` | `Refine FiFi monitor automation and sweetening` | Refinamento da automacao dos monitores FiFi e do processo de adocamento. |
| `TAG-FIFI-003` | Ativa | Implementacao | `59d5780` | `Convert FiFi modal to tabbed layout` | Conversao do modal FiFi para layout em abas. |
| `TAG-UI-008` | Ativa | Implementacao | `e739bbf` | `Add tabbed layout to drawer screens` | Criacao do layout em abas para telas drawer do simulador. |
| `TAG-OPS-007` | Ativa | Correcao | `f9d3c67` | `Sprint 1: formalize overflow gravity return` | Formalizacao da regra de retorno por gravidade do overflow. |
| `TAG-CORE-003` | Ativa | Implementacao | `21ce1e8` | `Reorganize project structure for Netlify` | Reorganizacao estrutural do projeto para deploy estatico via Netlify. |
| `TAG-CORE-004` | Ativa | Implementacao | `e90c67a` | `Group scripts by domain` | Agrupamento dos scripts por dominio tecnico. |
| `TAG-AIR-001` | Ativa | Implementacao | `b95ebd9` | `Add clutch air system to propulsion panel` | Inclusao do sistema inicial de ar de acoplamento no painel de propulsao. |
| `TAG-AIR-002` | Ativa | Implementacao | `9076453` | `Add shared clutch compressor control panel` | Painel compartilhado de compressores com um equipamento em servico e outro em standby. |
| `TAG-AIR-003` | Ativa | Implementacao | `d5872ba` | `Enhance compressor automation and bottle fill simulation` | Automacao do enchimento das garrafas e simulacao de carga pneumatica. |
| `TAG-RESP-013` | Ativa | Correcao | `c075f59` | `Tighten propulsion panel layout and power messaging` | Ajuste do layout do painel de propulsao e mensagem de energizacao do compressor eletrico. |
| `TAG-AIR-004` | Ativa | Correcao | `a119424` | `Show low air warning only during charging` | Exibicao do aviso de baixa pressao somente durante o enchimento. |
| `TAG-WEB-005` | Ativa | Correcao | `323af75` | `Improve landing layout for mobile` | Melhoria da landing page com foco mobile first e CTA reposicionado. |
| `TAG-AIR-005` | Ativa | Correcao | `8593487` | `Simplify air panel status states` | Simplificacao do painel de ar para tres estados operacionais. |
| `TAG-DOC-003` | Ativa | Implementacao | `fb88130` | `Update docs for clutch air system` | Atualizacao da documentacao para o sistema de ar de acoplamento. |

## Mapa rapido das TAGs ativas

### Base e estrutura

- `TAG-CORE-001`
- `TAG-CORE-002`
- `TAG-CORE-003`
- `TAG-CORE-004`

### Web e acesso

- `TAG-WEB-002`
- `TAG-WEB-004`
- `TAG-WEB-005`

### Interface e responsividade

- `TAG-UI-001`
- `TAG-UI-006`
- `TAG-UI-007`
- `TAG-UI-008`
- `TAG-RESP-006`
- `TAG-RESP-009`
- `TAG-RESP-010`
- `TAG-RESP-012`
- `TAG-RESP-013`

### Simulacao 3D

- `TAG-3D-002`
- `TAG-3D-003`
- `TAG-3D-004`
- `TAG-3D-005`
- `TAG-3D-006`
- `TAG-3D-007`
- `TAG-3D-008`
- `TAG-3D-009`
- `TAG-3D-010`
- `TAG-3D-011`
- `TAG-3D-014`
- `TAG-3D-015`
- `TAG-3D-016`
- `TAG-3D-017`
- `TAG-3D-018`
- `TAG-3D-019`
- `TAG-3D-020`
- `TAG-3D-022`
- `TAG-3D-025`

### Planta, recebimento e operacao

- `TAG-TANK-001`
- `TAG-TANK-002`
- `TAG-TANK-003`
- `TAG-TANK-004`
- `TAG-OPS-001`
- `TAG-OPS-002`
- `TAG-OPS-003`
- `TAG-OPS-004`
- `TAG-OPS-005`
- `TAG-OPS-006`
- `TAG-OPS-007`

### Parametrizacao e terminologia

- `TAG-DATA-001`
- `TAG-DATA-004`
- `TAG-DATA-005`
- `TAG-TERM-001`
- `TAG-TERM-002`
- `TAG-TERM-003`

### Documentacao

- `TAG-DOC-001`
- `TAG-DOC-002`
- `TAG-DOC-003`

### FiFi

- `TAG-FIFI-001`
- `TAG-FIFI-002`
- `TAG-FIFI-003`

### Ar de acoplamento

- `TAG-AIR-001`
- `TAG-AIR-002`
- `TAG-AIR-003`
- `TAG-AIR-004`
- `TAG-AIR-005`

## Como manter este registro

Ao concluir uma nova implementacao ou correcao:

1. criar a nova TAG da categoria correspondente
2. registrar o commit principal que consolidou a entrega
3. marcar o status da TAG anterior, quando ela for substituida ou revertida
4. atualizar este documento e o `README`, se houver impacto de referencia

## Observacao

Este documento rastreia as entregas pela unidade mais pratica disponivel hoje: o commit principal que consolidou a mudanca. Se quiser, o proximo passo natural e eu aplicar essas TAGs tambem:

- em secoes do `README`
- no manual HTML
- em notas de release
- em comentarios de cabecalho dos modulos principais
