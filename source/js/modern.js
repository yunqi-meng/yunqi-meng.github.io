/**
 * Butterfly Theme - Modern Blog JavaScript
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
      this.initBackToTop();
      this.initSearch();
      this.initTOC();
      this.initAnimations();
      this.initReadingProgress();
      this.loadMathJax();
      this.consoleInfo();
    },

    // 初始化主题
    initTheme: function() {
      const savedTheme = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      let theme = 'light';
      if (savedTheme) {
        theme = savedTheme;
      } else if (prefersDark) {
        theme = 'dark';
      }
      
      document.documentElement.setAttribute('data-theme', theme);
      this.updateThemeIcon(theme);
      
      // 监听系统主题变化
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
          const newTheme = e.matches ? 'dark' : 'light';
          document.documentElement.setAttribute('data-theme', newTheme);
          this.updateThemeIcon(newTheme);
        }
      });
      
      // 绑定主题切换按钮
      const darkmodeBtn = document.getElementById('darkmode');
      if (darkmodeBtn) {
        darkmodeBtn.addEventListener('click', () => {
          const currentTheme = document.documentElement.getAttribute('data-theme');
          const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
          document.documentElement.setAttribute('data-theme', newTheme);
          localStorage.setItem('theme', newTheme);
          this.updateThemeIcon(newTheme);
        });
      }
    },

    // 更新主题图标
    updateThemeIcon: function(theme) {
      const darkmodeBtn = document.getElementById('darkmode');
      if (darkmodeBtn) {
        const icon = darkmodeBtn.querySelector('i');
        if (icon) {
          icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
      }
    },

    // 加载 MathJax
    loadMathJax: function() {
      if (window.MathJax) return;
      
      window.MathJax = {
        tex: {
          inlineMath: [['$', '$'], ['\\(', '\\)']],
          displayMath: [['$$', '$$'], ['\\[', '\\]']],
          tags: 'none'
        },
        svg: {
          fontCache: 'global'
        },
        options: {
          enableMenu: false
        }
      };
      
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.min.js';
      script.id = 'MathJax-script';
      script.async = true;
      document.head.appendChild(script);
    },

    // 初始化导航
    initNavigation: function() {
      // 移动端菜单切换
      const toggleMenu = document.getElementById('toggle-menu');
      const menus = document.getElementById('menus');
      
      if (toggleMenu && menus) {
        toggleMenu.addEventListener('click', () => {
          toggleMenu.classList.toggle('active');
          menus.classList.toggle('show');
        });
        
        // 点击外部关闭菜单
        document.addEventListener('click', (e) => {
          if (!e.target.closest('#nav')) {
            toggleMenu.classList.remove('active');
            menus.classList.remove('show');
          }
        });
        
        // 点击链接关闭菜单
        menus.querySelectorAll('a').forEach(link => {
          link.addEventListener('click', () => {
            toggleMenu.classList.remove('active');
            menus.classList.remove('show');
          });
        });
      }
    },

    // 初始化滚动效果
    initScrollEffects: function() {
      const nav = document.getElementById('nav');
      let lastScrollY = 0;
      let ticking = false;
      
      const updateNav = () => {
        const scrollY = window.scrollY;
        
        if (nav) {
          if (scrollY > 50) {
            nav.classList.add('nav-fixed');
          } else {
            nav.classList.remove('nav-fixed');
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

    // 初始化返回顶部
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

    // 初始化搜索
    initSearch: function() {
      const searchBtn = document.getElementById('search-button');
      const searchDialog = document.getElementById('search-dialog');
      const searchInput = document.querySelector('.search-input');
      const searchClose = document.querySelector('.search-close');
      
      if (!searchDialog) return;
      
      const openSearch = () => {
        searchDialog.classList.add('show');
        document.body.style.overflow = 'hidden';
        if (searchInput) {
          setTimeout(() => searchInput.focus(), 100);
        }
      };
      
      const closeSearch = () => {
        searchDialog.classList.remove('show');
        document.body.style.overflow = '';
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
      
      // 快捷键 Ctrl+K / Cmd+K
      document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
          e.preventDefault();
          if (searchDialog.classList.contains('show')) {
            closeSearch();
          } else {
            openSearch();
          }
        }
      });
    },

    // 初始化 TOC 目录
    initTOC: function() {
      const toc = document.getElementById('toc');
      if (!toc) return;
      
      const tocLinks = toc.querySelectorAll('.toc-content a');
      const headings = document.querySelectorAll('#article-container h1, #article-container h2, #article-container h3, #article-container h4, #article-container h5, #article-container h6');
      
      if (tocLinks.length === 0 || headings.length === 0) return;
      
      const updateActiveLink = () => {
        const scrollY = window.scrollY;
        const navHeight = document.getElementById('nav')?.offsetHeight || 0;
        let activeId = '';
        
        headings.forEach(heading => {
          const rect = heading.getBoundingClientRect();
          if (rect.top <= navHeight + 100) {
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

    // 初始化动画
    initAnimations: function() {
      // 文章卡片动画
      const postItems = document.querySelectorAll('.recent-post-item, .card-widget');
      
      if (!('IntersectionObserver' in window)) {
        postItems.forEach(el => {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        });
        return;
      }
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      });
      
      postItems.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
      });
    },

    // 初始化阅读进度条
    initReadingProgress: function() {
      // 创建进度条元素
      let progressBar = document.getElementById('reading-progress');
      if (!progressBar) {
        progressBar = document.createElement('div');
        progressBar.id = 'reading-progress';
        progressBar.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          z-index: 10000;
          width: 0%;
          height: 3px;
          background: linear-gradient(90deg, var(--primary), var(--primary-light));
          transition: width 0.1s ease;
        `;
        document.body.appendChild(progressBar);
      }
      
      const updateProgress = () => {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollPosition = window.scrollY;
        const maxScroll = documentHeight - windowHeight;
        
        if (maxScroll > 0) {
          const progress = (scrollPosition / maxScroll) * 100;
          progressBar.style.width = Math.min(progress, 100) + '%';
        }
      };
      
      window.addEventListener('scroll', () => {
        window.requestAnimationFrame(updateProgress);
      });
      
      updateProgress();
    },

    // 控制台信息
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
      
      console.log('%c🦋 Butterfly Theme v1.0.0', consoleStyle);
      console.log('%cDesign: Modern Minimalist | Theme: hexo-theme-butterfly', 'color: #5e60ce; font-size: 12px;');
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
})();
  // 导出到全局
  window.ModernBlog = ModernBlog;
})();
