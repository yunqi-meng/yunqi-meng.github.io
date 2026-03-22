(function() {
  'use strict';

  const HeoBlog = {
    init: function() {
      this.initNavigation();
      this.initScrollEffects();
      this.initDarkMode();
      this.initBackToTop();
      this.initSearch();
      this.initTOC();
      this.initLazyLoad();
      this.initImageLightbox();
      this.initAnimations();
    },

    initNavigation: function() {
      const nav = document.getElementById('nav');
      const navToggle = document.querySelector('.nav-toggle');
      const navMenu = document.querySelector('.nav-menu');

      if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
          navMenu.classList.toggle('show');
          this.classList.toggle('active');
        });

        document.addEventListener('click', function(e) {
          if (!nav.contains(e.target)) {
            navMenu.classList.remove('show');
            navToggle.classList.remove('active');
          }
        });
      }

      document.querySelectorAll('.nav-menu a').forEach(function(link) {
        link.addEventListener('click', function() {
          if (navMenu) {
            navMenu.classList.remove('show');
          }
          if (navToggle) {
            navToggle.classList.remove('active');
          }
        });
      });
    },

    initScrollEffects: function() {
      const nav = document.getElementById('nav');
      let lastScrollY = 0;
      let ticking = false;

      function updateNav() {
        const scrollY = window.scrollY;

        if (nav) {
          if (scrollY > 50) {
            nav.classList.add('scrolled');
          } else {
            nav.classList.remove('scrolled');
          }
        }

        lastScrollY = scrollY;
        ticking = false;
      }

      window.addEventListener('scroll', function() {
        if (!ticking) {
          requestAnimationFrame(updateNav);
          ticking = true;
        }
      });
    },

    initDarkMode: function() {
      const toggle = document.querySelector('.darkmode-toggle');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

      function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        updateToggleIcon(theme);
      }

      function updateToggleIcon(theme) {
        if (!toggle) return;
        const icon = toggle.querySelector('i');
        if (icon) {
          if (theme === 'dark') {
            icon.className = 'fas fa-sun';
          } else {
            icon.className = 'fas fa-moon';
          }
        }
      }

      function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
      }

      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        setTheme(savedTheme);
      } else if (prefersDark.matches) {
        setTheme('dark');
      }

      if (toggle) {
        toggle.addEventListener('click', toggleTheme);
      }

      prefersDark.addEventListener('change', function(e) {
        if (!localStorage.getItem('theme')) {
          setTheme(e.matches ? 'dark' : 'light');
        }
      });
    },

    initBackToTop: function() {
      const goUp = document.getElementById('go-up');

      if (!goUp) return;

      function updateGoUp() {
        if (window.scrollY > 300) {
          goUp.classList.add('visible');
        } else {
          goUp.classList.remove('visible');
        }
      }

      window.addEventListener('scroll', function() {
        requestAnimationFrame(updateGoUp);
      });

      goUp.addEventListener('click', function() {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });
    },

    initSearch: function() {
      const searchBtn = document.querySelector('.search-btn');
      const searchDialog = document.getElementById('search-dialog');
      const searchInput = document.querySelector('.search-input');
      const searchClose = document.querySelector('.search-close');

      if (!searchDialog) return;

      if (searchBtn) {
        searchBtn.addEventListener('click', function() {
          searchDialog.classList.add('show');
          if (searchInput) {
            setTimeout(function() {
              searchInput.focus();
            }, 100);
          }
        });
      }

      if (searchClose) {
        searchClose.addEventListener('click', function() {
          searchDialog.classList.remove('show');
        });
      }

      searchDialog.addEventListener('click', function(e) {
        if (e.target === searchDialog) {
          searchDialog.classList.remove('show');
        }
      });

      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && searchDialog.classList.contains('show')) {
          searchDialog.classList.remove('show');
        }
      });
    },

    initTOC: function() {
      const tocLinks = document.querySelectorAll('#toc .toc-content a');
      const headings = document.querySelectorAll('.post-content h1, .post-content h2, .post-content h3');

      if (tocLinks.length === 0 || headings.length === 0) return;

      function updateActiveLink() {
        const scrollY = window.scrollY;
        let activeId = null;

        headings.forEach(function(heading) {
          const rect = heading.getBoundingClientRect();
          if (rect.top <= 150) {
            activeId = heading.id;
          }
        });

        tocLinks.forEach(function(link) {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + activeId) {
            link.classList.add('active');
          }
        });
      }

      window.addEventListener('scroll', function() {
        requestAnimationFrame(updateActiveLink);
      });

      tocLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
          e.preventDefault();
          const targetId = this.getAttribute('href').slice(1);
          const target = document.getElementById(targetId);
          if (target) {
            const navHeight = document.getElementById('nav').offsetHeight;
            const targetPosition = target.offsetTop - navHeight - 20;
            window.scrollTo({
              top: targetPosition,
              behavior: 'smooth'
            });
          }
        });
      });
    },

    initLazyLoad: function() {
      const images = document.querySelectorAll('img[data-src]');

      if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver(function(entries, observer) {
          entries.forEach(function(entry) {
            if (entry.isIntersecting) {
              const img = entry.target;
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
              img.classList.add('loaded');
              observer.unobserve(img);
            }
          });
        }, {
          rootMargin: '50px 0px',
          threshold: 0.01
        });

        images.forEach(function(img) {
          imageObserver.observe(img);
        });
      } else {
        images.forEach(function(img) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        });
      }
    },

    initImageLightbox: function() {
      const postContent = document.querySelector('.post-content');

      if (!postContent) return;

      postContent.querySelectorAll('img').forEach(function(img) {
        img.style.cursor = 'zoom-in';

        img.addEventListener('click', function() {
          const lightbox = document.createElement('div');
          lightbox.className = 'lightbox-overlay';
          lightbox.innerHTML = '<div class="lightbox-container"><img src="' + this.src + '" alt=""><button class="lightbox-close"><i class="fas fa-times"></i></button></div>';

          document.body.appendChild(lightbox);
          document.body.style.overflow = 'hidden';

          requestAnimationFrame(function() {
            lightbox.classList.add('show');
          });

          function closeLightbox() {
            lightbox.classList.remove('show');
            setTimeout(function() {
              lightbox.remove();
              document.body.style.overflow = '';
            }, 300);
          }

          lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox || e.target.closest('.lightbox-close')) {
              closeLightbox();
            }
          });

          document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
              closeLightbox();
            }
          });
        });
      });
    },

    initAnimations: function() {
      const animatedElements = document.querySelectorAll('.recent-post-item, .card-widget');

      if ('IntersectionObserver' in window) {
        const animationObserver = new IntersectionObserver(function(entries) {
          entries.forEach(function(entry) {
            if (entry.isIntersecting) {
              entry.target.style.animationPlayState = 'running';
              animationObserver.unobserve(entry.target);
            }
          });
        }, {
          threshold: 0.1
        });

        animatedElements.forEach(function(el) {
          el.style.animationPlayState = 'paused';
          animationObserver.observe(el);
        });
      }
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      HeoBlog.init();
    });
  } else {
    HeoBlog.init();
  }

  window.HeoBlog = HeoBlog;
})();
