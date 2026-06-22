import { describe, it, expect } from 'vitest';
import {
  addURLParameter,
  removeURLParameter,
  inputWithNameAndValue,
  inputsWithPrefixForObject,
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
