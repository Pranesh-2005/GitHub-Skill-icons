export default async function handler(req, res) {
  try {
    const { i = "", theme = "dark", perline = 15 } = req.query;

    if (!i) return res.status(400).send("Missing ?i=");

    const list = i.split(",").map((v) => v.trim().toLowerCase());

    // --- CONFIGURATION ---
    const ICON_SIZE = 48; // Total size of one block
    const PADDING = 12;   // Padding inside the block (icon shrinks to fit)
    const GAP = 0;        // Gap between blocks
    const RADIUS = 6;     // Corner radius for the background card

    // SkillIcons.dev Palette approximation
    const colors = {
      dark: { bg: "#242938", border: "#E1E4E8" }, // Dark theme background
      light: { bg: "#FFFFFF", border: "#E1E4E8" },
    };
    
    // Select theme colors (fallback to dark if invalid)
    const t = colors[theme] || colors.dark;
    
    // If you want the specific 'stroke' logic from your snippet:
    // const stroke = theme === "light" ? "#e5e5e5" : "#2e2e2e"; 
    // But skillicons actually uses a background rect, not usually a border. 
    // We will stick to your fill logic:
    const fill = theme === "light" ? "#ffffff" : "#1e1e1e";

    // --- FETCHING ---
    const fetched = [];

    for (const icon of list) {
      const deviconURL = `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${icon}/${icon}-original.svg`;
      const simpleURL = `https://cdn.simpleicons.org/${icon}`;

      let content = "";
      let viewBox = "0 0 24 24"; // Default fallback

      try {
        // Try DevIcon first
        let r = await fetch(deviconURL);
        if (!r.ok) {
          // Fallback to SimpleIcons
          r = await fetch(simpleURL);
        }

        if (r.ok) {
          const text = await r.text();
          
          // 1. Extract ViewBox
          const vbMatch = text.match(/viewBox="([^"]*)"/);
          if (vbMatch) viewBox = vbMatch[1];

          // 2. Extract Inner Content (remove <svg> wrapper)
          // We assume standard SVG structure <svg ...> content </svg>
          content = text.replace(/<svg[^>]*>([\s\S]*?)<\/svg>/, "$1");
        }
      } catch (e) {
        console.error(`Failed to fetch ${icon}`, e);
      }

      if (content) {
        fetched.push({ content, viewBox });
      }
    }

    if (fetched.length === 0) return res.status(404).send("No valid icons found");

    // --- LAYOUT CALCULATIONS ---
    const perLineNum = Math.min(Math.max(Number(perline), 1), 50);
    const count = fetched.length;
    
    // Calculate columns (min of available icons or limit)
    const cols = Math.min(count, perLineNum);
    const rows = Math.ceil(count / perLineNum);

    const width = cols * ICON_SIZE + (cols - 1) * GAP;
    const height = rows * ICON_SIZE + (rows - 1) * GAP;

    // --- BUILD SVG ---
    let iconBlocks = "";

    fetched.forEach((item, index) => {
      const col = index % perLineNum;
      const row = Math.floor(index / perLineNum);

      const x = col * (ICON_SIZE + GAP);
      const y = row * (ICON_SIZE + GAP);

      iconBlocks += `
        <g transform="translate(${x}, ${y})">
          <rect 
            width="${ICON_SIZE}" 
            height="${ICON_SIZE}" 
            rx="${RADIUS}" 
            fill="${fill}" 
          />
          
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
    // Cache control (optional but recommended)
    res.setHeader("Cache-Control", "public, max-age=86400, stale-while-revalidate=604800");
    return res.status(200).send(finalSvg);

  } catch (err) {
    console.error(err);
    return res.status(500).send("Internal Server Error");
  }
}
