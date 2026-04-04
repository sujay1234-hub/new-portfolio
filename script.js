/* ============================================================
   SUJAY BANARJEE PORTFOLIO — script.js
   Premium 3D Animated Portfolio
   ============================================================ */

/* ============================================================
   1. WEBGL PARTICLE FIELD
   ============================================================ */
(function initWebGL() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;

  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) { canvas.style.display = 'none'; return; }

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  // Vertex shader — particles drift upward with sine wobble
  const VS = `
    attribute vec2 aPos;
    attribute float aSize;
    attribute float aAlpha;
    attribute float aSpeed;
    attribute float aPhase;
    uniform float uTime;
    varying float vAlpha;
    void main() {
      float t   = uTime * 0.0003;
      float y   = mod(aPos.y - t * aSpeed, 2.0) - 1.0;
      float x   = aPos.x + sin(t * aSpeed * 0.7 + aPhase) * 0.018;
      gl_Position  = vec4(x, y, 0.0, 1.0);
      gl_PointSize = aSize;
      vAlpha = aAlpha * (0.5 + 0.5 * sin(t * aSpeed + aPhase));
    }
  `;

  const FS = `
    precision mediump float;
    varying float vAlpha;
    uniform vec3 uColor;
    void main() {
      float d = length(gl_PointCoord - 0.5) * 2.0;
      float a = smoothstep(1.0, 0.1, d);
      gl_FragColor = vec4(uColor, a * vAlpha);
    }
  `;

  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    return s;
  }

  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, VS));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FS));
  gl.linkProgram(prog);
  gl.useProgram(prog);

  const N = 220;
  const pos    = new Float32Array(N * 2);
  const sizes  = new Float32Array(N);
  const alphas = new Float32Array(N);
  const speeds = new Float32Array(N);
  const phases = new Float32Array(N);

  for (let i = 0; i < N; i++) {
    pos[i*2]   = Math.random() * 2 - 1;
    pos[i*2+1] = Math.random() * 2 - 1;
    sizes[i]   = Math.random() * 2.2 + 0.8;
    alphas[i]  = Math.random() * 0.35 + 0.05;
    speeds[i]  = Math.random() * 0.9 + 0.3;
    phases[i]  = Math.random() * Math.PI * 2;
  }

  function makeBuf(data, name, size) {
    const b = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, name);
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
  }

  makeBuf(pos,    'aPos',   2);
  makeBuf(sizes,  'aSize',  1);
  makeBuf(alphas, 'aAlpha', 1);
  makeBuf(speeds, 'aSpeed', 1);
  makeBuf(phases, 'aPhase', 1);

  const uTime  = gl.getUniformLocation(prog, 'uTime');
  const uColor = gl.getUniformLocation(prog, 'uColor');

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
  gl.uniform3f(uColor, 0.78, 0.66, 0.43); // warm gold

  let t0 = null;
  function frame(ts) {
    if (!t0) t0 = ts;
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(uTime, ts - t0);
    gl.drawArrays(gl.POINTS, 0, N);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();


/* ============================================================
   2. HERO ENTRANCE ANIMATION
   ============================================================ */
(function heroEntrance() {
  function anim(el, delay, fromStyle, toStyle, duration) {
    if (!el) return;
    Object.assign(el.style, fromStyle, { transition: 'none' });
    setTimeout(() => {
      el.style.transition = `opacity ${duration}ms cubic-bezier(0.25,0.46,0.45,0.94), transform ${duration}ms cubic-bezier(0.25,0.46,0.45,0.94)`;
      Object.assign(el.style, toStyle);
    }, delay);
  }

  const items = [
    { id: 'hero-tag',     delay: 150,  from: { opacity: '0', transform: 'translateX(-24px)' }, dur: 700 },
    { id: 'h-line1',      delay: 280,  from: { opacity: '0', transform: 'translateY(110%)' },  dur: 1000 },
    { id: 'h-line2',      delay: 440,  from: { opacity: '0', transform: 'translateY(110%)' },  dur: 1000 },
    { id: 'hero-sub',     delay: 680,  from: { opacity: '0', transform: 'translateY(22px)' },  dur: 750 },
    { id: 'hero-tl',      delay: 820,  from: { opacity: '0', transform: 'translateY(22px)' },  dur: 750 },
    { id: 'hero-act',     delay: 980,  from: { opacity: '0', transform: 'translateY(22px)' },  dur: 750 },
    { id: 'scroll-hint',  delay: 1400, from: { opacity: '0', transform: 'translateY(12px)' },  dur: 700 },
  ];

  items.forEach(({ id, delay, from, dur }) => {
    const el = document.getElementById(id);
    anim(el, delay, from, { opacity: '1', transform: 'none' }, dur);
  });
})();


/* ============================================================
   3. SCROLL REVEAL — IntersectionObserver (instant, no lag)
   ============================================================ */
(function scrollReveal() {
  const selectors = '.reveal, .reveal-left, .reveal-right, .eyebrow, .section-title';
  const targets = document.querySelectorAll(selectors);

  // Stagger children within the same parent
  targets.forEach((el, i) => {
    const delay = parseFloat(el.style.transitionDelay) || 0;
    // Keep existing transition-delay from HTML inline style
  });

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -60px 0px' });

  targets.forEach(el => obs.observe(el));
})();


/* ============================================================
   4. HERO VIDEO PARALLAX
   ============================================================ */
(function heroParallax() {
  const video = document.querySelector('.hero-video');
  if (!video) return;

  let ticking = false;
  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        const progress = Math.min(window.scrollY / window.innerHeight, 1);
        video.style.transform = `scale(${1.06 + progress * 0.07}) translateY(${progress * 55}px)`;
        ticking = false;
      });
      ticking = true;
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
})();


