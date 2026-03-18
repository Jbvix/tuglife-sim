const stage = typeof document !== 'undefined' ? document.getElementById('three-d-stage') : null;
const panel3d = typeof document !== 'undefined' ? document.querySelector('#screen-visual3d .three-d-panel') : null;

if (stage && typeof window !== 'undefined' && window.gameState && window.THREE) {
    const THREE = window.THREE;

    try {
        const scene = new THREE.Scene();
        scene.fog = new THREE.Fog(0x09131c, 30, 120);

        const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 250);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x08131b, 1);
        stage.appendChild(renderer.domElement);

        const ambient = new THREE.HemisphereLight(0xc8f1ff, 0x10202b, 1.65);
        scene.add(ambient);

        const sun = new THREE.DirectionalLight(0xffffff, 1.45);
        sun.position.set(14, 18, 10);
        scene.add(sun);

        const fill = new THREE.DirectionalLight(0x5fc8ff, 0.5);
        fill.position.set(-14, 10, -12);
        scene.add(fill);

        const waterGeometry = new THREE.PlaneGeometry(180, 180, 96, 96);
        const water = new THREE.Mesh(
            waterGeometry,
            new THREE.MeshPhongMaterial({
                color: 0x0d5b79,
                emissive: 0x08202b,
                shininess: 110,
                specular: 0x8fdcff,
                transparent: true,
                opacity: 0.96
            })
        );
        water.rotation.x = -Math.PI / 2;
        water.position.y = 0.14;
        scene.add(water);

        const waterUnderlay = new THREE.Mesh(
            new THREE.CircleGeometry(32, 64),
            new THREE.MeshBasicMaterial({
                color: 0x0a2431,
                transparent: true,
                opacity: 0.55
            })
        );
        waterUnderlay.rotation.x = -Math.PI / 2;
        waterUnderlay.position.y = -0.2;
        scene.add(waterUnderlay);

        const harborWater = new THREE.Mesh(
            new THREE.CircleGeometry(18, 48),
            new THREE.MeshBasicMaterial({
                color: 0x1b6f8b,
                transparent: true,
                opacity: 0.26
            })
        );
        harborWater.rotation.x = -Math.PI / 2;
        harborWater.position.y = 0.12;
        scene.add(harborWater);

        const grid = new THREE.GridHelper(160, 48, 0x315968, 0x12303d);
        grid.position.y = 0.1;
        scene.add(grid);

        const pier = new THREE.Mesh(
            new THREE.BoxGeometry(5.2, 1.2, 18),
            new THREE.MeshStandardMaterial({ color: 0x8b7651, roughness: 0.9, metalness: 0.04 })
        );
        pier.position.set(-6.4, 0.7, 0);
        scene.add(pier);

        const pierEdge = new THREE.Mesh(
            new THREE.BoxGeometry(0.4, 0.28, 18.2),
            new THREE.MeshStandardMaterial({ color: 0xd7cfb2, roughness: 0.74, metalness: 0.04 })
        );
        pierEdge.position.set(-3.85, 1.2, 0);
        scene.add(pierEdge);

        function createBollard(z) {
            const bollard = new THREE.Group();

            const body = new THREE.Mesh(
                new THREE.CylinderGeometry(0.16, 0.22, 0.56, 16),
                new THREE.MeshStandardMaterial({ color: 0x445159, roughness: 0.46, metalness: 0.58 })
            );
            body.position.y = 1.44;
            bollard.add(body);

            const top = new THREE.Mesh(
                new THREE.BoxGeometry(0.5, 0.12, 0.18),
                new THREE.MeshStandardMaterial({ color: 0x6d7a82, roughness: 0.42, metalness: 0.54 })
            );
            top.position.set(0, 1.66, 0);
            bollard.add(top);

            bollard.position.set(-4.2, 0, z);
            scene.add(bollard);
            return bollard;
        }

        const bollardFore = createBollard(-4.7);
        const bollardAft = createBollard(4.7);

        const tugGroup = new THREE.Group();
        scene.add(tugGroup);

        const tugShadow = new THREE.Mesh(
            new THREE.CircleGeometry(3.2, 32),
            new THREE.MeshBasicMaterial({ color: 0x02070b, transparent: true, opacity: 0.34 })
        );
        tugShadow.rotation.x = -Math.PI / 2;
        tugShadow.position.y = -0.18;
        tugGroup.add(tugShadow);

        const hullWaterGlow = new THREE.Mesh(
            new THREE.CircleGeometry(2.9, 48),
            new THREE.MeshBasicMaterial({
                color: 0x7fdcff,
                transparent: true,
                opacity: 0.14
            })
        );
        hullWaterGlow.rotation.x = -Math.PI / 2;
        hullWaterGlow.position.y = 0.16;
        hullWaterGlow.scale.set(0.86, 1, 1.95);
        tugGroup.add(hullWaterGlow);
        const proceduralParts = [];

        function registerProceduralPart(part) {
            proceduralParts.push(part);
            return part;
        }

        const hullMaterial = new THREE.MeshStandardMaterial({ color: 0xcf851c, roughness: 0.5, metalness: 0.1 });
        const superstructureMaterial = new THREE.MeshStandardMaterial({ color: 0xd9ebf3, roughness: 0.34, metalness: 0.03 });
        const darkMaterial = new THREE.MeshStandardMaterial({ color: 0x203847, roughness: 0.58, metalness: 0.12 });

        const hullMain = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.15, 6.2), hullMaterial);
        hullMain.position.set(0, 0.62, -0.15);
        tugGroup.add(registerProceduralPart(hullMain));

        const bowBlock = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.15, 1.25), hullMaterial);
        bowBlock.position.set(0, 0.62, -3.82);
        bowBlock.rotation.y = Math.PI / 4;
        tugGroup.add(registerProceduralPart(bowBlock));

        const sternBlock = new THREE.Mesh(new THREE.BoxGeometry(3.05, 1.05, 1.75), hullMaterial);
        sternBlock.position.set(0, 0.58, 3.05);
        tugGroup.add(registerProceduralPart(sternBlock));

        const gunwale = new THREE.Mesh(new THREE.BoxGeometry(3.55, 0.14, 7.9), darkMaterial);
        gunwale.position.set(0, 1.23, -0.12);
        tugGroup.add(registerProceduralPart(gunwale));

        const aftDeck = new THREE.Mesh(new THREE.BoxGeometry(2.45, 0.16, 2.0), darkMaterial);
        aftDeck.position.set(0, 1.32, 2.55);
        tugGroup.add(registerProceduralPart(aftDeck));

        const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.05, 1.5, 2.25), superstructureMaterial);
        cabin.position.set(0, 1.92, -0.55);
        tugGroup.add(registerProceduralPart(cabin));

        const wheelhouse = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.68, 1.5), darkMaterial);
        wheelhouse.position.set(0, 2.27, -0.55);
        tugGroup.add(registerProceduralPart(wheelhouse));

        const mast = new THREE.Mesh(
            new THREE.CylinderGeometry(0.05, 0.07, 1.75, 10),
            new THREE.MeshStandardMaterial({ color: 0xcfd8dc, roughness: 0.34, metalness: 0.24 })
        );
        mast.position.set(0.04, 3.05, -0.25);
        tugGroup.add(registerProceduralPart(mast));

        const funnel = new THREE.Mesh(
            new THREE.CylinderGeometry(0.22, 0.25, 0.7, 18),
            new THREE.MeshStandardMaterial({ color: 0x10181d, roughness: 0.6, metalness: 0.18 })
        );
        funnel.position.set(-0.95, 1.78, 1.7);
        tugGroup.add(registerProceduralPart(funnel));

        const waterline = new THREE.Mesh(
            new THREE.BoxGeometry(3.48, 0.08, 7.8),
            new THREE.MeshBasicMaterial({ color: 0xcfe7f3 })
        );
        waterline.position.set(0, 0.18, -0.05);
        tugGroup.add(registerProceduralPart(waterline));

        function createThruster(color) {
            const thruster = new THREE.Group();

            const strut = new THREE.Mesh(
                new THREE.CylinderGeometry(0.05, 0.05, 0.5, 12),
                new THREE.MeshStandardMaterial({ color: 0x6e7a84, roughness: 0.4, metalness: 0.56 })
            );
            strut.position.y = 0.18;
            thruster.add(strut);

            const pod = new THREE.Mesh(
                new THREE.CylinderGeometry(0.15, 0.18, 0.72, 18),
                new THREE.MeshStandardMaterial({ color, roughness: 0.35, metalness: 0.38 })
            );
            pod.rotation.z = Math.PI / 2;
            pod.position.y = -0.08;
            thruster.add(pod);

            const nozzle = new THREE.Mesh(
                new THREE.TorusGeometry(0.22, 0.05, 12, 24),
                new THREE.MeshStandardMaterial({ color: 0xdbe4ea, roughness: 0.3, metalness: 0.52 })
            );
            nozzle.rotation.y = Math.PI / 2;
            nozzle.position.set(0, -0.08, -0.2);
            thruster.add(nozzle);

            const prop = new THREE.Mesh(
                new THREE.CylinderGeometry(0.11, 0.11, 0.05, 16),
                new THREE.MeshStandardMaterial({ color: 0xd0aa4f, roughness: 0.28, metalness: 0.62 })
            );
            prop.rotation.z = Math.PI / 2;
            prop.position.set(0, -0.08, -0.2);
            thruster.add(prop);

            return { group: thruster, prop };
        }

        const portThruster = createThruster(0x2a4f63);
        const starboardThruster = createThruster(0x5b3e1e);
        portThruster.group.position.set(-0.92, -0.02, 2.75);
        starboardThruster.group.position.set(0.92, -0.02, 2.75);
        tugGroup.add(registerProceduralPart(portThruster.group));
        tugGroup.add(registerProceduralPart(starboardThruster.group));

        const thrusterHelpers = {
            ps: new THREE.ArrowHelper(new THREE.Vector3(0, 0, -1), new THREE.Vector3(-0.92, 0.12, 2.75), 1.1, 0x7cdeff, 0.35, 0.2),
            sb: new THREE.ArrowHelper(new THREE.Vector3(0, 0, -1), new THREE.Vector3(0.92, 0.12, 2.75), 1.1, 0xffb74d, 0.35, 0.2)
        };
        tugGroup.add(registerProceduralPart(thrusterHelpers.ps));
        tugGroup.add(registerProceduralPart(thrusterHelpers.sb));

        const resultantHelper = new THREE.ArrowHelper(
            new THREE.Vector3(0, 0, -1),
            new THREE.Vector3(0, 1.45, 0.2),
            1.2,
            0x7cff8d,
            0.5,
            0.26
        );
        tugGroup.add(registerProceduralPart(resultantHelper));

        function createRope() {
            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.Float32BufferAttribute(new Array(36).fill(0), 3));
            const line = new THREE.Line(
                geometry,
                new THREE.LineBasicMaterial({ color: 0xf6dfb4, transparent: true, opacity: 0.95 })
            );
            scene.add(line);
            return line;
        }

        const foreRope = createRope();
        const aftRope = createRope();

        const hud = {
            speed: document.getElementById('ui-3d-speed'),
            heading: document.getElementById('ui-3d-heading'),
            resultant: document.getElementById('ui-3d-resultant'),
            attitude: document.getElementById('ui-3d-attitude'),
            vectorDirection: document.getElementById('ui-3d-vector-direction'),
            draft: document.getElementById('ui-3d-draft'),
            mooringStatus: document.getElementById('ui-3d-mooring-status'),
            modelStatus: document.getElementById('ui-3d-model-status'),
            fullscreenButton: document.getElementById('btn-3d-fullscreen'),
            anchorPanelButton: document.getElementById('btn-3d-anchor-panel'),
            drivePanelButton: document.getElementById('btn-3d-drive-panel'),
            drivePanel: document.getElementById('three-d-drive-panel'),
            driveEnableButton: document.getElementById('btn-3d-drive-enable'),
            driveStatus: document.getElementById('ui-3d-drive-status'),
            psRpmSlider: document.getElementById('slider-3d-ps-rpm'),
            psAzSlider: document.getElementById('slider-3d-ps-az'),
            sbRpmSlider: document.getElementById('slider-3d-sb-rpm'),
            sbAzSlider: document.getElementById('slider-3d-sb-az'),
            psRpmValue: document.getElementById('ui-3d-ps-rpm-val'),
            psAzValue: document.getElementById('ui-3d-ps-az-val'),
            sbRpmValue: document.getElementById('ui-3d-sb-rpm-val'),
            sbAzValue: document.getElementById('ui-3d-sb-az-val'),
            anchorPanel: document.getElementById('three-d-anchor-panel'),
            anchorPointSelect: document.getElementById('select-3d-anchor-point'),
            anchorXSlider: document.getElementById('slider-3d-anchor-x'),
            anchorYSlider: document.getElementById('slider-3d-anchor-y'),
            anchorZSlider: document.getElementById('slider-3d-anchor-z'),
            anchorXValue: document.getElementById('ui-3d-anchor-x-val'),
            anchorYValue: document.getElementById('ui-3d-anchor-y-val'),
            anchorZValue: document.getElementById('ui-3d-anchor-z-val'),
            anchorSaveButton: document.getElementById('btn-3d-anchor-save'),
            anchorSaveStatus: document.getElementById('ui-3d-anchor-save-status')
        };

        const modelConfig = window.tuglife3dModelConfig || {};
        let externalModel = null;
        const mooringState = window.gameState.visual3d.mooring;
        const driveControls = window.gameState.visual3d.driveControls;
        const raycaster = new THREE.Raycaster();
        const pointer = new THREE.Vector2();
        const anchorMeshes = [];
        const anchorStorageKey = 'tuglife_anchor_positions_v1';
        const defaultTugAnchorPositions = {
            fore: { x: 1.62, y: -2.05, z: 1.18 },
            aft: { x: -1.34, y: 1.98, z: 1.14 }
        };
        let anchorPanelOpen = false;
        let anchorPanelDirty = false;
        let drivePanelOpen = false;

        function updateFullscreenButtonLabel() {
            if (!hud.fullscreenButton) return;
            hud.fullscreenButton.textContent = document.fullscreenElement === panel3d ? 'SAIR DA TELA CHEIA' : 'TELA CHEIA';
        }

        async function toggleFullscreen() {
            if (!panel3d || !document.fullscreenEnabled) return;

            try {
                if (document.fullscreenElement === panel3d) {
                    await document.exitFullscreen();
                } else {
                    await panel3d.requestFullscreen();
                }
            } catch (error) {
                console.error('Falha ao alternar fullscreen do painel 3D.', error);
            }

            forceStageRefresh();
            updateFullscreenButtonLabel();
        }

        function getConnectedLineCount() {
            return Object.values(mooringState.lines).filter((line) => Boolean(line.dockAnchorId)).length;
        }

        function syncMooringFlag() {
            window.gameState.visual3d.mooringConnected = getConnectedLineCount() > 0;
        }

        function createAnchorMarker(color) {
            const marker = new THREE.Mesh(
                new THREE.SphereGeometry(0.11, 18, 18),
                new THREE.MeshStandardMaterial({
                    color,
                    emissive: color,
                    emissiveIntensity: 0.6,
                    roughness: 0.28,
                    metalness: 0.16
                })
            );
            marker.userData.isAnchorMarker = true;
            anchorMeshes.push(marker);
            return marker;
        }

        function makeAnchorPoint(parent, position, anchorId, lineKey, type, color) {
            const marker = createAnchorMarker(color);
            marker.position.copy(position);
            marker.userData.anchorId = anchorId;
            marker.userData.lineKey = lineKey;
            marker.userData.anchorType = type;
            parent.add(marker);
            return marker;
        }

        function readStoredAnchorPositions() {
            try {
                const raw = window.localStorage.getItem(anchorStorageKey);
                if (!raw) return JSON.parse(JSON.stringify(defaultTugAnchorPositions));
                const parsed = JSON.parse(raw);
                return {
                    fore: {
                        x: Number(parsed?.fore?.x ?? defaultTugAnchorPositions.fore.x),
                        y: Number(parsed?.fore?.y ?? defaultTugAnchorPositions.fore.y),
                        z: Number(parsed?.fore?.z ?? defaultTugAnchorPositions.fore.z)
                    },
                    aft: {
                        x: Number(parsed?.aft?.x ?? defaultTugAnchorPositions.aft.x),
                        y: Number(parsed?.aft?.y ?? defaultTugAnchorPositions.aft.y),
                        z: Number(parsed?.aft?.z ?? defaultTugAnchorPositions.aft.z)
                    }
                };
            } catch (error) {
                return JSON.parse(JSON.stringify(defaultTugAnchorPositions));
            }
        }

        const tugAnchorPositions = readStoredAnchorPositions();
        const tugAnchorMarkers = {
            fore: makeAnchorPoint(tugGroup, new THREE.Vector3(tugAnchorPositions.fore.x, tugAnchorPositions.fore.z, tugAnchorPositions.fore.y), 'tug_fore', 'fore', 'tug', 0x4dd9ff),
            aft: makeAnchorPoint(tugGroup, new THREE.Vector3(tugAnchorPositions.aft.x, tugAnchorPositions.aft.z, tugAnchorPositions.aft.y), 'tug_aft', 'aft', 'tug', 0x7cff8d)
        };
        const dockAnchorMarkers = {
            fore: makeAnchorPoint(scene, new THREE.Vector3(-4.2, 1.8, -4.7), 'dock_fore', 'fore', 'dock', 0xffd36e),
            aft: makeAnchorPoint(scene, new THREE.Vector3(-4.2, 1.8, 4.7), 'dock_aft', 'aft', 'dock', 0xffd36e)
        };

        function updateAnchorPanelStatus(text, color) {
            if (!hud.anchorSaveStatus) return;
            hud.anchorSaveStatus.textContent = text;
            if (color) hud.anchorSaveStatus.style.color = color;
        }

        function getSelectedAnchorKey() {
            return hud.anchorPointSelect ? hud.anchorPointSelect.value : 'fore';
        }

        function updateAnchorSliderValues() {
            const lineKey = getSelectedAnchorKey();
            const marker = tugAnchorMarkers[lineKey];
            if (!marker) return;
            if (hud.anchorXSlider) hud.anchorXSlider.value = marker.position.x.toFixed(2);
            if (hud.anchorYSlider) hud.anchorYSlider.value = marker.position.z.toFixed(2);
            if (hud.anchorZSlider) hud.anchorZSlider.value = marker.position.y.toFixed(2);
            if (hud.anchorXValue) hud.anchorXValue.textContent = marker.position.x.toFixed(2);
            if (hud.anchorYValue) hud.anchorYValue.textContent = marker.position.z.toFixed(2);
            if (hud.anchorZValue) hud.anchorZValue.textContent = marker.position.y.toFixed(2);
        }

        function setSelectedAnchorMarkerPosition() {
            const lineKey = getSelectedAnchorKey();
            const marker = tugAnchorMarkers[lineKey];
            if (!marker || !hud.anchorXSlider || !hud.anchorYSlider || !hud.anchorZSlider) return;
            marker.position.x = parseFloat(hud.anchorXSlider.value);
            marker.position.z = parseFloat(hud.anchorYSlider.value);
            marker.position.y = parseFloat(hud.anchorZSlider.value);
            anchorPanelDirty = true;
            updateAnchorSliderValues();
            updateAnchorPanelStatus('ALTERADO', '#ffd36e');
        }

        function saveAnchorPositions() {
            const payload = {
                fore: {
                    x: tugAnchorMarkers.fore.position.x,
                    y: tugAnchorMarkers.fore.position.z,
                    z: tugAnchorMarkers.fore.position.y
                },
                aft: {
                    x: tugAnchorMarkers.aft.position.x,
                    y: tugAnchorMarkers.aft.position.z,
                    z: tugAnchorMarkers.aft.position.y
                }
            };
            window.localStorage.setItem(anchorStorageKey, JSON.stringify(payload));
            anchorPanelDirty = false;
            updateAnchorPanelStatus('SALVO', '#9ed8b0');
        }

        function toggleAnchorPanel(forceOpen) {
            anchorPanelOpen = typeof forceOpen === 'boolean' ? forceOpen : !anchorPanelOpen;
            if (hud.anchorPanel) hud.anchorPanel.style.display = anchorPanelOpen ? 'block' : 'none';
            if (hud.anchorPanelButton) hud.anchorPanelButton.textContent = anchorPanelOpen ? 'FECHAR AJUSTE DO TUG' : 'AJUSTAR PONTOS DO TUG';
            if (anchorPanelOpen) updateAnchorSliderValues();
        }

        function updateDrivePanelValues() {
            if (hud.psRpmSlider) hud.psRpmSlider.value = driveControls.ps.rpm;
            if (hud.psAzSlider) hud.psAzSlider.value = driveControls.ps.azimuth;
            if (hud.sbRpmSlider) hud.sbRpmSlider.value = driveControls.sb.rpm;
            if (hud.sbAzSlider) hud.sbAzSlider.value = driveControls.sb.azimuth;
            if (hud.psRpmValue) hud.psRpmValue.textContent = `${driveControls.ps.rpm}`;
            if (hud.psAzValue) hud.psAzValue.textContent = `${driveControls.ps.azimuth}°`;
            if (hud.sbRpmValue) hud.sbRpmValue.textContent = `${driveControls.sb.rpm}`;
            if (hud.sbAzValue) hud.sbAzValue.textContent = `${driveControls.sb.azimuth}°`;
        }

        function toggleDrivePanel(forceOpen) {
            drivePanelOpen = typeof forceOpen === 'boolean' ? forceOpen : !drivePanelOpen;
            if (hud.drivePanel) hud.drivePanel.style.display = drivePanelOpen ? 'block' : 'none';
            if (hud.drivePanelButton) hud.drivePanelButton.textContent = drivePanelOpen ? 'FECHAR PROPULSÃO 3D' : 'PAINEL DE PROPULSÃO 3D';
            if (drivePanelOpen) updateDrivePanelValues();
        }

        function setDriveReadinessStatus() {
            const readiness = window.getOperationalReadiness();
            if (!hud.driveStatus || !hud.driveEnableButton) return readiness;
            hud.driveStatus.textContent = readiness.ready ? 'LIBERADO' : 'BLOQUEADO';
            hud.driveStatus.style.color = readiness.ready ? '#9ed8b0' : '#ffb74d';
            hud.driveEnableButton.disabled = !readiness.ready;
            hud.driveEnableButton.textContent = driveControls.enabled ? 'DESATIVAR CONTROLES 3D' : 'ATIVAR CONTROLES 3D';
            return readiness;
        }

        function updateDriveDirectionLabel(localX, localZ, resultant) {
            if (!hud.vectorDirection) return;
            if (resultant < 0.05) {
                hud.vectorDirection.textContent = 'SEM EMPUXO';
                return;
            }

            const heading = (Math.atan2(localX, -localZ) * 180 / Math.PI + 360) % 360;
            const lateral = localX > 0.2 ? 'BE' : localX < -0.2 ? 'BB' : '';
            const longitudinal = localZ < -0.2 ? 'AVANTE' : localZ > 0.2 ? 'A RÉ' : '';
            const label = [longitudinal, lateral].filter(Boolean).join(' / ') || `${heading.toFixed(0)}°`;
            hud.vectorDirection.textContent = label;
        }

        function getDockAnchorPoint(anchorId) {
            if (anchorId === 'dock_fore') return dockAnchorMarkers.fore.getWorldPosition(new THREE.Vector3());
            if (anchorId === 'dock_aft') return dockAnchorMarkers.aft.getWorldPosition(new THREE.Vector3());
            return null;
        }

        function updateAnchorVisuals(elapsed) {
            const pulse = 0.5 + Math.sin(elapsed * 3.2) * 0.18;
            Object.entries(tugAnchorMarkers).forEach(([lineKey, marker]) => {
                const isSelected = mooringState.selectedTugLine === lineKey;
                const isConnected = Boolean(mooringState.lines[lineKey].dockAnchorId);
                marker.material.emissive.set(isSelected ? 0x00e5ff : isConnected ? 0x62ff95 : 0x247f96);
                marker.material.emissiveIntensity = isSelected ? 1.1 + pulse : isConnected ? 0.82 : 0.42;
                marker.scale.setScalar(isSelected ? 1.28 : 1);
            });

            Object.values(dockAnchorMarkers).forEach((marker) => {
                const usedByLine = Object.entries(mooringState.lines).find(([, line]) => line.dockAnchorId === marker.userData.anchorId);
                const waitingForDock = Boolean(mooringState.selectedTugLine);
                marker.material.emissive.set(waitingForDock ? 0xfff08a : usedByLine ? 0xffc04d : 0x8a6a22);
                marker.material.emissiveIntensity = waitingForDock ? 1.0 + pulse : usedByLine ? 0.85 : 0.45;
                marker.scale.setScalar(waitingForDock ? 1.18 : 1);
            });
        }

        function handleAnchorSelection(anchorData) {
            if (anchorData.anchorType === 'tug') {
                const lineKey = anchorData.lineKey;
                if (hud.anchorPointSelect) hud.anchorPointSelect.value = lineKey;
                updateAnchorSliderValues();
                updateAnchorPanelStatus(anchorPanelDirty ? 'ALTERADO' : 'SALVO', anchorPanelDirty ? '#ffd36e' : '#9ed8b0');
                if (mooringState.lines[lineKey].dockAnchorId) {
                    mooringState.lines[lineKey].dockAnchorId = null;
                    if (mooringState.selectedTugLine === lineKey) mooringState.selectedTugLine = null;
                } else {
                    mooringState.selectedTugLine = mooringState.selectedTugLine === lineKey ? null : lineKey;
                }
            } else if (anchorData.anchorType === 'dock') {
                if (mooringState.selectedTugLine) {
                    mooringState.lines[mooringState.selectedTugLine].dockAnchorId = anchorData.anchorId;
                    mooringState.selectedTugLine = null;
                } else {
                    const usedEntry = Object.entries(mooringState.lines).find(([, line]) => line.dockAnchorId === anchorData.anchorId);
                    if (usedEntry) {
                        usedEntry[1].dockAnchorId = null;
                    }
                }
            }

            syncMooringFlag();
        }

        if (hud.anchorPanelButton) {
            hud.anchorPanelButton.addEventListener('click', () => toggleAnchorPanel());
        }

        if (hud.drivePanelButton) {
            hud.drivePanelButton.addEventListener('click', () => toggleDrivePanel());
        }

        if (hud.driveEnableButton) {
            hud.driveEnableButton.addEventListener('click', () => {
                const readiness = setDriveReadinessStatus();
                if (!readiness.ready) {
                    driveControls.enabled = false;
                    return;
                }
                driveControls.enabled = !driveControls.enabled;
                setDriveReadinessStatus();
            });
        }

        [
            ['psRpmSlider', 'ps', 'rpm'],
            ['psAzSlider', 'ps', 'azimuth'],
            ['sbRpmSlider', 'sb', 'rpm'],
            ['sbAzSlider', 'sb', 'azimuth']
        ].forEach(([hudKey, side, field]) => {
            if (!hud[hudKey]) return;
            hud[hudKey].addEventListener('input', () => {
                driveControls[side][field] = parseInt(hud[hudKey].value, 10);
                updateDrivePanelValues();
            });
        });

        if (hud.anchorPointSelect) {
            hud.anchorPointSelect.addEventListener('change', () => {
                updateAnchorSliderValues();
                updateAnchorPanelStatus(anchorPanelDirty ? 'ALTERADO' : 'SALVO', anchorPanelDirty ? '#ffd36e' : '#9ed8b0');
            });
        }

        if (hud.anchorXSlider) {
            hud.anchorXSlider.addEventListener('input', setSelectedAnchorMarkerPosition);
        }

        if (hud.anchorYSlider) {
            hud.anchorYSlider.addEventListener('input', setSelectedAnchorMarkerPosition);
        }

        if (hud.anchorZSlider) {
            hud.anchorZSlider.addEventListener('input', setSelectedAnchorMarkerPosition);
        }

        if (hud.anchorSaveButton) {
            hud.anchorSaveButton.addEventListener('click', saveAnchorPositions);
        }

        updateAnchorSliderValues();
        updateAnchorPanelStatus('SALVO', '#9ed8b0');
        updateDrivePanelValues();
        setDriveReadinessStatus();

        function setModelStatus(text, color) {
            if (!hud.modelStatus) return;
            hud.modelStatus.textContent = text;
            if (color) hud.modelStatus.style.color = color;
        }

        function setProceduralVisibility(visible) {
            proceduralParts.forEach((part) => {
                part.visible = visible;
            });
        }

        function loadExternalModel() {
            if (!window.GLTFLoader || !modelConfig.path) {
                setModelStatus('SEM GLTFLOADER', '#8aa3af');
                return;
            }

            setModelStatus('CARREGANDO GLTF', '#7cdeff');
            setProceduralVisibility(false);
            const loader = new window.GLTFLoader();
            const normalizedPath = `${modelConfig.path}`.replace(/\\/g, '/');
            const lastSlash = normalizedPath.lastIndexOf('/');
            const resourcePath = lastSlash >= 0 ? normalizedPath.slice(0, lastSlash + 1) : '';
            const fileName = lastSlash >= 0 ? normalizedPath.slice(lastSlash + 1) : normalizedPath;
            loader.setPath(resourcePath);
            loader.setResourcePath(resourcePath);
            loader.load(
                fileName,
                (gltf) => {
                    externalModel = gltf.scene || gltf.scenes?.[0];
                    if (!externalModel) {
                        setModelStatus('GLTF INVALIDO', '#ff8a80');
                        setProceduralVisibility(true);
                        return;
                    }

                    externalModel.traverse((node) => {
                        if (node.isMesh) {
                            node.castShadow = false;
                            node.receiveShadow = true;
                        }
                    });

                    const fitBox = new THREE.Box3().setFromObject(externalModel);
                    const fitSize = fitBox.getSize(new THREE.Vector3());
                    const dominantLength = Math.max(fitSize.x, fitSize.y, fitSize.z) || 1;
                    const autoFitScale = modelConfig.autoFit === false
                        ? 1
                        : (modelConfig.targetLength || 8.4) / dominantLength;
                    const scale = (modelConfig.scale || 1) * autoFitScale;
                    const offset = modelConfig.offset || { x: 0, y: 0, z: 0 };
                    externalModel.scale.set(scale, scale, scale);
                    externalModel.rotation.set(
                        THREE.MathUtils.degToRad(modelConfig.rotationXDeg || 0),
                        THREE.MathUtils.degToRad(modelConfig.rotationYDeg || 0),
                        THREE.MathUtils.degToRad(modelConfig.rotationZDeg || 0)
                    );

                    const alignedBox = new THREE.Box3().setFromObject(externalModel);
                    const alignedCenter = alignedBox.getCenter(new THREE.Vector3());
                    const alignedMin = alignedBox.min.clone();

                    externalModel.position.set(
                        (offset.x || 0) - alignedCenter.x,
                        (offset.y || 0) - alignedMin.y,
                        (offset.z || 0) - alignedCenter.z
                    );
                    tugGroup.add(externalModel);

                    setProceduralVisibility(false);
                    setModelStatus('MODELO GLTF ATIVO', '#9ed8b0');
                },
                (event) => {
                    if (!event || !event.total) return;
                    const progress = Math.round((event.loaded / event.total) * 100);
                    setModelStatus(`CARREGANDO ${progress}%`, '#7cdeff');
                },
                (error) => {
                    const errorMessage = error?.message || error?.target?.statusText || 'erro ao carregar';
                    const isFileProtocol = typeof window !== 'undefined' && window.location && window.location.protocol === 'file:';
                    setModelStatus(isFileProtocol ? 'GLTF BLOQUEADO EM FILE://' : 'FALLBACK PADRAO', '#ffb74d');
                    setProceduralVisibility(true);
                    console.error('Falha ao carregar modelo GLTF:', errorMessage, error);
                }
            );
        }

        loadExternalModel();

        const vessel = window.gameState.visual3d.vessel;
        const orbit = {
            yaw: 0.9,
            pitch: 0.52,
            distance: 12.5,
            dragging: false,
            pointerId: null,
            lastX: 0,
            lastY: 0
        };

        syncMooringFlag();
        if (window.gameState.visual3d.mooringConnected) {
            vessel.x = -1.1;
            vessel.z = 0;
            vessel.yaw = THREE.MathUtils.degToRad(6);
        }

        let lastWidth = 0;
        let lastHeight = 0;

        function resizeIfNeeded() {
            const width = Math.max(stage.clientWidth, 1);
            const height = Math.max(stage.clientHeight, 1);
            if (width === lastWidth && height === lastHeight) return;
            lastWidth = width;
            lastHeight = height;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height, false);
        }

        function forceStageRefresh() {
            resizeIfNeeded();
            if (stage.clientWidth && stage.clientHeight) {
                renderer.render(scene, camera);
            }
        }

        function setRopeGeometry(line, start, end, sag, elapsed, tension) {
            const positions = [];
            const segmentCount = 12;
            const distance = start.distanceTo(end);
            const ropeSag = sag + distance * 0.03 + (1 - tension) * 0.18;
            for (let i = 0; i < segmentCount; i++) {
                const t = i / (segmentCount - 1);
                const sideSway = Math.sin(elapsed * 1.7 + t * Math.PI * 2.2) * 0.03 * (1 - tension);
                const verticalDrop = Math.sin(t * Math.PI) * ropeSag;
                positions.push(
                    THREE.MathUtils.lerp(start.x, end.x, t),
                    THREE.MathUtils.lerp(start.y, end.y, t) - verticalDrop,
                    THREE.MathUtils.lerp(start.z, end.z, t) + sideSway
                );
            }
            line.geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
            line.geometry.attributes.position.needsUpdate = true;
        }

        function updateOrbitFromInput(dx, dy) {
            orbit.yaw -= dx * 0.008;
            orbit.pitch = THREE.MathUtils.clamp(orbit.pitch - dy * 0.006, 0.18, 1.22);
        }

        function tryHandleAnchorClick(event) {
            const rect = renderer.domElement.getBoundingClientRect();
            pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            raycaster.setFromCamera(pointer, camera);
            const hits = raycaster.intersectObjects(anchorMeshes, false);
            if (!hits.length) return;
            handleAnchorSelection(hits[0].object.userData);
        }

        stage.addEventListener('pointerdown', (event) => {
            orbit.dragging = true;
            orbit.pointerId = event.pointerId;
            orbit.lastX = event.clientX;
            orbit.lastY = event.clientY;
            orbit.dragMoved = false;
            if (stage.setPointerCapture) stage.setPointerCapture(event.pointerId);
        });

        stage.addEventListener('pointermove', (event) => {
            if (!orbit.dragging || orbit.pointerId !== event.pointerId) return;
            const dx = event.clientX - orbit.lastX;
            const dy = event.clientY - orbit.lastY;
            if (Math.abs(dx) + Math.abs(dy) > 3) orbit.dragMoved = true;
            updateOrbitFromInput(dx, dy);
            orbit.lastX = event.clientX;
            orbit.lastY = event.clientY;
        });

        function endDrag(event) {
            if (orbit.pointerId !== event.pointerId) return;
            const shouldHandleClick = !orbit.dragMoved;
            orbit.dragging = false;
            orbit.pointerId = null;
            if (stage.releasePointerCapture) {
                try {
                    stage.releasePointerCapture(event.pointerId);
                } catch (error) {
                    // Ignore release errors when the pointer is already detached.
                }
            }
            if (shouldHandleClick) tryHandleAnchorClick(event);
        }

        stage.addEventListener('pointerup', endDrag);
        stage.addEventListener('pointercancel', endDrag);
        stage.addEventListener('wheel', (event) => {
            event.preventDefault();
            orbit.distance = THREE.MathUtils.clamp(orbit.distance + event.deltaY * 0.01, 6, 24);
        }, { passive: false });

        function getThrusterState(side) {
            const mcp = window.gameState.machinery[`mcp_${side}`];
            const zd = window.gameState.machinery[`zd_${side}`];
            const localOrigin = side === 'ps' ? new THREE.Vector3(-0.92, 0.12, 2.75) : new THREE.Vector3(0.92, 0.12, 2.75);
            const readiness = window.getOperationalReadiness();
            const controlSource = driveControls.enabled && readiness.ready ? driveControls[side] : null;
            const active = controlSource
                ? controlSource.rpm > 0
                : (mcp.status === 'RUNNING' && mcp.clutchEngaged && zd.gearboxLO.vol > 0 && readiness.ready);
            const thrust = controlSource ? Math.min(controlSource.rpm / 1800, 1) : active ? zd.thrust / 100 : 0;
            const rpm = controlSource ? controlSource.rpm : zd.propRpm;
            const azimuth = controlSource ? controlSource.azimuth : zd.azimuth;
            const azimuthRad = THREE.MathUtils.degToRad(azimuth);
            const localDirection = new THREE.Vector3(Math.sin(azimuthRad), 0, -Math.cos(azimuthRad)).normalize();

            return { active, thrust, origin: localOrigin, direction: localDirection, rpm, azimuth, readiness };
        }

        function updatePhysics(dt) {
            const ps = getThrusterState('ps');
            const sb = getThrusterState('sb');
            const thrusters = [ps, sb];

            let forceX = 0;
            let forceZ = 0;
            let torque = 0;

            thrusters.forEach((thruster, index) => {
                const magnitude = thruster.thrust * 3.8;
                forceX += thruster.direction.x * magnitude;
                forceZ += thruster.direction.z * magnitude;
                torque += thruster.origin.x * (thruster.direction.z * magnitude) - thruster.origin.z * (thruster.direction.x * magnitude);

                const helper = index === 0 ? thrusterHelpers.ps : thrusterHelpers.sb;
                helper.position.copy(thruster.origin);
                helper.setDirection(thruster.direction.clone().normalize());
                helper.setLength(Math.max(0.35, 0.8 + magnitude * 0.9), 0.35, 0.2);
                helper.setColor(new THREE.Color(thruster.active ? (index === 0 ? 0x7cdeff : 0xffb74d) : 0x4a5f66));
                helper.visible = thruster.active || magnitude > 0.01;
            });

            const connectedLineCount = getConnectedLineCount();
            if (connectedLineCount > 0) {
                const mooringStrength = connectedLineCount / 2;
                vessel.vx *= 0.88 - mooringStrength * 0.08;
                vessel.vz *= 0.88 - mooringStrength * 0.08;
                vessel.yawRate *= 0.86 - mooringStrength * 0.08;
                vessel.x = THREE.MathUtils.lerp(vessel.x, -1.1, 0.025 + mooringStrength * 0.05);
                vessel.z = THREE.MathUtils.lerp(vessel.z, 0, 0.02 + mooringStrength * 0.045);
                vessel.yaw = THREE.MathUtils.lerp(vessel.yaw, THREE.MathUtils.degToRad(6), 0.02 + mooringStrength * 0.045);
                return { resultant: Math.sqrt(forceX * forceX + forceZ * forceZ), localX: forceX, localZ: forceZ, ps, sb };
            }

            const heading = vessel.yaw;
            const cos = Math.cos(heading);
            const sin = Math.sin(heading);
            const worldFx = forceX * cos - forceZ * sin;
            const worldFz = forceX * sin + forceZ * cos;

            vessel.vx = vessel.vx * 0.925 + worldFx * dt * 0.18;
            vessel.vz = vessel.vz * 0.925 + worldFz * dt * 0.18;
            vessel.yawRate = vessel.yawRate * 0.88 + torque * dt * 0.085;

            vessel.x += vessel.vx * dt;
            vessel.z += vessel.vz * dt;
            vessel.yaw += vessel.yawRate * dt;

            return { resultant: Math.sqrt(forceX * forceX + forceZ * forceZ), localX: forceX, localZ: forceZ, ps, sb };
        }

        function updateVisuals(state, elapsed) {
            const hydrostatics = window.calculateVesselHydrostatics();
            const heelSign = (hydrostatics.heelDirection === 'BE' ? 1 : hydrostatics.heelDirection === 'BB' ? -1 : 0) * (modelConfig.heelVisualSign || 1);
            const trimSign = (hydrostatics.trimDirection === 'POP' ? 1 : hydrostatics.trimDirection === 'PROA' ? -1 : 0) * (modelConfig.trimVisualSign || 1);
            const maneuverHeel = THREE.MathUtils.clamp((state.sb.thrust - state.ps.thrust) * 0.08, -0.18, 0.18);
            const baseHeel = THREE.MathUtils.degToRad(parseFloat(hydrostatics.heelDeg || 0)) * heelSign * 0.95;
            const baseTrim = THREE.MathUtils.degToRad(parseFloat(hydrostatics.trimDeg || 0)) * trimSign * 1.12;
            const heave = hydrostatics.visualOffset + Math.sin(elapsed * 1.3) * 0.015;

            tugGroup.position.set(vessel.x, heave, vessel.z);
            tugGroup.rotation.y = vessel.yaw;
            tugGroup.rotation.z = THREE.MathUtils.lerp(tugGroup.rotation.z, baseHeel + maneuverHeel, 0.08);
            tugGroup.rotation.x = THREE.MathUtils.lerp(tugGroup.rotation.x, baseTrim + Math.sin(elapsed * 1.7) * 0.02, 0.08);

            portThruster.group.rotation.y = Math.atan2(state.ps.direction.x, -state.ps.direction.z);
            starboardThruster.group.rotation.y = Math.atan2(state.sb.direction.x, -state.sb.direction.z);
            portThruster.prop.rotation.x += 0.35 + state.ps.thrust * 0.7;
            starboardThruster.prop.rotation.x += 0.35 + state.sb.thrust * 0.7;

            resultantHelper.setDirection(new THREE.Vector3(state.localX, 0, state.localZ || -0.001).normalize());
            resultantHelper.setLength(Math.max(0.25, 0.7 + state.resultant * 0.5), 0.5, 0.26);
            resultantHelper.visible = state.resultant > 0.01;

            const wave = water.geometry.attributes.position;
            for (let i = 0; i < wave.count; i++) {
                const x = wave.getX(i);
                const z = wave.getZ(i);
                const y = Math.sin(elapsed * 1.28 + x * 0.14 + z * 0.12) * 0.06
                    + Math.cos(elapsed * 1.6 + z * 0.09) * 0.025;
                wave.setY(i, y);
            }
            wave.needsUpdate = true;
            water.geometry.computeVertexNormals();
            waterUnderlay.material.opacity = 0.48 + Math.sin(elapsed * 0.8) * 0.04;
            harborWater.material.opacity = 0.22 + Math.sin(elapsed * 0.9) * 0.03;
            hullWaterGlow.material.opacity = 0.12 + Math.sin(elapsed * 1.5) * 0.03;
            updateAnchorVisuals(elapsed);

            const forePoint = tugAnchorMarkers.fore.getWorldPosition(new THREE.Vector3());
            const aftPoint = tugAnchorMarkers.aft.getWorldPosition(new THREE.Vector3());
            const foreDockPoint = getDockAnchorPoint(mooringState.lines.fore.dockAnchorId);
            const aftDockPoint = getDockAnchorPoint(mooringState.lines.aft.dockAnchorId);
            const foreDistance = foreDockPoint ? forePoint.distanceTo(foreDockPoint) : 0;
            const aftDistance = aftDockPoint ? aftPoint.distanceTo(aftDockPoint) : 0;
            const foreTension = THREE.MathUtils.clamp(1 - foreDistance / 8, 0.15, 0.95);
            const aftTension = THREE.MathUtils.clamp(1 - aftDistance / 8, 0.15, 0.95);

            foreRope.visible = Boolean(foreDockPoint);
            aftRope.visible = Boolean(aftDockPoint);
            if (foreDockPoint) {
                setRopeGeometry(foreRope, forePoint, foreDockPoint, 0.18, elapsed, foreTension);
            }
            if (aftDockPoint) {
                setRopeGeometry(aftRope, aftPoint, aftDockPoint, 0.14, elapsed, aftTension);
            }

            const target = new THREE.Vector3(vessel.x - 0.2, 1.0, vessel.z);
            const horizontalDistance = Math.cos(orbit.pitch) * orbit.distance;
            camera.position.x = target.x + Math.sin(orbit.yaw) * horizontalDistance;
            camera.position.z = target.z + Math.cos(orbit.yaw) * horizontalDistance;
            camera.position.y = target.y + Math.sin(orbit.pitch) * orbit.distance;
            camera.lookAt(target);

            const speed = Math.sqrt(vessel.vx * vessel.vx + vessel.vz * vessel.vz) * 1.94;
            const headingDeg = ((THREE.MathUtils.radToDeg(vessel.yaw) % 360) + 360) % 360;
            const readiness = setDriveReadinessStatus();
            updateDriveDirectionLabel(state.localX, state.localZ, state.resultant);
            if (hud.speed) hud.speed.textContent = `${speed.toFixed(2)} kn`;
            if (hud.heading) hud.heading.textContent = `${headingDeg.toFixed(0).padStart(3, '0')}°`;
            if (hud.resultant) hud.resultant.textContent = `${(state.resultant * 10).toFixed(1)} kN`;
            if (hud.attitude) hud.attitude.textContent = `Banda ${hydrostatics.heelDirection} ${hydrostatics.heelDeg}° / Trim ${hydrostatics.trimDirection} ${hydrostatics.trimDeg}°`;
            if (hud.draft) hud.draft.textContent = `${hydrostatics.draftMeters.toFixed(2)} m`;
            if (hud.mooringStatus) {
                const connectedCount = getConnectedLineCount();
                if (mooringState.selectedTugLine) {
                    hud.mooringStatus.textContent = `SELECIONE O CABEÇO DO CAIS (${mooringState.selectedTugLine === 'fore' ? 'PROA' : 'POPA'})`;
                    hud.mooringStatus.style.color = '#7cdeff';
                } else if (!readiness.ready) {
                    hud.mooringStatus.textContent = `BLOQUEADO: ${readiness.blockers[0] || 'sistema indisponível'}`;
                    hud.mooringStatus.style.color = '#ffb74d';
                } else if (connectedCount === 2) {
                    hud.mooringStatus.textContent = 'AMARRADO PROA E POPA';
                    hud.mooringStatus.style.color = '#9ed8b0';
                } else if (connectedCount === 1) {
                    hud.mooringStatus.textContent = 'AMARRAÇÃO PARCIAL';
                    hud.mooringStatus.style.color = '#ffd36e';
                } else {
                    hud.mooringStatus.textContent = 'SEM AMARRAÇÃO';
                    hud.mooringStatus.style.color = '#ffb74d';
                }
            }
        }

        const clock = new THREE.Clock();
        function animate() {
            requestAnimationFrame(animate);
            resizeIfNeeded();
            if (!stage.clientWidth || !stage.clientHeight) return;
            const dt = Math.min(clock.getDelta(), 0.05);
            const elapsed = clock.elapsedTime;
            const state = updatePhysics(dt);
            updateVisuals(state, elapsed);
            renderer.render(scene, camera);
        }

        if (hud.fullscreenButton) {
            hud.fullscreenButton.addEventListener('click', toggleFullscreen);
        }

        document.addEventListener('fullscreenchange', () => {
            updateFullscreenButtonLabel();
            forceStageRefresh();
        });

        updateFullscreenButtonLabel();
        window.addEventListener('resize', resizeIfNeeded);
        window.addEventListener('tuglife:tabchange', (event) => {
            const tab = event?.detail?.tab;
            const desktopPanels = event?.detail?.desktopPanels || {};
            const visual3dVisible = tab === 'visual3d' || Object.values(desktopPanels).includes('visual3d');

            if (!visual3dVisible) return;

            requestAnimationFrame(() => {
                forceStageRefresh();
                setTimeout(forceStageRefresh, 120);
            });
        });
        animate();
    } catch (error) {
        stage.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#ffb4b4;font-family:Segoe UI,Arial,sans-serif;padding:24px;text-align:center;">Falha ao inicializar a cena 3D do rebocador.</div>';
        console.error(error);
    }
}
