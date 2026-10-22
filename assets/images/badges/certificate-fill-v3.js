// Reference fill and fit for certificate-template-v3.svg (SKE-10).
// The UI ports this; it is not loaded from the CDN. Call fill(svg, data),
// wait for document.fonts.ready, then fit() the name and the course.

const NS = 'http://www.w3.org/2000/svg';

// data: { name, course, date, id, partnerName?, partnerLogo? }
// partnerLogo must be a data: URI, or the canvas export taints and fails.
export function fill(svg, data) {
  const set = (id, v) => { svg.getElementById(id).textContent = v; };
  set('cert-name', data.name);
  set('cert-course', data.course);
  set('cert-date', data.date);
  set('cert-id', data.id);
  if (data.partnerName && data.partnerLogo) {
    set('cert-partner-line', `in collaboration with ${data.partnerName}`);
    svg.getElementById('partner-logo').setAttributeNS('http://www.w3.org/1999/xlink', 'href', data.partnerLogo);
  } else {
    // The partner logo and line are always removed together
    svg.getElementById('cert-partner-line').remove();
    svg.getElementById('partner-group').remove();
  }
}

// "after-name:84,x:10" -> { 'after-name': 84, x: 10 }
function parse(spec) {
  const out = {};
  (spec || '').split(',').filter(Boolean).forEach(pair => { const [id, dy] = pair.split(':'); out[id] = +dy; });
  return out;
}

function apply(svg, moves) {
  Object.entries(moves).forEach(([id, dy]) => svg.getElementById(id).setAttribute('transform', `translate(0 ${dy})`));
}

// One line if it fits at or above data-one-line-min, otherwise two lines
// split at the word break that balances their lengths.
export function fit(svg, el) {
  const d = el.dataset, max = +d.maxWidth, text = el.textContent.trim();
  const words = text.split(/\s+/);
  const two = d.preferTwo === 'true' && words.length > 1;
  let size = +el.getAttribute('font-size');
  if (!two) {
    while (el.getComputedTextLength() > max && size > +d.oneLineMin) { size -= 2; el.setAttribute('font-size', size); }
    if (el.getComputedTextLength() <= max || words.length < 2) {
      apply(svg, parse(d.movesOne));
      return;
    }
  }
  let best = 1, bestDiff = Infinity;
  for (let i = 1; i < words.length; i++) {
    const diff = Math.abs(words.slice(0, i).join(' ').length - words.slice(i).join(' ').length);
    if (diff < bestDiff) { best = i; bestDiff = diff; }
  }
  const lines = [words.slice(0, best).join(' '), words.slice(best).join(' ')];
  const x = el.getAttribute('x');
  el.textContent = '';
  lines.forEach((line, i) => {
    const t = document.createElementNS(NS, 'tspan');
    t.setAttribute('x', x);
    if (i) t.setAttribute('dy', d.lineGap);
    t.textContent = line;
    el.appendChild(t);
  });
  size = +d.twoLineMax;
  el.setAttribute('font-size', size);
  const widest = () => Math.max(...[...el.children].map(t => t.getComputedTextLength()));
  while (widest() > max && size > +d.twoLineMin) { size -= 2; el.setAttribute('font-size', size); }
  const moves = parse(d.movesTwo);
  if (d.gapTarget) {
    // The line gap scales with the fitted size, and the content below closes up to match
    const gap = Math.round(+d.lineGap * size / +d.twoLineMax);
    el.children[1].setAttribute('dy', gap);
    moves[d.gapTarget] = (moves[d.gapTarget] || 0) + gap - +d.lineGap;
  }
  apply(svg, moves);
}
