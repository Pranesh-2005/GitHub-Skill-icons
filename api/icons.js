export default async function handler(req, res) {
  try {
    const { i = "", perline = 15, color } = req.query;

    if (!i) {
      return res.status(400).send("Missing ?i=");
    }

    const list = i.split(",").map((v) => v.trim().toLowerCase());

    const ICON_SIZE = 48;
    const PADDING = 8;
    const RADIUS = 6;
    const GAP = 4;

    const fetched = [];

    for (const iconSlug of list) {
      try {
        // Build the SimpleIcons URL
        // If a hex color is provided via ?color=, use it
        const hex = color ? color.replace("#", "") : "";
        const url = hex
          ? `https://cdn.simpleicons.org/${iconSlug}/${hex}`
          : `https://cdn.simpleicons.org/${iconSlug}`;

        const r = await fetch(url);

        if (!r.ok) {
          console.warn("Icon not found:", iconSlug, r.status);
          continue;
        }

        const rawSvg = await r.text();

        // Extract viewBox
        const vbMatch = rawSvg.match(/viewBox="([^"]+)"/i);
        const viewBox = vbMatch ? vbMatch[1] : "0 0 24 24";

        // Extract <path> and children
        const contentMatch = rawSvg.match(
          /<svg[^>]*>([\s\S]*?)<\/svg>/i
        );
        const content = contentMatch ? contentMatch[1].trim() : "";

        fetched.push({ content, viewBox });
      } catch (e) {
        console.error("Failed to fetch icon:", iconSlug, e);
      }
    }

    if (fetched.length === 0) {
      return res
        .status(404)
        .send(
          "No valid icons found. Try valid slugs like ?i=github,python,react"
        );
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

      // Scale icons (SimpleIcons default size is 24)
      const scale = (ICON_SIZE - PADDING * 2) / 24;

      iconBlocks += `
        <g transform="translate(${x}, ${y})">
          <rect
            width="${ICON_SIZE}"
            height="${ICON_SIZE}"
            rx="${RADIUS}"
            fill="transparent"
          />
          <g transform="translate(${PADDING}, ${PADDING}) scale(${scale})">
            ${item.content}
          </g>
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
    `.trim();

    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader(
      "Cache-Control",
      "public, max-age=86400, stale-while-revalidate=604800"
    );
    res.status(200).send(finalSvg);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
}