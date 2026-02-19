// --- 1. SVG Arts and Static Visuals ---
document.addEventListener("DOMContentLoaded", () => {
 
const renderStaticArts = () => {
  const svgNS = "http://www.w3.org/2000/svg";

  // 1. Skill Bar Chart Fix
  const staticContainer = document.getElementById("svg-static-container");
  if (staticContainer) {
    staticContainer.innerHTML = ""; // Clear existing content
    
    const staticSvg = document.createElementNS(svgNS, "svg");
    // Ensure height is explicitly set so it doesn't collapse to 0
    staticSvg.setAttribute("width", "100%");
    staticSvg.setAttribute("height", "160"); 
    staticSvg.style.display = "block";

    const skills = [
      { name: "3D Modeling", val: 280, color: "#2c3e50" },
      { name: "Drafting", val: 240, color: "#34495e" },
    ];

    skills.forEach((s, i) => {
      const g = document.createElementNS(svgNS, "g");
      
      // Bar
      const rect = document.createElementNS(svgNS, "rect");
      rect.setAttribute("x", "10");
      rect.setAttribute("y", i * 60 + 20);
      rect.setAttribute("width", s.val);
      rect.setAttribute("height", "35");
      rect.setAttribute("fill", s.color);
      rect.setAttribute("rx", "5"); // Rounded corners

      // Label
      const text = document.createElementNS(svgNS, "text");
      text.setAttribute("x", "20");
      text.setAttribute("y", i * 60 + 43);
      text.setAttribute("fill", "white");
      text.style.fontSize = "14px";
      text.style.fontWeight = "bold";
      text.style.fontFamily = "Arial, sans-serif";
      text.textContent = s.name;

      g.appendChild(rect);
      g.appendChild(text);
      staticSvg.appendChild(g);
    });
    staticContainer.appendChild(staticSvg);
  }

  // 2. Generative Art (Circles)
  const artContainer = document.getElementById("svg-art-container");
  if (artContainer) {
    artContainer.innerHTML = "";
    const artSvg = document.createElementNS(svgNS, "svg");
    artSvg.setAttribute("viewBox", "0 0 500 300");
    artSvg.style.background = "#f9f9f9";
    artSvg.style.width = "100%";
    artSvg.style.height = "auto";

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
};

// Start everything
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    renderStaticArts();
    initDataVisualizations();
  });
} else {
  renderStaticArts();
  initDataVisualizations();
}

  // Generative Art Composition (Circles)
  const artContainer = document.getElementById("svg-art-container");
  if (artContainer) {
    const artSvg = document.createElementNS(svgNS, "svg");
    artSvg.setAttribute("viewBox", "0 0 500 300");
    artSvg.style.background = "#f9f9f9";
    artSvg.style.width = "100%"; 

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

// --- 2. Data Loading and Visualizations ---

async function fetchVideoGameData() {
  const wideUrl = "assets/img/data/videogames_wide.csv"; 
  try {
    const response = await fetch(wideUrl);
    if (!response.ok) throw new Error("CSV file not found!");
    const csvText = await response.text();
    const wideData = d3.csvParse(csvText, d3.autoType);
    return { wideData, regionalLong: wideToLongRegional(wideData) };
  } catch (e) {
    console.error("Data loading error:", e);
    return { wideData: [], regionalLong: [] };
  }
}

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
        Sales: row[key] || 0
      });
    });
  });
  return long;
}

async function initDataVisualizations() {
  if (typeof vl === "undefined" || typeof d3 === "undefined" || typeof vegaEmbed === "undefined") {
    console.error("Libraries not loaded!");
    return;
  }

  const { wideData, regionalLong } = await fetchVideoGameData();
  if (!wideData || wideData.length === 0) {
    console.error("No data available to render charts.");
    return;
  }

  // Fixed sizes to prevent layout shift and ensure visibility
  const chartWidth = 400; 
  const chartHeight = 300;

  // VIS 1: Heatmap
  const vlSpec1 = vl.markRect().data(wideData).encode(
    vl.x().fieldN("Genre"),
    vl.y().fieldN("Platform"),
    vl.color().sum("Global_Sales").scale({ scheme: "blues" }),
    vl.tooltip([vl.fieldN("Genre"), vl.fieldN("Platform"), vl.sum("Global_Sales")])
  ).width(chartWidth).height(chartHeight).toSpec();

  // VIS 2: Stacked Area Chart
  const vlSpec2 = vl.markArea().data(wideData).encode(
    vl.x().fieldQ("Year").scale({ zero: false }),
    vl.y().sum("Global_Sales").title("Global Sales (M)"),
    vl.color().fieldN("Genre"),
    vl.tooltip([vl.fieldQ("Year"), vl.fieldN("Genre"), vl.sum("Global_Sales")])
  ).width(chartWidth).height(chartHeight).toSpec();

  // VIS 3: Regional Sales Bar Chart
  const vlSpec3 = vl.markBar().data(regionalLong).encode(
    vl.x().fieldN("Platform"),
    vl.y().sum("Sales").title("Sales (M)"),
    vl.color().fieldN("Region"),
    vl.tooltip([vl.fieldN("Platform"), vl.fieldN("Region"), vl.sum("Sales")])
  ).width(chartWidth).height(chartHeight).toSpec();

  // VIS 4: Top 15 Publishers
  const publisherTotals = d3.rollup(wideData, v => d3.sum(v, d => d.Global_Sales), d => d.Publisher);
  const topData = Array.from(publisherTotals.entries())
    .map(([Publisher, Global_Sales]) => ({ Publisher, Global_Sales }))
    .sort((a, b) => b.Global_Sales - a.Global_Sales).slice(0, 15);

  const vlSpec4 = vl.markBar().data(topData).encode(
    vl.y().fieldN("Publisher").sort("-x"),
    vl.x().fieldQ("Global_Sales").title("Total Sales (M)"),
    vl.tooltip([vl.fieldN("Publisher"), vl.fieldQ("Global_Sales")])
  ).width(chartWidth).height(chartHeight).toSpec();

  // Direct rendering
  vegaEmbed("#vis1", vlSpec1, { actions: false });
  vegaEmbed("#vis2", vlSpec2, { actions: false });
  vegaEmbed("#vis3", vlSpec3, { actions: false });
  vegaEmbed("#vis4", vlSpec4, { actions: false });
}

// Ensure the function runs after all scripts are ready
window.onload = () => {
  initDataVisualizations();
  
};