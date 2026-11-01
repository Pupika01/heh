const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

// Mobile navigation
const menuButton = $('#menu-btn');
const nav = $('#nav');
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

// Small status toast
let toastTimer;
function toast(message) {
  const el = $('#toast');
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2300);
}

// Heart confetti
function burstHearts(count = 12, originX = window.innerWidth / 2, originY = window.innerHeight * .78) {
  const layer = $('#floating-hearts');
  for (let i = 0; i < count; i += 1) {
    const heart = document.createElement('span');
    heart.className = 'float-heart';
    heart.textContent = Math.random() > .25 ? '♥' : '♡';
    heart.style.left = `${Math.max(2, Math.min(96, (originX / window.innerWidth) * 100 + (Math.random() * 24 - 12)))}%`;
    heart.style.bottom = `${Math.max(0, window.innerHeight - originY + Math.random() * 25)}px`;
    heart.style.setProperty('--size', `${15 + Math.random() * 20}px`);
    heart.style.setProperty('--dur', `${2.2 + Math.random() * 1.4}s`);
    layer.appendChild(heart);
    setTimeout(() => heart.remove(), 3900);
  }
}
$('#send-heart').addEventListener('click', (event) => {
  const rect = event.currentTarget.getBoundingClientRect();
  burstHearts(18, rect.left + rect.width / 2, rect.top + rect.height / 2);
  const status = $('#heart-status');
  const sent = Number(status.dataset.sent || 0) + 1;
  status.dataset.sent = String(sent);
  status.textContent = sent === 1 ? 'Первое сердечко уже летит к тебе. ♥' : `Уже ${sent} сердечек — и это ещё не предел. ♥`;
});

// Mood selector with tailored short notes
const moodMessages = {
  tired: 'Тогда сегодня никаких подвигов. Выдохни, устройся поудобнее и помни: тебе не нужно заслуживать заботу. Ты достойна её просто так. ♡',
  miss: 'Лови виртуальное объятие. Расстояние не отменяет того, что я думаю о тебе и хочу поскорее услышать, как прошёл твой день. ♥',
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

// Jar of reasons. Prevent repeats until all messages are shown.
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
function refillReasons() {
  reasonDeck = [...reasons].sort(() => Math.random() - .5);
}
refillReasons();
let lastReason = '';
$('#draw-reason').addEventListener('click', () => {
  if (!reasonDeck.length) refillReasons();
  let next = reasonDeck.pop();
  if (next === lastReason && reasonDeck.length) next = reasonDeck.pop();
  lastReason = next;
  const slip = $('#reason-slip');
  slip.classList.remove('pop');
  void slip.offsetWidth;
  slip.innerHTML = `<span>ЗАПИСКА ДЛЯ ТЕБЯ</span><b>${next}</b><small>♡ ещё одну?</small>`;
  slip.classList.add('pop');
  burstHearts(5, window.innerWidth * .52, window.innerHeight * .55);
});

// Build a low-pressure date invitation from choices.
const dateChoices = { activity: 'посмотрим один и тот же фильм одновременно 🎬', snack: 'чем-нибудь вкусным 🍓', vibe: 'уютно и спокойно 🕯️' };
$$('.choice-row').forEach(row => {
  $$('.choice', row).forEach(button => button.addEventListener('click', () => {
    $$('.choice', row).forEach(item => item.classList.remove('active'));
    button.classList.add('active');
    dateChoices[row.dataset.choice] = button.dataset.value;
  }));
});
$('#build-date').addEventListener('click', () => {
  $('#date-plan').textContent = `${dateChoices.activity}, устроимся ${dateChoices.vibe}, а перекус будет ${dateChoices.snack}. Останется договориться о времени, когда нам обоим удобно — и получится наше маленькое онлайн-свидание. ♡`;
  $('#date-result').hidden = false;
  $('#date-result').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  burstHearts(8, window.innerWidth * .5, window.innerHeight * .72);
});

// Three hidden hearts. One in hero, one in the jar area, one in footer.
const heartLocations = [
  { selector: '.hero-visual', label: 'Первое сердце найдено!' },
  { selector: '.reasons-section .jar-area', label: 'Второе сердце! Осталось одно.' },
  { selector: '.footer', label: 'Все три сердца найдены! Секрет открыт. ♥' }
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
    burstHearts(12, window.innerWidth / 2, window.innerHeight * .55);
    if (foundHearts === 3) {
      $('#secret-unlocked').hidden = false;
      $('#secret-unlocked').scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });
  host.appendChild(button);
});

// Memory game: six pairs, with a little note attached to every matched pair.
(() => {
  const grid = $('#memory-grid');
  if (!grid) return;
  const cards = $$('.memory-card', grid);
  const symbols = [
    { id: 'star', icon: '✦', note: 'Даже на расстоянии можно делиться одним и тем же небом. ✨' },
    { id: 'moon', icon: '☾', note: 'Пусть у нас разные окна и часовые пояса, но добрые мысли находят дорогу. 🌙' },
    { id: 'heart', icon: '♥', note: 'Вот тебе напоминание: о тебе думают с теплом. ♥' },
    { id: 'comet', icon: '☄', note: 'Ты — моё любимое неожиданное событие. ☄' },
    { id: 'flower', icon: '✿', note: 'Пусть сегодня у тебя будет хотя бы одна причина улыбнуться. ✿' },
    { id: 'spark', icon: '♡', note: 'Расстояние измеряется километрами, а внимание — маленькими поступками. ♡' }
  ];
  let deck = [];
  let opened = [];
  let matched = 0;
  let moves = 0;
  let locked = false;
  let mismatchTimer = null;

  function shuffle(items) {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

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
    $('#game-message').textContent = 'Подсказка: две одинаковые звёздочки — это пара. Начинай! ♡';
    cards.forEach((card, index) => {
      card.className = 'memory-card';
      card.disabled = false;
      card.dataset.pair = deck[index].id;
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
      burstHearts(5, window.innerWidth / 2, window.innerHeight * .62);
      if (matched === symbols.length) {
        $('#game-message').textContent = 'Все пары собраны — ты справилась! ♥';
        $('#game-win').hidden = false;
        $('#game-win').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        burstHearts(22, window.innerWidth / 2, window.innerHeight * .6);
      }
    } else {
      locked = true;
      $('#game-message').textContent = 'Почти! Эти две не пара. Попробуй ещё раз. ♡';
      mismatchTimer = setTimeout(() => {
        opened.forEach(item => {
          item.classList.remove('flipped');
          item.setAttribute('aria-label', `Закрытая карточка ${Number(item.dataset.card) + 1}`);
        });
        opened = [];
        locked = false;
      }, 850);
    }
  }

  cards.forEach(card => card.addEventListener('click', () => selectCard(card)));
  $('#reset-game').addEventListener('click', reset);
  $('#win-heart').addEventListener('click', () => {
    burstHearts(28, window.innerWidth / 2, window.innerHeight * .55);
    toast('Объятие отправлено через весь мир. ♥');
  });
  reset();
})();