/* ============================================================
   5. CUSTOM CURSOR
   ============================================================ */
(function initCursor() {
  const dot  = document.getElementById('cursor');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring || window.matchMedia('(max-width:768px)').matches) return;

  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate(${mx - 4}px, ${my - 4}px)`;
  }, { passive: true });

  function animRing() {
    rx += (mx - rx) * 0.1;
    ry += (my - ry) * 0.1;
    ring.style.transform = `translate(${rx - 20}px, ${ry - 20}px)`;
    requestAnimationFrame(animRing);
  }
  animRing();

  const hoverTargets = document.querySelectorAll('a, button, .card, .tag, .btn');
  hoverTargets.forEach(el => {
    el.addEventListener('mouseenter', () => {
      ring.style.width  = '56px';
      ring.style.height = '56px';
      ring.style.borderColor = 'rgba(200,169,110,0.75)';
    });
    el.addEventListener('mouseleave', () => {
      ring.style.width  = '40px';
      ring.style.height = '40px';
      ring.style.borderColor = 'rgba(200,169,110,0.5)';
    });
  });
})();


/* ============================================================
   6. 3D CARD TILT WITH SHINE
   ============================================================ */
(function init3DTilt() {
  if (window.matchMedia('(max-width:768px)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion:reduce)').matches) return;

  document.querySelectorAll('.card').forEach(card => {
    let shine = null;

    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      const x  = e.clientX - r.left;
      const y  = e.clientY - r.top;
      const cx = r.width  / 2;
      const cy = r.height / 2;
      const rx = ((y - cy) / cy) * 7;
      const ry = ((cx - x) / cx) * 7;

      card.style.transition = 'transform 0.08s ease, box-shadow 0.5s ease, background 0.5s ease, border-color 0.5s ease';
      card.style.transform  = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(6px)`;

      // Shine
      if (!shine) {
        shine = document.createElement('div');
        shine.style.cssText = 'position:absolute;inset:0;border-radius:inherit;pointer-events:none;z-index:5;transition:opacity .3s';
        card.appendChild(shine);
      }
      const sx = (x / r.width)  * 100;
      const sy = (y / r.height) * 100;
      shine.style.background = `radial-gradient(circle at ${sx}% ${sy}%, rgba(255,255,255,0.065) 0%, transparent 55%)`;
      shine.style.opacity = '1';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94), box-shadow 0.5s ease, background 0.5s ease, border-color 0.5s ease';
      card.style.transform  = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0)';
      if (shine) shine.style.opacity = '0';
    });
  });
})();


