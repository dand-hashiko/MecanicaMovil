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
// RESTAURACIÓN DE INSIGNIAS AUTOMOTRICES REALES CON EMBLEMAS ORIGINALES
// ==========================================================================
(function injectRealEmblems() {
  const CDN = "https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized";
  const W = (url) => `https://wsrv.nl/?url=${encodeURIComponent(url)}&output=png&w=160&fit=contain`;

  // 1. VEHÍCULOS LIVIANOS / SUV / PICK-UP (90 MARCAS CON SUS LOGOS REALES)
  const livianos = [
    { name: "ACURA", img: `${CDN}/acura.png` },
    { name: "ALFA ROMEO", img: `${CDN}/alfa-romeo.png` },
    { name: "ASTON MARTIN", img: `${CDN}/aston-martin.png` },
    { name: "AUDI", img: `${CDN}/audi.png` },
    { name: "AVATR", img: W("https://upload.wikimedia.org/wikipedia/commons/2/2f/Avatr_Technology_logo.png") },
    { name: "BAIC", img: `${CDN}/baic.png` },
    { name: "BENTLEY", img: `${CDN}/bentley.png` },
    { name: "BESTUNE", img: `${CDN}/faw.png` },
    { name: "BMW", img: `${CDN}/bmw.png` },
    { name: "BYD", img: `${CDN}/byd.png` },
    { name: "CADILLAC", img: `${CDN}/cadillac.png` },
    { name: "CHANGAN", img: `${CDN}/changan.png` },
    { name: "CHERY", img: `${CDN}/chery.png` },
    { name: "CHEVROLET", img: `${CDN}/chevrolet.png` },
    { name: "CHRYSLER", img: `${CDN}/chrysler.png` },
    { name: "CITROËN", img: `${CDN}/citroen.png` },
    { name: "CUPRA", img: `${CDN}/cupra.png` },
    { name: "DEEPAL", img: W("https://upload.wikimedia.org/wikipedia/commons/f/f6/Deepal_logo.png") },
    { name: "DFSK", img: W("https://upload.wikimedia.org/wikipedia/commons/e/e4/DFSK_logo.svg") },
    { name: "DODGE", img: `${CDN}/dodge.png` },
    { name: "DONGFENG", img: `${CDN}/dongfeng.png` },
    { name: "FAW", img: `${CDN}/faw.png` },
    { name: "FERRARI", img: `${CDN}/ferrari.png` },
    { name: "FIAT", img: `${CDN}/fiat.png` },
    { name: "FORD", img: `${CDN}/ford.png` },
    { name: "FORTHING", img: `${CDN}/dongfeng.png` },
    { name: "FOTON", img: `${CDN}/foton.png` },
    { name: "GAC / AION", img: `${CDN}/gac-group.png` },
    { name: "GEELY", img: `${CDN}/geely.png` },
    { name: "GENESIS", img: `${CDN}/genesis.png` },
    { name: "GMC", img: `${CDN}/gmc.png` },
    { name: "GREAT WALL", img: `${CDN}/great-wall.png` },
    { name: "HAVAL", img: `${CDN}/haval.png` },
    { name: "HONDA", img: `${CDN}/honda.png` },
    { name: "HONGQI", img: `${CDN}/hongqi.png` },
    { name: "HYUNDAI", img: `${CDN}/hyundai.png` },
    { name: "INFINITI", img: `${CDN}/infiniti.png` },
    { name: "ISUZU", img: `${CDN}/isuzu.png` },
    { name: "JAC", img: `${CDN}/jac.png` },
    { name: "JAECOO", img: W("https://upload.wikimedia.org/wikipedia/commons/9/9c/Jaecoo_Logo.png") },
    { name: "JAGUAR", img: `${CDN}/jaguar.png` },
    { name: "JEEP", img: `${CDN}/jeep.png` },
    { name: "JETOUR", img: W("https://upload.wikimedia.org/wikipedia/commons/3/37/Jetour_logo.svg") },
    { name: "JMC", img: `${CDN}/jmc.png` },
    { name: "KAIYI", img: W("https://upload.wikimedia.org/wikipedia/commons/8/86/Kaiyi_Auto_logo.png") },
    { name: "KARRY", img: `${CDN}/chery.png` },
    { name: "KGM / SSANGYONG", img: `${CDN}/ssangyong.png` },
    { name: "KIA", img: `${CDN}/kia.png` },
    { name: "KYC", img: `${CDN}/changan.png` },
    { name: "LADA", img: `${CDN}/lada.png` },
    { name: "LAMBORGHINI", img: `${CDN}/lamborghini.png` },
    { name: "LAND ROVER", img: `${CDN}/land-rover.png` },
    { name: "LEAPMOTOR", img: W("https://upload.wikimedia.org/wikipedia/commons/3/36/Leapmotor_logo.svg") },
    { name: "LEXUS", img: `${CDN}/lexus.png` },
    { name: "LIFAN", img: `${CDN}/lifan.png` },
    { name: "LINCOLN", img: `${CDN}/lincoln.png` },
    { name: "LIVAN", img: `${CDN}/geely.png` },
    { name: "LUCID", img: `${CDN}/lucid.png` },
    { name: "LYNK & CO", img: W("https://upload.wikimedia.org/wikipedia/commons/8/8c/Lynk_%26_Co_logo.svg") },
    { name: "MASERATI", img: `${CDN}/maserati.png` },
    { name: "MAXUS", img: `${CDN}/maxus.png` },
    { name: "MAZDA", img: `${CDN}/mazda.png` },
    { name: "MCLAREN", img: `${CDN}/mclaren.png` },
    { name: "MERCEDES-BENZ", img: `${CDN}/mercedes-benz.png` },
    { name: "MG", img: `${CDN}/mg.png` },
    { name: "MINI", img: `${CDN}/mini.png` },
    { name: "MITSUBISHI", img: `${CDN}/mitsubishi.png` },
    { name: "NISSAN", img: `${CDN}/nissan.png` },
    { name: "OMODA", img: W("https://upload.wikimedia.org/wikipedia/commons/e/ec/Omoda_logo.svg") },
    { name: "OPEL", img: `${CDN}/opel.png` },
    { name: "PEUGEOT", img: `${CDN}/peugeot.png` },
    { name: "POLESTAR", img: `${CDN}/polestar.png` },
    { name: "PORSCHE", img: `${CDN}/porsche.png` },
    { name: "RAM", img: `${CDN}/ram.png` },
    { name: "RENAULT", img: `${CDN}/renault.png` },
    { name: "RIDDARA", img: `${CDN}/geely.png` },
    { name: "RIVIAN", img: `${CDN}/rivian.png` },
    { name: "ROLLS-ROYCE", img: `${CDN}/rolls-royce.png` },
    { name: "SEAT", img: `${CDN}/seat.png` },
    { name: "SERES", img: W("https://upload.wikimedia.org/wikipedia/commons/6/69/Seres_logo.svg") },
    { name: "ŠKODA", img: `${CDN}/skoda.png` },
    { name: "SMART", img: `${CDN}/smart.png` },
    { name: "SOUEAST", img: `${CDN}/soueast.png` },
    { name: "SUBARU", img: `${CDN}/subaru.png` },
    { name: "SUZUKI", img: `${CDN}/suzuki.png` },
    { name: "TESLA", img: `${CDN}/tesla.png` },
    { name: "TOYOTA", img: `${CDN}/toyota.png` },
    { name: "VOLKSWAGEN", img: `${CDN}/volkswagen.png` },
    { name: "VOLVO", img: `${CDN}/volvo.png` },
    { name: "ZEEKR", img: W("https://upload.wikimedia.org/wikipedia/commons/d/d4/Zeekr_logo.svg") },
    { name: "ZNA", img: `${CDN}/dongfeng.png` }
  ];

  // 2. CAMIONES Y TRACTOCAMIONES (28 MARCAS CON SUS LOGOS REALES)
  const camiones = [
    { name: "ASTRA", img: W("https://upload.wikimedia.org/wikipedia/commons/b/b3/Astra_Veicoli_Industriali_logo.svg") },
    { name: "CHEVROLET CAMIONES", img: `${CDN}/chevrolet.png` },
    { name: "DAF", img: `${CDN}/daf.png` },
    { name: "DONGFENG", img: `${CDN}/dongfeng.png` },
    { name: "FAW", img: `${CDN}/faw.png` },
    { name: "FREIGHTLINER", img: `${CDN}/freightliner.png` },
    { name: "FUSO", img: `${CDN}/fuso.png` },
    { name: "FOTON", img: `${CDN}/foton.png` },
    { name: "HINO", img: `${CDN}/hino.png` },
    { name: "HYUNDAI CAMIONES", img: `${CDN}/hyundai.png` },
    { name: "INTERNATIONAL", img: W("https://upload.wikimedia.org/wikipedia/commons/4/41/Navistar_International_logo.svg") },
    { name: "ISUZU", img: `${CDN}/isuzu.png` },
    { name: "IVECO", img: `${CDN}/iveco.png` },
    { name: "JAC CAMIONES", img: `${CDN}/jac.png` },
    { name: "JMC CAMIONES", img: `${CDN}/jmc.png` },
    { name: "KENWORTH", img: `${CDN}/kenworth.png` },
    { name: "MACK", img: `${CDN}/mack.png` },
    { name: "MAN", img: `${CDN}/man.png` },
    { name: "MAXUS", img: `${CDN}/maxus.png` },
    { name: "MERCEDES-BENZ", img: `${CDN}/mercedes-benz.png` },
    { name: "PETERBILT", img: `${CDN}/peterbilt.png` },
    { name: "RENAULT TRUCKS", img: `${CDN}/renault.png` },
    { name: "SCANIA", img: `${CDN}/scania.png` },
    { name: "SHACMAN", img: W("https://upload.wikimedia.org/wikipedia/commons/7/75/Shaanxi_Automobile_Group_logo.svg") },
    { name: "SINOTRUK", img: W("https://upload.wikimedia.org/wikipedia/commons/2/2c/Sinotruk_logo.svg") },
    { name: "VOLKSWAGEN", img: `${CDN}/volkswagen.png` },
    { name: "VOLVO TRUCKS", img: `${CDN}/volvo.png` },
    { name: "YUTONG", img: W("https://upload.wikimedia.org/wikipedia/commons/0/07/Yutong_logo.svg") }
  ];

  // 3. MAQUINARIA PESADA, CONSTRUCCIÓN E INDUSTRIAL (48 MARCAS CON SUS LOGOS REALES)
  const maquinaria = [
    { name: "AMMANN YANMAR", img: W("https://upload.wikimedia.org/wikipedia/commons/3/3c/Yanmar_logo.svg") },
    { name: "ATLAS COPCO", img: W("https://upload.wikimedia.org/wikipedia/commons/a/ae/Atlas_Copco_logo.svg") },
    { name: "BOBCAT", img: W("https://upload.wikimedia.org/wikipedia/commons/e/e0/Bobcat_Company_logo.svg") },
    { name: "BOMAG", img: W("https://upload.wikimedia.org/wikipedia/commons/4/47/Bomag_Logo.svg") },
    { name: "CASE CONSTRUCTION", img: W("https://upload.wikimedia.org/wikipedia/commons/3/30/Case_Construction_logo.svg") },
    { name: "CAT (CATERPILLAR)", img: W("https://upload.wikimedia.org/wikipedia/commons/a/a2/Caterpillar_logo.svg") },
    { name: "CLARK", img: W("https://upload.wikimedia.org/wikipedia/commons/b/b5/Clark_Material_Handling_Company_logo.svg") },
    { name: "CNH INDUSTRIAL", img: W("https://upload.wikimedia.org/wikipedia/commons/9/96/CNH_Industrial_logo.svg") },
    { name: "CUMMINS", img: W("https://upload.wikimedia.org/wikipedia/commons/8/83/Cummins_logo.svg") },
    { name: "DAEWOO HEAVY", img: `${CDN}/daewoo.png` },
    { name: "DOOSAN", img: W("https://upload.wikimedia.org/wikipedia/commons/d/df/Doosan_logo.svg") },
    { name: "HITACHI", img: W("https://upload.wikimedia.org/wikipedia/commons/8/87/Hitachi_logo.svg") },
    { name: "HYSTER", img: W("https://upload.wikimedia.org/wikipedia/commons/7/77/Hyster_logo.svg") },
    { name: "IHI", img: W("https://upload.wikimedia.org/wikipedia/commons/9/90/IHI_Corporation_logo.svg") },
    { name: "JCB", img: W("https://upload.wikimedia.org/wikipedia/commons/9/90/JCB_logo.svg") },
    { name: "JOHN DEERE", img: W("https://upload.wikimedia.org/wikipedia/commons/b/b3/John_Deere_logo.svg") },
    { name: "KAWASAKI", img: W("https://upload.wikimedia.org/wikipedia/commons/4/45/Kawasaki_Heavy_Industries_logo.svg") },
    { name: "KOBELCO", img: W("https://upload.wikimedia.org/wikipedia/commons/8/84/Kobelco_logo.svg") },
    { name: "KOMATSU", img: W("https://upload.wikimedia.org/wikipedia/commons/c/c5/Komatsu_logo.svg") },
    { name: "KUBOTA", img: W("https://upload.wikimedia.org/wikipedia/commons/5/5a/Kubota_logo.svg") },
    { name: "KYB (KAYABA)", img: W("https://upload.wikimedia.org/wikipedia/commons/8/89/KYB_Corporation_logo.svg") },
    { name: "LIEBHERR", img: W("https://upload.wikimedia.org/wikipedia/commons/9/90/Liebherr_Logo.svg") },
    { name: "LIUGONG", img: W("https://upload.wikimedia.org/wikipedia/commons/d/d7/LiuGong_logo.svg") },
    { name: "LONKING", img: W("https://upload.wikimedia.org/wikipedia/commons/2/2f/Lonking_logo.png") },
    { name: "LOVOL", img: W("https://upload.wikimedia.org/wikipedia/commons/f/f6/Lovol_logo.png") },
    { name: "MANITOU", img: W("https://upload.wikimedia.org/wikipedia/commons/f/fc/Manitou_Group_logo.svg") },
    { name: "METSO", img: W("https://upload.wikimedia.org/wikipedia/commons/4/47/Metso_Outotec_logo.svg") },
    { name: "MITSUBISHI HEAVY", img: `${CDN}/mitsubishi.png` },
    { name: "NABTESCO", img: W("https://upload.wikimedia.org/wikipedia/commons/5/59/Nabtesco_logo.svg") },
    { name: "NACHI", img: W("https://upload.wikimedia.org/wikipedia/commons/1/1a/Nachi-Fujikoshi_logo.svg") },
    { name: "NEW HOLLAND", img: W("https://upload.wikimedia.org/wikipedia/commons/0/0d/New_Holland_Agriculture_logo.svg") },
    { name: "OM PIMESPO", img: W("https://upload.wikimedia.org/wikipedia/commons/1/14/KION_Group_logo.svg") },
    { name: "PALFINGER", img: W("https://upload.wikimedia.org/wikipedia/commons/d/d5/Palfinger_logo.svg") },
    { name: "REXROTH (BOSCH)", img: W("https://upload.wikimedia.org/wikipedia/commons/b/b3/Bosch_Rexroth_logo.svg") },
    { name: "SANY", img: W("https://upload.wikimedia.org/wikipedia/commons/7/75/Sany_Heavy_Industry_logo.svg") },
    { name: "SDLG", img: W("https://upload.wikimedia.org/wikipedia/commons/7/71/SDLG_logo.png") },
    { name: "SHANTUI", img: W("https://upload.wikimedia.org/wikipedia/commons/e/ec/Shantui_logo.png") },
    { name: "SUMITOMO", img: W("https://upload.wikimedia.org/wikipedia/commons/5/50/Sumitomo_Group_logo.svg") },
    { name: "SUNWARD", img: W("https://upload.wikimedia.org/wikipedia/commons/9/97/Sunward_logo.png") },
    { name: "TAKEUCHI", img: W("https://upload.wikimedia.org/wikipedia/commons/e/e4/Takeuchi_logo.svg") },
    { name: "TEREX", img: W("https://upload.wikimedia.org/wikipedia/commons/2/22/Terex_logo.svg") },
    { name: "TOYOTA INDUSTRIAL", img: `${CDN}/toyota.png` },
    { name: "VOLVO CE", img: `${CDN}/volvo.png` },
    { name: "XCMG", img: W("https://upload.wikimedia.org/wikipedia/commons/b/b0/XCMG_logo.svg") },
    { name: "XGMA", img: W("https://upload.wikimedia.org/wikipedia/commons/e/e8/XGMA_logo.png") },
    { name: "YALE", img: W("https://upload.wikimedia.org/wikipedia/commons/a/af/Yale_Materials_Handling_logo.svg") },
    { name: "YANMAR", img: W("https://upload.wikimedia.org/wikipedia/commons/3/3c/Yanmar_logo.svg") },
    { name: "YUCHAI HEAVY", img: W("https://upload.wikimedia.org/wikipedia/commons/5/51/Yuchai_logo.png") },
    { name: "ZOOMLION", img: W("https://upload.wikimedia.org/wikipedia/commons/0/05/Zoomlion_logo.svg") }
  ];

  function buildTrack(targetId, list) {
    const el = document.getElementById(targetId);
    if (!el) return;

    // Se duplica el array para lograr el loop continuo infinito sin cortes
    const trackItems = [...list, ...list];
    const targetType = targetId.includes('camiones') ? 'Camión' : targetId.includes('maquinaria') ? 'Maquinaria' : 'Auto particular';

    const itemsHtml = trackItems.map(item => `
      <div class="brand-item-real" data-brand="${item.name}" data-target-type="${targetType}">
        <div class="brand-real-logo-box">
          <img src="${item.img}" alt="${item.name}" loading="lazy" onerror="this.style.opacity='0.5';">
        </div>
        <span class="brand-real-name">${item.name}</span>
      </div>
    `).join('');

    let trackEl = el.classList.contains('brand-marquee-inner')
      ? el
      : el.querySelector('.brand-marquee-inner');

    if (trackEl) {
      trackEl.innerHTML = itemsHtml;
    } else {
      el.innerHTML = `
        <div class="brand-carousel-viewport">
          <div class="brand-marquee-inner">
            ${itemsHtml}
          </div>
        </div>
      `;
      trackEl = el.querySelector('.brand-marquee-inner');
    }

    // Auto-completar formulario al pulsar una marca
    (trackEl || el).querySelectorAll('.brand-item-real').forEach(card => {
      card.addEventListener('click', () => {
        const brandName = card.dataset.brand || card.querySelector('.brand-real-name').textContent.trim();
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

  // Soporte de arrastre táctil y mouse drag sin scrollbars
  function enableDragAndTouch() {
    document.querySelectorAll('.brand-carousel-viewport').forEach(viewport => {
      const track = viewport.querySelector('.brand-marquee-inner');
      if (!track) return;

      let isDown = false;
      let startX = 0;
      let baseTranslate = 0;

      function getTranslateX() {
        const style = window.getComputedStyle(track);
        if (window.DOMMatrixReadOnly) {
          try {
            const matrix = new DOMMatrixReadOnly(style.transform);
            return matrix.m41 || 0;
          } catch (e) {
            return 0;
          }
        }
        return 0;
      }

      // Soporte Touch (Móvil)
      viewport.addEventListener('touchstart', (e) => {
        track.style.animationPlayState = 'paused';
        isDown = true;
        startX = e.touches[0].pageX;
        baseTranslate = getTranslateX();
      }, { passive: true });

      viewport.addEventListener('touchmove', (e) => {
        if (!isDown) return;
        const diff = e.touches[0].pageX - startX;
        track.style.transform = `translateX(${baseTranslate + diff}px)`;
      }, { passive: true });

      viewport.addEventListener('touchend', () => {
        isDown = false;
        setTimeout(() => {
          track.style.animationPlayState = 'running';
          track.style.transform = '';
        }, 1200);
      }, { passive: true });

      // Soporte Drag Mouse (Desktop)
      viewport.addEventListener('mousedown', (e) => {
        isDown = true;
        track.style.cursor = 'grabbing';
        track.style.animationPlayState = 'paused';
        startX = e.pageX;
        baseTranslate = getTranslateX();
      });

      window.addEventListener('mouseup', () => {
        if (!isDown) return;
        isDown = false;
        track.style.cursor = 'grab';
        setTimeout(() => {
          track.style.animationPlayState = 'running';
          track.style.transform = '';
        }, 800);
      });

      viewport.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const diff = e.pageX - startX;
        track.style.transform = `translateX(${baseTranslate + diff}px)`;
      });
    });
  }

  function start() {
    buildTrack("track-livianos", livianos);
    buildTrack("track-camiones", camiones);
    buildTrack("track-maquinaria", maquinaria);
    enableDragAndTouch();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();




