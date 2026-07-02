// ============================================================
// MOBILE NAV
// ============================================================
const navToggle = document.getElementById('navToggle');
const navMobile = document.getElementById('navMobile');
navToggle.addEventListener('click', () => {
  navMobile.classList.toggle('open');
});
navMobile.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => navMobile.classList.remove('open'));
});

// ============================================================
// FOOTER YEAR
// ============================================================
document.getElementById('year').textContent = new Date().getFullYear();

// ============================================================
// SCROLL REVEAL
// ============================================================
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
revealEls.forEach((el, i) => {
  el.style.animationDelay = `${i * 80}ms`;
  io.observe(el);
});

// ============================================================
// HEX-GRID CANVAS NETWORK
// draws a field of hexagon nodes connected by lines, drifting
// slowly, with a soft pull toward the pointer near the hero.
// ============================================================
function initHexField(canvasId, opts = {}) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let w, h, nodes = [];
  const spacing = opts.spacing || 96;
  const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#E8FF00';

  let pointer = { x: -9999, y: -9999 };

  function resize() {
    w = canvas.width = canvas.offsetWidth * devicePixelRatio;
    h = canvas.height = canvas.offsetHeight * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);
    buildNodes();
  }

  function buildNodes() {
    nodes = [];
    const cw = canvas.offsetWidth, ch = canvas.offsetHeight;
    const cols = Math.ceil(cw / spacing) + 2;
    const rows = Math.ceil(ch / spacing) + 2;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const offsetX = (r % 2) * (spacing / 2);
        nodes.push({
          baseX: c * spacing + offsetX - spacing,
          baseY: r * spacing - spacing,
          x: 0, y: 0,
          phase: Math.random() * Math.PI * 2,
          amp: 4 + Math.random() * 6
        });
      }
    }
  }

  function hex(cx, cy, size, alpha) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = Math.PI / 3 * i - Math.PI / 6;
      const px = cx + size * Math.cos(angle);
      const py = cy + size * Math.sin(angle);
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.strokeStyle = `rgba(232,255,0,${alpha})`;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  let t = 0;
  function draw() {
    ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
    t += 0.008;

    nodes.forEach(n => {
      n.x = n.baseX + Math.sin(t + n.phase) * n.amp;
      n.y = n.baseY + Math.cos(t + n.phase) * n.amp;

      const dx = n.x - pointer.x, dy = n.y - pointer.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const near = Math.max(0, 1 - dist / 220);

      hex(n.x, n.y, spacing / 2.6, 0.06 + near * 0.35);

      if (near > 0.05) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(232,255,0,${0.15 + near * 0.6})`;
        ctx.fill();
      }
    });

    if (!reduceMotion) requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  canvas.parentElement.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    pointer.x = e.clientX - rect.left;
    pointer.y = e.clientY - rect.top;
  });
  canvas.parentElement.addEventListener('mouseleave', () => {
    pointer.x = -9999; pointer.y = -9999;
  });

  resize();
  draw();
  if (reduceMotion) draw(); // draw one static frame
}

initHexField('hexCanvas', { spacing: 100 });
initHexField('hexCanvasFooter', { spacing: 110 });