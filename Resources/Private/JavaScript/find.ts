import '../../Private/CSS/find.css';
import 'choices.js/public/assets/styles/choices.min.css';
import 'awesomplete/awesomplete.css';
import Awesomplete from 'awesomplete';
import Choices from 'choices.js';
import Chart, { ChartEvent, ActiveElement } from 'chart.js/auto';
import type { FacetConfig, UnderlyingQuery } from './types';

const qs = <T extends Element = Element>(
  sel: string,
  ctx: Document | Element = document
): T | null => ctx.querySelector<T>(sel);

const qsa = <T extends Element = Element>(
  sel: string,
  ctx: Document | Element = document
): T[] => Array.from(ctx.querySelectorAll<T>(sel));

const container = qs('.tx_find');

const URLParameterPrefix = 'tx_find_find';

export function addURLParameter(url: string, name: string, value: string): string {
  const [base, hash = ''] = url.split('#');
  const [path, query = ''] = base.split('?');
  const params = new URLSearchParams(query);
  params.set(name, value);
  const queryString = params.toString().replace(/\+/g, '%20');
  return `${path}?${queryString}${hash ? '#' + hash : ''}`;
}

export function removeURLParameter(url: string, name: string): string {
  const [base, hash = ''] = url.split('#');
  const [path, query = ''] = base.split('?');
  const params = new URLSearchParams(query);
  params.delete(name);
  const queryString = params.toString();
  return `${path}${queryString ? '?' + queryString : ''}${hash ? '#' + hash : ''}`;
}

function changeURL(url: string): void {
  history.pushState?.(null, '', url);
}

function changeURLParameterForPage(name: string, value?: number | string): void {
  if (!container) return;

  const paramName = `${URLParameterPrefix}[${name}]`;
  let newURL = removeURLParameter(location.href, paramName);

  if (value !== undefined) {
    newURL = addURLParameter(newURL, paramName, String(value));
  }

  changeURL(newURL);

  qsa<HTMLAnchorElement>('a:not(.no-change)', container).forEach((a) => {
    a.href =
      value !== undefined
        ? addURLParameter(a.href, paramName, String(value))
        : removeURLParameter(a.href, paramName);
  });

  qsa<HTMLInputElement>(`input.${paramName}`, container).forEach((input) => {
    input.name = value !== undefined ? paramName : '';
  });
}

function initAutocompleteFields(): void {
  if (!container) return;

  qsa<HTMLInputElement>('input[autocompleteURL]', container).forEach((input) => {
    input.addEventListener('input', async () => {
      const term = input.value.trim().toLowerCase();
      if (!term) return;

      const rawURL = input.getAttribute('autocompleteURL');
      if (!rawURL) return;

      const url = rawURL.replace('%25%25%25%25', encodeURIComponent(term));

      const data: string[] = await fetch(url)
        .then((r) => r.json() as Promise<string[]>)
        .catch(() => []);

      if (!input.awesomplete) {
        input.awesomplete = new Awesomplete(input) as Awesomplete & { list: string[] };
      }

      (input.awesomplete as Awesomplete & { list: string[] }).list = data;
    });
  });
}

function initFacetSearches(): void {
  if (!container) return;

  qsa<HTMLSelectElement>('.facetSearch', container).forEach((select) => {
    new Choices(select, {
      searchEnabled: true,
      shouldSort: false,
    });

    select.addEventListener('change', () => {
      const selected = select.value;
      const li = container.querySelector<HTMLLIElement>(`li[value='${selected}']`);
      li?.querySelector<HTMLAnchorElement>('a')?.click();
    });
  });
}

function toggleExtendedSearch(e: Event): void {
  if (!container) return;

  const form = qs<HTMLFormElement>('.searchForm', container);
  if (!form) return;

  const link = e.target as HTMLAnchorElement;
  const isExtended = form.classList.contains('search-extended');
  const extStr = link.getAttribute('extendedstring') ?? '';
  const simpStr = link.getAttribute('simplestring') ?? '';

  if (!isExtended) {
    link.textContent = extStr;
    qsa<HTMLElement>('.field-mode-extended', form).forEach((f) => {
      f.style.display = '';
    });
    changeURLParameterForPage('extended', 1);
  } else {
    link.textContent = simpStr;
    qsa<HTMLElement>('.field-mode-extended', form).forEach((f) => {
      f.style.display = 'none';
    });
    changeURLParameterForPage('extended');
  }

  form.classList.toggle('search-simple');
  form.classList.toggle('search-extended');
  e.preventDefault();
}

