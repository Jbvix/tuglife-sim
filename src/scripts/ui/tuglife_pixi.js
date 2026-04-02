/**
 * TugLife Sim - PixiJS 2D Engine
 * Renderiza a planta baixa (casco) e sistemas usando WebGL com alta performance.
 */

// Dimensões Virtuais da Planta (Viewport Interno)
const PIXI_W = 600;
const PIXI_H = 1100;

let pixiApp;
const pixiTanks = {}; // Referências aos objetos visuais dos tanques
const pixiEngines = {}; // Referências aos motores e thrusters
let globalTime = 0;
let particleLayer;
const flowParticles = [];
let spawnTick = 0;

// Paleta de Cores
const COLORS = {
    hullBg: 0x1a252c,
    hullLine: 0x00bcd4,
    slotBorder: 0x555555,
    water: 0x00bcd4,
    oil: 0xf44336,
    diesel: 0xff9800,
    lo: 0xffc107,
    hyd: 0x2196f3,
    engineOff: 0x111111,
    engineRunning: 0x4caf50,
    engineFault: 0xf44336,
    textLight: 0xffffff,
    textDim: 0xaaaaaa
};

// Funções Auxiliares de Cor
function getTypeColor(type, isFull = false) {
    if (type === 'fw') return isFull ? 0xf44336 : COLORS.water;
    if (type === 'fo') return isFull ? 0xf44336 : COLORS.water; // Mudaremos opacidade depois
    if (type === 'do') return isFull ? 0xf44336 : COLORS.diesel;
    if (type === 'lo' || type === 'lo-150') return isFull ? 0xf44336 : COLORS.lo;
    if (type === 'hyd') return isFull ? 0xf44336 : COLORS.hyd;
    if (type === 'overflow') return isFull ? 0xf44336 : COLORS.diesel;
    if (type === 'sludge' || type === 'bilge') return isFull ? 0xf44336 : 0x795548;
    return COLORS.water;
}

function initPixi() {
    console.log("Inicializando Motor PixiJS 2D...");
    
    const container = document.getElementById('pixi-hull-container');
    if (!container) return;

    // Remove fallback
    container.innerHTML = '';

    pixiApp = new PIXI.Application({
        width: PIXI_W,
        height: PIXI_H,
        backgroundColor: COLORS.hullBg,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
        backgroundAlpha: 1
    });

    container.appendChild(pixiApp.view);

    // Desenhar a base do Casco
    drawHull();

    // Setup do layout (Baseado no layout original de grid)
    setupLayout();

    // Setup Particle Layer (sobrepondo tudo)
    particleLayer = new PIXI.Container();
    pixiApp.stage.addChild(particleLayer);

    // Loop de Animação (Ticker)
    pixiApp.ticker.add((delta) => {
        globalTime += delta * 0.05;
        animateFluids();
        animateParticles(delta);
    });
}

function drawHull() {
    const hullObj = new PIXI.Graphics();
    
    // Contorno do casco refeito (Damen ASD 2411 Oficial - Laterais mais retas, proa e popa curvas)
    hullObj.lineStyle(6, COLORS.hullLine, 1);
    hullObj.beginFill(0x0a1014);
    
    // Iniciando no bico da proa (Centro-Topo)
    hullObj.moveTo(PIXI_W / 2, 20); 
    
    // Bordo de estibordo (BE)
    // Proa arredondada direita
    hullObj.bezierCurveTo(PIXI_W - 80, 20, PIXI_W - 20, 100, PIXI_W - 20, 300);
    // Lateral reta
    hullObj.lineTo(PIXI_W - 20, PIXI_H - 250);
    // Popa arredondada direita
    hullObj.bezierCurveTo(PIXI_W - 20, PIXI_H - 80, PIXI_W - 60, PIXI_H - 20, PIXI_W / 2, PIXI_H - 20);
    
    // Bordo de bombordo (BB)
    // Popa arredondada esquerda
    hullObj.bezierCurveTo(60, PIXI_H - 20, 20, PIXI_H - 80, 20, PIXI_H - 250);
    // Lateral reta
    hullObj.lineTo(20, 300);
    // Proa arredondada esquerda
    hullObj.bezierCurveTo(20, 100, 80, 20, PIXI_W / 2, 20);
    
    hullObj.endFill();
    pixiApp.stage.addChild(hullObj);
}

