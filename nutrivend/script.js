/* ============================================================
   NutriVend — Book Appointment lead capture logic
   ============================================================
   Before going live, set SCRIPT_URL below (from Apps Script
   deployment). BUSINESS_WHATSAPP is already filled in using the
   number from the site's Contact section (+91 93457 28131).
   ============================================================ */
const CONFIG = {
  // Paste the Web App URL you get after deploying Code.gs (Deploy > New deployment > Web app)
  SCRIPT_URL: "https://script.google.com/macros/s/AKfycbykQ4cvKj8Qvcm6iwIm-TCg17U_jK-1nHVzLs89EpyP1Sb7sX4msTF03h250IxTcGAy/exec",

  // Business WhatsApp number, digits only, country code, no + or leading 0
  BUSINESS_WHATSAPP: "919943493318",
};

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("appointment-form");
  if (!form) return; // section not present on this page

  const submitBtn = document.getElementById("submit-btn");
  const statusEl = document.getElementById("form-status");

  const fields = {
    name: document.getElementById("name"),
    whatsapp: document.getElementById("whatsapp"),
    email: document.getElementById("email"),
    city: document.getElementById("city"),
    machine: document.getElementById("machine"),
  };

  const validators = {
    name: (v) => v.trim().length >= 2 || "Please enter your name.",
    whatsapp: (v) =>
      /^[6-9]\d{9}$/.test(v.trim()) ||
      "Enter a valid 10-digit mobile number (no country code).",
    email: (v) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ||
      "Enter a valid email address.",
    city: (v) => v.trim().length >= 2 || "Please enter your city.",
    machine: (v) => v.trim().length > 0 || "Please choose an option.",
  };

  function showFieldError(key, message) {
    const input = fields[key];
    const errorEl = document.getElementById(`error-${key}`);
    if (message) {
      input.classList.add("invalid");
      errorEl.textContent = message;
    } else {
      input.classList.remove("invalid");
      errorEl.textContent = "";
    }
  }

  function validateField(key) {
    const value = fields[key].value;
    const result = validators[key](value);
    if (result === true) {
      showFieldError(key, "");
      return true;
    }
    showFieldError(key, result);
    return false;
  }

  Object.keys(fields).forEach((key) => {
    fields[key].addEventListener("blur", () => validateField(key));
    fields[key].addEventListener("input", () => {
      if (fields[key].classList.contains("invalid")) validateField(key);
    });
    fields[key].addEventListener("change", () => {
      if (fields[key].classList.contains("invalid")) validateField(key);
    });
  });

  function validateAll() {
    return Object.keys(fields)
      .map((key) => validateField(key))
      .every(Boolean);
  }

  function setStatus(message, type) {
    statusEl.textContent = message;
    statusEl.className = "form-status" + (type ? " " + type : "");
  }

  function setLoading(isLoading) {
    submitBtn.disabled = isLoading;
    submitBtn.classList.toggle("loading", isLoading);
  }

  function buildWhatsAppLink(name, machine) {
    const message =
      `Hello, my name is ${name}. I am interested in the ${machine} NutriVend machine. ` +
      `I have just submitted the appointment form. Please send me the quotation and further details.`;
    const encoded = encodeURIComponent(message);
    return `https://wa.me/${CONFIG.BUSINESS_WHATSAPP}?text=${encoded}`;
  }

  function saveLeadToLocalStorage(payload) {
    try {
      const existing = JSON.parse(localStorage.getItem("nutrivend_leads") || "[]");
      existing.push({
        ...payload,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem("nutrivend_leads", JSON.stringify(existing));
    } catch (e) {
      console.warn("Could not save lead to local storage:", e);
    }
  }

  // Utility: Export all local leads to Excel-compatible CSV file
  window.exportLeadsToCSV = function () {
    try {
      const leads = JSON.parse(localStorage.getItem("nutrivend_leads") || "[]");
      if (leads.length === 0) {
        alert("No leads found in browser storage yet.");
        return;
      }
      const headers = ["Timestamp", "Name", "WhatsApp", "Email", "City", "Machine Interested In"];
      const rows = leads.map((l) => [
        `"${(l.timestamp || "").replace(/"/g, '""')}"`,
        `"${(l.name || "").replace(/"/g, '""')}"`,
        `"${(l.whatsapp || "").replace(/"/g, '""')}"`,
        `"${(l.email || "").replace(/"/g, '""')}"`,
        `"${(l.city || "").replace(/"/g, '""')}"`,
        `"${(l.machine || "").replace(/"/g, '""')}"`,
      ]);

      const csvString = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `nutrivend_leads_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export leads failed:", err);
      alert("Failed to export leads.");
    }
  };

  function handleSuccessfulLead(payload, isFallback = false) {
    saveLeadToLocalStorage(payload);

    if (isFallback) {
      setStatus(
        "Lead saved! Connecting you directly to NutriVend on WhatsApp…",
        "success"
      );
    } else {
      setStatus(
        "You're all set! Check your email for the quotation, and we're opening WhatsApp for you now…",
        "success"
      );
    }

    const waLink = buildWhatsAppLink(payload.name, payload.machine);

    setTimeout(() => {
      window.location.href = waLink;
    }, 1400);

    form.reset();
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    setStatus("", "");

    if (!validateAll()) {
      setStatus("Please fix the highlighted fields.", "error");
      return;
    }

    const payload = {
      name: fields.name.value.trim(),
      whatsapp: fields.whatsapp.value.trim(),
      email: fields.email.value.trim(),
      city: fields.city.value.trim(),
      machine: fields.machine.value.trim(),
    };

    setLoading(true);

    const isUnconfigured =
      !CONFIG.SCRIPT_URL ||
      CONFIG.SCRIPT_URL.includes("PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE");

    if (isUnconfigured) {
      console.info(
        "NutriVend CRM: SCRIPT_URL is unconfigured. Using instant WhatsApp handoff & local storage backup."
      );
      setStatus("Connecting you to NutriVend on WhatsApp…", "");
      setTimeout(() => {
        handleSuccessfulLead(payload, true);
        setLoading(false);
      }, 600);
      return;
    }

    setStatus("Saving your details and sending your documents…", "");

    try {
      // Content-Type is deliberately "text/plain" and mode "no-cors" to avoid
      // CORS preflight issues with Google Apps Script web apps.
      await fetch(CONFIG.SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
      });

      handleSuccessfulLead(payload, false);
    } catch (err) {
      console.warn("Backend fetch failed, falling back to direct WhatsApp handoff:", err);
      handleSuccessfulLead(payload, true);
    } finally {
      setLoading(false);
    }
  });
});

