export default async function handler(req, res) {
  try {
    const { i = "", theme = "dark", perline = 15 } = req.query;

    if (!i) {
      res.status(400).send("Missing ?i=");
      return;
    }

    const list = i.split(",").map(v => v.trim().toLowerCase());

    // ---------------- CONFIG ----------------
    const ICON_SIZE = 48;
    const PADDING = 12;
    const GAP = 0;
    const RADIUS = 6;

    const fillColor = theme === "light" ? "#000000" : "#ffffff";
    const bgColor = theme === "light" ? "#ffffff" : "#1e1e1e";

    // ---------------- FETCH ICONS ----------------
    const fetched = [];

    for (const icon of list) {
      const deviconURL =
        "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/" +
        icon +
        "/" +
        icon +
        "-original.svg";

      const simpleURL = "https://cdn.simpleicons.org/" + icon;

      let content = "";
      let viewBox = "0 0 24 24";

      try {
        let r = await fetch(deviconURL);

        if (!r.ok) {
          r = await fetch(simpleURL);
        }

        if (r.ok) {
          let text = await r.text();

          // Extract viewBox
          const vbMatch = text.match(/viewBox="([^"]+)"/);
          if (vbMatch) {
            viewBox = vbMatch[1];
          }

          // Remove outer <svg> wrapper
          content = text
            .replace(/<svg[^>]*>/, "")
            .replace(/<\/svg>/, "")
            .replace(/<title>.*?<\/title>/g, "")
            .replace(/fill="currentColor"/g, 'fill="' + fillColor + '"')
            .replace(/stroke="currentColor"/g, 'stroke="' + fillColor + '"');
        }
      } catch (e) {
        console.error("Failed to fetch icon:", icon, e);
      }

      if (content) {
        fetched.push({ content, viewBox });
      }
    }

    if (fetched.length === 0) {
      res.status(404).send("No valid icons found");
      return;
    }

    // ---------------- LAYOUT ----------------
    const perLineNum = Math.min(Math.max(Number(perline) || 1, 1), 50);
    const count = fetched.length;

    const cols = Math.min(count, perLineNum);
    const rows = Math.ceil(count / perLineNum);

    const width = cols * ICON_SIZE + (cols - 1) * GAP;
    const height = rows * ICON_SIZE + (rows - 1) * GAP;

    // ---------------- BUILD SVG ----------------
    let blocks = "";

    fetched.forEach((item, index) => {
      const col = index % perLineNum;
      const row = Math.floor(index / perLineNum);

      const x = col * (ICON_SIZE + GAP);
      const y = row * (ICON_SIZE + GAP);

      blocks +=
        '<g transform="translate(' + x + ',' + y + ')">' +
        '<rect width="' +
        ICON_SIZE +
        '" height="' +
        ICON_SIZE +
        '" rx="' +
        RADIUS +
        '" fill="' +
        bgColor +
        '"/>' +
        '<svg x="' +
        PADDING +
        '" y="' +
        PADDING +
        '" width="' +
        (ICON_SIZE - PADDING * 2) +
        '" height="' +
        (ICON_SIZE - PADDING * 2) +
        '" viewBox="' +
        item.viewBox +
        '" style="color:' +
        fillColor +
        '">' +
        item.content +
        "</svg>" +
        "</g>";
    });

    const finalSvg =
      '<svg xmlns="http://www.w3.org/2000/svg" ' +
      'width="' +
      width +
      '" height="' +
      height +
      '" viewBox="0 0 ' +
      width +
      " " +
      height +
      '">' +
      blocks +
      "</svg>";

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