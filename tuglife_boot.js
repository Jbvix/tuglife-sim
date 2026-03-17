/**
 * Inicialização da aplicação.
 */
window.gameState = gameState;
window.calculateStabilityIndicators = calculateStabilityIndicators;
window.tuglife3dModelConfig = {
    path: 'assets/models/scene.gltf',
    scale: 1,
    targetLength: 8.4,
    autoFit: true,
    rotationXDeg: 90,
    rotationYDeg: 0,
    rotationZDeg: 0,
    offset: { x: 0, y: 0.02, z: 0 }
};

bindEventListeners();
setInterval(runSimulationTick, 1000);
renderView();
