/**
 * Oli & Hue — Form Handler
 * Intercepts Webflow form submissions and routes them to the correct API endpoints.
 *
 * Form mappings:
 *   "Contact form"      (contact/1.html) -> POST /api/submissions
 *   "Contact Form"      (contact/3.html) -> POST /api/inquiries
 *   "Newsletter form"   (footer)         -> POST /api/newsletter
 */
(function () {
  'use strict';

  // ── Helpers ────────────────────────────────────────────────────────────

  /**
   * Return the API base URL.  In production the forms live on the same
   * domain as the Next.js app, so we can use a relative path.  If a global
   * override is set (useful for local dev) we honour it instead.
   */
  function apiBase() {
    return window.__OLI_API_BASE || '';
  }

  /**
   * Serialize every field inside a <form> element into a plain object.
   * Checkboxes become booleans; everything else becomes a trimmed string.
   */
  function serializeForm(form) {
    var data = {};
    var elements = form.elements;
    for (var i = 0; i < elements.length; i++) {
      var el = elements[i];
      if (!el.name || el.type === 'submit') continue;

      if (el.type === 'checkbox') {
        data[el.name] = el.checked;
      } else {
        data[el.name] = (el.value || '').trim();
      }
    }
    return data;
  }

  /**
   * Show the Webflow success / error block that sits next to the form.
   * Webflow wraps each form in a .w-form container with sibling
   * .w-form-done (success) and .w-form-fail (error) elements.
   */
  function showResult(form, success) {
    var wrapper = form.closest('.w-form') || form.parentElement;
    if (!wrapper) return;

    var doneEl = wrapper.querySelector('.w-form-done');
    var failEl = wrapper.querySelector('.w-form-fail');

    if (doneEl) doneEl.style.display = success ? 'block' : 'none';
    if (failEl) failEl.style.display = success ? 'none' : 'block';

    // Hide the form itself on success (same as Webflow default behaviour)
    if (success) {
      form.style.display = 'none';
    }
  }

  /**
   * POST JSON to the given endpoint and return { ok, data }.
   */
  function postJSON(url, payload) {
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(function (res) {
        return res.json().then(function (json) {
          return { ok: res.ok, data: json };
        });
      })
      .catch(function () {
        return { ok: false, data: { error: 'Network error' } };
      });
  }

  // ── Form-specific handlers ────────────────────────────────────────────

  /**
   * contact/1.html  —  "Contact form"
   * Fields: name, Email, Phone, Message, checkbox (newsletter opt-in)
   */
  function handleContactForm(form) {
    var fields = serializeForm(form);

    // Read plan info from URL params
    var urlParams = new URLSearchParams(window.location.search);
    var plan = urlParams.get('plan') || '';
    var track = urlParams.get('track') || '';
    var source = urlParams.get('source') || '';

    // Build requirement string
    var requirement = fields['requirement_list'] || '';
    if (plan && !requirement) {
      requirement = 'One-time Plan: ' + plan;
      if (track) requirement += ' (' + track + ')';
    }

    var payload = {
      name: fields['name'] || fields['Name'] || '',
      email: fields['Email'] || fields['email'] || '',
      phone: fields['Phone'] || fields['phone'] || '',
      requirement: requirement,
      message: fields['Message'] || fields['message'] || '',
      checkbox_newsletter: !!fields['checkbox'],
    };

    // Include plan details if present
    if (plan) {
      payload.plan = plan;
      if (track) payload.track = track;
      if (source) payload.source = source;
    }

    return postJSON(apiBase() + '/api/submissions', payload);
  }

  /**
   * contact/3.html  —  "Contact Form" (project inquiry)
   * Fields: name, Email, Phone-Number, requirement, Project-details, Subject (links), budget
   */
  function handleInquiryForm(form) {
    var fields = serializeForm(form);
    var payload = {
      name: fields['name'] || fields['Name'] || '',
      email: fields['Email'] || fields['email'] || '',
      phone: fields['Phone-Number'] || fields['phone'] || '',
      requirement: fields['requirement'] || '',
      project_details: fields['Project-details'] || fields['project_details'] || '',
      project_links: fields['Subject'] || fields['project_links'] || '',
      budget: fields['budget'] || '',
    };

    return postJSON(apiBase() + '/api/inquiries', payload);
  }

  /**
   * Footer newsletter  —  "Newsletter form"
   * Fields: Email
   */
  function handleNewsletterForm(form) {
    var fields = serializeForm(form);
    var payload = {
      email: fields['Email'] || fields['email'] || '',
      source: window.location.pathname,
    };

    return postJSON(apiBase() + '/api/newsletter', payload);
  }

  // ── Router ────────────────────────────────────────────────────────────

  /**
   * Map a Webflow form data-name to its handler function.
   * Keys are compared case-sensitively to distinguish
   * "Contact form" (simple contact) from "Contact Form" (inquiry).
   */
  var formHandlers = {
    'Contact form': handleContactForm,
    'Contact Form': handleInquiryForm,
    'Newsletter form': handleNewsletterForm,
  };

  // ── Global listener ───────────────────────────────────────────────────

  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (!form || form.tagName !== 'FORM') return;

    var formName = form.getAttribute('data-name');
    var handler = formHandlers[formName];
    if (!handler) return; // not one of ours — let Webflow handle it

    // Prevent the default Webflow / browser submission
    e.preventDefault();
    e.stopPropagation();

    // Disable the submit button while the request is in flight
    var submitBtn = form.querySelector('[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    handler(form).then(function (result) {
      if (submitBtn) submitBtn.disabled = false;
      showResult(form, result.ok);
    });
  }, true); // use capture phase so we fire before Webflow's handler
})();
