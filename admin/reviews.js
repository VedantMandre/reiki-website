/* Review moderation page. Talks to /api/moderate with the passphrase as a
   Bearer token; the passphrase is remembered in localStorage after the
   first successful unlock so day-to-day approval is one click. */

(function () {
  "use strict";

  var STORAGE_KEY = "suved-moderation-secret";

  var authForm = document.getElementById("authForm");
  var authNote = document.getElementById("authNote");
  var secretInput = document.getElementById("secret");
  var lists = document.getElementById("lists");
  var pendingList = document.getElementById("pendingList");
  var approvedList = document.getElementById("approvedList");
  var pendingEmpty = document.getElementById("pendingEmpty");
  var approvedEmpty = document.getElementById("approvedEmpty");
  var pendingCount = document.getElementById("pendingCount");

  function secret() {
    return sessionStorageSafe("get") || "";
  }

  function sessionStorageSafe(op, value) {
    try {
      if (op === "get") return localStorage.getItem(STORAGE_KEY);
      if (op === "set") return localStorage.setItem(STORAGE_KEY, value);
      if (op === "remove") return localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      return null;
    }
  }

  function api(method, body) {
    return fetch("/api/moderate", {
      method: method,
      headers: {
        Authorization: "Bearer " + secret(),
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    }).then(function (res) {
      if (res.status === 401) throw new Error("unauthorized");
      if (!res.ok) throw new Error("request-failed");
      return res.json();
    });
  }

  function starRow(rating) {
    return "★★★★★".slice(0, rating) + "☆☆☆☆☆".slice(0, 5 - rating);
  }

  function card(review, actions) {
    var fig = document.createElement("figure");
    fig.className = "testimonial admin__card";

    var stars = document.createElement("div");
    stars.className = "testimonial__stars";
    stars.textContent = starRow(review.rating);

    var quote = document.createElement("blockquote");
    quote.textContent = "“" + review.message + "”";

    var caption = document.createElement("figcaption");
    var name = document.createElement("strong");
    name.textContent = review.name;
    var meta = document.createElement("span");
    meta.textContent = review.service + " · " + (review.created_at || "").slice(0, 10);
    caption.appendChild(name);
    caption.appendChild(meta);

    var row = document.createElement("div");
    row.className = "admin__actions";
    actions.forEach(function (a) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = a.gold ? "btn btn--gold" : "btn btn--ghost";
      btn.textContent = a.label;
      btn.addEventListener("click", function () {
        btn.disabled = true;
        api("POST", { id: review.id, action: a.action })
          .then(load)
          .catch(function () {
            btn.disabled = false;
            authNote.textContent = "That action failed — refresh and try again.";
          });
      });
      row.appendChild(btn);
    });

    fig.appendChild(stars);
    fig.appendChild(quote);
    fig.appendChild(caption);
    fig.appendChild(row);
    return fig;
  }

  function render(listEl, emptyEl, reviews, actions) {
    listEl.textContent = "";
    emptyEl.hidden = reviews.length > 0;
    reviews.forEach(function (r) {
      listEl.appendChild(card(r, actions));
    });
  }

  function load() {
    return api("GET").then(function (data) {
      authForm.hidden = true;
      lists.hidden = false;
      authNote.textContent = "";
      pendingCount.textContent = data.pending.length ? "(" + data.pending.length + ")" : "";
      render(pendingList, pendingEmpty, data.pending, [
        { label: "Approve ✦", action: "approve", gold: true },
        { label: "Reject", action: "reject" },
      ]);
      render(approvedList, approvedEmpty, data.approved, [
        { label: "Unpublish", action: "reject" },
      ]);
    });
  }

  function showAuthError() {
    authForm.hidden = false;
    lists.hidden = true;
    authNote.textContent = "That passphrase was not accepted.";
    sessionStorageSafe("remove");
  }

  authForm.addEventListener("submit", function (e) {
    e.preventDefault();
    sessionStorageSafe("set", secretInput.value.trim());
    load().catch(showAuthError);
  });

  document.getElementById("refreshBtn").addEventListener("click", function () {
    load().catch(showAuthError);
  });

  document.getElementById("lockBtn").addEventListener("click", function () {
    sessionStorageSafe("remove");
    lists.hidden = true;
    authForm.hidden = false;
    secretInput.value = "";
    authNote.textContent = "Passphrase forgotten on this device.";
  });

  // auto-unlock if a stored passphrase still works
  if (secret()) {
    load().catch(showAuthError);
  }
})();
