/**
 * Renderização do modal e da interface principal.
 */
function renderModalContent() {
    if (!gameState.modal.isOpen) return;

    const titleEl = document.getElementById('modal-title');
    const contentEl = document.getElementById('modal-content');
    let html = "";

    if (gameState.modal.type === 'manifold') {
        const doTanks = Object.entries(gameState.tanks).filter(([k, t]) => ['fo', 'fo_hdr', 'od'].includes(t.type));
        let optionsHtml = '<option value="">-- SELECIONE --</option>';
        doTanks.forEach(([k, t]) => {
            optionsHtml += `<option value="${k}" ${gameState.transfer.sourceTank === k ? 'selected' : ''}>${t.name} (${t.vol.toFixed(1)} m³)</option>`;
        });
        let destOptionsHtml = '<option value="">-- SELECIONE --</option>';
        doTanks.forEach(([k, t]) => {
            destOptionsHtml += `<option value="${k}" ${gameState.transfer.destTank === k ? 'selected' : ''}>${t.name} (${t.vol.toFixed(1)} m³)</option>`;
        });

        titleEl.innerText = 'MANIFOLD & TRANSFERÊNCIA FO';
        html = `
            <div style="font-size:0.75rem; color:#00bcd4; font-weight:bold; margin-bottom:8px; padding-bottom:4px; border-bottom:1px solid #333;">&#9981; RECEBIMENTO DE TERRA</div>
            <div class="modal-data-row"><span class="modal-data-label">Conexão:</span><span class="modal-data-value">${gameState.bunker.hoseConnected ? '<span style="color:var(--accent-green)">MANGOTE LIGADO</span>' : 'DESLIGADO'}</span></div>
            <div class="modal-data-row"><span class="modal-data-label">Caminhão:</span><span class="modal-data-value">${gameState.bunker.truckVolume.toFixed(1)} m³</span></div>
            <div class="modal-data-row"><span class="modal-data-label">Estado Bomba:</span><span class="modal-data-value" style="color:${gameState.bunker.isPumping ? 'var(--accent-orange)' : '#888'}">${gameState.bunker.isPumping ? 'A BOMBEAR' : 'PARADA'}</span></div>
            
            <div style="font-size:0.75rem; color:#ff9800; font-weight:bold; margin:16px 0 8px; padding-bottom:4px; border-bottom:1px solid #333;">&#8644; BOMBA DE TRANSFERÊNCIA DE ÓLEO DIESEL</div>
            <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:12px;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-size:0.8rem; color:#aaa;">SUCÇÃO:</span>
                    <select onchange="gameState.transfer.sourceTank = this.value; gameState.transfer.isPumping = false; renderView();" style="background:#222; color:#fff; border:1px solid #555; padding:4px; width:65%; border-radius:4px;">
                        ${optionsHtml}
                    </select>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-size:0.8rem; color:#aaa;">DESCARGA:</span>
                    <select onchange="gameState.transfer.destTank = this.value; gameState.transfer.isPumping = false; renderView();" style="background:#222; color:#fff; border:1px solid #555; padding:4px; width:65%; border-radius:4px;">
                        ${destOptionsHtml}
                    </select>
                </div>
            </div>
            <div class="modal-data-row"><span class="modal-data-label">Bba Transf. D.O.:</span><span class="modal-data-value" style="color:${gameState.transfer.isPumping ? 'var(--accent-green)' : '#888'}">${gameState.transfer.isPumping ? 'TRANSFERINDO' : 'PARADA'}</span></div>
            <button onclick="if(gameState.transfer.sourceTank && gameState.transfer.destTank && gameState.transfer.sourceTank !== gameState.transfer.destTank) { gameState.transfer.isPumping = !gameState.transfer.isPumping; renderView(); } else { alert('Selecione tanques válidos e diferentes.'); }" class="control-btn" style="margin-top:8px; padding:10px; background:${gameState.transfer.isPumping ? '#444' : 'var(--accent-orange)'};">
                ${gameState.transfer.isPumping ? 'PARAR TRANSFERÊNCIA' : 'INICIAR BOMBA D.O.'}
            </button>
        `;
    } else if (gameState.modal.type === 'tank') {
        const tk = gameState.tanks[gameState.modal.entityKey];
        const perc = ((tk.vol / tk.max) * 100).toFixed(1);
        titleEl.innerText = tk.name;
        html = `
            <div class="modal-data-row"><span class="modal-data-label">Fluído:</span><span class="modal-data-value">${tk.type.toUpperCase()}</span></div>
            <div class="modal-data-row"><span class="modal-data-label">Cap. Máxima:</span><span class="modal-data-value">${tk.max} m³</span></div>
            <div class="modal-data-row"><span class="modal-data-label">Volume Atual:</span><span class="modal-data-value" style="color:${perc >= 90 ? 'var(--accent-red)' : 'var(--accent-blue)'}">${tk.vol.toFixed(2)} m³</span></div>
            <div class="modal-data-row"><span class="modal-data-label">Nível (%):</span><span class="modal-data-value">${perc} %</span></div>
        `;
    } else if (['mcp', 'mca', 'mca-motor', 'mca-gen'].includes(gameState.modal.type)) {
        const eng = gameState.machinery[gameState.modal.entityKey];
        const statusColor = eng.status === 'RUNNING' ? 'var(--accent-green)' : 'var(--accent-red)';
        const carterPct = ((eng.carter.vol / eng.carter.max) * 100).toFixed(0);
        const carterColor = eng.carter.vol / eng.carter.max < 0.20 ? 'var(--accent-red)' : eng.carter.vol / eng.carter.max < 0.30 ? 'var(--accent-orange)' : '#ffc107';

        if (gameState.modal.type === 'mca-motor') {
            titleEl.innerText = `${eng.name} - MOTOR`;
            html = `
                <div class="modal-data-row"><span class="modal-data-label">Estado:</span><span class="modal-data-value" style="color:${statusColor}">${eng.status}</span></div>
                <div class="modal-data-row"><span class="modal-data-label">Rotação:</span><span class="modal-data-value">${eng.rpm} RPM</span></div>
                <div class="modal-data-row"><span class="modal-data-label">Pressão Óleo:</span><span class="modal-data-value">${eng.oilPress.toFixed(1)} Bar</span></div>
                <div class="modal-data-row"><span class="modal-data-label">Temp. ELC:</span><span class="modal-data-value">${eng.coolTemp.toFixed(1)} °C</span></div>
                <div class="modal-data-row"><span class="modal-data-label">Carter OL15W40:</span><span class="modal-data-value" style="color:${carterColor}">${eng.carter.vol.toFixed(3)} m³ (${carterPct}%)</span></div>
            `;
        } else if (gameState.modal.type === 'mca-gen') {
            titleEl.innerText = `${eng.name} - GERADOR`;
            html = `
                <div class="modal-data-row"><span class="modal-data-label">Estado:</span><span class="modal-data-value" style="color:${statusColor}">${eng.status}</span></div>
                <div class="modal-data-row"><span class="modal-data-label">Tensão:</span><span class="modal-data-value">${eng.v.toFixed(0)} V</span></div>
                <div class="modal-data-row"><span class="modal-data-label">Frequência:</span><span class="modal-data-value">${eng.hz.toFixed(1)} Hz</span></div>
                <div class="modal-data-row"><span class="modal-data-label">Disjuntor:</span><span class="modal-data-value" style="color:${eng.breakerClosed ? 'var(--accent-green)' : '#888'}">${eng.breakerClosed ? 'FECHADO' : 'ABERTO'}</span></div>
                <div class="modal-data-row"><span class="modal-data-label">Consumo FO:</span><span class="modal-data-value">${eng.consumption} m³/tick</span></div>
            `;
        } else if (gameState.modal.type === 'mcp') {
            titleEl.innerText = eng.name;
            html = `
                <div style="font-size:0.75rem; color:#ff9800; font-weight:bold; margin-bottom:8px; padding-bottom:4px; border-bottom:1px solid #333;">&#9881; MOTOR PRINCIPAL</div>
                <div class="modal-data-row"><span class="modal-data-label">Estado:</span><span class="modal-data-value" style="color:${statusColor}">${eng.status}</span></div>
                <div class="modal-data-row"><span class="modal-data-label">Rotação:</span><span class="modal-data-value">${eng.rpm} RPM</span></div>
                <div class="modal-data-row"><span class="modal-data-label">Pressão Óleo:</span><span class="modal-data-value">${eng.oilPress.toFixed(1)} Bar</span></div>
                <div class="modal-data-row"><span class="modal-data-label">Temp. ELC:</span><span class="modal-data-value">${eng.coolTemp.toFixed(1)} °C</span></div>
                <div class="modal-data-row"><span class="modal-data-label">Carter OL15W40:</span><span class="modal-data-value" style="color:${carterColor}">${eng.carter.vol.toFixed(3)} m³ (${carterPct}%)</span></div>
                <div class="modal-data-row"><span class="modal-data-label">BBA Pré-Lubrificação:</span><span class="modal-data-value">${eng.preLubeOn ? 'LIGADA' : 'DESLIGADA'}</span></div>
                <div class="modal-data-row"><span class="modal-data-label">Motor de Arranque:</span><span class="modal-data-value">${eng.status === 'OFF' ? 'PRONTO' : 'EM STAND-BY'}</span></div>
                <div class="modal-data-row"><span class="modal-data-label">BBA ELC / Arrefecimento:</span><span class="modal-data-value">${eng.coolingOn ? 'LIGADA' : 'DESLIGADA'}</span></div>
                <div class="modal-data-row"><span class="modal-data-label">BBA Combustível:</span><span class="modal-data-value">${gameState.tanks[eng.fuelSource].vol > 0 ? 'PRESSURIZADA' : 'SEM COMBUSTÍVEL'}</span></div>
            `;
        } else {
            titleEl.innerText = eng.name;
            html = `
                <div style="font-size:0.75rem; color:#ff9800; font-weight:bold; margin-bottom:8px; padding-bottom:4px; border-bottom:1px solid #333;">&#9881; MOTOR</div>
                <div class="modal-data-row"><span class="modal-data-label">Estado:</span><span class="modal-data-value" style="color:${statusColor}">${eng.status}</span></div>
                <div class="modal-data-row"><span class="modal-data-label">Rotação:</span><span class="modal-data-value">${eng.rpm} RPM</span></div>
                <div class="modal-data-row"><span class="modal-data-label">Pressão Óleo:</span><span class="modal-data-value">${eng.oilPress.toFixed(1)} Bar</span></div>
                <div class="modal-data-row"><span class="modal-data-label">Temp. ELC:</span><span class="modal-data-value">${eng.coolTemp.toFixed(1)} °C</span></div>
                <div class="modal-data-row"><span class="modal-data-label">Carter OL15W40:</span><span class="modal-data-value" style="color:${carterColor}">${eng.carter.vol.toFixed(3)} m³ (${carterPct}%)</span></div>
                <div style="font-size:0.75rem; color:#00bcd4; font-weight:bold; margin:10px 0 8px; padding-bottom:4px; border-bottom:1px solid #333;">&#9889; GERADOR</div>
                <div class="modal-data-row"><span class="modal-data-label">Tensão:</span><span class="modal-data-value">${eng.v.toFixed(0)} V</span></div>
                <div class="modal-data-row"><span class="modal-data-label">Frequência:</span><span class="modal-data-value">${eng.hz.toFixed(1)} Hz</span></div>
                <div class="modal-data-row"><span class="modal-data-label">Corrente:</span><span class="modal-data-value">${eng.current} A</span></div>
                <div class="modal-data-row"><span class="modal-data-label">Potência:</span><span class="modal-data-value">${eng.power.toFixed(0)} kW</span></div>
                <div class="modal-data-row"><span class="modal-data-label">Fator Potência:</span><span class="modal-data-value">${eng.powerFactor.toFixed(2)}</span></div>
                <div class="modal-data-row"><span class="modal-data-label">Disjuntor:</span><span class="modal-data-value" style="color:${eng.breakerClosed ? 'var(--accent-green)' : '#888'}">${eng.breakerClosed ? 'FECHADO' : 'ABERTO'}</span></div>
            `;
        }
    } else if (gameState.modal.type === 'stability') {
        const stability = calculateStabilityIndicators();
        const heelColor = stability.heelDirection === 'ADR' ? 'var(--accent-green)' : 'var(--accent-orange)';
        const trimColor = stability.trimDirection === 'ADR' ? 'var(--accent-green)' : 'var(--accent-orange)';

        titleEl.innerText = 'PAINEL DE BANDA E TRIM';
        html = `
            <div class="stability-grid">
                <div class="stability-card">
                    <div class="stability-value" style="color:${heelColor}">${stability.heelDeg}° ${stability.heelDirection}</div>
                    <div class="stability-label">Banda</div>
                </div>
                <div class="stability-card">
                    <div class="stability-value" style="color:${trimColor}">${stability.trimDeg}° ${stability.trimDirection}</div>
                    <div class="stability-label">Trim</div>
                </div>
            </div>
            <div style="margin-top:14px;">
                <div class="modal-data-row"><span class="modal-data-label">Volume BB:</span><span class="modal-data-value">${stability.portVolume} m³</span></div>
                <div class="modal-data-row"><span class="modal-data-label">Volume BE:</span><span class="modal-data-value">${stability.starboardVolume} m³</span></div>
                <div class="modal-data-row"><span class="modal-data-label">Volume Proa:</span><span class="modal-data-value">${stability.foreVolume} m³</span></div>
                <div class="modal-data-row"><span class="modal-data-label">Volume Popa:</span><span class="modal-data-value">${stability.aftVolume} m³</span></div>
            </div>
        `;
    } else if (gameState.modal.type === 'zdrive') {
        const zd = gameState.machinery[gameState.modal.entityKey];
        const side = gameState.modal.entityKey.endsWith('_ps') ? 'ps' : 'sb';
        const airSystem = getAirSystemState(side);
        const activeCompressor = getAirCompressor(getActiveAirCompressorSide());
        const feedingLabel = getAirCompressorFeedingLabel();
        const gearboxPct = getPercentage(zd.gearboxLO.vol, zd.gearboxLO.max).toFixed(0);
        const steeringPct = getPercentage(zd.steeringHyd.vol, zd.steeringHyd.max).toFixed(0);

        titleEl.innerText = `${zd.name} - PROPULSOR AZIMUTAL`;
        html = `
            <div class="modal-data-row"><span class="modal-data-label">Estado:</span><span class="modal-data-value" style="color:${zd.status === 'DRIVING' ? 'var(--accent-green)' : zd.status === 'FAULT' ? 'var(--accent-red)' : '#888'}">${zd.status}</span></div>
            <div class="modal-data-row"><span class="modal-data-label">RPM Propulsor:</span><span class="modal-data-value">${zd.propRpm} RPM</span></div>
            <div class="modal-data-row"><span class="modal-data-label">Empuxo:</span><span class="modal-data-value">${zd.thrust}%</span></div>
            <div class="modal-data-row"><span class="modal-data-label">Azimute:</span><span class="modal-data-value">${zd.azimuth}°</span></div>
            <div class="modal-data-row"><span class="modal-data-label">OL150 Caixa:</span><span class="modal-data-value" style="color:${gearboxPct < 20 ? 'var(--accent-red)' : '#ffc107'}">${zd.gearboxLO.vol.toFixed(3)} m³ (${gearboxPct}%)</span></div>
            <div class="modal-data-row"><span class="modal-data-label">OH32 Governo:</span><span class="modal-data-value" style="color:${steeringPct < 20 ? 'var(--accent-red)' : '#2196f3'}">${zd.steeringHyd.vol.toFixed(3)} m³ (${steeringPct}%)</span></div>
            <div class="modal-data-row"><span class="modal-data-label">Compressor:</span><span class="modal-data-value" style="color:${activeCompressor.isRunning ? 'var(--accent-green)' : '#888'}">${feedingLabel} / ${activeCompressor.status}</span></div>
            <div class="modal-data-row"><span class="modal-data-label">Enchimento:</span><span class="modal-data-value" style="color:${activeCompressor.lastOutput > 0 ? 'var(--accent-green)' : '#888'}">${activeCompressor.lastOutput.toFixed(1)} bar/t</span></div>
            <div class="modal-data-row"><span class="modal-data-label">Garrafa de ar:</span><span class="modal-data-value" style="color:${airSystem.bottlePressure < airSystem.couplingMin ? 'var(--accent-red)' : '#90caf9'}">${airSystem.bottlePressure.toFixed(1)} bar</span></div>
            <div class="modal-data-row"><span class="modal-data-label">Caixa de controle:</span><span class="modal-data-value" style="color:${airSystem.controlPressure < airSystem.couplingMin ? 'var(--accent-red)' : 'var(--accent-green)'}">${airSystem.controlPressure.toFixed(1)} bar</span></div>
            <div class="modal-data-row"><span class="modal-data-label">Propulsor:</span><span class="modal-data-value" style="color:${zd.propState === 'TRIP' ? 'var(--accent-red)' : 'var(--accent-green)'}">${zd.propState}</span></div>
            <div class="modal-data-row"><span class="modal-data-label">Fluxo:</span><span class="modal-data-value">${zd.propFlow}</span></div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:12px;">
                <button onclick="refillZDriveFluid('${side}','gearbox')" class="control-btn" style="padding:10px; background:#1a1100; color:#ffc107;">TRANSFERIR OL150</button>
                <button onclick="refillZDriveFluid('${side}','steering')" class="control-btn" style="padding:10px; background:#0a1520; color:#2196f3;">TRANSFERIR OH32</button>
            </div>
        `;
    } else if (gameState.modal.type === 'winch') {
        const winch = gameState.machinery.winch;
        const anyPress = MCP_KEYS.some(key => gameState.machinery[key].hydraulicPressure > 0);
        const pressPS = gameState.machinery.mcp_ps.hydraulicPressure;
        const pressSB = gameState.machinery.mcp_sb.hydraulicPressure;
        const winchPct = ((winch.hydReservoir.vol / winch.hydReservoir.max) * 100).toFixed(0);
        titleEl.innerText = 'GUINCHO MANOBRA PROA';
        html = `
            <div class="modal-data-row"><span class="modal-data-label">Estado:</span><span class="modal-data-value" style="color:${winch.isActive ? 'var(--accent-orange)' : '#888'}">${winch.isActive ? winch.direction : 'PARADO'}</span></div>
            <div class="modal-data-row"><span class="modal-data-label">Press. HID BB:</span><span class="modal-data-value" style="color:${pressPS > 0 ? 'var(--accent-green)' : '#888'}">${pressPS} bar</span></div>
            <div class="modal-data-row"><span class="modal-data-label">Press. HID BE:</span><span class="modal-data-value" style="color:${pressSB > 0 ? 'var(--accent-green)' : '#888'}">${pressSB} bar</span></div>
            <div class="modal-data-row"><span class="modal-data-label">Reservatório OH32:</span><span class="modal-data-value" style="color:${winchPct < 20 ? 'var(--accent-red)' : '#2196f3'}">${winch.hydReservoir.vol.toFixed(3)} m³ (${winchPct}%)</span></div>
            <div class="modal-data-row"><span class="modal-data-label">Interlock:</span><span class="modal-data-value" style="color:${anyPress ? 'var(--accent-green)' : 'var(--accent-red)'}"> ${anyPress ? 'PRESSÃO OK' : 'SEM PRESSÃO'}</span></div>
            <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; margin-top:12px;">
                <button onclick="winchControl('COLHER')" class="control-btn" style="padding:10px; font-size:0.8rem; background:${winch.isActive && winch.direction === 'COLHER' ? 'var(--accent-green)' : '#444'}; ${!anyPress ? 'opacity:0.4;' : ''}" ${!anyPress ? 'disabled' : ''}>COLHER</button>
                <button onclick="winchControl('STOP')" class="control-btn" style="padding:10px; font-size:0.8rem; background:#444;">STOP</button>
                <button onclick="winchControl('PAGAR')" class="control-btn" style="padding:10px; font-size:0.8rem; background:${winch.isActive && winch.direction === 'PAGAR' ? 'var(--accent-orange)' : '#444'}; ${!anyPress ? 'opacity:0.4;' : ''}" ${!anyPress ? 'disabled' : ''}>PAGAR</button>
            </div>
            <button onclick="refillWinchHydraulic()" class="control-btn" style="margin-top:8px; padding:10px; background:#0a1520; color:#2196f3;">TRANSFERIR OH32 PARA GUINCHO</button>
        `;
    } else if (gameState.modal.type === 'chiller') {
        const chiller = gameState.machinery.chiller;
        titleEl.innerText = 'AR CONDICIONADO DA PROA';
        html = `
            <div class="modal-data-row"><span class="modal-data-label">Estado:</span><span class="modal-data-value" style="color:${chiller.isOn ? 'var(--accent-blue)' : '#888'}">${chiller.isOn ? 'LIGADO' : 'DESLIGADO'}</span></div>
            <div class="modal-data-row"><span class="modal-data-label">Temp. Atual:</span><span class="modal-data-value" style="color:var(--accent-blue)">${chiller.actualTemp.toFixed(1)} °C</span></div>
            <div class="modal-data-row"><span class="modal-data-label">Set-point:</span><span class="modal-data-value">${chiller.setTemp} °C</span></div>
            <div class="modal-data-row"><span class="modal-data-label">Consumo:</span><span class="modal-data-value">${chiller.isOn ? chiller.power + ' kW' : '0 kW'}</span></div>
            <div class="modal-data-row"><span class="modal-data-label">Bus:</span><span class="modal-data-value" style="color:${gameState.power.isLive ? 'var(--accent-green)' : 'var(--accent-red)'}">${gameState.power.isLive ? 'ENERGIZADO' : 'SEM ENERGIA'}</span></div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:8px;">
                <button onclick="chillerTemp(-1)" class="control-btn" style="padding:8px;">&#9660; TEMP</button>
                <button onclick="chillerTemp(+1)" class="control-btn" style="padding:8px;">&#9650; TEMP</button>
            </div>
            <button onclick="toggleChiller()" class="control-btn" style="margin-top:8px; padding:10px; background:${chiller.isOn ? 'var(--accent-blue)' : '#444'}; ${!gameState.power.isLive ? 'opacity:0.4;' : ''}" ${!gameState.power.isLive ? 'disabled' : ''}>
                ${chiller.isOn ? 'DESLIGAR AC' : 'LIGAR AC'}
            </button>
        `;
    } else if (gameState.modal.type === 'fifi') {
        const fifi = gameState.machinery.fifi;
        const subtab = gameState.modal.subtab || 'overview';
        const carterPct = getPercentage(fifi.carter.vol, fifi.carter.max).toFixed(0);
        const statusColor = fifi.engineStatus === 'RUNNING' ? 'var(--accent-green)' : '#888';
        const dischargeReady = fifi.seawaterChestOpen && fifi.shellValveOpen && fifi.monitorOpenPct > 0;
        const monitorStatus = fifi.monitorOpenPct > 0
            ? `ABERTURA ${fifi.monitorOpenPct.toFixed(0)}%`
            : fifi.monitorsCommandOpen
                ? (fifi.monitorDelaySeconds < 60 ? `TEMPORIZANDO ${60 - fifi.monitorDelaySeconds}s` : 'ABRINDO')
                : 'FECHADOS';
        titleEl.innerText = 'FIFI ONE - COMBATE A INCÊNDIO';
        const tabsHtml = `
            <div class="modal-tab-row">
                <button onclick="setModalSubtab('overview')" class="modal-tab-btn ${subtab === 'overview' ? 'active' : ''}">Visão</button>
                <button onclick="setModalSubtab('operation')" class="modal-tab-btn ${subtab === 'operation' ? 'active' : ''}">Operação</button>
                <button onclick="setModalSubtab('post')" class="modal-tab-btn ${subtab === 'post' ? 'active' : ''}">Pós-op.</button>
            </div>
        `;

        let tabContent = '';
        if (subtab === 'overview') {
            tabContent = `
                <div class="modal-data-row"><span class="modal-data-label">Motor diesel:</span><span class="modal-data-value" style="color:${statusColor}">${fifi.engineStatus}</span></div>
                <div class="modal-data-row"><span class="modal-data-label">RPM motor:</span><span class="modal-data-value">${fifi.rpm} RPM</span></div>
                <div class="modal-data-row"><span class="modal-data-label">Pressão óleo:</span><span class="modal-data-value">${fifi.oilPress.toFixed(1)} bar</span></div>
                <div class="modal-data-row"><span class="modal-data-label">Temp. motor:</span><span class="modal-data-value">${fifi.coolTemp.toFixed(1)} °C</span></div>
                <div class="modal-data-row"><span class="modal-data-label">Cárter OL15W40:</span><span class="modal-data-value" style="color:${carterPct < 30 ? 'var(--accent-red)' : '#ffc107'}">${fifi.carter.vol.toFixed(3)} m³ (${carterPct}%)</span></div>
                <div class="modal-data-row"><span class="modal-data-label">Procedimento:</span><span class="modal-data-value" style="font-size:0.82rem; color:${dischargeReady ? 'var(--accent-green)' : '#bbb'}">${dischargeReady ? 'PRONTO PARA DESCARGA' : 'ABRIR SUCÇÃO, COSTADO E CANHÃO(S)'}</span></div>
                <div class="modal-fifi-action-grid">
                    <button onclick="fillCarter('fifi')" class="control-btn" style="padding:10px; background:#1a1100; color:#ffc107;">ENCHER CARTER</button>
                    <button onclick="handleFifiStart()" class="control-btn" style="padding:10px; background:${fifi.engineStatus === 'RUNNING' ? 'var(--accent-red)' : '#444'};">${fifi.engineStatus === 'RUNNING' ? 'PARAR MOTOR' : 'PARTIR MOTOR'}</button>
                </div>
            `;
        } else if (subtab === 'operation') {
            tabContent = `
                <div class="modal-data-row"><span class="modal-data-label">Caixa de mar:</span><span class="modal-data-value" style="color:${fifi.seawaterChestOpen ? 'var(--accent-green)' : '#888'}">${fifi.seawaterChestOpen ? 'ABERTA' : 'FECHADA'}</span></div>
                <div class="modal-data-row"><span class="modal-data-label">Válvula costado:</span><span class="modal-data-value" style="color:${fifi.shellValveOpen ? 'var(--accent-green)' : '#888'}">${fifi.shellValveOpen ? 'ABERTA' : 'FECHADA'}</span></div>
                <div class="modal-data-row"><span class="modal-data-label">Canhões FiFi:</span><span class="modal-data-value" style="color:${fifi.monitorOpenPct > 0 || fifi.monitorsCommandOpen ? 'var(--accent-green)' : '#888'}">${monitorStatus}</span></div>
                <div class="modal-data-row"><span class="modal-data-label">Pressão bomba:</span><span class="modal-data-value">${fifi.pumpPressure.toFixed(1)} bar</span></div>
                <div class="modal-data-row"><span class="modal-data-label">Vazão total:</span><span class="modal-data-value">${fifi.flowRate.toFixed(0)} m³/h</span></div>
                <div class="modal-fifi-action-grid">
                    <button onclick="toggleFifiValve('seawaterChestOpen')" class="control-btn" style="padding:10px; background:${fifi.seawaterChestOpen ? 'rgba(76,175,80,0.22)' : '#333'};">CAIXA DE MAR</button>
                    <button onclick="toggleFifiValve('shellValveOpen')" class="control-btn" style="padding:10px; background:${fifi.shellValveOpen ? 'rgba(76,175,80,0.22)' : '#333'};">VÁLVULA COSTADO</button>
                    <button onclick="toggleFifiMonitors()" class="control-btn" style="padding:10px; background:${fifi.monitorsCommandOpen || fifi.monitorOpenPct > 0 ? 'rgba(76,175,80,0.22)' : '#333'}; grid-column:1 / -1;">${fifi.monitorsCommandOpen || fifi.monitorOpenPct > 0 ? 'DESLIGAR CANHÕES' : 'LIGAR CANHÕES'}</button>
                </div>
            `;
        } else {
            tabContent = `
                <div class="modal-data-row"><span class="modal-data-label">Rede adoçada:</span><span class="modal-data-value" style="color:${fifi.networkFilled ? 'var(--accent-green)' : '#888'}">${fifi.networkFilled ? 'SIM' : 'NÃO'}</span></div>
                <div class="modal-data-row"><span class="modal-data-label">Encher rede:</span><span class="modal-data-value">${fifi.sweeteningProgress.toFixed(0)}%</span></div>
                <div class="modal-data-row"><span class="modal-data-label">Motor parado:</span><span class="modal-data-value" style="color:${fifi.engineStatus === 'OFF' ? 'var(--accent-green)' : '#888'}">${fifi.engineStatus === 'OFF' ? 'SIM' : 'NÃO'}</span></div>
                <div class="modal-data-row"><span class="modal-data-label">Caixa de mar:</span><span class="modal-data-value" style="color:${!fifi.seawaterChestOpen ? 'var(--accent-green)' : '#888'}">${fifi.seawaterChestOpen ? 'ABERTA' : 'FECHADA'}</span></div>
                <div class="modal-data-row"><span class="modal-data-label">Pós-operação:</span><span class="modal-data-value" style="font-size:0.82rem;">Parar motor, fechar caixa de mar e adoçar a rede.</span></div>
                <div class="modal-fifi-action-grid">
                    <button onclick="startFifiSweetening()" class="control-btn" style="padding:10px; background:${fifi.sweeteningActive ? 'rgba(0,188,212,0.22)' : '#333'}; grid-column:1 / -1;">${fifi.sweeteningActive ? 'ADOÇANDO REDE' : 'ADOÇAR E ENCHER REDE'}</button>
                </div>
            `;
        }

        html = `${tabsHtml}${tabContent}`;
    }

    contentEl.innerHTML = html;
}