// Cria um "slot" clicável no PixiJS
function createSlot(x, y, w, h, label, id, type, onClick, options = {}) {
    const group = new PIXI.Container();
    group.x = x;
    group.y = y;
    
    const shape = options.shape || 'rect';
    const borderColor = getTypeColor(type);

    // Bounds limitados (Mascara)
    const bg = new PIXI.Graphics();
    bg.lineStyle(2, borderColor, 0.6);
    bg.beginFill(0xffffff, 0.02);
    if (shape === 'circle') {
        bg.drawCircle(w / 2, h / 2, Math.min(w, h) / 2);
    } else {
        bg.drawRoundedRect(0, 0, w, h, 6);
    }
    bg.endFill();
    group.addChild(bg);

    // Shape do Fluído
    const fluidLayer = new PIXI.Graphics();
    group.addChild(fluidLayer);
    
    // Máscara para garantir que o fluido não vaze a borda
    const mask = new PIXI.Graphics();
    mask.beginFill(0xffffff);
    if (shape === 'circle') {
        mask.drawCircle(w / 2, h / 2, Math.min(w, h) / 2);
    } else {
        mask.drawRoundedRect(0, 0, w, h, 6);
    }
    mask.endFill();
    group.addChild(mask);
    fluidLayer.mask = mask;

    // Válvulas físicas e geometria P&ID
    group.valveGlobal = { x: x + w / 2, y: y + h / 2 }; // Default (Centro)
    
    // Tipos fluidos criam saídas (nodes) laterais
    if (['do', 'fo', 'fo_hdr', 'od', 'overflow'].includes(type) || type === 'fw') {
        const isLeftOfCenter = (x + w/2) < (PIXI_W / 2);
        let valveX = isLeftOfCenter ? w : 0;
        let valveY = h / 2;
        
        // Se tanque no centro exato (TK08 Central, Peak), coloca na borda de cima
        if (Math.abs((x + w/2) - (PIXI_W / 2)) < 15) {
            valveX = w / 2; valveY = 0; // Topo
        }
        
        group.valveGlobal = { x: x + valveX, y: y + valveY };
        
        // Desenha Círculo da Válvula
        const valve = new PIXI.Graphics();
        valve.beginFill(borderColor, 0.9);
        valve.lineStyle(2, 0x111111, 0.8);
        valve.drawCircle(0, 0, 5);
        valve.endFill();
        valve.x = valveX; valve.y = valveY;
        group.addChild(valve);
    } else if (id === 'manifold') {
        group.valveGlobal = { x: PIXI_W / 2, y: y + h / 2 };
        
        const pumpIcon = new PIXI.Graphics();
        pumpIcon.beginFill(COLORS.engineRunning, 0.8);
        pumpIcon.lineStyle(2, 0x111111, 1);
        pumpIcon.drawCircle(w/2, h/2, 10);
        pumpIcon.endFill();
        pumpIcon.lineStyle(2, 0x111111, 1);
        pumpIcon.moveTo(w/2 - 6, h/2 - 6); pumpIcon.lineTo(w/2 + 6, h/2 + 6);
        pumpIcon.moveTo(w/2 - 6, h/2 + 6); pumpIcon.lineTo(w/2 + 6, h/2 - 6);
        group.addChild(pumpIcon);
    }

    // Textos
    const titleText = new PIXI.Text(label, { fontFamily: 'Segoe UI', fontSize: 13, fill: COLORS.textDim, align: 'center', fontWeight: 'bold' });
    titleText.anchor.set(0.5, 0.5);
    titleText.x = w / 2;
    titleText.y = h / 2 - 10;
    group.addChild(titleText);
    
    const valText = new PIXI.Text('', { fontFamily: 'Courier New', fontSize: 14, fill: COLORS.textLight, fontWeight: 'bold' });
    valText.anchor.set(0.5, 0.5);
    valText.x = w / 2;
    valText.y = h / 2 + 10;
    group.addChild(valText);
    
    // Interatividade
    group.eventMode = 'static';
    group.cursor = 'pointer';
    group.on('pointerdown', onClick);

    pixiApp.stage.addChild(group);
    
    return { group, fluidLayer, titleText, valText, w, h, type, shape, targetPct: 0, currentPct: 0 };
}

