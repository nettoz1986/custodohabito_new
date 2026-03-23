export function openChatView() {
  window.dispatchEvent(new CustomEvent('app:navigate', {
    detail: { section: 'chat' }
  }));
}

export function openChatWithPrompt(prompt, options = {}) {
  const { submit = true } = options;

  openChatView();
  window.dispatchEvent(new CustomEvent('chat:prompt', {
    detail: { prompt, submit }
  }));
}

export function resetChatConversation() {
  openChatView();
  window.dispatchEvent(new CustomEvent('chat:reset'));
}
