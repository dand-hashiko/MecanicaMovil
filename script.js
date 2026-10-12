/**
 * TALLER MÓVIL PRO - Client Scripts
 * Streamlined, vanilla ES6 logic using event delegation.
 */

// Instant Top Scroll Restoration
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
window.addEventListener('beforeunload', () => {
  window.scrollTo(0, 0);
});
window.addEventListener('DOMContentLoaded', () => {
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
});

document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('mobile-toggle');
  const drawer = document.getElementById('mobile-drawer');
  const searchInput = document.getElementById('commune-search');
  const communesGrid = document.getElementById('communes-grid');
  const toast = document.getElementById('toast-notification');
  const toastMsg = document.getElementById('toast-message');
  
  let toastTimer = null;
  const phoneNumber = '+56 9 5379 7437';

  // State Management
  const state = {
    menuOpen: false,
  };

  function toggleMenu(forceState) {
    state.menuOpen = typeof forceState === 'boolean' ? forceState : !state.menuOpen;
    if (toggleBtn) {
      toggleBtn.setAttribute('aria-expanded', String(state.menuOpen));
      toggleBtn.classList.toggle('is-active', state.menuOpen);
    }
    if (drawer) {
      drawer.classList.toggle('is-open', state.menuOpen);
      drawer.setAttribute('aria-hidden', String(!state.menuOpen));
    }
  }

  function showToast(text) {
    if (!toast || !toastMsg) return;
    toastMsg.textContent = text;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
  }

  // Helper to sync custom select displays with native select values
  function syncCustomSelect(selectElement) {
    if (!selectElement) return;
    const container = selectElement.closest('.custom-select-container');
    if (!container) return;
    const label = container.querySelector('.custom-select-label');
    const selectedOption = selectElement.options[selectElement.selectedIndex];
    if (label && selectedOption) {
      label.textContent = selectedOption.text;
    }
    container.querySelectorAll('.custom-option, .select-option').forEach(opt => {
      const isMatch = opt.getAttribute('data-value') === selectElement.value;
      opt.classList.toggle('is-selected', isMatch);
    });
  }

  // --- SINGLE DELEGATED EVENT LISTENER ---
  document.body.addEventListener('click', async (e) => {
    // 1. Mobile Menu Toggle
    if (e.target.closest('#mobile-toggle')) {
      toggleMenu();
      return;
    }

    // Close menu when clicking mobile links
    if (e.target.closest('.mobile-nav-link') || e.target.closest('.mobile-actions a')) {
      toggleMenu(false);
    }

    // 2. FAQ Accordion (Positioned First in FAQ section)
    const faqTrigger = e.target.closest('.accordion-trigger, .accordion-header');
    if (faqTrigger && (faqTrigger.closest('.faq-accordion-container') || faqTrigger.closest('.accordion-container'))) {
      const item = faqTrigger.closest('.accordion-item, .faq-item');
      if (item) {
        const panel = item.querySelector('.accordion-panel, .faq-panel');
        const icon = item.querySelector('.faq-icon, .chevron-icon');
        const isExpanded = faqTrigger.getAttribute('aria-expanded') === 'true';

        if (isExpanded) {
          faqTrigger.setAttribute('aria-expanded', 'false');
          item.classList.remove('is-open');
          if (panel) panel.hidden = true;
          if (icon) icon.textContent = '+';
        } else {
          // Close others
          document.querySelectorAll('.accordion-item.is-open, .faq-item.is-open').forEach(otherItem => {
            if (otherItem !== item) {
              const otherTrigger = otherItem.querySelector('.accordion-trigger, .accordion-header');
              const otherPanel = otherItem.querySelector('.accordion-panel, .faq-panel');
              const otherIcon = otherItem.querySelector('.faq-icon, .chevron-icon');
              if (otherTrigger) otherTrigger.setAttribute('aria-expanded', 'false');
              otherItem.classList.remove('is-open');
              if (otherPanel) otherPanel.hidden = true;
              if (otherIcon) otherIcon.textContent = '+';
            }
          });

          // Open current
          faqTrigger.setAttribute('aria-expanded', 'true');
          item.classList.add('is-open');
          if (panel) panel.hidden = false;
          if (icon) icon.textContent = '−';
        }
      }
      return;
    }

    // 3. Vehicle Type Selection Chips (Step 1)
    const chipBtn = e.target.closest('.pill-btn, .chip-btn, .vehicle-type-btn');
    if (chipBtn) {
      const pillGroup = chipBtn.closest('.pill-group') || chipBtn.parentElement;
      const hiddenInput = pillGroup.querySelector('.input-tipo-vehiculo') || pillGroup.nextElementSibling;
      
      pillGroup.querySelectorAll('.pill-btn, .chip-btn, .vehicle-type-btn').forEach(b => {
        b.classList.remove('active', 'selected');
        b.setAttribute('aria-pressed', 'false');
        b.setAttribute('data-selected', 'false');
      });
      chipBtn.classList.add('active', 'selected');
      chipBtn.setAttribute('aria-pressed', 'true');
      chipBtn.setAttribute('data-selected', 'true');
      if (hiddenInput) {
        hiddenInput.value = chipBtn.getAttribute('data-value') || chipBtn.textContent.trim();
      }
      pillGroup.classList.remove('error');
      return;
    }

    // 4. Custom Dropdowns (Steps 2 & 3: Falla y Comuna)
    const selectTrigger = e.target.closest('.custom-select-trigger');
    if (selectTrigger) {
      e.preventDefault();
      const container = selectTrigger.closest('.custom-select-container');
      const wasOpen = container.classList.contains('open');

      // Close all other dropdowns
      document.querySelectorAll('.custom-select-container.open').forEach(c => {
        if (c !== container) {
          c.classList.remove('open');
          const t = c.querySelector('.custom-select-trigger');
          if (t) t.setAttribute('aria-expanded', 'false');
        }
      });

      if (wasOpen) {
        container.classList.remove('open');
        selectTrigger.setAttribute('aria-expanded', 'false');
      } else {
        container.classList.add('open');
        selectTrigger.setAttribute('aria-expanded', 'true');
      }
      return;
    }

    const customOption = e.target.closest('.custom-option, .select-option');
    if (customOption) {
      e.preventDefault();
      const container = customOption.closest('.custom-select-container');
      if (container) {
        const val = customOption.getAttribute('data-value') || customOption.textContent.trim();
        const trigger = container.querySelector('.custom-select-trigger');
        const label = trigger ? trigger.querySelector('.custom-select-label') : null;
        const nativeSelect = container.querySelector('select');

        // Update trigger display label
        if (label) {
          label.textContent = val;
        }

        // Update option highlight
        container.querySelectorAll('.custom-option, .select-option').forEach(opt => {
          opt.classList.remove('is-selected', 'is-focused');
        });
        customOption.classList.add('is-selected');

        // Sync with native select
        if (nativeSelect) {
          nativeSelect.value = val;
          nativeSelect.classList.remove('error');
          nativeSelect.dispatchEvent(new Event('change', { bubbles: true }));
          nativeSelect.dispatchEvent(new Event('input', { bubbles: true }));
        }

        if (trigger) {
          trigger.classList.remove('error');
          trigger.setAttribute('aria-expanded', 'false');
        }
        container.classList.remove('open', 'error');
      }
      return;
    }

    // Close any open custom dropdown when clicking outside
    if (!e.target.closest('.custom-select-container')) {
      document.querySelectorAll('.custom-select-container.open').forEach(c => {
        c.classList.remove('open');
        const t = c.querySelector('.custom-select-trigger');
        if (t) t.setAttribute('aria-expanded', 'false');
      });
    }

    // 5. WhatsApp Builder Form Submission
    if (e.target.closest('.btn-funnel-submit')) {
      e.preventDefault();
      const form = e.target.closest('form');
      if (!form) return;

      const tipoInput = form.querySelector('.input-tipo-vehiculo');
      const marcaInput = form.querySelector('.input-marca');
      const anoInput = form.querySelector('.input-ano');
      const fallaInput = form.querySelector('.input-falla');
      const comunaInput = form.querySelector('.input-comuna');
      const direccionInput = form.querySelector('.input-direccion');

      let isValid = true;
      const requiredFields = [tipoInput, marcaInput, anoInput, fallaInput, comunaInput, direccionInput];
      
      if (!tipoInput.value) {
        isValid = false;
        const pillGrp = form.querySelector('.pill-group');
        if (pillGrp) {
          pillGrp.classList.add('error');
        }
      }

      requiredFields.forEach(field => {
        if (!field.value) {
          isValid = false;
          field.classList.add('error');
          const customTrigger = field.closest('.custom-select-container')?.querySelector('.custom-select-trigger');
          if (customTrigger) customTrigger.classList.add('error');
        } else {
          field.classList.remove('error');
          const customTrigger = field.closest('.custom-select-container')?.querySelector('.custom-select-trigger');
          if (customTrigger) customTrigger.classList.remove('error');
        }
      });

      if (!isValid) return;

      const vehiculoTipo = tipoInput.value;
      const marcaModelo = marcaInput.value;
      const ano = anoInput.value;
      const falla = fallaInput.value;
      const comuna = comunaInput.value;
      const direccion = direccionInput.value;

      const targetPhone = "56953797437";
      const message = `Hola, necesito asistencia técnica en terreno:\n\n• Vehículo/Equipo: ${vehiculoTipo || 'No especificado'} - ${marcaModelo || ''} (${ano || ''})\n• Problema / Falla: ${falla || 'Diagnóstico general'}\n• Ubicación: ${comuna || ''}, ${direccion || ''}\n\nFavor confirmar disponibilidad y presupuesto.`;
      const waUrl = `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;

      window.open(waUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    // 6. Phone Copy Button
    if (e.target.closest('#btn-copy-phone')) {
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(phoneNumber);
        } else {
          const textarea = document.createElement('textarea');
          textarea.value = phoneNumber;
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
        }
        showToast(`Teléfono ${phoneNumber} copiado al portapapeles`);
      } catch (err) {
        showToast(`Número: ${phoneNumber}`);
      }
      return;
    }

    // 7. Services Accordion
    const serviceAccTrigger = e.target.closest('.service-acc-trigger');
    if (serviceAccTrigger) {
      const item = serviceAccTrigger.closest('.service-acc-item');
      const isExpanded = serviceAccTrigger.getAttribute('aria-expanded') === 'true';

      // Close others
      document.querySelectorAll('.service-acc-item.is-open').forEach(otherItem => {
        if (otherItem !== item) {
          const otherTrigger = otherItem.querySelector('.service-acc-trigger');
          if (otherTrigger) otherTrigger.setAttribute('aria-expanded', 'false');
          otherItem.classList.remove('is-open');
        }
      });

      if (isExpanded) {
        serviceAccTrigger.setAttribute('aria-expanded', 'false');
        item.classList.remove('is-open');
      } else {
        serviceAccTrigger.setAttribute('aria-expanded', 'true');
        item.classList.add('is-open');
      }
      return;
    }

    // 8. Services CTA Buttons -> Scroll to Form & Pre-select
    const serviceCtaBtn = e.target.closest('.service-cta-btn');
    if (serviceCtaBtn) {
      e.preventDefault();
      
      const targetType = serviceCtaBtn.getAttribute('data-target-type');
      const targetFailure = serviceCtaBtn.getAttribute('data-target-failure');
      
      if (targetType) {
        const optionButtons = document.querySelectorAll('.pill-btn, .chip-btn, .vehicle-type-btn');
        optionButtons.forEach(opt => {
          const optText = (opt.getAttribute('data-value') || opt.textContent).replace(/\s+/g, ' ').trim().toLowerCase();
          if (optText === targetType.toLowerCase()) {
            opt.click();
          }
        });
      }

      if (targetFailure) {
        const fallaInput = document.querySelector('.input-falla');
        if (fallaInput) {
          fallaInput.value = targetFailure;
          fallaInput.classList.remove('error');
          fallaInput.dispatchEvent(new Event('change', { bubbles: true }));
          syncCustomSelect(fallaInput);
        }
      }

      // Smooth scroll to form
      const formContainer = document.querySelector('.lead-capture-funnel') || document.getElementById('contacto');
      if (formContainer) {
        formContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      // Focus first input of Step 2 after scrolling
      setTimeout(() => {
        const firstInput = document.querySelector('.input-marca');
        if (firstInput) firstInput.focus();
      }, 500);

      return;
    }
  });

  // Clear errors on input/change
  document.body.addEventListener('input', (e) => {
    if (e.target.classList.contains('form-control')) {
      e.target.classList.remove('error');
      const customTrigger = e.target.closest('.custom-select-container')?.querySelector('.custom-select-trigger');
      if (customTrigger) customTrigger.classList.remove('error');
    }
  });

  document.body.addEventListener('change', (e) => {
    if (e.target.classList.contains('form-control')) {
      e.target.classList.remove('error');
      const customTrigger = e.target.closest('.custom-select-container')?.querySelector('.custom-select-trigger');
      if (customTrigger) customTrigger.classList.remove('error');
      syncCustomSelect(e.target);
    }
  });

  // --- KEYBOARD EVENTS (ESCAPE TO CLOSE) ---
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (state.menuOpen) {
        toggleMenu(false);
      }
      document.querySelectorAll('.custom-select-container.open').forEach(c => {
        c.classList.remove('open');
        const t = c.querySelector('.custom-select-trigger');
        if (t) t.setAttribute('aria-expanded', 'false');
      });
    }
  });

  // --- COMMUNE SEARCH FILTER ---
  if (searchInput && communesGrid) {
    const communePills = communesGrid.querySelectorAll('.commune-pill');
    
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      let matchCount = 0;
      
      communePills.forEach(pill => {
        const name = (pill.textContent || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const isMatch = name.includes(query);
        pill.style.display = isMatch ? 'flex' : 'none';
        if (isMatch) matchCount++;
      });

      let emptyMsg = document.getElementById('communes-empty-msg');
      if (matchCount === 0 && !emptyMsg) {
        emptyMsg = document.createElement('div');
        emptyMsg.id = 'communes-empty-msg';
        emptyMsg.style.cssText = 'grid-column: 1 / -1; padding: 14px; color: #FF9900; font-family: var(--font-mono); font-size: 12px; background-color: rgba(255, 153, 0, 0.08); border: 1px solid var(--border-amber); border-radius: var(--radius-sm);';
        emptyMsg.innerHTML = 'No encontramos esa comuna en la lista rápida, ¡pero escríbenos por WhatsApp y confirmamos factibilidad técnica de inmediato!';
        communesGrid.appendChild(emptyMsg);
      } else if (matchCount > 0 && emptyMsg) {
        emptyMsg.remove();
      }
    });
  }

  // --- SCROLL SPY & STICKY HEADER OFFSET ---
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  
  if (sections.length > 0 && navLinks.length > 0) {
    window.addEventListener('scroll', () => {
      const scrollPosition = window.scrollY + 90;
      let currentId = '';
      
      for (let i = 0; i < sections.length; i++) {
        const top = sections[i].offsetTop;
        const height = sections[i].offsetHeight;
        if (scrollPosition >= top && scrollPosition < top + height) {
          currentId = sections[i].getAttribute('id');
          break;
        }
      }

      navLinks.forEach(link => {
        const href = link.getAttribute('href');
        const isMatch = href === `#${currentId}` || (currentId === 'faq' && href === '#preguntas');
        link.classList.toggle('active', isMatch);
      });
    }, { passive: true });
  }
});

