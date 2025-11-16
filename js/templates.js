// Template System
class TemplateManager {
  constructor() {
    this.templates = {};
  }

  // Register a template component
  registerTemplate(name, template) {
    this.templates[name] = template;
  }

  // Render a template with data
  render(templateName, data = {}) {
    const template = this.templates[templateName];
    if (!template) {
      console.error(`Template "${templateName}" not found`);
      return '';
    }
    return template(data);
  }

  // Insert rendered template into DOM
  insertTemplate(templateName, containerId, data = {}) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Container "${containerId}" not found`);
      return;
    }
    container.innerHTML = this.render(templateName, data);
  }
}

// Initialize template manager
const templateManager = new TemplateManager();

// Title Section Template
templateManager.registerTemplate('titleSection', (data) => {
  const title = data.title || 'Welcome';
  const placeholder = data.searchPlaceholder || 'Search...';
  const showSearch = data.showSearch !== false;
  const showDropdown = data.showDropdown !== false;
  const dropdownItems = data.dropdownItems || [];

  return `
    <section class="title-section">
      <div class="title-container">
        <h1 class="page-title">${title}</h1>
        <div class="title-right">
          ${showSearch ? `
            <div class="search-container">
              <input type="text" 
                     class="search-bar" 
                     placeholder="${placeholder}"
                     id="searchInput"
                     onkeypress="handleSearchKeyPress(event)">
              <button class="search-button" onclick="performSearch()" aria-label="Search">
                🔍
              </button>
            </div>
          ` : ''}
          ${showDropdown && dropdownItems.length > 0 ? `
            <div class="dropdown">
              <button class="dropdown-toggle" onclick="toggleDropdown()" aria-label="Menu">
                <span class="dropdown-icon">☰</span>
                <span class="dropdown-text">Menu</span>
                <span class="dropdown-arrow">▼</span>
              </button>
              <div class="dropdown-menu" id="dropdownMenu">
                ${dropdownItems.map(item => `
                  <a href="${item.href || '#'}" class="dropdown-item" ${item.target ? `target="${item.target}"` : ''}>
                    ${item.icon ? `<span class="dropdown-item-icon">${item.icon}</span>` : ''}
                    <span class="dropdown-item-text">${item.text || 'Item'}</span>
                  </a>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    </section>
  `;
});

// Button Template for page navigation
templateManager.registerTemplate('navButton', (data) => {
  const text = data.text || 'Button';
  const href = data.href || '#';
  const style = data.style || 'primary';
  const size = data.size || 'medium';
  const icon = data.icon || '';
  const target = data.target || '_self';    return `
    <a href="${data.onclick ? 'javascript:void(0)' : href}" 
       target="${target}"
       class="nav-button nav-button--${style} nav-button--${size}"
       ${data.onclick ? `onclick="${data.onclick}; return false;"` : ''}>
      ${icon ? `<span class="button-icon">${icon}</span>` : ''}
      <span class="button-text">${text}</span>
    </a>
  `;
});

// Button Group Template for multiple buttons
templateManager.registerTemplate('buttonGroup', (data) => {
  const buttons = data.buttons || [];
  const alignment = data.alignment || 'left';
  const spacing = data.spacing || 'normal';
  
  return `
    <div class="button-group button-group--${alignment} button-group--${spacing}">
      ${buttons.map(button => templateManager.render('navButton', button)).join('')}
    </div>
  `;
});

// Search functionality
function performSearch() {
  const searchInput = document.getElementById('searchInput');
  const query = searchInput.value.trim();
  
  if (query) {
    console.log('Searching for:', query);
    // Add your search logic here
    // For now, just show an alert
    alert(`Searching for: "${query}"`);
  }
}

function handleSearchKeyPress(event) {
  if (event.key === 'Enter') {
    performSearch();
  }
}

// Dropdown functionality
function toggleDropdown() {
  const dropdown = document.getElementById('dropdownMenu');
  const toggle = document.querySelector('.dropdown-toggle');
  
  if (dropdown && toggle) {
    const isOpen = dropdown.classList.contains('show');
    
    if (isOpen) {
      dropdown.classList.remove('show');
      toggle.classList.remove('active');
    } else {
      dropdown.classList.add('show');
      toggle.classList.add('active');
    }
  }
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
  const dropdown = document.querySelector('.dropdown');
  const dropdownMenu = document.getElementById('dropdownMenu');
  const toggle = document.querySelector('.dropdown-toggle');
  
  if (dropdown && !dropdown.contains(event.target)) {
    if (dropdownMenu) dropdownMenu.classList.remove('show');
    if (toggle) toggle.classList.remove('active');
  }
});

// Close dropdown on escape key
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    const dropdownMenu = document.getElementById('dropdownMenu');
    const toggle = document.querySelector('.dropdown-toggle');
    
    if (dropdownMenu) dropdownMenu.classList.remove('show');
    if (toggle) toggle.classList.remove('active');
  }
});

// Dropdown functionality
function toggleDropdown() {
  const dropdown = document.getElementById('dropdownMenu');
  const toggle = document.querySelector('.dropdown-toggle');
  
  if (dropdown && toggle) {
    const isOpen = dropdown.classList.contains('show');
    
    if (isOpen) {
      dropdown.classList.remove('show');
      toggle.classList.remove('active');
    } else {
      dropdown.classList.add('show');
      toggle.classList.add('active');
    }
  }
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
  const dropdown = document.querySelector('.dropdown');
  const dropdownMenu = document.getElementById('dropdownMenu');
  const toggle = document.querySelector('.dropdown-toggle');
  
  if (dropdown && !dropdown.contains(event.target)) {
    if (dropdownMenu) dropdownMenu.classList.remove('show');
    if (toggle) toggle.classList.remove('active');
  }
});

// Close dropdown on escape key
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    const dropdownMenu = document.getElementById('dropdownMenu');
    const toggle = document.querySelector('.dropdown-toggle');
    
    if (dropdownMenu) dropdownMenu.classList.remove('show');
    if (toggle) toggle.classList.remove('active');
  }
});

// Utility function to load templates when DOM is ready
function loadTemplate(templateName, containerId, data) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      templateManager.insertTemplate(templateName, containerId, data);
    });
  } else {
    templateManager.insertTemplate(templateName, containerId, data);
  }
}

// Export for use in other files
window.templateManager = templateManager;
window.loadTemplate = loadTemplate;
