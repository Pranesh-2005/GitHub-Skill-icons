export default async function handler(req, res) {
  try {
    const { i = "", theme = "dark", perline = 15 } = req.query;

    if (!i) return res.status(400).send("Missing ?i=");

    const list = i.split(",").map((v) => v.trim().toLowerCase());

    // ICON SIZE CONFIG
    const ICON_SIZE = 48;
    const PADDING = 8;
    const GAP = 0;
    const RADIUS = 6;

    // Theme colors
    const colors = {
      dark: { bg: "#242938" },
      light: { bg: "#FFFFFF" },
    };

    const bgFill = colors[theme]?.bg || colors.dark.bg;

    const fetched = [];

    for (const iconSlug of list) {
      const simpleUrl = `https://cdn.simpleicons.org/${iconSlug}`;

      try {
        const r = await fetch(simpleUrl);

        if (r.ok) {
          const text = await r.text();

          const vbMatch = text.match(/viewBox="([^"]*)"/);
          const viewBox = vbMatch ? vbMatch[1] : "0 0 24 24";

          // Remove SVG wrapper
          const content = text.replace(/<svg[^>]*>([\s\S]*?)<\/svg>/, "$1");

          fetched.push({ content, viewBox });
        }
      } catch (e) {
        console.error(`Failed to fetch icon for: ${iconSlug}`, e);
      }
    }

    if (fetched.length === 0) {
      return res.status(404).send("No valid icons found");
    }

    const perLineNum = Math.min(Math.max(Number(perline), 1), 50);
    const count = fetched.length;
    const cols = Math.min(count, perLineNum);
    const rows = Math.ceil(count / perLineNum);

    const width = cols * ICON_SIZE + (cols - 1) * GAP;
    const height = rows * ICON_SIZE + (rows - 1) * GAP;

    let iconBlocks = "";

    fetched.forEach((item, index) => {
      const col = index % perLineNum;
      const row = Math.floor(index / perLineNum);

      const x = col * (ICON_SIZE + GAP);
      const y = row * (ICON_SIZE + GAP);

      iconBlocks += `
        <g transform="translate(${x}, ${y})">
          <rect width="${ICON_SIZE}" height="${ICON_SIZE}" rx="${RADIUS}" fill="${bgFill}" />
          <svg
            x="${PADDING}"
            y="${PADDING}"
            width="${ICON_SIZE - PADDING * 2}"
            height="${ICON_SIZE - PADDING * 2}"
            viewBox="${item.viewBox}"
          >
            ${item.content}
          </svg>
        </g>
      `;
    });

    const finalSvg = `
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="${width}"
        height="${height}"
        viewBox="0 0 ${width} ${height}"
      >
        ${iconBlocks}
      </svg>
    `;

    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader(
      "Cache-Control",
      "public, max-age=86400, stale-while-revalidate=604800"
    );
    return res.status(200).send(finalSvg);
  } catch (err) {
    console.error(err);
    return res.status(500).send("Internal Server Error");
  }
}