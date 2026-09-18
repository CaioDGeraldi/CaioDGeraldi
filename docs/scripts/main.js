const body = document.body;
const navLinks = document.querySelector('#navLinks');
const menuToggle = document.querySelector('#menuToggle');
const themeToggle = document.querySelector('#themeToggle');
const filterButtons = document.querySelectorAll('.filter-button');
const projectCards = document.querySelectorAll('.project-card');
const revealElements = document.querySelectorAll('.reveal');
const intro = document.querySelector('#intro');
const introLeft = document.querySelector('.intro-word-left');
const introRight = document.querySelector('.intro-word-right');
const introCenter = document.querySelector('.intro-center');

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function setMenu(open) {
  navLinks.classList.toggle('is-open', open);
  body.classList.toggle('menu-open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  menuToggle.innerHTML = open
    ? '<i class="fa-solid fa-xmark"></i>'
    : '<i class="fa-solid fa-bars"></i>';
}

menuToggle.addEventListener('click', () => {
  setMenu(!navLinks.classList.contains('is-open'));
});

navLinks.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => setMenu(false));
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 860) setMenu(false);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') setMenu(false);
});

function applyTheme(theme) {
  const light = theme === 'light';
  body.classList.toggle('light-mode', light);
  themeToggle.innerHTML = light
    ? '<i class="fa-solid fa-moon"></i>'
    : '<i class="fa-solid fa-sun"></i>';
  themeToggle.setAttribute('aria-label', light ? 'Usar tema escuro' : 'Usar tema claro');
  themeToggle.title = light ? 'Usar tema escuro' : 'Usar tema claro';
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', light ? '#F4F7F9' : '#1E2327');
  window.dispatchEvent(new CustomEvent('portfolio-theme-change', { detail: { light } }));
}

const savedTheme = localStorage.getItem('portfolio-theme');
const initialTheme = savedTheme || 'dark';
applyTheme(initialTheme);

themeToggle.addEventListener('click', () => {
  const nextTheme = body.classList.contains('light-mode') ? 'dark' : 'light';
  localStorage.setItem('portfolio-theme', nextTheme);
  applyTheme(nextTheme);
});

filterButtons.forEach((button) => {
  button.setAttribute('aria-pressed', String(button.classList.contains('is-active')));
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;

    filterButtons.forEach((item) => {
      const active = item === button;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-pressed', String(active));
    });

    projectCards.forEach((card) => {
      const technologies = card.dataset.tech.split(' ');
      card.classList.toggle('is-hidden', filter !== 'all' && !technologies.includes(filter));
    });
  });
});

if ('IntersectionObserver' in window && !reducedMotion) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('is-visible');
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add('is-visible'));
}

function updateIntro() {
  if (!intro || reducedMotion) return;

  const rect = intro.getBoundingClientRect();
  const animationDistance = intro.offsetHeight - window.innerHeight;
  if (animationDistance <= 0) return;

  const progress = clamp(-rect.top / animationDistance, 0, 1);
  const horizontalDistance = window.innerWidth < 650 ? 34 : 78;

  if (introLeft) introLeft.style.transform = `translate3d(${-progress * horizontalDistance}px, 0, 0)`;
  if (introRight) introRight.style.transform = `translate3d(${progress * horizontalDistance}px, 0, 0)`;
  if (introCenter) {
    introCenter.style.opacity = String(clamp(1 - progress * 1.7, 0, 1));
    introCenter.style.transform = `scale(${1 + progress * 0.14})`;
  }
}

let scrollFramePending = false;
window.addEventListener('scroll', () => {
  if (scrollFramePending) return;
  scrollFramePending = true;
  requestAnimationFrame(() => {
    updateIntro();
    scrollFramePending = false;
  });
}, { passive: true });

window.addEventListener('resize', updateIntro);
updateIntro();

function findHorizontalOverflow() {
  const viewportWidth = document.documentElement.clientWidth;
  return [...document.querySelectorAll('body *')].filter((element) => {
    const rect = element.getBoundingClientRect();
    return rect.right > viewportWidth + 1 || rect.left < -1;
  });
}

window.addEventListener('load', () => {
  requestAnimationFrame(() => {
    const overflowElements = findHorizontalOverflow();
    document.documentElement.dataset.horizontalOverflow = overflowElements.length ? 'true' : 'false';
  });
});

