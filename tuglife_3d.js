const stage = typeof document !== 'undefined' ? document.getElementById('three-d-stage') : null;

if (stage && typeof window !== 'undefined' && window.gameState && window.THREE) {
    const THREE = window.THREE;

    try {
        const scene = new THREE.Scene();
        scene.fog = new THREE.Fog(0x0a131b, 26, 110);

        const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 250);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x0b1721, 1);
        stage.appendChild(renderer.domElement);

        const ambient = new THREE.HemisphereLight(0xb8ecff, 0x13212b, 1.55);
        scene.add(ambient);

        const sun = new THREE.DirectionalLight(0xffffff, 1.5);
        sun.position.set(12, 16, 10);
        scene.add(sun);

        const fill = new THREE.DirectionalLight(0x6fc8ff, 0.55);
        fill.position.set(-10, 8, -6);
        scene.add(fill);

        const water = new THREE.Mesh(
            new THREE.PlaneGeometry(180, 180, 72, 72),
            new THREE.MeshPhongMaterial({
                color: 0x0f6180,
                shininess: 90,
                transparent: false
            })
        );
        water.rotation.x = -Math.PI / 2;
        scene.add(water);

        const grid = new THREE.GridHelper(160, 48, 0x3f6d79, 0x173746);
        grid.position.y = 0.02;
        scene.add(grid);

        const pier = new THREE.Mesh(
            new THREE.BoxGeometry(4.8, 1.2, 18),
            new THREE.MeshStandardMaterial({ color: 0x8b6b47, roughness: 0.85, metalness: 0.05 })
        );
        pier.position.set(-6.3, 0.62, 0);
        scene.add(pier);

        const pierEdge = new THREE.Mesh(
            new THREE.BoxGeometry(0.35, 0.3, 18.2),
            new THREE.MeshStandardMaterial({ color: 0xd1c7a3, roughness: 0.7, metalness: 0.05 })
        );
        pierEdge.position.set(-3.95, 1.2, 0);
        scene.add(pierEdge);

        function createBollard(z) {
            const bollard = new THREE.Group();
            const body = new THREE.Mesh(
                new THREE.CylinderGeometry(0.18, 0.22, 0.6, 16),
                new THREE.MeshStandardMaterial({ color: 0x4e5960, roughness: 0.45, metalness: 0.55 })
            );
            body.position.y = 1.45;
            bollard.add(body);

            const top = new THREE.Mesh(
                new THREE.BoxGeometry(0.55, 0.12, 0.18),
                new THREE.MeshStandardMaterial({ color: 0x707d84, roughness: 0.4, metalness: 0.55 })
            );
            top.position.set(0, 1.68, 0);
            bollard.add(top);

            bollard.position.set(-4.25, 0, z);
            scene.add(bollard);
            return bollard;
        }

        const bollardFore = createBollard(-4.7);
        const bollardAft = createBollard(4.7);

        const tugGroup = new THREE.Group();
        scene.add(tugGroup);

        const hull = new THREE.Mesh(
            new THREE.BoxGeometry(3.2, 1.1, 8.3),
            new THREE.MeshStandardMaterial({ color: 0xff911f, roughness: 0.5, metalness: 0.12 })
        );
        hull.position.y = 0.95;
        tugGroup.add(hull);

        const bow = new THREE.Mesh(
            new THREE.ConeGeometry(1.6, 1.7, 4),
            new THREE.MeshStandardMaterial({ color: 0xf5a13b, roughness: 0.52, metalness: 0.08 })
        );
        bow.rotation.x = Math.PI / 2;
        bow.rotation.z = Math.PI / 4;
        bow.position.set(0, 0.95, -4.9);
        tugGroup.add(bow);

        const sternDeck = new THREE.Mesh(
            new THREE.BoxGeometry(2.5, 0.2, 1.6),
            new THREE.MeshStandardMaterial({ color: 0x223848, roughness: 0.65, metalness: 0.1 })
        );
        sternDeck.position.set(0, 1.6, 2.9);
        tugGroup.add(sternDeck);

        const cabin = new THREE.Mesh(
            new THREE.BoxGeometry(2.1, 1.7, 2.4),
            new THREE.MeshStandardMaterial({ color: 0xf0f6f8, roughness: 0.4, metalness: 0.03 })
        );
        cabin.position.set(0, 2.0, -0.2);
        tugGroup.add(cabin);

        const wheelhouse = new THREE.Mesh(
            new THREE.BoxGeometry(1.45, 0.8, 1.4),
            new THREE.MeshStandardMaterial({ color: 0x18313f, roughness: 0.35, metalness: 0.15 })
        );
        wheelhouse.position.set(0, 2.2, -0.2);
        tugGroup.add(wheelhouse);

        const mast = new THREE.Mesh(
            new THREE.CylinderGeometry(0.06, 0.08, 1.8, 10),
            new THREE.MeshStandardMaterial({ color: 0xcfd8dc, roughness: 0.35, metalness: 0.25 })
        );
        mast.position.set(0, 3.1, -0.15);
        tugGroup.add(mast);

        const tugShadow = new THREE.Mesh(
            new THREE.CircleGeometry(2.8, 28),
            new THREE.MeshBasicMaterial({ color: 0x04090d, transparent: true, opacity: 0.36 })
        );
        tugShadow.rotation.x = -Math.PI / 2;
        tugShadow.position.y = 0.04;
        tugGroup.add(tugShadow);

        const thrusterHelpers = {
            ps: new THREE.ArrowHelper(new THREE.Vector3(0, 0, -1), new THREE.Vector3(-1.15, 0.7, 2.85), 1.1, 0x7cdeff, 0.38, 0.22),
            sb: new THREE.ArrowHelper(new THREE.Vector3(0, 0, -1), new THREE.Vector3(1.15, 0.7, 2.85), 1.1, 0xffb74d, 0.38, 0.22)
        };
        tugGroup.add(thrusterHelpers.ps);
        tugGroup.add(thrusterHelpers.sb);

        const resultantHelper = new THREE.ArrowHelper(new THREE.Vector3(0, 0, -1), new THREE.Vector3(0, 1.6, 0), 1.2, 0x7cff8d, 0.55, 0.28);
        tugGroup.add(resultantHelper);

        function createRope() {
            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.Float32BufferAttribute(new Array(18).fill(0), 3));
            const line = new THREE.Line(
                geometry,
                new THREE.LineBasicMaterial({ color: 0xf7deb0, transparent: true, opacity: 0.95 })
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
            mooringButton: document.getElementById('btn-3d-mooring')
        };

        const vessel = window.gameState.visual3d.vessel;

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

        function getThrusterState(side) {
            const mcp = window.gameState.machinery[`mcp_${side}`];
            const zd = window.gameState.machinery[`zd_${side}`];
            const active = mcp.status === 'RUNNING' && mcp.clutchEngaged && zd.gearboxLO.vol > 0;
            const localOrigin = side === 'ps' ? new THREE.Vector3(-1.15, 0.7, 2.85) : new THREE.Vector3(1.15, 0.7, 2.85);
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
                helper.setLength(Math.max(0.35, 0.8 + magnitude * 0.9), 0.38, 0.22);
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

            tugGroup.position.set(vessel.x, 0, vessel.z);
            tugGroup.rotation.y = vessel.yaw;
            tugGroup.rotation.z = THREE.MathUtils.lerp(tugGroup.rotation.z, baseHeel + maneuverHeel, 0.08);
            tugGroup.rotation.x = THREE.MathUtils.lerp(tugGroup.rotation.x, baseTrim + Math.sin(elapsed * 1.7) * 0.03, 0.08);

            resultantHelper.setDirection(new THREE.Vector3(state.localX, 0, state.localZ || -0.001).normalize());
            resultantHelper.setLength(Math.max(0.25, 0.7 + state.resultant * 0.5), 0.55, 0.28);
            resultantHelper.visible = state.resultant > 0.01;

            const wave = water.geometry.attributes.position;
            for (let i = 0; i < wave.count; i++) {
                const x = wave.getX(i);
                const z = wave.getZ(i);
                const y = Math.sin(elapsed * 1.45 + x * 0.16 + z * 0.12) * 0.075;
                wave.setY(i, y);
            }
            wave.needsUpdate = true;
            water.geometry.computeVertexNormals();

            const forePoint = new THREE.Vector3(0, 1.2, -4.2).applyMatrix4(tugGroup.matrixWorld);
            const aftPoint = new THREE.Vector3(0, 1.15, 4.0).applyMatrix4(tugGroup.matrixWorld);
            const bollardForePoint = new THREE.Vector3(-4.25, 1.7, -4.7);
            const bollardAftPoint = new THREE.Vector3(-4.25, 1.7, 4.7);

            foreRope.visible = window.gameState.visual3d.mooringConnected;
            aftRope.visible = window.gameState.visual3d.mooringConnected;
            if (window.gameState.visual3d.mooringConnected) {
                setRopeGeometry(foreRope, forePoint, bollardForePoint, 0.28);
                setRopeGeometry(aftRope, aftPoint, bollardAftPoint, 0.24);
            }

            camera.position.x = vessel.x + Math.sin(vessel.yaw + 0.9) * 12.5;
            camera.position.z = vessel.z + Math.cos(vessel.yaw + 0.9) * 12.5;
            camera.position.y = 8.4;
            camera.lookAt(vessel.x - 0.6, 1.1, vessel.z);

            const speed = Math.sqrt(vessel.vx * vessel.vx + vessel.vz * vessel.vz) * 1.94;
            const headingDeg = ((THREE.MathUtils.radToDeg(vessel.yaw) % 360) + 360) % 360;
            hud.speed.textContent = `${speed.toFixed(2)} kn`;
            hud.heading.textContent = `${headingDeg.toFixed(0).padStart(3, '0')}°`;
            hud.resultant.textContent = `${(state.resultant * 10).toFixed(1)} kN`;
            hud.attitude.textContent = `Banda ${stability.heelDirection} / Trim ${stability.trimDirection}`;
            hud.mooringStatus.textContent = window.gameState.visual3d.mooringConnected ? 'AMARRADO NO CAIS' : 'CABOS DESCONECTADOS';
            hud.mooringStatus.style.color = window.gameState.visual3d.mooringConnected ? '#9ed8b0' : '#ffb74d';
            hud.mooringButton.textContent = window.gameState.visual3d.mooringConnected ? 'DESCONECTAR CABOS' : 'RECONECTAR CABOS';
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
