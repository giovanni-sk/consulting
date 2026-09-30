// ========================================
// CONTACT FORM - envoi vers contact.php (mail)
// ========================================

document.addEventListener('DOMContentLoaded', function () {
  const contactForm = document.getElementById('melting-contact-form');
  if (!contactForm) return;

  const statusBox = document.getElementById('form-status');
  const submitBtn = contactForm.querySelector('.form-submit-btn');
  const submitLabel = submitBtn.querySelector('span');

  const FALLBACK_MESSAGES = {
    fr: {
      sending: 'Envoi en cours...',
      sent: 'Merci ! Votre message a bien été envoyé. Nous vous recontacterons rapidement.',
      required: 'Veuillez remplir tous les champs obligatoires (*).',
      invalid_email: 'Veuillez saisir une adresse email valide.',
      too_fast: 'Votre message vient déjà d’être envoyé. Merci de patienter quelques secondes.',
      error: 'Une erreur est survenue, le message n’a pas pu être envoyé. Écrivez-nous directement à contact@meltingconsulting.com.'
    },
    en: {
      sending: 'Sending...',
      sent: 'Thank you! Your message has been sent. We will get back to you shortly.',
      required: 'Please fill out all required fields (*).',
      invalid_email: 'Please enter a valid email address.',
      too_fast: 'Your message was just sent. Please wait a few seconds.',
      error: 'Something went wrong and your message could not be sent. Please email us directly at contact@meltingconsulting.com.'
    }
  };

  function t(key) {
    if (typeof TranslationManager !== 'undefined') {
      const value = TranslationManager.getNestedValue(`contact.form.status.${key}`);
      if (value) return value;
    }
    const lang = (typeof TranslationManager !== 'undefined' && TranslationManager.currentLang) || 'fr';
    return (FALLBACK_MESSAGES[lang] || FALLBACK_MESSAGES.fr)[key];
  }

  function showStatus(type, key) {
    statusBox.hidden = false;
    statusBox.className = `form-status form-status-${type}`;
    statusBox.textContent = t(key);
  }

  function clearStatus() {
    statusBox.hidden = true;
    statusBox.textContent = '';
  }

  function validate() {
    let firstInvalid = null;
    let errorKey = null;

    contactForm.querySelectorAll('.form-input, .form-textarea').forEach(field => {
      field.classList.remove('is-invalid');
      field.removeAttribute('aria-invalid');
    });

    contactForm.querySelectorAll('[required]').forEach(field => {
      if (!field.value.trim()) {
        field.classList.add('is-invalid');
        field.setAttribute('aria-invalid', 'true');
        firstInvalid = firstInvalid || field;
        errorKey = errorKey || 'required';
      }
    });

    const emailInput = document.getElementById('form-email');
    if (emailInput.value.trim() && !emailInput.checkValidity()) {
      emailInput.classList.add('is-invalid');
      emailInput.setAttribute('aria-invalid', 'true');
      firstInvalid = firstInvalid || emailInput;
      errorKey = errorKey || 'invalid_email';
    }

    if (firstInvalid) {
      showStatus('error', errorKey);
      firstInvalid.focus();
      return false;
    }
    return true;
  }

  // Retire l'état d'erreur dès que l'utilisateur corrige le champ
  contactForm.addEventListener('input', (e) => {
    if (e.target.classList.contains('is-invalid') && e.target.value.trim()) {
      e.target.classList.remove('is-invalid');
      e.target.removeAttribute('aria-invalid');
    }
  });

  function setLoading(loading) {
    submitBtn.disabled = loading;
    submitBtn.classList.toggle('is-loading', loading);
    if (loading) {
      submitLabel.removeAttribute('data-i18n');
      submitLabel.textContent = t('sending');
    } else {
      submitLabel.setAttribute('data-i18n', 'contact.form.submit_btn');
      const label = typeof TranslationManager !== 'undefined'
        ? TranslationManager.getNestedValue('contact.form.submit_btn')
        : null;
      submitLabel.textContent = label || 'Envoyer la Demande';
    }
  }

  contactForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    clearStatus();

    if (!validate()) return;

    setLoading(true);

    try {
      const response = await fetch(contactForm.action, {
        method: 'POST',
        body: new FormData(contactForm),
        headers: { Accept: 'application/json' }
      });

      let result = {};
      try {
        result = await response.json();
      } catch (_) {
        // Réponse non JSON (ex. PHP indisponible en local)
      }

      if (response.ok && result.ok) {
        contactForm.reset();
        showStatus('success', 'sent');
      } else {
        const known = ['required', 'invalid_email', 'too_fast'];
        showStatus('error', known.includes(result.code) ? result.code : 'error');
      }
    } catch (error) {
      console.error('Contact form error:', error);
      showStatus('error', 'error');
    } finally {
      setLoading(false);
    }
  });

  // Retour après un envoi sans JavaScript (contact.php redirige avec ?contact=ok|error)
  const params = new URLSearchParams(window.location.search);
  if (params.has('contact')) {
    showStatus(params.get('contact') === 'ok' ? 'success' : 'error', params.get('contact') === 'ok' ? 'sent' : 'error');
  }
});
