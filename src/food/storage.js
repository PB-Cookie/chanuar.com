const POINTER_KEY = 'food:last-order';

export function credentialKey(cycleId, orderId) {
  return `food:order:${cycleId}:${orderId}`;
}

export function saveCredential(credential, storage = window.localStorage) {
  const value = JSON.stringify(credential);
  storage.setItem(credentialKey(credential.cycleId, credential.orderId), value);
  storage.setItem(POINTER_KEY, value);
}

export function readLastCredential(storage = window.localStorage) {
  try {
    const value = JSON.parse(storage.getItem(POINTER_KEY));
    if (!value?.cycleId || !value?.orderId || !value?.token) return null;
    return value;
  } catch {
    storage.removeItem(POINTER_KEY);
    return null;
  }
}

export function forgetCredential(credential, storage = window.localStorage) {
  if (!credential) return;
  storage.removeItem(credentialKey(credential.cycleId, credential.orderId));
  const current = readLastCredential(storage);
  if (current?.orderId === credential.orderId) storage.removeItem(POINTER_KEY);
}
