// We don't need to import the packages here since we're using the server to serve the demos
// The packages will be loaded by the individual demo pages

// Demo configuration
const demos = {
  "blob-anim": [
    {
      name: "Interactive Demo",
      path: "/packages/blob-anim/demos/index.html",
      description: "Main interactive demo with customizable settings",
    },
    {
      name: "Basic Usage",
      path: "/packages/blob-anim/demos/demo-pages/basic-usage.html",
      description: "Simple examples showing how to use the library",
    },
    {
      name: "Minimal Example",
      path: "/packages/blob-anim/demos/demo-pages/minimal.html",
      description: "Minimal implementation with default settings",
    },
    {
      name: "Documentation",
      path: "/packages/blob-anim/demos/demo-pages/documentation.html",
      description: "Library documentation and API reference",
    },
  ],
  "canvas-blob": [
    {
      name: "Canvas Demo",
      path: "/packages/canvas-blob/demos/index.html",
      description: "Canvas-based blob animations with interactive controls",
    },
  ],
  "pixi-blob": [
    {
      name: "PIXI.js Demo",
      path: "/packages/pixi-blob/demo/index.html",
      description: "WebGL-powered blob animations using PIXI.js",
    },
  ],
  showcase: [
    {
      name: "Showcase App",
      path: "/apps/showcase/index.html",
      description:
        "Full-featured showcase application demonstrating all capabilities",
    },
  ],
};

// Function to create demo sections
function createDemoSections() {
  const container = document.getElementById("demo-container");

  // Create sections for each package
  Object.entries(demos).forEach(([pkg, demoList]) => {
    const section = document.createElement("div");
    section.className = "package-section";

    // Create title based on package name
    const title = document.createElement("h2");
    if (pkg === "blob-anim") {
      title.textContent = "SVG Blob Animations (blob-anim)";
    } else if (pkg === "canvas-blob") {
      title.textContent = "Canvas Blob Animations (canvas-blob)";
    } else if (pkg === "pixi-blob") {
      title.textContent = "PIXI.js Blob Animations (pixi-blob)";
    } else if (pkg === "showcase") {
      title.textContent = "Showcase Application";
    }
    section.appendChild(title);

    // Create demo list
    const list = document.createElement("ul");
    demoList.forEach((demo) => {
      const item = document.createElement("li");

      // Create demo link
      const link = document.createElement("a");
      link.textContent = demo.name;
      link.href = "#";
      link.dataset.path = demo.path;
      link.addEventListener("click", (e) => {
        e.preventDefault();
        loadDemo(demo.path);
      });
      item.appendChild(link);

      // Create description
      const description = document.createElement("div");
      description.className = "description";
      description.textContent = demo.description;
      item.appendChild(description);

      list.appendChild(item);
    });
    section.appendChild(list);
    container.appendChild(section);
  });
}

// Function to load a demo in the iframe
function loadDemo(path) {
  const iframe = document.getElementById("demo-frame");
  const demoTitle = document.getElementById("demo-title");
  const demoPath = document.getElementById("demo-path");

  // Update the iframe source
  iframe.src = path;

  // Update the demo info
  const demoName =
    Object.values(demos)
      .flat()
      .find((demo) => demo.path === path)?.name || "Demo";

  demoTitle.textContent = demoName;
  demoPath.textContent = path;

  // Show the demo container
  document.getElementById("demo-viewer").style.display = "block";

  // Scroll to the demo
  document.getElementById("demo-viewer").scrollIntoView({ behavior: "smooth" });
}

// Function to close the demo
function closeDemo() {
  document.getElementById("demo-viewer").style.display = "none";
  document.getElementById("demo-frame").src = "about:blank";
}

// Initialize the page
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM content loaded, creating demo sections...");
  createDemoSections();

  // Set up close button
  document.getElementById("close-demo").addEventListener("click", closeDemo);

  // Set up back to top button
  document.querySelector(".back-to-top").addEventListener("click", (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});

// Call createDemoSections immediately as well, in case DOMContentLoaded already fired
console.log("Running main.js, creating demo sections...");
createDemoSections();
