
"use strict";

// North Star Bakery - Touchstone 4
// Interactivity, form validation, and browser storage

const PRODUCTS = [
  { id: "artisan-bread", name: "Artisan Bread" },
  { id: "signature-loaf", name: "Signature Homemade Loaf" },
  { id: "pastries", name: "Fresh Pastries" },
  { id: "celebration-cake", name: "Celebration Cake" },
  { id: "custom-order", name: "Custom Bakery Order" }
];

const INQUIRIES = [
  { id: "general", name: "General Question" },
  { id: "product", name: "Product Information" },
  { id: "preorder", name: "Preorder Inquiry" },
  { id: "cake", name: "Custom Cake Inquiry" },
  { id: "other", name: "Other" }
];

const STORAGE_KEY = "northStarBakeryPreferences";

document.addEventListener("DOMContentLoaded", initializeBakery);

function initializeBakery() {
  const form = document.querySelector("#bakery-contact-form");

  if (!form) return;

  restorePreferences(form);
  updatePreorderSummary(form);

  form.addEventListener("input", () => {
    updatePreorderSummary(form);
    clearFieldErrors(form);
  });

  form.addEventListener("change", () => {
    updatePreorderSummary(form);
    savePreferences(form);
    clearFieldErrors(form);
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (validateForm(form)) {
      savePreferences(form);

      const feedback = document.querySelector("#form-feedback");

      if (feedback) {
        feedback.textContent =
          "Your inquiry passed validation! This is a demonstration, so no information was sent to the bakery.";
        feedback.className = "form-success";
      }
    }
  });

  form.addEventListener("reset", () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn("Browser storage unavailable.", error);
    }

    setTimeout(() => {
      clearFieldErrors(form);
      updatePreorderSummary(form);

      const feedback = document.querySelector("#form-feedback");
      const storageFeedback =
        document.querySelector("#storage-feedback");

      if (feedback) {
        feedback.textContent = "";
        feedback.className = "";
      }

      if (storageFeedback) {
        storageFeedback.textContent = "";
      }
    }, 0);
  });
}

function getProductName(productId) {
  const product = PRODUCTS.find(item => item.id === productId);
  return product ? product.name : "No product selected";
}

function getInquiryName(inquiryId) {
  const inquiry = INQUIRIES.find(item => item.id === inquiryId);
  return inquiry ? inquiry.name : "Not selected";
}

function getFieldValue(form, name) {
  const field = form.elements.namedItem(name);
  return field ? field.value : "";
}

function updatePreorderSummary(form) {
  const summary = document.querySelector("#preorder-summary");

  if (!summary) return;

  const product = getFieldValue(form, "product");
  const quantity = getFieldValue(form, "quantity");
  const inquiry = getFieldValue(form, "inquiry_type");
  const pickupDate = getFieldValue(form, "pickup_date");

  const lines = [
    "Inquiry: " + getInquiryName(inquiry),
    "Product: " + getProductName(product),
    "Quantity: " + (quantity || "Not specified"),
    "Preferred pickup: " + (pickupDate || "Not specified")
  ];

  summary.textContent = lines.join("\n");
}

function savePreferences(form) {
  const selectedContact = form.querySelector(
    'input[name="contact_method"]:checked'
  );

  const preferences = {
    product: getFieldValue(form, "product"),
    inquiryType: getFieldValue(form, "inquiry_type"),
    contactMethod: selectedContact
      ? selectedContact.value
      : "email"
  };

  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(preferences)
    );
  } catch (error) {
    console.warn("Browser storage unavailable.", error);
  }
}

function restorePreferences(form) {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) return;

    const preferences = JSON.parse(saved);

    const productField = form.elements.namedItem("product");
    const inquiryField = form.elements.namedItem("inquiry_type");

    if (productField && preferences.product) {
      productField.value = preferences.product;
    }

    if (inquiryField && preferences.inquiryType) {
      inquiryField.value = preferences.inquiryType;
    }

    const contactMethods = form.querySelectorAll(
      'input[name="contact_method"]'
    );

    contactMethods.forEach(radio => {
      if (radio.value === preferences.contactMethod) {
        radio.checked = true;
      }
    });

    const storageMessage =
      document.querySelector("#storage-feedback");

    if (storageMessage) {
      storageMessage.textContent =
        "Your previous bakery preferences were restored.";
    }
  } catch (error) {
    console.warn("Could not restore preferences.", error);
  }
}

function showFieldError(fieldId, message) {
  const field = document.getElementById(fieldId);
  const error = document.getElementById(fieldId + "-error");

  if (field) {
    field.setAttribute("aria-invalid", "true");
  }

  if (error) {
    error.textContent = message;
  }
}

function clearFieldErrors(form) {
  form.querySelectorAll(".field-error").forEach(element => {
    element.textContent = "";
  });

  form.querySelectorAll("[aria-invalid]").forEach(element => {
    element.removeAttribute("aria-invalid");
  });
}

function validateForm(form) {
  clearFieldErrors(form);

  let valid = true;

  const name = getFieldValue(form, "full_name").trim();
  const email = getFieldValue(form, "email").trim();
  const message = getFieldValue(form, "message").trim();
  const inquiry = getFieldValue(form, "inquiry_type");
  const quantity = getFieldValue(form, "quantity");

  if (name.length < 2) {
    showFieldError(
      "full-name",
      "Please enter your full name (at least 2 characters)."
    );
    valid = false;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email)) {
    showFieldError(
      "email",
      "Please enter a valid email address."
    );
    valid = false;
  }

  if (!inquiry) {
    showFieldError(
      "inquiry-type",
      "Please select an inquiry type."
    );
    valid = false;
  }

  if (message.length < 10) {
    showFieldError(
      "message",
      "Please enter at least 10 characters."
    );
    valid = false;
  }

  if (
    quantity &&
    (!Number.isInteger(Number(quantity)) ||
      Number(quantity) < 1 ||
      Number(quantity) > 100)
  ) {
    showFieldError(
      "quantity",
      "Quantity must be a whole number between 1 and 100."
    );
    valid = false;
  }

  const feedback = document.querySelector("#form-feedback");

  if (feedback && !valid) {
    feedback.textContent =
      "Please correct the highlighted fields before submitting.";
    feedback.className = "form-error";
  }

  if (!valid) {
    const firstInvalid = form.querySelector(
      '[aria-invalid="true"]'
    );

    if (firstInvalid) {
      firstInvalid.focus();
    }
  }

  return valid;
}
