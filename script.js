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


function initMiniBrandCarousels() {
  const wrappers = document.querySelectorAll('.mini-carousel-wrapper');
  wrappers.forEach(wrapper => {
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;
    let isHovered = false;
    let scrollDirection = 1;

    // Arrastre con mouse (drag to scroll)
    wrapper.addEventListener('mousedown', (e) => {
      isDown = true;
      wrapper.classList.add('is-dragging');
      startX = e.pageX - wrapper.offsetLeft;
      scrollLeft = wrapper.scrollLeft;
    });

    wrapper.addEventListener('mouseleave', () => {
      isDown = false;
      isHovered = false;
      wrapper.classList.remove('is-dragging');
    });

    wrapper.addEventListener('mouseenter', () => {
      isHovered = true;
    });

    window.addEventListener('mouseup', () => {
      if (isDown) {
        isDown = false;
        wrapper.classList.remove('is-dragging');
      }
    });

    wrapper.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - wrapper.offsetLeft;
      const walk = (x - startX) * 1.5;
      wrapper.scrollLeft = scrollLeft - walk;
    });

    // Soporte táctil / touch swipe
    wrapper.addEventListener('touchstart', () => {
      isHovered = true;
    }, { passive: true });

    wrapper.addEventListener('touchend', () => {
      setTimeout(() => { isHovered = false; }, 1500);
    }, { passive: true });

    // Avance fluido continuo tipo marquee
    function stepMarquee() {
      if (!isDown && !isHovered) {
        const maxScroll = wrapper.scrollWidth - wrapper.clientWidth;
        if (maxScroll > 0) {
          wrapper.scrollLeft += 0.5 * scrollDirection;
          if (wrapper.scrollLeft >= maxScroll - 1) {
            scrollDirection = -1;
          } else if (wrapper.scrollLeft <= 1) {
            scrollDirection = 1;
          }
        }
      }
      requestAnimationFrame(stepMarquee);
    }
    requestAnimationFrame(stepMarquee);
  });

  // Interacción al hacer clic en cualquier insignia de marca
  document.querySelectorAll('.brand-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const brandName = pill.textContent.trim();
      const formInput = document.querySelector('.input-marca');
      const itemContainer = pill.closest('.category-accordion-item');
      const isTruck = itemContainer && itemContainer.textContent.includes('CAMIONES');
      
      if (formInput) {
        formInput.value = brandName;
        const targetType = isTruck ? 'Camión' : 'Maquinaria';
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

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMiniBrandCarousels);
} else {
  initMiniBrandCarousels();
}

