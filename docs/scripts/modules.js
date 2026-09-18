const modulesContainer = document.querySelector('#heroModules');

if (modulesContainer && window.innerWidth > 650) {
  (async () => {
    try {
      const THREE = await import('https://cdnjs.cloudflare.com/ajax/libs/three.js/0.180.0/three.module.min.js');
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const body = document.body;

      const palette = {
        dark: { primary: 0xF4B942, secondary: 0x4FA7A3, line: 0x2F6F6D },
        light: { primary: 0x2F6F6D, secondary: 0xF4B942, line: 0x4FA7A3 },
      };

      const currentPalette = () => body.classList.contains('light-mode') ? palette.light : palette.dark;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
      camera.position.set(0, 0, 6.2);

      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
      modulesContainer.appendChild(renderer.domElement);

      const group = new THREE.Group();
      scene.add(group);

      const positions = [
        [0, 0, 0],
        [-1.45, 0.82, 0.05],
        [1.42, 0.88, -0.08],
        [-1.18, -1.05, 0.18],
        [1.24, -1.02, -0.12],
        [0.08, 1.62, 0.12],
      ];

      const edgeMaterials = [];
      const fillMaterials = [];

      positions.forEach((position, index) => {
        const size = index === 0 ? 0.98 : 0.72;
        const box = new THREE.BoxGeometry(size, size, size);
        const fillMaterial = new THREE.MeshBasicMaterial({
          color: index === 0 ? currentPalette().primary : currentPalette().secondary,
          transparent: true,
          opacity: index === 0 ? 0.16 : 0.07,
        });
        const fill = new THREE.Mesh(box, fillMaterial);
        fill.position.set(...position);
        group.add(fill);
        fillMaterials.push({ material: fillMaterial, primary: index === 0 });

        const edges = new THREE.EdgesGeometry(box);
        const edgeMaterial = new THREE.LineBasicMaterial({
          color: index === 0 ? currentPalette().primary : currentPalette().secondary,
          transparent: true,
          opacity: index === 0 ? 0.95 : 0.72,
        });
        const wireframe = new THREE.LineSegments(edges, edgeMaterial);
        wireframe.position.copy(fill.position);
        group.add(wireframe);
        edgeMaterials.push({ material: edgeMaterial, primary: index === 0 });
      });

      const connectionMaterial = new THREE.LineBasicMaterial({
        color: currentPalette().line,
        transparent: true,
        opacity: 0.42,
      });

      positions.slice(1).forEach((position) => {
        const geometry = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(...position),
        ]);
        group.add(new THREE.Line(geometry, connectionMaterial));
      });

      function resize() {
        const rect = modulesContainer.getBoundingClientRect();
        const width = Math.max(rect.width, 1);
        const height = Math.max(rect.height, 1);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height, false);
      }

      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(modulesContainer);
      resize();

      const clock = new THREE.Clock();

      function render() {
        const elapsed = clock.getElapsedTime();
        if (!reducedMotion) {
          group.rotation.x = Math.sin(elapsed * 0.42) * 0.08;
          group.rotation.y = Math.sin(elapsed * 0.34) * 0.16;
          group.position.y = Math.sin(elapsed * 0.7) * 0.06;
        }
        renderer.render(scene, camera);
        requestAnimationFrame(render);
      }

      window.addEventListener('portfolio-theme-change', () => {
        const colors = currentPalette();
        edgeMaterials.forEach(({ material, primary }) => material.color.setHex(primary ? colors.primary : colors.secondary));
        fillMaterials.forEach(({ material, primary }) => material.color.setHex(primary ? colors.primary : colors.secondary));
        connectionMaterial.color.setHex(colors.line);
      });

      render();
    } catch (error) {
      console.warn('Visual modular não pôde ser carregado.', error);
    }
  })();
}
