export default async function handler(req, res) {
  const { i = "", size = 60, round = "true", theme = "light" } = req.query;

  if (!i) return res.status(400).send("Missing ?i=");

  const icons = i.split(",").map(s => s.trim().toLowerCase());
  const px = Number(size);

  const bgColor = theme === "dark" ? "#1f1f1f" : "#ffffff";
  const strokeColor = theme === "dark" ? "#2f2f2f" : "#e5e5e5";

  let x = 0;
  let svgOut = "";

  for (const icon of icons) {
    let urlDev = `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${icon}/${icon}-original.svg`;
    let urlSimple = `https://cdn.simpleicons.org/${icon}`;

    let svg = "";

    try {
      // Try DevIcons
      let r = await fetch(urlDev);
      if (r.ok) svg = await r.text();
      else {
        // Fallback to SimpleIcons
        r = await fetch(urlSimple);
        if (r.ok) svg = await r.text();
      }
    } catch {
      continue; // skip missing icons
    }

    if (!svg) continue;

    // Remove <svg> wrapper
    svg = svg.replace(/<svg[^>]*>/, "").replace(/<\/svg>/, "");

    // Output the final card
    svgOut += `
      <g transform="translate(${x}, 0)">
        <rect width="${px}" height="${px}" rx="${round === "true" ? px * 0.25 : 0}"
              fill="${bgColor}" stroke="${strokeColor}" stroke-width="2" />

        <g transform="translate(${px * 0.20}, ${px * 0.20}) scale(${(px * 0.60) / 100})">
          ${svg}
        </g>
      </g>
    `;

    x += px + 20;
  }

  const final = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${x}" height="${px}">
      ${svgOut}
    </svg>
  `;

  res.setHeader("Content-Type", "image/svg+xml");
  res.send(final);
}
