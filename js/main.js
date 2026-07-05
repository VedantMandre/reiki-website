/* =============================================================
   Suved Healers — Healing from Within
   Experience layer: preloader, Lenis smooth scroll, GSAP +
   ScrollTrigger + SplitText animations, a persistent Three.js
   "cosmos" particle universe that morphs between formations as
   the visitor scrolls between chapters, custom cursor, magnetic
   buttons, 3D tilt cards.

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

    /* clearProps wipes the residual inline transform GSAP leaves behind:
       a transform on .nav__inner would make it the containing block for the
       position:fixed mobile menu, breaking its full-screen overlay. */
    tl.from(".nav__inner", { y: -30, autoAlpha: 0, duration: 0.8, clearProps: "all" }, 0);
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

      /* keep both hidden until the pointer actually moves, so they
         don't sit parked in the top-left corner on load */
      gsap.set([cursorDot, cursorRing], { autoAlpha: 0 });
      var cursorShown = false;

      var dotX = gsap.quickTo(cursorDot, "x", { duration: 0.08, ease: "power2.out" });
      var dotY = gsap.quickTo(cursorDot, "y", { duration: 0.08, ease: "power2.out" });
      var ringX = gsap.quickTo(cursorRing, "x", { duration: 0.18, ease: "power3.out" });
      var ringY = gsap.quickTo(cursorRing, "y", { duration: 0.18, ease: "power3.out" });

      window.addEventListener("mousemove", function (e) {
        if (!cursorShown) {
          cursorShown = true;
          gsap.set([cursorDot, cursorRing], { x: e.clientX, y: e.clientY });
          gsap.to([cursorDot, cursorRing], { autoAlpha: 1, duration: 0.25 });
        }
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

    /* Hero content recedes into the cosmos as the story begins */
    gsap.to(".hero__inner", {
      autoAlpha: 0,
      y: -90,
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom 60%", scrub: 0.4 }
    });
    gsap.to(".hero__scroll", {
      autoAlpha: 0,
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "18% top", scrub: true }
    });
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
     Three.js — the cosmos. One persistent point cloud
     fixed behind every chapter; as the visitor scrolls,
     its particles morph between six formations:

       home         → spiral galaxy
       about        → blooming lotus
       services     → sacred mandala rings
       journey      → ascending double helix
       testimonials → constellation sphere
       contact      → radiant sun with halo

     Morphing runs on the GPU: the vertex shader blends
     between two position/color attribute sets with a uMix
     uniform scrubbed by scroll position. Buffers only get
     rewritten when the scroll crosses into a new segment.
     ===================================================== */
  (function initCosmos() {
    var canvas = document.getElementById("cosmos");
    if (!canvas || !hasThree || reducedMotion) return;

    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: false,
        powerPreference: "high-performance"
      });
    } catch (err) {
      canvas.style.display = "none";
      return;
    }

    var isMobile = window.innerWidth < 768;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(58, 1, 0.1, 120);
    camera.position.z = 17;

    var COUNT = isMobile ? 2800 : 7000;

    /* ---------- formation generators ---------- */
    function gauss() {
      /* approximate normal distribution via central limit */
      return (Math.random() + Math.random() + Math.random() + Math.random() - 2) / 2;
    }

    /* bake a rotation about X into a formation so each shape
       faces the camera at its most readable angle */
    function tiltX(p, b) {
      var s = Math.sin(b), c = Math.cos(b);
      for (var i = 0; i < COUNT; i++) {
        var y = p[i * 3 + 1], z = p[i * 3 + 2];
        p[i * 3 + 1] = y * c - z * s;
        p[i * 3 + 2] = y * s + z * c;
      }
      return p;
    }

    function makeGalaxy() {
      var p = new Float32Array(COUNT * 3);
      var ARMS = 3, R = 11.5;
      for (var i = 0; i < COUNT; i++) {
        var arm = i % ARMS;
        var r = R * Math.pow(Math.random(), 0.65);
        var a = arm * (Math.PI * 2 / ARMS) + r * 0.42 + gauss() * (0.34 - (r / R) * 0.18);
        p[i * 3] = Math.cos(a) * r;
        p[i * 3 + 1] = Math.sin(a) * r;
        p[i * 3 + 2] = gauss() * (1.6 - (r / R) * 1.1);
      }
      return tiltX(p, -1.05);
    }

    function makeLotus() {
      var p = new Float32Array(COUNT * 3);
      var PETALS = 8;
      for (var i = 0; i < COUNT; i++) {
        if (Math.random() < 0.14) {
          /* golden heart at the center */
          var rr = 1.5 * Math.cbrt(Math.random());
          var th = Math.random() * Math.PI * 2;
          var ph = Math.acos(2 * Math.random() - 1);
          p[i * 3] = rr * Math.sin(ph) * Math.cos(th);
          p[i * 3 + 1] = rr * Math.cos(ph) * 0.7 + 0.4;
          p[i * 3 + 2] = rr * Math.sin(ph) * Math.sin(th);
          continue;
        }
        var layer = Math.random() < 0.58 ? 0 : 1;
        var petal = Math.floor(Math.random() * PETALS);
        var len = layer === 0 ? 7.6 : 5.4;
        var u = Math.random();
        var base = petal * (Math.PI * 2 / PETALS) + (layer ? Math.PI / PETALS : 0);
        var width = Math.sin(Math.min(u * 1.2, 1) * Math.PI) * 0.36;
        var ang = base + (Math.random() - 0.5) * width * 2;
        var r = 0.6 + u * len;
        p[i * 3] = Math.cos(ang) * r;
        p[i * 3 + 1] = -2.4 + u * u * (layer ? 2.8 : 4.8) + (Math.random() - 0.5) * 0.25;
        p[i * 3 + 2] = Math.sin(ang) * r;
      }
      return tiltX(p, 0.42);
    }

    function makeMandala() {
      var p = new Float32Array(COUNT * 3);
      for (var i = 0; i < COUNT; i++) {
        var ring = Math.floor(Math.random() * 5);
        var R = 2.2 + ring * 1.85;
        var k = 6 + ring * 3;
        var a = Math.random() * Math.PI * 2;
        var r = R + Math.sin(a * k) * (0.32 + ring * 0.1) + gauss() * 0.12;
        p[i * 3] = Math.cos(a) * r;
        p[i * 3 + 1] = Math.sin(a) * r;
        p[i * 3 + 2] = Math.cos(a * k) * 0.5 + gauss() * 0.2;
      }
      return p;
    }

    function makeHelix() {
      var p = new Float32Array(COUNT * 3);
      var H = 17;
      for (var i = 0; i < COUNT; i++) {
        if (Math.random() < 0.18) {
          /* rising sparkles in the core */
          p[i * 3] = gauss() * 0.7;
          p[i * 3 + 1] = (Math.random() - 0.5) * H;
          p[i * 3 + 2] = gauss() * 0.7;
          continue;
        }
        var strand = Math.random() < 0.5 ? 0 : Math.PI;
        var y = (Math.random() - 0.5) * H;
        var a = y * 0.75 + strand;
        var r = 3.4 + Math.sin(y * 0.35) * 0.5 + gauss() * 0.28;
        p[i * 3] = Math.cos(a) * r;
        p[i * 3 + 1] = y;
        p[i * 3 + 2] = Math.sin(a) * r;
      }
      return p;
    }

    function makeConstellation() {
      var p = new Float32Array(COUNT * 3);
      var CLUSTERS = 7, dirs = [];
      for (var c = 0; c < CLUSTERS; c++) {
        var th = Math.random() * Math.PI * 2;
        var ph = Math.acos(2 * Math.random() - 1);
        dirs.push([Math.sin(ph) * Math.cos(th), Math.cos(ph), Math.sin(ph) * Math.sin(th)]);
      }
      var R = 12.5;
      for (var i = 0; i < COUNT; i++) {
        var th2 = Math.random() * Math.PI * 2;
        var ph2 = Math.acos(2 * Math.random() - 1);
        var v = [Math.sin(ph2) * Math.cos(th2), Math.cos(ph2), Math.sin(ph2) * Math.sin(th2)];
        if (Math.random() < 0.4) {
          /* pull a share of the stars into constellation knots */
          var d = dirs[i % CLUSTERS];
          v = [d[0] + gauss() * 0.16, d[1] + gauss() * 0.16, d[2] + gauss() * 0.16];
          var n = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
          v = [v[0] / n, v[1] / n, v[2] / n];
        }
        var rr = R * (0.9 + Math.random() * 0.2);
        p[i * 3] = v[0] * rr;
        p[i * 3 + 1] = v[1] * rr;
        p[i * 3 + 2] = v[2] * rr;
      }
      return p;
    }

    function makeOrb() {
      var p = new Float32Array(COUNT * 3);
      for (var i = 0; i < COUNT; i++) {
        if (Math.random() < 0.3) {
          /* tilted halo ring */
          var a = Math.random() * Math.PI * 2;
          var r = 6.8 + gauss() * 0.4;
          var x = Math.cos(a) * r;
          var y = Math.sin(a) * r * 0.32;
          var z = gauss() * 0.3;
          p[i * 3] = x;
          p[i * 3 + 1] = y * 0.9 + z;
          p[i * 3 + 2] = -y * 0.4 + z;
          continue;
        }
        var rr = 4.3 * Math.pow(Math.random(), 0.55);
        var th = Math.random() * Math.PI * 2;
        var ph = Math.acos(2 * Math.random() - 1);
        p[i * 3] = rr * Math.sin(ph) * Math.cos(th);
        p[i * 3 + 1] = rr * Math.cos(ph);
        p[i * 3 + 2] = rr * Math.sin(ph) * Math.sin(th);
      }
      return p;
    }

    function makeColors(hexes) {
      var cols = hexes.map(function (h) { return new THREE.Color(h); });
      var arr = new Float32Array(COUNT * 3);
      for (var i = 0; i < COUNT; i++) {
        var c = cols[Math.floor(Math.random() * cols.length)];
        arr[i * 3] = c.r;
        arr[i * 3 + 1] = c.g;
        arr[i * 3 + 2] = c.b;
      }
      return arr;
    }

    /* one formation per chapter, in page order */
    var formations = [
      { pos: makeGalaxy(),        col: makeColors(["#e9c87e", "#9d6fc4", "#c9b2e4", "#fdf6e3"]) },
      { pos: makeLotus(),         col: makeColors(["#e8a7c8", "#c9b2e4", "#e9c87e", "#f7d9ea"]) },
      { pos: makeMandala(),       col: makeColors(["#e9c87e", "#d4a94f", "#c9b2e4", "#aab98c"]) },
      { pos: makeHelix(),         col: makeColors(["#9d6fc4", "#c9b2e4", "#e9c87e", "#ede4fb"]) },
      { pos: makeConstellation(), col: makeColors(["#fdf6e3", "#e9c87e", "#c9b2e4", "#ffffff"]) },
      { pos: makeOrb(),           col: makeColors(["#ffd98a", "#e9c87e", "#d4a94f", "#fff3d6"]) }
    ];

    /* ---------- geometry: two blendable position/color sets ---------- */
    var posA = new Float32Array(formations[0].pos);
    var posB = new Float32Array(formations[1].pos);
    var colA = new Float32Array(formations[0].col);
    var colB = new Float32Array(formations[1].col);
    var sizes = new Float32Array(COUNT);
    var phases = new Float32Array(COUNT);
    for (var i = 0; i < COUNT; i++) {
      sizes[i] = 0.6 + Math.pow(Math.random(), 2.2) * 1.6; /* many faint, few bright */
      phases[i] = Math.random() * Math.PI * 2;
    }

    var geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(posA, 3));
    geometry.setAttribute("aTarget", new THREE.BufferAttribute(posB, 3));
    geometry.setAttribute("aColorA", new THREE.BufferAttribute(colA, 3));
    geometry.setAttribute("aColorB", new THREE.BufferAttribute(colB, 3));
    geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));

    var uniforms = {
      uMix: { value: 0 },
      uTime: { value: 0 },
      uSize: { value: (isMobile ? 34 : 30) * renderer.getPixelRatio() }
    };

    var material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: [
        "attribute vec3 aTarget;",
        "attribute vec3 aColorA;",
        "attribute vec3 aColorB;",
        "attribute float aSize;",
        "attribute float aPhase;",
        "uniform float uMix;",
        "uniform float uTime;",
        "uniform float uSize;",
        "varying vec3 vColor;",
        "varying float vTwinkle;",
        "void main() {",
        "  vec3 p = mix(position, aTarget, uMix);",
        "  p.x += sin(uTime * 0.5 + aPhase) * 0.14;",
        "  p.y += cos(uTime * 0.4 + aPhase * 1.7) * 0.14;",
        "  p.z += sin(uTime * 0.3 + aPhase * 2.3) * 0.1;",
        "  vColor = mix(aColorA, aColorB, uMix);",
        "  vTwinkle = 0.72 + 0.28 * sin(uTime * 1.6 + aPhase * 3.1);",
        "  vec4 mv = modelViewMatrix * vec4(p, 1.0);",
        "  gl_PointSize = aSize * uSize / max(-mv.z, 2.0);",
        "  gl_Position = projectionMatrix * mv;",
        "}"
      ].join("\n"),
      fragmentShader: [
        "varying vec3 vColor;",
        "varying float vTwinkle;",
        "void main() {",
        "  float d = length(gl_PointCoord - vec2(0.5));",
        "  float a = smoothstep(0.5, 0.04, d);",
        "  gl_FragColor = vec4(vColor, a * 0.85 * vTwinkle);",
        "}"
      ].join("\n")
    });

    var points = new THREE.Points(geometry, material);
    scene.add(points);

    /* ---------- scroll → segment + blend factor ---------- */
    var chapters = ["home", "about", "services", "journey", "testimonials", "contact"]
      .map(function (id) { return document.getElementById(id); })
      .filter(Boolean);

    var anchors = [];
    function computeAnchors() {
      var vh = window.innerHeight;
      anchors = chapters.map(function (el) {
        return Math.max(el.getBoundingClientRect().top + window.scrollY - vh * 0.55, 0);
      });
    }

    var currentSeg = -1;
    function setSegment(seg) {
      currentSeg = seg;
      var next = Math.min(seg + 1, formations.length - 1);
      posA.set(formations[seg].pos);
      posB.set(formations[next].pos);
      colA.set(formations[seg].col);
      colB.set(formations[next].col);
      geometry.attributes.position.needsUpdate = true;
      geometry.attributes.aTarget.needsUpdate = true;
      geometry.attributes.aColorA.needsUpdate = true;
      geometry.attributes.aColorB.needsUpdate = true;
    }
    setSegment(0);

    function smoothstep(t) { return t * t * (3 - 2 * t); }

    var mouseX = 0, mouseY = 0;
    if (finePointer) {
      window.addEventListener("mousemove", function (e) {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
      }, { passive: true });
    }

    function resize() {
      var w = window.innerWidth;
      var h = window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      computeAnchors();
    }
    window.addEventListener("resize", resize);
    resize();

    var clock = new THREE.Clock();
    var frame = 0;
    function tick() {
      requestAnimationFrame(tick);
      if (document.hidden) return;

      /* layout shifts (fonts, images) move the anchors; re-measure
         occasionally instead of observing everything */
      if (++frame % 120 === 0) computeAnchors();

      var s = window.scrollY;
      var seg = 0;
      for (var i = anchors.length - 1; i >= 0; i--) {
        if (s >= anchors[i]) { seg = i; break; }
      }
      seg = Math.min(seg, anchors.length - 2);
      var span = anchors[seg + 1] - anchors[seg];
      var t = span > 0 ? (s - anchors[seg]) / span : 0;
      t = Math.max(0, Math.min(1, t));
      if (seg !== currentSeg) setSegment(seg);
      uniforms.uMix.value = smoothstep(t);

      var elapsed = clock.getElapsedTime();
      uniforms.uTime.value = elapsed;
      points.rotation.y = elapsed * 0.03 + s * 0.00012;

      camera.position.x += (mouseX * 1.6 - camera.position.x) * 0.03;
      camera.position.y += (-mouseY * 1.0 - camera.position.y) * 0.03;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    }
    tick();
  })();

  /* =====================================================
     Living badge — drifting gold dust orbiting the About
     section brand mark (canvas.badge-lg__dust)
     ===================================================== */
  (function initBadgeDust() {
    var canvas = document.querySelector(".badge-lg__dust");
    if (!canvas || reducedMotion) return;

    var stage = canvas.closest(".badge-lg");
    var ctx = canvas.getContext("2d");
    var W, H, dpr;

    function size() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      var r = canvas.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    window.addEventListener("resize", size);

    var N = 30;
    var motes = [];
    /* canvas.badge-lg__dust is inset -18% around the badge, so the
       badge itself occupies roughly the middle 74% of this canvas;
       bias motes to hug that margin band, orbiting the frame. */
    var margin = 0.14;

    function spawn(anywhere) {
      var zone = Math.random();
      var x, y;
      if (zone < 0.65) {
        var edge = Math.random();
        if (edge < 0.25) { x = W * Math.random(); y = H * (Math.random() * margin); }
        else if (edge < 0.5) { x = W * Math.random(); y = H * (1 - Math.random() * margin); }
        else if (edge < 0.75) { x = W * (Math.random() * margin); y = H * Math.random(); }
        else { x = W * (1 - Math.random() * margin); y = H * Math.random(); }
      } else {
        x = W * Math.random();
        y = H * (anywhere ? Math.random() : 1 + Math.random() * 0.08);
      }
      return {
        x: x, y: y,
        r: 0.6 + Math.random() * 1.8,
        vy: 0.05 + Math.random() * 0.14,
        sway: Math.random() * Math.PI * 2,
        swayAmp: 0.15 + Math.random() * 0.35,
        life: 0,
        maxLife: 400 + Math.random() * 500
      };
    }

    var visible = true;
    if ("IntersectionObserver" in window && stage) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
      }).observe(stage);
    }

    function frame() {
      requestAnimationFrame(frame);
      if (!visible || document.hidden) return;

      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < motes.length; i++) {
        var m = motes[i];
        m.life++;
        m.sway += 0.012;
        m.x += Math.sin(m.sway) * m.swayAmp * 0.4;
        m.y -= m.vy;
        var fade = Math.min(m.life / 90, 1) * Math.max(1 - m.life / m.maxLife, 0);
        if (m.life > m.maxLife || m.y < -6) { motes[i] = spawn(false); continue; }
        var g = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.r * 3.2);
        g.addColorStop(0, "rgba(228,195,122," + (0.75 * fade) + ")");
        g.addColorStop(0.5, "rgba(184,134,46," + (0.28 * fade) + ")");
        g.addColorStop(1, "rgba(184,134,46,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r * 3.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    size();
    motes = Array.from({ length: N }, function () { return spawn(true); });
    requestAnimationFrame(frame);
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
        note.textContent = "Thank you, " + name + " — your message has been sent. We'll be in touch soon. ✦";
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

  /* WhatsApp chooser: the FAB reveals one chat link per healer */
  var waGroup = document.getElementById("waGroup");
  var waToggle = document.getElementById("waToggle");
  if (waGroup && waToggle) {
    waToggle.addEventListener("click", function () {
      var open = waGroup.classList.toggle("is-open");
      waToggle.setAttribute("aria-expanded", String(open));
    });
    /* close when clicking anywhere else on the page */
    document.addEventListener("click", function (e) {
      if (!waGroup.contains(e.target)) {
        waGroup.classList.remove("is-open");
        waToggle.setAttribute("aria-expanded", "false");
      }
    });
    waGroup.querySelectorAll(".whatsapp-fab-option").forEach(function (link) {
      link.addEventListener("click", function () {
        gtag("event", "whatsapp_click", {
          event_category: "engagement",
          event_label: link.getAttribute("data-healer") || "floating_button"
        });
        waGroup.classList.remove("is-open");
        waToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* Dynamic heights for 3D flip cards so they expand cleanly */
  function updateFlipHeights() {
    document.querySelectorAll(".card--flip").forEach(function (card) {
      var back = card.querySelector(".card__flip-back");
      if (back) {
        // back face is absolute, so its scrollHeight is exactly the content size
        var style = getComputedStyle(card);
        var pt = parseFloat(style.paddingTop) || 0;
        var pb = parseFloat(style.paddingBottom) || 0;
        card.style.setProperty("--back-h", (back.scrollHeight + pt + pb) + "px");
      }
    });
  }
  // Run once everything (fonts, images) is settled, and re-run on resize
  window.addEventListener("load", updateFlipHeights);
  window.addEventListener("resize", updateFlipHeights);
  // Also run immediately just in case
  updateFlipHeights();

  /* Footer year */
  document.getElementById("year").textContent = new Date().getFullYear();
})();
