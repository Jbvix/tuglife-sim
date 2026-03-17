const stage = typeof document !== 'undefined' ? document.getElementById('three-d-stage') : null;

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
        water.position.y = 0.08;
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
        waterUnderlay.position.y = -0.28;
        scene.add(waterUnderlay);

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
        tugGroup.add(thrusterHelpers.ps);
        tugGroup.add(thrusterHelpers.sb);

        const resultantHelper = new THREE.ArrowHelper(
            new THREE.Vector3(0, 0, -1),
            new THREE.Vector3(0, 1.45, 0.2),
            1.2,
            0x7cff8d,
            0.5,
            0.26
        );
        tugGroup.add(resultantHelper);

        function createRope() {
            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.Float32BufferAttribute(new Array(18).fill(0), 3));
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
            mooringStatus: document.getElementById('ui-3d-mooring-status'),
            mooringButton: document.getElementById('btn-3d-mooring'),
            modelStatus: document.getElementById('ui-3d-model-status')
        };

        const modelConfig = window.tuglife3dModelConfig || {};
        let externalModel = null;

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
                        setModelStatus('GLTF INVÁLIDO', '#ff8a80');
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
                    setModelStatus(isFileProtocol ? 'GLTF BLOQUEADO EM FILE://' : 'FALLBACK PADRÃO', '#ffb74d');
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

        if (hud.mooringButton) {
            hud.mooringButton.addEventListener('click', () => {
                window.gameState.visual3d.mooringConnected = !window.gameState.visual3d.mooringConnected;
                if (window.gameState.visual3d.mooringConnected) {
                    vessel.x = -1.1;
                    vessel.z = 0;
                    vessel.vx = 0;
                    vessel.vz = 0;
                    vessel.yaw = THREE.MathUtils.degToRad(6);
                    vessel.yawRate = 0;
                }
            });
        }

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

        function setRopeGeometry(line, start, end, sag) {
            const positions = [];
            for (let i = 0; i < 6; i++) {
                const t = i / 5;
                positions.push(
                    THREE.MathUtils.lerp(start.x, end.x, t),
                    THREE.MathUtils.lerp(start.y, end.y, t) - Math.sin(t * Math.PI) * sag,
                    THREE.MathUtils.lerp(start.z, end.z, t)
                );
            }
            line.geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
            line.geometry.attributes.position.needsUpdate = true;
        }

        function updateOrbitFromInput(dx, dy) {
            orbit.yaw -= dx * 0.008;
            orbit.pitch = THREE.MathUtils.clamp(orbit.pitch - dy * 0.006, 0.18, 1.22);
        }

        stage.addEventListener('pointerdown', (event) => {
            orbit.dragging = true;
            orbit.pointerId = event.pointerId;
            orbit.lastX = event.clientX;
            orbit.lastY = event.clientY;
            if (stage.setPointerCapture) stage.setPointerCapture(event.pointerId);
        });

        stage.addEventListener('pointermove', (event) => {
            if (!orbit.dragging || orbit.pointerId !== event.pointerId) return;
            updateOrbitFromInput(event.clientX - orbit.lastX, event.clientY - orbit.lastY);
            orbit.lastX = event.clientX;
            orbit.lastY = event.clientY;
        });

        function endDrag(event) {
            if (orbit.pointerId !== event.pointerId) return;
            orbit.dragging = false;
            orbit.pointerId = null;
            if (stage.releasePointerCapture) {
                try {
                    stage.releasePointerCapture(event.pointerId);
                } catch (error) {
                    // Ignore release errors when the pointer is already detached.
                }
            }
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
            const active = mcp.status === 'RUNNING' && mcp.clutchEngaged && zd.gearboxLO.vol > 0;
            const localOrigin = side === 'ps' ? new THREE.Vector3(-0.92, 0.12, 2.75) : new THREE.Vector3(0.92, 0.12, 2.75);
            const thrust = active ? zd.thrust / 100 : 0;
            const azimuthRad = THREE.MathUtils.degToRad(zd.azimuth);
            const localDirection = new THREE.Vector3(Math.sin(azimuthRad), 0, -Math.cos(azimuthRad)).normalize();

            return { active, thrust, origin: localOrigin, direction: localDirection };
        }

        function updatePhysics(dt) {
            const ps = getThrusterState('ps');
            const sb = getThrusterState('sb');
            const thrusters = [ps, sb];

            let forceX = 0;
            let forceZ = 0;
            let torque = 0;

            thrusters.forEach((thruster, index) => {
                const magnitude = thruster.thrust * 3.2;
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

            if (window.gameState.visual3d.mooringConnected) {
                vessel.vx *= 0.82;
                vessel.vz *= 0.82;
                vessel.yawRate *= 0.8;
                vessel.x = THREE.MathUtils.lerp(vessel.x, -1.1, 0.06);
                vessel.z = THREE.MathUtils.lerp(vessel.z, 0, 0.06);
                vessel.yaw = THREE.MathUtils.lerp(vessel.yaw, THREE.MathUtils.degToRad(6), 0.06);
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
            const stability = window.calculateStabilityIndicators();
            const heelSign = stability.heelDirection === 'BE' ? 1 : stability.heelDirection === 'BB' ? -1 : 0;
            const trimSign = stability.trimDirection === 'POP' ? 1 : stability.trimDirection === 'PROA' ? -1 : 0;
            const maneuverHeel = THREE.MathUtils.clamp((state.sb.thrust - state.ps.thrust) * 0.08, -0.18, 0.18);
            const baseHeel = THREE.MathUtils.degToRad(parseFloat(stability.heelDeg || 0)) * heelSign * 0.45;
            const baseTrim = THREE.MathUtils.degToRad(parseFloat(stability.trimDeg || 0)) * trimSign * 0.35;

            tugGroup.position.set(vessel.x, 0.02, vessel.z);
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

            const forePoint = new THREE.Vector3(0, 1.05, -4.35).applyMatrix4(tugGroup.matrixWorld);
            const aftPoint = new THREE.Vector3(0, 1.0, 3.85).applyMatrix4(tugGroup.matrixWorld);
            const bollardForePoint = new THREE.Vector3(-4.2, 1.66, -4.7);
            const bollardAftPoint = new THREE.Vector3(-4.2, 1.66, 4.7);

            foreRope.visible = window.gameState.visual3d.mooringConnected;
            aftRope.visible = window.gameState.visual3d.mooringConnected;
            if (window.gameState.visual3d.mooringConnected) {
                setRopeGeometry(foreRope, forePoint, bollardForePoint, 0.24);
                setRopeGeometry(aftRope, aftPoint, bollardAftPoint, 0.2);
            }

            const target = new THREE.Vector3(vessel.x - 0.2, 1.0, vessel.z);
            const horizontalDistance = Math.cos(orbit.pitch) * orbit.distance;
            camera.position.x = target.x + Math.sin(orbit.yaw) * horizontalDistance;
            camera.position.z = target.z + Math.cos(orbit.yaw) * horizontalDistance;
            camera.position.y = target.y + Math.sin(orbit.pitch) * orbit.distance;
            camera.lookAt(target);

            const speed = Math.sqrt(vessel.vx * vessel.vx + vessel.vz * vessel.vz) * 1.94;
            const headingDeg = ((THREE.MathUtils.radToDeg(vessel.yaw) % 360) + 360) % 360;
            if (hud.speed) hud.speed.textContent = `${speed.toFixed(2)} kn`;
            if (hud.heading) hud.heading.textContent = `${headingDeg.toFixed(0).padStart(3, '0')}°`;
            if (hud.resultant) hud.resultant.textContent = `${(state.resultant * 10).toFixed(1)} kN`;
            if (hud.attitude) hud.attitude.textContent = `Banda ${stability.heelDirection} / Trim ${stability.trimDirection}`;
            if (hud.mooringStatus) {
                hud.mooringStatus.textContent = window.gameState.visual3d.mooringConnected ? 'AMARRADO NO CAIS' : 'CABOS DESCONECTADOS';
                hud.mooringStatus.style.color = window.gameState.visual3d.mooringConnected ? '#9ed8b0' : '#ffb74d';
            }
            if (hud.mooringButton) {
                hud.mooringButton.textContent = window.gameState.visual3d.mooringConnected ? 'DESCONECTAR CABOS' : 'RECONECTAR CABOS';
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

        window.addEventListener('resize', resizeIfNeeded);
        animate();
    } catch (error) {
        stage.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#ffb4b4;font-family:Segoe UI,Arial,sans-serif;padding:24px;text-align:center;">Falha ao inicializar a cena 3D do rebocador.</div>';
        console.error(error);
    }
}
