function navigate(detail) {
  window.dispatchEvent(new CustomEvent('app:navigate', { detail }));
}

export function openChatView(options = {}) {
  navigate({ section: 'chat', ...options });
}

export function openTopicView(topicId, options = {}) {
  navigate({ section: 'learn', topicId, ...options });
}

export function openUtilityView(utilityView, options = {}) {
  navigate({ section: 'utility', utilityView, ...options });
}

export function openChatWithPrompt(prompt, options = {}) {
  const { submit = true, replace = false } = options;

  openChatView({ replace });
  window.dispatchEvent(new CustomEvent('chat:prompt', {
    detail: { prompt, submit }
  }));
}

export function resetChatConversation() {
  openChatView();
  window.dispatchEvent(new CustomEvent('chat:reset'));
}