// Phone Call Action Handler
(function() {
  const callBtn = document.getElementById('btn-call-trigger');
  if (!callBtn) return;

  const phoneNumber = '+56953797437';
  const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent) 
                   || (navigator.maxTouchPoints && navigator.maxTouchPoints > 2);

  callBtn.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();

    // 1. ALWAYS COPY TO CLIPBOARD AS GUARANTEED ACTION
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(phoneNumber).catch(function() {
        fallbackCopyText(phoneNumber);
      });
    } else {
      fallbackCopyText(phoneNumber);
    }

    // 2. DEVICE-SPECIFIC ACTION
    if (isMobile) {
      window.location.assign('tel:' + phoneNumber);
    } else {
      const textSpan = document.getElementById('call-btn-text');
      if (textSpan) {
        const originalText = textSpan.textContent;
        textSpan.textContent = "¡NÚMERO COPIADO!";
        setTimeout(function() {
          textSpan.textContent = originalText;
        }, 2200);
      }
    }
  });

  function fallbackCopyText(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
    } catch (err) {}
    document.body.removeChild(textArea);
  }
})();

// ==========================================================================
// MULTI-BRAND INTERACTIVE CAROUSEL: AUTO-SCROLL & ARROW NAVIGATION
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  const track = document.getElementById('brands-track');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');

  if (!track) return;

  let isUserInteracting = false;
  let resumeTimeout = null;
  const scrollStep = 1; // Velocidad de avance fluido

  function continuousScroll() {
    if (!isUserInteracting) {
      track.scrollLeft += scrollStep;
      // Reseteo al inicio del segundo set para un bucle continuo imperceptible
      if (track.scrollLeft >= track.scrollWidth / 2) {
        track.scrollLeft = 0;
      }
    }
    requestAnimationFrame(continuousScroll);
  }

  requestAnimationFrame(continuousScroll);

  // Pausa mientras el cursor o dedo interactúa
  track.addEventListener('mouseenter', () => isUserInteracting = true);
  track.addEventListener('mouseleave', () => isUserInteracting = false);
  track.addEventListener('touchstart', () => isUserInteracting = true, { passive: true });
  track.addEventListener('touchend', () => {
    clearTimeout(resumeTimeout);
    resumeTimeout = setTimeout(() => isUserInteracting = false, 1500);
  });

  // Flecha Izquierda (Retroceder)
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      isUserInteracting = true;
      track.scrollBy({ left: -280, behavior: 'smooth' });
      clearTimeout(resumeTimeout);
      resumeTimeout = setTimeout(() => isUserInteracting = false, 2500);
    });
  }

  // Flecha Derecha (Avanzar)
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      isUserInteracting = true;
      track.scrollBy({ left: 280, behavior: 'smooth' });
      clearTimeout(resumeTimeout);
      resumeTimeout = setTimeout(() => isUserInteracting = false, 2500);
    });
  }
});

