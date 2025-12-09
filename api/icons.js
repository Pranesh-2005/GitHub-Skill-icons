import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    const { i = "", theme = "dark" } = req.query;

    if (!i) return res.status(400).send("Missing ?i=");

    const icons = i.split(",").map(v => v.trim().toLowerCase());

    // Constants based on skillicons.dev design
    const CARD = 56;         // outer card size
    const ICON = 48;         // inner icon box
    const PADDING = 4;       // padding inside card

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
        let r = await fetch(deviconURL);
        let t = await r.text();
        if (t.includes("<svg")) svg = t;
      } catch {}

      // Fallback to simpleicons
      if (!svg) {
        try {
          let r = await fetch(simpleiconURL);
          let t = await r.text();
          if (t.includes("<svg")) svg = t;
        } catch {}
      }

      if (!svg) continue;

      // Extract inner SVG content
      svg = svg.replace(/<svg[^>]*>/, "").replace(/<\/svg>/, "");

      // Scale icon SVG into 48x48
      const scale = ICON / 100;
      const offset = (CARD - ICON) / 2;

      out += `
        <g transform="translate(${x},0)">
          <rect width="${CARD}" height="${CARD}" rx="12"
            fill="${bg}" stroke="${stroke}" stroke-width="2" />

          <g transform="translate(${offset},${offset}) scale(${scale})">
            ${svg}
          </g>
        </g>
      `;

      x += CARD + 12; // spacing between cards
    }

    const final = `
      <svg xmlns="http://www.w3.org/2000/svg"
           width="${x}" height="${CARD}">
        ${out}
      </svg>
    `;

    res.setHeader("Content-Type", "image/svg+xml");
    res.send(final);

  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).send("Server Error");
  }
}          const txt = await r.text();
          if (txt.includes("<svg")) svg = txt;
        } catch {}
      }

      if (!svg) continue;

      // Remove outer <svg>
      svg = svg.replace(/<svg[^>]*>/, "").replace(/<\/svg>/, "");

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

    const finalSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${x}" height="${px}">
        ${svgOut}
      </svg>
    `;

    res.setHeader("Content-Type", "image/svg+xml");
    return res.status(200).send(finalSvg);
  } catch (err) {
    console.error("SERVER ERROR:", err);
    return res.status(500).send("Server Error");
  }
                    }
