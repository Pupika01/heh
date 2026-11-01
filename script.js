'use strict';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

// The playful welcome screen.
(() => {
  const intro = $('#intro-screen');
  const card = $('#intro-card');
  const zone = $('#answer-zone');
  const yes = $('#answer-yes');
  const no = $('#answer-no');
  const hint = $('#intro-hint');
  const site = $('#site-shell');
  if (!intro || !zone || !yes || !no || !site) return;

  const teasingLines = [
    'Хмм… кнопка что-то подозревает 😏',
    'Не-не, этот вариант сегодня не работает ♡',
    'Кажется, «нет» немного испугалось!',
    'Попробуй ещё раз. Хотя ответ я знаю 😌',
    'Она убегает, потому что знает правду 💗',
    'Ладно, я понял: ты просто проверяешь мою реакцию 😄'
  ];
  let attempts = 0;
  let opened = false;

  function positionNoInitially() {
    const zoneWidth = zone.clientWidth;
    const yesWidth = yes.getBoundingClientRect().width;
    const noWidth = no.getBoundingClientRect().width;
    yes.style.left = '4px';
    yes.style.top = '16px';
    const firstLeft = Math.max(yesWidth + 18, zoneWidth - noWidth - 4);
    no.style.left = `${Math.min(zoneWidth - noWidth, firstLeft)}px`;
    no.style.top = '16px';
  }

  function dodgeNo() {
    if (opened) return;
    attempts += 1;
    const zoneRect = zone.getBoundingClientRect();
    const yesRect = yes.getBoundingClientRect();
    const noWidth = no.offsetWidth;
    const noHeight = no.offsetHeight;
    const minX = Math.min(zone.clientWidth - noWidth, Math.max(0, yesRect.right - zoneRect.left + 14));
    const maxX = Math.max(minX, zone.clientWidth - noWidth);
    const maxY = Math.max(0, zone.clientHeight - noHeight - 4);
    let nextX = minX + Math.random() * Math.max(0, maxX - minX);
    let nextY = Math.random() * maxY;

    // If the horizontal space is tight (small phones), the button also jumps vertically.
    if (maxX - minX < 24) nextX = minX;
    no.style.left = `${nextX}px`;
    no.style.top = `${nextY}px`;
    no.classList.remove('dodging');
    void no.offsetWidth;
    no.classList.add('dodging');
    hint.textContent = teasingLines[Math.min(attempts - 1, teasingLines.length - 1)];
    if (attempts >= 3) no.innerHTML = 'Не-а <span>💨</span>';
    if (attempts >= 6) no.innerHTML = 'Мимо! <span>🙈</span>'; 
  }

  function celebrateWelcome() {
    if (opened) return;
    opened = true;
    yes.disabled = true;
    no.disabled = true;
    hint.textContent = 'Я так и знал! Тогда начнём ♡';
    burstHearts(34, window.innerWidth / 2, window.innerHeight * .58);
    card.classList.add('welcome-accepted');
    intro.classList.add('intro-leaving');
    window.setTimeout(() => {
      site.hidden = false;
      document.body.classList.add('site-unlocked');
      site.classList.add('site-entered');
      initScrollReveals();
      intro.remove();
      window.scrollTo(0, 0);
      burstHearts(20, window.innerWidth * .5, window.innerHeight * .78);
    }, 650);
  }

  positionNoInitially();
  window.addEventListener('resize', positionNoInitially, { passive: true });
  no.addEventListener('pointerenter', event => {
    if (event.pointerType !== 'touch') dodgeNo();
  });
  no.addEventListener('pointerdown', event => {
    if (event.pointerType === 'touch' || event.pointerType === 'pen') {
      event.preventDefault();
      dodgeNo();
    }
  });
  no.addEventListener('click', event => {
    event.preventDefault();
    dodgeNo();
  });
  no.addEventListener('focus', dodgeNo);
  yes.addEventListener('click', celebrateWelcome);
})();

// Toast messages.
let toastTimer;
function toast(message) {
  const el = $('#toast');
  if (!el) return;
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2400);
}

