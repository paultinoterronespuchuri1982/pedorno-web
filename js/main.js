/* PEDORNO — interacciones del sitio. JavaScript simple, sin dependencias. */
(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const $ = (sel, scope = document) => scope.querySelector(sel);
  const $$ = (sel, scope = document) => Array.from(scope.querySelectorAll(sel));

  /* ---------- Cabecera: sombra al hacer scroll y botón volver arriba ---------- */
  const header = $('.site-header');
  const toTop = $('.to-top');

  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('scrolled', y > 24);
    toTop.classList.toggle('show', y > 600);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Menú móvil ---------- */
  const menuBtn = $('#menuBtn');
  const menu = $('#menu');

  function setMenu(open) {
    menu.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.textContent = open ? 'Cerrar' : 'Menú';
    document.body.classList.toggle('no-scroll', open);
  }

  menuBtn.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
  menu.addEventListener('click', (e) => {
    if (e.target.closest('a')) setMenu(false);
  });
  window.matchMedia('(min-width: 900px)').addEventListener('change', (e) => {
    if (e.matches) setMenu(false);
  });

  /* ---------- Sección activa en el menú ---------- */
  const navLinks = $$('#menu a[href^="#"]');
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((a) => a.removeAttribute('aria-current'));
      const current = navLinks.find((a) => a.getAttribute('href') === `#${entry.target.id}`);
      if (current) current.setAttribute('aria-current', 'true');
    });
  }, { rootMargin: '-45% 0px -50% 0px' });

  navLinks.forEach((a) => {
    const section = $(a.getAttribute('href'));
    if (section) spy.observe(section);
  });

  /* ---------- Aparición al hacer scroll ---------- */
  const revealEls = $$('.reveal');
  if (reduceMotion.matches) {
    revealEls.forEach((el) => el.classList.add('in'));
  } else {
    const revealIO = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.15 });
    revealEls.forEach((el) => revealIO.observe(el));
  }

  /* ---------- Franja de imagen con parallax suave ---------- */
  const wide = $('.wide');
  const wideImg = $('#parallaxImg');
  if (wide && wideImg && !reduceMotion.matches) {
    let ticking = false;
    const updateParallax = () => {
      const rect = wide.getBoundingClientRect();
      const offset = (rect.top / window.innerHeight) * -60;
      wideImg.style.setProperty('--p', `${offset.toFixed(1)}px`);
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(updateParallax);
    }, { passive: true });
  }

  /* ---------- Logo del hero: salta al tocarlo ---------- */
  $$('.hero-logo').forEach((logo) => {
    logo.addEventListener('click', () => {
      logo.classList.remove('hop');
      void logo.offsetWidth; // reinicia la animación
      logo.classList.add('hop');
    });
  });

  /* ---------- Formulario de contacto ---------- */
  const form = $('#signupForm');
  const email = $('#email');
  const emailError = $('#emailError');
  const emailField = $('#emailField');
  const formStatus = $('#formStatus');
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  let touched = false;

  function checkEmail() {
    const value = email.value.trim();
    let message = '';
    if (!value) {
      message = 'Escribe tu correo para unirte.';
    } else if (!EMAIL_RE.test(value)) {
      message = 'Revisa el formato. Por ejemplo: nombre@correo.com';
    }
    emailError.textContent = message;
    email.setAttribute('aria-invalid', String(Boolean(message)));
    emailField.classList.toggle('invalid', Boolean(message));
    return !message;
  }

  email.addEventListener('blur', () => {
    touched = true;
    checkEmail();
  });

  email.addEventListener('input', () => {
    if (touched) checkEmail();
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    touched = true;
    if (!checkEmail()) {
      email.focus();
      return;
    }
    // Todavía no hay servicio de correo conectado: se avisa en vez de fingir un envío.
    formStatus.textContent = 'Aún no hay un servicio de correo conectado. [AGREGAR SERVICIO DE CORREO]';
    formStatus.classList.add('pending');
  });

  /* ---------- Carrusel de fotos: arrastrar con mouse y ampliar al tocar ---------- */
  const carousel = $('.carousel');
  const lightbox = $('#lightbox');
  const lbImg = $('#lbImg');
  const lbClose = $('#lbClose');
  let lastZoomButton = null;
  let dragging = false;
  let startX = 0;
  let startScroll = 0;
  let movedPx = 0;

  carousel.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse') return;
    dragging = true;
    movedPx = 0;
    startX = e.clientX;
    startScroll = carousel.scrollLeft;
    carousel.classList.add('dragging');
  });

  window.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    movedPx = Math.max(movedPx, Math.abs(dx));
    carousel.scrollLeft = startScroll - dx;
  });

  window.addEventListener('pointerup', () => {
    dragging = false;
    carousel.classList.remove('dragging');
  });

  function openLightbox(button) {
    const img = button.querySelector('img');
    lbImg.src = img.currentSrc || img.src;
    lbImg.alt = img.alt;
    lastZoomButton = button;
    lightbox.hidden = false;
    document.body.classList.add('no-scroll');
    lbClose.focus();
  }

  function closeLightbox() {
    lightbox.hidden = true;
    lbImg.removeAttribute('src');
    document.body.classList.remove('no-scroll');
    if (lastZoomButton) lastZoomButton.focus();
  }

  carousel.addEventListener('click', (e) => {
    const button = e.target.closest('.zoom');
    if (!button) return;
    if (movedPx > 6) return; // fue un arrastre, no un toque
    openLightbox(button);
  });

  lbClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  /* ---------- Teclado: Escape cierra menú o foto; Tab no sale de la foto ---------- */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (!lightbox.hidden) closeLightbox();
      else if (menu.classList.contains('open')) {
        setMenu(false);
        menuBtn.focus();
      }
    }
    if (e.key === 'Tab' && !lightbox.hidden) {
      e.preventDefault();
      lbClose.focus();
    }
  });

  /* ---------- Efectos del avión (solo con mouse y sin "reducir movimiento") ---------- */
  if (finePointer.matches && !reduceMotion.matches) {
    initFlyer();
  }

  function initFlyer() {
    const sonidoBtn = $('#sonidoBtn');
    sonidoBtn.hidden = false;

    const plane = new Image();
    plane.src = 'img/avion.png';
    plane.alt = '';
    plane.className = 'avion';
    plane.draggable = false;
    plane.setAttribute('aria-hidden', 'true');
    document.body.appendChild(plane);

    /* Motor: solo suena si la persona activa el botón de sonido */
    const engine = new Audio('img/motor.mp3');
    engine.loop = true;
    engine.volume = 0.6;
    let soundOn = false;

    function setSound(on) {
      soundOn = on;
      sonidoBtn.setAttribute('aria-pressed', String(on));
      sonidoBtn.textContent = on ? 'Sonido: on' : 'Sonido: off';
      if (on) engine.play().catch(() => {});
      else engine.pause();
    }

    sonidoBtn.addEventListener('click', () => setSound(!soundOn));

    // Si el foco entra al reproductor de Bandcamp, el motor se calla
    window.addEventListener('blur', () => {
      setTimeout(() => {
        if (document.activeElement && document.activeElement.tagName === 'IFRAME') setSound(false);
      }, 0);
    });

    /* Al tocar el avión: pedo, imagen que cae y explosión 2 s después */
    plane.addEventListener('pointerdown', () => {
      const r = plane.getBoundingClientRect();
      const x = r.left + r.width / 2;
      const y = r.top + r.height * 0.6;
      new Audio('img/pedo.mp3').play().catch(() => {});
      dropKk(x, y);
      playBomba();
      setTimeout(() => explotar(x, window.innerHeight * 0.85), 2000);
    });

    const rnd = (a, b) => a + Math.random() * (b - a);
    const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
    const W = () => window.innerWidth;
    const H = () => window.innerHeight;
    const onScreen = (p) => p.x > 0 && p.x < W() && p.y > 0 && p.y < H();

    let cur = { x: -250, y: H() * 0.5, h: 0 };
    let seg = null;
    let lastT = performance.now();
    let clock = 0;

    function makeSeg() {
      const w = W();
      const h = H();

      if (onScreen(cur) && Math.random() < 0.4) {
        // Rizo (loop) que empieza desde donde está y mantiene la dirección
        const R = rnd(90, 150);
        const dir = Math.random() < 0.5 ? 1 : -1;
        const th0 = cur.h - dir * Math.PI / 2;
        return {
          type: 'loop', dur: rnd(1857, 2429), t: 0, R, dir, th0,
          cx: cur.x - R * Math.cos(th0), cy: cur.y - R * Math.sin(th0),
        };
      }

      // Pasada en curva de un lado a otro; a veces termina dentro de la pantalla
      const x0 = cur.x;
      const y0 = cur.y;
      let tx;
      let ty;
      if (Math.random() < 0.3) {
        tx = rnd(0.1, 0.9) * w;
        ty = rnd(0.1, 0.9) * h;
      } else {
        const e = Math.random();
        if (e < 0.4) {
          tx = x0 < w / 2 ? w + 340 : -340;
          ty = rnd(-0.1, 1.1) * h;
        } else if (e < 0.75) {
          tx = rnd(-0.1, 1.1) * w;
          ty = y0 < h / 2 ? h + 340 : -340;
        } else {
          tx = x0 < w / 2 ? w + 340 : -340;
          ty = y0 < h / 2 ? h + 340 : -340;
        }
      }
      const p1 = { x: x0 + (tx - x0) * 0.33 + rnd(-320, 320), y: rnd(-0.3, 1.3) * h };
      const p2 = { x: x0 + (tx - x0) * 0.66 + rnd(-320, 320), y: rnd(-0.3, 1.3) * h };
      const dist = Math.hypot(tx - x0, ty - y0) + 200;
      return {
        type: 'bez',
        dur: clamp(dist / rnd(0.49, 0.84), 1714, 4286),
        t: 0,
        pts: [{ x: x0, y: y0 }, p1, p2, { x: tx, y: ty }],
      };
    }

    function evalSeg(s, u) {
      if (s.type === 'loop') {
        const th = s.th0 + s.dir * Math.PI * 2 * u;
        return {
          x: s.cx + s.R * Math.cos(th),
          y: s.cy + s.R * Math.sin(th),
          h: Math.atan2(s.dir * Math.cos(th), -s.dir * Math.sin(th)),
        };
      }
      const [P0, P1, P2, P3] = s.pts;
      const m = 1 - u;
      const x = m * m * m * P0.x + 3 * m * m * u * P1.x + 3 * m * u * u * P2.x + u * u * u * P3.x;
      const y = m * m * m * P0.y + 3 * m * m * u * P1.y + 3 * m * u * u * P2.y + u * u * u * P3.y;
      const dx = 3 * (m * m * (P1.x - P0.x) + 2 * m * u * (P2.x - P1.x) + u * u * (P3.x - P2.x));
      const dy = 3 * (m * m * (P1.y - P0.y) + 2 * m * u * (P2.y - P1.y) + u * u * (P3.y - P2.y));
      return { x, y, h: Math.atan2(dy, dx) };
    }

    function render(now) {
      const dt = Math.min(now - lastT, 100);
      lastT = now;
      clock += dt;

      if (!seg) seg = makeSeg();
      seg.t += dt;
      const u = Math.min(seg.t / seg.dur, 1);
      const p = evalSeg(seg, u);
      cur = p;

      const wobble = Math.sin(clock / 120) * 10; // balanceo
      const bob = Math.sin(clock / 180) * 26;    // subida y bajada
      const flip = Math.cos(p.h) < 0;
      const deg = p.h * 180 / Math.PI;
      const rot = flip ? deg - 180 : deg;
      const hw = plane.offsetWidth / 2;
      const hh = plane.offsetHeight / 2;

      plane.style.transform =
        `translate3d(${(p.x - hw).toFixed(1)}px, ${(p.y - hh + bob).toFixed(1)}px, 0) ` +
        `rotate(${(rot + wobble).toFixed(2)}deg) scaleX(${flip ? -1 : 1})`;

      // Efecto Doppler: el tono del motor baja al pasar
      if (soundOn) {
        engine.playbackRate = 1 + 0.25 * clamp((W() / 2 - p.x) / W(), -0.5, 0.5);
      }

      if (u >= 1) seg = null;
      requestAnimationFrame(render);
    }

    requestAnimationFrame(render);

    function dropKk(x, y) {
      const k = new Image();
      k.src = 'img/kk.png';
      k.alt = '';
      k.className = 'kk';
      k.setAttribute('aria-hidden', 'true');
      k.style.left = `${x}px`;
      k.style.top = `${y}px`;
      k.style.setProperty('--fall', `${window.innerHeight - y + 160}px`);
      k.style.setProperty('--r', `${Math.random() * 40 - 20}deg`);
      k.addEventListener('animationend', () => k.remove());
      document.body.appendChild(k);
    }
  }

  /* ---------- Sonido de la bomba: 9,77 s de audio comprimidos a 5 s ---------- */
  function playBomba() {
    const bomb = new Audio('img/bomba.mp3');
    bomb.preservesPitch = false;
    bomb.playbackRate = 9.77 / 5;
    bomb.play().catch(() => {});
  }

  /* ---------- Mojones en un lienzo: vuelan desde el centro hacia la pantalla ---------- */
  const mojonImg = new Image();
  mojonImg.src = 'img/mojon.png';
  const MOJONES = 500;
  let mojonCv = null;
  let mojonCtx = null;
  let mojonParts = [];
  let mojonRaf = 0;
  let mojonT = 0;

  function lanzarMojones() {
    if (!mojonCv) {
      mojonCv = document.createElement('canvas');
      mojonCv.className = 'mojones-canvas';
      mojonCv.setAttribute('aria-hidden', 'true');
      document.body.appendChild(mojonCv);
      mojonCtx = mojonCv.getContext('2d');
    }
    mojonCv.width = window.innerWidth;
    mojonCv.height = window.innerHeight;

    for (let i = 0; i < MOJONES; i++) {
      mojonParts.push({
        ang: Math.random() * Math.PI * 2,            // dirección en la pantalla
        R: 300 + Math.random() * 1000,               // qué tan lejos se abren
        z: 0.02 + Math.random() * 0.05,              // profundidad (0 = lejos, 1 = en pantalla)
        vz: 0.35 + Math.random() * 0.35,             // velocidad de acercarse
        base: 14 + Math.random() * 18,
        life: 0,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() < 0.5 ? -1 : 1) * (4 + Math.random() * 10),
      });
    }
    if (!mojonRaf) mojonRaf = requestAnimationFrame(pintarMojones);
  }

  function pintarMojones(t) {
    if (!mojonT) mojonT = t;
    const dt = Math.min((t - mojonT) / 1000, 0.05);
    mojonT = t;

    const W = mojonCv.width;
    const H = mojonCv.height;
    const cx = W / 2;
    const cy = H / 2;
    mojonCtx.clearRect(0, 0, W, H);

    for (const p of mojonParts) {
      p.life += dt;
      p.z += p.vz * dt * (1 + p.z); // se acerca cada vez más rápido
      const d = p.R * p.z;
      const x = cx + Math.cos(p.ang) * d;
      const y = cy + Math.sin(p.ang) * d;
      const s = p.base * (0.3 + p.z * 2.5);
      mojonCtx.globalAlpha = p.z > 1.3 ? Math.max(0, 1 - (p.z - 1.3) / 0.7) : 1;
      p.rot += p.vr * dt;
      mojonCtx.setTransform(Math.cos(p.rot), Math.sin(p.rot), -Math.sin(p.rot), Math.cos(p.rot), x, y);
      mojonCtx.drawImage(mojonImg, -s / 2, -s / 2, s, s);
    }

    mojonCtx.setTransform(1, 0, 0, 1, 0, 0);
    mojonCtx.globalAlpha = 1;
    mojonParts = mojonParts.filter((p) => p.z < 2 && p.life < 3.2);

    if (mojonParts.length) {
      mojonRaf = requestAnimationFrame(pintarMojones);
    } else {
      mojonRaf = 0;
      mojonT = 0;
      mojonCtx.clearRect(0, 0, W, H);
    }
  }

  /* ---------- Explosión: destello, anillo, pedazos, mojones y temblor ---------- */
  function explotar(x, y) {
    const flash = document.createElement('div');
    flash.className = 'boom-flash';
    flash.addEventListener('animationend', () => flash.remove());
    document.body.appendChild(flash);

    const ring = document.createElement('div');
    ring.className = 'boom-ring';
    ring.style.left = `${x}px`;
    ring.style.top = `${y}px`;
    ring.addEventListener('animationend', () => ring.remove());
    document.body.appendChild(ring);

    const colores = ['#d4ff00', '#f2f0ea', '#ff5a1f', '#ffd21f'];
    for (let i = 0; i < 28; i++) {
      const ang = Math.random() * Math.PI * 2;
      const dist = 120 + Math.random() * 380;
      const piece = document.createElement('div');
      piece.className = 'boom-part';
      piece.style.left = `${x}px`;
      piece.style.top = `${y}px`;
      piece.style.background = colores[i % colores.length];
      piece.style.setProperty('--dx', `${Math.cos(ang) * dist}px`);
      piece.style.setProperty('--dy', `${Math.sin(ang) * dist}px`);
      piece.addEventListener('animationend', () => piece.remove());
      document.body.appendChild(piece);
    }

    lanzarMojones();

    // Temblor de la página (el avión y los controles fijos no se mueven)
    $$('main, footer').forEach((el) => {
      el.classList.remove('sacudir');
      void el.offsetWidth;
      el.classList.add('sacudir');
    });
  }
})();
