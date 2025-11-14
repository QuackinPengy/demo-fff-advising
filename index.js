import { setBasePath } from 'https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.20.1/cdn/shoelace.js';

setBasePath('https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.20.1/cdn/');

function setupNavToggle() {
  const nav = document.querySelector(".nav");
  if (!nav) {
    return;
  }

  const toggle = nav.querySelector(".nav__toggle");
  const collapse = nav.querySelector(".nav__collapse");

  if (!toggle || !collapse) {
    return;
  }

  const desktopQuery = window.matchMedia("(min-width: 769px)");
  const focusableSelector = [
    "a[href]",
    "button:not([disabled])",
    "sl-button:not([disabled])",
    "input:not([disabled])",
    "textarea:not([disabled])",
    "select:not([disabled])",
    "[tabindex]"
  ].join(", ");
  let focusDisabled = false;

  const toggleFocusableState = (shouldDisable) => {
    if (shouldDisable === focusDisabled) {
      return;
    }

    const focusableElements = collapse.querySelectorAll(focusableSelector);

    if (shouldDisable) {
      focusableElements.forEach((element) => {
        if (element.dataset.originalTabindex === undefined) {
          const currentTabIndex = element.getAttribute("tabindex");
          element.dataset.originalTabindex = currentTabIndex === null ? "" : currentTabIndex;
        }

        element.setAttribute("tabindex", "-1");
      });
    } else {
      focusableElements.forEach((element) => {
        const storedTabIndex = element.dataset.originalTabindex;

        if (storedTabIndex !== undefined) {
          if (storedTabIndex === "") {
            element.removeAttribute("tabindex");
            if (element.tagName === "SL-BUTTON") {
              element.setAttribute("tabindex", "0");
            }
          } else {
            element.setAttribute("tabindex", storedTabIndex);
          }

          delete element.dataset.originalTabindex;
        } else if (element.tagName === "SL-BUTTON") {
          element.setAttribute("tabindex", "0");
        } else {
          element.removeAttribute("tabindex");
        }
      });
    }

    focusDisabled = shouldDisable;
  };

  const syncCollapseState = () => {
    if (desktopQuery.matches) {
      collapse.setAttribute("aria-hidden", "false");
      collapse.removeAttribute("inert");
      toggleFocusableState(false);
    } else {
      const isOpen = nav.classList.contains("nav--open");
      collapse.setAttribute("aria-hidden", isOpen ? "false" : "true");
      collapse.toggleAttribute("inert", !isOpen);
      toggleFocusableState(!isOpen);
    }
  };

  const closeNav = () => {
    nav.classList.remove("nav--open");
    toggle.setAttribute("aria-expanded", "false");
    syncCollapseState();
  };

  const openNav = () => {
    nav.classList.add("nav--open");
    toggle.setAttribute("aria-expanded", "true");
    syncCollapseState();
  };

  toggle.addEventListener("click", () => {
    if (nav.classList.contains("nav--open")) {
      closeNav();
    } else {
      openNav();
    }
  });

  collapse.addEventListener("click", (event) => {
    const target = event.target;
    if (target && target.closest("a")) {
      closeNav();
      return;
    }

    const slButton = target && target.closest("sl-button");
    if (slButton && slButton.hasAttribute("href")) {
      closeNav();
    }
  });

  document.addEventListener("click", (event) => {
    if (!nav.classList.contains("nav--open")) {
      return;
    }

    const target = event.target;
    if (target instanceof Node && !nav.contains(target)) {
      closeNav();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeNav();
    }
  });

  const handleViewportChange = () => {
    if (desktopQuery.matches) {
      nav.classList.remove("nav--open");
      toggle.setAttribute("aria-expanded", "false");
    }

    syncCollapseState();
  };

  if (typeof desktopQuery.addEventListener === "function") {
    desktopQuery.addEventListener("change", handleViewportChange);
  } else if (typeof desktopQuery.addListener === "function") {
    desktopQuery.addListener(handleViewportChange);
  }

  handleViewportChange();
}

function setFooterYear() {
  const notice = document.querySelector(".footer__notice");
  if (!notice) {
    return;
  }

  const year = new Date().getFullYear();
  notice.textContent = `© ${year} Forward Focused Financial`;
}

function setupImageErrorHandling() {
  const images = document.querySelectorAll('img');
  const slAvatars = document.querySelectorAll('sl-avatar[image]');

  // Handle regular img elements
  images.forEach(img => {
    img.addEventListener('error', () => {
      // Create a placeholder with the same dimensions
      const placeholder = document.createElement('div');
      placeholder.style.width = img.offsetWidth || '180px';
      placeholder.style.height = img.offsetHeight || '180px';
      placeholder.style.backgroundColor = 'var(--surface-soft)';
      placeholder.style.border = '1px solid var(--glass-border)';
      placeholder.style.borderRadius = '12px';
      placeholder.style.display = 'flex';
      placeholder.style.alignItems = 'center';
      placeholder.style.justifyContent = 'center';
      placeholder.style.color = 'var(--text-muted)';
      placeholder.style.fontSize = '0.875rem';
      placeholder.textContent = 'Image unavailable';

      // Replace the img with placeholder
      if (img.parentNode) {
        img.parentNode.replaceChild(placeholder, img);
      }
    });
  });

  // Handle Shoelace avatar images
  slAvatars.forEach(avatar => {
    const img = avatar.shadowRoot?.querySelector('img');
    if (img) {
      img.addEventListener('error', () => {
        // Fallback to initials or icon
        avatar.removeAttribute('image');
        avatar.setAttribute('label', 'Profile image unavailable');
      });
    }
  });
}

function setupContactForm() {
  const form = document.querySelector(".contact__form");
  const response = document.querySelector(".contact__response");

  if (!form || !response) {
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    // Basic validation
    if (!data.name || !data.email || !data.message) {
      response.textContent = "Please fill in all required fields.";
      response.style.color = "var(--rose)";
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      response.textContent = "Please enter a valid email address.";
      response.style.color = "var(--rose)";
      return;
    }

    // Show loading state
    const submitButton = form.querySelector('sl-button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = "Sending...";
    submitButton.setAttribute("disabled", "");

    try {
      // For now, create a mailto link since there's no backend
      const subject = encodeURIComponent(`FFF Advising Contact: ${data.name}`);
      const body = encodeURIComponent(`Name: ${data.name}\nEmail: ${data.email}\n\nMessage:\n${data.message}`);
      const mailtoLink = `mailto:hello@fffadvising.com?subject=${subject}&body=${body}`;

      // Open mailto link
      window.location.href = mailtoLink;

      // Show success message
      response.textContent = "Thank you! Your message has been sent. Expect a reply within one business day.";
      response.style.color = "var(--moss-green)";

      // Reset form
      form.reset();

    } catch (error) {
      response.textContent = "There was an error sending your message. Please try again or contact us directly.";
      response.style.color = "var(--rose)";
    } finally {
      // Reset button
      submitButton.textContent = originalText;
      submitButton.removeAttribute("disabled");
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupNavToggle();
  setFooterYear();
  setupImageErrorHandling();
  setupContactForm();
});

