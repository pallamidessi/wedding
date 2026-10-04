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
