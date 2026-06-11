/* Sujata Mandre — site interactions */

(function () {
  "use strict";

  /* Google Analytics 4 — config lives here (not inline in index.html) so the
     script-src CSP doesn't need 'unsafe-inline'. TODO: the loader tag in
     index.html still has the placeholder ID G-XXXXXXXXXX; replace it there
     once a real GA4 property exists. */
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  gtag("js", new Date());
  gtag("config", "G-XXXXXXXXXX");

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

  /* Contact form — submitted via FormSubmit's AJAX endpoint */
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
