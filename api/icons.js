export default async function handler(req, res) {
  try {
    const { i = "", perline = 15, color } = req.query;
    if (!i) return res.status(400).send("Missing ?i=");

    const icons = i.split(",").map(v => v.trim().toLowerCase());

    const ICON_SIZE = 48;
    const GAP = 6;
    const RADIUS = 6;

    const cols = Math.min(icons.length, Math.max(1, Number(perline) || 1));
    const rows = Math.ceil(icons.length / cols);

    const width = cols * ICON_SIZE + (cols - 1) * GAP;
    const height = rows * ICON_SIZE + (rows - 1) * GAP;

    const hex = color ? color.replace("#", "") : "";

    let blocks = "";

    icons.forEach((slug, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);

      const x = col * (ICON_SIZE + GAP);
      const y = row * (ICON_SIZE + GAP);

      const iconUrl = hex
        ? `https://cdn.simpleicons.org/${slug}/${hex}`
        : `https://cdn.simpleicons.org/${slug}`;

      blocks += `
        <g transform="translate(${x}, ${y})">
          <rect
            width="${ICON_SIZE}"
            height="${ICON_SIZE}"
            rx="${RADIUS}"
            fill="transparent"
          />
          <image
            href="${iconUrl}"
            x="0"
            y="0"
            width="${ICON_SIZE}"
            height="${ICON_SIZE}"
          />
        </g>
      `;
    });

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg"
           width="${width}"
           height="${height}"
           viewBox="0 0 ${width} ${height}">
        ${blocks}
      </svg>
    `.trim();

    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader("Cache-Control", "public, max-age=86400");
    return res.status(200).send(svg);

  } catch (err) {
    console.error(err);
    return res.status(500).send("Internal Server Error");
  }
}