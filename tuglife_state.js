/**
 * Estado global da aplicação e constantes de simulação.
 */
const gameState = {
    currentTab: 'build',
    isAlarmActive: false,
    activeAlarmMessage: "",
    modal: { isOpen: false, type: null, entityKey: null },
    bunker: { truckVolume: 50.0, hoseConnected: false, selectedTank: null, isPumping: false, flowRate: 0.5, alarmLevel: 'NONE' },
    waterBunkering: {
        truckVolume: 20.0,
        hoseConnected: false,
        selectedTank: 'tk02',
        isPumping: false,
        flowRate: 0.2,
        hydrometer: 0,
        panelOpen: false
    },
    transfer: { sourceTank: null, destTank: null, isPumping: false, flowRate: 0.05, flowRateMode: 'LOW', crossFeedValve: { isOpen: false } },
    power: { isLive: false, connectedGenerators: 0 },
    visual3d: {
        vessel: {
            x: 0,
            z: 0,
            vx: 0,
            vz: 0,
            yaw: 0,
            yawRate: 0
        },
        mooringConnected: true,
        mooring: {
            selectedTugLine: null,
            lines: {
                fore: { dockAnchorId: 'dock_fore' },
                aft: { dockAnchorId: 'dock_aft' }
            }
        }
    },
    tanks: {
        tk02: { name: "TK 02 Água Doce", type: 'fw', max: 8.8, vol: 0 },
        tk06: { name: "TK 06 FO Armazenamento BB", type: 'fo', max: 23.8, vol: 0 },
        tk07: { name: "TK 07 FO Armazenamento BE", type: 'fo', max: 23.8, vol: 0 },
        tk04: { name: "HDR 04 FO Serviço BB", type: 'fo_hdr', max: 2.8, vol: 0 },
        tk05: { name: "HDR 05 FO Serviço BE", type: 'fo_hdr', max: 2.8, vol: 0 },
        tk03: { name: "TK 03 FO Transbordo (Overflow)", type: 'overflow', max: 2.0, vol: 0 },
        tk11: { name: "TK 11 FO Armaz. Ré BB", type: 'fo', max: 11.4, vol: 0 },
        tk12: { name: "TK 12 FO Armaz. Ré BE", type: 'fo', max: 14.5, vol: 0 },
        tk13: { name: "TK 13 Óleo Sujo (Dirty Oil)", type: 'do', max: 4.8, vol: 0 },
        tk14: { name: "TK 14 Água de Porão (Bilge)", type: 'bilge', max: 4.8, vol: 0 },
        tk15: { name: "TK 15 LO Armazenamento", type: 'lo', max: 2.0, vol: 1.0 },
        tk_hyd: { name: "TK HID GUINCHO PROA", type: 'hyd', max: 0.2, vol: 0.2 }
    },
    machinery: {
        mca_ps: { name: "MCA 1 (BOMBORDO)", status: 'OFF', rpm: 0, v: 0, hz: 0, breakerClosed: false, fuelSource: 'tk04', consumption: 0.01, oilPress: 0, coolTemp: 30, carter: { vol: 0, max: 0.15 }, loConsumption: 0.001, current: 0, power: 0, powerFactor: 0.85 },
        mca_sb: { name: "MCA 2 (ESTIBORDO)", status: 'OFF', rpm: 0, v: 0, hz: 0, breakerClosed: false, fuelSource: 'tk05', consumption: 0.01, oilPress: 0, coolTemp: 30, carter: { vol: 0, max: 0.15 }, loConsumption: 0.001, current: 0, power: 0, powerFactor: 0.85 },
        mcp_ps: { name: "MCP BB (Motor Principal)", status: 'OFF', rpm: 0, targetRpm: 0, telegraph: 0, preLubeOn: false, coolingOn: false, oilPress: 0, coolTemp: 30, fuelSource: 'tk04', clutchEngaged: false, carter: { vol: 0, max: 0.25 }, loConsumption: 0.002, hydraulicPressure: 0, hydraulicPumpCoupled: true },
        mcp_sb: { name: "MCP BE (Motor Principal)", status: 'OFF', rpm: 0, targetRpm: 0, telegraph: 0, preLubeOn: false, coolingOn: false, oilPress: 0, coolTemp: 30, fuelSource: 'tk05', clutchEngaged: false, carter: { vol: 0, max: 0.25 }, loConsumption: 0.002, hydraulicPressure: 0, hydraulicPumpCoupled: true },
        winch: { isActive: false, direction: 'STOP' },
        chiller: { isOn: false, setTemp: 22, actualTemp: 30, power: 0 },
        zd_ps: { name: "Z-Drive BB", status: 'FREE', azimuth: 0, propRpm: 0, thrust: 0, gearboxLO: { vol: 0.08, max: 0.08 }, steeringHyd: { vol: 0.05, max: 0.05 }, propState: 'STOP', propFlow: 'Parado' },
        zd_sb: { name: "Z-Drive BE", status: 'FREE', azimuth: 0, propRpm: 0, thrust: 0, gearboxLO: { vol: 0.08, max: 0.08 }, steeringHyd: { vol: 0.05, max: 0.05 }, propState: 'STOP', propFlow: 'Parado' }
    }
};

const MCP_KEYS = ['mcp_ps', 'mcp_sb'];
const MCA_KEYS = ['mca_ps', 'mca_sb'];
const ZD_SIDES = ['ps', 'sb'];

const SIM_CONFIG = {
    mcpIdleRpm: 600,
    mcpMaxRpm: 1600,
    zDriveGearboxLoConsumption: 0.0002,
    zDriveSteeringBaseConsumption: 0.0001,
    zDriveSteeringCommandConsumption: 0.0005
};
