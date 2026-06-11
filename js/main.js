/* Sujata Mandre — site interactions */

(function () {
  "use strict";

  var nav = document.getElementById("nav");
  var navToggle = document.getElementById("navToggle");
  var navLinks = document.getElementById("navLinks");

  /* Solid nav background after scrolling past the top */
  function onScroll() {
    nav.classList.toggle("is-scrolled", window.scrollY > 40);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Mobile menu */
  navToggle.addEventListener("click", function () {
    var open = navLinks.classList.toggle("is-open");
    navToggle.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
  });

  navLinks.addEventListener("click", function (e) {
    if (e.target.closest("a")) {
      navLinks.classList.remove("is-open");
      navToggle.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    }
  });

  /* Scroll-reveal animations */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

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

  /* Contact form — client-side handling (no backend wired up yet) */
  var form = document.getElementById("contactForm");
  var note = document.getElementById("formNote");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    if (!form.checkValidity()) {
      note.textContent = "Please fill in your name, email, and message.";
      return;
    }

    var name = form.elements.name.value.trim();
    var service = form.elements.service.options[form.elements.service.selectedIndex].text;
    var message = form.elements.message.value.trim();

    /* Until a backend or form service is connected, open the
       visitor's mail client with a pre-filled message. */
    var subject = encodeURIComponent("Inquiry: " + service);
    var body = encodeURIComponent(
      "Hello Sujata,\n\n" + message + "\n\nWarm regards,\n" + name
    );
    window.location.href =
      "mailto:hello@sujatamandre.com?subject=" + subject + "&body=" + body;

    note.textContent = "Thank you, " + name + " — your email app should open shortly. ✦";
    form.reset();
  });

  /* Footer year */
  document.getElementById("year").textContent = new Date().getFullYear();
})();
