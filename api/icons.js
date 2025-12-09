export default async function handler(req, res) {
  try {
    const { i = "", theme = "dark", perline = 15 } = req.query;

    if (!i)
      return res.status(400).send("Missing ?i=");

    const list = i.split(",").map(v => v.trim().toLowerCase());

    // Base dimensions used by skillicons.dev
    const ONE_ICON = 48;          // final icon size
    const CARD = 56;              // final card size
    const RAW_ICON_SIZE = 300;    // original icon artboard
    const ICON_INNER = RAW_ICON_SIZE - 44; // padding removed
    const SCALE = ONE_ICON / ICON_INNER;   // exact scaling factor

    const bg = theme === "light" ? "#ffffff" : "#1e1e1e";
    const stroke = theme === "light" ? "#e5e5e5" : "#2e2e2e";

    // Will store inner SVGs
    const fetched = [];

    for (const icon of list) {
      const deviconURL = `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${icon}/${icon}-original.svg`;
      const simpleURL = `https://cdn.simpleicons.org/${icon}`;

      let svg = "";

      try {
        let r = await fetch(deviconURL);
        if (r.ok) svg = await r.text();
      } catch {}

      if (!svg) {
        try {
          let r = await fetch(simpleURL);
          if (r.ok) svg = await r.text();
        } catch {}
      }

      if (!svg || !svg.includes("<svg")) continue;

      // Remove entire <svg> wrapper
      svg = svg.replace(/<svg[^>]*>/, "").replace(/<\/svg>/, "");

      fetched.push(svg);
    }

    if (fetched.length === 0)
      return res.status(404).send("No valid icons found");

    /* ----- GRID CALCULATIONS (same as skillicons.dev) ----- */
    const perLine = Math.min(Math.max(Number(perline), 1), 50);
    const rows = Math.ceil(fetched.length / perLine);

    const rawWidth = perLine * RAW_ICON_SIZE - 44;
    const rawHeight = rows * RAW_ICON_SIZE - 44;

    const finalWidth = rawWidth * SCALE;
    const finalHeight = rawHeight * SCALE;

    /* ----- BUILD SVG ----- */
    let blocks = "";

    fetched.forEach((svg, index) => {
      const col = index % perLine;
      const row = Math.floor(index / perLine);

      blocks += `
        <g transform="translate(${col * RAW_ICON_SIZE}, ${row * RAW_ICON_SIZE}) scale(${SCALE})">
          <rect x="0" y="0" width="${RAW_ICON_SIZE}" height="${RAW_ICON_SIZE}" rx="150"
            fill="${bg}" stroke="${stroke}" stroke-width="20" />

          <g transform="translate(22, 22)">
            ${svg}
          </g>
        </g>
      `;
    });

    const final = `
      <svg xmlns="http://www.w3.org/2000/svg"
           width="${finalWidth}"
           height="${finalHeight}"
           viewBox="0 0 ${rawWidth} ${rawHeight}">
        ${blocks}
      </svg>
    `;

    res.setHeader("Content-Type", "image/svg+xml");
    return res.status(200).send(final);

  } catch (err) {
    console.error("ERROR:", err);
    return res.status(500).send("Server Error");
  }
      }
