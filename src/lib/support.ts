const OPEN_SUPPORT_EVENT = 'afensia-open-support'

export function getOpenSupportEventName() {
  return OPEN_SUPPORT_EVENT
}

export function openSupportWidget() {
  if (typeof window === 'undefined') {
    return
  }

  window.dispatchEvent(new Event(OPEN_SUPPORT_EVENT))
}
