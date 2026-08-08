(function (global) {
  "use strict";

  function endpoint() {
    return String(global.GIROSTO_SUBMISSION_ENDPOINT || "").trim();
  }

  function isConfigured() {
    return /^https:\/\/script\.google\.com\/macros\/s\/.+\/exec(?:\?.*)?$/.test(endpoint());
  }

  async function submit(payload) {
    if (!isConfigured()) {
      throw new Error("The secure submission service is not configured yet.");
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch(endpoint(), {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      if (!response.ok) throw new Error("The submission service is unavailable.");
      const result = await response.json();
      if (!result.ok) throw new Error(result.error || "The submission could not be saved.");
      return result;
    } catch (error) {
      if (error.name === "AbortError") throw new Error("The submission timed out. Please try again.");
      throw error;
    } finally {
      clearTimeout(timer);
    }
  }

  global.GirostoSubmissions = { submit, isConfigured };
})(window);

