export function isOnline(): boolean {
  return typeof navigator === "undefined" ? true : navigator.onLine;
}

export function watchNetwork(onChange: (online: boolean) => void): () => void {
  const fire = (): void => onChange(isOnline());
  window.addEventListener("online", fire);
  window.addEventListener("offline", fire);
  fire();
  return () => {
    window.removeEventListener("online", fire);
    window.removeEventListener("offline", fire);
  };
}
