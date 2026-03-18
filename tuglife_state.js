/**
 * Estado global da aplicacao e constantes de simulacao.
 */
const gameState = {
    currentTab: 'build',
    desktopPanels: {
        left: 'bunkering',
        right: 'propulsion'
    },
    isAlarmActive: false,
    activeAlarmMessage: "",
    modal: { isOpen: false, type: null, entityKey: null },
    bunker: {
        truckVolume: 30.0,
        selectedTruck: 'truck01',
        hoseConnected: false,
        selectedTank: null,
        selectedCompartment: 'c1',
        isPumping: false,
        flowRate: 0.5,
        alarmLevel: 'NONE',
        trucks: {
            truck01: {
                label: 'Caminhao 01',
                compartments: [
                    { id: 'c1', label: 'TQ 1', vol: 5.0, max: 5.0 },
                    { id: 'c2', label: 'TQ 2', vol: 5.0, max: 5.0 },
                    { id: 'c3', label: 'TQ 3', vol: 5.0, max: 5.0 },
                    { id: 'c4', label: 'TQ 4', vol: 5.0, max: 5.0 },
                    { id: 'c5', label: 'TQ 5', vol: 5.0, max: 5.0 },
                    { id: 'c6', label: 'TQ 6', vol: 5.0, max: 5.0 }
                ]
            },
            truck02: {
                label: 'Caminhao 02',
                compartments: [
                    { id: 'c1', label: 'TQ 1', vol: 5.0, max: 5.0 },
                    { id: 'c2', label: 'TQ 2', vol: 5.0, max: 5.0 },
                    { id: 'c3', label: 'TQ 3', vol: 5.0, max: 5.0 },
                    { id: 'c4', label: 'TQ 4', vol: 5.0, max: 5.0 },
                    { id: 'c5', label: 'TQ 5', vol: 5.0, max: 5.0 },
                    { id: 'c6', label: 'TQ 6', vol: 5.0, max: 5.0 }
                ]
            },
            truck03: {
                label: 'Caminhao 03',
                compartments: [
                    { id: 'c1', label: 'TQ 1', vol: 5.0, max: 5.0 },
                    { id: 'c2', label: 'TQ 2', vol: 5.0, max: 5.0 },
                    { id: 'c3', label: 'TQ 3', vol: 5.0, max: 5.0 },
                    { id: 'c4', label: 'TQ 4', vol: 5.0, max: 5.0 },
                    { id: 'c5', label: 'TQ 5', vol: 5.0, max: 5.0 },
                    { id: 'c6', label: 'TQ 6', vol: 5.0, max: 5.0 }
                ]
            }
        }
    },
    loReceiving: {
        drumVolume: 0.2,
        drumsAvailable: 12,
        selectedTank: 'tk15',
        panelOpen: false
    },
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
        },
        driveControls: {
            panelOpen: false,
            enabled: false,
            ps: { rpm: 0, azimuth: 0 },
            sb: { rpm: 0, azimuth: 0 }
        }
    },
    tanks: {
        tk_peak_fwd: { name: "PEAK VANTE AGUA DOCE", type: 'fw', max: 30.0, vol: 0 },
        tk02: { name: "TK 02 Agua Doce", type: 'fw', max: 15.0, vol: 0 },
        tk06: { name: "TK 06 FO Armazenamento BB", type: 'fo', max: 23.8, vol: 0 },
        tk07: { name: "TK 07 FO Armazenamento BE", type: 'fo', max: 23.8, vol: 0 },
        tk04: { name: "HDR 04 FO Servico BB", type: 'fo_hdr', max: 2.8, vol: 0 },
        tk05: { name: "HDR 05 FO Servico BE", type: 'fo_hdr', max: 2.8, vol: 0 },
        tk03: { name: "TK 03 FO Transbordo (Overflow)", type: 'overflow', max: 2.0, vol: 0 },
        tk11: { name: "TK 11 FO Armaz. Re BB", type: 'fo', max: 11.4, vol: 0 },
        tk12: { name: "TK 12 FO Armaz. Re BE", type: 'fo', max: 14.5, vol: 0 },
        tk_od_center: { name: "TK CENTRAL OD", type: 'od', max: 30.0, vol: 0 },
        tk13: { name: "TK 13 Oleo Sujo (Dirty Oil)", type: 'do', max: 4.8, vol: 0 },
        tk14: { name: "TK 14 Agua de Porao (Bilge)", type: 'bilge', max: 4.8, vol: 0 },
        tk15: { name: "TK 15 OL15W40 Armazenamento", type: 'lo_15w40', max: 2.0, vol: 1.4 },
        tk16: { name: "TK 16 OL150 Z-Drive", type: 'lo_150', max: 4.0, vol: 3.6 },
        tk_peak_aft: { name: "PEAK RE AGUA DOCE", type: 'fw', max: 35.0, vol: 0 },
        tk_hyd: { name: "TK HID OH32", type: 'oh32', max: 0.6, vol: 0.52 }
    },
    machinery: {
        mca_ps: { name: "MCA 1 (BOMBORDO)", status: 'OFF', rpm: 0, v: 0, hz: 0, breakerClosed: false, fuelSource: 'tk04', consumption: 0.01, oilPress: 0, coolTemp: 30, carter: { vol: 0, max: 0.015 }, loConsumption: 0.00005, current: 0, power: 0, powerFactor: 0.85 },
        mca_sb: { name: "MCA 2 (ESTIBORDO)", status: 'OFF', rpm: 0, v: 0, hz: 0, breakerClosed: false, fuelSource: 'tk05', consumption: 0.01, oilPress: 0, coolTemp: 30, carter: { vol: 0, max: 0.015 }, loConsumption: 0.00005, current: 0, power: 0, powerFactor: 0.85 },
        mcp_ps: { name: "MCP BB (Motor Principal)", status: 'OFF', rpm: 0, targetRpm: 0, telegraph: 0, preLubeOn: false, coolingOn: false, oilPress: 0, coolTemp: 30, fuelSource: 'tk04', clutchEngaged: false, carter: { vol: 0, max: 0.8 }, loConsumption: 0.0015, hydraulicPressure: 0, hydraulicPumpCoupled: true },
        mcp_sb: { name: "MCP BE (Motor Principal)", status: 'OFF', rpm: 0, targetRpm: 0, telegraph: 0, preLubeOn: false, coolingOn: false, oilPress: 0, coolTemp: 30, fuelSource: 'tk05', clutchEngaged: false, carter: { vol: 0, max: 0.8 }, loConsumption: 0.0015, hydraulicPressure: 0, hydraulicPumpCoupled: true },
        winch: { isActive: false, direction: 'STOP', hydReservoir: { vol: 0.4, max: 0.4 } },
        chiller: { isOn: false, setTemp: 22, actualTemp: 30, power: 0 },
        zd_ps: { name: "Z-Drive BB", status: 'FREE', azimuth: 0, propRpm: 0, thrust: 0, gearboxLO: { vol: 1.65, max: 1.8 }, steeringHyd: { vol: 0.055, max: 0.06 }, propState: 'STOP', propFlow: 'Parado' },
        zd_sb: { name: "Z-Drive BE", status: 'FREE', azimuth: 0, propRpm: 0, thrust: 0, gearboxLO: { vol: 1.65, max: 1.8 }, steeringHyd: { vol: 0.055, max: 0.06 }, propState: 'STOP', propFlow: 'Parado' }
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
