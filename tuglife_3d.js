const stage = typeof document !== 'undefined' ? document.getElementById('three-d-stage') : null;

if (stage && typeof window !== 'undefined' && window.gameState && window.THREE) {
    const THREE = window.THREE;
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0b141c, 22, 90);

    const camera = new THREE.PerspectiveCamera(45, stage.clientWidth / stage.clientHeight, 0.1, 200);
    camera.position.set(0, 9, 14);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(stage.clientWidth, stage.clientHeight);
    stage.appendChild(renderer.domElement);

    const ambient = new THREE.HemisphereLight(0xa8e7ff, 0x10202c, 1.5);
    scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xffffff, 1.4);
    sun.position.set(8, 12, 6);
    scene.add(sun);

    const water = new THREE.Mesh(
        new THREE.PlaneGeometry(140, 140, 80, 80),
        new THREE.MeshPhongMaterial({
            color: 0x0d5b78,
            shininess: 80,
            transparent: true,
            opacity: 0.95
        })
    );
    water.rotation.x = -Math.PI / 2;
    scene.add(water);

    const grid = new THREE.GridHelper(120, 40, 0x2b5966, 0x17323d);
    grid.position.y = 0.01;
    scene.add(grid);

    const tugGroup = new THREE.Group();
    scene.add(tugGroup);

    const hull = new THREE.Mesh(
        new THREE.BoxGeometry(2.8, 0.8, 7.2),
        new THREE.MeshStandardMaterial({ color: 0xff8f1f, roughness: 0.55, metalness: 0.15 })
    );
    hull.position.y = 0.75;
    tugGroup.add(hull);

    const bow = new THREE.Mesh(
        new THREE.ConeGeometry(1.4, 1.4, 4),
        new THREE.MeshStandardMaterial({ color: 0xf39b38, roughness: 0.55, metalness: 0.1 })
    );
    bow.rotation.x = Math.PI / 2;
    bow.rotation.z = Math.PI / 4;
    bow.position.set(0, 0.75, -4.1);
    tugGroup.add(bow);

    const cabin = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 1.4, 1.9),
        new THREE.MeshStandardMaterial({ color: 0xe7f1f5, roughness: 0.45, metalness: 0.05 })
    );
    cabin.position.set(0, 1.65, -0.4);
    tugGroup.add(cabin);

    const mast = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.08, 1.6, 10),
        new THREE.MeshStandardMaterial({ color: 0xcfd8dc, roughness: 0.4, metalness: 0.2 })
    );
    mast.position.set(0, 2.7, -0.4);
    tugGroup.add(mast);

    const tugShadow = new THREE.Mesh(
        new THREE.CircleGeometry(2.6, 28),
        new THREE.MeshBasicMaterial({ color: 0x081018, transparent: true, opacity: 0.35 })
    );
    tugShadow.rotation.x = -Math.PI / 2;
    tugShadow.position.y = 0.03;
    tugGroup.add(tugShadow);

    const thrusterHelpers = {
        ps: new THREE.ArrowHelper(new THREE.Vector3(0, 0, -1), new THREE.Vector3(-1.1, 0.55, 2.3), 0.001, 0x7cdeff, 0.35, 0.2),
        sb: new THREE.ArrowHelper(new THREE.Vector3(0, 0, -1), new THREE.Vector3(1.1, 0.55, 2.3), 0.001, 0xffb74d, 0.35, 0.2)
    };
    tugGroup.add(thrusterHelpers.ps);
    tugGroup.add(thrusterHelpers.sb);

    const resultantHelper = new THREE.ArrowHelper(new THREE.Vector3(0, 0, -1), new THREE.Vector3(0, 1.3, 0), 0.001, 0x7cff8d, 0.45, 0.24);
    tugGroup.add(resultantHelper);

    const hud = {
        speed: document.getElementById('ui-3d-speed'),
        heading: document.getElementById('ui-3d-heading'),
        resultant: document.getElementById('ui-3d-resultant'),
        attitude: document.getElementById('ui-3d-attitude')
    };

    const vessel = window.gameState.visual3d.vessel;

    function resize() {
        const width = stage.clientWidth;
        const height = stage.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    }

    function getThrusterState(side) {
        const mcp = window.gameState.machinery[`mcp_${side}`];
        const zd = window.gameState.machinery[`zd_${side}`];
        const active = mcp.status === 'RUNNING' && mcp.clutchEngaged && zd.gearboxLO.vol > 0;
        const localOrigin = side === 'ps' ? new THREE.Vector3(-1.1, 0.55, 2.3) : new THREE.Vector3(1.1, 0.55, 2.3);
        const thrust = active ? zd.thrust / 100 : 0;
        const azimuthRad = THREE.MathUtils.degToRad(zd.azimuth);
        const localDirection = new THREE.Vector3(Math.sin(azimuthRad), 0, -Math.cos(azimuthRad)).normalize();

        return {
            active,
            thrust,
            origin: localOrigin,
            direction: localDirection
        };
    }

    function updatePhysics(dt) {
        const ps = getThrusterState('ps');
        const sb = getThrusterState('sb');
        const thrusters = [ps, sb];

        let forceX = 0;
        let forceZ = 0;
        let torque = 0;

        thrusters.forEach((thruster, index) => {
            const magnitude = thruster.thrust * 2.8;
            forceX += thruster.direction.x * magnitude;
            forceZ += thruster.direction.z * magnitude;
            torque += thruster.origin.x * (thruster.direction.z * magnitude) - thruster.origin.z * (thruster.direction.x * magnitude);

            const helper = index === 0 ? thrusterHelpers.ps : thrusterHelpers.sb;
            helper.position.copy(thruster.origin);
            helper.setDirection(thruster.direction.clone().normalize());
            helper.setLength(Math.max(0.001, 0.7 + magnitude * 0.9), 0.35, 0.2);
            helper.setColor(new THREE.Color(thruster.active ? (index === 0 ? 0x7cdeff : 0xffb74d) : 0x4a5f66));
        });

        const heading = vessel.yaw;
        const cos = Math.cos(heading);
        const sin = Math.sin(heading);
        const worldFx = forceX * cos - forceZ * sin;
        const worldFz = forceX * sin + forceZ * cos;

        vessel.vx = vessel.vx * 0.92 + worldFx * dt * 0.18;
        vessel.vz = vessel.vz * 0.92 + worldFz * dt * 0.18;
        vessel.yawRate = vessel.yawRate * 0.88 + torque * dt * 0.08;

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
        resultantHelper.setLength(Math.max(0.001, 0.6 + state.resultant * 0.45), 0.45, 0.24);
        resultantHelper.visible = state.resultant > 0.01;

        const wave = water.geometry.attributes.position;
        for (let i = 0; i < wave.count; i++) {
            const x = wave.getX(i);
            const y = Math.sin(elapsed * 1.5 + x * 0.18 + wave.getZ(i) * 0.13) * 0.08;
            wave.setY(i, y);
        }
        wave.needsUpdate = true;
        water.geometry.computeVertexNormals();

        camera.position.x = vessel.x + Math.sin(vessel.yaw + 0.45) * 11;
        camera.position.z = vessel.z + Math.cos(vessel.yaw + 0.45) * 11;
        camera.position.y = 8.5;
        camera.lookAt(vessel.x, 0.9, vessel.z);

        const speed = Math.sqrt(vessel.vx * vessel.vx + vessel.vz * vessel.vz) * 1.94;
        const headingDeg = ((THREE.MathUtils.radToDeg(vessel.yaw) % 360) + 360) % 360;
        hud.speed.textContent = `${speed.toFixed(2)} kn`;
        hud.heading.textContent = `${headingDeg.toFixed(0).padStart(3, '0')}°`;
        hud.resultant.textContent = `${(state.resultant * 10).toFixed(1)} kN`;
        hud.attitude.textContent = `Banda ${stability.heelDirection} / Trim ${stability.trimDirection}`;
    }

    const clock = new THREE.Clock();
    function animate() {
        requestAnimationFrame(animate);
        const dt = Math.min(clock.getDelta(), 0.05);
        const elapsed = clock.elapsedTime;
        const state = updatePhysics(dt);
        updateVisuals(state, elapsed);
        renderer.render(scene, camera);
    }

    window.addEventListener('resize', resize);
    resize();
    animate();
}
