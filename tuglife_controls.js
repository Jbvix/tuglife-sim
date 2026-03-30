/**
 * Ações do usuário e binding de eventos.
 */
function triggerAlarm(message) {
    gameState.isAlarmActive = true;
    gameState.activeAlarmMessage = message;
    renderView();
}

function clearAlarm() {
    gameState.isAlarmActive = false;
    gameState.activeAlarmMessage = "";
    renderView();
}

function openModal(type, entityKey) {
    gameState.modal.isOpen = true;
    gameState.modal.type = type;
    gameState.modal.entityKey = entityKey;
    document.getElementById('info-modal-overlay').style.display = 'flex';
    renderModalContent();
}

function closeModal() {
    gameState.modal.isOpen = false;
    document.getElementById('info-modal-overlay').style.display = 'none';
}

function setFlowRate(btn) {
    gameState.transfer.flowRate = parseFloat(btn.getAttribute('data-rate'));
    gameState.transfer.flowRateMode = btn.getAttribute('data-mode');
    renderView();
}

function toggleWaterPanel() {
    gameState.waterBunkering.panelOpen = !gameState.waterBunkering.panelOpen;
    renderView();
}

function toggleLoDrumPanel() {
    gameState.loReceiving.panelOpen = !gameState.loReceiving.panelOpen;
    renderView();
}

function selectBunkerCompartment(compartmentId) {
    const compartment = getBunkerCompartments().find(item => item.id === compartmentId);
    if (!compartment) return;

    gameState.bunker.selectedCompartment = compartmentId;

    if (compartment.vol <= 0) {
        gameState.bunker.isPumping = false;
    }

    renderView();
}

function selectBunkerTruck(truckKey) {
    if (!gameState.bunker.trucks[truckKey]) return;

    gameState.bunker.selectedTruck = truckKey;
    gameState.bunker.selectedCompartment = 'c1';
    gameState.bunker.isPumping = false;
    syncBunkerTruckVolume();
    renderView();
}

function selectWaterTruck(truckKey) {
    if (!gameState.waterBunkering.trucks[truckKey]) return;

    gameState.waterBunkering.selectedTruck = truckKey;
    gameState.waterBunkering.isPumping = false;
    syncWaterTruckVolume();
    renderView();
}

function receiveLoDrum() {
    const targetTank = gameState.tanks[gameState.loReceiving.selectedTank];

    if (!targetTank) return;

    if (gameState.loReceiving.drumsAvailable <= 0) {
        return triggerAlarm("SEM TAMBORES DE 200 L DISPONÍVEIS PARA RECEBIMENTO.");
    }

    if (targetTank.vol >= targetTank.max) {
        return triggerAlarm(`${targetTank.name} CHEIO. SEM CAPACIDADE PARA RECEBER ÓLEO LUBRIFICANTE.`);
    }

    const transfer = Math.min(gameState.loReceiving.drumVolume, targetTank.max - targetTank.vol);
    targetTank.vol += transfer;
    gameState.loReceiving.drumsAvailable -= 1;
    renderView();
}

function toggleTk03PurifierTransfer() {
    const hdrDestination = ['tk04', 'tk05'].includes(gameState.transfer.destTank) ? gameState.transfer.destTank : 'tk04';
    const sameTransfer = gameState.transfer.sourceTank === 'tk03' && gameState.transfer.destTank === hdrDestination;

    if (gameState.transfer.isPumping && !sameTransfer) {
        return triggerAlarm("INTERLOCK: PURIFICADOR JÁ ESTÁ EM USO EM OUTRA TRANSFERÊNCIA.");
    }

    if (!sameTransfer) {
        if (gameState.tanks.tk03.vol <= 0) return triggerAlarm("INTERLOCK: TK03 SEM VOLUME PARA TRANSFERIR.");
        if (gameState.tanks[hdrDestination].vol >= gameState.tanks[hdrDestination].max) return triggerAlarm(`INTERLOCK: ${gameState.tanks[hdrDestination].name} CHEIO. SEM CAPACIDADE PARA RECEBER.`);
        gameState.transfer.sourceTank = 'tk03';
        gameState.transfer.destTank = hdrDestination;
    }

    gameState.transfer.isPumping = !gameState.transfer.isPumping;
    renderView();
}

