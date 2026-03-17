/**
 * Utilitários compartilhados.
 */
function getMcpSide(mcpKey) {
    return mcpKey === 'mcp_ps' ? 'ps' : 'sb';
}

function getPercentage(current, max) {
    return max > 0 ? (current / max) * 100 : 0;
}

function getHydraulicPumpState(mcp) {
    return mcp.hydraulicPumpCoupled && mcp.status === 'RUNNING' ? 'ON' : 'OFF';
}

function calculateStabilityIndicators() {
    const tankMap = [
        { key: 'tk06', side: 'port', longitudinal: 'mid' },
        { key: 'tk07', side: 'starboard', longitudinal: 'mid' },
        { key: 'tk04', side: 'port', longitudinal: 'mid' },
        { key: 'tk05', side: 'starboard', longitudinal: 'mid' },
        { key: 'tk11', side: 'port', longitudinal: 'aft' },
        { key: 'tk12', side: 'starboard', longitudinal: 'aft' },
        { key: 'tk15', side: 'center', longitudinal: 'mid' },
        { key: 'tk_hyd', side: 'center', longitudinal: 'fore' },
        { key: 'tk02', side: 'center', longitudinal: 'fore' },
        { key: 'tk03', side: 'center', longitudinal: 'mid' }
    ];

    const accum = {
        port: 0,
        starboard: 0,
        fore: 0,
        aft: 0,
        total: 0
    };

    tankMap.forEach(({ key, side, longitudinal }) => {
        const tank = gameState.tanks[key];
        if (!tank) return;

        const vol = tank.vol;
        accum.total += vol;

        if (side === 'port') accum.port += vol;
        if (side === 'starboard') accum.starboard += vol;
        if (longitudinal === 'fore') accum.fore += vol;
        if (longitudinal === 'aft') accum.aft += vol;
    });

    const heelBase = accum.total > 0 ? ((accum.starboard - accum.port) / accum.total) * 12 : 0;
    const trimBase = accum.total > 0 ? ((accum.aft - accum.fore) / accum.total) * 8 : 0;

    const heelDirection = heelBase > 0.15 ? 'BE' : heelBase < -0.15 ? 'BB' : 'ADR';
    const trimDirection = trimBase > 0.15 ? 'POP' : trimBase < -0.15 ? 'PROA' : 'ADR';

    return {
        heelDeg: Math.abs(heelBase).toFixed(1),
        trimDeg: Math.abs(trimBase).toFixed(1),
        heelDirection,
        trimDirection,
        portVolume: accum.port.toFixed(2),
        starboardVolume: accum.starboard.toFixed(2),
        foreVolume: accum.fore.toFixed(2),
        aftVolume: accum.aft.toFixed(2)
    };
}
