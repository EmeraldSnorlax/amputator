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

function deAmp(
  links: string[] | RegExpMatchArray,
): Promise<string[]> {
  return new Promise((resolve, reject) => {
    let deamped: string[] = [];
    links.forEach((link, i) => {
      if (!link.match(ampRegex)) return;
      fetch(link, options)
        .then((res) => {
          if (!res.ok) { throw new Error(`${link}: ${res.status}`); } else { res.text(); }
        })
        .then((res: any) => {
          const canonical = parse(res).querySelector('link[rel="canonical"]');
          if (!canonical) return;
          deamped = [...deamped, canonical.attributes.href];
          if (i === links.length - 1) { resolve(deamped); }
        })
        .catch((err) => {
          reject(err);
        });
    });
  });
}
export default deAmp;
