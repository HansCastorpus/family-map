// =====================
// SVG Viewer JS
// =====================

const svg = document.getElementById('map');

// ---------------------
// Constants
// ---------------------
const VIEWBOX_WIDTH = 2976.18;  // Changed from 2692.03
const VIEWBOX_HEIGHT = 1503.34; // Changed from 1254.15
const MIN_WIDTH = 500;           // max zoom in
const MAX_WIDTH = VIEWBOX_WIDTH; // max zoom out
const ZOOM_FACTOR = 1.2;
const INITIAL_ZOOM = 1.5;        // start zoomed in

// ---------------------
// ViewBox state
// ---------------------
let viewBox = { x: 0, y: 0, w: VIEWBOX_WIDTH, h: VIEWBOX_HEIGHT };

// ---------------------
// Utility
// ---------------------
function updateViewBox() {
  svg.setAttribute('viewBox', `${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`);
}
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
// ---------------------
// Pan
// ---------------------
let isDragging = false;
let start = { x: 0, y: 0 };

svg.addEventListener('pointerdown', e => {
  isDragging = true;
  start.x = e.clientX;
  start.y = e.clientY;
  svg.classList.add('dragging');
  svg.setPointerCapture(e.pointerId);
});

svg.addEventListener('pointermove', e => {
  if (!isDragging) return;
  const dx = (e.clientX - start.x) * (viewBox.w / svg.clientWidth);
  const dy = (e.clientY - start.y) * (viewBox.h / svg.clientHeight);

  const newX = viewBox.x - dx;
  const newY = viewBox.y - dy;

  // Only allow panning if there's content beyond the viewport
  // Clamp between 0 and the maximum possible offset
  const maxX = Math.max(0, VIEWBOX_WIDTH - viewBox.w);
  const maxY = Math.max(0, VIEWBOX_HEIGHT - viewBox.h);

  viewBox.x = clamp(newX, 0, maxX);
  viewBox.y = clamp(newY, 0, maxY);

  start.x = e.clientX;
  start.y = e.clientY;
  updateViewBox();
});

svg.addEventListener('pointerup', stopDrag);
svg.addEventListener('pointercancel', stopDrag);

function stopDrag(e) {
  if (isDragging && e.pointerId) {
    svg.releasePointerCapture(e.pointerId);
  }
  isDragging = false;
  svg.classList.remove('dragging');
}
// ---------------------
// Zoom (wheel)
svg.addEventListener('wheel', e => {
  e.preventDefault();
  const scale = e.deltaY < 0 ? 1 / ZOOM_FACTOR : ZOOM_FACTOR;

  const rect = svg.getBoundingClientRect();
  const sx = (e.clientX - rect.left) / rect.width;
  const sy = (e.clientY - rect.top) / rect.height;

  let newW = clamp(viewBox.w * scale, MIN_WIDTH, MAX_WIDTH);
  let newH = newW * (VIEWBOX_HEIGHT / VIEWBOX_WIDTH);

  viewBox.x = clamp(viewBox.x + (viewBox.w - newW) * sx, 0, VIEWBOX_WIDTH - newW);
  viewBox.y = clamp(viewBox.y + (viewBox.h - newH) * sy, 0, VIEWBOX_HEIGHT - newH);
  viewBox.w = newW;
  viewBox.h = newH;

  updateViewBox();
}, { passive: false });

// ---------------------
// Buttons
function zoomAtCenter(scale) {
  const cx = viewBox.x + viewBox.w / 2;
  const cy = viewBox.y + viewBox.h / 2;

  let newW = clamp(viewBox.w * scale, MIN_WIDTH, MAX_WIDTH);
  let newH = newW * (VIEWBOX_HEIGHT / VIEWBOX_WIDTH);

  viewBox.x = clamp(cx - newW / 2, 0, VIEWBOX_WIDTH - newW);
  viewBox.y = clamp(cy - newH / 2, 0, VIEWBOX_HEIGHT - newH);
  viewBox.w = newW;
  viewBox.h = newH;

  updateViewBox();
}

document.getElementById('zoom-in').addEventListener('click', () => zoomAtCenter(1 / ZOOM_FACTOR));
document.getElementById('zoom-out').addEventListener('click', () => zoomAtCenter(ZOOM_FACTOR));
document.getElementById('reset').addEventListener('click', initViewBox);

// ---------------------
// INITIALIZE
// ---------------------
function initViewBox() {
  // start zoomed in at top-left
  const newW = VIEWBOX_WIDTH / INITIAL_ZOOM;
  const newH = VIEWBOX_HEIGHT / INITIAL_ZOOM;

  viewBox = {
    x: 500,  // top-left
    y: 120,  // top-left
    w: newW,
    h: newH
  };

  updateViewBox();
}

initViewBox();

// Toggle visit image
const visitImage = document.querySelector('.visit');
const toggleVisitBtn = document.getElementById('toggle-visit');

toggleVisitBtn.addEventListener('click', () => {
  const hidden = visitImage.classList.toggle('is-hidden');
  
  if (hidden) {
    toggleVisitBtn.textContent = '◄ Some more data';
  } else {
    toggleVisitBtn.textContent = '► No more data';
  }
});

// Toggle bottom legend
const legendBottom = document.querySelector('.legend-bottom');
const toggleLegendBtn = document.getElementById('toggle-legend');

toggleLegendBtn.addEventListener('click', () => {
  const hidden = legendBottom.classList.toggle('is-hidden');
  
  if (hidden) {
    toggleLegendBtn.textContent = '▲ Some more data';
  } else {
    toggleLegendBtn.textContent = '▼ No more data';
  }
});

// Position bottom elements at SVG bottom edge
function positionBottomElements() {
  const svgRect = svg.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  
  // Calculate where SVG actually ends
  const svgBottom = svgRect.bottom;
  const distanceFromBottom = viewportHeight - svgBottom;
  
  // Position controls and legend at SVG bottom
  const controls = document.getElementById('controls');
  const legendContainer = document.querySelector('.legend-bottom-container');
  
  controls.style.bottom = distanceFromBottom + 20 + 'px';
  legendContainer.style.bottom = distanceFromBottom + 20 + 'px';
  
  // Constrain visit image to SVG height
  const visitImage = document.querySelector('.visit');
  const svgHeight = svgRect.height;
  visitImage.style.maxHeight = (svgHeight - 120) + 'px'; // Account for padding and button
}

// Call on load and resize
positionBottomElements();
window.addEventListener('resize', positionBottomElements);
