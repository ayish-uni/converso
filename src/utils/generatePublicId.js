export function generatePublicId() {
  return `user_${Math.random().toString(36).slice(2, 10)}`;
}

