import fetch, { RequestInit } from 'node-fetch';
import parse from 'node-html-parser';

const options: RequestInit = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; rv:78.0) Gecko/20100101 Firefox/78.0',
  },
  redirect: 'manual',
};

export const ampRegex = /(\/|\.|\?|=|&|%|_|-)amp\b/i;

/*
Takes an array of links as an argument, and checks if they contain AMP links.
If the link is an AMP link, it follows it and gives back the de-AMP'd link.
If the link is not an AMP link, it ignores it.
*/

function resolve(
  links: string[] | RegExpMatchArray,
  done: Function,
  failure: Function,
): void {
  let deamped: string[] = [];
  let processed = 1;
  links.forEach((link) => {
    if (!link.match(ampRegex)) return;
    fetch(link, options)
      .then((res) => res.text())
      .then((res) => {
        const canonical = parse(res).querySelector('link[rel="canonical"]');
        if (!canonical) return;
        deamped = [...deamped, canonical.attributes.href];
        if (processed === links.length) { done(deamped); } else { processed += 1; }
      }).catch((err) => {
        failure(err);
      });
  });
}
export default resolve;