// ==========================================================================
// FLUJO DE GEOLOCALIZACIÓN Y CONFIRMACIÓN PARA ASISTENCIA WHATSAPP
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  const requestLocationBtn = document.getElementById('btn-request-location') || 
                             document.querySelector('.btn-request-location') || 
                             Array.from(document.querySelectorAll('a, button')).find(el => el.textContent && el.textContent.includes('SOLICITAR TALLER EN MI UBICACIÓN'));
  const modal = document.getElementById('location-modal');
  const locationInput = document.getElementById('location-input');
  const cancelBtn = document.getElementById('cancel-location-btn');
  const sendBtn = document.getElementById('send-location-whatsapp-btn');
  const targetPhone = "56953797437";

  let mapLink = "";

  if (requestLocationBtn && modal) {
    requestLocationBtn.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Feedback visual inicial
      const originalText = requestLocationBtn.innerHTML;
      requestLocationBtn.innerHTML = "⏳ Obteniendo ubicación...";

      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            requestLocationBtn.innerHTML = originalText;
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            mapLink = `https://maps.google.com/?q=${lat},${lng}`;
            locationInput.value = `Mi ubicación actual (detectada por GPS):\n${mapLink}\n(Puedes agregar aquí referencias de calle o comuna)`;
            modal.style.display = 'flex';
          },
          (error) => {
            requestLocationBtn.innerHTML = originalText;
            mapLink = "";
            locationInput.value = "No se pudo obtener el GPS automáticamente. Escribe aquí tu comuna y dirección exacta:";
            modal.style.display = 'flex';
          },
          { enableHighAccuracy: true, timeout: 8000 }
        );
      } else {
        requestLocationBtn.innerHTML = originalText;
        mapLink = "";
        locationInput.value = "Escribe aquí tu comuna y dirección exacta:";
        modal.style.display = 'flex';
      }
    });

    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        modal.style.display = 'none';
      });
    }

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.style.display = 'none';
        }
      });
    }

    if (sendBtn) {
      sendBtn.addEventListener('click', () => {
        const details = encodeURIComponent(locationInput.value.trim());
        const message = `Hola Taller Móvil Pro, necesito asistencia técnica en mi ubicación:%0A%0A${details}`;
        const whatsappUrl = `https://wa.me/${targetPhone}?text=${message}`;
        window.open(whatsappUrl, '_blank');
        modal.style.display = 'none';
      });
    }
  }
});

