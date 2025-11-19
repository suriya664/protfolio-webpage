document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;

  /**
   * Sticky navigation
   */
  const nav = document.querySelector(".navbar");
  const stickyToggle = () => {
    if (!nav) return;
    if (window.scrollY > 40) {
      nav.classList.add("sticky");
    } else {
      nav.classList.remove("sticky");
    }
  };
  stickyToggle();
  window.addEventListener("scroll", stickyToggle, { passive: true });

  /**
   * Smooth scrolling for nav links
   */
  document.querySelectorAll("a[href^='#']").forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");
      if (!targetId || targetId === "#") return;
      const section = document.querySelector(targetId);
      if (!section) return;
      event.preventDefault();
      const offsetTop =
        section.getBoundingClientRect().top + window.scrollY - (nav?.offsetHeight ?? 72);
      window.scrollTo({ top: offsetTop, behavior: "smooth" });
    });
  });

  /**
   * Scroll reveal animation
   */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 }
  );
  document.querySelectorAll(".reveal-on-scroll").forEach((el) => revealObserver.observe(el));

  /**
   * Typed roles initialization
   */
  const typedElement = document.querySelector("[data-typed-roles]");
  if (typedElement) {
    const roles = typedElement.getAttribute("data-typed-roles");
    const parsedRoles = roles ? roles.split("|").map((role) => role.trim()) : [];
    const initTyped = () => {
      if (window.Typed && parsedRoles.length) {
        new window.Typed(typedElement, {
          strings: parsedRoles,
          loop: true,
          typeSpeed: 80,
          backSpeed: 32,
          backDelay: 2000,
        });
      } else if (parsedRoles.length) {
        let index = 0;
        let charIndex = 0;
        let direction = 1;
        const tick = () => {
          const current = parsedRoles[index];
          typedElement.textContent = current.slice(0, charIndex);
          if (direction === 1) {
            charIndex++;
            if (charIndex > current.length + 12) {
              direction = -1;
              charIndex = current.length;
            }
          } else {
            charIndex--;
            if (charIndex <= 0) {
              direction = 1;
              charIndex = 0;
              index = (index + 1) % parsedRoles.length;
            }
          }
        };
        setInterval(tick, 120);
      }
    };
    setTimeout(initTyped, 400);
  }

  /**
   * Counter animation
   */
  const counters = document.querySelectorAll("[data-count]");
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.getAttribute("data-count") ?? "0", 10);
          const suffix = el.getAttribute("data-suffix") ?? "";
          const duration = 1600;
          const start = performance.now();
          const step = (time) => {
            const progress = Math.min((time - start) / duration, 1);
            const value = Math.floor(progress * target).toLocaleString();
            el.textContent = `${value}${suffix}`;
            if (progress < 1) {
              requestAnimationFrame(step);
            }
          };
          requestAnimationFrame(step);
          counterObserver.unobserve(el);
        }
      });
    },
    { threshold: 0.4 }
  );
  counters.forEach((el) => counterObserver.observe(el));

  /**
   * Progress bars animation
   */
  const progressBars = document.querySelectorAll(".progress-bar[data-value]");
  const progressObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const bar = entry.target;
          const value = bar.getAttribute("data-value") || "0";
          bar.style.width = value;
          progressObserver.unobserve(bar);
        }
      });
    },
    { threshold: 0.3 }
  );
  progressBars.forEach((bar) => progressObserver.observe(bar));

  /**
   * Portfolio filters (Isotope fallback)
   */
  const gridElement = document.querySelector(".portfolio-grid");
  const filterButtons = document.querySelectorAll(".portfolio-filter button[data-filter]");
  if (gridElement && filterButtons.length) {
    const onFilterClick = (filter) => {
      filterButtons.forEach((btn) => btn.classList.toggle("active", btn.dataset.filter === filter));
    };

    const applyFallbackFilter = (filter) => {
      const filterValue = filter === "*" ? null : filter;
      gridElement.querySelectorAll(".portfolio-item").forEach((item) => {
        const category = item.getAttribute("data-category");
        const match = !filterValue || category === filterValue;
        item.classList.toggle("is-filtered", !match);
      });
    };

    const setupIsotope = () => {
      if (window.Isotope) {
        const iso = new window.Isotope(gridElement, {
          itemSelector: ".portfolio-item",
          layoutMode: gridElement.classList.contains("masonry-enabled") ? "masonry" : "fitRows",
          percentPosition: true,
          masonry: {
            columnWidth: ".portfolio-item",
          },
        });
        filterButtons.forEach((btn) => {
          btn.addEventListener("click", () => {
            const filterValue = btn.dataset.filter ?? "*";
            iso.arrange({ filter: filterValue });
            onFilterClick(filterValue);
          });
        });
      } else {
        filterButtons.forEach((btn) => {
          btn.addEventListener("click", () => {
            const filterValue = btn.dataset.filter ?? "*";
            onFilterClick(filterValue);
            applyFallbackFilter(filterValue);
          });
        });
        applyFallbackFilter("*");
      }
    };

    setTimeout(setupIsotope, 500);
  }

  /**
   * Lightbox setup
   */
  const setupLightbox = () => {
    if (window.GLightbox) {
      window.GLightbox({ selector: "[data-gallery='portfolio']" });
    }
  };
  setTimeout(setupLightbox, 600);

  /**
   * Lazy load fallback
   */
  if ("loading" in HTMLImageElement.prototype === false) {
    document.querySelectorAll("img[loading='lazy']").forEach((img) => {
      const src = img.dataset.src;
      if (src) img.src = src;
    });
  }

  /**
   * Contact form validation (client-side, non-blocking)
   */
  const contactForm = document.querySelector("#contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", (event) => {
      const form = event.target;
      const requiredFields = form.querySelectorAll("[data-required]");
      const feedback = form.querySelector(".form-feedback");
      let isValid = true;

      requiredFields.forEach((input) => {
        if (!input.value.trim()) {
          input.classList.add("is-invalid");
          isValid = false;
        } else {
          input.classList.remove("is-invalid");
        }
      });

      if (!isValid) {
        event.preventDefault();
        feedback && (feedback.textContent = "Please fill out the required fields.");
        feedback?.classList.add("text-danger");
      } else {
        feedback && (feedback.textContent = "Message ready to be sent (form action not configured).");
        feedback?.classList.remove("text-danger");
        feedback?.classList.add("text-success");
      }
    });
  }

  /**
   * Theme switcher binding
   */
  const updateThemeToggleLabels = (theme) => {
    document.querySelectorAll("[data-toggle-theme]").forEach((toggle) => {
      const label = toggle.querySelector("span");
      if (label) {
        label.textContent = theme === "dark" ? "Light mode" : "Dark mode";
      }
    });
  };

  const preferredTheme = localStorage.getItem("preferredTheme");
  if (preferredTheme) {
    body.setAttribute("data-theme", preferredTheme);
    updateThemeToggleLabels(preferredTheme);
  }

  document.querySelectorAll("[data-toggle-theme]").forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const nextTheme = body.getAttribute("data-theme") === "dark" ? "light" : "dark";
      body.setAttribute("data-theme", nextTheme);
      localStorage.setItem("preferredTheme", nextTheme);
      updateThemeToggleLabels(nextTheme);
    });
  });

  /**
   * Admin sidebar toggle
   */
  const adminSidebar = document.querySelector(".admin-sidebar");
  const adminToggle = document.querySelector("[data-admin-toggle]");
  if (adminSidebar && adminToggle) {
    adminToggle.addEventListener("click", () => {
      adminSidebar.classList.toggle("is-open");
    });
  }
});

