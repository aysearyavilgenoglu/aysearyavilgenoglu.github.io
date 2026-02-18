document.addEventListener("DOMContentLoaded", () => {
  const svgNS = "http://www.w3.org/2000/svg";

  // --- 1. Static SVG (Skill Bar Chart) ---
  const staticContainer = document.getElementById("svg-static-container");
  if (staticContainer) {
    const staticSvg = document.createElementNS(svgNS, "svg");
    staticSvg.setAttribute("width", "100%");
    staticSvg.setAttribute("height", "200");

    const skills = [
      { name: "3D Modeling", val: 280, color: "#2c3e50" },
      { name: "Drafting", val: 240, color: "#34495e" },
    ];

    skills.forEach((s, i) => {
      const rect = document.createElementNS(svgNS, "rect");
      rect.setAttribute("x", "10");
      rect.setAttribute("y", i * 50 + 20);
      rect.setAttribute("width", s.val);
      rect.setAttribute("height", "30");
      rect.setAttribute("fill", s.color);
      staticSvg.appendChild(rect);
    });
    staticContainer.appendChild(staticSvg);
  }

  // --- 2. Creative JS Art (Moving Dots/Circles) ---
  const artContainer = document.getElementById("svg-art-container");
  if (artContainer) {
    const artSvg = document.createElementNS(svgNS, "svg");
    artSvg.setAttribute("viewBox", "0 0 500 300");
    artSvg.style.background = "#f9f9f9";

    for (let i = 0; i < 30; i++) {
      const circle = document.createElementNS(svgNS, "circle");
      circle.setAttribute("cx", Math.random() * 500);
      circle.setAttribute("cy", Math.random() * 300);
      circle.setAttribute("r", Math.random() * 15 + 2);
      circle.setAttribute("fill", `hsl(${Math.random() * 360}, 60%, 70%)`);
      circle.setAttribute("opacity", "0.6");
      artSvg.appendChild(circle);
    }
    artContainer.appendChild(artSvg);
  }
});

// --- Data-driven visualizations (Vega-Lite) ---
/**
 * Load video game data: prefers dataset/videogames_long.csv (D3 autoType),
 * falls back to assets/img/data/videogames_wide.csv.
 * Returns { wideData, regionalLong } for use in all four specs.
 */
async function fetchVideoGameData() {
  const longUrl = "dataset/videogames_long.csv";
  const wideUrl = "assets/img/data/videogames_wide.csv";

  const tryLong = await fetch(longUrl);
  if (tryLong.ok) {
    const csvText = await tryLong.text();
    const longRows = d3.csvParse(csvText, d3.autoType);
    return longToWideAndRegional(longRows);
  }

  const response = await fetch(wideUrl);
  const csvText = await response.text();
  const wideData = d3.csvParse(csvText, (d) => ({
    ...d,
    Year: d.Year != null ? +d.Year : null,
    NA_Sales: +d.NA_Sales || 0,
    EU_Sales: +d.EU_Sales || 0,
    JP_Sales: +d.JP_Sales || 0,
    Other_Sales: +d.Other_Sales || 0,
    Global_Sales: +d.Global_Sales || 0,
  }));
  return { wideData, regionalLong: wideToLongRegional(wideData) };
}

/** Convert long-format rows (Region, Sales) into wideData + regionalLong */
function longToWideAndRegional(longRows) {
  const regionalLong = longRows.map((d) => ({
    Platform: d.Platform,
    Genre: d.Genre,
    Year: d.Year,
    Region: d.Region,
    Sales: Number(d.Sales) || 0,
  }));
  const byGame = d3.group(
    longRows,
    (d) => [d.Platform, d.Year, d.Genre, d.Publisher].join("\t")
  );
  const wideData = [];
  byGame.forEach((rows) => {
    const r0 = rows[0];
    const g = Number(r0.Global_Sales) || 0;
    const na = rows.find((x) => x.Region === "North America");
    const eu = rows.find((x) => x.Region === "Europe");
    const jp = rows.find((x) => x.Region === "Japan");
    const other = rows.find((x) => x.Region === "Other");
    wideData.push({
      Name: r0.Name,
      Platform: r0.Platform,
      Year: r0.Year,
      Genre: r0.Genre,
      Publisher: r0.Publisher,
      NA_Sales: na ? Number(na.Sales) || 0 : 0,
      EU_Sales: eu ? Number(eu.Sales) || 0 : 0,
      JP_Sales: jp ? Number(jp.Sales) || 0 : 0,
      Other_Sales: other ? Number(other.Sales) || 0 : 0,
      Global_Sales: g,
    });
  });
  return { wideData, regionalLong };
}

