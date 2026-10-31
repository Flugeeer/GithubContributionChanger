const THEME_KEY = "contributionTheme";
const DEFAULT_THEME = "default";
const VALID_THEMES = new Set(["default", "halloween", "christmas"]);

const cards = [...document.querySelectorAll("[data-theme]")];
const status = document.querySelector("#status");

function selectCard(theme) {
  cards.forEach((card) => {
    const isActive = card.dataset.theme === theme;
    card.classList.toggle("is-active", isActive);
    card.setAttribute("aria-pressed", String(isActive));
  });
}

async function saveTheme(theme) {
  if (!VALID_THEMES.has(theme)) return;

  selectCard(theme);

  // Позволяет просматривать popup как обычный HTML-файл без ошибок.
  if (!globalThis.chrome?.storage?.sync) {
    status.textContent = "Режим предпросмотра";
    return;
  }

  await chrome.storage.sync.set({ [THEME_KEY]: theme });
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id && tab.url?.startsWith("https://github.com/")) {
    try {
      await chrome.tabs.sendMessage(tab.id, { type: "SET_THEME", theme });
      status.textContent = "Тема применена";
    } catch {
      status.textContent = "Обновите вкладку GitHub для применения";
    }
  } else {
    status.textContent = "Откройте профиль GitHub, чтобы увидеть тему";
  }
}

cards.forEach((card) => {
  card.addEventListener("click", () => saveTheme(card.dataset.theme));
});

if (globalThis.chrome?.storage?.sync) {
  chrome.storage.sync.get({ [THEME_KEY]: DEFAULT_THEME }).then((result) => {
    const savedTheme = VALID_THEMES.has(result[THEME_KEY])
      ? result[THEME_KEY]
      : DEFAULT_THEME;
    selectCard(savedTheme);
  });
} else {
  selectCard(DEFAULT_THEME);
  status.textContent = "Предпросмотр popup";
}
