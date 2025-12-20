export function ensureDomExceptionPolyfill(): void {
  const g = globalThis as unknown as { DOMException?: unknown };

  if (typeof g.DOMException !== "undefined") return;

  class DomExceptionPolyfill extends Error {
    constructor(message?: string, name?: string) {
      super(message);
      this.name = name ?? "DOMException";
    }
  }

  g.DOMException = DomExceptionPolyfill as unknown;
}
