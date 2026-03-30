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

function getAirSystemState(side) {
    return gameState.machinery[`air_${side}`];
}

function getAirControlStateLabel(airSystem) {
    if (!airSystem) return 'OFF';
    return airSystem.controlPressure >= airSystem.couplingMin ? 'AR OK' : 'AR BAIXO';
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

function getSelectedWaterTruck() {
    return gameState.waterBunkering.trucks[gameState.waterBunkering.selectedTruck];
}

function syncWaterTruckVolume() {
    const truck = getSelectedWaterTruck();
    gameState.waterBunkering.truckVolume = truck ? truck.volume : 0;
    return gameState.waterBunkering.truckVolume;
}

function getTankDensity(type) {
    return VESSEL_HYDROSTATICS.fluidDensities[type] || 1.0;
}

function getTankHydroLayout() {
    return {
        tk_peak_fwd: { side: 'center', longitudinal: 'fore' },
        tk02: { side: 'center', longitudinal: 'fore' },
        tk_hyd: { side: 'center', longitudinal: 'fore' },
        tk06: { side: 'port', longitudinal: 'mid' },
        tk07: { side: 'starboard', longitudinal: 'mid' },
        tk04: { side: 'port', longitudinal: 'mid' },
        tk05: { side: 'starboard', longitudinal: 'mid' },
        tk03: { side: 'center', longitudinal: 'mid' },
        tk_od_center: { side: 'center', longitudinal: 'mid' },
        tk11: { side: 'port', longitudinal: 'aft' },
        tk12: { side: 'starboard', longitudinal: 'aft' },
        tk13: { side: 'center', longitudinal: 'aft' },
        tk14: { side: 'center', longitudinal: 'aft' },
        tk15: { side: 'center', longitudinal: 'mid' },
        tk16: { side: 'center', longitudinal: 'aft' },
        tk_peak_aft: { side: 'center', longitudinal: 'aft' }
    };
}

function getLongitudinalFactor(longitudinal) {
    if (longitudinal === 'fore') return -1;
    if (longitudinal === 'aft') return 1;
    return 0;
}

function buildHydroAccum() {
    return {
        portMass: 0,
        starboardMass: 0,
        foreMass: 0,
        aftMass: 0,
        totalMass: 0,
        fixedMass: 0,
        fluidMass: 0,
        transverseMoment: 0,
        longitudinalMoment: 0,
        portVolume: 0,
        starboardVolume: 0,
        foreVolume: 0,
        aftVolume: 0
    };
}

function getSideArm(side) {
    if (side === 'port') return -2.35;
    if (side === 'starboard') return 2.35;
    return 0;
}

function getLongitudinalArm(longitudinal) {
    if (longitudinal === 'fore') return -5.8;
    if (longitudinal === 'aft') return 5.9;
    return 0;
}

function interpolateCurve(curve, inputKey, outputKey, inputValue) {
    if (!Array.isArray(curve) || !curve.length) return 0;
    if (inputValue <= curve[0][inputKey]) return curve[0][outputKey];

    for (let i = 1; i < curve.length; i += 1) {
        const prev = curve[i - 1];
        const next = curve[i];

        if (inputValue <= next[inputKey]) {
            const span = next[inputKey] - prev[inputKey] || 1;
            const ratio = (inputValue - prev[inputKey]) / span;
            return prev[outputKey] + (next[outputKey] - prev[outputKey]) * ratio;
        }
    }

    return curve[curve.length - 1][outputKey];
}

function addHydroMass(accum, mass, side, longitudinal, volume, xArm, yArm) {
    accum.totalMass += mass;

    if (side === 'port') accum.portMass += mass;
    if (side === 'starboard') accum.starboardMass += mass;
    if (longitudinal === 'fore') accum.foreMass += mass;
    if (longitudinal === 'aft') accum.aftMass += mass;

    accum.transverseMoment += mass * (typeof xArm === 'number' ? xArm : getSideArm(side));
    accum.longitudinalMoment += mass * (typeof yArm === 'number' ? yArm : getLongitudinalArm(longitudinal));

    if (typeof volume === 'number') {
        if (side === 'port') accum.portVolume += volume;
        if (side === 'starboard') accum.starboardVolume += volume;
        if (longitudinal === 'fore') accum.foreVolume += volume;
        if (longitudinal === 'aft') accum.aftVolume += volume;
    }
}

function calculateVesselHydrostatics() {
    const accum = buildHydroAccum();
    const tankLayout = {
        tk_peak_fwd: { side: 'center', longitudinal: 'fore', xArm: 0, yArm: -6.4 },
        tk02: { side: 'center', longitudinal: 'fore', xArm: 0, yArm: -4.3 },
        tk_hyd: { side: 'center', longitudinal: 'fore', xArm: 0, yArm: -4.8 },
        tk06: { side: 'port', longitudinal: 'mid', xArm: -2.65, yArm: -1.3 },
        tk07: { side: 'starboard', longitudinal: 'mid', xArm: 2.65, yArm: -1.3 },
        tk04: { side: 'port', longitudinal: 'mid', xArm: -1.45, yArm: -0.4 },
        tk05: { side: 'starboard', longitudinal: 'mid', xArm: 1.45, yArm: -0.4 },
        tk03: { side: 'center', longitudinal: 'mid', xArm: 0, yArm: 0.4 },
        tk_od_center: { side: 'center', longitudinal: 'mid', xArm: 0, yArm: 1.0 },
        tk11: { side: 'port', longitudinal: 'aft', xArm: -2.55, yArm: 3.6 },
        tk12: { side: 'starboard', longitudinal: 'aft', xArm: 2.55, yArm: 3.6 },
        tk13: { side: 'center', longitudinal: 'aft', xArm: 0, yArm: 2.7 },
        tk14: { side: 'center', longitudinal: 'aft', xArm: 0, yArm: 3.1 },
        tk15: { side: 'center', longitudinal: 'aft', xArm: 0, yArm: 4.1 },
        tk16: { side: 'center', longitudinal: 'aft', xArm: 0, yArm: 4.6 },
        tk_peak_aft: { side: 'center', longitudinal: 'aft', xArm: 0, yArm: 6.6 }
    };

    accum.fixedMass += VESSEL_HYDROSTATICS.lightshipStructureTonnes;
    accum.totalMass += VESSEL_HYDROSTATICS.lightshipStructureTonnes;

    VESSEL_HYDROSTATICS.fixedEquipment.forEach((item) => {
        accum.fixedMass += item.mass;
        addHydroMass(accum, item.mass, item.side, item.longitudinal, undefined, item.xArm, item.yArm);
    });

    Object.entries(gameState.tanks).forEach(([tankKey, tank]) => {
        const layout = tankLayout[tankKey];
        if (!layout) return;

        const density = getTankDensity(tank.type);
        const mass = tank.vol * density;
        accum.fluidMass += mass;
        addHydroMass(accum, mass, layout.side, layout.longitudinal, tank.vol, layout.xArm, layout.yArm);
    });

    const machineryFluidItems = [
        { volume: gameState.machinery.mcp_ps.carter.vol, density: getTankDensity('lo_15w40'), side: 'port', longitudinal: 'aft', xArm: -1.8, yArm: 2.4 },
        { volume: gameState.machinery.mcp_sb.carter.vol, density: getTankDensity('lo_15w40'), side: 'starboard', longitudinal: 'aft', xArm: 1.8, yArm: 2.4 },
        { volume: gameState.machinery.mca_ps.carter.vol, density: getTankDensity('lo_15w40'), side: 'port', longitudinal: 'mid', xArm: -1.6, yArm: -0.7 },
        { volume: gameState.machinery.mca_sb.carter.vol, density: getTankDensity('lo_15w40'), side: 'starboard', longitudinal: 'mid', xArm: 1.6, yArm: -0.7 },
        { volume: gameState.machinery.zd_ps.gearboxLO.vol, density: getTankDensity('lo_150'), side: 'port', longitudinal: 'aft', xArm: -1.25, yArm: 5.4 },
        { volume: gameState.machinery.zd_sb.gearboxLO.vol, density: getTankDensity('lo_150'), side: 'starboard', longitudinal: 'aft', xArm: 1.25, yArm: 5.4 },
        { volume: gameState.machinery.zd_ps.steeringHyd.vol, density: getTankDensity('oh32'), side: 'port', longitudinal: 'aft', xArm: -1.25, yArm: 5.2 },
        { volume: gameState.machinery.zd_sb.steeringHyd.vol, density: getTankDensity('oh32'), side: 'starboard', longitudinal: 'aft', xArm: 1.25, yArm: 5.2 },
        { volume: gameState.machinery.winch.hydReservoir.vol, density: getTankDensity('oh32'), side: 'center', longitudinal: 'fore', xArm: 0, yArm: -5.1 }
    ];

    machineryFluidItems.forEach((item) => {
        const mass = item.volume * item.density;
        accum.fluidMass += mass;
        addHydroMass(accum, mass, item.side, item.longitudinal, item.volume, item.xArm, item.yArm);
    });

    const maxTankFluidMass = Object.values(gameState.tanks).reduce((sum, tank) => sum + (tank.max * getTankDensity(tank.type)), 0);
    const maxMachineryFluidMass =
        (gameState.machinery.mcp_ps.carter.max + gameState.machinery.mcp_sb.carter.max) * getTankDensity('lo_15w40') +
        (gameState.machinery.mca_ps.carter.max + gameState.machinery.mca_sb.carter.max) * getTankDensity('lo_15w40') +
        (gameState.machinery.zd_ps.gearboxLO.max + gameState.machinery.zd_sb.gearboxLO.max) * getTankDensity('lo_150') +
        (gameState.machinery.zd_ps.steeringHyd.max + gameState.machinery.zd_sb.steeringHyd.max + gameState.machinery.winch.hydReservoir.max) * getTankDensity('oh32');

    const baseMassTonnes = accum.fixedMass;
    const fullLoadMassTonnes = baseMassTonnes + maxTankFluidMass + maxMachineryFluidMass;
    const loadRatio = Math.max(0, Math.min(1, (accum.totalMass - baseMassTonnes) / Math.max(1, fullLoadMassTonnes - baseMassTonnes)));
    const draftRatio = Math.pow(loadRatio, VESSEL_HYDROSTATICS.response.draftCurveExponent);
    const visualDraftRatio = Math.pow(loadRatio, VESSEL_HYDROSTATICS.response.visualDraftCurveExponent);
    const curveMass = baseMassTonnes + (fullLoadMassTonnes - baseMassTonnes) * draftRatio;
    const draftMeters = interpolateCurve(VESSEL_HYDROSTATICS.curves.displacementDraft, 'mass', 'draft', curveMass);
    const visualOffset = VESSEL_HYDROSTATICS.draft.visualOffsetLightship
        + (VESSEL_HYDROSTATICS.draft.visualOffsetFullLoad - VESSEL_HYDROSTATICS.draft.visualOffsetLightship) * visualDraftRatio;

    const heelFactor = interpolateCurve(VESSEL_HYDROSTATICS.curves.heelResponse, 'draft', 'factor', draftMeters);
    const trimFactor = interpolateCurve(VESSEL_HYDROSTATICS.curves.trimResponse, 'draft', 'factor', draftMeters);
    const rawHeel = accum.transverseMoment * heelFactor;
    const rawTrim = accum.longitudinalMoment * trimFactor;
    const heelBase = Math.max(-VESSEL_HYDROSTATICS.response.maxHeelDeg, Math.min(VESSEL_HYDROSTATICS.response.maxHeelDeg, rawHeel));
    const trimBase = Math.max(-VESSEL_HYDROSTATICS.response.maxTrimDeg, Math.min(VESSEL_HYDROSTATICS.response.maxTrimDeg, rawTrim));
    const heelDirection = heelBase > 0.15 ? 'BE' : heelBase < -0.15 ? 'BB' : 'ADR';
    const trimDirection = trimBase > 0.15 ? 'POP' : trimBase < -0.15 ? 'PROA' : 'ADR';

    return {
        heelDeg: Math.abs(heelBase).toFixed(1),
        trimDeg: Math.abs(trimBase).toFixed(1),
        heelDirection,
        trimDirection,
        portVolume: accum.portVolume.toFixed(2),
        starboardVolume: accum.starboardVolume.toFixed(2),
        foreVolume: accum.foreVolume.toFixed(2),
        aftVolume: accum.aftVolume.toFixed(2),
        draftMeters,
        visualOffset,
        loadRatio,
        totalMassTonnes: accum.totalMass,
        fixedMassTonnes: accum.fixedMass,
        fluidMassTonnes: accum.fluidMass,
        fullLoadMassTonnes,
        transverseMomentTm: accum.transverseMoment,
        longitudinalMomentTm: accum.longitudinalMoment
    };
}

function calculateStabilityIndicators() {
    return calculateVesselHydrostatics();
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
