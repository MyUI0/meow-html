/*
 * Static Blog - Main Script (bundled)
 * Adapted from hexo-theme-meow, all Hexo dependencies removed
 */

// ============ utils.js ============
const meow = {
  debounce: (func, delay) => {
    let timer;
    return function () {
      clearTimeout(timer);
      timer = setTimeout(() => func.apply(this, arguments), delay);
    };
  },
  scrollFn: (position) => {
    window.scrollTo(0, position);
  },
  getActualTop: (element) => {
    let actualTop = element.offsetTop;
    let current = element.offsetParent;
    while (current !== null) {
      actualTop += current.offsetTop;
      current = current.offsetParent;
    }
    return actualTop;
  },
  shuffleArray: (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  },
  snackbarFn: (text) => {
    if (GLOBALCONFIG.notify && GLOBALCONFIG.notify.enable) {
      Snackbar.show({ text: text, pos: 'bottom-left', duration: 3000 });
    }
  },
  getPageTitle: () => {
    let page_title = document.title;
    let site_fragment = ' | ' + (GLOBALCONFIG.site_name || 'MEOW');
    let title = page_title.endsWith(site_fragment) ? page_title.replace(site_fragment, "") : page_title;
    return title;
  },
  lazyloadFn: (dom, callback) => {
    if ("IntersectionObserver" in window) {
      const observerItem = new IntersectionObserver(
        entries => {
          if (entries[0].isIntersecting) { callback(); observerItem.disconnect(); }
        },
        { threshold: [0] }
      );
      observerItem.observe(dom);
    } else {
      callback();
    }
  },
};

// ============ menu.js ============
const initMenu = () => {
  const headerElement = document.querySelector('header');
  if (!headerElement) return;
  const scroll_y = window.scrollY || window.pageYOffset || document.body.scrollTop;
  const bg_color = document.body.getAttribute('data-mode') == 'light' ? 'rgba(255,255,255,0.8)' : 'rgba(45, 45, 45, 0.85)';
  let new_color = 'transparent';
  if (scroll_y < (window.innerHeight * 0.6)) {
    headerElement.setAttribute('custom', '');
  } else {
    headerElement.removeAttribute('custom');
    new_color = bg_color;
  }
  requestAnimationFrame(() => { headerElement.style.background = new_color; });

  const menuBtn = document.getElementById('menu-btn');
  const capsule = document.getElementById('mobile-capsule');
  if (menuBtn && capsule) {
    // 点击菜单按钮切换胶囊
    menuBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      const isOpen = capsule.hasAttribute('open');
      if (isOpen) {
        capsule.removeAttribute('open');
      } else {
        capsule.setAttribute('open', '');
      }
    });
    
    // 点击胶囊内的链接后关闭
    capsule.querySelectorAll('.capsule-item').forEach(item => {
      item.addEventListener('click', () => {
        capsule.removeAttribute('open');
      });
    });
    
    // 点击页面其他区域关闭胶囊
    document.addEventListener('click', function(e) {
      if (capsule.hasAttribute('open') && !capsule.contains(e.target) && !menuBtn.contains(e.target)) {
        capsule.removeAttribute('open');
      }
    });
    
    // ESC 关闭
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && capsule.hasAttribute('open')) {
        capsule.removeAttribute('open');
      }
    });
  }
};

