/**
 * Física e evolução da simulação.
 */
function refillZDriveFluid(side, fluidType) {
    const zd = gameState.machinery[`zd_${side}`];

    if (fluidType === 'gearbox') {
        const sourceTank = gameState.tanks.tk16;
        const needed = zd.gearboxLO.max - zd.gearboxLO.vol;
        const transfer = Math.min(needed, sourceTank.vol);

        if (transfer <= 0) {
            return triggerAlarm("SEM OL150 DISPONÍVEL NO TK 16 PARA REPOSIÇÃO DO Z-DRIVE.");
        }

        zd.gearboxLO.vol += transfer;
        sourceTank.vol -= transfer;
    }

    if (fluidType === 'steering') {
        const sourceTank = gameState.tanks.tk_hyd;
        const needed = zd.steeringHyd.max - zd.steeringHyd.vol;
        const transfer = Math.min(needed, sourceTank.vol);

        if (transfer <= 0) {
            return triggerAlarm("SEM OH32 DISPONÍVEL NO TK HID PARA O GOVERNO.");
        }

        zd.steeringHyd.vol += transfer;
        sourceTank.vol -= transfer;
    }

    renderView();
}

function refillWinchHydraulic() {
    const sourceTank = gameState.tanks.tk_hyd;
    const winch = gameState.machinery.winch;
    const needed = winch.hydReservoir.max - winch.hydReservoir.vol;
    const transfer = Math.min(needed, sourceTank.vol);

    if (transfer <= 0) {
        return triggerAlarm("SEM OH32 DISPONÍVEL NO TK HID PARA O GUINCHO.");
    }

    winch.hydReservoir.vol += transfer;
    sourceTank.vol -= transfer;
    renderView();
}

function updateMcpPhysics(mcpKey) {
    const mcp = gameState.machinery[mcpKey];
    const fuelTank = gameState.tanks[mcp.fuelSource];
    let stateChanged = false;

    mcp.oilPress = mcp.preLubeOn ? (mcp.status === 'RUNNING' ? 5.5 + (mcp.rpm / 2000) : 2.0) : 0;

    if (mcp.coolingOn) {
        mcp.coolTemp = mcp.status === 'RUNNING' ? 80 + (mcp.telegraph / 10) : 35;
    } else {
        mcp.coolTemp = mcp.status === 'RUNNING' ? mcp.coolTemp + 5 : (mcp.coolTemp > 30 ? mcp.coolTemp - 2 : 30);
    }

    if (mcp.status === 'RUNNING') {
        if (!mcp.preLubeOn || !mcp.coolingOn) {
            mcp.status = 'OFF';
            mcp.targetRpm = 0;
            mcp.telegraph = 0;
            mcp.clutchEngaged = false;
            triggerAlarm(`TRIP ${mcp.name}: PERDA DE LUBRIFICAÇÃO OU ÁGUA!`);
            stateChanged = true;
        } else if (fuelTank.vol <= 0) {
            mcp.status = 'OFF';
            mcp.targetRpm = 0;
            mcp.telegraph = 0;
            mcp.clutchEngaged = false;
            triggerAlarm(`SHUTDOWN ${mcp.name}: FALTA GASÓLEO!`);
            stateChanged = true;
        } else if (mcp.carter.vol <= 0) {
            mcp.status = 'OFF';
            mcp.targetRpm = 0;
            mcp.telegraph = 0;
            mcp.clutchEngaged = false;
            triggerAlarm(`TRIP SEIZURE PROTECTION ${mcp.name}: CARTER VAZIO!`);
            stateChanged = true;
        } else {
            const consumption = 0.05 + (mcp.telegraph / 100) * 0.15;
            fuelTank.vol = Math.max(0, fuelTank.vol - consumption);
            mcp.carter.vol = Math.max(0, mcp.carter.vol - mcp.loConsumption);

            if ((mcp.carter.vol / mcp.carter.max) < 0.20 && !gameState.isAlarmActive) {
                triggerAlarm(`AVISO CRÍTICO: CARTER ${mcp.name} < 20%!`);
            }
        }
    }

    if (mcp.rpm < mcp.targetRpm) {
        mcp.rpm += 100;
        stateChanged = true;
    } else if (mcp.rpm > mcp.targetRpm) {
        mcp.rpm -= 100;
        stateChanged = true;
    }

    if (Math.abs(mcp.rpm - mcp.targetRpm) < 100) {
        mcp.rpm = mcp.targetRpm;
    }

    mcp.hydraulicPressure = mcp.status === 'RUNNING' && mcp.hydraulicPumpCoupled ? 180 + (mcp.rpm / 100) : 0;
    return stateChanged;
}

