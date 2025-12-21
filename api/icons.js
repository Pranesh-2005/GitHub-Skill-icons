export default async function handler(req, res) {
  try {
    const { i = "", perline = 15, theme = "dark" } = req.query;
    if (!i) return res.status(400).send("Missing ?i=");

    const icons = i.split(",").map(v => v.trim().toLowerCase());

    // ----- CARD CONFIG (matches skillicons.dev style) -----
    const ICON_SIZE = 48;
    const GAP = 8;
    const RADIUS = 8;

    const THEMES = {
      dark: {
        bg: "#242938",
      },
      light: {
        bg: "#ffffff",
      }
    };

    const activeTheme = THEMES[theme] || THEMES.dark;

    const cols = Math.min(
      icons.length,
      Math.max(1, Number(perline) || 1)
    );
    const rows = Math.ceil(icons.length / cols);

    const width = cols * ICON_SIZE + (cols - 1) * GAP;
    const height = rows * ICON_SIZE + (rows - 1) * GAP;

    let blocks = "";

    icons.forEach((slug, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);

      const x = col * (ICON_SIZE + GAP);
      const y = row * (ICON_SIZE + GAP);

      // SimpleIcons official CDN (brand color)
      const iconUrl = `https://cdn.simpleicons.org/${slug}`;

      blocks += `
        <g transform="translate(${x}, ${y})">
          <rect
            width="${ICON_SIZE}"
            height="${ICON_SIZE}"
            rx="${RADIUS}"
            fill="${activeTheme.bg}"
          />
          <image
            href="${iconUrl}"
            x="6"
            y="6"
            width="${ICON_SIZE - 12}"
            height="${ICON_SIZE - 12}"
            preserveAspectRatio="xMidYMid meet"
          />
        </g>
      `;
    });

    const svg = `
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="${width}"
        height="${height}"
        viewBox="0 0 ${width} ${height}"
      >
        ${blocks}
      </svg>
    `.trim();

    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader(
      "Cache-Control",
      "public, max-age=86400, stale-while-revalidate=604800"
    );
    return res.status(200).send(svg);

  } catch (err) {
    console.error(err);
    return res.status(500).send("Internal Server Error");
  }
}