// ============ toolbar.js ============
const initToolbar = () => {
  const tool_setting = document.getElementById('tool-setting');
  if (tool_setting) {
    tool_setting.addEventListener('click', function () {
      const setting_container = document.getElementById('toolbar-setting-container');
      if (setting_container.hasAttribute("hide")) {
        setting_container.removeAttribute("hide");
      } else {
        setting_container.setAttribute("hide", "");
      }
    });
  }

  const toc = document.getElementById('toc-container');
  if (toc) {
    const toc_container = document.getElementById('post-sidebar');
    document.getElementById('tool-toc').addEventListener('click', function () {
      let toc_show = toc_container.getAttribute("status") == "show" ? "hide" : "show";
      toc_container.setAttribute("status", toc_show);
      if (toc_container.hasAttribute("active")) {
        toc_container.removeAttribute("active");
      } else {
        toc_container.setAttribute("active", "");
      }
    });
    toc_container.addEventListener('click', function () { toc_container.removeAttribute('active'); });
  }

  const color_mode = document.getElementById('tool-color-mode');
  if (color_mode) {
    const updateColorIcon = () => {
      if (localStorage.getItem('color-mode') == 'light') {
        color_mode.innerHTML = '<img src="' + GLOBALCONFIG.root + 'assets/svg/ta/ta-moon.svg" class="icon noview" alt="Dark Mode">';
      } else {
        color_mode.innerHTML = '<img src="' + GLOBALCONFIG.root + 'assets/svg/ta/ta-sun.svg" class="icon noview" alt="Light Mode">';
      }
    };
    updateColorIcon();
    color_mode.addEventListener('click', function () {
      let mode = localStorage.getItem('color-mode') == 'light' ? 'dark' : 'light';
      document.body.setAttribute('data-mode', mode);
      localStorage.setItem('color-mode', mode);
      updateColorIcon();
    });
  }

  const font_size_plus = document.getElementById('tool-font-size-plus');
  if (font_size_plus) {
    font_size_plus.addEventListener('click', function () {
      const post_content = document.querySelector('.post');
      let font_size = 16;
      if (localStorage.getItem('font-size')) {
        font_size = parseInt(localStorage.getItem('font-size')) + 2;
      } else {
        let currentSize = window.getComputedStyle(post_content).getPropertyValue('font-size');
        font_size = parseInt(currentSize) + 2;
      }
      post_content.style.fontSize = font_size + 'px';
      localStorage.setItem('font-size', font_size);
    });
  }

  const font_size_minus = document.getElementById('tool-font-size-minus');
  if (font_size_minus) {
    font_size_minus.addEventListener('click', function () {
      const post_content = document.querySelector('.post');
      let font_size = 16;
      if (localStorage.getItem('font-size')) {
        font_size = parseInt(localStorage.getItem('font-size')) - 2;
      } else {
        let currentSize = window.getComputedStyle(post_content).getPropertyValue('font-size');
        font_size = parseInt(currentSize) - 2;
      }
      post_content.style.fontSize = font_size + 'px';
      localStorage.setItem('font-size', font_size);
    });
  }
};

// ============ scroll.js ============
const initScroll = () => {
  const scrollHeader = () => {
    const updateHeaderStyle = () => {
      const scroll_y = window.scrollY || window.pageYOffset || document.body.scrollTop;
      const bg_color = document.body.getAttribute('data-mode') == 'light' ? 'rgba(255,255,255,0.8)' : 'rgba(45, 45, 45, 0.85)';
      const new_color = scroll_y >= (window.innerHeight * 0.6) ? bg_color : 'transparent';
      const headerElement = document.querySelector('header');
      if (!headerElement) return;
      requestAnimationFrame(() => { headerElement.style.background = new_color; });
      if (new_color == 'transparent') {
        headerElement.setAttribute('custom', '');
      } else {
        headerElement.removeAttribute('custom');
      }
    };
    window.addEventListener('scroll', meow.debounce(() => updateHeaderStyle(), 200));
  };

  const scrollHomeBg = () => {
    if (document.body.getAttribute('bg-style') != 'fixed') return;
    const updateBgStyle = () => {
      const scroll_y = window.scrollY || window.pageYOffset || document.body.scrollTop;
      if (scroll_y >= (window.innerHeight * 0.6)) {
        document.body.setAttribute('blur', '');
      } else {
        document.body.removeAttribute('blur');
      }
    };
    window.addEventListener('scroll', meow.debounce(() => updateBgStyle(), 200));
  };

  const scrollToMain = () => {
    const scroll_down = document.getElementById('scroll-to-main');
    if (scroll_down) {
      scroll_down.addEventListener('click', function () {
        meow.scrollFn(document.getElementById('home-container').offsetTop - 59);
      });
    }
  };

  const scrollTOC = () => {
    const clickTOC = event => {
      event.preventDefault();
      const target = event.target.closest(".toc-list-link");
      if (!target) return;
      const href = decodeURI(target.getAttribute("href")).replace("#", "");
      const el = document.getElementById(href);
      if (el) {
        meow.debounce(meow.scrollFn(el.offsetTop - window.innerHeight * 0.15), 300);
      }
    };
    const toc = document.getElementById('toc-container');
    if (toc) { toc.addEventListener('click', clickTOC, true); }
  };

  const scrollTOCHighlight = () => {
    const toc = document.querySelector('.toc-content');
    if (!toc) return;
    let titleList = [];
    const tocList = document.querySelectorAll('.toc-list-link');
    tocList.forEach(item => {
      const href = decodeURI(item.getAttribute("href")).replace("#", "");
      const el = document.getElementById(href);
      if (el) titleList.push(el);
    });
    titleList.forEach(section => {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            let titleId = entry.target.id;
            tocList.forEach(link => { link.removeAttribute('active') });
            let targetToc = document.querySelector(`.toc-list-link[href='${"#" + encodeURI(titleId)}']`);
            if (targetToc) {
              targetToc.setAttribute('active', '');
              let targetView = targetToc.getBoundingClientRect();
              let tocView = toc.getBoundingClientRect();
              if (targetView.top >= (tocView.top + tocView.height)) {
                requestAnimationFrame(() => { toc.scrollTop += 35; });
              } else if (targetView.top <= tocView.top) {
                requestAnimationFrame(() => { toc.scrollTop -= 35; });
              }
            }
          }
        });
      }, { threshold: [1], rootMargin: '-10% 0% -60%' });
      observer.observe(section);
    });
  };

  const scrollToTop = () => {
    const toolbar = document.getElementById('toolbar');
    if (toolbar) {
      document.getElementById('tool-gototop').addEventListener('click', function () { meow.scrollFn(0) });
    }
  };

  const scrollToolbar = () => {
    const changeToolbarStatus = () => {
      const scroll_y = window.scrollY || window.pageYOffset || document.body.scrollTop;
      if (scroll_y >= (window.innerHeight * 0.15) && scroll_y <= (document.documentElement.scrollHeight - window.innerHeight - 16)) {
        document.getElementById('toolbar').removeAttribute("hide");
      } else {
        document.getElementById('toolbar').setAttribute("hide", "");
      }
    };
    window.addEventListener('scroll', meow.debounce(() => changeToolbarStatus(), 150));
  };

  scrollHeader();
  scrollToMain();
  scrollHomeBg();
  scrollToolbar();
  scrollToTop();
  scrollTOC();
  scrollTOCHighlight();
};

