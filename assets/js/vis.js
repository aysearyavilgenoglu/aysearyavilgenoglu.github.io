document.addEventListener("DOMContentLoaded", () => {
    const svgNS = "http://www.w3.org/2000/svg";

    // --- 1. Statik SVG (Skill Bar Chart) ---
    const staticContainer = document.getElementById('svg-static-container');
    const staticSvg = document.createElementNS(svgNS, "svg");
    staticSvg.setAttribute("width", "100%");
    staticSvg.setAttribute("height", "200");

    const skills = [
        { name: "3D Modeling", val: 280, color: "#2c3e50" },
        { name: "Drafting", val: 240, color: "#34495e" }
    ];

    skills.forEach((s, i) => {
        let rect = document.createElementNS(svgNS, "rect");
        rect.setAttribute("x", "10");
        rect.setAttribute("y", i * 50 + 20);
        rect.setAttribute("width", s.val);
        rect.setAttribute("height", "30");
        rect.setAttribute("fill", s.color);
        staticSvg.appendChild(rect);
    });
    staticContainer.appendChild(staticSvg);

    // --- 2. Creative JS Art (Moving Dots/Circles) ---
    const artContainer = document.getElementById('svg-art-container');
    const artSvg = document.createElementNS(svgNS, "svg");
    artSvg.setAttribute("viewBox", "0 0 500 300");
    artSvg.style.background = "#f9f9f9";
    
    for (let i = 0; i < 30; i++) {
        let circle = document.createElementNS(svgNS, "circle");
        circle.setAttribute("cx", Math.random() * 500);
        circle.setAttribute("cy", Math.random() * 300);
        circle.setAttribute("r", Math.random() * 15 + 2);
        circle.setAttribute("fill", `hsl(${Math.random() * 360}, 60%, 70%)`);
        circle.setAttribute("opacity", "0.6");
        artSvg.appendChild(circle);
    }
    artContainer.appendChild(artSvg);
});