function setupLayout() {
    // 1ª Linha: PEAK FWD
    pixiTanks.tk_peak_fwd = createSlot(170, 50, 260, 60, "PEAK VANTE FW", "tk_peak_fwd", "fw", () => openModal('tank', 'tk_peak_fwd'));
    
    // 2ª Linha: WINCH, TK HYD, CHILLER
    pixiEngines.winch = createSlot(115, 120, 115, 60, "GUINCHO", "winch", "machinery", () => openModal('winch', 'winch'));
    pixiTanks.tk_hyd = createSlot(240, 120, 120, 60, "TK HID", "tk_hyd", "hyd", () => openModal('tank', 'tk_hyd'));
    pixiEngines.chiller = createSlot(370, 120, 115, 60, "AC PROA", "chiller", "machinery", () => openModal('chiller', 'chiller'));
    
    // 3ª Linha: MANIFOLD
    pixiEngines.manifold = createSlot(80, 190, 440, 45, "MANIFOLD", "manifold", "machinery", () => openModal('manifold', 'manifold'));
    
    // 4ª Linha: TK02 FW
    pixiTanks.tk02 = createSlot(70, 245, 460, 65, "TK 02 FW", "tk02", "fw", () => openModal('tank', 'tk02'));
    
    // 5ª, 6ª e 7ª Linha (Laterais e Miolo com MCAs e HDRs)
    pixiTanks.tk06 = createSlot(45, 320, 90, 215, "TK 06 BB", "tk06", "do", () => openModal('tank', 'tk06'));
    pixiTanks.tk07 = createSlot(465, 320, 90, 215, "TK 07 BE", "tk07", "do", () => openModal('tank', 'tk07'));
    
    pixiEngines.mca_ps = createSlot(145, 320, 150, 75, "MCA 1 BB", "mca_ps", "machinery", () => openModal('mca', 'mca_ps'));
    pixiEngines.mca_sb = createSlot(305, 320, 150, 75, "MCA 2 BE", "mca_sb", "machinery", () => openModal('mca', 'mca_sb'));
    
    pixiTanks.tk04 = createSlot(145, 405, 150, 60, "HDR 04", "tk04", "do", () => openModal('tank', 'tk04'));
    pixiTanks.tk05 = createSlot(305, 405, 150, 60, "HDR 05", "tk05", "do", () => openModal('tank', 'tk05'));
    
    pixiTanks.tk_od_center = createSlot(145, 475, 310, 60, "TK 08 CENTRAL", "tk_od_center", "do", () => openModal('tank', 'tk_od_center'));
    
    // 8ª Linha: MCPs e FiFi
    pixiEngines.mcp_ps = createSlot(40, 545, 150, 120, "MCP BB", "mcp_ps", "machinery", () => openModal('mcp', 'mcp_ps'));
    pixiEngines.fifi = createSlot(200, 545, 200, 120, "FIFI ONE", "fifi", "machinery", () => openModal('fifi', 'fifi'));
    pixiEngines.mcp_sb = createSlot(410, 545, 150, 120, "MCP BE", "mcp_sb", "machinery", () => openModal('mcp', 'mcp_sb'));

    // 9ª e 10ª Linha: Tanques de popa (TK11, TK12) e Centro
    pixiTanks.tk11 = createSlot(40, 675, 130, 140, "TK 11 BB", "tk11", "do", () => openModal('tank', 'tk11'));
    pixiTanks.tk03 = createSlot(180, 675, 240, 65, "TK 03 OF", "tk03", "overflow", () => openModal('tank', 'tk03'));
    pixiTanks.tk12 = createSlot(430, 675, 130, 140, "TK 12 BE", "tk12", "do", () => openModal('tank', 'tk12'));
    
    pixiTanks.tk13 = createSlot(180, 750, 115, 65, "DO 13", "tk13", "do", () => openModal('tank', 'tk13'));
    pixiTanks.tk14 = createSlot(305, 750, 115, 65, "BILGE 14", "tk14", "bilge", () => openModal('tank', 'tk14'));
    
    // 11ª Linha: Óleos Lubrificantes
    pixiTanks.tk15 = createSlot(60, 825, 235, 65, "TK 15 OL15W40", "tk15", "lo", () => openModal('tank', 'tk15'));
    pixiTanks.tk16 = createSlot(305, 825, 235, 65, "TK 16 OL150", "tk16", "lo-150", () => openModal('tank', 'tk16'));
    
    // 12ª Linha: Z-Drives
    pixiEngines.zd_ps = createSlot(160, 895, 110, 110, "Z-DRIVE BB", "zd_ps", "machinery", () => openModal('zdrive', 'zd_ps'), { shape: 'circle' });
    pixiEngines.zd_sb = createSlot(330, 895, 110, 110, "Z-DRIVE BE", "zd_sb", "machinery", () => openModal('zdrive', 'zd_sb'), { shape: 'circle' });

    // 13ª Linha: PEAK RÉ (Movido para a popa extrema)
    pixiTanks.tk_peak_aft = createSlot(100, 1020, 400, 50, "PEAK RÉ FW", "tk_peak_aft", "fw", () => openModal('tank', 'tk_peak_aft'));
}

