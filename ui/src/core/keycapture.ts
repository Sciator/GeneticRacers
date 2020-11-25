
// todo: provisional for testing... delete or create PvE mode

export const capturedKeys: Set<TEventKeys> = new Set();

export type TEventKeys = "ArrowDown" | "ArrowUp" | "ArrowLeft" | "ArrowRight" | "Enter" | "Escape" | " ";

const keydown = (event: any) => {
  if (event.defaultPrevented) {
    return;
  }

  capturedKeys.add(event.key);

  event.preventDefault();
};

const keyup = (event: any) => {
  if (event.defaultPrevented) {
    return;
  }

  capturedKeys.delete(event.key);

  event.preventDefault();
};

export const keyCaptureStart = () => {
  window.addEventListener("keydown", keydown, true);
  window.addEventListener("keyup", keyup, true);
};

export const keyCaptureStop = () => {
  window.removeEventListener("keydown", keydown);
  window.removeEventListener("keyup", keyup);
};