function updateZDrivePhysics(side) {
    const mcp = gameState.machinery[`mcp_${side}`];
    const zd = gameState.machinery[`zd_${side}`];

    if (mcp.clutchEngaged && mcp.status === 'RUNNING') {
        const hasGearboxLo = zd.gearboxLO.vol > 0;
        const hasSteeringHyd = zd.steeringHyd.vol > 0;
        const canDrive = hasGearboxLo;

        zd.status = canDrive ? (mcp.telegraph > 0 ? 'DRIVING' : 'ENGAGED') : 'FAULT';
        zd.propRpm = canDrive ? Math.round(mcp.rpm * 0.6) : 0;
        zd.thrust = canDrive ? mcp.telegraph : 0;
        zd.propState = !canDrive ? 'TRIP' : zd.thrust > 0 ? 'GIRANDO' : 'STAND-BY';
        zd.propFlow = !canDrive ? 'Sem lubrificação' : zd.thrust > 0 ? `Jato ${zd.thrust}% a ${zd.azimuth}°` : 'Acoplado sem carga';

        if (hasGearboxLo) {
            zd.gearboxLO.vol = Math.max(0, zd.gearboxLO.vol - SIM_CONFIG.zDriveGearboxLoConsumption);
            if (zd.gearboxLO.vol <= 0) {
                zd.propRpm = 0;
                zd.thrust = 0;
                zd.propState = 'TRIP';
                zd.propFlow = 'Caixa sem LO';
                triggerAlarm(`TRIP ${zd.name}: GEARBOX LO VAZIO - PROPULSOR PARADO!`);
            }
        }

        if (hasSteeringHyd) {
            zd.steeringHyd.vol = Math.max(0, zd.steeringHyd.vol - SIM_CONFIG.zDriveSteeringBaseConsumption);
            if (zd.steeringHyd.vol <= 0 && !gameState.isAlarmActive) {
                triggerAlarm(`AVISO ${zd.name}: HID. GOVERNO VAZIO!`);
            }
        } else {
            zd.propFlow = `${zd.propFlow} / Governo indisponível`;
        }
    } else {
        zd.status = 'FREE';
        zd.propRpm = 0;
        zd.thrust = 0;
        zd.propState = 'STOP';
        zd.propFlow = 'Parado';
    }
}

function updateChillerPhysics() {
    const chiller = gameState.machinery.chiller;

    if (chiller.isOn && gameState.power.isLive) {
        chiller.power = 25;
        if (chiller.actualTemp > chiller.setTemp) {
            chiller.actualTemp = Math.max(chiller.setTemp, chiller.actualTemp - 1);
        }
    } else {
        chiller.power = 0;
        chiller.isOn = false;
        if (chiller.actualTemp < 30) {
            chiller.actualTemp = Math.min(30, chiller.actualTemp + 0.5);
        }
    }
}