// Heart confetti, used by the welcome screen and the interactive sections.
function burstHearts(count = 12, originX = window.innerWidth / 2, originY = window.innerHeight * .78) {
  const layer = $('#floating-hearts');
  if (!layer) return;
  for (let i = 0; i < count; i += 1) {
    const heart = document.createElement('span');
    heart.className = 'float-heart';
    heart.textContent = Math.random() > .24 ? '♥' : '♡';
    heart.style.left = `${Math.max(2, Math.min(96, (originX / window.innerWidth) * 100 + (Math.random() * 30 - 15)))}%`;
    heart.style.bottom = `${Math.max(0, window.innerHeight - originY + Math.random() * 35)}px`;
    heart.style.setProperty('--size', `${13 + Math.random() * 22}px`);
    heart.style.setProperty('--dur', `${2.4 + Math.random() * 1.3}s`);
    heart.style.setProperty('--drift', `${Math.random() * 130 - 65}px`);
    layer.appendChild(heart);
    setTimeout(() => heart.remove(), 4100);
  }
}

// Reveal content smoothly as it enters the viewport.
function initScrollReveals() {
  const targets = $$('.hero-copy, .hero-visual, .section-head, .music-card, .mood-card, .memory-game, .jar-area, .date-builder, .letter-layout, .secret-card');
  targets.forEach((item, index) => {
    item.classList.add('reveal-item');
    if (item.classList.contains('mood-card')) item.style.setProperty('--reveal-delay', `${(index % 4) * 75}ms`);
  });
  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    targets.forEach(item => item.classList.add('is-visible'));
    return;
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });
  targets.forEach(item => observer.observe(item));
}

// Mobile navigation.
const menuButton = $('#menu-btn');
const nav = $('#nav');
if (menuButton && nav) {
  menuButton.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.textContent = open ? '×' : '☰';
  });
  $$('#nav a').forEach(link => link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.textContent = '☰';
  }));
}

