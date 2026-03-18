/**
 * Utilitarios compartilhados.
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

function getSelectedBunkerTruck() {
    return gameState.bunker.trucks[gameState.bunker.selectedTruck];
}

function getBunkerCompartments() {
    return getSelectedBunkerTruck()?.compartments || [];
}

function syncBunkerTruckVolume() {
    gameState.bunker.truckVolume = getBunkerCompartments().reduce((sum, compartment) => sum + compartment.vol, 0);
    return gameState.bunker.truckVolume;
}

function calculateStabilityIndicators() {
    const tankMap = [
        { key: 'tk_peak_fwd', side: 'center', longitudinal: 'fore' },
        { key: 'tk06', side: 'port', longitudinal: 'mid' },
        { key: 'tk07', side: 'starboard', longitudinal: 'mid' },
        { key: 'tk04', side: 'port', longitudinal: 'mid' },
        { key: 'tk05', side: 'starboard', longitudinal: 'mid' },
        { key: 'tk11', side: 'port', longitudinal: 'aft' },
        { key: 'tk12', side: 'starboard', longitudinal: 'aft' },
        { key: 'tk_od_center', side: 'center', longitudinal: 'mid' },
        { key: 'tk15', side: 'center', longitudinal: 'mid' },
        { key: 'tk16', side: 'center', longitudinal: 'aft' },
        { key: 'tk_peak_aft', side: 'center', longitudinal: 'aft' },
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

function getOperationalReadiness() {
    const requiredTankKeys = ['tk02', 'tk04', 'tk05', 'tk06', 'tk07', 'tk11', 'tk12'];
    const tankPercentages = requiredTankKeys.map((key) => {
        const tank = gameState.tanks[key];
        return { key, pct: getPercentage(tank.vol, tank.max) };
    });

    const lowTanks = tankPercentages.filter((item) => item.pct < 60).map((item) => item.key.toUpperCase());
    const generatorReady = MCA_KEYS.some((key) => {
        const gen = gameState.machinery[key];
        return gen.status === 'RUNNING' && gen.breakerClosed;
    });

    const mcpReady = MCP_KEYS.every((key) => {
        const mcp = gameState.machinery[key];
        return mcp.status === 'RUNNING'
            && mcp.preLubeOn
            && mcp.coolingOn
            && mcp.clutchEngaged
            && mcp.oilPress >= 4;
    });

    const zDriveReady = ZD_SIDES.every((side) => {
        const zd = gameState.machinery[`zd_${side}`];
        return zd.gearboxLO.vol >= zd.gearboxLO.max * 0.6
            && zd.steeringHyd.vol >= zd.steeringHyd.max * 0.6
            && zd.propState !== 'TRIP';
    });

    const ready = generatorReady && gameState.power.isLive && mcpReady && zDriveReady && lowTanks.length === 0;
    const blockers = [];

    if (!generatorReady) blockers.push('gerador');
    if (!gameState.power.isLive) blockers.push('QEP desenergizado');
    if (!mcpReady) blockers.push('MCP BB/BE');
    if (!zDriveReady) blockers.push('propulsores BB/BE');
    if (lowTanks.length) blockers.push(`tanques < 60%: ${lowTanks.join(', ')}`);

    return {
        ready,
        blockers,
        generatorReady,
        mcpReady,
        zDriveReady
    };
}
