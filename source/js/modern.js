/**
 * Modern Blog - JavaScript 交互系统
 * 功能: 深色模式、滚动效果、搜索、TOC、图片灯箱、动画等
 */

(function() {
  'use strict';

  const ModernBlog = {
    version: '1.0.0',
    
    init: function() {
      this.initTheme();
      this.initNavigation();
      this.initScrollEffects();
      this.initDarkMode();
      this.initBackToTop();
      this.initSearch();
      this.initTOC();
      this.initImageLightbox();
      this.initAnimations();
      this.initLazyLoad();
      this.initReadingProgress();
      this.consoleInfo();
    },

    initTheme: function() {
      // 从 localStorage 读取主题设置
      const savedTheme = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      let theme = 'light';
      if (savedTheme) {
        theme = savedTheme;
      } else if (prefersDark) {
        theme = 'dark';
      }
      
      document.documentElement.setAttribute('data-theme', theme);
      
      // 监听系统主题变化
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
          document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
        }
      });
    },

    initNavigation: function() {
      const navToggle = document.querySelector('.nav-toggle');
      const navMenu = document.querySelector('.nav-menu');
      
      if (!navToggle || !navMenu) return;
      
      // 切换菜单
      navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('show');
      });
      
      // 点击外部关闭菜单
      document.addEventListener('click', (e) => {
        if (!e.target.closest('#nav')) {
          navToggle.classList.remove('active');
          navMenu.classList.remove('show');
        }
      });
      
      // 点击链接关闭菜单
      navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          navToggle.classList.remove('active');
          navMenu.classList.remove('show');
        });
      });
    },

    initScrollEffects: function() {
      const nav = document.getElementById('nav');
      let lastScrollY = 0;
      let ticking = false;
      
      const updateNav = () => {
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
      };
      
      window.addEventListener('scroll', () => {
        if (!ticking) {
          window.requestAnimationFrame(updateNav);
          ticking = true;
        }
      });
    },

    initDarkMode: function() {
      const toggle = document.querySelector('#darkmode');
      
      if (!toggle) return;
      
      const setTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        updateToggleIcon(theme);
      };
      
      const updateToggleIcon = (theme) => {
        const icon = toggle.querySelector('i');
        if (icon) {
          icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
      };
      
      const toggleTheme = () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
      };
      
      // 初始化图标
      const currentTheme = document.documentElement.getAttribute('data-theme');
      updateToggleIcon(currentTheme);
      
      // 绑定事件
      toggle.addEventListener('click', toggleTheme);
    },

    initBackToTop: function() {
      const goUp = document.getElementById('go-up');
      
      if (!goUp) return;
      
      const updateVisibility = () => {
        if (window.scrollY > 300) {
          goUp.classList.add('show');
        } else {
          goUp.classList.remove('show');
        }
      };
      
      window.addEventListener('scroll', () => {
        window.requestAnimationFrame(updateVisibility);
      });
      
      goUp.addEventListener('click', () => {
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
      
      const openSearch = () => {
        searchDialog.classList.add('show');
        if (searchInput) {
          setTimeout(() => searchInput.focus(), 100);
        }
      };
      
      const closeSearch = () => {
        searchDialog.classList.remove('show');
      };
      
      // 打开搜索
      if (searchBtn) {
        searchBtn.addEventListener('click', (e) => {
          e.preventDefault();
          openSearch();
        });
      }
      
      // 关闭搜索
      if (searchClose) {
        searchClose.addEventListener('click', closeSearch);
      }
      
      // 点击背景关闭
      searchDialog.addEventListener('click', (e) => {
        if (e.target === searchDialog) {
          closeSearch();
        }
      });
      
      // ESC 关闭
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && searchDialog.classList.contains('show')) {
          closeSearch();
        }
      });
      
      // 快捷键
      document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
          e.preventDefault();
          openSearch();
        }
      });
    },

    initTOC: function() {
      const tocLinks = document.querySelectorAll('#toc .toc-content a');
      const headings = document.querySelectorAll('#article-container h1, #article-container h2, #article-container h3, #article-container h4');
      
      if (tocLinks.length === 0 || headings.length === 0) return;
      
      const updateActiveLink = () => {
        const scrollY = window.scrollY;
        let activeId = '';
        
        headings.forEach(heading => {
          const rect = heading.getBoundingClientRect();
          if (rect.top <= 150) {
            activeId = heading.id;
          }
        });
        
        tocLinks.forEach(link => {
          link.classList.remove('active');
          const href = link.getAttribute('href');
          if (href === '#' + activeId) {
            link.classList.add('active');
          }
        });
      };
      
      window.addEventListener('scroll', () => {
        window.requestAnimationFrame(updateActiveLink);
      });
      
      // 平滑滚动
      tocLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const targetId = link.getAttribute('href').slice(1);
          const target = document.getElementById(targetId);
          if (target) {
            const navHeight = document.getElementById('nav')?.offsetHeight || 0;
            const targetPosition = target.offsetTop - navHeight - 20;
            window.scrollTo({
              top: targetPosition,
              behavior: 'smooth'
            });
          }
        });
      });
      
      // 初始化
      updateActiveLink();
    },

    initImageLightbox: function() {
      const postContent = document.querySelector('#article-container');
      
      if (!postContent) return;
      
      const images = postContent.querySelectorAll('img');
      
      images.forEach(img => {
        if (img.closest('a')) return; // 已被链接包裹的图片
        
        img.style.cursor = 'zoom-in';
        
        img.addEventListener('click', () => {
          this.createLightbox(img.src);
        });
      });
    },

    createLightbox: function(src) {
      // 移除已有的 lightbox
      const existing = document.querySelector('.lightbox-overlay');
      if (existing) existing.remove();
      
      const lightbox = document.createElement('div');
      lightbox.className = 'lightbox-overlay';
      lightbox.innerHTML = `
        <div class="lightbox-container">
          <img src="${src}" alt="预览图">
          <button class="lightbox-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
      `;
      
      document.body.appendChild(lightbox);
      document.body.style.overflow = 'hidden';
      
      // 显示动画
      window.requestAnimationFrame(() => {
        lightbox.classList.add('show');
      });
      
      // 关闭函数
      const closeLightbox = () => {
        lightbox.classList.remove('show');
        setTimeout(() => {
          lightbox.remove();
          document.body.style.overflow = '';
        }, 300);
      };
      
      // 绑定关闭事件
      lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox || e.target.closest('.lightbox-close')) {
          closeLightbox();
        }
      });
      
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          closeLightbox();
        }
      });
    },

    initAnimations: function() {
      const animatedElements = document.querySelectorAll('.recent-post-item, .card-widget');
      
      if (!('IntersectionObserver' in window)) return;
      
      const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.animationPlayState = 'running';
            animationObserver.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      });
      
      animatedElements.forEach(el => {
        el.style.animationPlayState = 'paused';
        animationObserver.observe(el);
      });
    },

    initLazyLoad: function() {
      const images = document.querySelectorAll('img[data-src]');
      
      if (!('IntersectionObserver' in window)) {
        images.forEach(img => {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        });
        return;
      }
      
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            
            // 淡入效果
            img.style.opacity = '0';
            img.style.transition = 'opacity 0.3s ease';
            
            img.onload = () => {
              img.style.opacity = '1';
            };
            
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
      
      images.forEach(img => {
        imageObserver.observe(img);
      });
    },

    initReadingProgress: function() {
      // 创建进度条元素
      let progressBar = document.getElementById('reading-progress');
      if (!progressBar) {
        progressBar = document.createElement('div');
        progressBar.id = 'reading-progress';
        document.body.appendChild(progressBar);
      }
      
      const updateProgress = () => {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollPosition = window.scrollY;
        const maxScroll = documentHeight - windowHeight;
        
        const progress = (scrollPosition / maxScroll) * 100;
        progressBar.style.width = Math.min(progress, 100) + '%';
      };
      
      window.addEventListener('scroll', () => {
        window.requestAnimationFrame(updateProgress);
      });
      
      // 初始化
      updateProgress();
    },

    consoleInfo: function() {
      const consoleStyle = [
        'color: #5e60ce',
        'font-size: 14px',
        'font-weight: 600',
        'padding: 8px 12px',
        'border-radius: 4px',
        'background: linear-gradient(135deg, #5e60ce 0%, #7c7ff2 100%)',
        'color: #ffffff'
      ].join(';');
      
      console.log('%c🎨 Modern Blog v1.0.0', consoleStyle);
      console.log('%cDesign: 极简高级风格 | Developer: Your Name', 'color: #5e60ce; font-size: 12px;');
    }
  };

  // DOM 加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      ModernBlog.init();
    });
  } else {
    ModernBlog.init();
  }

  // 导出到全局
  window.ModernBlog = ModernBlog;
  
  // 兼容旧代码
  window.HeoBlog = ModernBlog;
})();
