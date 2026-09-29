export const WORLD = { width: 1000, height: 450, ground: 340, runnerX: 185 };
export const PHYSICS = { gravity: 2200, jumpVelocity: -780, startSpeed: 310, maxSpeed: 540 };

export function createGame() {
  return { mode: 'ready', distance: 0, time: 0, speed: PHYSICS.startSpeed, y: WORLD.ground, vy: 0,
    grounded: true, jumpBuffer: 0, obstacles: [], spawnIn: 620, nextType: 'bike', nextId: 1,
    cleared: 0, jumps: 0, score: 0, collision: null };
}
export function startGame() {
  const game = createGame();
  game.mode = 'running';
  game.obstacles = [{ id: 0, type: 'hole', x: 930, width: 94, cleared: false }];
  return game;
}
export function requestJump(game) {
  if (game.mode !== 'running') return false;
  game.jumpBuffer = 0.12;
  return true;
}
export function hitsObstacle(game, obstacle) {
  if (obstacle.type === 'hole') {
    return WORLD.runnerX + 10 > obstacle.x + 7 && WORLD.runnerX - 10 < obstacle.x + obstacle.width - 7
      && game.y > WORLD.ground - 15;
  }
  return WORLD.runnerX + 14 > obstacle.x + 7 && WORLD.runnerX - 14 < obstacle.x + obstacle.width - 7
    && game.y - 7 > WORLD.ground - 56 && game.y - 67 < WORLD.ground + 1;
}
export function step(game, delta, random = Math.random) {
  const events = [];
  if (game.mode !== 'running' || !Number.isFinite(delta) || delta <= 0) return events;
  // Small physics steps prevent passing through an obstacle on a slow frame.
  let remaining = Math.min(delta, 0.1);
  while (remaining > 0.000001 && game.mode === 'running') {
    const dt = Math.min(remaining, 1 / 120); remaining -= dt;
    game.time += dt;
    game.speed = Math.min(PHYSICS.maxSpeed, PHYSICS.startSpeed + game.time * 3.2);
    if (game.jumpBuffer > 0 && game.grounded) {
      game.vy = PHYSICS.jumpVelocity; game.grounded = false; game.jumpBuffer = 0; game.jumps++;
      events.push('jump');
    }
    game.jumpBuffer = Math.max(0, game.jumpBuffer - dt);
    if (!game.grounded) {
      game.vy += PHYSICS.gravity * dt;
      game.y += game.vy * dt;
      if (game.y >= WORLD.ground) { game.y = WORLD.ground; game.vy = 0; game.grounded = true; events.push('land'); }
    }
    const travel = game.speed * dt;
    game.distance += travel;
    game.spawnIn -= travel;
    for (const obstacle of game.obstacles) obstacle.x -= travel;
    if (game.spawnIn <= 0) {
      const type = game.nextType;
      const width = type === 'hole' ? 88 + random() * 22 : 88;
      game.obstacles.push({ id: game.nextId++, type, x: WORLD.width + 70, width, cleared: false });
      // At least one full jump and a landing window between obstacles.
      game.spawnIn = width + game.speed * (1.22 + random() * 0.62);
      game.nextType = type === 'hole' ? 'bike' : 'hole';
    }
    for (const obstacle of game.obstacles) {
      if (hitsObstacle(game, obstacle)) {
        game.mode = 'over'; game.collision = obstacle.type; events.push('crash'); break;
      }
      if (!obstacle.cleared && obstacle.x + obstacle.width < WORLD.runnerX - 18) {
        obstacle.cleared = true; game.cleared++; events.push('clear');
      }
    }
    game.obstacles = game.obstacles.filter(obstacle => obstacle.x + obstacle.width > -60);
    game.score = Math.floor(game.distance / 10) + game.cleared * 25;
  }
  return events;
}
