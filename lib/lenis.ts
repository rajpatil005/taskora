import Lenis from "lenis";

let lenis: Lenis | null = null;

export function setLenis(instance: Lenis) {
  lenis = instance;
}

export function getLenis() {
  return lenis;
}
