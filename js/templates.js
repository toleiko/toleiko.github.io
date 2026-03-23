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
  const searchInputId = data.searchInputId || 'searchInput';
  const searchResultsId = data.searchResultsId || 'searchResults';

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
                     id="${searchInputId}"
                     autocomplete="off"
                     oninput="handleSearchInput(event)"
                     onkeydown="handleSearchKeyDown(event)">
              <button class="search-button" onclick="performSearch()" aria-label="Search">
                🔍
              </button>
              <div class="search-results" id="${searchResultsId}" hidden></div>
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

const searchController = {
  items: [],
  getInput() {
    return document.getElementById('searchInput');
  },
  getResults() {
    return document.getElementById('searchResults');
  },
  normalize(value) {
    return (value || '').toLowerCase().trim();
  },
  uniqueKeywords(item) {
    return Array.from(new Set(item.keywords || []));
  },
  scoreItem(item, normalizedQuery) {
    const title = this.normalize(item.title);
    const keywords = this.uniqueKeywords(item).map((keyword) => this.normalize(keyword));

    if (!normalizedQuery) {
      return 0;
    }

    if (title === normalizedQuery) return 120;
    if (title.startsWith(normalizedQuery)) return 100;
    if (title.includes(normalizedQuery)) return 80;

    const exactKeyword = keywords.find((keyword) => keyword === normalizedQuery);
    if (exactKeyword) return 70;

    const startsWithKeyword = keywords.find((keyword) => keyword.startsWith(normalizedQuery));
    if (startsWithKeyword) return 60;

    const containsKeyword = keywords.find((keyword) => keyword.includes(normalizedQuery));
    if (containsKeyword) return 50;

    return 0;
  },
  search(query) {
    const normalizedQuery = this.normalize(query);
    if (!normalizedQuery) {
      return [];
    }

    return this.items
      .map((item) => ({ item, score: this.scoreItem(item, normalizedQuery) }))
      .filter((result) => result.score > 0)
      .sort((left, right) => right.score - left.score || left.item.title.localeCompare(right.item.title))
      .slice(0, 8)
      .map((result) => result.item);
  },
  renderResults(results, query) {
    const resultsContainer = this.getResults();
    if (!resultsContainer) {
      return;
    }

    if (!query || results.length === 0) {
      resultsContainer.innerHTML = query ? '<div class="search-result-empty">No matches found</div>' : '';
      resultsContainer.hidden = !query;
      return;
    }

    resultsContainer.innerHTML = results.map((result, index) => `
      <button
        type="button"
        class="search-result-item"
        data-search-index="${index}"
        onclick="selectSearchResult(${index})"
      >
        <span class="search-result-title">${result.title}</span>
        ${result.description ? `<span class="search-result-description">${result.description}</span>` : ''}
      </button>
    `).join('');
    resultsContainer.hidden = false;
  },
  setItems(items) {
    this.items = items;
  },
  closeResults() {
    const resultsContainer = this.getResults();
    if (resultsContainer) {
      resultsContainer.hidden = true;
      resultsContainer.innerHTML = '';
    }
  }
};

let currentSearchResults = [];
let activeSearchIndex = -1;

function setSearchItems(items) {
  searchController.setItems(items);
}

function highlightActiveSearchResult() {
  const resultsContainer = searchController.getResults();
  if (!resultsContainer) {
    return;
  }

  const resultButtons = resultsContainer.querySelectorAll('.search-result-item');
  resultButtons.forEach((button, index) => {
    button.classList.toggle('active', index === activeSearchIndex);
  });
}

function handleSearchInput(event) {
  const query = event.target.value.trim();
  currentSearchResults = searchController.search(query);
  activeSearchIndex = -1;
  searchController.renderResults(currentSearchResults, query);
}

function handleSearchKeyDown(event) {
  if (event.key === 'ArrowDown' && currentSearchResults.length > 0) {
    event.preventDefault();
    activeSearchIndex = (activeSearchIndex + 1) % currentSearchResults.length;
    highlightActiveSearchResult();
    return;
  }

  if (event.key === 'ArrowUp' && currentSearchResults.length > 0) {
    event.preventDefault();
    activeSearchIndex = activeSearchIndex <= 0 ? currentSearchResults.length - 1 : activeSearchIndex - 1;
    highlightActiveSearchResult();
    return;
  }

  if (event.key === 'Escape') {
    searchController.closeResults();
    activeSearchIndex = -1;
    return;
  }

  if (event.key === 'Enter') {
    event.preventDefault();
    if (activeSearchIndex >= 0 && currentSearchResults[activeSearchIndex]) {
      navigateToSearchResult(currentSearchResults[activeSearchIndex]);
    } else {
      performSearch();
    }
  }
}

function selectSearchResult(index) {
  const selected = currentSearchResults[index];
  if (selected) {
    navigateToSearchResult(selected);
  }
}

function navigateToSearchResult(result) {
  if (!result) {
    return;
  }

  const searchInput = searchController.getInput();
  if (searchInput) {
    searchInput.value = result.title;
  }

  searchController.closeResults();
  activeSearchIndex = -1;

  if (typeof result.onSelect === 'function') {
    result.onSelect(result);
    return;
  }

  if (result.href) {
    window.location.href = result.href;
  }
}

function performSearch() {
  const searchInput = searchController.getInput();
  if (!searchInput) {
    return;
  }

  const query = searchInput.value.trim();
  const results = searchController.search(query);
  currentSearchResults = results;
  searchController.renderResults(results, query);

  if (results.length > 0) {
    navigateToSearchResult(results[0]);
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

document.addEventListener('click', function(event) {
  const searchContainer = document.querySelector('.search-container');
  if (searchContainer && !searchContainer.contains(event.target)) {
    searchController.closeResults();
    activeSearchIndex = -1;
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
window.setSearchItems = setSearchItems;
window.performSearch = performSearch;
window.handleSearchInput = handleSearchInput;
window.handleSearchKeyDown = handleSearchKeyDown;
window.selectSearchResult = selectSearchResult;