function renderView() {
    const mainDisplay = document.getElementById('main-display');
    const isDesktopOps = window.matchMedia('(min-width: 1280px), (min-width: 900px) and (orientation: landscape)').matches;
    const selectedScreenId = `screen-${gameState.currentTab}`;

    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.toggle('active', btn.getAttribute('data-target') === gameState.currentTab));
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active', 'desktop-core', 'desktop-side-panel', 'desktop-side-left', 'desktop-side-right');
    });

    mainDisplay.classList.toggle('desktop-layout', isDesktopOps);

    if (isDesktopOps) {
        const buildScreen = document.getElementById('screen-build');
        buildScreen.classList.add('active', 'desktop-core');

        ['left', 'right'].forEach(side => {
            const panelTab = gameState.desktopPanels[side];
            if (!panelTab || panelTab === 'build') return;

            const panelScreen = document.getElementById(`screen-${panelTab}`);
            if (!panelScreen) return;

            panelScreen.classList.add('active', 'desktop-side-panel', side === 'left' ? 'desktop-side-left' : 'desktop-side-right');
        });
    } else {
        const activeScreen = document.getElementById(selectedScreenId);
        if (activeScreen) {
            activeScreen.classList.add('active');
        }
    }

    document.querySelectorAll('.drawer-tab-btn').forEach((button) => {
        const screenKey = button.getAttribute('data-screen');
        const tabKey = button.getAttribute('data-tab');
        const isActive = gameState.drawerTabs && gameState.drawerTabs[screenKey] === tabKey;
        button.classList.toggle('active', isActive);
    });

    document.querySelectorAll('.drawer-tab-panel').forEach((panel) => {
        const screenKey = panel.getAttribute('data-screen');
        const tabKey = panel.getAttribute('data-tab');
        panel.style.display = gameState.drawerTabs && gameState.drawerTabs[screenKey] === tabKey ? '' : 'none';
    });

    syncBunkerTruckVolume();
    syncWaterTruckVolume();

    const alarmBanner = document.getElementById('global-alarm-banner');
    if (gameState.isAlarmActive) {
        alarmBanner.style.display = 'block';
        alarmBanner.innerText = `ALARME: ${gameState.activeAlarmMessage}`;
    } else {
        alarmBanner.style.display = 'none';
    }

    document.getElementById('ui-truck-vol').innerText = gameState.bunker.truckVolume.toFixed(1);
    document.getElementById('ui-truck-label').innerText = getSelectedBunkerTruck()?.label || 'Caminhao';
    ['truck01', 'truck02', 'truck03', 'truck04'].forEach(truckKey => {
        const truckButton = document.getElementById(`btn-${truckKey}`);
        if (!truckButton) return;
        truckButton.classList.toggle('active', gameState.bunker.selectedTruck === truckKey);
    });
    getBunkerCompartments().forEach(compartment => {
        const button = document.getElementById(`btn-bunker-${compartment.id}`);
        const valueEl = document.getElementById(`ui-bunker-${compartment.id}`);
        if (!button || !valueEl) return;

        valueEl.innerText = `${compartment.vol.toFixed(1)} m³`;
        button.classList.toggle('active', gameState.bunker.selectedCompartment === compartment.id);
        button.disabled = compartment.vol <= 0;
    });

    const selectedCompartment = getBunkerCompartments().find(item => item.id === gameState.bunker.selectedCompartment) || getBunkerCompartments()[0];
    if (selectedCompartment) {
        document.getElementById('ui-bunker-compartment-label').innerText = selectedCompartment.label;
        document.getElementById('ui-bunker-compartment-vol').innerText = `${selectedCompartment.vol.toFixed(1)} m³`;
    }

    if (gameState.bunker.hoseConnected) {
        document.getElementById('bunker-controls').style.display = 'block';
        document.getElementById('btn-connect-hose').classList.add('active');
    } else {
        document.getElementById('bunker-controls').style.display = 'none';
        document.getElementById('btn-connect-hose').classList.remove('active');
    }

    document.getElementById('btn-pump-bunker').disabled = !gameState.bunker.selectedTank || !selectedCompartment || selectedCompartment.vol <= 0;
    document.getElementById('btn-pump-bunker').innerText = gameState.bunker.isPumping ? 'BOMBEANDO DO COMPARTIMENTO' : 'INICIAR BOMBA';
    document.getElementById('ui-water-truck-vol').innerText = gameState.waterBunkering.truckVolume.toFixed(1);
    document.getElementById('ui-water-truck-label').innerText = getSelectedWaterTruck()?.label || 'Caminhao';
    document.getElementById('ui-water-hydrometer').innerText = `${gameState.waterBunkering.hydrometer.toFixed(2)} m³`;
    document.getElementById('ui-water-flow').innerText = `${gameState.waterBunkering.flowRate.toFixed(2)} m³/t`;
    ['truck01', 'truck02', 'truck03', 'truck04'].forEach(truckKey => {
        const truckButton = document.getElementById(`btn-water-${truckKey}`);
        if (!truckButton) return;
        truckButton.classList.toggle('active', gameState.waterBunkering.selectedTruck === truckKey);
    });
    document.getElementById('lo-drum-panel').style.display = gameState.drawerTabs.bunkering === 'drums' ? 'block' : 'none';
    document.getElementById('btn-toggle-lo-drum-panel').classList.toggle('active', gameState.loReceiving.panelOpen);
    document.getElementById('btn-toggle-lo-drum-panel').innerText = gameState.loReceiving.panelOpen ? 'OCULTAR RECEBIMENTO DE OL' : 'RECEBIMENTO DE OL POR TAMBOR 200L';
    document.getElementById('ui-lo-drum-vol').innerText = `${gameState.loReceiving.drumVolume.toFixed(2)} m³`;
    document.getElementById('ui-lo-drums-available').innerText = `${gameState.loReceiving.drumsAvailable}`;
    document.getElementById('select-lo-drum-tank').value = gameState.loReceiving.selectedTank;
    const selectedLoTank = gameState.tanks[gameState.loReceiving.selectedTank];
    document.getElementById('btn-receive-lo-drum').disabled = !selectedLoTank || gameState.loReceiving.drumsAvailable <= 0 || selectedLoTank.vol >= selectedLoTank.max;
    document.getElementById('water-panel').style.display = gameState.drawerTabs.bunkering === 'water' ? 'block' : 'none';
    document.getElementById('btn-toggle-water-panel').classList.toggle('active', gameState.waterBunkering.panelOpen);
    document.getElementById('btn-toggle-water-panel').innerText = gameState.waterBunkering.panelOpen ? 'OCULTAR PAINEL DE ÁGUA' : 'PAINEL DE RECEBIMENTO DE ÁGUA';
    if (gameState.waterBunkering.hoseConnected) {
        document.getElementById('water-controls').style.display = 'block';
        document.getElementById('btn-connect-water-hose').classList.add('active');
    } else {
        document.getElementById('water-controls').style.display = 'none';
        document.getElementById('btn-connect-water-hose').classList.remove('active');
    }
    document.getElementById('btn-pump-water').disabled = !gameState.waterBunkering.selectedTank || gameState.waterBunkering.truckVolume <= 0;
    document.getElementById('btn-pump-water').classList.toggle('pump-on', gameState.waterBunkering.isPumping);
    document.getElementById('btn-pump-water').innerText = gameState.waterBunkering.isPumping ? 'BOMBEANDO ÁGUA' : 'INICIAR BOMBA DE ÁGUA';
    document.getElementById('btn-pump-transfer').disabled = !(gameState.transfer.sourceTank && gameState.transfer.destTank);
    document.getElementById('btn-pump-transfer').innerText = gameState.transfer.isPumping ? 'PURIFICADOR OD - A PURIFICAR' : 'PURIFICADOR OD - INICIAR';
    document.getElementById('btn-pump-bunker').classList.toggle('pump-on', gameState.bunker.isPumping);
    document.getElementById('btn-pump-transfer').classList.toggle('pump-on', gameState.transfer.isPumping);

    ['LOW', 'MED', 'HIGH'].forEach(mode => {
        const button = document.getElementById(`btn-flow-${mode.toLowerCase()}`);
        if (button) button.classList.toggle('active', gameState.transfer.flowRateMode === mode);
    });

    ['mcp_ps', 'mcp_sb', 'mca_ps', 'mca_sb'].forEach(engine => {
        const suc = document.getElementById(`sel-${engine}-suction`);
        const ret = document.getElementById(`sel-${engine}-return`);
        if (suc) suc.value = gameState.machinery[engine].fuelSource;
        if (ret) ret.value = gameState.machinery[engine].fuelReturn;
    });

    const cfOpen = gameState.transfer.crossFeedValve.isOpen;
    document.getElementById('btn-crossfeed-valve').innerText = cfOpen ? 'FECHAR VÁLVULA CROSS-FEED' : 'ABRIR VÁLVULA CROSS-FEED';
    document.getElementById('btn-crossfeed-valve').classList.toggle('active', cfOpen);
    document.getElementById('ui-crossfeed-status').innerText = cfOpen ? 'ABERTA' : 'FECHADA';
    document.getElementById('ui-crossfeed-status').style.color = cfOpen ? 'var(--accent-green)' : '#888';

    const tk03p = gameState.tanks.tk03;
    const tk03Pct2 = (tk03p.vol / tk03p.max) * 100;
    document.getElementById('ui-tk03-bar').style.width = `${Math.min(tk03Pct2, 100).toFixed(1)}%`;
    document.getElementById('ui-tk03-bar').style.background = tk03Pct2 >= 80 ? 'var(--accent-red)' : tk03Pct2 >= 50 ? 'var(--accent-orange)' : 'var(--accent-green)';
    document.getElementById('ui-tk03-vol').innerText = `${tk03p.vol.toFixed(2)} m³`;
    document.getElementById('ui-tk03-pct').innerText = `${tk03Pct2.toFixed(1)}%`;
    document.getElementById('ui-tk03-alarm-badge').style.display = tk03Pct2 >= 50 ? 'inline-block' : 'none';
    const tk03TransferBtn = document.getElementById('btn-transfer-tk03-purifier');
    const tkCentralOd = gameState.tanks.tk_od_center;
    const tk03TransferDest = ['tk04', 'tk05'].includes(gameState.transfer.destTank) ? gameState.transfer.destTank : 'tk04';
    const tk03TransferDestName = tk03TransferDest === 'tk04' ? 'HDR 04' : 'HDR 05';
    const tk03PurifierActive = gameState.transfer.isPumping && gameState.transfer.sourceTank === 'tk03' && ['tk04', 'tk05'].includes(gameState.transfer.destTank);
    const gravityAvailable = tk03p.vol > 0 && tkCentralOd.vol < tkCentralOd.max;
    const gravityBlockedByCentral = tk03p.vol > 0 && tkCentralOd.vol >= tkCentralOd.max;
    const gravityStatus = gravityAvailable
        ? 'EM CURSO PARA TK 08'
        : gravityBlockedByCentral
            ? 'BLOQUEADA - TK 08 CHEIO'
            : 'SEM VOLUME';
    tk03TransferBtn.innerText = tk03PurifierActive ? `PARAR TRANSFERÊNCIA PARA ${tk03TransferDestName}` : `TRANSFERIR TK03 PARA ${tk03TransferDestName}`;
    tk03TransferBtn.classList.toggle('pump-on', tk03PurifierActive);
    document.getElementById('ui-tk03-gravity-status').innerText = gravityStatus;
    document.getElementById('ui-tk03-gravity-status').style.color = gravityAvailable ? 'var(--accent-green)' : gravityBlockedByCentral ? 'var(--accent-red)' : '#888';
    document.getElementById('ui-tk03-gravity-rate').innerText = `${gravityAvailable ? '0.08' : '0.00'} m³/t`;
    document.getElementById('ui-tk03-central-vol').innerText = tkCentralOd.vol.toFixed(2);
    document.getElementById('ui-tk03-gravity-line').innerText = gravityAvailable ? 'ALINHADA' : gravityBlockedByCentral ? 'SATURADA' : 'PRONTA';
    document.getElementById('ui-tk03-gravity-line').style.color = gravityAvailable ? 'var(--accent-green)' : gravityBlockedByCentral ? 'var(--accent-red)' : '#90caf9';

    const busStatus = document.getElementById('ui-busbar-status');
    if (gameState.power.isLive) {
        busStatus.className = 'busbar-status live';
        busStatus.innerText = `LIVE BUS (440V) - ${gameState.power.connectedGenerators} MCA`;
    } else {
        busStatus.className = 'busbar-status dead';
        busStatus.innerText = "DEAD BUS (0V)";
    }

    MCA_KEYS.forEach(genKey => {
        const gen = gameState.machinery[genKey];
        const prefix = genKey === 'mca_ps' ? 'ps' : 'sb';
        const color = gen.status === 'RUNNING' ? 'var(--accent-green)' : '#888';
        const acPct = (gen.carter.vol / gen.carter.max) * 100;
        const acColor = acPct < 20 ? 'var(--accent-red)' : acPct < 30 ? 'var(--accent-orange)' : '#ffc107';

        const statusBadge = document.getElementById(`ui-mca-${prefix}-status`);
        statusBadge.innerText = gen.status;
        statusBadge.className = gen.status === 'RUNNING' ? 'gen-status running' : (gen.status === 'STARTING' ? 'gen-status starting' : 'gen-status');

        document.getElementById(`ui-mca-${prefix}-rpm-meter`).innerText = gen.rpm;
        document.getElementById(`ui-mca-${prefix}-rpm-meter`).style.color = color;
        document.getElementById(`ui-mca-${prefix}-v-meter`).innerText = gen.v.toFixed(0);
        document.getElementById(`ui-mca-${prefix}-v-meter`).style.color = color;
        document.getElementById(`ui-mca-${prefix}-hz-meter`).innerText = gen.hz.toFixed(1);
        document.getElementById(`ui-mca-${prefix}-hz-meter`).style.color = color;

        document.getElementById(`ui-mca-${prefix}-carter-val`).innerText = gen.carter.vol.toFixed(3);
        document.getElementById(`ui-mca-${prefix}-carter-val`).style.color = acColor;
        document.getElementById(`ui-mca-${prefix}-carter-pct`).innerText = `${acPct.toFixed(0)}%`;
        document.getElementById(`ui-mca-${prefix}-carter-pct`).style.color = acColor;
        document.getElementById(`ui-mca-${prefix}-carter-bar`).style.height = `${Math.min(acPct, 100)}%`;
        document.getElementById(`ui-mca-${prefix}-carter-bar2`).style.height = `${Math.min(acPct, 100)}%`;
        document.getElementById(`btn-mca-${prefix}-fill-carter`).disabled = gen.status === 'RUNNING';
        document.getElementById(`ui-mca-${prefix}-oil-meter`).innerText = gen.oilPress.toFixed(1);
        document.getElementById(`ui-mca-${prefix}-oil-meter`).style.color = color;
        document.getElementById(`ui-mca-${prefix}-pf-meter`).innerText = gen.status === 'RUNNING' ? gen.powerFactor.toFixed(2) : '0.00';
        document.getElementById(`ui-mca-${prefix}-pf-meter`).style.color = color;
        document.getElementById(`ui-mca-${prefix}-kw-meter`).innerText = gen.status === 'RUNNING' ? gen.power.toFixed(0) : '0';
        document.getElementById(`ui-mca-${prefix}-kw-meter`).style.color = color;
        document.getElementById(`ui-mca-${prefix}-a-meter`).innerText = gen.status === 'RUNNING' ? gen.current : '0';
        document.getElementById(`ui-mca-${prefix}-a-meter`).style.color = color;

        const btnStart = document.getElementById(`btn-mca-${prefix}-start`);
        btnStart.innerText = gen.status !== 'OFF' ? "PARAR" : "ARRANQUE";
        btnStart.classList.toggle('active', gen.status !== 'OFF');

        const btnBreaker = document.getElementById(`btn-mca-${prefix}-breaker`);
        btnBreaker.disabled = gen.status !== 'RUNNING';
        btnBreaker.innerText = gen.breakerClosed ? "DISJUNTOR: FECHADO" : "DISJUNTOR: ABERTO";
        btnBreaker.className = gen.breakerClosed ? "breaker-btn closed" : "breaker-btn";
    });



    const fifi = gameState.machinery.fifi;


    const threeDPanel = document.querySelector('#screen-visual3d .three-d-panel');
    if (threeDPanel) {
        threeDPanel.classList.toggle('three-d-config-open', gameState.drawerTabs.visual3d !== 'scene');
    }
    const drivePanel = document.getElementById('three-d-drive-panel');
    const anchorPanel = document.getElementById('three-d-anchor-panel');
    if (drivePanel) drivePanel.style.display = gameState.drawerTabs.visual3d === 'drive' ? 'block' : 'none';
    if (anchorPanel) anchorPanel.style.display = gameState.drawerTabs.visual3d === 'anchor' ? 'block' : 'none';

    const airPlant = getAirCompressorPlant();
    const activeAirSide = getActiveAirCompressorSide();
    const airPsCompressor = getAirCompressor('ps');
    const airSbCompressor = getAirCompressor('sb');
    const activeAirCompressor = getAirCompressor(activeAirSide);
    const airAutoState = airPlant.mode === 'AUTO' ? 'AUTOMÁTICO' : airPlant.mode;

    const propulsionAirPanel = document.getElementById('propulsion-air-panel');
    if (propulsionAirPanel) propulsionAirPanel.style.display = gameState.drawerTabs.propulsion === 'air_system' ? 'block' : 'none';
    const activeCompressorLabel = document.getElementById('ui-air-active-compressor');
    if (activeCompressorLabel) activeCompressorLabel.innerText = activeAirSide === 'ps' ? 'COMPRESSOR BB' : 'COMPRESSOR BE';
    const airPlantModeLabel = document.getElementById('ui-air-plant-mode');
    if (airPlantModeLabel) airPlantModeLabel.innerText = airAutoState;
    const airPlantStatus = document.getElementById('ui-air-plant-status');
    if (airPlantStatus) {
        airPlantStatus.innerText = !gameState.power.isLive
            ? 'QEP DESENERGIZADO'
            : activeAirCompressor.health === 'FAULT'
                ? 'FALHA / CONTINGÊNCIA'
                : airPsCompressor.isRunning || airSbCompressor.isRunning
                    ? 'EM CARGA'
                    : 'EM ESPERA';
        airPlantStatus.style.color = !gameState.power.isLive
            ? 'var(--accent-orange)'
            : activeAirCompressor.health === 'FAULT'
                ? 'var(--accent-red)'
                : airPsCompressor.isRunning || airSbCompressor.isRunning
                    ? 'var(--accent-green)'
                    : '#888';
    }
    const btnAirPsDuty = document.getElementById('btn-air-ps-duty');
    const btnAirSbDuty = document.getElementById('btn-air-sb-duty');
    if (btnAirPsDuty) btnAirPsDuty.className = activeAirSide === 'ps' ? 'aux-btn active' : 'aux-btn';
    if (btnAirSbDuty) btnAirSbDuty.className = activeAirSide === 'sb' ? 'aux-btn active' : 'aux-btn';
    const uiAirPsDuty = document.getElementById('ui-air-ps-duty');
    const uiAirSbDuty = document.getElementById('ui-air-sb-duty');
    if (uiAirPsDuty) {
        uiAirPsDuty.innerText = getAirCompressorStatusLabel(airPsCompressor);
        uiAirPsDuty.style.color = airPsCompressor.health === 'FAULT' ? 'var(--accent-red)' : airPsCompressor.isRunning ? 'var(--accent-green)' : activeAirSide === 'ps' ? '#90caf9' : '#888';
    }
    if (uiAirSbDuty) {
        uiAirSbDuty.innerText = getAirCompressorStatusLabel(airSbCompressor);
        uiAirSbDuty.style.color = airSbCompressor.health === 'FAULT' ? 'var(--accent-red)' : airSbCompressor.isRunning ? 'var(--accent-green)' : activeAirSide === 'sb' ? '#90caf9' : '#888';
    }
    const airPlantFillRate = document.getElementById('ui-air-fill-rate');
    if (airPlantFillRate) airPlantFillRate.innerText = `${activeAirCompressor.lastOutput.toFixed(1)} bar/t`;
    const airPlantAlert = document.getElementById('ui-air-alert');
    if (airPlantAlert) {
        const minBottle = Math.min(getAirSystemState('ps').bottlePressure, getAirSystemState('sb').bottlePressure);
        const isCharging = activeAirCompressor.isRunning && activeAirCompressor.lastOutput > 0;
        const hasNormalPressure = minBottle >= airPlant.cutOut;

        if (isCharging) {
            airPlantAlert.innerText = 'ENCHENDO';
            airPlantAlert.style.color = 'var(--accent-orange)';
        } else if (hasNormalPressure) {
            airPlantAlert.innerText = 'PRESSÃO NORMAL';
            airPlantAlert.style.color = 'var(--accent-green)';
        } else {
            airPlantAlert.innerText = 'STANDBY';
            airPlantAlert.style.color = '#90caf9';
        }
    }

    ZD_SIDES.forEach(side => {
        const mcp = gameState.machinery[`mcp_${side}`];
        const zd = gameState.machinery[`zd_${side}`];
        const airSystem = getAirSystemState(side);
        const feedLabel = getAirCompressorFeedingLabel();
        const mcpColor = mcp.status === 'RUNNING' ? 'var(--accent-green)' : '#888';
        const mcPct = (mcp.carter.vol / mcp.carter.max) * 100;
        const mcColor = mcPct < 20 ? 'var(--accent-red)' : mcPct < 30 ? 'var(--accent-orange)' : '#ffc107';
        const zdColor = zd.status === 'DRIVING' ? 'var(--accent-green)' : '#888';
        const gboxPct = (zd.gearboxLO.vol / zd.gearboxLO.max) * 100;
        const steerPct = (zd.steeringHyd.vol / zd.steeringHyd.max) * 100;
        const airReady = airSystem.controlPressure >= airSystem.couplingMin;

        document.getElementById(`ui-mcp-${side}-status`).innerText = mcp.status;
        document.getElementById(`ui-mcp-${side}-status`).className = mcp.status === 'RUNNING' ? 'gen-status running' : (mcp.status === 'OFF' ? 'gen-status' : 'gen-status error');
        document.getElementById(`btn-mcp-${side}-lube`).className = mcp.preLubeOn ? 'aux-btn active' : 'aux-btn';
        document.getElementById(`btn-mcp-${side}-cool`).className = mcp.coolingOn ? 'aux-btn active' : 'aux-btn';
        document.getElementById(`ui-mcp-${side}-rpm`).innerText = mcp.rpm;
        document.getElementById(`ui-mcp-${side}-rpm`).style.color = mcpColor;
        document.getElementById(`ui-mcp-${side}-oil`).innerText = mcp.oilPress.toFixed(1);
        document.getElementById(`ui-mcp-${side}-oil`).style.color = mcp.oilPress < 1 ? '#888' : (mcp.oilPress < 4 ? 'var(--accent-orange)' : 'var(--accent-green)');
        document.getElementById(`ui-mcp-${side}-temp`).innerText = mcp.coolTemp.toFixed(0);
        document.getElementById(`ui-mcp-${side}-temp`).style.color = mcp.coolTemp > 95 ? 'var(--accent-red)' : mcp.coolTemp > 85 ? 'var(--accent-orange)' : mcpColor;
        document.getElementById(`ui-mcp-${side}-carter-val`).innerText = mcp.carter.vol.toFixed(3);
        document.getElementById(`ui-mcp-${side}-carter-val`).style.color = mcColor;
        document.getElementById(`ui-mcp-${side}-carter-pct`).innerText = `${mcPct.toFixed(0)}%`;
        document.getElementById(`ui-mcp-${side}-carter-pct`).style.color = mcColor;
        document.getElementById(`ui-mcp-${side}-carter-bar`).style.height = `${Math.min(mcPct, 100)}%`;
        document.getElementById(`ui-mcp-${side}-carter-bar2`).style.height = `${Math.min(mcPct, 100)}%`;
        document.getElementById(`btn-mcp-${side}-fill-carter`).disabled = mcp.status === 'RUNNING';

        const btnStart = document.getElementById(`btn-mcp-${side}-start`);
        btnStart.disabled = !(mcp.preLubeOn && mcp.coolingOn && gameState.tanks[mcp.fuelSource].vol > 0 && (mcp.carter.vol / mcp.carter.max) >= 0.30);
        btnStart.innerText = mcp.status === 'RUNNING' ? "PARAR MCP" : "PARTIR MCP";
        btnStart.style.backgroundColor = mcp.status === 'RUNNING' ? 'var(--accent-red)' : '';

        const telegraphSlider = document.getElementById(`telegraph-${side}`);
        telegraphSlider.disabled = mcp.status !== 'RUNNING';
        telegraphSlider.value = mcp.telegraph;
        if (mcp.status !== 'RUNNING') document.getElementById(`telegraph-${side}-val`).innerText = 'STOP';

        const clutchButton = document.getElementById(`btn-clutch-${side}`);
        clutchButton.disabled = mcp.status !== 'RUNNING' || (!mcp.clutchEngaged && !airReady);
        if (mcp.clutchEngaged) {
            clutchButton.innerText = "DESACOPLAR Z-DRIVE";
            clutchButton.classList.add('engaged');
        } else if (!airReady) {
            clutchButton.innerText = `AGUARDANDO AR (${airSystem.controlPressure.toFixed(1)} BAR)`;
            clutchButton.classList.remove('engaged');
        } else {
            clutchButton.innerText = "ENGAGE CLUTCH (ACOPLAR Z-DRIVE)";
            clutchButton.classList.remove('engaged');
        }

        document.getElementById(`ui-air-${side}-comp`).innerText = feedLabel;
        document.getElementById(`ui-air-${side}-comp`).style.color = '#90caf9';
        document.getElementById(`ui-air-${side}-bottle`).innerText = airSystem.bottlePressure.toFixed(1);
        document.getElementById(`ui-air-${side}-bottle`).style.color = airSystem.bottlePressure < airSystem.couplingMin ? 'var(--accent-red)' : '#90caf9';
        document.getElementById(`ui-air-${side}-box`).innerText = airSystem.controlPressure.toFixed(1);
        document.getElementById(`ui-air-${side}-box`).style.color = airReady ? 'var(--accent-green)' : 'var(--accent-red)';
        document.getElementById(`ui-air-${side}-control`).innerText = `${airSystem.controlPressure.toFixed(1)} bar`;
        const airStateEl = document.getElementById(`ui-air-${side}-comp-state`);
        airStateEl.innerText = `${feedLabel} / ${getAirControlStateLabel(airSystem)}`;
        airStateEl.style.background = airReady ? 'rgba(76,175,80,0.18)' : 'rgba(244,67,54,0.18)';
        airStateEl.style.color = airReady ? 'var(--accent-green)' : 'var(--accent-red)';

        document.getElementById(`ui-mcp-${side}-hyd-press`).innerText = `${mcp.hydraulicPressure} bar`;
        const hydStatusEl = document.getElementById(`ui-mcp-${side}-hyd-status`);
        hydStatusEl.innerText = getHydraulicPumpState(mcp);
        hydStatusEl.style.background = mcp.hydraulicPressure > 0 ? 'rgba(33,150,243,0.2)' : '#333';
        hydStatusEl.style.color = mcp.hydraulicPressure > 0 ? '#2196f3' : '#888';

        document.getElementById(`ui-zd-${side}-prop-rpm`).innerText = zd.propRpm;
        document.getElementById(`ui-zd-${side}-prop-rpm`).style.color = zdColor;
        document.getElementById(`ui-zd-${side}-thrust`).innerText = zd.thrust;
        document.getElementById(`ui-zd-${side}-thrust`).style.color = zd.thrust > 0 ? 'var(--accent-orange)' : '#888';
        document.getElementById(`ui-zd-${side}-az-meter`).innerText = `${zd.azimuth}°`;
        document.getElementById(`ui-zd-${side}-azimuth-val`).innerText = `${zd.azimuth}°`;
        document.getElementById(`ui-zd-${side}-prop-state`).innerText = zd.propState;
        document.getElementById(`ui-zd-${side}-prop-state`).style.color = zd.propState === 'TRIP' ? 'var(--accent-red)' : '#4caf50';
        document.getElementById(`ui-zd-${side}-prop-flow`).innerText = zd.propFlow;
        document.getElementById(`ui-zd-${side}-prop-disc`).classList.toggle('spin', zd.propRpm > 0);

        const zdStatusEl = document.getElementById(`ui-zd-${side}-status`);
        zdStatusEl.innerText = zd.status;
        zdStatusEl.className = zd.status === 'DRIVING' ? 'gen-status running' : zd.status === 'ENGAGED' ? 'gen-status starting' : zd.status === 'FAULT' ? 'gen-status error' : 'gen-status';

        document.getElementById(`ui-zd-${side}-gbox-lo`).innerText = `${gboxPct.toFixed(0)}%`;
        document.getElementById(`ui-zd-${side}-gbox-lo`).style.color = gboxPct < 20 ? 'var(--accent-red)' : gboxPct < 40 ? 'var(--accent-orange)' : '#ffc107';
        document.getElementById(`ui-zd-${side}-steer-hyd`).innerText = `${steerPct.toFixed(0)}%`;
        document.getElementById(`ui-zd-${side}-steer-hyd`).style.color = steerPct < 20 ? 'var(--accent-red)' : '#2196f3';

        const zdSlider = document.getElementById(`azimuth-${side}`);
        zdSlider.disabled = !mcp.clutchEngaged || zd.steeringHyd.vol <= 0;
        zdSlider.value = zd.azimuth;




    });

    // Safety & Ventilation Rendering
    let anyVentOn = false;
    Object.keys(gameState.safety.ventilation).forEach(fanKey => {
        const fan = gameState.safety.ventilation[fanKey];
        if (fan.isOn) anyVentOn = true;
        
        // As keys no state sao: supply_ps
        // No HTML, o botão é btn-vent-ps-supply, e a ui-fan e ui-flap sao supply-ps
        const parts = fanKey.split('_'); // [supply, ps]
        const btnId = `btn-vent-${parts[1]}-${parts[0]}`;
        const suffix = `${parts[0]}-${parts[1]}`;
        
        const btn = document.getElementById(btnId);
        if (btn) {
            btn.classList.toggle('pump-on', fan.isOn);
            btn.style.color = fan.isOn ? 'black' : 'white';
        }
        
        const fanIcon = document.getElementById(`ui-fan-${suffix}`);
        if (fanIcon) {
            if (fan.isOn) {
                fanIcon.classList.add('spinning');
                if (parts[0] === 'exhaust') {
                    fanIcon.classList.add('exhaust');
                }
            } else {
                fanIcon.classList.remove('spinning', 'exhaust');
                fanIcon.style.color = '#888';
            }
        }
        
        const flapText = document.getElementById(`ui-flap-${suffix}`);
        if (flapText) {
            flapText.innerText = fan.flapOpen ? "FLAP ABERTO" : "FLAP FECHADO";
            flapText.style.color = fan.flapOpen ? "#4caf50" : "#f44336";
        }
    });

    const ventStatus = document.getElementById('ui-safety-vent-status');
    if (ventStatus) {
        ventStatus.innerText = anyVentOn ? "ON" : "OFF";
        ventStatus.className = anyVentOn ? "gen-status running" : "gen-status";
    }

    const cgaStatus = document.getElementById('ui-cga-status');
    if (cgaStatus) {
        cgaStatus.style.display = gameState.safety.fireAlarmActive ? 'inline-block' : 'none';
        cgaStatus.className = gameState.safety.fireAlarmActive ? "gen-status blink-red" : "gen-status";
    }

    Object.keys(gameState.safety.sensors).forEach(sensorKey => {
        const sensor = gameState.safety.sensors[sensorKey];
        const uiKey = sensorKey.replace('_', '-');
        const sensorEl = document.getElementById(`ui-sensor-${uiKey}`);
        if (sensorEl) {
            sensorEl.innerText = sensor.state;
            sensorEl.style.color = sensor.state === 'NORMAL' ? '#4caf50' : '#f44336';
            if (sensor.state === 'FOGO') sensorEl.classList.add('blink-red');
            else sensorEl.classList.remove('blink-red');
        }
    });

    const triggerBtn = document.getElementById('btn-emergency-stop');
    if (triggerBtn) {
        if (gameState.safety.emergencyStopPumpsActive) {
            triggerBtn.style.background = '#4a0000';
            triggerBtn.style.color = '#ff8a80';
            triggerBtn.innerText = "⚠ PARADA ACIONADA";
        }
    }

    const fuelLever = document.getElementById('ui-fuel-lever');
    if (fuelLever) {
        if (gameState.safety.fuelCutLeverTriggered) {
            fuelLever.innerText = "P U X A D O";
            fuelLever.style.color = "#ff1744";
        }
    }

    if (typeof updatePixiView === 'function') {
        updatePixiView(gameState);
    }

    renderModalContent();
}