// Renderiza a Animação das Ondas para os fluidos baseados no Ticker Time
function animateFluids() {
    let state = null;
    if (typeof gameState !== 'undefined') state = gameState;

    const allSlots = { ...pixiTanks, ...pixiEngines };
    for (const key in allSlots) {
        const slot = allSlots[key];
        
        // Polling contínuo de estado para fluidez natural (Animação de Transferência)
        if (state) {
            if (pixiTanks[key] && state.tanks[key]) {
                const tkState = state.tanks[key];
                let perc = (tkState.vol / tkState.max) * 100;
                if (['tk15', 'tk16'].includes(key)) {
                    const pairedMax = Math.max(state.tanks.tk15.max, state.tanks.tk16.max);
                    perc = (tkState.vol / pairedMax) * 100;
                }
                slot.targetPct = Math.min(Math.max(perc, 0), 100);
                
                if (['tk15', 'tk16'].includes(key)) {
                    slot.valText.text = `${tkState.vol.toFixed(2)} m³`;
                } else {
                    slot.valText.text = `${tkState.vol.toFixed(1)}`;
                }
            } else if (pixiEngines[key] && state.machinery[key] && state.machinery[key].carter) {
                const carter = state.machinery[key].carter;
                const perc = (carter.vol / carter.max) * 100;
                slot.targetPct = Math.min(Math.max(perc, 0), 100);
                slot.valText.text = `LO: ${(perc).toFixed(0)}%`;
            }
        }
        
        // Interpolação super suave para a variação de nível do fluido
        slot.currentPct += (slot.targetPct - slot.currentPct) * 0.1;
        
        const g = slot.fluidLayer;
        g.clear();
        
        if (slot.currentPct <= 0.01) continue;
        
        const fHeight = (slot.currentPct / 100) * slot.h;
        let color = getTypeColor(slot.type, slot.currentPct >= 90);
        
        if (pixiEngines[key] && state && state.machinery[key] && state.machinery[key].carter) {
            color = 0xffc107; // Sinaliza Dourado pro Carter
        }
        
        g.beginFill(color, 0.45);
        
        const waveAmpX = 10;
        const waveAmpY = 3; // Nível das Ondas
        const yStart = slot.h - fHeight;
        
        g.moveTo(0, slot.h);
        g.lineTo(0, yStart);
        
        // Curva Sinoidal
        for(let x=0; x<=slot.w; x+=10) {
            const yOffset = Math.sin((x / waveAmpX) + globalTime) * waveAmpY;
            g.lineTo(x, yStart + yOffset);
        }
        
        g.lineTo(slot.w, slot.h);
        g.endFill();
    }
}

