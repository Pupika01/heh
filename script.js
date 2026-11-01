const notes = {
  sad: {
    label: 'ЗАПИСКА НА СЛОЖНЫЙ ДЕНЬ',
    title: 'Можно просто выдохнуть.',
    message: 'Тебе не обязательно всегда быть сильной, весёлой и собранной. Бывают дни, которые просто нужно пережить. Не требуй от себя слишком многого сегодня. Ты заслуживаешь тепла и заботы — даже, и особенно, когда день не задался.'
  },
  doubt: {
    label: 'ЗАПИСКА НА МОМЕНТ СОМНЕНИЙ',
    title: 'Не забывай, какая ты.',
    message: 'Один неудачный день, ошибка или чьё-то мнение не определяют тебя. В тебе столько интересного, доброго и настоящего. Пожалуйста, смотри на себя чуть бережнее. Я вижу в тебе намного больше, чем ты иногда замечаешь сама.'
  },
  smile: {
    label: 'ЗАПИСКА ДЛЯ УЛЫБКИ',
    title: 'У меня есть одна мысль.',
    message: 'Среди миллиардов людей мне повезло встретить именно тебя. И это одна из тех случайностей, за которые я особенно благодарен. Так что вот тебе маленькая причина улыбнуться. А большую я постараюсь придумать при встрече.'
  }
};

const dialog = document.querySelector('#note-dialog');
const dialogLabel = document.querySelector('#dialog-label');
const dialogTitle = document.querySelector('#dialog-title');
const dialogMessage = document.querySelector('#dialog-message');
const closeDialog = document.querySelector('.dialog-close');

function openNote(key) {
  const note = notes[key];
  if (!note) return;
  dialogLabel.textContent = note.label;
  dialogTitle.textContent = note.title;
  dialogMessage.textContent = note.message;
  if (typeof dialog.showModal === 'function') {
    dialog.showModal();
  } else {
    dialog.setAttribute('open', '');
  }
}

document.querySelectorAll('[data-note]').forEach((button) => {
  button.addEventListener('click', () => openNote(button.dataset.note));
});

closeDialog.addEventListener('click', () => {
  if (typeof dialog.close === 'function') dialog.close();
  else dialog.removeAttribute('open');
});

dialog.addEventListener('click', (event) => {
  if (event.target === dialog && typeof dialog.close === 'function') dialog.close();
});

const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
menuToggle.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('is-open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
});

nav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    nav.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Открыть меню');
  });
});

const surpriseButton = document.querySelector('#surprise-button');
const endingFootnote = document.querySelector('#ending-footnote');
let surpriseOpened = false;

function makePetal() {
  const petal = document.createElement('span');
  petal.className = 'floating-petal';
  petal.textContent = Math.random() > 0.5 ? '✦' : '♡';
  petal.style.left = `${8 + Math.random() * 84}%`;
  petal.style.setProperty('--drift', `${Math.round(Math.random() * 150 - 75)}px`);
  petal.style.setProperty('--duration', `${2.2 + Math.random() * 1.8}s`);
  document.querySelector('.ending-section').appendChild(petal);
  window.setTimeout(() => petal.remove(), 4300);
}

surpriseButton.addEventListener('click', () => {
  if (!surpriseOpened) {
    endingFootnote.textContent = 'Самый главный сюрприз — это ты. Спасибо, что ты есть в моей жизни. ♡';
    surpriseButton.innerHTML = 'Прочитать ещё раз <span>↻</span>';
    surpriseOpened = true;
  } else {
    endingFootnote.textContent = 'И да — я всё ещё очень хочу делать тебя счастливее.';
  }
  for (let i = 0; i < 18; i += 1) window.setTimeout(makePetal, i * 65);
});