/** Convert wide regional columns to long format for regional charts */
function wideToLongRegional(rows) {
  const long = [];
  const regions = [
    { key: "NA_Sales", name: "North America" },
    { key: "EU_Sales", name: "Europe" },
    { key: "JP_Sales", name: "Japan" },
    { key: "Other_Sales", name: "Other" },
  ];
  rows.forEach((row) => {
    regions.forEach(({ key, name }) => {
      long.push({
        Platform: row.Platform,
        Genre: row.Genre,
        Year: row.Year,
        Region: name,
        Sales: row[key] || 0,
      });
    });
  });
  return long;
}

function render(viewId, spec) {
  const el = document.querySelector(viewId);
  if (!el || typeof vegaEmbed !== "function") return Promise.resolve();
  return vegaEmbed(viewId, spec, { actions: { export: true, source: false, compiled: false } }).then(
    (result) => result.view.run()
  );
}

async function initDataVisualizations() {
  const hasContainers =
    document.getElementById("vis1") && document.getElementById("vis2");
  if (!hasContainers || typeof vl === "undefined" || typeof d3 === "undefined") return;

  const { wideData, regionalLong } = await fetchVideoGameData();

  // VIS 1: Genre × Platform heatmap (Global Sales)
  const vlSpec1 = vl
    .markRect()
    .data(wideData)
    .encode(
      vl.x().fieldN("Genre").title("Genre"),
      vl.y().fieldN("Platform").title("Platform"),
      vl.color()
        .sum("Global_Sales")
        .scale({ scheme: "blues" })
        .title("Global Sales (M)"),
      vl.tooltip([
        vl.field("Genre").title("Genre"),
        vl.field("Platform").title("Platform"),
        vl.field("Global_Sales").aggregate("sum").title("Global Sales (M)"),
      ])
    )
    .width(600)
    .height(400)
    .toSpec();

  // VIS 2: Sales over time by Genre (stacked area)
  const vlSpec2 = vl
    .markArea()
    .data(wideData)
    .encode(
      vl.x().fieldQ("Year").title("Year").scale({ zero: false }),
      vl.y().aggregate("sum").fieldQ("Global_Sales").title("Global Sales (M)"),
      vl.color().fieldN("Genre").title("Genre"),
      vl.tooltip([
        vl.field("Year").title("Year"),
        vl.field("Genre").title("Genre"),
        vl.field("Global_Sales").aggregate("sum").title("Sales (M)"),
      ])
    )
    .width(600)
    .height(400)
    .toSpec();

  // VIS 3: Regional sales by Platform (stacked bar)
  const vlSpec3 = vl
    .markBar()
    .data(regionalLong)
    .encode(
      vl.x().fieldN("Platform").title("Platform"),
      vl.y().aggregate("sum").fieldQ("Sales").title("Sales (M)"),
      vl.color().fieldN("Region").title("Region"),
      vl.tooltip([
        vl.field("Platform").title("Platform"),
        vl.field("Region").title("Region"),
        vl.field("Sales").aggregate("sum").title("Sales (M)"),
      ])
    )
    .width(600)
    .height(400)
    .toSpec();

  // VIS 4: Top publishers by Global Sales (horizontal bar)
  const publisherTotals = d3.rollup(
    wideData,
    (v) => d3.sum(v, (d) => d.Global_Sales),
    (d) => d.Publisher
  );
  const topPublishers = Array.from(publisherTotals.entries())
    .map(([Publisher, Global_Sales]) => ({ Publisher, Global_Sales }))
    .sort((a, b) => b.Global_Sales - a.Global_Sales)
    .slice(0, 15);

  const vlSpec4 = vl
    .markBar()
    .data(topPublishers)
    .encode(
      vl.y().fieldN("Publisher").title("Publisher").sort("-x"),
      vl.x().fieldQ("Global_Sales").title("Global Sales (M)"),
      vl.color().value("#3498db"),
      vl.tooltip([
        vl.field("Publisher").title("Publisher"),
        vl.field("Global_Sales").title("Global Sales (M)"),
      ])
    )
    .width(600)
    .height(400)
    .toSpec();

  await Promise.all([
    render("#vis1", vlSpec1),
    render("#vis2", vlSpec2),
    render("#vis3", vlSpec3),
    render("#vis4", vlSpec4),
  ]);
}

// Run when DOM and scripts (e.g. vega-lite-api) are ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initDataVisualizations);
} else {
  initDataVisualizations();
}
