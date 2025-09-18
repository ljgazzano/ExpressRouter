// Language switching functionality
const languages = {
    en: 'en',
    es: 'es'
};

let currentLanguage = 'en';

// Initialize language system
document.addEventListener('DOMContentLoaded', function() {
    initializeLanguage();
    initializeTabs();
    initializeCopyButtons();
    initializeNavigation();
});

function initializeLanguage() {
    // Set up language buttons
    const langButtons = document.querySelectorAll('.lang-btn');
    langButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const lang = this.id.replace('lang-', '');
            switchLanguage(lang);
        });
    });

    // Load saved language or default to English
    const savedLang = localStorage.getItem('preferred-language') || 'en';
    switchLanguage(savedLang);
}

function switchLanguage(lang) {
    if (!languages[lang]) return;

    currentLanguage = lang;
    localStorage.setItem('preferred-language', lang);

    // Update button states
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(`lang-${lang}`).classList.add('active');

    // Update all translatable elements
    const elements = document.querySelectorAll('[data-en][data-es]');
    elements.forEach(element => {
        const text = element.getAttribute(`data-${lang}`);
        if (text) {
            element.textContent = text;
        }
    });

    // Update document language
    document.documentElement.lang = lang;
}

// Tab functionality for examples section
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');

            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked button and corresponding content
            this.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
}

// Copy to clipboard functionality
function initializeCopyButtons() {
    const copyButtons = document.querySelectorAll('.copy-btn');
    copyButtons.forEach(button => {
        button.addEventListener('click', function() {
            copyToClipboard(this);
        });
    });
}

function copyToClipboard(button) {
    const codeBlock = button.parentElement;
    const code = codeBlock.querySelector('code');
    const text = code ? code.textContent : codeBlock.textContent.replace(button.textContent, '').trim();

    navigator.clipboard.writeText(text).then(function() {
        // Visual feedback
        const originalIcon = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i>';
        button.style.background = '#10b981';

        setTimeout(function() {
            button.innerHTML = originalIcon;
            button.style.background = '';
        }, 2000);
    }).catch(function(err) {
        console.error('Failed to copy text: ', err);

        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            document.execCommand('copy');
            const originalIcon = button.innerHTML;
            button.innerHTML = '<i class="fas fa-check"></i>';
            button.style.background = '#10b981';

            setTimeout(function() {
                button.innerHTML = originalIcon;
                button.style.background = '';
            }, 2000);
        } catch (err) {
            console.error('Fallback copy failed: ', err);
        }

        document.body.removeChild(textArea);
    });
}

// Smooth scrolling for navigation links
function initializeNavigation() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 80; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', function() {
    const animateElements = document.querySelectorAll('.feature-card, .install-step, .code-example');
    animateElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(element);
    });
});

// Navbar scroll effect
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = 'none';
    }
});

// Keyboard navigation support
document.addEventListener('keydown', function(e) {
    // ESC key to close any active modals or reset focus
    if (e.key === 'Escape') {
        document.activeElement.blur();
    }

    // Tab navigation through language buttons
    if (e.key === 'Tab' && e.target.classList.contains('lang-btn')) {
        e.preventDefault();
        const langButtons = document.querySelectorAll('.lang-btn');
        const currentIndex = Array.from(langButtons).indexOf(e.target);
        const nextIndex = e.shiftKey ?
            (currentIndex - 1 + langButtons.length) % langButtons.length :
            (currentIndex + 1) % langButtons.length;
        langButtons[nextIndex].focus();
    }
});

// Preload images and fonts for better performance
function preloadAssets() {
    // Preload critical fonts
    const fontLink = document.createElement('link');
    fontLink.rel = 'preload';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap';
    fontLink.as = 'style';
    document.head.appendChild(fontLink);

    // Preload Font Awesome
    const faLink = document.createElement('link');
    faLink.rel = 'preload';
    faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css';
    faLink.as = 'style';
    document.head.appendChild(faLink);
}

// Initialize performance optimizations
document.addEventListener('DOMContentLoaded', preloadAssets);

// Error handling for copy functionality
window.addEventListener('error', function(e) {
    if (e.message.includes('clipboard')) {
        console.warn('Clipboard functionality may not work in this environment');
    }
});

// Accessibility improvements
function improveAccessibility() {
    // Add ARIA labels to interactive elements
    const copyButtons = document.querySelectorAll('.copy-btn');
    copyButtons.forEach((button, index) => {
        button.setAttribute('aria-label', currentLanguage === 'es' ? 'Copiar código' : 'Copy code');
        button.setAttribute('title', currentLanguage === 'es' ? 'Copiar al portapapeles' : 'Copy to clipboard');
    });

    // Add ARIA labels to language buttons
    document.getElementById('lang-en').setAttribute('aria-label', 'Switch to English');
    document.getElementById('lang-es').setAttribute('aria-label', 'Cambiar a Español');

    // Add role attributes to tab system
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach((button, index) => {
        button.setAttribute('role', 'tab');
        button.setAttribute('aria-controls', tabContents[index].id);
        button.setAttribute('aria-selected', button.classList.contains('active'));
    });

    tabContents.forEach(content => {
        content.setAttribute('role', 'tabpanel');
    });
}

// Update accessibility labels when language changes
document.addEventListener('DOMContentLoaded', function() {
    // Initial accessibility setup
    improveAccessibility();

    // Update accessibility when language changes
    const langButtons = document.querySelectorAll('.lang-btn');
    langButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            setTimeout(improveAccessibility, 100); // Allow language switch to complete first
        });
    });
});