function handleGenStart(genKey) {
    const gen = gameState.machinery[genKey];

    if (gen.status === 'OFF') {
        if ((gen.carter.vol / gen.carter.max) < 0.30) return triggerAlarm(`INTERLOCK: CARTER ${gen.name} < 30% - ENCHER CARTER ANTES DE ARRANCAR.`);
        if (gameState.tanks[gen.fuelSource].vol <= 0) return triggerAlarm(`FALHA: ${gen.fuelSource.toUpperCase()} VAZIO`);
        gen.status = 'STARTING';
    } else {
        gen.status = 'OFF';
        gen.breakerClosed = false;
    }

    renderView();
}

function handleBreaker(genKey) {
    const gen = gameState.machinery[genKey];
    if (gen.status !== 'RUNNING') return;
    gen.breakerClosed = !gen.breakerClosed;
    renderView();
}

function toggleAuxiliary(mcpKey, type) {
    if (!gameState.power.isLive) return triggerAlarm("INTERLOCK: QEP DESENERGIZADO! LIGUE OS GERADORES PRIMEIRO.");

    const mcp = gameState.machinery[mcpKey];
    if (type === 'lube') {
        if (!mcp.preLubeOn && mcp.carter.vol <= 0) return triggerAlarm(`INTERLOCK: CARTER ${mcp.name} VAZIO - SEM LO PARA PRÉ-LUBRIFICAÇÃO.`);
        mcp.preLubeOn = !mcp.preLubeOn;
    }
    if (type === 'cool') mcp.coolingOn = !mcp.coolingOn;

    renderView();
}

function toggleFifiValve(valveKey) {
    const fifi = gameState.machinery.fifi;
    if (!(valveKey in fifi)) return;

    fifi[valveKey] = !fifi[valveKey];
    renderView();
    renderModalContent();
}

function handleFifiStart() {
    const fifi = gameState.machinery.fifi;
    const fuelTank = gameState.tanks[fifi.fuelSource];

    if (fifi.engineStatus === 'OFF') {
        if ((fifi.carter.vol / fifi.carter.max) < 0.30) {
            return triggerAlarm("INTERLOCK FIFI: ENCHER CARTER COM OL15W40 ANTES DA PARTIDA.");
        }
        if (fuelTank.vol <= 0) {
            return triggerAlarm(`INTERLOCK FIFI: ${fuelTank.name} SEM ÓLEO DIESEL.`);
        }
        fifi.engineStatus = 'RUNNING';
        fifi.targetRpm = 1800;
    } else {
        fifi.engineStatus = 'OFF';
        fifi.targetRpm = 0;
    }

    renderView();
    renderModalContent();
}

function handleMcpStart(mcpKey) {
    const mcp = gameState.machinery[mcpKey];

    if (mcp.status === 'OFF') {
        if ((mcp.carter.vol / mcp.carter.max) < 0.30) return triggerAlarm(`INTERLOCK: CARTER ${mcp.name} < 30% - ENCHER CARTER ANTES DE ARRANCAR.`);
        if (!mcp.preLubeOn) return triggerAlarm("INTERLOCK: LIGUE A BOMBA PRÉ-LUBRIFICAÇÃO.");
        if (!mcp.coolingOn) return triggerAlarm("INTERLOCK: LIGUE A BOMBA DE ÁGUA DE CIRCULAÇÃO.");
        if (gameState.tanks[mcp.fuelSource].vol <= 0) return triggerAlarm(`FALTA GASÓLEO NO ${mcp.fuelSource}.`);

        mcp.status = 'RUNNING';
        mcp.targetRpm = SIM_CONFIG.mcpIdleRpm;
        mcp.telegraph = 0;
    } else {
        if (mcp.clutchEngaged) return triggerAlarm("INTERLOCK: DESACOPLE A EMBRAIAGEM ANTES DE PARAR O MOTOR!");
        mcp.status = 'OFF';
        mcp.targetRpm = 0;
        mcp.telegraph = 0;
    }

    renderView();
}

function fillCarter(engKey) {
    const eng = gameState.machinery[engKey];
    const tk15 = gameState.tanks.tk15;

    if (eng.status === 'RUNNING') return triggerAlarm(`INTERLOCK: NÃO TRANSFERIR OL15W40 PARA ${eng.name} EM MARCHA!`);
    if (tk15.vol <= 0) return triggerAlarm("FALTA OL15W40: TK 15 VAZIO! REABASTECER ÓLEO LUBRIFICANTE.");

    const needed = eng.carter.max - eng.carter.vol;
    const toTransfer = Math.min(needed, tk15.vol);

    eng.carter.vol += toTransfer;
    tk15.vol -= toTransfer;
    renderView();
}

