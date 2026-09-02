import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  addURLParameter,
  removeURLParameter,
  inputWithNameAndValue,
  inputsWithPrefixForObject,
  getUnderlyingQuery,
  detailViewWithPaging,
} from '../../../Resources/Private/JavaScript/find';

describe('addURLParameter', () => {
  it('adds parameter to URL without query string', () => {
    expect(addURLParameter('https://example.com/', 'foo', 'bar'))
      .toBe('https://example.com/?foo=bar');
  });

  it('appends parameter to URL with existing query string', () => {
    expect(addURLParameter('https://example.com/?a=1', 'foo', 'bar'))
      .toBe('https://example.com/?a=1&foo=bar');
  });

  it('preserves hash', () => {
    expect(addURLParameter('https://example.com/#section', 'foo', 'bar'))
      .toBe('https://example.com/?foo=bar#section');
  });

  it('encodes special characters', () => {
    expect(addURLParameter('https://example.com/', 'tx_find[q]', 'hello world'))
      .toBe('https://example.com/?tx_find%5Bq%5D=hello%20world');
  });
});

describe('removeURLParameter', () => {
  it('removes existing parameter', () => {
    expect(removeURLParameter('https://example.com/?foo=bar&baz=1', 'foo'))
      .toBe('https://example.com/?baz=1');
  });

  it('removes only parameter leaving clean URL', () => {
    expect(removeURLParameter('https://example.com/?foo=bar', 'foo'))
      .toBe('https://example.com/');
  });

  it('does nothing when parameter not present', () => {
    expect(removeURLParameter('https://example.com/?a=1', 'foo'))
      .toBe('https://example.com/?a=1');
  });
});

describe('inputWithNameAndValue', () => {
  it('creates hidden input with correct name and value', () => {
    const input = inputWithNameAndValue('foo[bar]', 'baz');
    expect(input.name).toBe('foo[bar]');
    expect(input.value).toBe('baz');
    expect(input.type).toBe('hidden');
  });
});

describe('inputsWithPrefixForObject', () => {
  it('creates flat inputs for simple object', () => {
    const inputs = inputsWithPrefixForObject('prefix', { q: 'test', page: 1 });
    expect(inputs).toHaveLength(2);
    expect(inputs.find(i => i.name === 'prefix[q]')?.value).toBe('test');
    expect(inputs.find(i => i.name === 'prefix[page]')?.value).toBe('1');
  });

  it('creates nested inputs for nested object', () => {
    const inputs = inputsWithPrefixForObject('tx_find', { q: { title: 'foo' } });
    expect(inputs).toHaveLength(1);
    expect(inputs[0].name).toBe('tx_find[q][title]');
    expect(inputs[0].value).toBe('foo');
  });

  it('handles null values as string', () => {
    const inputs = inputsWithPrefixForObject('p', { x: null });
    expect(inputs[0].value).toBe('null');
  });
});

