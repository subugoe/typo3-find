export interface FacetConfig {
  data: Record<string, number>;
  barWidth: number;
}

export interface UnderlyingQuery {
  position?: number;
  [key: string]: unknown;
}

declare global {
  interface Window {
    underlyingQuery?: UnderlyingQuery;
  }
}

export interface AwesompleteInstance {
  list: string[];
}

declare global {
  interface HTMLInputElement {
    awesomplete?: AwesompleteInstance;
  }
}