// ============ datetime.js ============
const initDatetime = () => {
  const calcDate = (dateString) => {
    const now = new Date();
    const target_date = new Date(dateString);
    const period = now.getTime() - target_date.getTime();
    const year = 1000 * 60 * 60 * 24 * 365;
    const period_year = period / year;
    const result_year = Math.floor(period_year);
    const period_month = (period_year - result_year) * 12;
    const result_month = Math.floor(period_month);
    const period_day = (period_month - result_month) * 30;
    const result_day = Math.floor(period_day);
    return { year: result_year, month: result_month, day: result_day };
  };

  const showRuntime = () => {
    const runtime_span = document.getElementById("runtime");
    if (runtime_span) {
      const startdate = runtime_span.getAttribute("data-startdate");
      let runtime_string = runtime_span.textContent;
      let result_date = calcDate(startdate);
      const regex = /\.([\u4e00-\u9fa5]+|\s?\w+)/g;
      const matches = runtime_string.match(regex);
      if (!matches) return;

      let idx = 0;
      if (result_date.year > 0) {
        const year_string = matches[idx];
        runtime_string = runtime_string.replace(year_string, year_string.replace(".", result_date.year));
        idx++;
      } else if (matches[idx]) {
        runtime_string = runtime_string.replace(matches[idx], "");
        idx++;
      }
      if (result_date.month > 0 && matches[idx]) {
        const month_string = matches[idx];
        runtime_string = runtime_string.replace(month_string, month_string.replace(".", result_date.month));
        idx++;
      } else if (matches[idx]) {
        runtime_string = runtime_string.replace(matches[idx], "");
        idx++;
      }
      if (result_date.day > 0 && matches[idx]) {
        const day_string = matches[idx];
        runtime_string = runtime_string.replace(day_string, day_string.replace(".", result_date.day));
      } else if (result_date.year == 0 && result_date.month == 0 && matches[idx]) {
        const day_string = matches[idx];
        runtime_string = runtime_string.replace(day_string, day_string.replace(".", "1"));
      } else if (matches[idx]) {
        runtime_string = runtime_string.replace(matches[idx], "");
      }
      runtime_span.textContent = runtime_string;
    }
  };
  showRuntime();
};