function initHistogramFacets(): void {
  if (!container) return;

  qsa<HTMLElement>('.facetHistogram-container .histogram', container).forEach((hist) => {
    const rawConfig = hist.dataset['facetConfig'];
    if (!rawConfig) return;

    const facetConfig: FacetConfig = JSON.parse(rawConfig);
    const { data: terms, barWidth } = facetConfig;

    const labels: number[] = Object.keys(terms)
      .map(Number)
      .sort((a, b) => a - b);

    const values: number[] = labels.map((y) => terms[y]);

    const canvas = document.createElement('canvas');
    hist.appendChild(canvas);

    new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Histogram',
            data: values,
            backgroundColor: '#8884d8',
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
        },
        scales: {
          x: { title: { display: true, text: 'Value' } },
          y: { title: { display: true, text: 'Hits' }, beginAtZero: true },
        },
        onClick: (_evt: ChartEvent, elements: ActiveElement[]) => {
          if (elements.length === 0) return;

          const i = elements[0].index;
          const year = labels[i];
          const range = `RANGE ${year} TO ${year + barWidth - 1}`;
          const linkTemplate = hist.dataset['link'];

          if (linkTemplate) {
            location.href = linkTemplate.replace(
              '%25%25%25%25',
              encodeURIComponent(range)
            );
          }
        },
      },
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  if (!container) return;

  initAutocompleteFields();
  initFacetSearches();
  initHistogramFacets();

  qsa<HTMLAnchorElement>('a.extendedSearch', container).forEach((link) =>
    link.addEventListener('click', toggleExtendedSearch)
  );
});

function isHidden(el: HTMLElement): boolean {
  return (
    el.style.display === 'none' ||
    getComputedStyle(el).display === 'none'
  );
}

export function showAllFacetsOfType(e: Event): void {
  const target = e.target as HTMLElement;
  const containingList = target.closest('ol');
  if (!containingList) return;

  const linkShowAll = qs<HTMLElement>('.facetShowAll', containingList);
  const linkHideHidden = qs<HTMLElement>('.facetHideHidden', containingList);

  qsa<HTMLElement>('.hidden', containingList).forEach((el) => {
    el.style.display = isHidden(el) ? '' : 'none';
  });

  if (linkShowAll && linkHideHidden) {
    if (isHidden(linkShowAll)) {
      linkShowAll.style.display = '';
      linkHideHidden.style.display = 'none';
    } else {
      linkShowAll.style.display = 'none';
      linkHideHidden.style.display = '';
    }
  }

  e.preventDefault();
}

export function inputWithNameAndValue(name: string, value: string): HTMLInputElement {
  const input = document.createElement('input');
  input.name = name;
  input.value = value;
  input.type = 'hidden';
  return input;
}

export function inputsWithPrefixForObject(
  prefix: string,
  obj: Record<string, unknown>
): HTMLInputElement[] {
  return Object.entries(obj).flatMap(([k, v]) =>
    v !== null && typeof v === 'object'
      ? inputsWithPrefixForObject(`${prefix}[${k}]`, v as Record<string, unknown>)
      : [inputWithNameAndValue(`${prefix}[${k}]`, String(v))]
  );
}

export function getUnderlyingQuery(): UnderlyingQuery | undefined {
  const container = document.querySelector<HTMLElement>('[data-underlying-query]');
  const raw = container?.dataset.underlyingQuery;

  if (raw) {
    try {
      const parsed: unknown = JSON.parse(raw);
      if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
        return parsed as UnderlyingQuery;
      }
    } catch {
      console.warn('find: could not parse the data-underlying-query attribute');
    }
  }

  return window.underlyingQuery;
}

export function detailViewWithPaging(
  element: HTMLAnchorElement,
  position?: number
): boolean {
  const underlyingQuery: UnderlyingQuery | undefined = getUnderlyingQuery();

  if (underlyingQuery) {
    const li = element.closest('li');
    const ol = li?.closest('ol');

    underlyingQuery.position =
      position ??
      (ol && li
        ? Number(ol.getAttribute('start') ?? 0) +
          Array.from(ol.children).indexOf(li)
        : undefined);

    const form = document.createElement('form');
    const href = element.getAttribute('href');
    if (!href) return true;

    form.action = href;
    form.method = 'POST';
    form.style.display = 'none';
    document.body.appendChild(form);

    inputsWithPrefixForObject(
      `${URLParameterPrefix}[underlyingQuery]`,
      underlyingQuery as Record<string, unknown>
    ).forEach((input) => form.appendChild(input));

    if (container && qs('.searchForm.search-extended', container)) {
      form.appendChild(
        inputWithNameAndValue(`${URLParameterPrefix}[extended]`, '1')
      );
    }

    form.submit();
    return false;
  }

  return true;
}

export default {
  showAllFacetsOfType,
  changeURLParameterForPage,
  detailViewWithPaging,
};
