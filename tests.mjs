import test from 'node:test';
import assert from 'node:assert/strict';
import { WORLD, PHYSICS, createGame, startGame, requestJump, hitsObstacle, step } from './engine.js';

test('ready state does not move and rejects jumping', () => {
  const game = createGame(); assert.equal(requestJump(game), false); step(game, 1); assert.equal(game.distance, 0);
});
test('a jump has useful clearance and lands once without a double jump', () => {
  const game = startGame(); game.obstacles = []; game.spawnIn = 10000;
  requestJump(game); let highest = WORLD.ground, landings = 0;
  for (let i = 0; i < 60; i++) {
    if (i === 8) requestJump(game);
    const events = step(game, 1 / 60); landings += events.filter(e => e === 'land').length; highest = Math.min(highest, game.y);
  }
  assert(highest < WORLD.ground - 125); assert.equal(game.jumps, 1); assert.equal(landings, 1); assert.equal(game.y, WORLD.ground);
});
test('potholes and bicycles collide on the road but are cleared in the air', () => {
  const game = startGame();
  for (const type of ['hole', 'bike']) {
    const o = { type, x: WORLD.runnerX - 20, width: 95 };
    assert(hitsObstacle(game, o)); game.y = WORLD.ground - 100; assert(!hitsObstacle(game, o)); game.y = WORLD.ground;
  }
});
test('not jumping ends the run with the correct obstacle and freezes score', () => {
  for (const type of ['hole', 'bike']) {
    const game = startGame(); game.obstacles = [{ type, x: WORLD.runnerX + 40, width: 94, cleared: false }];
    for (let i = 0; i < 60; i++) step(game, 1 / 60);
    assert.equal(game.mode, 'over'); assert.equal(game.collision, type);
    const score = game.score, distance = game.distance; step(game, 1); assert.equal(game.score, score); assert.equal(game.distance, distance);
  }
});
test('pause freezes time, distance and vertical velocity', () => {
  const game = startGame(); requestJump(game); step(game, 0.05); game.mode = 'paused';
  const before = JSON.stringify(game); step(game, 0.1); assert.equal(JSON.stringify(game), before);
});
test('jump buffer accepts a jump just before landing', () => {
  const game = startGame(); game.obstacles = []; game.spawnIn = 10000;
  game.y = WORLD.ground - 2; game.vy = 400; game.grounded = false; requestJump(game);
  step(game, 0.05); assert.equal(game.jumps, 1); assert(game.vy < 0);
});
test('all obstacles remain jumpable up to maximum speed in a three-minute run', () => {
  const game = startGame(); let seed = 41; const types = new Set();
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  for (let i = 0; i < 180 * 60; i++) {
    const next = game.obstacles.find(o => !o.cleared && o.x + o.width > WORLD.runnerX - 18);
    if (next) types.add(next.type);
    if (next && game.grounded && next.x > WORLD.runnerX && next.x - WORLD.runnerX < game.speed * 0.26 + 12) requestJump(game);
    step(game, 1 / 60, random);
    assert.equal(game.mode, 'running', `Collision at ${game.time.toFixed(2)} seconds, type ${game.collision}`);
  }
  assert.equal(types.size, 2); assert(game.cleared > 60); assert.equal(game.speed, PHYSICS.maxSpeed);
  assert.equal(game.score, Math.floor(game.distance / 10) + game.cleared * 25);
});
test('different frame rates give equivalent physics and score', () => {
  const a = startGame(), b = startGame(); a.spawnIn = b.spawnIn = 10000; a.obstacles = []; b.obstacles = [];
  requestJump(a); requestJump(b);
  for (let i = 0; i < 120; i++) step(a, 1 / 120);
  for (let i = 0; i < 30; i++) step(b, 1 / 30);
  assert(Math.abs(a.distance - b.distance) < 0.0001); assert.equal(a.score, b.score); assert.equal(a.y, b.y);
});