// The soundtrack uses Spotify's official embedded player. Audio only starts
// after the visitor presses Play inside the provider player.
(() => {
  const card = $('#music-card');
  const openButton = $('#music-open');
  const toggleButton = $('#music-toggle');
  const playerWrap = $('#music-player-wrap');
  const player = $('#spotify-player');
  const fallback = $('#spotify-fallback');
  const vinyl = $('#vinyl-button');
  const easterEgg = $('#music-easter');
  if (!card || !toggleButton || !playerWrap || !player) return;

  const tracks = {
    iwy: {
      title: 'I Wanna Be Yours',
      id: '7a8GawTVgHZvBLQOh46he7',
      url: 'https://open.spotify.com/track/7a8GawTVgHZvBLQOh46he7'
    },
    '505': {
      title: '505',
      id: '0BxE4FqsDD1Ot4YuBXwAPp',
      url: 'https://open.spotify.com/track/0BxE4FqsDD1Ot4YuBXwAPp'
    },
    anthem: {
      title: 'No. 1 Party Anthem',
      id: '5TTGoX70AFrTvuEtqHK37S',
      url: 'https://open.spotify.com/track/5TTGoX70AFrTvuEtqHK37S'
    }
  };
  let selected = 'iwy';
  let opened = false;

  function loadSelectedTrack() {
    const track = tracks[selected];
    player.src = `https://open.spotify.com/embed/track/${track.id}?utm_source=generator&theme=0`;
    player.title = `${track.title} — Arctic Monkeys · Spotify`;
    fallback.href = track.url;
    fallback.textContent = `Открыть «${track.title}» в Spotify ↗`;
  }

  function showPlayer(scroll = false) {
    opened = true;
    card.classList.add('is-open');
    playerWrap.hidden = false;
    toggleButton.setAttribute('aria-expanded', 'true');
    toggleButton.innerHTML = 'Спрятать плеер <span>×</span>';
    loadSelectedTrack();
    $('#music-hint').textContent = 'Нажми Play прямо в плеере — и пусть эта песня будет вашим общим моментом. ♡';
    if (scroll) {
      $('#soundtrack').scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function hidePlayer() {
    opened = false;
    card.classList.remove('is-open');
    playerWrap.hidden = true;
    player.src = '';
    toggleButton.setAttribute('aria-expanded', 'false');
    toggleButton.innerHTML = 'Открыть плеер <span>♫</span>';
    $('#music-hint').textContent = 'Музыка не включается сама — нажми Play в плеере, когда захочется. ♡';
  }

  $$('.track-tab').forEach(button => button.addEventListener('click', () => {
    selected = button.dataset.track;
    $$('.track-tab').forEach(tab => {
      const active = tab === button;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-pressed', String(active));
    });
    if (opened) loadSelectedTrack();
    else $('#music-hint').textContent = `Выбрано: ${tracks[selected].title}. Нажми «Открыть плеер», чтобы послушать. ♡`;
  }));

  toggleButton.addEventListener('click', () => opened ? hidePlayer() : showPlayer());
  openButton?.addEventListener('click', () => showPlayer(true));
  vinyl?.addEventListener('click', () => {
    const visible = !easterEgg.hidden;
    easterEgg.hidden = visible;
    vinyl.setAttribute('aria-pressed', String(!visible));
    if (!visible) {
      burstHearts(12, window.innerWidth * .26, window.innerHeight * .48);
      toast('Маленькая музыкальная договорённость для вас двоих ♡');
    }
  });
})();

// Send a little burst of hearts.
const sendHeart = $('#send-heart');
if (sendHeart) sendHeart.addEventListener('click', event => {
  const rect = event.currentTarget.getBoundingClientRect();
  burstHearts(18, rect.left + rect.width / 2, rect.top + rect.height / 2);
  const status = $('#heart-status');
  const sent = Number(status.dataset.sent || 0) + 1;
  status.dataset.sent = String(sent);
  status.textContent = sent === 1 ? 'Первое сердечко уже летит к тебе. ♥' : `Уже ${sent} сердечек — и это ещё не предел. ♥`;
});

// Mood picker.
const moodMessages = {
  tired: 'Тогда сегодня никаких подвигов. Выдохни, устройся поудобнее и помни: тебе не нужно заслуживать заботу. Ты достойна её просто так. ♡',
  miss: 'Лови виртуальное объятие. Я думаю о тебе и хочу поскорее услышать, как прошёл твой день. ♥',
  happy: 'Вот это настроение надо беречь! Пусть хорошего сегодня станет ещё больше, а я постараюсь добавить к нему хотя бы одну улыбку. ☀️',
  chaos: 'Тогда официально разрешаю этому дню быть каким угодно. А моя задача — придумать что-нибудь приятное и немного неожиданное. ✨'
};
$$('[data-mood]').forEach(button => button.addEventListener('click', () => {
  $$('[data-mood]').forEach(item => item.classList.remove('selected'));
  button.classList.add('selected');
  $('#mood-message').textContent = moodMessages[button.dataset.mood];
  $('#mood-result').hidden = false;
  $('#mood-result').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}));

// A jar of compliments, shuffled without immediate repeats.
const reasons = [
  'Потому что у тебя особенная улыбка — та самая, которую хочется запоминать.',
  'Потому что с тобой даже обычный разговор может стать любимым моментом.',
  'Потому что у тебя свой взгляд на мир, и мне интересно его узнавать.',
  'Потому что ты умеешь быть собой. И в этом много красоты.',
  'Потому что твой смех способен сделать день светлее.',
  'Потому что мне хочется узнавать о твоих мечтах и поддерживать их.',
  'Потому что ты не обязана быть идеальной, чтобы быть невероятной.',
  'Потому что в тебе есть детали, которые замечаю и ценю именно я.',
  'Потому что рядом с тобой хочется придумывать новые воспоминания.',
  'Потому что ты можешь удивлять, даже не стараясь.',
  'Потому что мне нравится слушать даже самые маленькие истории из твоего дня.',
  'Потому что ты — это ты. И этого уже достаточно.'
];
let reasonDeck = [];
function shuffle(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
function refillReasons() { reasonDeck = shuffle(reasons); }
refillReasons();
let lastReason = '';
const drawReason = $('#draw-reason');
if (drawReason) drawReason.addEventListener('click', () => {
  if (!reasonDeck.length) refillReasons();
  let next = reasonDeck.pop();
  if (next === lastReason && reasonDeck.length) next = reasonDeck.pop();
  lastReason = next;
  const slip = $('#reason-slip');
  slip.classList.remove('pop');
  void slip.offsetWidth;
  slip.replaceChildren();
  const label = document.createElement('span');
  label.textContent = 'ЗАПИСКА ДЛЯ ТЕБЯ';
  const text = document.createElement('b');
  text.textContent = next;
  const foot = document.createElement('small');
  foot.textContent = '♡ ещё одну?';
  slip.append(label, text, foot);
  slip.classList.add('pop');
  burstHearts(7, window.innerWidth * .52, window.innerHeight * .55);
});

// Build an online date idea that works from two different places.
const dateChoices = {
  activity: 'выберем фильм и включим его одновременно 🎬',
  snack: 'что-нибудь вкусное 🍓',
  vibe: 'уютной и спокойной 🕯️'
};
$$('.choice-row').forEach(row => {
  $$('.choice', row).forEach(button => button.addEventListener('click', () => {
    $$('.choice', row).forEach(item => item.classList.remove('active'));
    button.classList.add('active');
    dateChoices[row.dataset.choice] = button.dataset.value;
  }));
});
const buildDate = $('#build-date');
if (buildDate) buildDate.addEventListener('click', () => {
  const plan = `Предлагаю: ${dateChoices.activity}. Каждый возьмёт ${dateChoices.snack}, а атмосферу сделаем ${dateChoices.vibe}. Осталось выбрать удобное для нас обоих время — и вечер наш. ♡`;
  $('#date-plan').textContent = plan;
  $('#date-result').hidden = false;
  $('#date-result').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  burstHearts(10, window.innerWidth * .5, window.innerHeight * .72);
});
const copyInvite = $('#copy-invite');
if (copyInvite) copyInvite.addEventListener('click', async () => {
  const text = $('#date-plan').textContent;
  try {
    await navigator.clipboard.writeText(text);
    toast('Приглашение скопировано. Осталось отправить ♡');
  } catch {
    toast('План готов! Можешь скопировать его вручную ♡');
  }
});

// Three hidden hearts around the page.
const heartLocations = [
  { selector: '.hero-visual', label: 'Первое сердце найдено!' },
  { selector: '.reasons-section .jar-area', label: 'Второе сердце! Осталось одно.' },
  { selector: '.footer', label: 'Все три сердца найдены! Твой билет уже здесь. ♥' }
];
let foundHearts = 0;
heartLocations.forEach((item, index) => {
  const host = $(item.selector);
  if (!host) return;
  const button = document.createElement('button');
  button.className = 'hidden-heart';
  button.type = 'button';
  button.textContent = '♥';
  button.setAttribute('aria-label', `Найти спрятанное сердце ${index + 1}`);
  button.addEventListener('click', () => {
    if (button.classList.contains('found')) return;
    button.classList.add('found');
    button.textContent = '♡';
    foundHearts += 1;
    $('#heart-progress-fill').style.width = `${(foundHearts / 3) * 100}%`;
    $('#heart-progress-text').textContent = `${foundHearts} из 3 найдено`;
    toast(item.label);
    burstHearts(13, window.innerWidth / 2, window.innerHeight * .55);
    if (foundHearts === 3) {
      $('#secret-unlocked').hidden = false;
      $('#secret-unlocked').scrollIntoView({ behavior: 'smooth', block: 'center' });
      burstHearts(24, window.innerWidth / 2, window.innerHeight * .55);
    }
  });
  host.appendChild(button);
});

// Six-pair memory game. Every match reveals a tiny note.
(() => {
  const grid = $('#memory-grid');
  if (!grid) return;
  const cards = $$('.memory-card', grid);
  const symbols = [
    { id: 'star', icon: '✦', note: 'Пусть у тебя сегодня случится что-нибудь по-настоящему хорошее. ✨' },
    { id: 'moon', icon: '☾', note: 'Даже если за окном у нас разное небо, пожелание спокойной ночи одно и то же. 🌙' },
    { id: 'heart', icon: '♥', note: 'Вот тебе маленькое напоминание: о тебе думают с теплом. ♥' },
    { id: 'comet', icon: '☄', note: 'Ты — моё любимое неожиданное событие. ☄' },
    { id: 'flower', icon: '✿', note: 'Пусть сегодня у тебя будет хотя бы одна причина улыбнуться. ✿' },
    { id: 'spark', icon: '♡', note: 'Самые приятные вещи часто прячутся в маленьких моментах. ♡' }
  ];
  let deck = [];
  let opened = [];
  let matched = 0;
  let moves = 0;
  let locked = false;
  let mismatchTimer = null;

  function paintStats() {
    $('#moves-count').textContent = String(moves);
    $('#pairs-count').textContent = String(matched);
  }
  function reset() {
    clearTimeout(mismatchTimer);
    deck = shuffle(symbols.flatMap(item => [item, item]));
    opened = [];
    matched = 0;
    moves = 0;
    locked = false;
    $('#game-win').hidden = true;
    $('#game-message').textContent = 'Открывай по две карточки и ищи совпадения. Удачи! ♡';
    cards.forEach((card, index) => {
      card.className = 'memory-card';
      card.disabled = false;
      $('.card-front', card).textContent = deck[index].icon;
      card.setAttribute('aria-label', `Закрытая карточка ${index + 1}`);
    });
    paintStats();
  }
  function selectCard(card) {
    if (locked || card.classList.contains('flipped') || card.classList.contains('matched')) return;
    card.classList.add('flipped');
    card.setAttribute('aria-label', `Открыто: ${deck[Number(card.dataset.card)].icon}`);
    opened.push(card);
    if (opened.length < 2) return;
    moves += 1;
    paintStats();
    const [first, second] = opened;
    const firstSymbol = deck[Number(first.dataset.card)];
    const secondSymbol = deck[Number(second.dataset.card)];
    if (firstSymbol.id === secondSymbol.id) {
      first.classList.remove('flipped');
      second.classList.remove('flipped');
      first.classList.add('matched');
      second.classList.add('matched');
      first.disabled = true;
      second.disabled = true;
      matched += 1;
      paintStats();
      $('#game-message').textContent = firstSymbol.note;
      opened = [];
      burstHearts(6, window.innerWidth / 2, window.innerHeight * .62);
      if (matched === symbols.length) {
        $('#game-message').textContent = 'Все пары найдены — отлично справилась! ♥';
        $('#game-win').hidden = false;
        $('#game-win').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        burstHearts(24, window.innerWidth / 2, window.innerHeight * .6);
      }
    } else {
      locked = true;
      $('#game-message').textContent = 'Почти! Эти две карточки не совпали. Попробуй ещё раз. ♡';
      mismatchTimer = setTimeout(() => {
        opened.forEach(item => {
          item.classList.remove('flipped');
          item.setAttribute('aria-label', `Закрытая карточка ${Number(item.dataset.card) + 1}`);
        });
        opened = [];
        locked = false;
      }, 900);
    }
  }
  cards.forEach(card => card.addEventListener('click', () => selectCard(card)));
  $('#reset-game').addEventListener('click', reset);
  const hugOverlay = $('#hug-overlay');
  const hugParticles = $('#hug-particles');
  const hugClose = $('#hug-close');
  const hugReturn = $('#hug-return');
  let previousFocus = null;

  function createHugParticles() {
    if (!hugParticles) return;
    hugParticles.replaceChildren();
    const symbols = ['♥', '♡', '✦', '✧', '❀'];
    for (let i = 0; i < 64; i += 1) {
      const particle = document.createElement('span');
      particle.className = 'hug-particle';
      particle.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      particle.style.setProperty('--x', `${Math.round((Math.random() - .5) * window.innerWidth * 1.35)}px`);
      particle.style.setProperty('--y', `${Math.round((Math.random() - .5) * window.innerHeight * 1.15)}px`);
      particle.style.setProperty('--spin', `${Math.round(Math.random() * 220 - 110)}deg`);
      particle.style.setProperty('--size', `${13 + Math.random() * 27}px`);
      particle.style.setProperty('--delay', `${Math.random() * .7}s`);
      particle.style.setProperty('--duration', `${2.5 + Math.random() * 2}s`);
      hugParticles.appendChild(particle);
    }
  }

  function openHug() {
    if (!hugOverlay) return;
    previousFocus = document.activeElement;
    createHugParticles();
    hugOverlay.hidden = false;
    hugOverlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('hug-open');
    requestAnimationFrame(() => hugOverlay.classList.add('is-open'));
    window.setTimeout(() => hugClose?.focus(), 120);
    burstHearts(36, window.innerWidth / 2, window.innerHeight * .5);
  }

  function closeHug() {
    if (!hugOverlay || hugOverlay.hidden) return;
    hugOverlay.classList.remove('is-open');
    hugOverlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('hug-open');
    window.setTimeout(() => {
      hugOverlay.hidden = true;
      if (previousFocus && typeof previousFocus.focus === 'function') previousFocus.focus();
    }, 520);
  }

  $('#win-heart').addEventListener('click', openHug);
  hugClose?.addEventListener('click', closeHug);
  hugReturn?.addEventListener('click', closeHug);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && hugOverlay && !hugOverlay.hidden) closeHug();
  });

  const claimTicket = $('#claim-ticket');
  claimTicket?.addEventListener('click', () => {
    burstHearts(28, window.innerWidth / 2, window.innerHeight * .55);
    claimTicket.innerHTML = 'Билет сохранён. Жду нашей встречи ♡';
    claimTicket.classList.add('ticket-saved');
    toast('Билет принят. Осталось дождаться нашей встречи. ♥');
  });
  reset();
})();
