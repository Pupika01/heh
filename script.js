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
const dateChoices = { activity: 'Устроим домашний кинотеатр 🎬', snack: 'что-нибудь вкусное 🍓', vibe: 'уютно и спокойно 🕯️' };
$$('.choice-row').forEach(row => {
  $$('.choice', row).forEach(button => button.addEventListener('click', () => {
    $$('.choice', row).forEach(item => item.classList.remove('active'));
    button.classList.add('active');
    dateChoices[row.dataset.choice] = button.dataset.value;
  }));
});
$('#build-date').addEventListener('click', () => {
  $('#date-plan').textContent = `${dateChoices.activity}, возьмём ${dateChoices.snack}, а атмосферу сделаем ${dateChoices.vibe}. Осталось только выбрать день — и получится наше маленькое приключение. ♡`;
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
