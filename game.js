import { WORLD, PHYSICS, createGame, startGame, requestJump, step } from './engine.js';
import { draw } from './renderer.js';

const $ = id => document.getElementById(id);
const canvas = $('canvas'), ctx = canvas.getContext('2d');
const bn = value => String(value).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[d]);
const quotes = ['কুত্তার বাচ্চা!', 'ছাগলের বাচ্চা!'];
let game = createGame(), best = 0, soundOn = true, failures = 0, crashAge = 0, particles = [];
let audio = null, voice = null, lastFrame = performance.now(), visualTime = 0, overlayDelay = 0;
let toastTimer = null, messageUntil = 0, lastMilestone = 0;
try { best = Math.max(0, Math.min(99999999, Number(localStorage.getItem('city-runner-best')) || 0)); soundOn = localStorage.getItem('city-runner-sound') !== 'off'; } catch {}

function refreshVoices() {
  if (!('speechSynthesis' in window)) {
    $('voice-info').textContent = 'এই ব্রাউজারে কথা বলার সুবিধা নেই। বকুনির লেখা দেখা যাবে।'; return;
  }
  voice = speechSynthesis.getVoices().find(v => /^bn[-_]/i.test(v.lang) || v.lang === 'bn') || null;
  $('voice-info').textContent = voice
    ? 'বাংলা কণ্ঠ প্রস্তুত। শব্দ চালু থাকলে ধাক্কা খেয়ে রানার বকবে।'
    : 'এই ব্রাউজারে বাংলা কণ্ঠ পাওয়া যায়নি। বকুনির লেখা ও ধাক্কার শব্দ থাকবে; বাংলা ভয়েসযুক্ত ব্রাউজারে কথাও শোনা যাবে।';
}
if ('speechSynthesis' in window) speechSynthesis.addEventListener('voiceschanged', refreshVoices);
refreshVoices();