function spawnFlowParticle(sourceKey, destKey, color, viaKey = null) {
    const src = pixiTanks[sourceKey] || pixiEngines[sourceKey];
    const dst = pixiTanks[destKey] || pixiEngines[destKey];
    if(!src || !dst) return;

    const startX = src.group.valveGlobal.x;
    const startY = src.group.valveGlobal.y;
    const endX = dst.group.valveGlobal.x;
    const endY = dst.group.valveGlobal.y;

    const g = new PIXI.Graphics();
    
    // Efeito luminoso pro pulso
    g.beginFill(color, 1);
    g.drawCircle(0, 0, 4);
    g.endFill();
    g.beginFill(0xffffff, 0.5);
    g.drawCircle(0, 0, 2);
    g.endFill();
    
    g.x = startX;
    g.y = startY;

    // Roteamento Manhattan
    const points = [];
    points.push({x: startX, y: startY});
    
    // Se existir um nó intermediário (ex: Bomba de Transferência do Manifold)
    if (viaKey) {
        const via = pixiTanks[viaKey] || pixiEngines[viaKey];
        if (via) {
            const viaX = via.group.valveGlobal.x;
            const viaY = via.group.valveGlobal.y;
            points.push({x: PIXI_W / 2, y: startY});
            points.push({x: PIXI_W / 2, y: viaY});
            points.push({x: viaX, y: viaY});
            points.push({x: PIXI_W / 2, y: viaY}); // Desce de volta para o Hub EIXO Y
        }
    }
    
    points.push({x: PIXI_W / 2, y: endY});
    points.push({x: endX, y: endY});

    particleLayer.addChild(g);
    
    flowParticles.push({
        sprite: g,
        points: points,
        currentSegment: 0,
        speed: 9
    });
}

function animateParticles(delta) {
    spawnTick += delta;
    
    // Lógica de spawn a cada ~18 frames
    if (spawnTick >= 18) {
        spawnTick = 0;
        if (typeof gameState !== 'undefined') {
            
            // 1. Manifold Transfer (Diesel)
            if (gameState.transfer && gameState.transfer.isPumping) {
                spawnFlowParticle(gameState.transfer.sourceTank, gameState.transfer.destTank, COLORS.diesel, 'manifold');
            }
            
            // 2. Consumo Motores (Fuel feed da origem pro MCP/MCA/FiFi)
            if (gameState.machinery.mcp_ps && gameState.machinery.mcp_ps.status === 'RUNNING') {
                spawnFlowParticle(gameState.machinery.mcp_ps.fuelSource, 'mcp_ps', COLORS.diesel);
                spawnFlowParticle('mcp_ps', gameState.machinery.mcp_ps.fuelReturn, COLORS.diesel);
            }
            if (gameState.machinery.mcp_sb && gameState.machinery.mcp_sb.status === 'RUNNING') {
                spawnFlowParticle(gameState.machinery.mcp_sb.fuelSource, 'mcp_sb', COLORS.diesel);
                spawnFlowParticle('mcp_sb', gameState.machinery.mcp_sb.fuelReturn, COLORS.diesel);
            }
            if (gameState.machinery.mca_ps && gameState.machinery.mca_ps.status === 'RUNNING') {
                spawnFlowParticle(gameState.machinery.mca_ps.fuelSource, 'mca_ps', COLORS.diesel);
                spawnFlowParticle('mca_ps', gameState.machinery.mca_ps.fuelReturn, COLORS.diesel);
            }
            if (gameState.machinery.mca_sb && gameState.machinery.mca_sb.status === 'RUNNING') {
                spawnFlowParticle(gameState.machinery.mca_sb.fuelSource, 'mca_sb', COLORS.diesel);
                spawnFlowParticle('mca_sb', gameState.machinery.mca_sb.fuelReturn, COLORS.diesel);
            }
            if (gameState.machinery.fifi && gameState.machinery.fifi.engineStatus === 'RUNNING') {
                spawnFlowParticle(gameState.machinery.fifi.fuelSource, 'fifi', COLORS.diesel);
            }
        }
    }

    // Move logic
    for (let i = flowParticles.length - 1; i >= 0; i--) {
        const p = flowParticles[i];
        const target = p.points[p.currentSegment + 1];
        if (!target) {
            // Chegou no fim
            p.sprite.destroy();
            flowParticles.splice(i, 1);
            continue;
        }

        const dx = target.x - p.sprite.x;
        const dy = target.y - p.sprite.y;
        const dist = Math.sqrt(dx*dx + dy*dy);

        if (dist < p.speed * delta) {
            // Atingiu o waypoint (dobrando a quina)
            p.sprite.x = target.x;
            p.sprite.y = target.y;
            p.currentSegment++;
        } else {
            // Avançando
            p.sprite.x += (dx / dist) * p.speed * delta;
            p.sprite.y += (dy / dist) * p.speed * delta;
        }
    }
}