function handleTelegraph(mcpKey, val) {
    const mcp = gameState.machinery[mcpKey];
    mcp.telegraph = parseInt(val);
    mcp.targetRpm = SIM_CONFIG.mcpIdleRpm + (mcp.telegraph * 10);

    const side = getMcpSide(mcpKey);
    const rpm = mcp.targetRpm;
    const label = val == 0 ? 'STOP' : val <= 25 ? `DEVAGAR - ${rpm} RPM` : val <= 75 ? `AVANTE - ${rpm} RPM` : `AV. TODA - ${rpm} RPM`;

    document.getElementById(`telegraph-${side}-val`).innerText = label;
    renderView();
}

function toggleClutch(mcpKey) {
    const mcp = gameState.machinery[mcpKey];
    if (mcp.status !== 'RUNNING') return;

    if (mcp.rpm > 650 || mcp.telegraph > 0) {
        triggerAlarm("INTERLOCK (CAIXA REDUTORA): REDUZA O TELÉGRAFO PARA IDLE ANTES DE ACOPLAR!");
        return;
    }

    mcp.clutchEngaged = !mcp.clutchEngaged;
    renderView();
}

function winchControl(dir) {
    const winch = gameState.machinery.winch;
    const anyPress = MCP_KEYS.some(key => gameState.machinery[key].hydraulicPressure > 0);

    if (dir !== 'STOP' && !anyPress) return triggerAlarm("INTERLOCK: SEM PRESSÃO HIDRÁULICA - INICIAR MCP!");

    winch.isActive = dir !== 'STOP';
    winch.direction = dir;
    closeModal();
    renderView();

    if (dir !== 'STOP') openModal('winch', 'winch');
}

function toggleChiller() {
    const chiller = gameState.machinery.chiller;

    if (!chiller.isOn && !gameState.power.isLive) return triggerAlarm("INTERLOCK: QEP SEM ENERGIA!");

    chiller.isOn = !chiller.isOn;
    renderView();
    renderModalContent();
}

function chillerTemp(delta) {
    gameState.machinery.chiller.setTemp = Math.max(16, Math.min(28, gameState.machinery.chiller.setTemp + delta));
    renderModalContent();
}

function zdAzimuth(side, val) {
    const zd = gameState.machinery[`zd_${side}`];

    if (zd.steeringHyd.vol <= 0) {
        triggerAlarm(`INTERLOCK ${zd.name}: SEM ÓLEO HIDRÁULICO DE GOVERNO!`);
        renderView();
        return;
    }

    zd.azimuth = parseInt(val);
    const valEl = document.getElementById(`ui-zd-${side}-azimuth-val`);
    if (valEl) valEl.innerText = `${val}°`;

    zd.steeringHyd.vol = Math.max(0, zd.steeringHyd.vol - SIM_CONFIG.zDriveSteeringCommandConsumption);
    renderView();
}

function handleTabSelection(targetTab) {
    if (targetTab !== 'build') {
        const leftTabs = ['bunkering', 'fuel', 'power'];
        const rightTabs = ['propulsion', 'visual3d'];

        if (leftTabs.includes(targetTab)) {
            gameState.desktopPanels.left = targetTab;
        } else if (rightTabs.includes(targetTab)) {
            gameState.desktopPanels.right = targetTab;
        }
    }

    gameState.currentTab = targetTab;
    renderView();

    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('tuglife:tabchange', {
            detail: {
                tab: targetTab,
                desktopPanels: gameState.desktopPanels
            }
        }));
    }
}

