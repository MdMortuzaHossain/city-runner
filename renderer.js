import { WORLD } from './engine.js';

const colors = { sky: '#e7edf1', distant: '#c9d8dc', ink: '#303952', peach: '#d5a38d', cream: '#e6d8b8', teal: '#95b9ad', road: '#515767' };
function rect(ctx, x, y, w, h, color, radius = 0) {
  ctx.fillStyle = color; ctx.beginPath(); ctx.roundRect(x, y, w, h, radius); ctx.fill();
}
function line(ctx, x1, y1, x2, y2, color, width = 2) {
  ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
}
function ellipse(ctx, x, y, rx, ry, color) {
  ctx.fillStyle = color; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
}
function building(ctx, x, index) {
  const width = 155, top = 108 + (index % 4) * 16, color = [colors.peach, colors.cream, colors.teal, '#c6b5b5'][index % 4];
  rect(ctx, x, top, width, 282 - top, color, 2);
  rect(ctx, x - 4, top - 5, width + 8, 7, '#4e64705c');
  rect(ctx, x + 11, top - 19, 38, 14, '#738b92', 2);
  for (let row = 0; row < 2; row++) for (let col = 0; col < 4; col++) {
    const wx = x + 16 + col * 34, wy = top + 19 + row * 39;
    rect(ctx, wx, wy, 19, 24, '#426273'); rect(ctx, wx + 3, wy + 3, 12, 9, '#b9d1cb');
    line(ctx, wx + 9, wy, wx + 9, wy + 24, '#728b8b', 1); rect(ctx, wx - 2, wy + 24, 23, 3, '#6e817f');
  }
  const shop = ['চায়ের আড্ডা', 'সাইকেল সারাই', 'শহর স্টোর', 'বইয়ের দোকান'][index % 4];
  rect(ctx, x + 9, 230, 138, 51, '#4a626b');
  rect(ctx, x + 9, 216, 138, 22, '#f4e9cd', 2);
  ctx.fillStyle = '#4f6268'; ctx.font = '12px "Nirmala UI", sans-serif'; ctx.textAlign = 'center'; ctx.fillText(shop, x + 78, 232);
  for (let i = 0; i < 9; i++) rect(ctx, x + 8 + i * 15.5, 239, 16, 10, i % 2 ? '#f0d6ac' : '#b86b51');
  rect(ctx, x + 22, 254, 30, 27, '#c3d1bd'); rect(ctx, x + 85, 253, 42, 28, '#324e59');
  line(ctx, x + 65, 251, x + 65, 282, '#80928b', 2);
}
function skyline(ctx, distance) {
  rect(ctx, 0, 0, 1000, 450, colors.sky);
  ellipse(ctx, 805, 65, 36, 36, '#f3c892');
  for (let i = 0; i < 13; i++) {
    const x = i * 95 - (distance * 0.12) % 95, height = 75 + (i * 31) % 91;
    rect(ctx, x, 248 - height, 72, height, i % 2 ? '#c8d7d9' : '#d1dedf');
    for (let row = 0; row < 3; row++) for (let col = 0; col < 3; col++) rect(ctx, x + 12 + col * 18, 261 - height + row * 22, 6, 9, '#b3c8ce');
  }
  const scroll = distance * 0.32;
  const offset = Math.floor(scroll / 168);
  for (let i = -1; i < 8; i++) building(ctx, i * 168 - scroll % 168, ((offset + i) % 12 + 12) % 12);
  for (let i = 0; i < 4; i++) {
    const x = i * 350 - (distance * 0.45) % 350;
    line(ctx, x + 30, 117, x + 30, 286, '#62757b', 5);
    line(ctx, x + 30, 117, x + 67, 117, '#62757b', 4);
    ellipse(ctx, x + 68, 119, 11, 4, '#849799');
    ctx.strokeStyle = '#6e82856b'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x + 30, 140); ctx.quadraticCurveTo(x + 205, 173, x + 380, 140); ctx.stroke();
  }
  rect(ctx, 0, 282, 1000, 22, '#b8bcb2');
  for (let x = -(distance * 0.5) % 90; x < 1000; x += 90) { line(ctx, x, 282, x - 14, 303, '#9ca6a0', 1); }
  rect(ctx, 0, 304, 1000, 9, '#e1dfcd');
  rect(ctx, 0, 313, 1000, 137, colors.road);
  line(ctx, 0, 319, 1000, 319, '#6d7380', 2);
  for (let x = -distance % 170; x < 1000; x += 170) rect(ctx, x, 392, 92, 4, '#c8c3ad', 2);
  for (let i = 0; i < 25; i++) {
    const x = (i * 89 - distance * 1.05) % 1100;
    line(ctx, x, 358 + i % 3 * 31, x + 9, 358 + i % 3 * 31, '#626879', 1);
  }
  rect(ctx, 0, 438, 1000, 12, '#d2cdbb');
  for (let x = -distance % 96; x < 1000; x += 96) rect(ctx, x, 438, 44, 12, '#303c4e');
}
function hole(ctx, obstacle) {
  const { x, width: w } = obstacle;
  ellipse(ctx, x + w / 2, 341, w / 2 + 9, 13, '#9f9889');
  ellipse(ctx, x + w / 2, 339, w / 2, 12, '#252e3c');
  ellipse(ctx, x + w / 2 + 6, 343, w / 2 - 11, 6, '#151f2a');
  line(ctx, x - 13, 338, x - 23, 334, '#333d4a', 2);
  line(ctx, x + w + 9, 342, x + w + 20, 350, '#333d4a', 2);
  line(ctx, x + w + 15, 347, x + w + 25, 346, '#333d4a', 2);
  rect(ctx, x - 4, 326, 8, 4, '#b5a996', 1); rect(ctx, x + w - 3, 329, 7, 4, '#b5a996', 1);
}
function bicycle(ctx, obstacle) {
  const x = obstacle.x, y = WORLD.ground;
  ellipse(ctx, x + 44, y + 4, 48, 6, '#38404d70');
  ctx.save(); ctx.translate(x + 44, y - 22); ctx.rotate(-0.1);
  for (const wx of [-27, 29]) {
    ctx.strokeStyle = '#273747'; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(wx, 4, 18, 15, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = '#a3b4b3'; ctx.lineWidth = 1;
    for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 3) line(ctx, wx, 4, wx + Math.cos(angle) * 16, 4 + Math.sin(angle) * 13, '#a3b4b3', 1);
  }
  const frame = '#eeae59';
  line(ctx, -27, 4, -12, -20, frame, 4); line(ctx, -12, -20, 0, 5, frame, 4); line(ctx, 0, 5, -27, 4, frame, 4);
  line(ctx, -12, -20, 17, -20, frame, 4); line(ctx, 17, -20, 0, 5, frame, 4); line(ctx, 17, -20, 29, 4, frame, 4);
  line(ctx, 17, -20, 15, -31, '#263c4c', 3); line(ctx, 15, -31, 26, -31, '#263c4c', 4);
  line(ctx, -12, -20, -15, -28, '#263c4c', 3); line(ctx, -23, -28, -9, -28, '#263c4c', 5);
  line(ctx, 0, 5, 7, 10, '#263c4c', 3); line(ctx, 5, 11, 12, 11, '#263c4c', 3);
  ctx.restore();
}
function runner(ctx, game, time, crashAge) {
  const x = WORLD.runnerX, y = game.y;
  const airborne = !game.grounded;
  const over = game.mode === 'over';
  const run = game.mode === 'running' && !airborne;
  const swing = run ? Math.sin(time * 19) : 0;
  ellipse(ctx, x, 345, Math.max(9, 24 - (WORLD.ground - y) * 0.08), 5, '#25364840');
  ctx.save(); ctx.translate(x, y);
  if (over) { ctx.translate(0, game.collision === 'hole' ? Math.min(28, crashAge * 95) : 0); ctx.rotate(Math.min(1.2, crashAge * 5)); }
  const leg = (side, back) => {
    const hipX = back ? -5 : 6;
    const kneeX = airborne ? (back ? -19 : 20) : hipX + swing * side * 15;
    const kneeY = airborne ? (back ? -22 : -24) : -20;
    const footX = airborne ? (back ? -24 : 9) : hipX - swing * side * 21;
    const footY = airborne ? (back ? -9 : -18) : Math.min(-2, -2 - Math.max(0, swing * side) * 12);
    line(ctx, hipX, -37, kneeX, kneeY, back ? '#253b55' : '#314b6b', 10);
    line(ctx, kneeX, kneeY, footX, footY, back ? '#253b55' : '#314b6b', 9);
    line(ctx, footX - 1, footY, footX + 10, footY + 1, '#f2e9d2', 6);
    line(ctx, footX - 2, footY + 3, footX + 12, footY + 3, '#243448', 2);
  };
  leg(1, true);
  line(ctx, -6, -62, -18 - swing * 10, -49, '#d78f72', 7);
  line(ctx, -18 - swing * 10, -49, -22 - swing * 9, -59, '#dda080', 6);
  ctx.fillStyle = '#e8764b'; ctx.beginPath(); ctx.moveTo(-12, -68); ctx.quadraticCurveTo(3, -72, 13, -62); ctx.lineTo(11, -36); ctx.lineTo(-10, -35); ctx.closePath(); ctx.fill();
  rect(ctx, -12, -63, 8, 22, '#bf5b43', 3);
  line(ctx, 9, -62, 18 + swing * 12, airborne ? -69 : -47, '#f29163', 8);
  line(ctx, 18 + swing * 12, airborne ? -69 : -47, 30 + swing * 5, airborne ? -73 : -56, '#e4a785', 6);
  leg(-1, false);
  rect(ctx, -3, -77, 9, 10, '#d39473', 3);
  ellipse(ctx, 2, -85, 13, 15, '#e6aa87');
  ellipse(ctx, 13, -83, 4, 3, '#e6aa87');
  ctx.fillStyle = '#263247'; ctx.beginPath(); ctx.moveTo(-11, -84); ctx.lineTo(-13, -94); ctx.quadraticCurveTo(-5, -108, 13, -96); ctx.lineTo(13, -91); ctx.lineTo(-3, -92); ctx.lineTo(-6, -80); ctx.closePath(); ctx.fill();
  ellipse(ctx, 9, -86, 1.7, 1.7, '#273246');
  line(ctx, 9, -78, 13, -79, '#7f5148', 1.4);
  if (over) { line(ctx, 6, -91, 12, -88, '#273246', 2); }
  ctx.restore();
}

export function draw(ctx, game, visualTime, crashAge, particles) {
  ctx.save();
  if (game.mode === 'over' && crashAge < 0.24 && !matchMedia('(prefers-reduced-motion: reduce)').matches) ctx.translate(Math.sin(crashAge * 100) * (1 - crashAge / 0.24) * 4, 0);
  skyline(ctx, game.distance);
  for (const obstacle of game.obstacles) obstacle.type === 'hole' ? hole(ctx, obstacle) : bicycle(ctx, obstacle);
  for (const p of particles) { ctx.globalAlpha = Math.max(0, p.life); ellipse(ctx, p.x, p.y, p.size, p.size, p.color); }
  ctx.globalAlpha = 1;
  runner(ctx, game, visualTime, crashAge);
  if (game.mode === 'over' && game.collision === 'hole') {
    const obstacle = game.obstacles.find(o => o.type === 'hole' && o.x < WORLD.runnerX && o.x + o.width > WORLD.runnerX);
    if (obstacle) ellipse(ctx, obstacle.x + obstacle.width / 2, 348, obstacle.width / 2 - 3, 4, '#323947');
  }
  ctx.restore();
}
