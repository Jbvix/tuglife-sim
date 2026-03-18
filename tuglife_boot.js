/**
 * Inicialização da aplicação.
 */
window.gameState = gameState;
window.calculateStabilityIndicators = calculateStabilityIndicators;
window.calculateVesselHydrostatics = calculateVesselHydrostatics;
window.tuglife3dModelConfig = {
    path: 'assets/models/scene.gltf',
    scale: 1,
    targetLength: 8.4,
    autoFit: true,
    rotationXDeg: 0,
    rotationYDeg: 0,
    rotationZDeg: 0,
    offset: { x: 0, y: -0.42, z: 0 },
    heelVisualSign: 1,
    trimVisualSign: -1
};

bindEventListeners();
setInterval(runSimulationTick, 1000);
renderView();
