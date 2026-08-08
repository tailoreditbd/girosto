(function () {
  "use strict";

  const header = document.getElementById("siteHeader");
  const updateHeader = () => header?.classList.toggle("scrolled", window.scrollY > 32);
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  const carousel = document.getElementById("heroCarousel");
  const backgrounds = [...document.querySelectorAll(".girosto-hero .hero-background")];
  if (!carousel || !backgrounds.length) return;

  const slides = [...carousel.querySelectorAll(".carousel-item")];
  const activateBackground = slide => {
    const index = Math.max(0, slides.indexOf(slide));
    backgrounds.forEach((background, position) => {
      background.classList.toggle("active", position === index);
    });
  };

  activateBackground(carousel.querySelector(".carousel-item.active"));
  carousel.addEventListener("slide.bs.carousel", event => activateBackground(event.relatedTarget));
})();
