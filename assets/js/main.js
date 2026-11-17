document.addEventListener("DOMContentLoaded", () => {
  const panels = new Map(
    Array.from(document.querySelectorAll("[data-view]")).map((panel) => [
      panel.id,
      panel,
    ]),
  );
  const links = document.querySelectorAll("[data-view-link]");

  function showView(viewId) {
    const activeId = panels.has(viewId) ? viewId : "home";

    panels.forEach((panel, id) => {
      panel.hidden = id !== activeId;
    });

    links.forEach((link) => {
      if (link.dataset.viewLink === activeId) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  function viewFromHash() {
    const viewId = window.location.hash.slice(1);
    if (viewId === "education" || viewId === "experience") return "about";
    if (viewId === "projects") return "design";
    return panels.has(viewId) ? viewId : "home";
  }

  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      const viewId = link.dataset.viewLink;
      if (!panels.has(viewId)) return;

      event.preventDefault();
      const nextHash = `#${viewId}`;
      if (window.location.hash !== nextHash) {
        window.history.pushState(null, "", nextHash);
      }
      showView(viewId);
    });
  });

  window.addEventListener("popstate", () => showView(viewFromHash()));
  window.addEventListener("hashchange", () => showView(viewFromHash()));
  showView(viewFromHash());
});
