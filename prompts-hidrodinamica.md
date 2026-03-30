# Biblioteca de Prompts de Hidrodinamica

Esta biblioteca foi organizada para uso no chat do VS Code por meio de prompt files em `.github/prompts`.

## Como usar no VS Code

1. Abra o chat do VS Code.
2. Digite `/` para listar os prompts disponiveis.
3. Escolha um prompt da biblioteca.
4. Cole o cenario tecnico logo depois do comando.

Exemplo:

```txt
/asd-tug
Rebocador ASD em baixa velocidade, corrente de través de 2 nos, vento de 25 nos por bombordo, cabo na proa, objetivo de alinhar a embarcacao assistida sem exceder a carga segura do cabo.
```

## Prompts disponiveis

- `/analise-geral-hidrodinamica`
- `/asd-tug`
- `/manobra-boia-cabo`
- `/tensao-cabos`
- `/corrente-vento-resultante`
- `/colisao-impacto`
- `/pivot-point-momento-giro`
- `/vetores-resultantes`
- `/skeg-estabilidade-direcional`
- `/prompt-mestre-casos-complexos`

## Instrucoes fixas

O arquivo `.github/instructions/hidrodinamica.instructions.md` define o comportamento base das respostas, reforcando:

- nao inventar dados ausentes
- listar dados faltantes
- usar unidades SI
- separar hipoteses de resultados
- destacar riscos e limitacoes
