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
  const phoneNumber = '+56 9 8933 4099';

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

      const targetPhone = "56989334099";
      const message = `Hola, necesito asistencia técnica en terreno:\n\n• Vehículo/Equipo: ${vehiculoTipo || 'No especificado'} - ${marcaModelo || ''} (${ano || ''})\n• Problema / Falla: ${falla || 'Diagnóstico general'}\n• Ubicación: ${comuna || ''}, ${direccion || ''}\n\nFavor confirmar disponibilidad y presupuesto.`;
      const waUrl = `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;

      window.open(waUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    // 6. Phone Copy Button / Floating Phone Action
    const phoneBtn = e.target.closest('#copy-phone-btn, #btn-copy-phone, .phone-btn');
    if (phoneBtn) {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      if (!isMobile) {
        e.preventDefault();
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(phoneNumber.replace(/\s+/g, ''));
          } else {
            const textarea = document.createElement('textarea');
            textarea.value = phoneNumber.replace(/\s+/g, '');
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
          }
          const callText = document.getElementById('call-btn-text');
          if (callText) {
            const originalText = callText.textContent;
            callText.textContent = '¡NÚMERO COPIADO!';
            setTimeout(() => {
              callText.textContent = originalText;
            }, 2200);
          }
          showToast(`✓ Teléfono ${phoneNumber} copiado al portapapeles`);
        } catch (err) {
          showToast(`Llamar: ${phoneNumber}`);
        }
        return;
      }
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
  const callBtn = document.getElementById('copy-phone-btn') || document.getElementById('btn-call-trigger');
  if (!callBtn) return;

  const phoneNumber = '+56989334099';
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
  if (!track) return;

  let resumeTimeout = null;

  // Pausa en hover y touch
  track.addEventListener('mouseenter', () => {
    track.style.animationPlayState = 'paused';
  });

  track.addEventListener('mouseleave', () => {
    track.style.animationPlayState = 'running';
  });

  track.addEventListener('touchstart', () => {
    track.style.animationPlayState = 'paused';
    clearTimeout(resumeTimeout);
  }, { passive: true });

  track.addEventListener('touchend', () => {
    clearTimeout(resumeTimeout);
    resumeTimeout = setTimeout(() => {
      track.style.animationPlayState = 'running';
    }, 1500);
  });

  // Interacción al hacer clic en cualquier marca (.brand-carousel-item)
  track.querySelectorAll('.brand-carousel-item').forEach(item => {
    item.style.cursor = 'pointer';
    item.addEventListener('click', () => {
      const brandTag = item.querySelector('.brand-name');
      const brandName = brandTag ? brandTag.textContent.trim() : item.textContent.trim();
      const formInput = document.querySelector('.input-marca');

      if (formInput) {
        formInput.value = brandName;
        const typeBtn = Array.from(document.querySelectorAll('.vehicle-type-btn')).find(b => b.dataset.value === 'Auto particular');
        if (typeBtn) typeBtn.click();

        const contactSection = document.getElementById('contacto');
        if (contactSection) {
          contactSection.scrollIntoView({ behavior: 'smooth' });
          formInput.focus();
        }
      }
    });
  });
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
  const targetPhone = "56989334099";

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

// ==========================================================================
// ==========================================================================
// ACORDEÓN DE CATEGORÍAS Y CARRUSELES DE MARCAS (CAMIONES & MAQUINARIA)
// ==========================================================================
window.toggleCategoryAccordion = function(button) {
  const item = button.closest('.category-accordion-item');
  if (!item) return;
  const panel = item.querySelector('.category-panel');
  if (!panel) return;
  const chevron = button.querySelector('.chevron-icon');

  const isActive = item.classList.contains('active') || item.classList.contains('is-open');

  // Cerrar otros acordeones si se desea comportamiento único
  document.querySelectorAll('.category-accordion-item').forEach(openItem => {
    if (openItem !== item && (openItem.classList.contains('active') || openItem.classList.contains('is-open'))) {
      openItem.classList.remove('active', 'is-open');
      const otherPanel = openItem.querySelector('.category-panel');
      const otherChevron = openItem.querySelector('.chevron-icon');
      if (otherPanel) {
        otherPanel.style.maxHeight = null;
        otherPanel.style.borderTopColor = 'transparent';
      }
      if (otherChevron) {
        otherChevron.style.transform = 'rotate(0deg)';
        otherChevron.style.stroke = '#888888';
      }
      openItem.style.borderColor = '#222222';
    }
  });

  if (isActive) {
    panel.style.maxHeight = null;
    panel.style.borderTopColor = 'transparent';
    item.classList.remove('active', 'is-open');
    item.style.borderColor = '#222222';
    if (chevron) {
      chevron.style.transform = 'rotate(0deg)';
      chevron.style.stroke = '#888888';
    }
  } else {
    item.classList.add('active', 'is-open');
    item.style.borderColor = 'rgba(255, 153, 0, 0.5)';
    panel.style.borderTopColor = '#222222';
    panel.style.maxHeight = (panel.scrollHeight + 35) + 'px';
    if (chevron) {
      chevron.style.transform = 'rotate(180deg)';
      chevron.style.stroke = '#FF9900';
    }
  }
};

// Soporte de interacción táctil para pausar/reanudar los carruseles marquee
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.logo-marquee-container').forEach(container => {
    const track = container.querySelector('.logo-marquee-track');
    if (!track) return;
    container.addEventListener('touchstart', () => {
      track.style.animationPlayState = 'paused';
    }, { passive: true });
    container.addEventListener('touchend', () => {
      setTimeout(() => {
        track.style.animationPlayState = 'running';
      }, 1200);
    }, { passive: true });
  });
});


// ==========================================================================
// CORRECCIÓN FINAL Y DEFINITIVA DE LOS 3 CARRUSELES: EMBLEMAS OFICIALES REALES
// ==========================================================================
(function initRockSolidCarousels() {
  const livianos = [
    { name: "ACURA", img: "./logos/acura.png" },
    { name: "ALFA ROMEO", img: "./logos/alfa_romeo.png" },
    { name: "ASTON MARTIN", img: "./logos/aston_martin.png" },
    { name: "AUDI", img: "./logos/audi.png" },
    { name: "AVATR", img: "./logos/avatr.svg" },
    { name: "BAIC", img: "./logos/baic.png" },
    { name: "BENTLEY", img: "./logos/bentley.png" },
    { name: "BESTUNE", img: "./logos/bestune.png" },
    { name: "BMW", img: "./logos/bmw.png" },
    { name: "BYD", img: "./logos/byd.png" },
    { name: "CADILLAC", img: "./logos/cadillac.png" },
    { name: "CHANGAN", img: "./logos/changan.png" },
    { name: "CHERY", img: "./logos/chery.png" },
    { name: "CHEVROLET", img: "./logos/chevrolet.png" },
    { name: "CHRYSLER", img: "./logos/chrysler.png" },
    { name: "CITROËN", img: "./logos/citroen.png" },
    { name: "CUPRA", img: "./logos/cupra.png" },
    { name: "DEEPAL", img: "./logos/deepal.svg" },
    { name: "DFSK", img: "./logos/dfsk.svg" },
    { name: "DODGE", img: "./logos/dodge.png" },
    { name: "DONGFENG", img: "./logos/dongfeng.png" },
    { name: "FAW", img: "./logos/faw.png" },
    { name: "FERRARI", img: "./logos/ferrari.png" },
    { name: "FIAT", img: "./logos/fiat.png" },
    { name: "FORD", img: "./logos/ford.png" },
    { name: "FORTHING", img: "./logos/forthing.png" },
    { name: "FOTON", img: "./logos/foton.png" },
    { name: "GAC / AION", img: "./logos/gac_aion.png" },
    { name: "GEELY", img: "./logos/geely.png" },
    { name: "GENESIS", img: "./logos/genesis.png" },
    { name: "GMC", img: "./logos/gmc.png" },
    { name: "GREAT WALL", img: "./logos/great_wall.png" },
    { name: "HAVAL", img: "./logos/haval.png" },
    { name: "HONDA", img: "./logos/honda.png" },
    { name: "HONGQI", img: "./logos/hongqi.png" },
    { name: "HYUNDAI", img: "./logos/hyundai.png" },
    { name: "INFINITI", img: "./logos/infiniti.png" },
    { name: "ISUZU", img: "./logos/isuzu.png" },
    { name: "JAC", img: "./logos/jac.png" },
    { name: "JAECOO", img: "./logos/jaecoo.svg" },
    { name: "JAGUAR", img: "./logos/jaguar.png" },
    { name: "JEEP", img: "./logos/jeep.png" },
    { name: "JETOUR", img: "./logos/jetour.png" },
    { name: "JMC", img: "./logos/jmc.png" },
    { name: "KAIYI", img: "./logos/kaiyi.png" },
    { name: "KARRY", img: "./logos/karry.png" },
    { name: "KGM / SSANGYONG", img: "./logos/kgm_ssangyong.png" },
    { name: "KIA", img: "./logos/kia.png" },
    { name: "KYC", img: "./logos/kyc.png" },
    { name: "LADA", img: "./logos/lada.png" },
    { name: "LAMBORGHINI", img: "./logos/lamborghini.png" },
    { name: "LAND ROVER", img: "./logos/land_rover.png" },
    { name: "LEAPMOTOR", img: "./logos/leapmotor.png" },
    { name: "LEXUS", img: "./logos/lexus.png" },
    { name: "LIFAN", img: "./logos/lifan.png" },
    { name: "LINCOLN", img: "./logos/lincoln.png" },
    { name: "LIVAN", img: "./logos/livan.png" },
    { name: "LUCID", img: "./logos/lucid.png" },
    { name: "LYNK & CO", img: "./logos/lynk_co.svg" },
    { name: "MASERATI", img: "./logos/maserati.png" },
    { name: "MAXUS", img: "./logos/maxus.png" },
    { name: "MAZDA", img: "./logos/mazda.png" },
    { name: "MCLAREN", img: "./logos/mclaren.png" },
    { name: "MERCEDES-BENZ", img: "./logos/mercedes_benz.png" },
    { name: "MG", img: "./logos/mg.png" },
    { name: "MINI", img: "./logos/mini.png" },
    { name: "MITSUBISHI", img: "./logos/mitsubishi.png" },
    { name: "NISSAN", img: "./logos/nissan.png" },
    { name: "OMODA", img: "./logos/omoda.png" },
    { name: "OPEL", img: "./logos/opel.png" },
    { name: "PEUGEOT", img: "./logos/peugeot.png" },
    { name: "POLESTAR", img: "./logos/polestar.png" },
    { name: "PORSCHE", img: "./logos/porsche.png" },
    { name: "RAM", img: "./logos/ram.png" },
    { name: "RENAULT", img: "./logos/renault.png" },
    { name: "RIDDARA", img: "./logos/riddara.png" },
    { name: "RIVIAN", img: "./logos/rivian.png" },
    { name: "ROLLS-ROYCE", img: "./logos/rolls_royce.png" },
    { name: "SEAT", img: "./logos/seat.png" },
    { name: "SERES", img: "./logos/seres.png" },
    { name: "ŠKODA", img: "./logos/skoda.png" },
    { name: "SMART", img: "./logos/smart.png" },
    { name: "SOUEAST", img: "./logos/soueast.png" },
    { name: "SUBARU", img: "./logos/subaru.png" },
    { name: "SUZUKI", img: "./logos/suzuki.png" },
    { name: "TESLA", img: "./logos/tesla.png" },
    { name: "TOYOTA", img: "./logos/toyota.png" },
    { name: "VOLKSWAGEN", img: "./logos/volkswagen.png" },
    { name: "VOLVO", img: "./logos/volvo.png" },
    { name: "ZEEKR", img: "./logos/zeekr.png" },
    { name: "ZNA", img: "./logos/zna.png" }
  ];

  const camiones = [
    { name: "ASTRA", img: "./logos/astra.svg" },
    { name: "CHEVROLET", img: "./logos/chevrolet.png" },
    { name: "DAF", img: "./logos/daf.png" },
    { name: "DONGFENG", img: "./logos/dongfeng.png" },
    { name: "FAW", img: "./logos/faw.png" },
    { name: "FREIGHTLINER", img: "./logos/freightliner.png" },
    { name: "FUSO", img: "./logos/fuso.svg" },
    { name: "FOTON", img: "./logos/foton.png" },
    { name: "HINO", img: "./logos/hino.png" },
    { name: "HYUNDAI", img: "./logos/hyundai.png" },
    { name: "INTERNATIONAL", img: "./logos/international.png" },
    { name: "ISUZU", img: "./logos/isuzu.png" },
    { name: "IVECO", img: "./logos/iveco.png" },
    { name: "JAC", img: "./logos/jac.png" },
    { name: "JMC", img: "./logos/jmc.png" },
    { name: "KENWORTH", img: "./logos/kenworth.png" },
    { name: "MACK", img: "./logos/mack.png" },
    { name: "MAN", img: "./logos/man.png" },
    { name: "MAXUS", img: "./logos/maxus.png" },
    { name: "MERCEDES-BENZ", img: "./logos/mercedes_benz.png" },
    { name: "PETERBILT", img: "./logos/peterbilt.png" },
    { name: "RENAULT TRUCKS", img: "./logos/renault_trucks.png" },
    { name: "SCANIA", img: "./logos/scania.png" },
    { name: "SHACMAN", img: "./logos/shacman.png" },
    { name: "SINOTRUK", img: "./logos/sinotruk.png" },
    { name: "VOLKSWAGEN", img: "./logos/volkswagen.png" },
    { name: "VOLVO TRUCKS", img: "./logos/volvo_trucks.png" },
    { name: "YUTONG", img: "./logos/yutong.png" }
  ];

  const maquinaria = [
    { name: "AMMANN YANMAR", img: "./logos/ammann_yanmar.svg" },
    { name: "ATLAS COPCO", img: "./logos/atlas_copco.svg" },
    { name: "BOBCAT", img: "./logos/bobcat.png" },
    { name: "BOMAG", img: "./logos/bomag.svg" },
    { name: "CASE", img: "./logos/case.svg" },
    { name: "CAT", img: "./logos/cat.svg" },
    { name: "CLARK", img: "./logos/clark.jpg" },
    { name: "CNH INDUSTRIAL", img: "./logos/cnh_industrial.svg" },
    { name: "CUMMINS", img: "./logos/cummins.svg" },
    { name: "DAEWOO HEAVY", img: "./logos/daewoo_heavy.png" },
    { name: "DOOSAN", img: "./logos/doosan.svg" },
    { name: "HITACHI", img: "./logos/hitachi.svg" },
    { name: "HYSTER", img: "./logos/hyster.svg" },
    { name: "IHI", img: "./logos/ihi.svg" },
    { name: "JCB", img: "./logos/jcb.svg" },
    { name: "JOHN DEERE", img: "./logos/john_deere.svg" },
    { name: "KAWASAKI", img: "./logos/kawasaki.svg" },
    { name: "KOBELCO", img: "./logos/kobelco.svg" },
    { name: "KOMATSU", img: "./logos/komatsu.svg" },
    { name: "KUBOTA", img: "./logos/kubota.svg" },
    { name: "KYB", img: "./logos/kyb.svg" },
    { name: "LIEBHERR", img: "./logos/liebherr.svg" },
    { name: "LIUGONG", img: "./logos/liugong.svg" },
    { name: "LONKING", img: "./logos/lonking.svg" },
    { name: "LOVOL", img: "./logos/lovol.png" },
    { name: "MANITOU", img: "./logos/manitou.svg" },
    { name: "METSO", img: "./logos/metso.svg" },
    { name: "MITSUBISHI HEAVY", img: "./logos/mitsubishi_heavy.png" },
    { name: "NABTESCO", img: "./logos/nabtesco.svg" },
    { name: "NACHI", img: "./logos/nachi.svg" },
    { name: "NEW HOLLAND", img: "./logos/new_holland.png" },
    { name: "OM PIMESPO", img: "./logos/om_pimespo.svg" },
    { name: "PALFINGER", img: "./logos/palfinger.svg" },
    { name: "REXROTH", img: "./logos/rexroth.svg" },
    { name: "SANY", img: "./logos/sany.svg" },
    { name: "SDLG", img: "./logos/sdlg.svg" },
    { name: "SHANTUI", img: "./logos/shantui.svg" },
    { name: "SUMITOMO", img: "./logos/sumitomo.svg" },
    { name: "SUNWARD", img: "./logos/sunward.png" },
    { name: "TAKEUCHI", img: "./logos/takeuchi.svg" },
    { name: "TEREX", img: "./logos/terex.svg" },
    { name: "TOYOTA INDUSTRIAL", img: "./logos/toyota_industrial.png" },
    { name: "VOLVO CE", img: "./logos/volvo_ce.png" },
    { name: "XCMG", img: "./logos/xcmg.svg" },
    { name: "XGMA", img: "./logos/xgma.png" },
    { name: "YALE", img: "./logos/yale.png" },
    { name: "YANMAR", img: "./logos/yanmar.svg" },
    { name: "YUCHAI", img: "./logos/yuchai.png" },
    { name: "ZOOMLION", img: "./logos/zoomlion.png" }
  ];

  function buildTrack(targetId, list) {
    const el = document.getElementById(targetId);
    if (!el) return;

    // Se duplica para loop continuo infinito
    const items = [...list, ...list];
    const targetType = targetId.includes('camiones') ? 'Camión' : targetId.includes('maquinaria') ? 'Maquinaria' : 'Auto particular';

    el.innerHTML = items.map(item => `
      <div class="brand-item-clean" data-brand="${item.name}">
        <div class="brand-logo-frame-clean">
          <img src="${item.img}" alt="${item.name}" loading="lazy" onerror="this.style.display='none';">
        </div>
        <span class="brand-label-clean">${item.name}</span>
      </div>
    `).join('');

    // Click para autocompletar formulario
    el.querySelectorAll('.brand-item-clean').forEach(card => {
      card.addEventListener('click', () => {
        const brandName = card.dataset.brand || card.querySelector('.brand-label-clean').textContent.trim();
        const formInput = document.querySelector('.input-marca');
        if (formInput) {
          formInput.value = brandName;
          const typeBtn = Array.from(document.querySelectorAll('.vehicle-type-btn')).find(b => b.dataset.value === targetType);
          if (typeBtn) typeBtn.click();

          const contactSection = document.getElementById('contacto');
          if (contactSection) {
            contactSection.scrollIntoView({ behavior: 'smooth' });
            formInput.focus();
          }
        }
      });
    });
  }

  // CONTROL DE ARRASTRE MANUAL (DRAG & TOUCH) SIN BARRAS VISIBLES
  function initDragAndTouch() {
    document.querySelectorAll('.brand-carousel-viewport').forEach(viewport => {
      let isDown = false;
      let startX, scrollLeft;
      const track = viewport.querySelector('.brand-marquee-inner');

      viewport.addEventListener('mousedown', (e) => {
        isDown = true;
        viewport.classList.add('is-dragging');
        startX = e.pageX - viewport.offsetLeft;
        scrollLeft = viewport.scrollLeft;
      });

      viewport.addEventListener('mouseleave', () => {
        isDown = false;
        viewport.classList.remove('is-dragging');
      });

      viewport.addEventListener('mouseup', () => {
        isDown = false;
        viewport.classList.remove('is-dragging');
      });

      viewport.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - viewport.offsetLeft;
        const walk = (x - startX) * 1.6;
        viewport.scrollLeft = scrollLeft - walk;
      });

      // Soporte táctil móvil fluido
      let touchStartX = 0;
      let touchScrollLeft = 0;
      viewport.addEventListener('touchstart', (e) => {
        viewport.classList.add('is-dragging');
        if (e.touches && e.touches[0]) {
          touchStartX = e.touches[0].pageX - viewport.offsetLeft;
          touchScrollLeft = viewport.scrollLeft;
        }
      }, { passive: true });

      viewport.addEventListener('touchmove', (e) => {
        if (e.touches && e.touches[0]) {
          const x = e.touches[0].pageX - viewport.offsetLeft;
          const walk = (x - touchStartX) * 1.5;
          viewport.scrollLeft = touchScrollLeft - walk;
        }
      }, { passive: true });

      viewport.addEventListener('touchend', () => {
        viewport.classList.remove('is-dragging');
      }, { passive: true });
    });
  }

  function start() {
    buildTrack("track-livianos", livianos);
    buildTrack("track-camiones", camiones);
    buildTrack("track-maquinaria", maquinaria);
    initDragAndTouch();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();




