export default async function handler(req, res) {
  try {
    const { i = "", theme = "dark" } = req.query;

    if (!i) {
      return res.status(400).send("Missing ?i=");
    }

    const icons = i.split(",").map(v => v.trim().toLowerCase());

    // Match skillicons.dev dimensions
    const CARD = 56;
    const ICON = 48;

    const bg = theme === "light" ? "#ffffff" : "#1e1e1e";
    const stroke = theme === "light" ? "#e5e5e5" : "#2e2e2e";

    let x = 0;
    let out = "";

    for (const icon of icons) {
      const deviconURL = `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${icon}/${icon}-original.svg`;
      const simpleiconURL = `https://cdn.simpleicons.org/${icon}`;

      let svg = "";

      // Try Devicon first
      try {
        const res1 = await fetch(deviconURL);
        if (res1.ok) {
          const txt = await res1.text();
          if (txt.includes("<svg")) svg = txt;
        }
      } catch {}

      // Fallback to SimpleIcons
      if (!svg) {
        try {
          const res2 = await fetch(simpleiconURL);
          if (res2.ok) {
            const txt = await res2.text();
            if (txt.includes("<svg")) svg = txt;
          }
        } catch {}
      }

      if (!svg) continue;

      // Remove outer <svg> wrapper
      svg = svg.replace(/<svg[^>]*>/, "").replace(/<\/svg>/, "");

      const scale = ICON / 100;
      const offset = (CARD - ICON) / 2;

      out += `
        <g transform="translate(${x}, 0)">
          <rect
            width="${CARD}"
            height="${CARD}"
            rx="12"
            fill="${bg}"
            stroke="${stroke}"
            stroke-width="2"
          />
          <g transform="translate(${offset}, ${offset}) scale(${scale})">
            ${svg}
          </g>
        </g>
      `;

      x += CARD + 12;
    }

    const finalSVG = `
      <svg xmlns="http://www.w3.org/2000/svg"
           width="${x}"
           height="${CARD}">
        ${out}
      </svg>
    `;

    res.setHeader("Content-Type", "image/svg+xml");
    return res.status(200).send(finalSVG);

  } catch (err) {
    console.error("SERVER ERROR:", err);
    return res.status(500).send("Server Error");
  }
        }