// ============ lazyload.js ============
let lazyload_instance = null;
const initLazyLoad = () => {
  document.querySelectorAll(".home-article-cover img, .archive-post-cover img, .essay-content img, .album-cover-img, #album-content-links img").forEach((element) => {
    if (!element.hasAttribute("lazyload")) {
      element.setAttribute("data-lazy-src", element.getAttribute("src"));
      element.setAttribute("src", GLOBALCONFIG.lazyload_src);
      element.setAttribute("lazyload", "");
    }
  });
  if (lazyload_instance) return lazyload_instance.update();
  lazyload_instance = new LazyLoad({
    elements_selector: "img[lazyload]",
    threshold: 0,
    data_src: "lazy-src"
  });
};

// ============ imageview.js ============
const initImageView = () => {
  document.querySelectorAll("details img[lazyload]").forEach((element) => {
    element.setAttribute("no-view", "");
  });
  if (window.ViewImage) {
    ViewImage.init('.post img:not(.noview), .page-main img:not(.noview,.artitalk_avatar,.atemoji,.album-cover-img)');
  }
};

// ============ copy.js ============
const initCopy = () => {
  const copyWithInfo = () => {
    document.querySelectorAll('.copy-text').forEach((element) => {
      element.addEventListener("click", meow.debounce(() => {
        navigator.clipboard.writeText(GLOBALCONFIG.share_text + '\nTitle: ' + meow.getPageTitle() + '\nLink: ' + element.getAttribute("data-text"));
        let origin_text = element.innerHTML;
        element.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 12l5 5l10 -10" /></svg>';
        setTimeout(() => { element.innerHTML = origin_text; }, 1000);
      }, 200));
    });
  };

  const handleCopyText = () => {
    document.addEventListener('copy', function (event) {
      let clipboardData = event.clipboardData || window.clipboardData;
      if (clipboardData) {
        event.preventDefault();
        let copyText = window.getSelection().toString();
        clipboardData.setData('text/plain', GLOBALCONFIG.share_text + '\nLink: ' + document.URL + '\n\n' + copyText);
        meow.snackbarFn(GLOBALCONFIG.notify.info);
      }
    });
  };

  handleCopyText();
  copyWithInfo();
};

// ============ code.js ============
const initCodeBlock = () => {
  document.querySelectorAll(".codebox").forEach((codebox) => {
    let fold_button = codebox.querySelector(".code-fold");
    let copy_button = codebox.querySelector(".code-copy");
    if (fold_button) {
      fold_button.addEventListener("click", () => {
        codebox.classList.toggle("folded");
        if (codebox.classList.contains("folded")) {
          fold_button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M6 15l6 -6l6 6" /></svg>';
        } else {
          fold_button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M6 9l6 6l6 -6" /></svg>';
        }
      });
    }
    if (copy_button) {
      copy_button.addEventListener("click", () => {
        const code_lines = [...codebox.querySelectorAll(".code .line")];
        const code_content = code_lines.map((line) => line.innerText).join("\n");
        if (GLOBALCONFIG.code_copy_text) {
          navigator.clipboard.writeText(GLOBALCONFIG.share_text + '\nLink: ' + document.URL + '\n\n' + code_content);
        } else {
          navigator.clipboard.writeText(code_content);
        }
        copy_button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 12l5 5l10 -10" /></svg>';
        setTimeout(() => {
          copy_button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M7 7m0 2.667a2.667 2.667 -0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667z" /><path d="M4.012 16.737a2.005 2.005 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1" /></svg>';
        }, 1000);
      });
    }
  });
};

