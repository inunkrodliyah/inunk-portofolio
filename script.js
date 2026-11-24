/* ==========================================================================
   Inunk Rodliyah — Portfolio interactions
   Vanilla JavaScript, no dependencies.
   ========================================================================== */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Theme ---------- */
  var themeToggle = document.getElementById("theme-toggle");
  var themeColorMeta = document.querySelector('meta[name="theme-color"]');

  function applyTheme(theme) {
    root.dataset.theme = theme;

    if (themeToggle) {
      var isDark = theme === "dark";
      themeToggle.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
      themeToggle.setAttribute("title", isDark ? "Switch to light theme" : "Switch to dark theme");
    }

    if (themeColorMeta) {
      themeColorMeta.setAttribute("content", theme === "dark" ? "#060d18" : "#f6f8fc");
    }
  }

  applyTheme(root.dataset.theme || "light");

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
      applyTheme(nextTheme);

      try {
        localStorage.setItem("inunk-theme", nextTheme);
      } catch (error) {
        /* Storage may be unavailable; the theme still applies for this visit. */
      }
    });
  }

  /* ---------- Mobile navigation ---------- */
  var navToggle = document.getElementById("nav-toggle");
  var mobileNav = document.getElementById("mobile-nav");

  if (navToggle && mobileNav) {
    var setMenuOpen = function (open) {
      mobileNav.classList.toggle("is-open", open);
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      document.body.classList.toggle("nav-open", open);
    };

    navToggle.addEventListener("click", function () {
      setMenuOpen(!mobileNav.classList.contains("is-open"));
    });

    mobileNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        setMenuOpen(false);
      });
    });

    document.addEventListener("click", function (event) {
      if (!mobileNav.classList.contains("is-open")) return;
      if (!mobileNav.contains(event.target) && !navToggle.contains(event.target)) {
        setMenuOpen(false);
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") setMenuOpen(false);
    });

    var desktopQuery = window.matchMedia("(min-width: 941px)");
    var handleDesktopChange = function (event) {
      if (event.matches) setMenuOpen(false);
    };

    if (typeof desktopQuery.addEventListener === "function") {
      desktopQuery.addEventListener("change", handleDesktopChange);
    } else if (typeof desktopQuery.addListener === "function") {
      desktopQuery.addListener(handleDesktopChange);
    }
  }

  /* ---------- Header state & back to top ---------- */
  var header = document.getElementById("site-header");
  var backToTop = document.getElementById("back-to-top");

  function handleScroll() {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 6);
    if (backToTop) backToTop.classList.toggle("is-visible", window.scrollY > 620);
  }

  handleScroll();
  window.addEventListener("scroll", handleScroll, { passive: true });

  if (backToTop) {
    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  /* ---------- Active section in navigation ---------- */
  var sectionLinks = Array.prototype.slice.call(
    document.querySelectorAll('.nav-link[href^="#"], .mobile-nav-link[href^="#"]')
  );
  var sections = Array.prototype.slice.call(document.querySelectorAll("main section[id]"));

  if (sectionLinks.length && sections.length && "IntersectionObserver" in window) {
    var setActiveSection = function (id) {
      sectionLinks.forEach(function (link) {
        var isActive = link.getAttribute("href") === "#" + id;
        link.classList.toggle("is-active", isActive);
        if (isActive) {
          link.setAttribute("aria-current", "location");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    };

    var sectionObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );

    sections.forEach(function (section) {
      sectionObserver.observe(section);
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealElements = Array.prototype.slice.call(document.querySelectorAll(".reveal"));

  if (revealElements.length) {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      revealElements.forEach(function (element) {
        element.classList.add("is-visible");
      });
    } else {
      var revealObserver = new IntersectionObserver(
        function (entries, observer) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
      );

      revealElements.forEach(function (element) {
        revealObserver.observe(element);
      });
    }
  }

  /* ---------- Project filtering ---------- */
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll(".filter-btn"));
  var projectCards = Array.prototype.slice.call(document.querySelectorAll(".project-card"));
  var projectStatus = document.getElementById("project-status");

  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      var filter = button.dataset.filter;
      var visibleCount = 0;

      filterButtons.forEach(function (otherButton) {
        var active = otherButton === button;
        otherButton.classList.toggle("is-active", active);
        otherButton.setAttribute("aria-pressed", String(active));
      });

      projectCards.forEach(function (card) {
        var show = filter === "all" || card.dataset.category === filter;
        card.classList.toggle("is-hidden", !show);
        if (show) visibleCount += 1;
      });

      if (projectStatus) {
        projectStatus.textContent =
          filter === "all"
            ? "Showing all " + visibleCount + " projects."
            : "Showing " + visibleCount + " projects in " + button.textContent.trim() + ".";
      }
    });
  });

  /* ---------- Copy email ---------- */
  var copyButton = document.getElementById("copy-email");

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }

    return new Promise(function (resolve, reject) {
      var textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.top = "-9999px";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();

      try {
        var copied = document.execCommand("copy");
        document.body.removeChild(textarea);
        copied ? resolve() : reject(new Error("Copy command was rejected."));
      } catch (error) {
        document.body.removeChild(textarea);
        reject(error);
      }
    });
  }

  if (copyButton) {
    var copyLabel = copyButton.querySelector("span");
    var copyIcon = copyButton.querySelector("i");
    var copyResetTimer;

    copyButton.addEventListener("click", function () {
      var email = copyButton.dataset.email;
      if (!email) return;

      copyText(email)
        .then(function () {
          copyButton.classList.add("is-copied");
          if (copyLabel) copyLabel.textContent = "Email copied";
          if (copyIcon) copyIcon.className = "fa-solid fa-check";

          window.clearTimeout(copyResetTimer);
          copyResetTimer = window.setTimeout(function () {
            copyButton.classList.remove("is-copied");
            if (copyLabel) copyLabel.textContent = "Copy email";
            if (copyIcon) copyIcon.className = "fa-regular fa-copy";
          }, 2200);
        })
        .catch(function () {
          if (copyLabel) copyLabel.textContent = "Copy unavailable";
          window.clearTimeout(copyResetTimer);
          copyResetTimer = window.setTimeout(function () {
            if (copyLabel) copyLabel.textContent = "Copy email";
          }, 2200);
        });
    });
  }

  /* ---------- Gallery lightbox ---------- */
  var lightbox = document.getElementById("lightbox");

  if (lightbox && typeof lightbox.showModal === "function") {
    var galleryItems = Array.prototype.slice.call(document.querySelectorAll(".gallery-item"));
    var lightboxImage = document.getElementById("lightbox-img");
    var lightboxCounter = document.getElementById("lightbox-counter");
    var currentPhoto = 0;

    var showPhoto = function (index) {
      if (!galleryItems.length) return;

      currentPhoto = (index + galleryItems.length) % galleryItems.length;
      var item = galleryItems[currentPhoto];
      var thumbnail = item.querySelector("img");

      lightboxImage.src = item.dataset.full || thumbnail.src;
      lightboxImage.alt = thumbnail.alt;
      if (lightboxCounter) {
        lightboxCounter.textContent = currentPhoto + 1 + " / " + galleryItems.length;
      }

      if (!lightbox.open) {
        lightbox.showModal();
        document.body.classList.add("lightbox-open");
      }
    };

    galleryItems.forEach(function (item, index) {
      item.addEventListener("click", function () {
        showPhoto(index);
      });
    });

    var closeLightbox = function () {
      if (lightbox.open) lightbox.close();
    };

    var closeButton = lightbox.querySelector(".lightbox-close");
    var previousButton = lightbox.querySelector("[data-lightbox-prev]");
    var nextButton = lightbox.querySelector("[data-lightbox-next]");

    if (closeButton) closeButton.addEventListener("click", closeLightbox);
    if (previousButton) {
      previousButton.addEventListener("click", function () {
        showPhoto(currentPhoto - 1);
      });
    }
    if (nextButton) {
      nextButton.addEventListener("click", function () {
        showPhoto(currentPhoto + 1);
      });
    }

    lightbox.addEventListener("click", function (event) {
      if (event.target === lightbox) closeLightbox();
    });

    lightbox.addEventListener("close", function () {
      document.body.classList.remove("lightbox-open");
    });

    document.addEventListener("keydown", function (event) {
      if (!lightbox.open) return;
      if (event.key === "ArrowLeft") showPhoto(currentPhoto - 1);
      if (event.key === "ArrowRight") showPhoto(currentPhoto + 1);
    });
  }

  /* ---------- Footer year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (element) {
    element.textContent = String(new Date().getFullYear());
  });
})();
