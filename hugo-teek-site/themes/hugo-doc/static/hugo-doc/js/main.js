document.addEventListener("DOMContentLoaded", function () {
  initNavigation();
  initMobileMenu();
  initActiveSection();
  initScrollAnimations();
  initSkillProgress();
  initDocsFilter();
  initBackToTop();
  initSmoothScroll();
  initBannerBackground();
});

function initNavigation() {
  const navbar = document.getElementById("navbar");
  if (!navbar) {
    return;
  }

  const onScroll = throttle(function () {
    navbar.classList.toggle("scrolled", window.scrollY > 50);
  }, 100);

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

function initMobileMenu() {
  const menuBtn = document.getElementById("mobileMenuBtn");
  const mobileMenu = document.getElementById("mobileMenu");

  if (!menuBtn || !mobileMenu) {
    return;
  }

  menuBtn.addEventListener("click", function () {
    menuBtn.classList.toggle("active");
    mobileMenu.classList.toggle("active");
  });

  mobileMenu.querySelectorAll(".mobile-nav-link").forEach(function (link) {
    link.addEventListener("click", function () {
      menuBtn.classList.remove("active");
      mobileMenu.classList.remove("active");
    });
  });
}

function initActiveSection() {
  const navLinks = Array.from(document.querySelectorAll(".nav-link[href^='#']"));
  if (!navLinks.length) {
    return;
  }

  const linkMap = new Map();
  navLinks.forEach(function (link) {
    const href = link.getAttribute("href");
    if (!href || href === "#") {
      return;
    }
    if (!linkMap.has(href)) {
      linkMap.set(href, []);
    }
    linkMap.get(href).push(link);
  });

  const sections = Array.from(linkMap.keys())
    .map(function (href) {
      return document.querySelector(href);
    })
    .filter(Boolean);

  if (!sections.length) {
    return;
  }

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) {
          return;
        }

        document.querySelectorAll(".nav-link").forEach(function (link) {
          link.classList.remove("active");
        });

        const href = "#" + entry.target.id;
        const targets = linkMap.get(href) || [];
        targets.forEach(function (link) {
          link.classList.add("active");
        });
      });
    },
    {
      threshold: 0.45,
      rootMargin: "-18% 0px -50% 0px",
    }
  );

  sections.forEach(function (section) {
    observer.observe(section);
  });
}

function initScrollAnimations() {
  const revealElements = document.querySelectorAll(".reveal");
  if (!revealElements.length) {
    return;
  }

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: "0px 0px -40px 0px",
    }
  );

  revealElements.forEach(function (element) {
    observer.observe(element);
  });
}

function initSkillProgress() {
  const progressBars = document.querySelectorAll(".skill-progress");
  if (!progressBars.length) {
    return;
  }

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) {
          return;
        }

        const progress = entry.target.dataset.progress;
        if (progress) {
          window.setTimeout(function () {
            entry.target.style.setProperty("--progress", progress + "%");
            entry.target.classList.add("animated");
          }, 150);
        }

        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.45,
    }
  );

  progressBars.forEach(function (bar) {
    observer.observe(bar);
  });
}

function initDocsFilter() {
  const filterButtons = document.querySelectorAll(".filter-btn");
  const cards = document.querySelectorAll(".doc-card[data-category]");

  if (!filterButtons.length || !cards.length) {
    return;
  }

  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const filter = button.dataset.filter || "all";

      filterButtons.forEach(function (target) {
        target.classList.remove("active");
      });
      button.classList.add("active");

      cards.forEach(function (card) {
        const matched = filter === "all" || card.dataset.category === filter;
        if (matched) {
          card.classList.remove("hidden");
          requestAnimationFrame(function () {
            card.style.opacity = "1";
            card.style.transform = "translateY(0)";
          });
        } else {
          card.style.opacity = "0";
          card.style.transform = "translateY(16px)";
          window.setTimeout(function () {
            card.classList.add("hidden");
          }, 220);
        }
      });
    });
  });
}

function initBackToTop() {
  const button = document.getElementById("backToTop");
  if (!button) {
    return;
  }

  const onScroll = throttle(function () {
    button.classList.toggle("visible", window.scrollY > 480);
  }, 100);

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  button.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

function initSmoothScroll() {
  document.addEventListener("click", function (event) {
    const link = event.target.closest("a[href^='#']");
    if (!link) {
      return;
    }

    const targetId = link.getAttribute("href");
    if (!targetId || targetId === "#") {
      return;
    }

    const target = document.querySelector(targetId);
    if (!target) {
      return;
    }

    event.preventDefault();
    const navHeight = document.querySelector(".nav-section")?.offsetHeight || 0;
    const targetPosition = target.offsetTop - navHeight - 16;

    window.scrollTo({
      top: targetPosition,
      behavior: "smooth",
    });
  });
}

function initBannerBackground() {
  const bgImg = document.getElementById("bannerBgImg");
  if (!bgImg) {
    return;
  }

  const baseUrl = bgImg.dataset.baseUrl || bgImg.getAttribute("src");
  if (!baseUrl) {
    return;
  }

  let finalUrl = baseUrl;
  if (bgImg.dataset.cacheBust !== "false" && /^https?:\/\//.test(baseUrl)) {
    finalUrl += (baseUrl.includes("?") ? "&" : "?") + "t=" + Date.now();
  }

  const tempImg = new Image();
  tempImg.onload = function () {
    bgImg.src = finalUrl;
    bgImg.style.opacity = "1";
  };
  tempImg.onerror = function () {
    bgImg.style.opacity = "0";
  };
  tempImg.src = finalUrl;
}

function throttle(fn, wait) {
  let timer = null;

  return function (...args) {
    if (timer) {
      return;
    }

    fn.apply(this, args);
    timer = window.setTimeout(function () {
      timer = null;
    }, wait);
  };
}