describe('getUnderlyingQuery', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    delete (window as unknown as { underlyingQuery?: unknown }).underlyingQuery;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('parses the data-underlying-query attribute', () => {
    document.body.innerHTML = '<div class="results" data-underlying-query=\'{"q":{"default":"goethe"},"count":10}\'></div>';

    const query = getUnderlyingQuery();
    expect(query).toEqual({ q: { default: 'goethe' }, count: 10 });
  });

  it('returns undefined when the attribute is absent', () => {
    document.body.innerHTML = '<div class="results"></div>';

    expect(getUnderlyingQuery()).toBeUndefined();
  });

  it('returns undefined when the attribute is empty', () => {
    document.body.innerHTML = '<div class="results" data-underlying-query=""></div>';

    expect(getUnderlyingQuery()).toBeUndefined();
  });

  it('returns undefined and warns on malformed JSON', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    document.body.innerHTML = '<div class="results" data-underlying-query="{invalid}"></div>';

    expect(getUnderlyingQuery()).toBeUndefined();
    expect(warn).toHaveBeenCalled();
  });

  it('falls back to window.underlyingQuery when no attribute is present', () => {
    (window as unknown as { underlyingQuery?: unknown }).underlyingQuery = { q: { default: 'legacy' } };

    expect(getUnderlyingQuery()).toEqual({ q: { default: 'legacy' } });
  });

  it('prefers the attribute over the global', () => {
    (window as unknown as { underlyingQuery?: unknown }).underlyingQuery = { q: { default: 'legacy' } };
    document.body.innerHTML = '<div class="results" data-underlying-query=\'{"q":{"default":"attribute"}}\'></div>';

    expect(getUnderlyingQuery()).toEqual({ q: { default: 'attribute' } });
  });

  it('parses a fresh object on every call', () => {
    document.body.innerHTML = '<div class="results" data-underlying-query=\'{"q":{"default":"goethe"}}\'></div>';

    const first = getUnderlyingQuery();
    const second = getUnderlyingQuery();
    expect(first).not.toBe(second);
    if (first) first.position = 5;
    expect(second?.position).toBeUndefined();
  });
});

describe('detailViewWithPaging', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    delete (window as unknown as { underlyingQuery?: unknown }).underlyingQuery;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('submits the underlying query from the data attribute and returns false', () => {
    document.body.innerHTML = `
      <div class="results" data-underlying-query='{"q":{"default":"goethe"},"count":10,"sort":"year asc"}'></div>
      <ol start="3"><li><a id="detail-link" href="/detail?id=1">Result</a></li></ol>
    `;
    const submit = vi.spyOn(HTMLFormElement.prototype, 'submit').mockImplementation(() => {});

    const link = document.querySelector<HTMLAnchorElement>('#detail-link')!;
    const result = detailViewWithPaging(link);

    expect(result).toBe(false);
    expect(submit).toHaveBeenCalledTimes(1);

    const form = document.body.querySelector('form')!;
    expect(form.action).toContain('/detail?id=1');
    const names = [...form.querySelectorAll('input')].map((input) => input.name);
    expect(names).toContain('tx_find_find[underlyingQuery][q][default]');
    expect(names).toContain('tx_find_find[underlyingQuery][position]');
    expect(names).toContain('tx_find_find[underlyingQuery][count]');
    expect(names).toContain('tx_find_find[underlyingQuery][sort]');
    const position = form.querySelector<HTMLInputElement>('input[name="tx_find_find[underlyingQuery][position]"]')!;
    expect(position.value).toBe('3');
  });

  it('uses the explicit position when given', () => {
    document.body.innerHTML = `
      <div class="results" data-underlying-query='{"q":{"default":"goethe"},"position":4}'></div>
      <ol start="3"><li><a id="detail-link" href="/detail?id=1">Result</a></li></ol>
    `;
    vi.spyOn(HTMLFormElement.prototype, 'submit').mockImplementation(() => {});

    const link = document.querySelector<HTMLAnchorElement>('#detail-link')!;
    detailViewWithPaging(link, 7);

    const form = document.body.querySelector('form')!;
    const position = form.querySelector<HTMLInputElement>('input[name="tx_find_find[underlyingQuery][position]"]')!;
    expect(position.value).toBe('7');
  });

  it('returns true without any underlying query data', () => {
    document.body.innerHTML = '<ol start="3"><li><a id="detail-link" href="/detail?id=1">Result</a></li></ol>';

    const link = document.querySelector<HTMLAnchorElement>('#detail-link')!;
    expect(detailViewWithPaging(link)).toBe(true);
  });

  it('returns true when the link has no href', () => {
    document.body.innerHTML = `
      <div class="results" data-underlying-query='{"q":{"default":"goethe"}}'></div>
      <ol start="3"><li><a id="detail-link">Result</a></li></ol>
    `;

    const link = document.querySelector<HTMLAnchorElement>('#detail-link')!;
    expect(detailViewWithPaging(link)).toBe(true);
  });
});
