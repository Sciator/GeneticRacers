export const keyState = {
  up: false,
  down: false,
  left: false,
  right: false,
};

const keyCodeMap = {
  38: "up",
  40: "down",
  37: "left",
  39: "right",
};

let registered = false;

const register = () => {
  if (!registered) {
    registered = true;
    document.addEventListener("keydown", (event) => {
      const direction = (keyCodeMap as any)[event.keyCode];
      if (direction === undefined) {
        return;
      }

      (keyState as any)[direction] = true;
    });

    document.addEventListener("keyup", (event) => {
      const direction = (keyCodeMap as any)[event.keyCode];
      if (direction === undefined) {
        return;
      }

      (keyState as any)[direction] = false;
    });
  }
};
register();
