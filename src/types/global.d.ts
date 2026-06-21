interface EthereumProvider {
  request<T = unknown>(args: { method: string; params?: unknown[] | Record<string, unknown> }): Promise<T>;
  on?: (event: string, handler: (payload: unknown) => void) => void;
  removeListener?: (event: string, handler: (payload: unknown) => void) => void;
}

interface Window {
  ethereum?: EthereumProvider;
}