// Ponto de entrada chamado a partir do renderView() principal no tuglife_render.js
window.updatePixiView = function(state) {
    if (!pixiApp) initPixi();
    
    // Atualizar Máquinas Visualmente
    const setMotorStatus = (slotKey, engState) => {
        if(!pixiEngines[slotKey]) return;
        const s = pixiEngines[slotKey];
        const status = engState.status;
        
        let bgColor = COLORS.hullBg; // Neutro
        if (status === 'RUNNING' || status === 'DRIVING') bgColor = COLORS.engineRunning;
        else if (status === 'FAULT' || status === 'TRIP') bgColor = COLORS.engineFault;
        else if (status === 'STARTING' || status === 'ENGAGED') bgColor = COLORS.diesel;
        
        s.fluidLayer.clear();
        if (status !== 'OFF' && status !== 'FREE') {
            s.fluidLayer.beginFill(bgColor, 0.25);
            if (s.shape === 'circle') {
                s.fluidLayer.drawCircle(s.w / 2, s.h / 2, Math.min(s.w, s.h) / 2);
            } else {
                s.fluidLayer.drawRoundedRect(0, 0, s.w, s.h, 6);
            }
            s.fluidLayer.endFill();
        }
        
        s.valText.text = (engState.rpm || engState.rpm === 0) ? `${engState.rpm} RPM` : status;
        if(slotKey.startsWith('zd')) s.valText.text = `${engState.azimuth}° | ${status}`;
        if(slotKey === 'fifi') s.valText.text = engState.engineStatus === 'RUNNING' ? `LIGADO` : 'OFF';
        if(slotKey === 'chiller') s.valText.text = engState.isOn ? `${engState.actualTemp.toFixed(1)}°C` : 'OFF';
    };

    setMotorStatus('mca_ps', state.machinery.mca_ps);
    setMotorStatus('mca_sb', state.machinery.mca_sb);
    setMotorStatus('mcp_ps', state.machinery.mcp_ps);
    setMotorStatus('mcp_sb', state.machinery.mcp_sb);
    setMotorStatus('zd_ps', state.machinery.zd_ps);
    setMotorStatus('zd_sb', state.machinery.zd_sb);
    setMotorStatus('fifi', state.machinery.fifi);
    setMotorStatus('chiller', state.machinery.chiller);
    
    if(pixiEngines.winch) {
        pixiEngines.winch.valText.text = state.machinery.winch.isActive ? state.machinery.winch.direction : 'PARADA';
        pixiEngines.winch.fluidLayer.clear();
        if (state.machinery.winch.isActive) {
            pixiEngines.winch.fluidLayer.beginFill(COLORS.lo, 0.2);
            pixiEngines.winch.fluidLayer.drawRect(0,0,pixiEngines.winch.w,pixiEngines.winch.h);
        }
    }

    // Atualizar Fluídos Visualmente e Valores
    for (const [key, tkState] of Object.entries(state.tanks)) {
        if (!pixiTanks[key]) continue;
        const slot = pixiTanks[key];
        
        let perc = (tkState.vol / tkState.max) * 100;
        
        // Ajuste paridade visual TK15 e TK16
        if (key === 'tk15' || key === 'tk16') {
            const pairedMax = Math.max(state.tanks.tk15.max, state.tanks.tk16.max);
            perc = (tkState.vol / pairedMax) * 100;
        }

        slot.targetPct = Math.min(Math.max(perc, 0), 100);
        
        if (['tk15', 'tk16'].includes(key)) {
            slot.valText.text = `${tkState.vol.toFixed(2)} m³`;
        } else {
            slot.valText.text = `${tkState.vol.toFixed(1)}`;
        }
    }
}

// Exportar funções para uso externo (DOM/Controls)
window.spawnFlowParticle = spawnFlowParticle;

// Se o document estiver pronto e o estado existe, já pode arrancar (segurança)
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(() => { if (!pixiApp) initPixi(); }, 500); 
} else {
    document.addEventListener("DOMContentLoaded", () => { setTimeout(() => { if (!pixiApp) initPixi(); }, 500); });
}
