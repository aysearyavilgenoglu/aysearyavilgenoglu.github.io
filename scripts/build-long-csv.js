const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const widePath = path.join(root, "assets/img/data/videogames_wide.csv");
const outPath = path.join(root, "dataset/videogames_long.csv");

const text = fs.readFileSync(widePath, "utf8");
const lines = text.split(/\r?\n/);
const header = lines[0];
const cols = header.split(",");
const getIdx = (name) => cols.indexOf(name);
const nameIdx = getIdx("Name");
const platformIdx = getIdx("Platform");
const yearIdx = getIdx("Year");
const genreIdx = getIdx("Genre");
const publisherIdx = getIdx("Publisher");
const naIdx = getIdx("NA_Sales");
const euIdx = getIdx("EU_Sales");
const jpIdx = getIdx("JP_Sales");
const otherIdx = getIdx("Other_Sales");
const globalIdx = getIdx("Global_Sales");

const regions = [
  ["North America", naIdx],
  ["Europe", euIdx],
  ["Japan", jpIdx],
  ["Other", otherIdx],
];

const out = ["Name,Platform,Year,Genre,Publisher,Region,Sales,Global_Sales"];

for (let i = 1; i < lines.length; i++) {
  const row = lines[i];
  if (!row.trim()) continue;
  const cells = row.split(",").map((c) => (c || "").replace(/^"|"$/g, ""));
  const name = cells[nameIdx] || "";
  const platform = cells[platformIdx] || "";
  const year = cells[yearIdx] || "";
  const genre = cells[genreIdx] || "";
  const publisher = cells[publisherIdx] || "";
  const globalSales = cells[globalIdx] || "0";
  for (const [regionName, colIdx] of regions) {
    const sales = cells[colIdx] || "0";
    const line = [name, platform, year, genre, publisher, regionName, sales, globalSales]
      .map((v) => (v.includes(",") ? '"' + v.replace(/"/g, '""') + '"' : v))
      .join(",");
    out.push(line);
  }
}

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, out.join("\n"), "utf8");
console.log("Wrote", out.length - 1, "data rows to dataset/videogames_long.csv");