// ============ tags.js ============
const initTags = () => {
  const tabsFn = () => {
    const navTabsElement = document.querySelectorAll(".tabs");
    if (!navTabsElement.length) return;
    const removeAndAddActiveClass = (elements, detect) => {
      Array.from(elements).forEach(element => {
        element.classList.remove("active");
        if (element === detect || element.id === detect) { element.classList.add("active"); }
      });
    };
    const addTabNavEventListener = (item) => {
      const navClickHandler = function (e) {
        const target = e.target.closest("button");
        if (target.classList.contains("active")) return;
        removeAndAddActiveClass(this.children, target);
        this.classList.remove("no-default");
        const tabId = target.getAttribute("data-href");
        const tabContent = item.querySelector(".tabs-content");
        removeAndAddActiveClass(tabContent.children, tabId);
      };
      item.firstElementChild.addEventListener("click", navClickHandler);
    };
    const addTabToTopEventListener = item => {
      const btnClickHandler = e => {
        const target = e.target.closest("button");
        if (!target) return;
        meow.debounce(meow.scrollFn(meow.getActualTop(item) - 80), 300);
      };
      item.querySelector(".tabs-to-top").addEventListener('click', btnClickHandler);
    };
    navTabsElement.forEach(item => { addTabNavEventListener(item); addTabToTopEventListener(item); });
  };

  const chatboxFn = () => {
    const chatboxElement = document.querySelectorAll(".chatbox");
    if (!chatboxElement.length) return;
    const addToggleEventListener = (item) => {
      const toggleBox = item.querySelector(".chatbox-toggle");
      if (!toggleBox) return;
      if (item.offsetHeight < 720) { toggleBox.style.display = 'none'; return; }
      const toggleHandler = event => {
        const toggleBox = event.target.closest(".chatbox-toggle");
        let toggleFlag = item.toggleAttribute("open");
        if (toggleFlag) {
          toggleBox.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M6 15l6 -6l6 6" /></svg>';
        } else {
          toggleBox.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M6 9l6 6l6 -6" /></svg>';
          meow.debounce(meow.scrollFn(meow.getActualTop(item) - 80), 300);
        }
      };
      toggleBox.addEventListener('click', toggleHandler);
    };
    chatboxElement.forEach(item => { addToggleEventListener(item); });
  };

  const maskFn = () => {
    const maskTextElement = document.querySelector("span.mask[type='1']");
    if (!maskTextElement) return;
    document.querySelector(".post").addEventListener("click", e => {
      if (e.target.tagName != "SPAN" || !e.target.classList.contains("mask") || e.target.getAttribute("type") == "0") return;
      e.target.classList.toggle("visited");
    });
  };

  tabsFn();
  chatboxFn();
  maskFn();
};

// ============ category.js ============
const initCategoryPage = () => {
  const catList = document.querySelectorAll(".category-content, .category-child");
  for (let i = 0; i < catList.length; i++) {
    let child = catList[i].querySelector(".category-child");
    if (!child) continue;
    let catItem = catList[i].querySelector(".category-item");
    let foldIcon = catItem.querySelector(".icon");
    catItem.addEventListener("click", (event) => {
      if (event.target.tagName === "A" || event.target.className == "category-count") return;
      if (foldIcon.getAttribute("fold") == "true") {
        foldIcon.setAttribute("fold", "false");
        child.toggleAttribute("show", true);
      } else {
        foldIcon.setAttribute("fold", "true");
        child.toggleAttribute("show", false);
      }
    });
  }
};

// ============ focus.js ============
const initPageFocus = () => {
  let origin_title = document.title;
  let timer;
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      document.title = GLOBALCONFIG.onblur_title;
      clearTimeout(timer);
      timer = setTimeout(() => { document.title = origin_title; }, 2000);
    } else {
      document.title = origin_title;
    }
  });
};

// ============ keyboard.js ============
const initKeyboard = () => {
  window.onkeydown = function (e) {
    if (123 === e.keyCode || 'F12' === e.key) {
      meow.snackbarFn(GLOBALCONFIG.notify.f12_info);
    }
  };
};

// ============ 主题加载 ============
const initTheme = () => {
  const savedCSS = localStorage.getItem('meow-theme-css');
  if (savedCSS) {
    const style = document.createElement('style');
    style.id = 'meow-custom-theme';
    style.textContent = savedCSS;
    document.head.appendChild(style);
  }
};

// ============ MAIN INIT ============
const initMain = () => {
  const main = () => {
    initTheme();
    initMenu();
    if (GLOBALCONFIG.toolbar) initToolbar();
    initScroll();
    initDatetime();
    if (GLOBALCONFIG.category) initCategoryPage();
    initLazyLoad();
    initImageView();
    initCopy();
    if (GLOBALCONFIG.codeblock) initCodeBlock();
    initTags();
    initKeyboard();
    if (GLOBALCONFIG.onblur_title && GLOBALCONFIG.onblur_title != 'false') initPageFocus();
    console.log("%c🐱 Static Blog | Based on Meow Theme", "color:#fff; background:#ffc76c; padding: 8px 15px; border-radius: 8px");
  };
  main();
};

document.addEventListener("DOMContentLoaded", initMain);
