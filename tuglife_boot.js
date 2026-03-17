/**
 * Inicialização da aplicação.
 */
window.gameState = gameState;
window.calculateStabilityIndicators = calculateStabilityIndicators;

bindEventListeners();
setInterval(runSimulationTick, 1000);
renderView();