function bindEventListeners() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            handleTabSelection(btn.getAttribute('data-target'));
        });
    });

    document.getElementById('btn-connect-hose').addEventListener('click', () => {
        gameState.bunker.hoseConnected = !gameState.bunker.hoseConnected;
        if (!gameState.bunker.hoseConnected) gameState.bunker.isPumping = false;
        renderView();
    });

    document.getElementById('select-bunker-tank').addEventListener('change', (e) => {
        gameState.bunker.selectedTank = e.target.value;
        gameState.bunker.isPumping = false;
        renderView();
    });

    document.getElementById('btn-pump-bunker').addEventListener('click', () => {
        if (!gameState.bunker.hoseConnected || !gameState.bunker.selectedTank) return;
        gameState.bunker.isPumping = !gameState.bunker.isPumping;
        renderView();
    });

    document.getElementById('btn-toggle-water-panel').addEventListener('click', () => {
        toggleWaterPanel();
    });

    document.getElementById('btn-toggle-lo-drum-panel').addEventListener('click', () => {
        toggleLoDrumPanel();
    });

    document.getElementById('select-lo-drum-tank').addEventListener('change', (e) => {
        gameState.loReceiving.selectedTank = e.target.value;
        renderView();
    });

    document.getElementById('btn-receive-lo-drum').addEventListener('click', () => {
        receiveLoDrum();
    });

    ['c1', 'c2', 'c3', 'c4', 'c5', 'c6'].forEach(compartmentId => {
        const button = document.getElementById(`btn-bunker-${compartmentId}`);
        if (!button) return;

        button.addEventListener('click', () => {
            selectBunkerCompartment(compartmentId);
        });
    });

    ['truck01', 'truck02', 'truck03', 'truck04'].forEach(truckKey => {
        const truckButton = document.getElementById(`btn-${truckKey}`);
        if (!truckButton) return;

        truckButton.addEventListener('click', () => {
            selectBunkerTruck(truckKey);
        });
    });

    ['truck01', 'truck02', 'truck03', 'truck04'].forEach(truckKey => {
        const truckButton = document.getElementById(`btn-water-${truckKey}`);
        if (!truckButton) return;

        truckButton.addEventListener('click', () => {
            selectWaterTruck(truckKey);
        });
    });

    document.getElementById('btn-connect-water-hose').addEventListener('click', () => {
        gameState.waterBunkering.hoseConnected = !gameState.waterBunkering.hoseConnected;
        if (!gameState.waterBunkering.hoseConnected) gameState.waterBunkering.isPumping = false;
        renderView();
    });

    document.getElementById('select-water-tank').addEventListener('change', (e) => {
        gameState.waterBunkering.selectedTank = e.target.value;
        gameState.waterBunkering.isPumping = false;
        renderView();
    });

    document.getElementById('btn-pump-water').addEventListener('click', () => {
        if (!gameState.waterBunkering.hoseConnected || !gameState.waterBunkering.selectedTank) return;
        gameState.waterBunkering.isPumping = !gameState.waterBunkering.isPumping;
        renderView();
    });

    document.getElementById('select-transfer-source').addEventListener('change', (e) => {
        gameState.transfer.sourceTank = e.target.value;
        gameState.transfer.isPumping = false;
        renderView();
    });

    document.getElementById('select-transfer-dest').addEventListener('change', (e) => {
        gameState.transfer.destTank = e.target.value;
        gameState.transfer.isPumping = false;
        renderView();
    });

    document.getElementById('btn-pump-transfer').addEventListener('click', () => {
        if (!gameState.transfer.sourceTank || !gameState.transfer.destTank) return;
        gameState.transfer.isPumping = !gameState.transfer.isPumping;
        renderView();
    });

    document.getElementById('btn-crossfeed-valve').addEventListener('click', () => {
        gameState.transfer.crossFeedValve.isOpen = !gameState.transfer.crossFeedValve.isOpen;
        renderView();
    });

    document.getElementById('btn-transfer-tk03-purifier').addEventListener('click', () => {
        toggleTk03PurifierTransfer();
    });

    document.getElementById('btn-mca-ps-start').addEventListener('click', () => handleGenStart('mca_ps'));
    document.getElementById('btn-mca-sb-start').addEventListener('click', () => handleGenStart('mca_sb'));
    document.getElementById('btn-mca-ps-breaker').addEventListener('click', () => handleBreaker('mca_ps'));
    document.getElementById('btn-mca-sb-breaker').addEventListener('click', () => handleBreaker('mca_sb'));
    document.getElementById('btn-mca-ps-fill-carter').addEventListener('click', () => fillCarter('mca_ps'));
    document.getElementById('btn-mca-sb-fill-carter').addEventListener('click', () => fillCarter('mca_sb'));
    document.getElementById('btn-mcp-ps-fill-carter').addEventListener('click', () => fillCarter('mcp_ps'));
    document.getElementById('btn-mcp-sb-fill-carter').addEventListener('click', () => fillCarter('mcp_sb'));

    ZD_SIDES.forEach(side => {
        document.getElementById(`btn-mcp-${side}-lube`).addEventListener('click', () => toggleAuxiliary(`mcp_${side}`, 'lube'));
        document.getElementById(`btn-mcp-${side}-cool`).addEventListener('click', () => toggleAuxiliary(`mcp_${side}`, 'cool'));
        document.getElementById(`btn-mcp-${side}-start`).addEventListener('click', () => handleMcpStart(`mcp_${side}`));
        document.getElementById(`telegraph-${side}`).addEventListener('input', (e) => handleTelegraph(`mcp_${side}`, e.target.value));
        document.getElementById(`btn-clutch-${side}`).addEventListener('click', () => toggleClutch(`mcp_${side}`));
    });
}