/* ============================================================
   7. MAGNETIC BUTTONS
   ============================================================ */
(function initMagnetic() {
  if (window.matchMedia('(max-width:768px)').matches) return;

  document.querySelectorAll('.magnetic').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width  / 2;
      const y = e.clientY - r.top  - r.height / 2;
      btn.style.transition = 'transform 0.3s cubic-bezier(0.25,0.46,0.45,0.94)';
      btn.style.transform  = `translate(${x * 0.27}px, ${y * 0.27}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transition = 'transform 0.65s cubic-bezier(0.34,1.56,0.64,1)';
      btn.style.transform  = 'translate(0, 0)';
    });
  });
})();


/* ============================================================
   8. NAVIGATION
   ============================================================ */
(function initNav() {
  const nav    = document.getElementById('nav');
  const toggle = document.getElementById('nav-toggle');
  const links  = document.getElementById('nav-links');
  let open = false;

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  if (toggle) {
    toggle.addEventListener('click', () => {
      open = !open;
      links.classList.toggle('open', open);
    });
  }

  document.querySelectorAll('.nav-link').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        // Smooth scroll
        const top = target.getBoundingClientRect().top + window.scrollY - 60;
        window.scrollTo({ top, behavior: 'smooth' });
        if (open) { links.classList.remove('open'); open = false; }
      }
    });
  });
})();


/* ============================================================
   9. VIDEO SETTINGS
   ============================================================ */
(function videoSetup() {
  const v = document.querySelector('.hero-video');
  if (v) { v.playbackRate = 0.75; }

  document.addEventListener('visibilitychange', () => {
    const v = document.querySelector('.hero-video');
    if (!v) return;
    if (document.hidden) v.pause(); else v.play().catch(() => {});
  });
})();


/* ============================================================
   10. REDUCED MOTION — instant reveal
   ============================================================ */
if (window.matchMedia('(prefers-reduced-motion:reduce)').matches) {
  document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .eyebrow, .section-title')
    .forEach(el => el.classList.add('visible'));
}


/* ============================================================
   11. TAG ENTRANCE — stagger on scroll
   ============================================================ */
(function tagStagger() {
  const groups = document.querySelectorAll('.tags');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const tags = entry.target.querySelectorAll('.tag');
        tags.forEach((tag, i) => {
          tag.style.opacity = '0';
          tag.style.transform = 'translateY(10px) scale(0.9)';
          tag.style.transition = `opacity 0.4s ease ${i * 0.04}s, transform 0.4s ease ${i * 0.04}s`;
          requestAnimationFrame(() => {
            setTimeout(() => {
              tag.style.opacity  = '1';
              tag.style.transform = 'translateY(0) scale(1)';
            }, 50);
          });
        });
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  groups.forEach(g => obs.observe(g));
})();


/* ============================================================
   12. STAT NUMBER COUNT-UP
   ============================================================ */
(function countUp() {
  const stats = document.querySelectorAll('.stat-n');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el  = entry.target;
        const raw = el.textContent.trim();
        if (raw === '∞' || raw === '—') { obs.unobserve(el); return; }
        const num  = parseInt(raw);
        const suf  = raw.replace(/[0-9]/g, '');
        let cur = 0;
        const dur = 1200;
        const step = dur / num;
        const timer = setInterval(() => {
          cur++;
          el.textContent = cur + suf;
          if (cur >= num) { el.textContent = raw; clearInterval(timer); }
        }, step);
        obs.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  stats.forEach(s => obs.observe(s));
})();


/* ============================================================
   INIT COMPLETE
   ============================================================ */
window.addEventListener('load', () => {
  document.body.classList.remove('loading');
});