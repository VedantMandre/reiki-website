/* =============================================================
   Suved Healing — Healing from Within
   Experience layer: preloader, Lenis smooth scroll, GSAP +
   ScrollTrigger + SplitText animations, Three.js energy field,
   custom cursor, magnetic buttons, 3D tilt cards.

   Everything degrades gracefully: content is fully visible and
   the site fully functional if the CDN libraries fail to load
   or the visitor prefers reduced motion.
   ============================================================= */

(function () {
  "use strict";

  /* ---------- Google Analytics 4 ----------
     Config lives here (not inline in index.html) so the script-src
     CSP doesn't need 'unsafe-inline'. TODO: the loader tag in
     index.html still has the placeholder ID G-XXXXXXXXXX; replace it
     there once a real GA4 property exists. */
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  gtag("js", new Date());
  gtag("config", "G-XXXXXXXXXX");

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var hasGsap = typeof window.gsap !== "undefined";
  var hasScrollTrigger = hasGsap && typeof window.ScrollTrigger !== "undefined";
  var hasSplitText = hasGsap && typeof window.SplitText !== "undefined";
  var hasLenis = typeof window.Lenis !== "undefined";
  var hasThree = typeof window.THREE !== "undefined";

  if (hasScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  if (hasSplitText) gsap.registerPlugin(SplitText);

  /* SplitText measures line breaks, so it must wait for web fonts */
  var fontsReady = (document.fonts && document.fonts.ready)
    ? document.fonts.ready
    : Promise.resolve();

  /* =====================================================
     Smooth scrolling (Lenis) synced with ScrollTrigger
     ===================================================== */
  var lenis = null;
  if (hasLenis && hasGsap && !reducedMotion) {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    lenis.on("scroll", function () {
      if (hasScrollTrigger) ScrollTrigger.update();
    });
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  function scrollToTarget(hash) {
    var target = document.querySelector(hash);
    if (!target) return;
    if (lenis) {
      lenis.scrollTo(target, { offset: -20, duration: 1.4 });
    } else {
      target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
    }
  }

  document.addEventListener("click", function (e) {
    var link = e.target.closest('a[href^="#"]');
    if (!link) return;
    var hash = link.getAttribute("href");
    if (hash.length < 2) return;
    e.preventDefault();
    scrollToTarget(hash);
    if (history.pushState) history.pushState(null, "", hash);
  });

  /* =====================================================
     Preloader
     ===================================================== */
  var preloader = document.getElementById("preloader");
  var heroIntroPlayed = false;

  function playHeroIntro() {
    if (heroIntroPlayed || !hasGsap || reducedMotion) return;
    heroIntroPlayed = true;

    var tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.from(".nav__inner", { y: -30, autoAlpha: 0, duration: 0.8 }, 0);
    tl.from(".hero__eyebrow", { y: 24, autoAlpha: 0, duration: 0.7 }, 0.1);

    var titleLines = document.querySelectorAll(".hero__title-line");
    if (hasSplitText && titleLines.length) {
      try {
        var split = new SplitText(titleLines[0], { type: "chars" });
        tl.from(split.chars, {
          yPercent: 110,
          autoAlpha: 0,
          rotateX: -45,
          stagger: 0.035,
          duration: 0.9
        }, 0.2);
      } catch (err) {
        tl.from(titleLines[0], { y: 60, autoAlpha: 0, duration: 0.9 }, 0.2);
      }
      tl.from(titleLines[1], { y: 70, autoAlpha: 0, duration: 1 }, 0.55);
    } else {
      tl.from(titleLines, { y: 60, autoAlpha: 0, stagger: 0.15, duration: 0.9 }, 0.2);
    }

    tl.from(".hero__devanagari", { y: 20, autoAlpha: 0, duration: 0.7 }, 0.85);
    tl.from(".hero__lead", { y: 26, autoAlpha: 0, duration: 0.8 }, 0.95);
    tl.from(".hero__actions .btn", { y: 24, autoAlpha: 0, stagger: 0.12, duration: 0.7 }, 1.05);
    tl.from(".hero__stats li", { y: 24, autoAlpha: 0, stagger: 0.12, duration: 0.7 }, 1.15);
    tl.from(".hero__visual", { scale: 0.86, autoAlpha: 0, duration: 1.4, ease: "power2.out" }, 0.6);
    tl.from(".hero__scroll", { autoAlpha: 0, duration: 0.8 }, 1.5);
  }

  if (preloader) {
    if (!hasGsap || reducedMotion) {
      preloader.classList.add("is-done");
      playHeroIntro();
    } else {
      var countEl = document.getElementById("preloaderCount");
      var counter = { value: 0 };
      var loadTl = gsap.timeline({
        onComplete: function () {
          gsap.to(preloader, {
            yPercent: -100,
            duration: 0.9,
            ease: "power4.inOut",
            onStart: function () { fontsReady.then(playHeroIntro); },
            onComplete: function () { preloader.classList.add("is-done"); }
          });
        }
      });

      loadTl.from(".preloader__word span", {
        y: 36,
        autoAlpha: 0,
        stagger: 0.07,
        duration: 0.6,
        ease: "power3.out"
      }, 0);
      loadTl.from(".preloader__sub", { autoAlpha: 0, y: 12, duration: 0.5 }, 0.4);
      loadTl.to(counter, {
        value: 100,
        duration: 1.6,
        ease: "power2.inOut",
        onUpdate: function () {
          if (countEl) countEl.textContent = Math.round(counter.value);
        }
      }, 0.1);
    }
  } else {
    playHeroIntro();
  }

  /* =====================================================
     Custom cursor
     ===================================================== */
  if (hasGsap && finePointer && !reducedMotion) {
    var cursorDot = document.getElementById("cursor");
    var cursorRing = document.getElementById("cursorRing");
    if (cursorDot && cursorRing) {
      document.body.classList.add("has-cursor");

      var dotX = gsap.quickTo(cursorDot, "x", { duration: 0.08, ease: "power2.out" });
      var dotY = gsap.quickTo(cursorDot, "y", { duration: 0.08, ease: "power2.out" });
      var ringX = gsap.quickTo(cursorRing, "x", { duration: 0.35, ease: "power3.out" });
      var ringY = gsap.quickTo(cursorRing, "y", { duration: 0.35, ease: "power3.out" });

      window.addEventListener("mousemove", function (e) {
        dotX(e.clientX); dotY(e.clientY);
        ringX(e.clientX); ringY(e.clientY);
      }, { passive: true });

      document.addEventListener("mouseover", function (e) {
        if (e.target.closest("a, button, [data-cursor], [data-tilt]")) {
          cursorRing.classList.add("is-hover");
        }
      });
      document.addEventListener("mouseout", function (e) {
        if (e.target.closest("a, button, [data-cursor], [data-tilt]")) {
          cursorRing.classList.remove("is-hover");
        }
      });
    }
  }

  /* =====================================================
     Navigation
     ===================================================== */
  var nav = document.getElementById("nav");
  var navToggle = document.getElementById("navToggle");
  var navLinks = document.getElementById("navLinks");

  function onScroll() {
    nav.classList.toggle("is-scrolled", window.scrollY > 40);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  function closeMenu() {
    navLinks.classList.remove("is-open");
    navToggle.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    if (lenis) lenis.start();
  }

  navToggle.addEventListener("click", function () {
    var open = navLinks.classList.toggle("is-open");
    navToggle.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
    if (lenis) { if (open) { lenis.stop(); } else { lenis.start(); } }
    if (open && hasGsap && !reducedMotion) {
      gsap.fromTo(".nav__links .nav__link, .nav__links .nav__cta",
        { y: 30, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, stagger: 0.06, duration: 0.5, ease: "power3.out", delay: 0.2, clearProps: "all" });
    }
  });

  navLinks.addEventListener("click", function (e) {
    if (e.target.closest("a")) closeMenu();
  });

  /* Active nav link highlighting while scrolling */
  var sections = document.querySelectorAll("main section[id]");
  var linkMap = {};
  document.querySelectorAll(".nav__link").forEach(function (link) {
    linkMap[link.getAttribute("href").slice(1)] = link;
  });

  if ("IntersectionObserver" in window) {
    var sectionObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && linkMap[entry.target.id]) {
            document.querySelectorAll(".nav__link.is-active").forEach(function (l) {
              l.classList.remove("is-active");
            });
            linkMap[entry.target.id].classList.add("is-active");
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    sections.forEach(function (s) { sectionObserver.observe(s); });
  }

  /* =====================================================
     Marquee — duplicate the track for a seamless loop
     ===================================================== */
  var marqueeTrack = document.getElementById("marqueeTrack");
  if (marqueeTrack) marqueeTrack.innerHTML += marqueeTrack.innerHTML;

  /* =====================================================
     Scroll-driven animations (GSAP + ScrollTrigger)
     ===================================================== */
  if (hasScrollTrigger && !reducedMotion) {

    /* Generic reveals */
    document.querySelectorAll("[data-reveal]").forEach(function (el) {
      var dir = el.getAttribute("data-reveal");
      var fromVars = { autoAlpha: 0, duration: 1, ease: "power3.out" };
      if (dir === "left") fromVars.x = -60;
      else if (dir === "right") fromVars.x = 60;
      else if (dir === "scale") fromVars.scale = 0.9;
      else fromVars.y = 50;

      fromVars.scrollTrigger = { trigger: el, start: "top 86%", once: true };
      gsap.from(el, fromVars);
    });

    /* Staggered children */
    document.querySelectorAll("[data-stagger]").forEach(function (el) {
      gsap.from(el.children, {
        y: 44,
        autoAlpha: 0,
        duration: 0.9,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 84%", once: true }
      });
    });

    /* Masked line reveals on headings and the quote (after fonts load,
       so SplitText measures the real line breaks) */
    fontsReady.then(function () { initSplitReveals(); ScrollTrigger.refresh(); });
    function initSplitReveals() {
    document.querySelectorAll("[data-split]").forEach(function (el) {
      var animated = false;
      if (hasSplitText) {
        try {
          var split = new SplitText(el, { type: "lines", linesClass: "split-line" });
          split.lines.forEach(function (line) {
            var mask = document.createElement("span");
            mask.className = "split-line-mask";
            line.parentNode.insertBefore(mask, line);
            mask.appendChild(line);
          });
          gsap.from(split.lines, {
            yPercent: 110,
            duration: 1.1,
            stagger: 0.1,
            ease: "power4.out",
            scrollTrigger: { trigger: el, start: "top 86%", once: true }
          });
          animated = true;
        } catch (err) { /* fall through to simple reveal */ }
      }
      if (!animated) {
        gsap.from(el, {
          y: 50,
          autoAlpha: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 86%", once: true }
        });
      }
    });
    }

    /* Stat counters */
    document.querySelectorAll("[data-count]").forEach(function (el) {
      var target = parseFloat(el.getAttribute("data-count"));
      var suffix = el.getAttribute("data-suffix") || "";
      var obj = { value: 0 };
      gsap.to(obj, {
        value: target,
        duration: 2,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 92%", once: true },
        onUpdate: function () {
          el.textContent = Math.round(obj.value).toLocaleString("en-IN") + suffix;
        }
      });
    });

    /* Soft parallax drift on decorated elements */
    document.querySelectorAll("[data-parallax]").forEach(function (el) {
      var speed = parseFloat(el.getAttribute("data-parallax")) || 0.1;
      gsap.to(el, {
        y: function () { return speed * 320; },
        ease: "none",
        scrollTrigger: {
          trigger: el.closest("section") || el,
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      });
    });

    /* Journey progress line draws as the steps scroll through */
    var journeyTimeline = document.querySelector(".journey__timeline");
    if (journeyTimeline) {
      gsap.to(journeyTimeline, {
        "--journey-progress": 1,
        ease: "none",
        scrollTrigger: {
          trigger: journeyTimeline,
          start: "top 75%",
          end: "bottom 45%",
          scrub: 0.6
        }
      });
    }
  }

  /* =====================================================
     3D tilt cards + glow tracking
     ===================================================== */
  if (hasGsap && finePointer && !reducedMotion) {
    document.querySelectorAll("[data-tilt]").forEach(function (el) {
      var bounds = null;
      var rx = gsap.quickTo(el, "rotationX", { duration: 0.5, ease: "power3.out" });
      var ry = gsap.quickTo(el, "rotationY", { duration: 0.5, ease: "power3.out" });

      el.addEventListener("mouseenter", function () {
        bounds = el.getBoundingClientRect();
        gsap.set(el, { transformPerspective: 900 });
      });

      el.addEventListener("mousemove", function (e) {
        if (!bounds) bounds = el.getBoundingClientRect();
        var px = (e.clientX - bounds.left) / bounds.width;
        var py = (e.clientY - bounds.top) / bounds.height;
        rx((0.5 - py) * 10);
        ry((px - 0.5) * 10);
        el.style.setProperty("--glow-x", (px * 100) + "%");
        el.style.setProperty("--glow-y", (py * 100) + "%");
      });

      el.addEventListener("mouseleave", function () {
        bounds = null;
        rx(0);
        ry(0);
      });
    });

    /* Magnetic buttons */
    document.querySelectorAll("[data-magnetic]").forEach(function (el) {
      var mx = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3.out" });
      var my = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3.out" });

      el.addEventListener("mousemove", function (e) {
        var b = el.getBoundingClientRect();
        mx((e.clientX - (b.left + b.width / 2)) * 0.3);
        my((e.clientY - (b.top + b.height / 2)) * 0.3);
      });
      el.addEventListener("mouseleave", function () {
        mx(0);
        my(0);
      });
    });
  }

  /* =====================================================
     Three.js — hero "energy field" particles
     ===================================================== */
  (function initEnergyField() {
    var canvas = document.getElementById("energyCanvas");
    if (!canvas || !hasThree || reducedMotion) return;

    var hero = document.querySelector(".hero");
    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    } catch (err) {
      canvas.style.display = "none";
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
    camera.position.z = 14;

    /* Soft round sprite drawn on a small canvas (keeps CSP img-src happy: data/self only used internally) */
    var spriteCanvas = document.createElement("canvas");
    spriteCanvas.width = spriteCanvas.height = 64;
    var ctx = spriteCanvas.getContext("2d");
    var grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, "rgba(255,255,255,1)");
    grad.addColorStop(0.4, "rgba(255,255,255,0.5)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    var sprite = new THREE.CanvasTexture(spriteCanvas);

    var isMobile = window.innerWidth < 768;
    var COUNT = isMobile ? 420 : 1100;
    var SPREAD_X = 26, SPREAD_Y = 16, SPREAD_Z = 10;

    var palette = [
      new THREE.Color("#d4a94f"), /* gold */
      new THREE.Color("#9d6fc4"), /* violet */
      new THREE.Color("#c9b2e4"), /* lilac */
      new THREE.Color("#aab98c")  /* sage */
    ];

    var positions = new Float32Array(COUNT * 3);
    var colors = new Float32Array(COUNT * 3);
    var drift = new Float32Array(COUNT * 2); /* per-particle speed + phase */

    for (var i = 0; i < COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * SPREAD_X;
      positions[i * 3 + 1] = (Math.random() - 0.5) * SPREAD_Y;
      positions[i * 3 + 2] = (Math.random() - 0.5) * SPREAD_Z;
      var c = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
      drift[i * 2] = 0.12 + Math.random() * 0.5;       /* rise speed */
      drift[i * 2 + 1] = Math.random() * Math.PI * 2;  /* sway phase */
    }

    var geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    var material = new THREE.PointsMaterial({
      size: isMobile ? 0.22 : 0.18,
      map: sprite,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    var points = new THREE.Points(geometry, material);
    scene.add(points);

    var mouseX = 0, mouseY = 0;
    if (finePointer) {
      window.addEventListener("mousemove", function (e) {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
      }, { passive: true });
    }

    function resize() {
      var w = hero.clientWidth;
      var h = hero.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    window.addEventListener("resize", resize);
    resize();

    var visible = true;
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
      }).observe(hero);
    }

    var clock = new THREE.Clock();
    function tick() {
      requestAnimationFrame(tick);
      if (!visible || document.hidden) return;

      var t = clock.getElapsedTime();
      var pos = geometry.attributes.position.array;

      for (var i = 0; i < COUNT; i++) {
        var speed = drift[i * 2];
        var phase = drift[i * 2 + 1];
        pos[i * 3 + 1] += speed * 0.008;                      /* gentle rise */
        pos[i * 3] += Math.sin(t * 0.4 + phase) * 0.0016;     /* soft sway */
        if (pos[i * 3 + 1] > SPREAD_Y / 2) pos[i * 3 + 1] = -SPREAD_Y / 2;
      }
      geometry.attributes.position.needsUpdate = true;

      points.rotation.y = t * 0.02;
      camera.position.x += (mouseX * 1.4 - camera.position.x) * 0.03;
      camera.position.y += (-mouseY * 0.9 - camera.position.y) * 0.03;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    }
    tick();
  })();

  /* =====================================================
     Contact form — submitted via FormSubmit's AJAX endpoint
     ===================================================== */
  var form = document.getElementById("contactForm");
  var note = document.getElementById("formNote");
  var submitBtn = form.querySelector("button[type='submit']");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    if (!form.checkValidity()) {
      note.textContent = "Please fill in your name, email, and message.";
      return;
    }

    var name = form.elements.name.value.trim();
    var endpoint = "https://formsubmit.co/ajax/sujata.mandre@gmail.com";

    submitBtn.disabled = true;
    note.textContent = "Sending your message…";

    fetch(endpoint, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: new FormData(form),
    })
      .then(function (response) {
        if (!response.ok) throw new Error("Request failed");
        return response.json();
      })
      .then(function () {
        note.textContent = "Thank you, " + name + " — your message has been sent. Sujata will be in touch soon. ✦";
        gtag("event", "form_submit_success", { event_category: "contact", event_label: "contact_form" });
        form.reset();
      })
      .catch(function () {
        note.textContent = "Something went wrong. Please email sujata.mandre@gmail.com directly or try again.";
      })
      .finally(function () {
        submitBtn.disabled = false;
      });
  });

  /* WhatsApp button click tracking */
  var whatsappFab = document.querySelector(".whatsapp-fab");
  if (whatsappFab) {
    whatsappFab.addEventListener("click", function () {
      gtag("event", "whatsapp_click", { event_category: "engagement", event_label: "floating_button" });
    });
  }

  /* Footer year */
  document.getElementById("year").textContent = new Date().getFullYear();
})();