function runSimulationTick() {
    let stateChanged = false;

    if (gameState.bunker.isPumping && gameState.bunker.selectedTank) {
        const tk = gameState.tanks[gameState.bunker.selectedTank];
        if (gameState.bunker.truckVolume > 0 && tk.vol < tk.max) {
            const trans = Math.min(gameState.bunker.flowRate, gameState.bunker.truckVolume, tk.max - tk.vol);
            tk.vol += trans;
            gameState.bunker.truckVolume -= trans;
            stateChanged = true;

            const pct = (tk.vol / tk.max) * 100;
            if (pct >= 100) {
                gameState.bunker.isPumping = false;
                gameState.bunker.alarmLevel = 'STOP';
                triggerAlarm(`STOP AUTO: ${tk.name} CHEIO (100%)! FECHAR VÁLVULAS!`);
            } else if (pct >= 95 && gameState.bunker.alarmLevel === 'WARNING') {
                gameState.bunker.alarmLevel = 'CRITICAL';
                triggerAlarm(`CRÍTICO: ${tk.name} a ${pct.toFixed(0)}% - PREPARAR PARA PARAR BOMBA!`);
            } else if (pct >= 80 && gameState.bunker.alarmLevel === 'NONE') {
                gameState.bunker.alarmLevel = 'WARNING';
                triggerAlarm(`AVISO: ${tk.name} a ${pct.toFixed(0)}% - ATENÇÃO AO NÍVEL!`);
            }
        } else if (gameState.bunker.truckVolume <= 0) {
            gameState.bunker.isPumping = false;
        }

        if (!gameState.bunker.isPumping && gameState.bunker.selectedTank) {
            const pct2 = (gameState.tanks[gameState.bunker.selectedTank].vol / gameState.tanks[gameState.bunker.selectedTank].max) * 100;
            if (pct2 < 80) gameState.bunker.alarmLevel = 'NONE';
        }
    }

    if (gameState.waterBunkering.isPumping && gameState.waterBunkering.selectedTank) {
        const tk = gameState.tanks[gameState.waterBunkering.selectedTank];
        if (gameState.waterBunkering.truckVolume > 0 && tk.vol < tk.max) {
            const trans = Math.min(
                gameState.waterBunkering.flowRate,
                gameState.waterBunkering.truckVolume,
                tk.max - tk.vol
            );
            tk.vol += trans;
            gameState.waterBunkering.truckVolume -= trans;
            gameState.waterBunkering.hydrometer += trans;
            stateChanged = true;

            if (tk.vol >= tk.max) {
                gameState.waterBunkering.isPumping = false;
                triggerAlarm(`STOP AUTO: ${tk.name} CHEIO! ENCERRAR RECEBIMENTO DE ÁGUA.`);
            } else if (gameState.waterBunkering.truckVolume <= 0) {
                gameState.waterBunkering.isPumping = false;
                triggerAlarm("RECEBIMENTO DE ÁGUA CONCLUÍDO: CAMINHÃO ESGOTADO.");
            }
        } else {
            gameState.waterBunkering.isPumping = false;
        }
    }

    if (gameState.transfer.isPumping && gameState.transfer.sourceTank && gameState.transfer.destTank) {
        const src = gameState.tanks[gameState.transfer.sourceTank];
        const dst = gameState.tanks[gameState.transfer.destTank];
        if (src.vol > 0 && dst.vol < dst.max) {
            const trans = Math.min(gameState.transfer.flowRate, src.vol, dst.max - dst.vol);
            src.vol -= trans;
            dst.vol += trans;
            stateChanged = true;
        } else {
            gameState.transfer.isPumping = false;
            if (gameState.transfer.sourceTank === 'tk03' && ['tk04', 'tk05'].includes(gameState.transfer.destTank)) {
                if (src.vol <= 0) triggerAlarm(`TRANSFERÊNCIA CONCLUÍDA: TK03 ENVIADO VIA PURIFICADOR PARA ${dst.name}.`);
                else if (dst.vol >= dst.max) triggerAlarm(`STOP AUTO: ${dst.name} CHEIO. TRANSFERÊNCIA DO TK03 INTERROMPIDA.`);
            }
        }
    }

    if (gameState.transfer.crossFeedValve.isOpen) {
        const tk04 = gameState.tanks.tk04;
        const tk05 = gameState.tanks.tk05;
        const diff = tk04.vol - tk05.vol;

        if (Math.abs(diff) > 0.01) {
            const eq = diff * 0.3;
            tk04.vol = Math.max(0, Math.min(tk04.max, tk04.vol - eq));
            tk05.vol = Math.max(0, Math.min(tk05.max, tk05.vol + eq));
            stateChanged = true;
        }
    }

    const tk03 = gameState.tanks.tk03;
    ['tk06', 'tk07', 'tk11', 'tk12', 'tk04', 'tk05'].forEach(key => {
        const tk = gameState.tanks[key];
        if (tk.vol > tk.max) {
            const excess = tk.vol - tk.max;
            tk.vol = tk.max;
            tk03.vol = Math.min(tk03.max, tk03.vol + excess);
            stateChanged = true;
        }
    });

    const tk03Pct = (tk03.vol / tk03.max) * 100;
    if (tk03.vol >= tk03.max) {
        gameState.bunker.isPumping = false;
        gameState.transfer.isPumping = false;
        triggerAlarm("CRÍTICO: TK03 OVERFLOW CHEIO - TODAS AS BOMBAS PARADAS! TRANSFERIR VIA PURIFICADOR URGENTE!");
    } else if (tk03Pct >= 80 && !gameState.isAlarmActive) {
        triggerAlarm(`CRÍTICO: TK03 OVERFLOW a ${tk03Pct.toFixed(0)}% - TRANSFERIR VIA PURIFICADOR IMEDIATAMENTE!`);
    } else if (tk03Pct >= 50 && tk03Pct < 80 && !gameState.isAlarmActive) {
        triggerAlarm(`AVISO: TK03 OVERFLOW a ${tk03Pct.toFixed(0)}% - TRANSFERIR VIA PURIFICADOR EM BREVE.`);
    }

    let breakersClosed = 0;
    MCA_KEYS.forEach(genKey => {
        const gen = gameState.machinery[genKey];
        const fuelTk = gameState.tanks[gen.fuelSource];

        if (gen.status === 'RUNNING') {
            gen.oilPress = 5.0 + (gen.rpm / 2000);
            gen.coolTemp = gen.coolTemp < 80 ? gen.coolTemp + 5 : 80 + (Math.random() * 2 - 1);
        } else {
            gen.oilPress = 0;
            gen.coolTemp = gen.coolTemp > 30 ? gen.coolTemp - 2 : 30;
        }

        if (gen.status === 'STARTING') {
            gen.rpm += 600;
            if (gen.rpm >= 1800) {
                gen.rpm = 1800;
                gen.v = 440;
                gen.hz = 60.0;
                gen.status = 'RUNNING';
            }
            stateChanged = true;
        }

        if (gen.status === 'RUNNING') {
            if (fuelTk.vol >= gen.consumption) {
                fuelTk.vol -= gen.consumption;
                gen.v = 440 + (Math.random() * 2 - 1);
                gen.hz = 60.0 + (Math.random() * 0.2 - 0.1);
            } else {
                fuelTk.vol = 0;
                gen.status = 'OFF';
                gen.rpm = 0;
                gen.v = 0;
                gen.hz = 0;
                gen.breakerClosed = false;
                triggerAlarm(`SHUTDOWN: FALTA DE FO NO ${gen.name}`);
            }

            if (gen.carter.vol > 0) {
                gen.carter.vol = Math.max(0, gen.carter.vol - gen.loConsumption);
                if (gen.carter.vol <= 0) {
                    gen.status = 'OFF';
                    gen.rpm = 0;
                    gen.v = 0;
                    gen.hz = 0;
                    gen.breakerClosed = false;
                    triggerAlarm(`TRIP SEIZURE PROTECTION ${gen.name}: CARTER VAZIO!`);
                } else if ((gen.carter.vol / gen.carter.max) < 0.20 && !gameState.isAlarmActive) {
                    triggerAlarm(`AVISO CRÍTICO: CARTER ${gen.name} < 20%!`);
                }
            } else {
                gen.status = 'OFF';
                gen.rpm = 0;
                gen.v = 0;
                gen.hz = 0;
                gen.breakerClosed = false;
                triggerAlarm(`TRIP SEIZURE PROTECTION ${gen.name}: CARTER VAZIO!`);
            }

            stateChanged = true;
        } else if (gen.status === 'OFF' && gen.rpm > 0) {
            gen.rpm -= 600;
            if (gen.rpm < 0) gen.rpm = 0;
            gen.v = 0;
            gen.hz = 0;
        }

        if (gen.breakerClosed) breakersClosed++;
    });

    const runningGens = MCA_KEYS.filter(key => gameState.machinery[key].status === 'RUNNING' && gameState.machinery[key].breakerClosed);
    let totalLoadKw = 25;
    MCP_KEYS.forEach(key => {
        const mcp = gameState.machinery[key];
        if (mcp.preLubeOn) totalLoadKw += 5;
        if (mcp.coolingOn) totalLoadKw += 8;
    });
    if (gameState.machinery.chiller.isOn) totalLoadKw += 25;

    const loadPerGen = runningGens.length > 0 ? totalLoadKw / runningGens.length : 0;
    MCA_KEYS.forEach(genKey => {
        const gen = gameState.machinery[genKey];
        if (gen.status === 'RUNNING' && gen.breakerClosed && gen.v > 0) {
            gen.power = Math.min(loadPerGen, 170);
            gen.powerFactor = 0.85;
            gen.current = Math.round((gen.power * 1000) / (1.732 * gen.v * gen.powerFactor));
        } else {
            gen.power = 0;
            gen.current = 0;
        }
    });

    if (breakersClosed > 0) {
        if (!gameState.power.isLive) stateChanged = true;
        gameState.power.isLive = true;
        gameState.power.connectedGenerators = breakersClosed;
    } else {
        if (gameState.power.isLive) {
            gameState.power.isLive = false;
            stateChanged = true;
            MCP_KEYS.forEach(key => {
                gameState.machinery[key].preLubeOn = false;
                gameState.machinery[key].coolingOn = false;
            });
            triggerAlarm("BLACKOUT! PERDA DAS BOMBAS AUXILIARES DE ARREFECIMENTO!");
        }
        gameState.power.connectedGenerators = 0;
    }

    MCP_KEYS.forEach(key => {
        if (updateMcpPhysics(key)) stateChanged = true;
    });

    ZD_SIDES.forEach(side => updateZDrivePhysics(side));

    const winch = gameState.machinery.winch;
    const anyHydPress = MCP_KEYS.some(key => gameState.machinery[key].hydraulicPressure > 0);
    if (winch.isActive && !anyHydPress) {
        winch.isActive = false;
        winch.direction = 'STOP';
        triggerAlarm("TRIP GUINCHO: SEM PRESSÃO HIDRÁULICA - INICIAR MCP!");
        stateChanged = true;
    }

    updateChillerPhysics();

    if (stateChanged || gameState.modal.isOpen) renderView();
}