function unlockAudio() {
  if (!soundOn) return;
  try {
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) return;
    if (!audio) audio = new Audio();
    if (audio.state === 'suspended') audio.resume().catch(() => {});
  } catch {}
}
function effect(type) {
  if (!soundOn || !audio || audio.state !== 'running') return;
  try {
    const oscillator = audio.createOscillator(), gain = audio.createGain(), now = audio.currentTime;
    const sounds = { jump: [300, 650, 0.13, 0.045], land: [115, 75, 0.06, 0.025], crash: [135, 35, 0.35, 0.07], clear: [650, 950, 0.10, 0.025] };
    const [from, to, length, volume] = sounds[type];
    oscillator.type = type === 'crash' ? 'sawtooth' : 'sine';
    oscillator.frequency.setValueAtTime(from, now); oscillator.frequency.exponentialRampToValueAtTime(to, now + length);
    gain.gain.setValueAtTime(volume, now); gain.gain.exponentialRampToValueAtTime(0.001, now + length);
    oscillator.connect(gain); gain.connect(audio.destination); oscillator.start(now); oscillator.stop(now + length);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
  } catch {}
}
function say(text) {
  if (!soundOn || !('speechSynthesis' in window)) return;
  refreshVoices();
  if (!voice) return;
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = voice.lang; utterance.voice = voice; utterance.rate = 1.08; utterance.pitch = 0.93;
  utterance.onerror = () => { $('voice-info').textContent = 'এই মুহূর্তে বাংলা কথা শোনানো যায়নি। বকুনির লেখা দেখা যাচ্ছে।'; };
  speechSynthesis.speak(utterance);
}
function syncSound() {
  $('sound').setAttribute('aria-pressed', String(soundOn));
  $('sound').setAttribute('aria-label', soundOn ? 'শব্দ চালু আছে, বন্ধ করতে চাপো' : 'শব্দ বন্ধ আছে, চালু করতে চাপো');
  $('sound').innerHTML = `${soundOn ? '♪' : '♩'} <span>${soundOn ? 'শব্দ চালু' : 'শব্দ বন্ধ'}</span>`;
}
function hud() {
  $('score').textContent = bn(String(game.score).padStart(5, '0'));
  $('best').textContent = bn(String(best).padStart(5, '0'));
  $('distance').textContent = bn(Math.floor(game.distance / 10));
  $('speed').textContent = bn((game.speed / PHYSICS.startSpeed).toFixed(1)) + '×';
}
function setStatus(text, duration = 0) { $('status').textContent = text; messageUntil = game.time + duration; }
function toast(text) {
  clearTimeout(toastTimer); $('toast').textContent = text; $('toast').classList.add('visible');
  toastTimer = setTimeout(() => $('toast').classList.remove('visible'), 1800);
}
function start() {
  unlockAudio();
  if ('speechSynthesis' in window) speechSynthesis.cancel();
  game = startGame(); crashAge = 0; particles = []; overlayDelay = 0; lastMilestone = 0;
  clearTimeout(toastTimer); $('toast').classList.remove('visible');
  $('overlay').hidden = true; $('overlay').classList.remove('game-over');
  $('pause').disabled = false; $('pause').textContent = 'Ⅱ'; $('pause').setAttribute('aria-label', 'খেলা থামাও');
  setStatus('সামনে তাকাও। বাধার আগে Space চাপো।', 1.5);
  lastFrame = performance.now(); hud(); canvas.focus({ preventScroll: true });
}
function jumpAction() {
  unlockAudio();
  if (game.mode === 'ready') { start(); return; }
  if (game.mode === 'over') { if (crashAge >= 0.6) start(); return; }
  if (game.mode === 'paused') { resume(); return; }
  requestJump(game);
}
function pause() {
  if (game.mode !== 'running') return;
  game.mode = 'paused'; $('overlay').hidden = false; $('overlay').classList.remove('game-over');
  $('overlay-tag').textContent = 'একটু দম নাও'; $('overlay-title').textContent = 'দৌড় থেমেছে।';
  $('overlay-detail').textContent = 'প্রস্তুত হলে আবার রাস্তা ধরো।'; $('quote').hidden = true; $('results').hidden = true;
  $('play').innerHTML = 'আবার দৌড়াও <span>→</span>'; $('overlay-help').innerHTML = '<kbd>SPACE</kbd> বা <kbd>P</kbd> চাপলে চলবে';
  $('pause').textContent = '▶'; $('pause').setAttribute('aria-label', 'খেলা চালাও'); setStatus('বিরতি চলছে।');
}
function resume() {
  if (game.mode !== 'paused') return;
  unlockAudio(); game.mode = 'running'; $('overlay').hidden = true;
  $('pause').textContent = 'Ⅱ'; $('pause').setAttribute('aria-label', 'খেলা থামাও');
  lastFrame = performance.now(); setStatus('আবার দৌড়! সামনে খেয়াল রাখো।', 0.6); canvas.focus({ preventScroll: true });
}
function crash() {
  crashAge = 0; overlayDelay = 0.48;
  const phrase = quotes[failures++ % quotes.length];
  const record = game.score > best;
  if (record) { best = game.score; try { localStorage.setItem('city-runner-best', String(best)); } catch {} }
  $('overlay').classList.add('game-over'); $('overlay-tag').textContent = record ? 'নতুন সেরা স্কোর!' : 'এই দৌড় এখানেই শেষ';
  $('overlay-title').textContent = game.collision === 'hole' ? 'গর্তে গেল পা!' : 'সাইকেলে আটকে গেলে!';
  $('overlay-detail').textContent = 'পরের বার একটু আগে লাফ দাও।';
  $('quote').textContent = '“' + phrase + '”'; $('quote').hidden = false; $('results').hidden = false;
  $('result-score').textContent = bn(game.score); $('result-cleared').textContent = bn(game.cleared) + 'টি';
  $('result-time').textContent = bn(game.time.toFixed(1)) + ' সেকেন্ড';
  $('play').innerHTML = 'আরেকবার দৌড়াও <span>↗</span>'; $('overlay-help').innerHTML = '<kbd>SPACE</kbd> চাপলেও আবার শুরু';
  $('pause').disabled = true; setStatus(phrase);
  effect('crash'); say(phrase); burst(WORLD.runnerX, WORLD.ground - 10, 17, '#ead0a2'); hud();
}
function burst(x, y, count, color) {
  for (let i = 0; i < count; i++) particles.push({ x, y, vx: -25 - Math.random() * 130, vy: -15 - Math.random() * 70, life: 0.8, size: 1 + Math.random() * 3, color });
}
function frame(now) {
  const dt = Math.min(0.05, Math.max(0, (now - lastFrame) / 1000)); lastFrame = now;
  if (game.mode === 'running') {
    visualTime += dt;
    const events = step(game, dt);
    for (const event of events) {
      if (event === 'crash') crash();
      else if (event === 'jump') { effect('jump'); setStatus('লাফ! এবার বাধা টপকে নামো।', 0.55); burst(WORLD.runnerX, WORLD.ground, 5, '#d1c7b2'); }
      else if (event === 'land') { effect('land'); burst(WORLD.runnerX, WORLD.ground, 4, '#c4beb0'); }
      else if (event === 'clear') { effect('clear'); setStatus('সুন্দর! বাধা টপকেছ। +২৫', 0.6); }
    }
    if (game.mode === 'running' && game.time > messageUntil) {
      const next = game.obstacles.find(o => o.x + o.width > WORLD.runnerX - 15);
      $('status').textContent = next && next.x < 600 ? (next.type === 'hole' ? 'সামনে গর্ত! সময়মতো লাফ দাও।' : 'সামনে পড়ে থাকা সাইকেল! লাফ দাও।') : 'দৌড়াতে থাকো। পরের বাধা আসছে।';
    }
    const milestone = Math.floor(game.score / 250);
    if (milestone > lastMilestone && game.mode === 'running') { lastMilestone = milestone; toast(bn(milestone * 250) + ' পয়েন্ট! দারুণ দৌড়াচ্ছ!'); }
    hud();
  } else if (game.mode === 'over') {
    crashAge += dt;
    if (overlayDelay > 0) { overlayDelay -= dt; if (overlayDelay <= 0) $('overlay').hidden = false; }
  }
  if (game.mode !== 'paused') {
    for (const p of particles) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 130 * dt; p.life -= dt * 1.8; }
    particles = particles.filter(p => p.life > 0);
  }
  draw(ctx, game, visualTime, crashAge, particles);
  requestAnimationFrame(frame);
}
function fitCanvas() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = WORLD.width * ratio; canvas.height = WORLD.height * ratio;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}
$('play').addEventListener('click', () => game.mode === 'paused' ? resume() : start());
$('jump').addEventListener('pointerdown', event => { if (event.button !== 0) return; event.preventDefault(); jumpAction(); });
$('jump').addEventListener('click', event => { if (event.detail === 0) jumpAction(); });
canvas.addEventListener('pointerdown', event => { if (event.button !== 0) return; event.preventDefault(); canvas.focus({ preventScroll: true }); jumpAction(); });
$('pause').addEventListener('click', () => game.mode === 'paused' ? resume() : pause());
$('sound').addEventListener('click', () => {
  soundOn = !soundOn; syncSound();
  try { localStorage.setItem('city-runner-sound', soundOn ? 'on' : 'off'); } catch {}
  if (soundOn) unlockAudio(); else if ('speechSynthesis' in window) speechSynthesis.cancel();
});
$('test-voice').addEventListener('click', () => {
  if (game.mode === 'running') pause();
  if (!soundOn) { soundOn = true; syncSound(); }
  unlockAudio(); say(quotes[0]);
  if (!voice) toast('বাংলা কণ্ঠ পাওয়া যায়নি। লেখা দেখা যাবে।');
});
document.addEventListener('keydown', event => {
  if (['INPUT', 'SELECT', 'TEXTAREA'].includes(event.target.tagName)) return;
  if (event.code === 'KeyP' && !event.repeat) { event.preventDefault(); game.mode === 'paused' ? resume() : pause(); return; }
  if (game.mode !== 'running' && ['BUTTON', 'SUMMARY', 'A'].includes(event.target.tagName)) return;
  if (['Space', 'ArrowUp'].includes(event.code)) { event.preventDefault(); if (!event.repeat) jumpAction(); }
});
document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
window.addEventListener('resize', fitCanvas);
fitCanvas(); syncSound(); hud(); requestAnimationFrame(frame);
