"use strict";

// UI Enhancement class
class UIEnhancements {
  constructor() {
    this.initializeKeyboardShortcuts();
    this.initializeTooltips();
    this.initializeAnimations();
    this.initializePerformanceMonitor();
  }

  // Initialize keyboard shortcuts
  initializeKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Only handle shortcuts when not typing in input fields
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'g':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            document.getElementById('generate-btn').click();
          }
          break;
        case 's':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            if (!state.isSorting) {
              document.getElementById('sort-btn').click();
            }
          }
          break;
        case ' ':
          e.preventDefault();
          if (state.isSorting) {
            document.getElementById('pause-btn').click();
          }
          break;
        case 'r':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            document.getElementById('reset-btn').click();
          }
          break;
        case 't':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            document.getElementById('theme-toggle').click();
          }
          break;
        case '?':
          e.preventDefault();
          document.getElementById('tutorial-btn').click();
          break;
        case 'escape':
          // Close any open modals
          document.querySelectorAll('.modal.active').forEach(modal => {
            modal.classList.remove('active');
          });
          break;
      }
    });
  }

  // Initialize tooltips
  initializeTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    
    tooltipElements.forEach(element => {
      element.addEventListener('mouseenter', (e) => {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = e.target.getAttribute('data-tooltip');
        document.body.appendChild(tooltip);
        
        const rect = e.target.getBoundingClientRect();
        tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
        tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
        
        e.target._tooltip = tooltip;
      });
      
      element.addEventListener('mouseleave', (e) => {
        if (e.target._tooltip) {
          e.target._tooltip.remove();
          e.target._tooltip = null;
        }
      });
    });
  }

  // Initialize animations
  initializeAnimations() {
    // Add entrance animations to elements
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in');
        }
      });
    });

    document.querySelectorAll('.control-panel, .visualization-container, .info-panel').forEach(el => {
      observer.observe(el);
    });
  }

  // Initialize performance monitor
  initializePerformanceMonitor() {
    let frameCount = 0;
    let lastTime = performance.now();
    let fps = 60;

    const updateFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(updateFPS);
    };

    updateFPS();
  }

  // Create confetti effect
  static createConfetti() {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];
    
    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = Math.random() * 100 + 'vw';
      confetti.style.animationDelay = Math.random() * 3 + 's';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      document.body.appendChild(confetti);
      
      setTimeout(() => confetti.remove(), 3000);
    }
  }

  // Create typing effect
  static async typeText(element, text, speed = 50) {
    element.textContent = '';
    for (let i = 0; i < text.length; i++) {
      element.textContent += text[i];
      await new Promise(resolve => setTimeout(resolve, speed));
    }
  }

  // Create progress bar
  static createProgressBar(container, progress) {
    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    progressBar.innerHTML = `
      <div class="progress-fill" style="width: ${progress}%"></div>
      <div class="progress-text">${Math.round(progress)}%</div>
    `;
    container.appendChild(progressBar);
    return progressBar;
  }

  // Show loading spinner
  static showSpinner(container) {
    const spinner = document.createElement('div');
    spinner.className = 'spinner';
    spinner.innerHTML = '<div class="spinner-inner"></div>';
    container.appendChild(spinner);
    return spinner;
  }

  // Hide loading spinner
  static hideSpinner(spinner) {
    if (spinner) {
      spinner.remove();
    }
  }

  // Create notification with custom styling
  static showCustomNotification(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `custom-notification ${type}`;
    notification.innerHTML = `
      <div class="notification-icon">
        <i class="fas fa-${this.getNotificationIcon(type)}"></i>
      </div>
      <div class="notification-content">
        <div class="notification-message">${message}</div>
        <div class="notification-progress"></div>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Progress bar animation
    const progressBar = notification.querySelector('.notification-progress');
    progressBar.style.width = '0%';
    setTimeout(() => progressBar.style.width = '100%', 100);
    
    // Auto remove
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, duration);
  }

  // Get notification icon based on type
  static getNotificationIcon(type) {
    const icons = {
      success: 'check-circle',
      error: 'exclamation-circle',
      warning: 'exclamation-triangle',
      info: 'info-circle'
    };
    return icons[type] || 'info-circle';
  }

  // Create modal with custom content
  static createModal(title, content, buttons = []) {
    const modal = document.createElement('div');
    modal.className = 'modal custom-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>${title}</h3>
          <button class="modal-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          ${content}
        </div>
        <div class="modal-footer">
          ${buttons.map(btn => `
            <button class="btn ${btn.class || ''}" data-action="${btn.action}">
              ${btn.text}
            </button>
          `).join('')}
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Event listeners
    modal.querySelector('.modal-close').addEventListener('click', () => {
      modal.classList.remove('active');
      setTimeout(() => modal.remove(), 300);
    });
    
    buttons.forEach(btn => {
      if (btn.onClick) {
        modal.querySelector(`[data-action="${btn.action}"]`).addEventListener('click', btn.onClick);
      }
    });
    
    // Show modal
    setTimeout(() => modal.classList.add('active'), 100);
    
    return modal;
  }

  // Create toast notification
  static createToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div class="toast-icon">
        <i class="fas fa-${this.getNotificationIcon(type)}"></i>
      </div>
      <div class="toast-message">${message}</div>
      <button class="toast-close">
        <i class="fas fa-times"></i>
      </button>
    `;
    
    document.body.appendChild(toast);
    
    // Position toast
    const toasts = document.querySelectorAll('.toast');
    const top = toasts.length * 70 + 20;
    toast.style.top = top + 'px';
    
    // Show toast
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Auto remove
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, duration);
    
    // Close button
    toast.querySelector('.toast-close').addEventListener('click', () => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    });
  }

  // Create floating action button
  static createFAB() {
    const fab = document.createElement('div');
    fab.className = 'fab';
    fab.innerHTML = `
      <button class="fab-button">
        <i class="fas fa-plus"></i>
      </button>
      <div class="fab-menu">
        <button class="fab-item" data-action="shuffle">
          <i class="fas fa-random"></i>
        </button>
        <button class="fab-item" data-action="reverse">
          <i class="fas fa-exchange-alt"></i>
        </button>
        <button class="fab-item" data-action="export">
          <i class="fas fa-download"></i>
        </button>
      </div>
    `;
    
    document.body.appendChild(fab);
    
    // Toggle menu
    fab.querySelector('.fab-button').addEventListener('click', () => {
      fab.classList.toggle('active');
    });
    
    // Menu actions
    fab.querySelectorAll('.fab-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const action = e.currentTarget.getAttribute('data-action');
        this.handleFABAction(action);
        fab.classList.remove('active');
      });
    });
  }

  // Handle FAB actions
  static handleFABAction(action) {
    switch (action) {
      case 'shuffle':
        if (window.state && !window.state.isSorting) {
          // Shuffle array
          const helper = new Helper();
          helper.shuffle();
        }
        break;
      case 'reverse':
        if (window.state && !window.state.isSorting) {
          // Reverse array
          const helper = new Helper();
          helper.reverse();
        }
        break;
      case 'export':
        if (window.exportData) {
          window.exportData();
        }
        break;
    }
  }

  // Create help overlay
  static createHelpOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'help-overlay';
    overlay.innerHTML = `
      <div class="help-content">
        <h2>Keyboard Shortcuts</h2>
        <div class="shortcuts-grid">
          <div class="shortcut">
            <kbd>Ctrl/Cmd + G</kbd>
            <span>Generate new array</span>
          </div>
          <div class="shortcut">
            <kbd>Ctrl/Cmd + S</kbd>
            <span>Start sorting</span>
          </div>
          <div class="shortcut">
            <kbd>Space</kbd>
            <span>Pause/Resume</span>
          </div>
          <div class="shortcut">
            <kbd>Ctrl/Cmd + R</kbd>
            <span>Reset array</span>
          </div>
          <div class="shortcut">
            <kbd>Ctrl/Cmd + T</kbd>
            <span>Toggle theme</span>
          </div>
          <div class="shortcut">
            <kbd>?</kbd>
            <span>Show help</span>
          </div>
        </div>
        <button class="help-close">Got it!</button>
      </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Show overlay
    setTimeout(() => overlay.classList.add('show'), 100);
    
    // Close overlay
    overlay.querySelector('.help-close').addEventListener('click', () => {
      overlay.classList.remove('show');
      setTimeout(() => overlay.remove(), 300);
    });
  }
}

// Initialize UI enhancements when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new UIEnhancements();
  
  // Add tooltips to buttons
  const buttons = document.querySelectorAll('button');
  buttons.forEach(button => {
    const text = button.textContent.trim();
    if (text) {
      button.setAttribute('data-tooltip', text);
    }
  });
  
  // Create FAB
  UIEnhancements.createFAB();
  
  // Add help shortcut
  document.addEventListener('keydown', (e) => {
    if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      UIEnhancements.createHelpOverlay();
    }
  });
});

// Export for use in other modules
window.UIEnhancements = UIEnhancements; 