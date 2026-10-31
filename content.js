const THEME_KEY = "contributionTheme";
const DEFAULT_THEME = "default";
const VALID_THEMES = new Set(["default", "halloween", "christmas"]);

function applyTheme(theme) {
  const safeTheme = VALID_THEMES.has(theme) ? theme : DEFAULT_THEME;

  if (safeTheme === DEFAULT_THEME) {
    delete document.documentElement.dataset.gccTheme;
    return;
  }

  document.documentElement.dataset.gccTheme = safeTheme;
}

chrome.storage.sync.get({ [THEME_KEY]: DEFAULT_THEME }).then((result) => {
  applyTheme(result[THEME_KEY]);
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "sync" && changes[THEME_KEY]) {
    applyTheme(changes[THEME_KEY].newValue);
  }
});

chrome.runtime.onMessage.addListener((message) => {
  if (message?.type === "SET_THEME") {
    applyTheme(message.theme);
  }
});
