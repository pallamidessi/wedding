const menuButton = document.getElementById("menuButton");
const navLinks = document.getElementById("navLinks");

if (menuButton && navLinks) {
  menuButton.addEventListener("click", () => {
    navLinks.classList.toggle("open");
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
    });
  });
}

// Single-page navigation: "#travel" and "#things-to-do" show their own view,
// any other hash shows the main view and scrolls to that section.
const views = [...document.querySelectorAll(".view")];
const baseTitle = document.title;
let currentView = null;

function route(hash, smooth) {
  const id = (hash || "").replace(/^#/, "") || "home";
  const pageView = views.find((view) => view.dataset.view === id);
  const target = pageView || views.find((view) => view.dataset.view === "home");
  const switched = target !== currentView;

  views.forEach((view) => {
    view.hidden = view !== target;
  });
  currentView = target;

  const title = target.dataset.title;
  document.title = title ? `${title} | ${baseTitle}` : baseTitle;

  document.querySelectorAll("#navLinks a").forEach((link) => {
    const active = link.getAttribute("href") === `#${target.dataset.view}`;
    link.classList.toggle("active", active && target.dataset.view !== "home");
  });

  const behavior = smooth && !switched ? "smooth" : "instant";
  const section = pageView ? null : document.getElementById(id);
  if (section) {
    section.scrollIntoView({ behavior, block: "start" });
  } else {
    window.scrollTo({ top: 0, behavior });
  }
}

document.addEventListener("click", (event) => {
  const link = event.target.closest('a[href^="#"]');
  if (!link || event.metaKey || event.ctrlKey || event.shiftKey) return;
  const hash = link.getAttribute("href");
  if (hash === "#") return;
  event.preventDefault();
  if (hash !== location.hash) history.pushState(null, "", hash);
  route(hash, true);
});

window.addEventListener("popstate", () => route(location.hash, false));
route(location.hash, false);

function setupSwitcher(buttonSelector, buttonAttr, panelAttr) {
  const buttons = document.querySelectorAll(buttonSelector);
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const key = button.dataset[buttonAttr];
      buttons.forEach((b) => {
        const active = b === button;
        b.classList.toggle("active", active);
        b.setAttribute("aria-selected", active);
      });
      document.querySelectorAll(`[data-${panelAttr}]`).forEach((panel) => {
        panel.hidden = panel.getAttribute(`data-${panelAttr}`) !== key;
      });
    });
  });
}

setupSwitcher(".stay-btn", "stay", "stay-panel");
setupSwitcher(".tab", "tab", "tab-panel");

// Photo pile: clicking a photo brings it to the top of the heap
const photoPile = document.getElementById("photoPile");
if (photoPile) {
  let topZ = photoPile.children.length;
  [...photoPile.children].forEach((photo, i) => {
    photo.style.zIndex = i + 1;
    photo.tabIndex = 0;
    const bringToTop = () => {
      topZ += 1;
      photo.style.zIndex = topZ;
    };
    photo.addEventListener("click", bringToTop);
    photo.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        bringToTop();
      }
    });
  });
}

// Venue photo wall: click a tile to view it full screen
const venueWall = document.getElementById("venueWall");
const lightbox = document.getElementById("lightbox");
if (venueWall && lightbox && typeof lightbox.showModal === "function") {
  const tiles = [...venueWall.querySelectorAll(".wall-tile")];
  const lbImg = lightbox.querySelector("img");
  const lbCaption = lightbox.querySelector("figcaption");
  let current = 0;

  const show = (index) => {
    current = (index + tiles.length) % tiles.length;
    const img = tiles[current].querySelector("img");
    lbImg.src = img.src;
    lbImg.alt = img.alt;
    lbCaption.innerHTML = tiles[current].querySelector("figcaption").innerHTML;
  };

  tiles.forEach((tile, i) => {
    tile.tabIndex = 0;
    tile.setAttribute("role", "button");
    const open = () => {
      show(i);
      lightbox.showModal();
    };
    tile.addEventListener("click", open);
    tile.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        open();
      }
    });
  });

  lightbox.querySelector(".lightbox-prev").addEventListener("click", () => show(current - 1));
  lightbox.querySelector(".lightbox-next").addEventListener("click", () => show(current + 1));
  lightbox.querySelector(".lightbox-close").addEventListener("click", () => lightbox.close());
  // clicking the dark background (not the photo or buttons) closes it
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) lightbox.close();
  });
  lightbox.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") show(current - 1);
    if (event.key === "ArrowRight") show(current + 1);
  });
}
