import fs from "node:fs";
import path from "node:path";

const distDir = path.resolve(process.cwd(), "dist");
const indexHtmlPath = path.join(distDir, "index.html");

const BASE_PATH = process.env.BASE_PATH || "/";

const normalizeBasePath = (p) => {
  if (!p.startsWith("/")) p = `/${p}`;
  if (!p.endsWith("/")) p = `${p}/`;
  return p;
};

const basePath = normalizeBasePath(BASE_PATH);
const segmentCount = basePath === "/" ? 0 : 1;

const notFoundHtml = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="refresh" content="0; url=${basePath}?p=/" />
    <script>
      (function() {
        var l = window.location;
        var base = ${JSON.stringify(basePath)};
        var segmentCount = ${segmentCount};

        var parts = l.pathname.split('/').filter(Boolean);
        var preserved = parts.slice(segmentCount).join('/');

        var newUrl =
          base +
          '?p=/' + preserved +
          (l.search ? '&q=' + encodeURIComponent(l.search.slice(1)) : '') +
          (l.hash ? '&h=' + encodeURIComponent(l.hash.slice(1)) : '');

        l.replace(newUrl);
      })();
    </script>
  </head>
  <body></body>
</html>`;

const resolverSnippet = `
<script>
  (function() {
    var params = new URLSearchParams(window.location.search);
    var p = params.get('p');
    var q = params.get('q');
    var h = params.get('h');

    if (p !== null) {
      var newPath = p || '/';
      var newSearch = q ? ('?' + decodeURIComponent(q)) : '';
      var newHash = h ? ('#' + decodeURIComponent(h)) : '';
      window.history.replaceState(null, '', newPath + newSearch + newHash);
    }
  })();
</script>
`;

fs.writeFileSync(path.join(distDir, "404.html"), notFoundHtml, "utf8");

const indexHtml = fs.readFileSync(indexHtmlPath, "utf8");
if (!indexHtml.includes("URLSearchParams(window.location.search)")) {
  fs.writeFileSync(
    indexHtmlPath,
    indexHtml.replace("</head>", `${resolverSnippet}\n</head>`),
    "utf8",
  );
}