async function initThree() {
  try {
    const THREE = await import('https://cdnjs.cloudflare.com/ajax/libs/three.js/0.180.0/three.module.min.js');
    const palette = {
      dark: { primary: 0xF4B942, secondary: 0x4FA7A3 },
      light: { primary: 0x2F6F6D, secondary: 0xF4B942 },
    };

    const currentPalette = () => body.classList.contains('light-mode') ? palette.light : palette.dark;

    function createBackground() {
      const container = document.querySelector('#three-bg');
      if (!container) return;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 1600);
      camera.position.z = 520;

      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
      renderer.setSize(window.innerWidth, window.innerHeight);
      container.appendChild(renderer.domElement);

      const count = window.innerWidth < 650 ? 58 : 110;
      const positions = new Float32Array(count * 3);

      for (let i = 0; i < count; i += 1) {
        positions[i * 3] = (Math.random() - 0.5) * 1050;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 780;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 360;
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      const material = new THREE.PointsMaterial({
        color: currentPalette().secondary,
        size: window.innerWidth < 650 ? 2.2 : 2.5,
        transparent: true,
        opacity: body.classList.contains('light-mode') ? 0.22 : 0.30,
        sizeAttenuation: true,
      });

      const points = new THREE.Points(geometry, material);
      scene.add(points);

      const ringGeometry = new THREE.TorusGeometry(190, 0.8, 8, 96);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: currentPalette().primary,
        transparent: true,
        opacity: 0.08,
        wireframe: true,
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.rotation.x = 1.04;
      ring.rotation.y = -0.45;
      scene.add(ring);

      let animationId = null;

      function render() {
        if (!reducedMotion) {
          points.rotation.y += 0.00055;
          points.rotation.x += 0.00016;
          ring.rotation.z += 0.0008;
        }
        renderer.render(scene, camera);
        animationId = requestAnimationFrame(render);
      }

      function resize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
      }

      window.addEventListener('resize', resize, { passive: true });
      window.addEventListener('portfolio-theme-change', () => {
        const colors = currentPalette();
        material.color.setHex(colors.secondary);
        material.opacity = body.classList.contains('light-mode') ? 0.22 : 0.30;
        ringMaterial.color.setHex(colors.primary);
      });

      document.addEventListener('visibilitychange', () => {
        if (document.hidden && animationId) {
          cancelAnimationFrame(animationId);
          animationId = null;
        } else if (!document.hidden && !animationId) {
          render();
        }
      });

      render();
    }

    function createHeroObject() {
      const container = document.querySelector('#hero3d');
      if (!container || window.innerWidth <= 650) return;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
      camera.position.z = 5.2;

      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
      container.appendChild(renderer.domElement);

      const geometry = new THREE.IcosahedronGeometry(1.45, 1);
      const material = new THREE.MeshBasicMaterial({
        color: currentPalette().primary,
        wireframe: true,
        transparent: true,
        opacity: 0.72,
      });
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      const coreGeometry = new THREE.IcosahedronGeometry(0.62, 0);
      const coreMaterial = new THREE.MeshBasicMaterial({
        color: currentPalette().secondary,
        transparent: true,
        opacity: 0.18,
      });
      const core = new THREE.Mesh(coreGeometry, coreMaterial);
      scene.add(core);

      function resize() {
        const rect = container.getBoundingClientRect();
        const width = Math.max(rect.width, 1);
        const height = Math.max(rect.height, 1);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height, false);
      }

      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(container);
      resize();

      function render() {
        if (!reducedMotion) {
          mesh.rotation.x += 0.0022;
          mesh.rotation.y += 0.0032;
          core.rotation.x -= 0.0016;
          core.rotation.y += 0.0021;
        }
        renderer.render(scene, camera);
        requestAnimationFrame(render);
      }

      window.addEventListener('portfolio-theme-change', () => {
        const colors = currentPalette();
        material.color.setHex(colors.primary);
        coreMaterial.color.setHex(colors.secondary);
      });

      render();
    }

    createBackground();
    createHeroObject();
  } catch (error) {
    console.warn('Three.js não pôde ser carregado.', error);
  }
}

initThree();
