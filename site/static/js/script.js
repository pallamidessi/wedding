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

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (event) => {
    const href = anchor.getAttribute("href");
    if (!href || href === "#") {
      return;
    }
    const target = document.querySelector(href);
    if (!target) {
      return;
    }
    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

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
