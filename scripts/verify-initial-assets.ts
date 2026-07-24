const getAttribute = (tag: string, name: string) =>
  tag.match(new RegExp(`\\b${name}=["']([^"']+)["']`, 'i'))?.[1] ?? null;

async function main() {
  const targetUrl = process.argv[2] ?? 'http://127.0.0.1:3100/';
  const maxStylesheets = Number(process.argv[3] ?? 1);

  const response = await fetch(targetUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${targetUrl}: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  const linkTags = html.match(/<link\b[^>]*>/gi) ?? [];
  const linkHeader = response.headers.get('link') ?? '';

  const stylesheets = linkTags
    .filter((tag) => getAttribute(tag, 'rel') === 'stylesheet')
    .map((tag) => getAttribute(tag, 'href'))
    .filter((href): href is string => href !== null);
  const stylesheetContents = await Promise.all(
    stylesheets.map(async (href) => {
      const stylesheetUrl = new URL(href, response.url);
      const stylesheetResponse = await fetch(stylesheetUrl);
      if (!stylesheetResponse.ok) {
        throw new Error(
          `Failed to fetch ${stylesheetUrl}: ${stylesheetResponse.status} ${stylesheetResponse.statusText}`,
        );
      }

      return {
        href,
        content: await stylesheetResponse.text(),
      };
    }),
  );

  const htmlFontPreloads = linkTags
    .filter(
      (tag) =>
        getAttribute(tag, 'rel') === 'preload' &&
        getAttribute(tag, 'as') === 'font',
    )
    .map((tag) => getAttribute(tag, 'href'))
    .filter((href): href is string => href !== null);
  const headerFontPreloads = linkHeader
    .split(/,(?=\s*<)/)
    .filter((entry) => /;\s*rel=preload\b/i.test(entry) && /;\s*as="?font"?\b/i.test(entry))
    .map((entry) => entry.match(/<([^>]+)>/)?.[1] ?? null)
    .filter((href): href is string => href !== null);
  const fontPreloads = [...new Set([...htmlFontPreloads, ...headerFontPreloads])];

  const violations: string[] = [];

  if (stylesheets.length > maxStylesheets) {
    violations.push(
      `expected at most ${maxStylesheets} initial stylesheets, received ${stylesheets.length}`,
    );
  }

  const externalPretendard = stylesheetContents
    .filter(
      ({ href, content }) =>
        (/cdn\.jsdelivr\.net/i.test(href) &&
          /pretendard/i.test(href)) ||
        /cdn\.jsdelivr\.net\/[^'")]*pretendard/i.test(content),
    )
    .map(({ href }) => href);
  if (externalPretendard.length > 0) {
    violations.push(
      `initial CSS imports external Pretendard: ${externalPretendard.join(', ')}`,
    );
  }

  const fullPretendardPreloads = fontPreloads.filter((href) =>
    href.includes('PretendardVariable'),
  );
  if (fullPretendardPreloads.length > 0) {
    violations.push(
      `full Pretendard font is preloaded on the root route: ${fullPretendardPreloads.join(', ')}`,
    );
  }

  console.log(
    JSON.stringify(
      {
        url: targetUrl,
        stylesheets,
        fontPreloads,
        violations,
      },
      null,
      2,
    ),
  );

  if (violations.length > 0) {
    process.exitCode = 1;
  }
}

void main();