// ==========================================================================
// RENDERIZADO DINÁMICO DE LAS 76 MARCAS VECTORIALES (CAMIONES Y MAQUINARIA)
// ==========================================================================
function renderAllHeavyBrands() {
  // Lista completa 1: 28 Marcas de Camiones y Tractocamiones
  const camionesBrands = [
    { name: "ASTRA", badge: "ASTRA", color: "#EF4444", shape: "shield" },
    { name: "CHEVROLET CAMIONES", badge: "CHEVY", color: "#EAB308", shape: "cross" },
    { name: "DAF", badge: "DAF", color: "#3B82F6", shape: "rect" },
    { name: "DONGFENG", badge: "DFM", color: "#EF4444", shape: "circle" },
    { name: "FAW CAMIONES", badge: "FAW", color: "#38BDF8", shape: "wings" },
    { name: "FREIGHTLINER", badge: "FTL", color: "#E5E7EB", shape: "rect" },
    { name: "FUSO", badge: "FUSO", color: "#EF4444", shape: "diamond" },
    { name: "FOTON", badge: "FOTON", color: "#38BDF8", shape: "triangle" },
    { name: "HINO", badge: "HINO", color: "#EF4444", shape: "horns" },
    { name: "HYUNDAI CAMIONES", badge: "H", color: "#3B82F6", shape: "oval" },
    { name: "INTERNATIONAL", badge: "INTL", color: "#FF9900", shape: "diamond" },
    { name: "ISUZU", badge: "ISUZU", color: "#EF4444", shape: "rect" },
    { name: "IVECO", badge: "IVECO", color: "#3B82F6", shape: "rect" },
    { name: "JAC CAMIONES", badge: "JAC", color: "#EF4444", shape: "star" },
    { name: "JMC CAMIONES", badge: "JMC", color: "#EF4444", shape: "triangle" },
    { name: "KENWORTH", badge: "KW", color: "#EF4444", shape: "circle" },
    { name: "MACK", badge: "MACK", color: "#E5E7EB", shape: "oval" },
    { name: "MAN", badge: "MAN", color: "#38BDF8", shape: "arch" },
    { name: "MAXUS", badge: "MAXUS", color: "#38BDF8", shape: "triangle" },
    { name: "MERCEDES-BENZ", badge: "MB", color: "#FFFFFF", shape: "star3" },
    { name: "PETERBILT", badge: "PETE", color: "#EF4444", shape: "oval" },
    { name: "RENAULT TRUCKS", badge: "RENAULT", color: "#EF4444", shape: "diamond" },
    { name: "SCANIA", badge: "SCANIA", color: "#3B82F6", shape: "circle" },
    { name: "SHACMAN", badge: "SHAC", color: "#38BDF8", shape: "shield" },
    { name: "SINOTRUK", badge: "CNHTC", color: "#10B981", shape: "triangle" },
    { name: "VW CAMIONES Y BUSES", badge: "VW", color: "#38BDF8", shape: "circle" },
    { name: "VOLVO TRUCKS", badge: "VOLVO", color: "#FFFFFF", shape: "iron" },
    { name: "YUTONG", badge: "YUTONG", color: "#3B82F6", shape: "arch" }
  ];

  // Lista completa 2: 48 Marcas de Maquinaria Pesada, Construcción e Industrial
  const maquinariaBrands = [
    { name: "AMMANN YANMAR", badge: "AMMANN", color: "#EF4444", shape: "triangle" },
    { name: "ATLAS COPCO", badge: "ATLAS", color: "#0EA5E9", shape: "rect" },
    { name: "BOBCAT", badge: "BOBCAT", color: "#EF4444", shape: "shield" },
    { name: "BOMAG", badge: "BOMAG", color: "#FBBF24", shape: "diamond" },
    { name: "CASE CONSTRUCTION", badge: "CASE", color: "#D97706", shape: "rect" },
    { name: "CAT (CATERPILLAR)", badge: "CAT", color: "#FFCC00", shape: "triangle" },
    { name: "CLARK", badge: "CLARK", color: "#84CC16", shape: "oval" },
    { name: "CNH INDUSTRIAL", badge: "CNH", color: "#EF4444", shape: "rect" },
    { name: "CUMMINS", badge: "C", color: "#EF4444", shape: "circle" },
    { name: "DAEWOO HEAVY", badge: "DAEWOO", color: "#38BDF8", shape: "arch" },
    { name: "DOOSAN", badge: "DOOSAN", color: "#0EA5E9", shape: "rect" },
    { name: "HITACHI", badge: "HITACHI", color: "#F97316", shape: "circle" },
    { name: "HYSTER", badge: "HYSTER", color: "#FBBF24", shape: "shield" },
    { name: "IHI", badge: "IHI", color: "#3B82F6", shape: "rect" },
    { name: "JCB", badge: "JCB", color: "#FBBF24", shape: "rect" },
    { name: "JOHN DEERE", badge: "DEERE", color: "#22C55E", shape: "shield" },
    { name: "KAWASAKI", badge: "KHI", color: "#EF4444", shape: "rect" },
    { name: "KOBELCO", badge: "KOBELCO", color: "#0EA5E9", shape: "circle" },
    { name: "KOMATSU", badge: "KOMATSU", color: "#2563EB", shape: "rect" },
    { name: "KUBOTA", badge: "KUBOTA", color: "#10B981", shape: "oval" },
    { name: "KYB (KAYABA)", badge: "KYB", color: "#EF4444", shape: "diamond" },
    { name: "LIEBHERR", badge: "LIEBHERR", color: "#FBBF24", shape: "rect" },
    { name: "LIUGONG", badge: "LIUGONG", color: "#3B82F6", shape: "shield" },
    { name: "LONKING", badge: "LONKING", color: "#38BDF8", shape: "diamond" },
    { name: "LOVOL", badge: "LOVOL", color: "#E5E7EB", shape: "oval" },
    { name: "MANITOU", badge: "MANITOU", color: "#EF4444", shape: "circle" },
    { name: "METSO", badge: "METSO", color: "#F97316", shape: "arch" },
    { name: "MITSUBISHI HEAVY", badge: "MHI", color: "#EF4444", shape: "diamond" },
    { name: "NABTESCO", badge: "NABTESCO", color: "#0EA5E9", shape: "rect" },
    { name: "NACHI", badge: "NACHI", color: "#EF4444", shape: "circle" },
    { name: "NEW HOLLAND", badge: "NH", color: "#FBBF24", shape: "wings" },
    { name: "OM PIMESPO", badge: "OM", color: "#3B82F6", shape: "oval" },
    { name: "PALFINGER", badge: "PALFINGER", color: "#FBBF24", shape: "rect" },
    { name: "REXROTH (BOSCH)", badge: "REXROTH", color: "#38BDF8", shape: "circle" },
    { name: "SANY", badge: "SANY", color: "#EF4444", shape: "star3" },
    { name: "SDLG", badge: "SDLG", color: "#EF4444", shape: "triangle" },
    { name: "SHANTUI", badge: "SHANTUI", color: "#FBBF24", shape: "shield" },
    { name: "SUMITOMO", badge: "SUMITOMO", color: "#0EA5E9", shape: "diamond" },
    { name: "SUNWARD", badge: "SUNWARD", color: "#2563EB", shape: "rect" },
    { name: "TAKEUCHI", badge: "TAKEUCHI", color: "#EF4444", shape: "rect" },
    { name: "TEREX", badge: "TEREX", color: "#EF4444", shape: "triangle" },
    { name: "TOYOTA INDUSTRIAL", badge: "TOYOTA", color: "#EF4444", shape: "oval" },
    { name: "VOLVO CE", badge: "VOLVO", color: "#FFFFFF", shape: "iron" },
    { name: "XCMG", badge: "XCMG", color: "#FBBF24", shape: "diamond" },
    { name: "XGMA", badge: "XGMA", color: "#3B82F6", shape: "shield" },
    { name: "YALE", badge: "YALE", color: "#FBBF24", shape: "circle" },
    { name: "YANMAR", badge: "YANMAR", color: "#EF4444", shape: "wings" },
    { name: "YUCHAI HEAVY", badge: "YUCHAI", color: "#EF4444", shape: "circle" },
    { name: "ZOOMLION", badge: "ZOOMLION", color: "#84CC16", shape: "rect" }
  ];

  function createSvgEmblem(item) {
    const c = item.color;
    const text = item.badge;
    const fontSize = text.length > 6 ? 7.5 : text.length > 4 ? 9 : 11;

    let geometry = `<rect x="4" y="6" width="56" height="26" rx="4" fill="none" stroke="${c}" stroke-width="2"/>`;
    if (item.shape === "circle") {
      geometry = `<circle cx="32" cy="19" r="15" fill="none" stroke="${c}" stroke-width="2.2"/>`;
    } else if (item.shape === "oval") {
      geometry = `<ellipse cx="32" cy="19" rx="26" ry="13" fill="none" stroke="${c}" stroke-width="2"/>`;
    } else if (item.shape === "diamond") {
      geometry = `<polygon points="32,3 58,19 32,35 6,19" fill="none" stroke="${c}" stroke-width="2"/>`;
    } else if (item.shape === "triangle") {
      geometry = `<polygon points="32,3 58,34 6,34" fill="none" stroke="${c}" stroke-width="2"/>`;
    } else if (item.shape === "shield") {
      geometry = `<path d="M12,5 H52 V19 C52,28 32,35 32,35 C32,35 12,28 12,19 Z" fill="none" stroke="${c}" stroke-width="2"/>`;
    } else if (item.shape === "star3" || item.shape === "star") {
      geometry = `<circle cx="32" cy="19" r="15" fill="none" stroke="${c}" stroke-width="2"/><path d="M32,4 V19 M32,19 L19,27 M32,19 L45,27" stroke="${c}" stroke-width="1.8"/>`;
    } else if (item.shape === "iron") {
      geometry = `<circle cx="30" cy="20" r="13" fill="none" stroke="${c}" stroke-width="2.2"/><path d="M39,11 L48,4 M42,4 H48 V10" fill="none" stroke="${c}" stroke-width="2"/>`;
    } else if (item.shape === "cross") {
      geometry = `<path d="M22,8 H42 V14 H54 V24 H42 V30 H22 V24 H10 V14 H22 Z" fill="none" stroke="${c}" stroke-width="2"/>`;
    } else if (item.shape === "horns") {
      geometry = `<ellipse cx="32" cy="22" rx="20" ry="11" fill="none" stroke="${c}" stroke-width="2"/><path d="M14,14 C20,24 32,24 32,24 C32,24 44,24 50,14" fill="none" stroke="${c}" stroke-width="2"/>`;
    } else if (item.shape === "wings") {
      geometry = `<path d="M10,22 Q32,10 54,22 Q32,6 10,22 Z M16,25 Q32,16 48,25" fill="none" stroke="${c}" stroke-width="1.8"/>`;
    } else if (item.shape === "arch") {
      geometry = `<path d="M10,32 V19 C10,9 54,9 54,19 V32" fill="none" stroke="${c}" stroke-width="2.2"/>`;
    }

    return `
      <svg width="64" height="38" viewBox="0 0 64 38" xmlns="http://www.w3.org/2000/svg">
        ${geometry}
        <text x="32" y="22.5" font-family="Arial Black, Impact, sans-serif" font-size="${fontSize}" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="0.5">${text}</text>
      </svg>
    `;
  }

  function populateTrack(trackId, list) {
    const track = document.getElementById(trackId);
    if (!track) return;
    const targetType = trackId.includes('camiones') ? 'Camión' : 'Maquinaria';
    track.innerHTML = list.map(item => `
      <div class="brand-item-card" data-brand="${item.name}" data-target-type="${targetType}">
        <div class="brand-svg-emblem">${createSvgEmblem(item)}</div>
        <span class="brand-item-title">${item.name}</span>
      </div>
    `).join('');

    // Interacción al hacer clic en cualquier tarjeta de marca
    track.querySelectorAll('.brand-item-card').forEach(card => {
      card.addEventListener('click', () => {
        const brandName = card.dataset.brand || card.querySelector('.brand-item-title').textContent.trim();
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

  populateTrack("track-camiones", camionesBrands);
  populateTrack("track-maquinaria", maquinariaBrands);

  // Activar Drag-to-Scroll con el mouse y rueda horizontal en ambos carruseles
  document.querySelectorAll('.brand-carousel-viewport').forEach(viewport => {
    let isDown = false, startX, scrollLeft;
    viewport.addEventListener('mousedown', e => {
      isDown = true;
      startX = e.pageX - viewport.offsetLeft;
      scrollLeft = viewport.scrollLeft;
    });
    viewport.addEventListener('mouseleave', () => isDown = false);
    viewport.addEventListener('mouseup', () => isDown = false);
    viewport.addEventListener('mousemove', e => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - viewport.offsetLeft;
      viewport.scrollLeft = scrollLeft - (x - startX) * 1.8;
    });
    viewport.addEventListener('wheel', e => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        viewport.scrollLeft += e.deltaY;
      }
    }, { passive: false });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderAllHeavyBrands);
} else {
  renderAllHeavyBrands();
}




