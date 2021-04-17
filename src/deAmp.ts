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
): Promise<string>[] {
  const deamped: Promise<string>[] = [];
  links.forEach((link) => {
    if (!link.match(ampRegex)) return;
    const promise: Promise<string> = new Promise((resolve, reject) => {
      fetch(link, options)
        .then((res) => {
          if (!res.ok) { throw new Error(`${link}: ${res.status}`); }
          res.text()
            .then((html: any) => {
              const canonical = parse(html).querySelector('link[rel="canonical"]');
              if (!canonical) return;
              resolve(canonical.attributes.href);
            });
        })
        .catch((err) => {
          reject(err);
        });
    });
    deamped.push(promise);
  });
  return deamped;
}
export default deAmp;
