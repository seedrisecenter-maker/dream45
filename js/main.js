/* =============================================
   꿈 꾸는 45도 | Dreaming 45°  —  main.js
   ============================================= */

// ── 1. 명언 데이터 (data/quotes.json에서 로드) ──────
var quotes = [];

// 날짜 기반 오늘의 명언 인덱스 계산 (매일 자동 변경)
function getDailyQuoteIndex(total) {
  var now = new Date();
  var start = new Date(now.getFullYear(), 0, 0);
  var diff = now - start;
  var dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  return dayOfYear % total;
}

// 오늘의 명언 표시
function renderDailyQuote() {
  var container = document.getElementById('dailyQuoteContent');
  if (!container || quotes.length === 0) return;

  var idx = getDailyQuoteIndex(quotes.length);
  var q = quotes[idx];
  var lang = localStorage.getItem('dream45_lang') || 'ko';

  var dateStr = new Date().toLocaleDateString(lang === 'ko' ? 'ko-KR' : lang === 'zh' ? 'zh-CN' : lang === 'hi' ? 'hi-IN' : 'en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  document.getElementById('dailyDate').textContent = dateStr;
  document.getElementById('dailyNumber').textContent = '#' + String(idx + 1).padStart(2, '0');
  document.getElementById('dailyQuoteKo').textContent = '\u201C' + q.ko + '\u201D';
  document.getElementById('dailyQuoteEn').textContent = q.en;
  document.getElementById('dailyAuthor').textContent = '\u2014 ' + q.author.split('(')[0].trim();

  var themeColors = { dream: '#1B1464', challenge: '#E8590C', hope: '#2D6A4F', courage: '#9B2226' };
  var themeEl = document.getElementById('dailyTheme');
  if (themeEl) {
    themeEl.textContent = q.themeLabel;
    themeEl.style.background = themeColors[q.theme] || '#1B1464';
  }

  // 공유 버튼
  var shareBtn = document.getElementById('dailyShareBtn');
  if (shareBtn) {
    shareBtn.onclick = function () {
      var text = q.ko + '\n' + q.en + '\n\n\u2014 ' + q.author.split('(')[0].trim() + '\n\n#꿈꾸는45도 #DailyQuote\nhttps://dream45.vercel.app';
      if (navigator.share) {
        navigator.share({ title: '\uC624\uB298\uC758 \uBA85\uC5B8 | \uAFC8 \uAFB8\uB294 45\uB3C4', text: text });
      } else {
        navigator.clipboard.writeText(text).then(function () {
          showToast('\uBA85\uC5B8\uC774 \uBCF5\uC0AC\uB418\uC5C8\uC2B5\uB2C8\uB2E4!');
        });
      }
    };
  }
}

// JSON에서 명언 데이터 로드
function loadQuotes() {
  return fetch('data/quotes.json')
    .then(function (res) { return res.json(); })
    .then(function (data) {
      quotes = data;
      return data;
    })
    .catch(function () {
      // fallback: 로드 실패 시 기본 명언 1개
      quotes = [{
        id: 1, theme: "dream", themeLabel: "꿈의 시작",
        author: "해리엇 터브먼 (Harriet Tubman, 1822-1913)",
        bio: "미국 노예 해방 운동가.",
        ko: "모든 위대한 꿈은 꿈꾸는 자로부터 시작된다.",
        en: "Every great dream begins with a dreamer.",
        zh: "每一个伟大的梦想，都始于一个敢于做梦的人。",
        hi: "हर महान सपने की शुरुआत एक सपने देखने वाले से होती है।"
      }];
      return quotes;
    });
}

// ── 2. 플랫폼 데이터 ────────────────────────────
const platformData = [
  {
    region: "한국 Korea",
    flag: "\u{1F1F0}\u{1F1F7}",
    color: "#1B1464",
    platforms: [
      { name: "Cafe24", desc: "한국 대표 이커머스 플랫폼", advantages: ["한국 결제 최적화", "28만+ 디자인 템플릿", "네이버/카카오 연동"], bestFor: "자사몰 구축" },
      { name: "Marpple", desc: "아시아 프리미어 POD 서비스", advantages: ["재고 부담 없음", "크리에이터 특화", "MarppleShop 직접 판매"], bestFor: "주문제작 굿즈" },
      { name: "IdUS (\uc544\uc774\ub514\uc5b4\uc2a4)", desc: "한국 최대 핸드메이드 마켓", advantages: ["모바일 최적화", "크리에이터 커뮤니티", "VIP 클럽 리워드"], bestFor: "수공예/커스텀 굿즈" }
    ]
  },
  {
    region: "글로벌 Global",
    flag: "\u{1F30D}",
    color: "#E8590C",
    platforms: [
      { name: "Shopify", desc: "글로벌 이커머스 리더 (175+국가)", advantages: ["1000+ 앱 연동", "130+ 통화 지원", "강력한 분석 도구"], bestFor: "글로벌 자사몰" },
      { name: "Etsy", desc: "8600만+ 활성 구매자", advantages: ["강력한 검색 알고리즘", "수공예/커스텀 특화", "글로벌 배송"], bestFor: "커스텀 굿즈 판매" },
      { name: "Redbubble", desc: "글로벌 POD 마켓플레이스", advantages: ["초기 비용 없음", "자동 글로벌 배송", "다양한 상품군"], bestFor: "아트 프린트/의류" },
      { name: "Society6", desc: "프리미엄 아트 POD", advantages: ["고품질 인쇄", "디자인 중심 플랫폼", "프리미엄 포지셔닝"], bestFor: "프리미엄 아트 굿즈" }
    ]
  },
  {
    region: "중국 China",
    flag: "\u{1F1E8}\u{1F1F3}",
    color: "#9B2226",
    platforms: [
      { name: "Taobao (\u6dd8\u5b9d)", desc: "중국 최대 C2C 마켓플레이스", advantages: ["거대한 국내 시장", "소셜커머스 통합", "빠른 물류"], bestFor: "패션/라이프스타일" },
      { name: "Tmall (\u5929\u732b)", desc: "프리미엄 B2C 마켓", advantages: ["브랜드 포지셔닝", "11.11 대규모 행사", "4시간 플래시 배송"], bestFor: "프리미엄 브랜드" },
      { name: "Xiaohongshu (\u5c0f\u7ea2\u4e66)", desc: "소셜커머스 플랫폼", advantages: ["인플루언서 마케팅", "리뷰 중심 구매", "MZ세대 타겟"], bestFor: "브랜드 인지도" }
    ]
  },
  {
    region: "인도 India",
    flag: "\u{1F1EE}\u{1F1F3}",
    color: "#2D6A4F",
    platforms: [
      { name: "Amazon India", desc: "인도 최대 이커머스", advantages: ["강력한 물류 인프라", "다양한 결제 수단", "정기 프로모션"], bestFor: "종합 상품 판매" },
      { name: "Flipkart", desc: "인도 이커머스 선두주자", advantages: ["패션/라이프스타일 특화", "인도 결제 통합", "메가세일 이벤트"], bestFor: "패션/라이프스타일" },
      { name: "Meesho", desc: "소셜커머스 성장 플랫폼", advantages: ["소셜미디어 연동", "소규모 셀러 특화", "낮은 수수료"], bestFor: "소셜 판매" }
    ]
  },
  {
    region: "소셜 Social",
    flag: "\u{1F4F1}",
    color: "#C5B4E3",
    platforms: [
      { name: "TikTok Shop", desc: "최고 성장 소셜커머스 ($30B+)", advantages: ["알고리즘 노출 극대화", "숏폼 영상 판매", "전세계 50% 사용률"], bestFor: "바이럴 마케팅" },
      { name: "Instagram Shopping", desc: "18-45세 핵심 타겟", advantages: ["비주얼 브랜딩", "인플루언서 협업", "스토리/릴스 쇼핑"], bestFor: "브랜드 빌딩" },
      { name: "Pinterest", desc: "영감 검색 플랫폼", advantages: ["높은 구매 의향", "장기 SEO 효과", "인스피레이셔널 콘텐츠"], bestFor: "아트/인테리어 굿즈" }
    ]
  }
];

// ── 3. 유틸리티 ─────────────────────────────────
function padNumber(n) {
  return String(n).padStart(2, "0");
}

function extractShortAuthor(authorStr) {
  // 한국어 이름만 추출: 첫 공백 또는 괄호 전까지
  var match = authorStr.match(/^[^\s(]+/);
  return match ? match[0] : authorStr;
}

function showToast(message) {
  var toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("active");
  setTimeout(function () {
    toast.classList.remove("active");
  }, 3000);
}

// ── 3-1. 별 파티클 생성 ─────────────────────────
function createStars() {
  var container = document.getElementById("stars");
  if (!container) return;
  var count = Math.floor(Math.random() * 31) + 50; // 50~80
  for (var i = 0; i < count; i++) {
    var star = document.createElement("div");
    star.className = "star";
    var size = Math.random() * 2 + 1; // 1~3px
    star.style.width = size + "px";
    star.style.height = size + "px";
    star.style.left = Math.random() * 100 + "%";
    star.style.top = Math.random() * 100 + "%";
    star.style.position = "absolute";
    star.style.borderRadius = "50%";
    star.style.background = "#fff";
    star.style.animationDelay = Math.random() * 5 + "s";
    container.appendChild(star);
  }
}

// ── 3-2. 명언 갤러리 렌더링 ─────────────────────
function renderQuoteCards(filter) {
  var grid = document.getElementById("quoteGrid");
  if (!grid) return;

  var filtered = filter === "all"
    ? quotes
    : quotes.filter(function (q) { return q.theme === filter; });

  grid.innerHTML = filtered.map(function (q) {
    return (
      '<div class="quote-card" data-theme="' + q.theme + '" data-id="' + q.id + '">' +
        '<div class="card-accent"></div>' +
        '<span class="card-number">' + padNumber(q.id) + '</span>' +
        '<span class="card-theme-label">' + q.themeLabel + '</span>' +
        '<blockquote class="card-quote">\u201C' + q.ko + '\u201D</blockquote>' +
        '<span class="card-author">\u2014 ' + extractShortAuthor(q.author) + '</span>' +
      '</div>'
    );
  }).join("");

  // fade-in 애니메이션 트리거
  var cards = grid.querySelectorAll(".quote-card");
  cards.forEach(function (card, i) {
    card.style.opacity = "0";
    card.style.transform = "translateY(20px)";
    setTimeout(function () {
      card.style.transition = "opacity 0.4s ease, transform 0.4s ease";
      card.style.opacity = "1";
      card.style.transform = "translateY(0)";
    }, i * 80);
  });
}

// ── 3-3. 필터 기능 ──────────────────────────────
function initFilters() {
  var filterBar = document.getElementById("filterBar");
  if (!filterBar) return;
  filterBar.addEventListener("click", function (e) {
    var btn = e.target.closest(".filter-btn");
    if (!btn) return;
    filterBar.querySelectorAll(".filter-btn").forEach(function (b) {
      b.classList.remove("active");
    });
    btn.classList.add("active");
    renderQuoteCards(btn.dataset.filter);
  });
}

// ── 3-4. 모달 열기/닫기 ─────────────────────────
function openModal(quoteId) {
  var q = quotes.find(function (item) { return item.id === quoteId; });
  if (!q) return;

  document.getElementById("modalNumber").textContent = padNumber(q.id);
  document.getElementById("modalTheme").textContent = q.themeLabel;
  document.getElementById("modalAuthor").textContent = q.author;
  document.getElementById("modalKo").textContent = q.ko;
  document.getElementById("modalEn").textContent = q.en;
  document.getElementById("modalZh").textContent = q.zh;
  document.getElementById("modalHi").textContent = q.hi;
  document.getElementById("modalBio").textContent = q.bio;

  document.getElementById("quoteModal").classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  document.getElementById("quoteModal").classList.remove("active");
  document.body.style.overflow = "";
}

function initModal() {
  // 카드 클릭 (이벤트 위임)
  var grid = document.getElementById("quoteGrid");
  if (grid) {
    grid.addEventListener("click", function (e) {
      var card = e.target.closest(".quote-card");
      if (!card) return;
      var id = parseInt(card.dataset.id, 10);
      openModal(id);
    });
  }

  // 닫기 버튼
  var closeBtn = document.getElementById("modalClose");
  if (closeBtn) {
    closeBtn.addEventListener("click", closeModal);
  }

  // 오버레이 클릭
  var overlay = document.getElementById("quoteModal");
  if (overlay) {
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) closeModal();
    });
  }

  // ESC 키
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeModal();
  });
}

// ── 3-5. 변환기 (Translator) ────────────────────
function initTranslator() {
  var select = document.getElementById("quoteSelect");
  if (!select) return;

  // 옵션 동적 생성
  quotes.forEach(function (q) {
    var option = document.createElement("option");
    option.value = q.id;
    var label = q.ko.length > 30 ? q.ko.substring(0, 30) + "..." : q.ko;
    option.textContent = label;
    select.appendChild(option);
  });

  select.addEventListener("change", function () {
    var id = parseInt(select.value, 10);
    var q = quotes.find(function (item) { return item.id === id; });
    var panels = document.getElementById("translatorPanels");
    var authorEl = document.getElementById("translatorAuthor");

    if (!q) {
      document.getElementById("transKo").textContent = "명언을 선택해주세요...";
      document.getElementById("transEn").textContent = "Select a quote...";
      document.getElementById("transZh").textContent = "请选择名言...";
      document.getElementById("transHi").textContent = "\u0915\u0943\u092A\u092F\u093E \u090F\u0915 \u0909\u0926\u094D\u0927\u0930\u0923 \u091A\u0941\u0928\u0947\u0902...";
      if (authorEl) authorEl.textContent = "";
      return;
    }

    document.getElementById("transKo").textContent = q.ko;
    document.getElementById("transEn").textContent = q.en;
    document.getElementById("transZh").textContent = q.zh;
    document.getElementById("transHi").textContent = q.hi;
    if (authorEl) authorEl.textContent = "\u2014 " + q.author;

    // fade-in 애니메이션
    if (panels) {
      panels.querySelectorAll(".trans-panel").forEach(function (panel) {
        panel.style.opacity = "0";
        panel.style.transform = "translateY(10px)";
        setTimeout(function () {
          panel.style.transition = "opacity 0.4s ease, transform 0.4s ease";
          panel.style.opacity = "1";
          panel.style.transform = "translateY(0)";
        }, 50);
      });
    }
  });
}

// ── 3-6. 복사 기능 ──────────────────────────────
function initCopyButtons() {
  document.addEventListener("click", function (e) {
    var btn = e.target.closest(".copy-btn");
    if (!btn) return;
    var targetId = btn.dataset.target;
    var targetEl = document.getElementById(targetId);
    if (!targetEl) return;

    var text = targetEl.textContent;
    navigator.clipboard.writeText(text).then(function () {
      showToast("\ubcf5\uc0ac\ub418\uc5c8\uc2b5\ub2c8\ub2e4!");
    }).catch(function () {
      showToast("\ubcf5\uc0ac\uc5d0 \uc2e4\ud328\ud588\uc2b5\ub2c8\ub2e4.");
    });
  });
}

// ── 3-7. 플랫폼 렌더링 ─────────────────────────
function renderPlatforms() {
  var container = document.getElementById("platformRegions");
  if (!container) return;

  container.innerHTML = platformData.map(function (region, idx) {
    var platformsHTML = region.platforms.map(function (p) {
      var tagsHTML = p.advantages.map(function (a) {
        return '<span class="platform-tag">' + a + '</span>';
      }).join("");

      return (
        '<div class="platform-item">' +
          '<h4 class="platform-name">' + p.name + '</h4>' +
          '<p class="platform-desc">' + p.desc + '</p>' +
          '<div class="platform-tags">' + tagsHTML + '</div>' +
          '<span class="platform-best">\uCD94\uCC9C: ' + p.bestFor + '</span>' +
        '</div>'
      );
    }).join("");

    var openClass = idx === 0 ? " open" : "";

    return (
      '<div class="region-card' + openClass + '">' +
        '<div class="region-header" style="border-left: 4px solid ' + region.color + '">' +
          '<span class="region-flag">' + region.flag + '</span>' +
          '<h3 class="region-name">' + region.region + '</h3>' +
          '<span class="region-toggle">' + (idx === 0 ? "\u2212" : "+") + '</span>' +
        '</div>' +
        '<div class="region-platforms"' + (idx === 0 ? ' style="display:block"' : '') + '>' +
          platformsHTML +
        '</div>' +
      '</div>'
    );
  }).join("");

  // 아코디언 토글
  container.addEventListener("click", function (e) {
    var header = e.target.closest(".region-header");
    if (!header) return;
    var card = header.parentElement;
    var platformsEl = card.querySelector(".region-platforms");
    var toggle = card.querySelector(".region-toggle");
    var isOpen = card.classList.contains("open");

    if (isOpen) {
      card.classList.remove("open");
      platformsEl.style.display = "none";
      toggle.textContent = "+";
    } else {
      card.classList.add("open");
      platformsEl.style.display = "block";
      toggle.textContent = "\u2212";
    }
  });
}

// ── 3-8. 스크롤 기반 기능 ───────────────────────
function initScrollFeatures() {
  var navbar = document.getElementById("navbar");

  // 네비게이션 스크롤 효과
  window.addEventListener("scroll", function () {
    if (!navbar) return;
    if (window.scrollY > 50) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  });

  // Intersection Observer: 섹션 fade-in
  var sections = document.querySelectorAll(".section-container");
  if (sections.length > 0) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    }, { threshold: 0.1 });

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  // 스무스 스크롤
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var targetId = this.getAttribute("href");
      if (targetId === "#") return;
      var targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: "smooth" });
        // 모바일 메뉴 닫기
        var navMenu = document.getElementById("navMenu");
        if (navMenu) navMenu.classList.remove("active");
      }
    });
  });

  // 활성 섹션 표시
  var navLinks = document.querySelectorAll(".nav-link");
  var sectionEls = document.querySelectorAll("section[id]");

  window.addEventListener("scroll", function () {
    var scrollPos = window.scrollY + 200;
    sectionEls.forEach(function (section) {
      var top = section.offsetTop;
      var height = section.offsetHeight;
      var id = section.getAttribute("id");

      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(function (link) {
          link.classList.remove("active");
          if (link.getAttribute("href") === "#" + id) {
            link.classList.add("active");
          }
        });
      }
    });
  });
}

// ── 3-9. 모바일 메뉴 ───────────────────────────
function initMobileMenu() {
  var toggle = document.getElementById("navToggle");
  var menu = document.getElementById("navMenu");
  if (!toggle || !menu) return;

  toggle.addEventListener("click", function () {
    menu.classList.toggle("active");
    toggle.classList.toggle("active");
  });

  // 메뉴 항목 클릭 시 메뉴 닫기
  menu.querySelectorAll(".nav-link").forEach(function (link) {
    link.addEventListener("click", function () {
      menu.classList.remove("active");
      toggle.classList.remove("active");
    });
  });
}

// ── 3-10. 4개국어 음성 캐러셀 ───────────────────
function initVoiceCarousel() {
  var slides = document.querySelectorAll('.voice-slide');
  var dots = document.querySelectorAll('.voice-dot');
  if (slides.length === 0 || dots.length === 0) return;

  var currentSlide = 0;
  var interval;

  function showSlide(index) {
    slides.forEach(function (s) { s.classList.remove('active'); });
    dots.forEach(function (d) { d.classList.remove('active'); });
    slides[index].classList.add('active');
    dots[index].classList.add('active');
    currentSlide = index;
  }

  function nextSlide() {
    showSlide((currentSlide + 1) % slides.length);
  }

  function startAutoPlay() {
    interval = setInterval(nextSlide, 4000);
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      clearInterval(interval);
      showSlide(parseInt(dot.dataset.slide, 10));
      startAutoPlay();
    });
  });

  startAutoPlay();
}

// ── 3-11. YouTube 구독 버튼 ─────────────────────
function initYouTubeSubscribe() {
  // 채널 연결 완료 — <a> 태그의 기본 동작으로 YouTube 채널 이동
}

// ── 3-12. 뉴스레터 ─────────────────────────────
function initNewsletter() {
  var btn = document.getElementById("newsletterBtn");
  if (!btn) return;
  btn.addEventListener("click", function () {
    var email = document.getElementById("newsletterEmail");
    if (email && email.value.trim()) {
      showToast("\uAD6C\uB3C5 \uC2E0\uCCAD\uC774 \uC644\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4!");
      email.value = "";
    } else {
      showToast("\uC774\uBA54\uC77C \uC8FC\uC18C\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694.");
    }
  });
}

// ── Game Overlay (별을 쏘아라) ──────────────────
function initGameOverlay() {
  var openBtn = document.getElementById("openGameBtn");
  var closeBtn = document.getElementById("closeGameBtn");
  var overlay = document.getElementById("gameOverlay");
  var iframe = document.getElementById("gameIframe");
  if (!openBtn || !overlay || !iframe) return;

  function openGame(e) {
    if (e) e.preventDefault();
    var navMenu = document.getElementById("navMenu");
    var navToggle = document.getElementById("navToggle");
    if (navMenu) navMenu.classList.remove("active");
    if (navToggle) navToggle.classList.remove("active");
    iframe.src = "game/index.html";
    overlay.classList.add("active");
    document.body.style.overflow = "hidden";
    requestAnimationFrame(function () {
      overlay.classList.add("visible");
    });
  }

  function closeGame() {
    overlay.classList.remove("visible");
    setTimeout(function () {
      overlay.classList.remove("active");
      document.body.style.overflow = "";
      iframe.src = "about:blank";
    }, 350);
  }

  openBtn.addEventListener("click", openGame);
  if (closeBtn) closeBtn.addEventListener("click", closeGame);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && overlay.classList.contains("active")) {
      closeGame();
    }
  });
  window.addEventListener("message", function (e) {
    if (e.data === "closeGame") closeGame();
  });
}

// ── 4. 초기화 ───────────────────────────────────
document.addEventListener("DOMContentLoaded", function () {
  createStars();

  // JSON에서 명언 로드 후 모든 기능 초기화
  loadQuotes().then(function () {
    renderDailyQuote();
    renderQuoteCards("all");
    initFilters();
    initModal();
    initTranslator();
    initCopyButtons();
    initWellGift();
  });

  renderPlatforms();
  initScrollFeatures();
  initMobileMenu();
  initGameOverlay();
  initNewsletter();
  initVoiceCarousel();
  initYouTubeSubscribe();
  initAppInstall();
  initI18n();
  initPhilTabs();
  initLifeViews();
  initJigwan();
  renderFiveSteps();
  initTotalDiagram();
});

/* ============================================================
   12. App Install (PWA)
   ============================================================ */
var deferredPrompt = null;

window.addEventListener('beforeinstallprompt', function (e) {
  e.preventDefault();
  deferredPrompt = e;
  var btn = document.getElementById('installAppBtn');
  if (btn) {
    btn.style.display = 'inline-flex';
  }
});

function initAppInstall() {
  // Install tabs
  var tabs = document.querySelectorAll('.install-tab');
  var panels = document.querySelectorAll('.install-panel');

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) { t.classList.remove('active'); });
      panels.forEach(function (p) { p.classList.remove('active'); });
      tab.classList.add('active');
      var target = document.getElementById('panel-' + tab.dataset.tab);
      if (target) target.classList.add('active');
    });
  });

  // Auto-detect OS and show correct tab
  var ua = navigator.userAgent || '';
  if (/iPhone|iPad|iPod/i.test(ua)) {
    var iosTab = document.querySelector('[data-tab="ios"]');
    if (iosTab) iosTab.click();
  }

  // Direct install button
  var installBtn = document.getElementById('installAppBtn');
  if (installBtn) {
    installBtn.addEventListener('click', function () {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(function (result) {
          if (result.outcome === 'accepted') {
            installBtn.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg> 설치 완료!';
            installBtn.classList.add('installed');
          }
          deferredPrompt = null;
        });
      } else {
        showToast('브라우저 메뉴에서 "홈 화면에 추가"를 이용해주세요!');
      }
    });
  }
}

window.addEventListener('appinstalled', function () {
  var btn = document.getElementById('installAppBtn');
  if (btn) {
    btn.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg> 설치 완료!';
    btn.classList.add('installed');
  }
  showToast('꿈 꾸는 45° 앱이 설치되었습니다!');
});

/* ============================================================
   13. Little Prince Well Gift (어린왕자의 우물 선물)
   ============================================================ */
function initWellGift() {
  var overlay = document.getElementById('wellOverlay');
  if (!overlay) return;

  var now = new Date();
  var hour = now.getHours();
  var today = now.toISOString().slice(0, 10);
  var storageKey = 'well_gift_' + today;
  var shown = JSON.parse(localStorage.getItem(storageKey) || '{"morning":false,"evening":false}');

  // Morning: 6AM-12PM, Evening: 5PM-11PM
  var isMorning = hour >= 6 && hour < 12;
  var isEvening = hour >= 17 && hour < 23;
  var shouldShow = false;
  var timeSlot = '';

  if (isMorning && !shown.morning) {
    shouldShow = true;
    timeSlot = 'morning';
  } else if (isEvening && !shown.evening) {
    shouldShow = true;
    timeSlot = 'evening';
  }

  // Also show on first visit ever
  if (!localStorage.getItem('well_gift_ever')) {
    shouldShow = true;
    timeSlot = isMorning ? 'morning' : isEvening ? 'evening' : 'morning';
    localStorage.setItem('well_gift_ever', 'true');
  }

  if (shouldShow) {
    showWellGift(timeSlot);
    shown[timeSlot] = true;
    localStorage.setItem(storageKey, JSON.stringify(shown));
  }

  // Close handlers
  var closeBtn = document.getElementById('wellClose');
  if (closeBtn) {
    closeBtn.addEventListener('click', function () {
      overlay.classList.remove('active');
    });
  }
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) overlay.classList.remove('active');
  });

  // Share button
  var shareBtn = document.getElementById('wellShareBtn');
  if (shareBtn) {
    shareBtn.addEventListener('click', function () {
      var quoteText = document.getElementById('wellQuote').textContent;
      var authorText = document.getElementById('wellAuthor').textContent;
      var shareText = quoteText + '\n' + authorText + '\n\n— 꿈 꾸는 45° 어린왕자의 우물\nhttps://dream45.vercel.app';

      if (navigator.share) {
        navigator.share({ title: '어린왕자의 우물에서 온 선물', text: shareText });
      } else {
        navigator.clipboard.writeText(shareText).then(function () {
          showToast('명언이 복사되었습니다! 소중한 분에게 나눠주세요');
        });
      }
    });
  }
}

// Three gift types from The Little Prince
var giftTypes = [
  {
    key: 'well',
    name: '우물',
    emoji: '\uD83D\uDEB0',
    title: '어린왕자의 우물에서 온 선물',
    morningMsg: '오늘 아침, 우물에서 길어올린 희망의 한마디',
    eveningMsg: '오늘 저녁, 우물에서 길어올린 희망의 한마디',
    meaning: '척박한 현실을 견디게 하는 내면의 희망',
    themes: ['dream', 'hope']
  },
  {
    key: 'rose',
    name: '장미',
    emoji: '\uD83C\uDF39',
    title: '어린왕자의 장미가 전하는 선물',
    morningMsg: '오늘 아침, 장미가 속삭이는 책임의 한마디',
    eveningMsg: '오늘 저녁, 장미가 속삭이는 책임의 한마디',
    meaning: '내가 선택하고 책임지는 고요한 책임감',
    themes: ['challenge']
  },
  {
    key: 'box',
    name: '상자',
    emoji: '\uD83C\uDF81',
    title: '어린왕자의 상자에서 나온 선물',
    morningMsg: '오늘 아침, 상자를 열어 발견한 잠재력의 한마디',
    eveningMsg: '오늘 저녁, 상자를 열어 발견한 잠재력의 한마디',
    meaning: '규정되지 않은 무한한 잠재력',
    themes: ['courage']
  }
];

function showWellGift(timeSlot) {
  var overlay = document.getElementById('wellOverlay');

  // Pick a random gift type
  var giftType = giftTypes[Math.floor(Math.random() * giftTypes.length)];

  // Pick a quote that matches the gift type theme
  var matchingQuotes = quotes.filter(function (q) {
    return giftType.themes.indexOf(q.theme) !== -1;
  });
  if (matchingQuotes.length === 0) matchingQuotes = quotes;
  var lastIdx = parseInt(localStorage.getItem('well_last_idx') || '-1');
  var q = matchingQuotes[Math.floor(Math.random() * matchingQuotes.length)];
  var attempts = 0;
  while (q.id === lastIdx && matchingQuotes.length > 1 && attempts < 10) {
    q = matchingQuotes[Math.floor(Math.random() * matchingQuotes.length)];
    attempts++;
  }
  localStorage.setItem('well_last_idx', q.id.toString());

  // Highlight active gift type card
  document.querySelectorAll('.gift-type-card').forEach(function (c) {
    c.classList.remove('active');
  });
  var activeCard = document.getElementById('giftType' + giftType.key.charAt(0).toUpperCase() + giftType.key.slice(1));
  if (activeCard) activeCard.classList.add('active');

  // Set time badge and messages
  var badge = document.getElementById('wellTimeBadge');
  var title = document.getElementById('wellTitle');
  var subtitle = document.getElementById('wellSubtitle');
  var nextEl = document.getElementById('wellNext');

  badge.textContent = timeSlot === 'morning' ? 'Morning Gift' : 'Evening Gift';
  title.textContent = giftType.title;
  subtitle.textContent = timeSlot === 'morning' ? giftType.morningMsg : giftType.eveningMsg;
  nextEl.textContent = timeSlot === 'morning' ? '다음 선물: 오늘 저녁 5시' : '다음 선물: 내일 아침 6시';

  // Fill quote
  document.getElementById('wellQuote').textContent = '\u201C' + q.ko + '\u201D';
  document.getElementById('wellAuthor').textContent = '\u2014 ' + q.author.split('(')[0].trim();
  document.getElementById('wellEn').textContent = q.en;
  document.getElementById('wellZh').textContent = q.zh;
  document.getElementById('wellHi').textContent = q.hi;

  // Show with slight delay
  setTimeout(function () {
    overlay.classList.add('active');
  }, 800);
}

/* ============================================================
   14. i18n Translation System
   ============================================================ */
var translations = {
  ko: {
    'nav.whyDream': '왜 꿈을 꾸는가',
    'nav.philosophy': '철학 체계',
    'nav.life': '인생에 대하여',
    'nav.gallery': '명언 갤러리',
    'nav.translator': '4개국어 변환',
    'nav.goods': '굿즈 컬렉션',
    'nav.platforms': '글로벌 플랫폼',
    'nav.lab': '연구소',
    'nav.appInstall': '앱 설치',
    'hero.tagline': '고개를 45도 들어 하늘을 바라보는 순간, 꿈은 시작된다.',
    'hero.cta': '명언 탐험하기',
    'phil.title': '철학 체계',
    'phil.desc': '개념 없는 직관은 맹목적이고, 직관 없는 개념은 공허하다 — 칸트',
    'phil.conceptAxis': '개념의 축 (Concept)',
    'phil.conceptAttr': '추상적, 논리적, 보편적',
    'phil.conceptRole': '인생의 \'지도\' (Map)',
    'phil.conceptTool': '논문, 법철학, 신뢰의 원칙',
    'phil.conceptResult': '지혜 (Wisdom)',
    'phil.intuitionAxis': '직관의 축 (Intuition)',
    'phil.intuitionAttr': '구체적, 감각적, 개별적',
    'phil.intuitionRole': '인생의 \'나침반\' (Compass)',
    'phil.intuitionTool': '명상, 몰입, 현장의 감각',
    'phil.intuitionResult': '자비/실천 (Action)',
    'phil.bridge': '통합',
    'phil.tab1': '삶의 세 관점', 'phil.tab2': '세 방향성', 'phil.tab3': '철학',
    'phil.tab4': '분석 차원', 'phil.tab5': '인문학', 'phil.tab6': '추상적 엔진', 'phil.tab7': '설계 3단계',
    'phil.line': '선 (Line)', 'phil.stage': '무대 (Stage)', 'phil.web': '그물망 (Web)',
    'phil.abstract': '추상', 'phil.philosophy': '철학', 'phil.humanities2': '인문',
    'phil.lineAbstract': '생성과 흐름', 'phil.linePhil': '실존적 자유', 'phil.lineHuman': '결과보다 과정에 집중하라',
    'phil.stageAbstract': '역할과 페르소나', 'phil.stagePhil': '관계적 자아', 'phil.stageHuman': '고난과 자신을 동일시하지 말라',
    'phil.webAbstract': '연기(緣起)와 공존', 'phil.webPhil': '신뢰의 원칙', 'phil.webHuman': '모든 행위의 상호작용을 책임져라',
    'phil.trust': '신뢰 (Trust)', 'phil.time': '시간 (Time)', 'phil.self': '자아 (Self)',
    'phil.trustMeaning': '관계의 구체적 설계도', 'phil.timeMeaning': '흐름을 칸막이로 만드는 의지', 'phil.selfMeaning': '서사로 빚어내는 삶의 방향',
    'phil.trustPrince': '어린왕자의 장미 — 책임감', 'phil.timePrince': '어린왕자의 우물 — 희망', 'phil.selfPrince': '어린왕자의 상자 — 잠재력',
    'phil.metaphysics': '형이상학', 'phil.epistemology': '인식론', 'phil.ethics': '윤리학',
    'phil.metaTheory': '존재의 근원 탐구', 'phil.metaPractice': '자아 정체성 확립',
    'phil.episTheory': '진리의 조건 분석', 'phil.episPractice': '가짜 뉴스와 정보의 선별',
    'phil.ethicsTheory': '도덕 법칙의 수립', 'phil.ethicsPractice': 'AI 윤리 가이드라인 제작',
    'phil.politics': '정치/사회', 'phil.science': '과학/기술', 'phil.personal': '개인/삶',
    'phil.polTheory': '사회계약설, 정의론', 'phil.polPractice': '헌법, 투표권, 복지 제도',
    'phil.sciTheory': '인식론, 논리학', 'phil.sciPractice': 'AI 알고리즘, 과학적 방법론',
    'phil.perTheory': '실존주의, 윤리학', 'phil.perPractice': '가치 선택, 직업 윤리, 심리적 회복력',
    'phil.literature': '문학', 'phil.history': '사학', 'phil.philStudy': '철학',
    'phil.litTheory': '인간의 전형성, 상징', 'phil.litPractice': '공감 능력 향상, 정서적 치유',
    'phil.histTheory': '시대정신, 역사의 흐름', 'phil.histPractice': '현재 문제의 원인 파악 및 대안 제시',
    'phil.philTheory': '존재론, 인식론', 'phil.philPractice': '비판적 판단력, 윤리적 기준 설정',
    'phil.engTrust': '신뢰 (Trust)', 'phil.engPurpose': '목적 (Purpose)', 'phil.engLogic': '논리 (Logic)',
    'phil.engTrustOut': '자본, 계약, 협력', 'phil.engTrustLink': '거래 비용 감소 및 사회적 자본 형성',
    'phil.engPurposeOut': '선택, 포기, 전략', 'phil.engPurposeLink': '우선순위 설정을 통한 에너지 효율화',
    'phil.engLogicOut': '문장, 논문, 수익', 'phil.engLogicLink': '모호한 사고를 명확한 지식 자산으로 전환',
    'phil.design1Title': '1단계: 인식', 'phil.design1Module': '직관과 개념의 통합',
    'phil.design1Basis': '칸트의 \'경험의 삼각형\' \u00B7 불교의 \'일심이문\'',
    'phil.design1Goal': '정보와 감각 속에서 나만의 논리적 언어를 추출하는 훈련',
    'phil.design2Title': '2단계: 관계', 'phil.design2Module': '신뢰 시스템 구축',
    'phil.design2Basis': '화엄경 \'인드라망\' \u00B7 사회학적 \'무대\' 비유',
    'phil.design2Goal': '관계망을 이해하고 신뢰의 원칙을 자본으로 치환하는 방법론',
    'phil.design3Title': '3단계: 실행', 'phil.design3Module': '융합적 가치 창출',
    'phil.design3Basis': '들뢰즈의 \'선\' \u00B7 이중 나선 모델',
    'phil.design3Goal': '추상적 가치관을 시간 계획과 성과로 변환하는 행동 강령',
    'life.title': '인생에 대하여', 'life.desc': '止觀으로 보는 인생의 구조 — 멈추고, 보고, 나누고, 함께 가는 것',
    'life.viewJigwan': '止觀人生圖', 'life.viewFive': '다섯 걸음', 'life.viewTotal': '총체도',
    'life.jigwanSub': '苦에서 출발하여 止\u00B7觀을 거쳐 化로 나아가고, 마침내 和諍의 지혜로 회통하는 인생의 전체 구조',
    'life.clickHint': '각 마디를 클릭하면 상세 설명이 나타납니다',
    'life.fiveSub': '아프고, 멈추고, 보고, 나누고, 함께 가는 것 — 이것이 인문학이고, 이것이 삶입니다',
    'life.spiralMsg': '다섯 걸음을 걸으면 다시 처음으로 돌아옵니다. 하지만 같은 자리가 아닙니다 — 조금 더 깊은 곳에서 다시 시작합니다.',
    'life.totalSub': '마음에서 세계까지 — 止觀이 관통하는 삶의 전체 구조',
    'life.formulaTitle': '止觀의 構造 公式',
    'life.formulaMind': '마음에서 \u2192 수행', 'life.formulaRelation': '관계에서 \u2192 공감',
    'life.formulaCommunity': '공동체에서 \u2192 변화', 'life.formulaWorld': '세계에서 \u2192 평화'
  },
  en: {
    'nav.whyDream': 'Why Dream?',
    'nav.philosophy': 'Philosophy',
    'nav.life': 'About Life',
    'nav.gallery': 'Quote Gallery',
    'nav.translator': '4-Language Converter',
    'nav.goods': 'Goods Collection',
    'nav.platforms': 'Global Platforms',
    'nav.lab': 'Research Lab',
    'nav.appInstall': 'Install App',
    'hero.tagline': 'The moment you lift your eyes 45 degrees to the sky, dreams begin.',
    'hero.cta': 'Explore Quotes',
    'phil.title': 'Philosophy Framework',
    'phil.desc': 'Intuition without concept is blind, concept without intuition is empty \u2014 Kant',
    'phil.conceptAxis': 'Concept Axis',
    'phil.conceptAttr': 'Abstract, Logical, Universal',
    'phil.conceptRole': 'Map of Life',
    'phil.conceptTool': 'Papers, Jurisprudence, Trust Principles',
    'phil.conceptResult': 'Wisdom',
    'phil.intuitionAxis': 'Intuition Axis',
    'phil.intuitionAttr': 'Concrete, Sensory, Individual',
    'phil.intuitionRole': 'Compass of Life',
    'phil.intuitionTool': 'Meditation, Flow, Field Senses',
    'phil.intuitionResult': 'Compassion / Action',
    'phil.bridge': 'Integration',
    'phil.tab1': 'Three Perspectives', 'phil.tab2': 'Three Directions', 'phil.tab3': 'Philosophy',
    'phil.tab4': 'Analysis', 'phil.tab5': 'Humanities', 'phil.tab6': 'Abstract Engines', 'phil.tab7': '3-Stage Design',
    'phil.line': 'Line', 'phil.stage': 'Stage', 'phil.web': 'Web',
    'phil.abstract': 'Abstract', 'phil.philosophy': 'Philosophy', 'phil.humanities2': 'Humanities',
    'phil.lineAbstract': 'Creation & Flow', 'phil.linePhil': 'Existential Freedom', 'phil.lineHuman': 'Focus on process over results',
    'phil.stageAbstract': 'Roles & Personas', 'phil.stagePhil': 'Relational Self', 'phil.stageHuman': 'Don\'t identify yourself with suffering',
    'phil.webAbstract': 'Dependent Origination & Coexistence', 'phil.webPhil': 'Principle of Trust', 'phil.webHuman': 'Take responsibility for all interactions',
    'phil.trust': 'Trust', 'phil.time': 'Time', 'phil.self': 'Self',
    'phil.trustMeaning': 'A concrete blueprint for relationships', 'phil.timeMeaning': 'The will to partition the flow', 'phil.selfMeaning': 'Life direction crafted through narrative',
    'phil.trustPrince': 'Little Prince\'s Rose \u2014 Responsibility', 'phil.timePrince': 'Little Prince\'s Well \u2014 Hope', 'phil.selfPrince': 'Little Prince\'s Box \u2014 Potential',
    'phil.metaphysics': 'Metaphysics', 'phil.epistemology': 'Epistemology', 'phil.ethics': 'Ethics',
    'phil.metaTheory': 'Exploring the origin of existence', 'phil.metaPractice': 'Establishing self-identity',
    'phil.episTheory': 'Analyzing conditions of truth', 'phil.episPractice': 'Discerning fake news and information',
    'phil.ethicsTheory': 'Establishing moral laws', 'phil.ethicsPractice': 'Creating AI ethics guidelines',
    'phil.politics': 'Politics/Society', 'phil.science': 'Science/Technology', 'phil.personal': 'Personal/Life',
    'phil.polTheory': 'Social Contract Theory, Theory of Justice', 'phil.polPractice': 'Constitution, Voting Rights, Welfare',
    'phil.sciTheory': 'Epistemology, Logic', 'phil.sciPractice': 'AI Algorithms, Scientific Methods',
    'phil.perTheory': 'Existentialism, Ethics', 'phil.perPractice': 'Value Choices, Work Ethics, Psychological Resilience',
    'phil.literature': 'Literature', 'phil.history': 'History', 'phil.philStudy': 'Philosophy',
    'phil.litTheory': 'Human archetypes, Symbols', 'phil.litPractice': 'Enhanced empathy, Emotional healing',
    'phil.histTheory': 'Zeitgeist, Historical flow', 'phil.histPractice': 'Understanding causes and finding alternatives',
    'phil.philTheory': 'Ontology, Epistemology', 'phil.philPractice': 'Critical judgment, Ethical standards',
    'phil.engTrust': 'Trust', 'phil.engPurpose': 'Purpose', 'phil.engLogic': 'Logic',
    'phil.engTrustOut': 'Capital, Contracts, Cooperation', 'phil.engTrustLink': 'Reducing transaction costs, Building social capital',
    'phil.engPurposeOut': 'Choices, Sacrifices, Strategies', 'phil.engPurposeLink': 'Energy efficiency through prioritization',
    'phil.engLogicOut': 'Writing, Papers, Revenue', 'phil.engLogicLink': 'Converting vague thoughts into knowledge assets',
    'phil.design1Title': 'Stage 1: Recognition', 'phil.design1Module': 'Integrating intuition and concept',
    'phil.design1Basis': 'Kant\'s Triangle of Experience \u00B7 Buddhist Ilsim-imun', 'phil.design1Goal': 'Training to extract your logical language from information overload',
    'phil.design2Title': 'Stage 2: Relationship', 'phil.design2Module': 'Building trust systems',
    'phil.design2Basis': 'Indra\'s Net \u00B7 Stage metaphor from sociology', 'phil.design2Goal': 'Methodology to convert trust principles into capital and opportunities',
    'phil.design3Title': 'Stage 3: Execution', 'phil.design3Module': 'Creating convergent value',
    'phil.design3Basis': 'Deleuze\'s Line \u00B7 Double Helix Model', 'phil.design3Goal': 'Action plan to convert abstract values into time plans and outcomes',
    'life.title': 'About Life', 'life.desc': 'Structure of Life through Samatha-Vipa\u015Byan\u0101 \u2014 Stop, See, Share, Walk Together',
    'life.viewJigwan': 'Life Diagram', 'life.viewFive': 'Five Steps', 'life.viewTotal': 'Total Structure',
    'life.jigwanSub': 'Starting from suffering, through stopping and seeing, toward transformation, ultimately reaching the wisdom of harmony',
    'life.clickHint': 'Click each node to see detailed description',
    'life.fiveSub': 'Hurt, Pause, See, Share, Walk Together \u2014 This is humanities, this is life',
    'life.spiralMsg': 'After five steps, you return to the beginning. But not the same place \u2014 you start again from a deeper level.',
    'life.totalSub': 'From Mind to World \u2014 The total structure of life penetrated by Samatha-Vipa\u015Byan\u0101',
    'life.formulaTitle': 'Structural Formula of Jigwan',
    'life.formulaMind': 'In Mind \u2192 Practice', 'life.formulaRelation': 'In Relations \u2192 Empathy',
    'life.formulaCommunity': 'In Community \u2192 Change', 'life.formulaWorld': 'In World \u2192 Peace'
  },
  zh: {
    'nav.whyDream': '为什么要做梦', 'nav.philosophy': '哲学体系', 'nav.life': '关于人生',
    'nav.gallery': '名言画廊', 'nav.translator': '四语转换', 'nav.goods': '商品系列',
    'nav.platforms': '全球平台', 'nav.lab': '研究所', 'nav.appInstall': '安装应用',
    'hero.tagline': '抬头仰望45度天空的那一刻，梦想就开始了。', 'hero.cta': '探索名言',
    'phil.title': '哲学体系', 'phil.desc': '没有概念的直觉是盲目的，没有直觉的概念是空洞的 \u2014 康德',
    'phil.conceptAxis': '概念之轴', 'phil.conceptAttr': '抽象的、逻辑的、普遍的',
    'phil.conceptRole': '人生的\u201C地图\u201D', 'phil.conceptTool': '论文、法哲学、信任原则',
    'phil.conceptResult': '智慧', 'phil.intuitionAxis': '直觉之轴',
    'phil.intuitionAttr': '具体的、感性的、个别的', 'phil.intuitionRole': '人生的\u201C指南针\u201D',
    'phil.intuitionTool': '冥想、心流、现场感觉', 'phil.intuitionResult': '慈悲/实践', 'phil.bridge': '整合',
    'phil.tab1': '三种视角', 'phil.tab2': '三个方向', 'phil.tab3': '哲学',
    'phil.tab4': '分析维度', 'phil.tab5': '人文学', 'phil.tab6': '抽象引擎', 'phil.tab7': '设计三阶段',
    'phil.line': '线 (Line)', 'phil.stage': '舞台 (Stage)', 'phil.web': '网 (Web)',
    'phil.abstract': '抽象', 'phil.philosophy': '哲学', 'phil.humanities2': '人文',
    'phil.lineAbstract': '生成与流动', 'phil.linePhil': '存在的自由', 'phil.lineHuman': '关注过程而非结果',
    'phil.stageAbstract': '角色与人格面具', 'phil.stagePhil': '关系性自我', 'phil.stageHuman': '不要将苦难等同于自我',
    'phil.webAbstract': '缘起与共存', 'phil.webPhil': '信任原则', 'phil.webHuman': '为所有互动承担责任',
    'phil.trust': '信任', 'phil.time': '时间', 'phil.self': '自我',
    'phil.trustMeaning': '关系的具体蓝图', 'phil.timeMeaning': '将流动分隔的意志', 'phil.selfMeaning': '用叙事塑造人生方向',
    'phil.trustPrince': '小王子的玫瑰 \u2014 责任', 'phil.timePrince': '小王子的水井 \u2014 希望', 'phil.selfPrince': '小王子的盒子 \u2014 潜力',
    'phil.metaphysics': '形而上学', 'phil.epistemology': '认识论', 'phil.ethics': '伦理学',
    'phil.metaTheory': '探索存在的根源', 'phil.metaPractice': '确立自我认同',
    'phil.episTheory': '分析真理的条件', 'phil.episPractice': '辨别假新闻和信息',
    'phil.ethicsTheory': '建立道德法则', 'phil.ethicsPractice': '制定AI伦理指南',
    'phil.politics': '政治/社会', 'phil.science': '科学/技术', 'phil.personal': '个人/生活',
    'phil.polTheory': '社会契约论、正义论', 'phil.polPractice': '宪法、投票权、福利制度',
    'phil.sciTheory': '认识论、逻辑学', 'phil.sciPractice': 'AI算法、科学方法论',
    'phil.perTheory': '存在主义、伦理学', 'phil.perPractice': '价值选择、职业伦理、心理韧性',
    'phil.literature': '文学', 'phil.history': '史学', 'phil.philStudy': '哲学',
    'phil.litTheory': '人性典型、象征', 'phil.litPractice': '共情能力提升、情感疗愈',
    'phil.histTheory': '时代精神、历史潮流', 'phil.histPractice': '分析当前问题的根源并提出替代方案',
    'phil.philTheory': '本体论、认识论', 'phil.philPractice': '批判性判断力、伦理标准设定',
    'phil.engTrust': '信任', 'phil.engPurpose': '目的', 'phil.engLogic': '逻辑',
    'phil.engTrustOut': '资本、合约、合作', 'phil.engTrustLink': '降低交易成本，形成社会资本',
    'phil.engPurposeOut': '选择、放弃、策略', 'phil.engPurposeLink': '通过优先排序提高能量效率',
    'phil.engLogicOut': '文章、论文、收益', 'phil.engLogicLink': '将模糊思维转化为明确的知识资产',
    'phil.design1Title': '第一阶段：认知', 'phil.design1Module': '直觉与概念的整合',
    'phil.design1Basis': '康德的\u201C经验三角\u201D \u00B7 佛教的\u201C一心二门\u201D', 'phil.design1Goal': '从信息和感觉中提取自己逻辑语言的训练',
    'phil.design2Title': '第二阶段：关系', 'phil.design2Module': '建立信任系统',
    'phil.design2Basis': '华严经\u201C因陀罗网\u201D \u00B7 社会学\u201C舞台\u201D比喻', 'phil.design2Goal': '理解关系网并将信任原则转化为资本的方法论',
    'phil.design3Title': '第三阶段：执行', 'phil.design3Module': '创造融合价值',
    'phil.design3Basis': '德勒兹的\u201C线\u201D \u00B7 双螺旋模型', 'phil.design3Goal': '将抽象价值观转化为时间计划和成果的行动纲领',
    'life.title': '关于人生', 'life.desc': '通过止观看人生的结构 \u2014 停下、观察、分享、一起走',
    'life.viewJigwan': '止观人生图', 'life.viewFive': '五个步骤', 'life.viewTotal': '总体图',
    'life.jigwanSub': '从苦出发，经过止\u00B7观走向化，最终达到和诤的智慧',
    'life.clickHint': '点击各节点查看详细说明',
    'life.fiveSub': '痛、停、看、分享、同行 \u2014 这就是人文学，这就是生活',
    'life.spiralMsg': '走完五步后回到起点。但不是同一个地方 \u2014 从更深的层次重新开始。',
    'life.totalSub': '从心灵到世界 \u2014 止观贯穿生命的整体结构',
    'life.formulaTitle': '止观的结构公式',
    'life.formulaMind': '在心灵中 \u2192 修行', 'life.formulaRelation': '在关系中 \u2192 共情',
    'life.formulaCommunity': '在社区中 \u2192 变革', 'life.formulaWorld': '在世界中 \u2192 和平'
  },
  hi: {
    'nav.whyDream': '\u0938\u092A\u0928\u0947 \u0915\u094D\u092F\u094B\u0902 \u0926\u0947\u0916\u0947\u0902', 'nav.philosophy': '\u0926\u0930\u094D\u0936\u0928 \u092A\u094D\u0930\u0923\u093E\u0932\u0940', 'nav.life': '\u091C\u0940\u0935\u0928 \u0915\u0947 \u092C\u093E\u0930\u0947 \u092E\u0947\u0902',
    'nav.gallery': '\u0935\u093F\u091A\u093E\u0930 \u0917\u0948\u0932\u0930\u0940', 'nav.translator': '\u091A\u093E\u0930 \u092D\u093E\u0937\u093E \u0905\u0928\u0941\u0935\u093E\u0926\u0915', 'nav.goods': '\u0909\u0924\u094D\u092A\u093E\u0926 \u0938\u0902\u0917\u094D\u0930\u0939',
    'nav.platforms': '\u0935\u0948\u0936\u094D\u0935\u093F\u0915 \u092E\u0902\u091A', 'nav.lab': '\u0905\u0928\u0941\u0938\u0902\u0927\u093E\u0928 \u092A\u094D\u0930\u092F\u094B\u0917\u0936\u093E\u0932\u093E', 'nav.appInstall': '\u0910\u092A \u0907\u0902\u0938\u094D\u091F\u0949\u0932',
    'hero.tagline': '\u091C\u092C \u0906\u092A \u0906\u0938\u092E\u093E\u0928 \u0915\u0940 \u0913\u0930 45 \u0921\u093F\u0917\u094D\u0930\u0940 \u0928\u095B\u0930 \u0909\u0920\u093E\u0924\u0947 \u0939\u0948\u0902, \u0938\u092A\u0928\u0947 \u0936\u0941\u0930\u0942 \u0939\u094B\u0924\u0947 \u0939\u0948\u0902\u0964', 'hero.cta': '\u0935\u093F\u091A\u093E\u0930 \u0916\u094B\u091C\u0947\u0902',
    'phil.title': '\u0926\u0930\u094D\u0936\u0928 \u092A\u094D\u0930\u0923\u093E\u0932\u0940', 'phil.desc': '\u0905\u0935\u0927\u093E\u0930\u0923\u093E \u0915\u0947 \u092C\u093F\u0928\u093E \u0905\u0902\u0924\u0930\u094D\u091C\u094D\u091E\u093E\u0928 \u0905\u0902\u0927\u093E \u0939\u0948, \u0905\u0902\u0924\u0930\u094D\u091C\u094D\u091E\u093E\u0928 \u0915\u0947 \u092C\u093F\u0928\u093E \u0905\u0935\u0927\u093E\u0930\u0923\u093E \u0916\u093E\u0932\u0940 \u0939\u0948 \u2014 \u0915\u093E\u0902\u091F',
    'phil.conceptAxis': '\u0905\u0935\u0927\u093E\u0930\u0923\u093E \u0905\u0915\u094D\u0937', 'phil.conceptAttr': '\u0905\u092E\u0942\u0930\u094D\u0924, \u0924\u093E\u0930\u094D\u0915\u093F\u0915, \u0938\u093E\u0930\u094D\u0935\u092D\u094C\u092E\u093F\u0915',
    'phil.conceptRole': '\u091C\u0940\u0935\u0928 \u0915\u093E \u0928\u0915\u094D\u0936\u093E', 'phil.conceptTool': '\u0936\u094B\u0927\u092A\u0924\u094D\u0930, \u0935\u093F\u0927\u093F \u0926\u0930\u094D\u0936\u0928, \u0935\u093F\u0936\u094D\u0935\u093E\u0938 \u0938\u093F\u0926\u094D\u0927\u093E\u0902\u0924',
    'phil.conceptResult': '\u091C\u094D\u091E\u093E\u0928', 'phil.intuitionAxis': '\u0905\u0902\u0924\u0930\u094D\u091C\u094D\u091E\u093E\u0928 \u0905\u0915\u094D\u0937',
    'phil.intuitionAttr': '\u0920\u094B\u0938, \u0938\u0902\u0935\u0947\u0926\u0940, \u0935\u094D\u092F\u0915\u094D\u0924\u093F\u0917\u0924', 'phil.intuitionRole': '\u091C\u0940\u0935\u0928 \u0915\u093E \u0915\u092E\u094D\u092A\u093E\u0938',
    'phil.intuitionTool': '\u0927\u094D\u092F\u093E\u0928, \u092A\u094D\u0930\u0935\u093E\u0939, \u0915\u094D\u0937\u0947\u0924\u094D\u0930 \u0938\u0902\u0935\u0947\u0926\u0928\u093E', 'phil.intuitionResult': '\u0915\u0930\u0941\u0923\u093E / \u0915\u0930\u094D\u092E', 'phil.bridge': '\u090F\u0915\u0940\u0915\u0930\u0923',
    'phil.tab1': '\u0924\u0940\u0928 \u0926\u0943\u0937\u094D\u091F\u093F\u0915\u094B\u0923', 'phil.tab2': '\u0924\u0940\u0928 \u0926\u093F\u0936\u093E\u090F\u0901', 'phil.tab3': '\u0926\u0930\u094D\u0936\u0928',
    'phil.tab4': '\u0935\u093F\u0936\u094D\u0932\u0947\u0937\u0923', 'phil.tab5': '\u092E\u093E\u0928\u0935\u093F\u0915\u0940', 'phil.tab6': '\u0905\u092E\u0942\u0930\u094D\u0924 \u0907\u0902\u091C\u0928', 'phil.tab7': '3-\u091A\u0930\u0923 \u0921\u093F\u095B\u093E\u0907\u0928',
    'phil.line': '\u0930\u0947\u0916\u093E (Line)', 'phil.stage': '\u092E\u0902\u091A (Stage)', 'phil.web': '\u091C\u093E\u0932 (Web)',
    'phil.abstract': '\u0905\u092E\u0942\u0930\u094D\u0924', 'phil.philosophy': '\u0926\u0930\u094D\u0936\u0928', 'phil.humanities2': '\u092E\u093E\u0928\u0935\u093F\u0915\u0940',
    'phil.lineAbstract': '\u0938\u0943\u091C\u0928 \u0914\u0930 \u092A\u094D\u0930\u0935\u093E\u0939', 'phil.linePhil': '\u0905\u0938\u094D\u0924\u093F\u0924\u094D\u0935\u0917\u0924 \u0938\u094D\u0935\u0924\u0902\u0924\u094D\u0930\u0924\u093E', 'phil.lineHuman': '\u092A\u0930\u093F\u0923\u093E\u092E \u0938\u0947 \u0905\u0927\u093F\u0915 \u092A\u094D\u0930\u0915\u094D\u0930\u093F\u092F\u093E \u092A\u0930 \u0927\u094D\u092F\u093E\u0928 \u0926\u0947\u0902',
    'phil.stageAbstract': '\u092D\u0942\u092E\u093F\u0915\u093E\u090F\u0901 \u0914\u0930 \u092E\u0941\u0916\u094C\u091F\u0947', 'phil.stagePhil': '\u0938\u0902\u092C\u0902\u0927\u093E\u0924\u094D\u092E\u0915 \u0938\u094D\u0935', 'phil.stageHuman': '\u0915\u0937\u094D\u091F \u0915\u094B \u0905\u092A\u0928\u0940 \u092A\u0939\u091A\u093E\u0928 \u092E\u0924 \u092C\u0928\u093E\u0913',
    'phil.webAbstract': '\u092A\u094D\u0930\u0924\u0940\u0924\u094D\u092F\u0938\u092E\u0941\u0924\u094D\u092A\u093E\u0926 \u0914\u0930 \u0938\u0939\u0905\u0938\u094D\u0924\u093F\u0924\u094D\u0935', 'phil.webPhil': '\u0935\u093F\u0936\u094D\u0935\u093E\u0938 \u0915\u093E \u0938\u093F\u0926\u094D\u0927\u093E\u0902\u0924', 'phil.webHuman': '\u0938\u092D\u0940 \u0905\u0902\u0924\u0903\u0915\u094D\u0930\u093F\u092F\u093E\u0913\u0902 \u0915\u0940 \u095B\u093F\u092E\u094D\u092E\u0947\u0926\u093E\u0930\u0940 \u0932\u094B',
    'phil.trust': '\u0935\u093F\u0936\u094D\u0935\u093E\u0938', 'phil.time': '\u0938\u092E\u092F', 'phil.self': '\u0938\u094D\u0935\u092F\u0902',
    'phil.trustMeaning': '\u0938\u0902\u092C\u0902\u0927\u094B\u0902 \u0915\u093E \u0920\u094B\u0938 \u0916\u093E\u0915\u093E', 'phil.timeMeaning': '\u092A\u094D\u0930\u0935\u093E\u0939 \u0915\u094B \u0935\u093F\u092D\u093E\u091C\u093F\u0924 \u0915\u0930\u0928\u0947 \u0915\u0940 \u0907\u091A\u094D\u091B\u093E\u0936\u0915\u094D\u0924\u093F', 'phil.selfMeaning': '\u0915\u0925\u093E \u0938\u0947 \u0917\u0922\u093C\u0940 \u091C\u0940\u0935\u0928 \u0926\u093F\u0936\u093E',
    'phil.trustPrince': '\u091B\u094B\u091F\u0947 \u0930\u093E\u091C\u0915\u0941\u092E\u093E\u0930 \u0915\u093E \u0917\u0941\u0932\u093E\u092C \u2014 \u095B\u093F\u092E\u094D\u092E\u0947\u0926\u093E\u0930\u0940', 'phil.timePrince': '\u091B\u094B\u091F\u0947 \u0930\u093E\u091C\u0915\u0941\u092E\u093E\u0930 \u0915\u093E \u0915\u0941\u0906\u0901 \u2014 \u0906\u0936\u093E', 'phil.selfPrince': '\u091B\u094B\u091F\u0947 \u0930\u093E\u091C\u0915\u0941\u092E\u093E\u0930 \u0915\u093E \u0921\u093F\u092C\u094D\u092C\u093E \u2014 \u0938\u0902\u092D\u093E\u0935\u0928\u093E',
    'phil.metaphysics': '\u0905\u0927\u093F\u092D\u094C\u0924\u093F\u0915\u0940', 'phil.epistemology': '\u091C\u094D\u091E\u093E\u0928\u092E\u0940\u092E\u093E\u0902\u0938\u093E', 'phil.ethics': '\u0928\u0940\u0924\u093F\u0936\u093E\u0938\u094D\u0924\u094D\u0930',
    'phil.metaTheory': '\u0905\u0938\u094D\u0924\u093F\u0924\u094D\u0935 \u0915\u0947 \u092E\u0942\u0932 \u0915\u0940 \u0916\u094B\u091C', 'phil.metaPractice': '\u0906\u0924\u094D\u092E-\u092A\u0939\u091A\u093E\u0928 \u0938\u094D\u0925\u093E\u092A\u093F\u0924 \u0915\u0930\u0928\u093E',
    'phil.episTheory': '\u0938\u0924\u094D\u092F \u0915\u0940 \u0936\u0930\u094D\u0924\u094B\u0902 \u0915\u093E \u0935\u093F\u0936\u094D\u0932\u0947\u0937\u0923', 'phil.episPractice': '\u092B\u093C\u0947\u0915 \u0928\u094D\u092F\u0942\u095B\u093C \u0914\u0930 \u0938\u0942\u091A\u0928\u093E \u0915\u0940 \u092A\u0939\u091A\u093E\u0928',
    'phil.ethicsTheory': '\u0928\u0948\u0924\u093F\u0915 \u0928\u093F\u092F\u092E\u094B\u0902 \u0915\u0940 \u0938\u094D\u0925\u093E\u092A\u0928\u093E', 'phil.ethicsPractice': 'AI \u0928\u0948\u0924\u093F\u0915\u0924\u093E \u0926\u093F\u0936\u093E\u0928\u093F\u0930\u094D\u0926\u0947\u0936 \u092C\u0928\u093E\u0928\u093E',
    'phil.politics': '\u0930\u093E\u091C\u0928\u0940\u0924\u093F/\u0938\u092E\u093E\u091C', 'phil.science': '\u0935\u093F\u091C\u094D\u091E\u093E\u0928/\u092A\u094D\u0930\u094C\u0926\u094D\u092F\u094B\u0917\u093F\u0915\u0940', 'phil.personal': '\u0935\u094D\u092F\u0915\u094D\u0924\u093F\u0917\u0924/\u091C\u0940\u0935\u0928',
    'phil.polTheory': '\u0938\u093E\u092E\u093E\u091C\u093F\u0915 \u0905\u0928\u0941\u092C\u0902\u0927, \u0928\u094D\u092F\u093E\u092F \u0938\u093F\u0926\u094D\u0927\u093E\u0902\u0924', 'phil.polPractice': '\u0938\u0902\u0935\u093F\u0927\u093E\u0928, \u092E\u0924\u0926\u093E\u0928 \u0905\u0927\u093F\u0915\u093E\u0930, \u0915\u0932\u094D\u092F\u093E\u0923',
    'phil.sciTheory': '\u091C\u094D\u091E\u093E\u0928\u092E\u0940\u092E\u093E\u0902\u0938\u093E, \u0924\u0930\u094D\u0915\u0936\u093E\u0938\u094D\u0924\u094D\u0930', 'phil.sciPractice': 'AI \u090F\u0932\u094D\u0917\u094B\u0930\u093F\u0926\u092E, \u0935\u0948\u091C\u094D\u091E\u093E\u0928\u093F\u0915 \u092A\u0926\u094D\u0927\u0924\u093F',
    'phil.perTheory': '\u0905\u0938\u094D\u0924\u093F\u0924\u094D\u0935\u0935\u093E\u0926, \u0928\u0940\u0924\u093F\u0936\u093E\u0938\u094D\u0924\u094D\u0930', 'phil.perPractice': '\u092E\u0942\u0932\u094D\u092F \u091A\u092F\u0928, \u0915\u093E\u0930\u094D\u092F \u0928\u0948\u0924\u093F\u0915\u0924\u093E, \u092E\u093E\u0928\u0938\u093F\u0915 \u0932\u091A\u0940\u0932\u093E\u092A\u0928',
    'phil.literature': '\u0938\u093E\u0939\u093F\u0924\u094D\u092F', 'phil.history': '\u0907\u0924\u093F\u0939\u093E\u0938', 'phil.philStudy': '\u0926\u0930\u094D\u0936\u0928',
    'phil.litTheory': '\u092E\u093E\u0928\u0935 \u092A\u094D\u0930\u0924\u093F\u0930\u0942\u092A, \u092A\u094D\u0930\u0924\u0940\u0915', 'phil.litPractice': '\u0938\u0939\u093E\u0928\u0941\u092D\u0942\u0924\u093F \u092C\u0922\u093C\u093E\u0928\u093E, \u092D\u093E\u0935\u0928\u093E\u0924\u094D\u092E\u0915 \u0909\u092A\u091A\u093E\u0930',
    'phil.histTheory': '\u092F\u0941\u0917\u091A\u0947\u0924\u0928\u093E, \u0910\u0924\u093F\u0939\u093E\u0938\u093F\u0915 \u092A\u094D\u0930\u0935\u093E\u0939', 'phil.histPractice': '\u0935\u0930\u094D\u0924\u092E\u093E\u0928 \u0938\u092E\u0938\u094D\u092F\u093E\u0913\u0902 \u0915\u0947 \u0915\u093E\u0930\u0923 \u0914\u0930 \u0935\u093F\u0915\u0932\u094D\u092A \u0916\u094B\u091C\u0928\u093E',
    'phil.philTheory': '\u0924\u0924\u094D\u0935\u092E\u0940\u092E\u093E\u0902\u0938\u093E, \u091C\u094D\u091E\u093E\u0928\u092E\u0940\u092E\u093E\u0902\u0938\u093E', 'phil.philPractice': '\u0906\u0932\u094B\u091A\u0928\u093E\u0924\u094D\u092E\u0915 \u0928\u093F\u0930\u094D\u0923\u092F, \u0928\u0948\u0924\u093F\u0915 \u092E\u093E\u0928\u0915',
    'phil.engTrust': '\u0935\u093F\u0936\u094D\u0935\u093E\u0938', 'phil.engPurpose': '\u0909\u0926\u094D\u0926\u0947\u0936\u094D\u092F', 'phil.engLogic': '\u0924\u0930\u094D\u0915',
    'phil.engTrustOut': '\u092A\u0942\u0901\u091C\u0940, \u0905\u0928\u0941\u092C\u0902\u0927, \u0938\u0939\u092F\u094B\u0917', 'phil.engTrustLink': '\u0932\u0947\u0928\u0926\u0947\u0928 \u0932\u093E\u0917\u0924 \u0915\u092E \u0915\u0930\u0928\u093E \u0914\u0930 \u0938\u093E\u092E\u093E\u091C\u093F\u0915 \u092A\u0942\u0901\u091C\u0940 \u092C\u0928\u093E\u0928\u093E',
    'phil.engPurposeOut': '\u091A\u092F\u0928, \u0924\u094D\u092F\u093E\u0917, \u0930\u0923\u0928\u0940\u0924\u093F', 'phil.engPurposeLink': '\u092A\u094D\u0930\u093E\u0925\u092E\u093F\u0915\u0924\u093E \u0938\u0947 \u090A\u0930\u094D\u091C\u093E \u0926\u0915\u094D\u0937\u0924\u093E',
    'phil.engLogicOut': '\u0932\u0947\u0916\u0928, \u0936\u094B\u0927\u092A\u0924\u094D\u0930, \u0906\u092F', 'phil.engLogicLink': '\u0905\u0938\u094D\u092A\u0937\u094D\u091F \u0935\u093F\u091A\u093E\u0930 \u0915\u094B \u091C\u094D\u091E\u093E\u0928 \u0938\u0902\u092A\u0924\u094D\u0924\u093F \u092E\u0947\u0902 \u092C\u0926\u0932\u0928\u093E',
    'phil.design1Title': '\u091A\u0930\u0923 1: \u092A\u0939\u091A\u093E\u0928', 'phil.design1Module': '\u0905\u0902\u0924\u0930\u094D\u091C\u094D\u091E\u093E\u0928 \u0914\u0930 \u0905\u0935\u0927\u093E\u0930\u0923\u093E \u0915\u093E \u090F\u0915\u0940\u0915\u0930\u0923',
    'phil.design1Basis': '\u0915\u093E\u0902\u091F \u0915\u093E \u0905\u0928\u0941\u092D\u0935 \u0924\u094D\u0930\u093F\u0915\u094B\u0923 \u00B7 \u092C\u094C\u0926\u094D\u0927 \u0907\u0932\u094D\u0938\u093F\u092E-\u0907\u092E\u0941\u0928', 'phil.design1Goal': '\u0938\u0942\u091A\u0928\u093E \u0938\u0947 \u0905\u092A\u0928\u0940 \u0924\u093E\u0930\u094D\u0915\u093F\u0915 \u092D\u093E\u0937\u093E \u0928\u093F\u0915\u093E\u0932\u0928\u0947 \u0915\u093E \u092A\u094D\u0930\u0936\u093F\u0915\u094D\u0937\u0923',
    'phil.design2Title': '\u091A\u0930\u0923 2: \u0938\u0902\u092C\u0902\u0927', 'phil.design2Module': '\u0935\u093F\u0936\u094D\u0935\u093E\u0938 \u092A\u094D\u0930\u0923\u093E\u0932\u0940 \u0928\u093F\u0930\u094D\u092E\u093E\u0923',
    'phil.design2Basis': '\u0907\u0902\u0926\u094D\u0930 \u0915\u093E \u091C\u093E\u0932 \u00B7 \u0938\u092E\u093E\u091C\u0936\u093E\u0938\u094D\u0924\u094D\u0930\u0940\u092F \u092E\u0902\u091A \u0930\u0942\u092A\u0915', 'phil.design2Goal': '\u0935\u093F\u0936\u094D\u0935\u093E\u0938 \u0938\u093F\u0926\u094D\u0927\u093E\u0902\u0924 \u0915\u094B \u092A\u0942\u0901\u091C\u0940 \u092E\u0947\u0902 \u092C\u0926\u0932\u0928\u0947 \u0915\u0940 \u092A\u0926\u094D\u0927\u0924\u093F',
    'phil.design3Title': '\u091A\u0930\u0923 3: \u0915\u094D\u0930\u093F\u092F\u093E\u0928\u094D\u0935\u092F\u0928', 'phil.design3Module': '\u0938\u0902\u092F\u0941\u0915\u094D\u0924 \u092E\u0942\u0932\u094D\u092F \u0938\u0943\u091C\u0928',
    'phil.design3Basis': '\u0926\u0947\u0932\u094D\u092F\u0942\u095B\u093C \u0915\u0940 \u0930\u0947\u0916\u093E \u00B7 \u0921\u092C\u0932 \u0939\u0947\u0932\u093F\u0915\u094D\u0938 \u092E\u0949\u0921\u0932', 'phil.design3Goal': '\u0905\u092E\u0942\u0930\u094D\u0924 \u092E\u0942\u0932\u094D\u092F\u094B\u0902 \u0915\u094B \u0938\u092E\u092F \u092F\u094B\u091C\u0928\u093E \u0914\u0930 \u092A\u0930\u093F\u0923\u093E\u092E\u094B\u0902 \u092E\u0947\u0902 \u092C\u0926\u0932\u0928\u093E',
    'life.title': '\u091C\u0940\u0935\u0928 \u0915\u0947 \u092C\u093E\u0930\u0947 \u092E\u0947\u0902', 'life.desc': '\u0936\u092E\u0925-\u0935\u093F\u092A\u0936\u094D\u092F\u0928\u093E \u0938\u0947 \u091C\u0940\u0935\u0928 \u0915\u0940 \u0938\u0902\u0930\u091A\u0928\u093E \u2014 \u0930\u0941\u0915\u0947\u0902, \u0926\u0947\u0916\u0947\u0902, \u092C\u093E\u0901\u091F\u0947\u0902, \u0938\u093E\u0925 \u091A\u0932\u0947\u0902',
    'life.viewJigwan': '\u091C\u0940\u0935\u0928 \u091A\u093F\u0924\u094D\u0930', 'life.viewFive': '\u092A\u093E\u0901\u091A \u0915\u0926\u092E', 'life.viewTotal': '\u0938\u092E\u0917\u094D\u0930 \u0938\u0902\u0930\u091A\u0928\u093E',
    'life.jigwanSub': '\u0926\u0941\u0903\u0916 \u0938\u0947 \u0936\u0941\u0930\u0942, \u0936\u092E\u0925-\u0935\u093F\u092A\u0936\u094D\u092F\u0928\u093E \u0938\u0947 \u0917\u0941\u095B\u0930\u0924\u0947 \u0939\u0941\u090F \u092A\u0930\u093F\u0935\u0930\u094D\u0924\u0928 \u0915\u0940 \u0913\u0930, \u0905\u0902\u0924\u0924\u0903 \u0938\u093E\u092E\u0902\u091C\u0938\u094D\u092F \u0915\u0940 \u092C\u0941\u0926\u094D\u0927\u093F \u0924\u0915',
    'life.clickHint': '\u0935\u093F\u0935\u0930\u0923 \u0926\u0947\u0916\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F \u092A\u094D\u0930\u0924\u094D\u092F\u0947\u0915 \u092C\u093F\u0902\u0926\u0941 \u092A\u0930 \u0915\u094D\u0932\u093F\u0915 \u0915\u0930\u0947\u0902',
    'life.fiveSub': '\u0926\u0930\u094D\u0926, \u0930\u0941\u0915\u0928\u093E, \u0926\u0947\u0916\u0928\u093E, \u092C\u093E\u0901\u091F\u0928\u093E, \u0938\u093E\u0925 \u091A\u0932\u0928\u093E \u2014 \u092F\u0939\u0940 \u092E\u093E\u0928\u0935\u093F\u0915\u0940 \u0939\u0948, \u092F\u0939\u0940 \u091C\u0940\u0935\u0928 \u0939\u0948',
    'life.spiralMsg': '\u092A\u093E\u0901\u091A \u0915\u0926\u092E \u091A\u0932\u0928\u0947 \u0915\u0947 \u092C\u093E\u0926 \u092B\u093F\u0930 \u0936\u0941\u0930\u0941\u0906\u0924 \u092A\u0930 \u0932\u094C\u091F\u0924\u0947 \u0939\u0948\u0902\u0964 \u0932\u0947\u0915\u093F\u0928 \u0935\u0939\u0940 \u091C\u0917\u0939 \u0928\u0939\u0940\u0902 \u2014 \u0914\u0930 \u0917\u0939\u0930\u093E\u0908 \u0938\u0947 \u092B\u093F\u0930 \u0936\u0941\u0930\u0942 \u0939\u094B\u0924\u093E \u0939\u0948\u0964',
    'life.totalSub': '\u092E\u0928 \u0938\u0947 \u0935\u093F\u0936\u094D\u0935 \u0924\u0915 \u2014 \u0936\u092E\u0925-\u0935\u093F\u092A\u0936\u094D\u092F\u0928\u093E \u091C\u0940\u0935\u0928 \u0915\u0940 \u0938\u092E\u0917\u094D\u0930 \u0938\u0902\u0930\u091A\u0928\u093E \u0915\u094B \u092D\u0947\u0926\u0924\u093E \u0939\u0948',
    'life.formulaTitle': '\u091C\u093F\u0917\u0935\u093E\u0928 \u0915\u0940 \u0938\u0902\u0930\u091A\u0928\u093E\u0924\u094D\u092E\u0915 \u0938\u0942\u0924\u094D\u0930',
    'life.formulaMind': '\u092E\u0928 \u092E\u0947\u0902 \u2192 \u0938\u093E\u0927\u0928\u093E', 'life.formulaRelation': '\u0938\u0902\u092C\u0902\u0927\u094B\u0902 \u092E\u0947\u0902 \u2192 \u0938\u0939\u093E\u0928\u0941\u092D\u0942\u0924\u093F',
    'life.formulaCommunity': '\u0938\u092E\u0941\u0926\u093E\u092F \u092E\u0947\u0902 \u2192 \u092A\u0930\u093F\u0935\u0930\u094D\u0924\u0928', 'life.formulaWorld': '\u0935\u093F\u0936\u094D\u0935 \u092E\u0947\u0902 \u2192 \u0936\u093E\u0902\u0924\u093F'
  }
};

/* ============================================================
   15. i18n Functions
   ============================================================ */
var currentLang = 'ko';

function switchLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('dream45_lang', lang);
  document.documentElement.setAttribute('lang', lang);

  var t = translations[lang];
  if (!t) return;

  document.querySelectorAll('[data-i18n]').forEach(function(el) {
    var key = el.getAttribute('data-i18n');
    if (t[key]) {
      if (el.tagName === 'INPUT' && el.placeholder) {
        el.placeholder = t[key];
      } else {
        el.textContent = t[key];
      }
    }
  });

  // Update lang switcher display
  var flags = {ko:'\uD83C\uDDF0\uD83C\uDDF7', en:'\uD83C\uDDFA\uD83C\uDDF8', zh:'\uD83C\uDDE8\uD83C\uDDF3', hi:'\uD83C\uDDEE\uD83C\uDDF3'};
  var names = {ko:'\uD55C\uAD6D\uC5B4', en:'English', zh:'\u4E2D\u6587', hi:'\u0939\u093F\u0928\u094D\u0926\u0940'};
  var currentBtn = document.getElementById('langCurrent');
  if (currentBtn) {
    var flagEl = currentBtn.querySelector('.lang-flag');
    var nameEl = currentBtn.querySelector('.lang-name');
    if (flagEl) flagEl.textContent = flags[lang];
    if (nameEl) nameEl.textContent = names[lang];
  }
  var items = document.querySelectorAll('#langDropdown li');
  items.forEach(function(li) {
    li.classList.toggle('active', li.dataset.lang === lang);
  });
}

function initI18n() {
  var saved = localStorage.getItem('dream45_lang') || 'ko';
  currentLang = saved;

  var switcher = document.getElementById('langSwitcher');
  var currentBtn = document.getElementById('langCurrent');
  var dropdown = document.getElementById('langDropdown');
  if (switcher && currentBtn && dropdown) {
    currentBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      switcher.classList.toggle('open');
    });
    dropdown.querySelectorAll('li').forEach(function(li) {
      li.addEventListener('click', function() {
        switchLanguage(li.dataset.lang);
        switcher.classList.remove('open');
      });
    });
    document.addEventListener('click', function() {
      switcher.classList.remove('open');
    });
  }

  if (saved !== 'ko') switchLanguage(saved);
}

/* ============================================================
   16. Philosophy Tabs
   ============================================================ */
function initPhilTabs() {
  var tabs = document.querySelectorAll('.phil-tab');
  var panels = document.querySelectorAll('.phil-panel');
  tabs.forEach(function(tab) {
    tab.addEventListener('click', function() {
      tabs.forEach(function(t) { t.classList.remove('active'); });
      panels.forEach(function(p) { p.classList.remove('active'); });
      tab.classList.add('active');
      var target = document.getElementById('panel-' + tab.dataset.tab);
      if (target) target.classList.add('active');
    });
  });
}

/* ============================================================
   17. Life View Tabs
   ============================================================ */
function initLifeViews() {
  var tabs = document.querySelectorAll('.life-view-tab');
  var views = document.querySelectorAll('.life-view');
  tabs.forEach(function(tab) {
    tab.addEventListener('click', function() {
      tabs.forEach(function(t) { t.classList.remove('active'); });
      views.forEach(function(v) { v.classList.remove('active'); });
      tab.classList.add('active');
      var target = document.getElementById('view-' + tab.dataset.view);
      if (target) target.classList.add('active');
    });
  });
}

/* ============================================================
   18. Jigwan Diagram (止觀人生圖)
   ============================================================ */
var jigwanPhases = [
  {id:'go', hanja:'\u82E6', title:'\uC0B6\uC758 \uC790\uAC01', color:'#8B4513', desc:'\uC0DD\uB85C\uBCD1\uC0AC\uC758 \uC2E4\uC874\uC801 \uC9C1\uBA74. \uC778\uC0DD\uC758 \uCD9C\uBC1C\uC810\uC740 \uACE0\uD1B5\uC758 \uC778\uC2DD\uC774\uB2E4.', domain:'\uC2E4\uC874', wonhyo:'\u89BA\u77E5\u82E6\u969B'},
  {id:'ji', hanja:'\u6B62', title:'\uBA48\uCDA4\uACFC \uACE0\uC694', color:'#1a3a5c', desc:'\u5FC3\u771E\u5982\u9580 \u2014 \uB9C8\uC74C\uC758 \uBCF8\uB798 \uACE0\uC694\uD568\uC5D0 \uBA38\uBB34\uB294 \uC218\uD589.', domain:'\u5167\u884C', wonhyo:'\u5FC3\u771E\u5982\u9580'},
  {id:'gwan', hanja:'\u89C0', title:'\uD1B5\uCC30\uACFC \uAD00\uC870', color:'#2d5016', desc:'\u5FC3\u751F\u6EC5\u9580 \u2014 \uC0DD\uBA78\uD558\uB294 \uB9C8\uC74C\uC758 \uC2E4\uC0C1\uC744 \uAFB8\uB6AB\uC5B4 \uBD04.', domain:'\u6D1E\u5BDF', wonhyo:'\u5FC3\u751F\u6EC5\u9580'},
  {id:'hwa', hanja:'\u5316', title:'\uBCC0\uD654\uC640 \uC2E4\uCC9C', color:'#8B0000', desc:'\u5916\u5316 \u2014 \uC548\uC5D0\uC11C \uBCF8 \uAC83\uC774 \uBC16\uC73C\uB85C \uD750\uB7EC\uB098\uAC04\uB2E4.', domain:'\u5916\u5316', wonhyo:'\u5316\u773E\u751F\u884C'},
  {id:'hwajaeng', hanja:'\u548C', title:'\uC870\uD654\uC640 \uD3C9\uD654', color:'#6B3FA0', desc:'\u548C\u8ACD \u2014 \uB300\uB9BD\uC744 \uB179\uC5EC \uD558\uB098\uB85C \uD68C\uD1B5\uC2DC\uD0A4\uB294 \uC6D0\uD6A8\uC758 \uAD81\uADF9\uC801 \uBE44\uC804.', domain:'\u6703\u901A', wonhyo:'\u548C\u8ACD\u6B78\u4E00'}
];

function initJigwan() {
  var svg = document.getElementById('jigwanSvg');
  if (!svg) return;

  var ns = 'http://www.w3.org/2000/svg';
  var cx = 300, cy = 300, r = 220;

  // Draw connecting lines between phases
  var positions = [];
  jigwanPhases.forEach(function(phase, i) {
    var angle = (i * 72 - 90) * Math.PI / 180;
    positions.push({x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle)});
  });

  // Draw path connecting all phases
  for (var i = 0; i < positions.length; i++) {
    var next = (i + 1) % positions.length;
    var line = document.createElementNS(ns, 'line');
    line.setAttribute('x1', positions[i].x);
    line.setAttribute('y1', positions[i].y);
    line.setAttribute('x2', positions[next].x);
    line.setAttribute('y2', positions[next].y);
    line.setAttribute('stroke', '#334155');
    line.setAttribute('stroke-width', '2');
    line.setAttribute('stroke-dasharray', '6,4');
    svg.appendChild(line);
  }

  // Draw phase nodes
  jigwanPhases.forEach(function(phase, i) {
    var angle = (i * 72 - 90) * Math.PI / 180;
    var px = cx + r * Math.cos(angle);
    var py = cy + r * Math.sin(angle);

    // Outer glow circle
    var glow = document.createElementNS(ns, 'circle');
    glow.setAttribute('cx', px);
    glow.setAttribute('cy', py);
    glow.setAttribute('r', '48');
    glow.setAttribute('fill', phase.color);
    glow.setAttribute('opacity', '0.15');
    svg.appendChild(glow);

    // Main circle
    var circle = document.createElementNS(ns, 'circle');
    circle.setAttribute('cx', px);
    circle.setAttribute('cy', py);
    circle.setAttribute('r', '38');
    circle.setAttribute('fill', phase.color);
    circle.setAttribute('stroke', '#fff');
    circle.setAttribute('stroke-width', '2');
    circle.setAttribute('style', 'cursor:pointer;transition:transform 0.3s ease');
    circle.dataset.phase = phase.id;
    svg.appendChild(circle);

    // Hanja text
    var text = document.createElementNS(ns, 'text');
    text.setAttribute('x', px);
    text.setAttribute('y', py + 2);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'middle');
    text.setAttribute('fill', '#fff');
    text.setAttribute('font-size', '28');
    text.setAttribute('font-weight', 'bold');
    text.setAttribute('style', 'cursor:pointer;pointer-events:none');
    text.textContent = phase.hanja;
    svg.appendChild(text);

    // Title below circle
    var label = document.createElementNS(ns, 'text');
    label.setAttribute('x', px);
    label.setAttribute('y', py + 58);
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('fill', '#555');
    label.setAttribute('font-size', '13');
    label.textContent = phase.title;
    svg.appendChild(label);

    // Click handler
    circle.addEventListener('click', function() {
      showJigwanDetail(phase);
    });
  });

  // Center label
  var centerText = document.createElementNS(ns, 'text');
  centerText.setAttribute('x', cx);
  centerText.setAttribute('y', cy);
  centerText.setAttribute('text-anchor', 'middle');
  centerText.setAttribute('dominant-baseline', 'middle');
  centerText.setAttribute('fill', '#8a7e72');
  centerText.setAttribute('font-size', '16');
  centerText.textContent = '\u6B62\u89C0\u4EBA\u751F\u5716';
  svg.appendChild(centerText);
}

function showJigwanDetail(phase) {
  var detail = document.getElementById('jigwanDetail');
  if (!detail) return;

  detail.innerHTML =
    '<div style="border-left:4px solid ' + phase.color + ';padding:1rem 1.2rem;background:rgba(0,0,0,0.03);border-radius:0 8px 8px 0">' +
      '<h4 style="color:' + phase.color + ';margin:0 0 0.5rem 0;font-size:1.2rem">' + phase.hanja + ' \u2014 ' + phase.title + '</h4>' +
      '<p style="color:#444;margin:0 0 0.5rem 0;line-height:1.6">' + phase.desc + '</p>' +
      '<div style="display:flex;gap:1rem;flex-wrap:wrap;margin-top:0.5rem">' +
        '<span style="color:#888;font-size:0.85rem">\uC601\uC5ED: <strong style="color:#333">' + phase.domain + '</strong></span>' +
        '<span style="color:#888;font-size:0.85rem">\uC6D0\uD6A8: <em style="color:#333">' + phase.wonhyo + '</em></span>' +
      '</div>' +
    '</div>';
  detail.style.display = 'block';
}

/* ============================================================
   19. Five Steps (다섯 걸음)
   ============================================================ */
var fiveSteps = [
  {emoji:'\uD83D\uDCA7', title:'\uC544\uD504\uB2E4', en:'It Hurts', desc:'\uC0B6\uC774 \uC544\uD504\uB2E4\uB294 \uAC83\uC744 \uB290\uB07C\uB294 \uC21C\uAC04', color:'#6B7B8D'},
  {emoji:'\uD83C\uDF3F', title:'\uBA48\uCD98\uB2E4', en:'I Pause', desc:'\uB2EC\uB9AC\uB358 \uC0B6\uC744 \uC7A0\uC2DC \uBA48\uCD94\uB294 \uC2DC\uAC04', color:'#4A7C59'},
  {emoji:'\uD83D\uDC41', title:'\uBCF8\uB2E4', en:'I See', desc:'\uBA48\uCD98 \uC790\uB9AC\uC5D0\uC11C \uC0B6\uC744 \uB2E4\uC2DC \uBC14\uB77C\uBCF4\uB294 \uB208', color:'#8B6914'},
  {emoji:'\uD83E\uDD32', title:'\uB098\uB208\uB2E4', en:'I Share', desc:'\uBCF8 \uAC83\uC744 \uB2E4\uB978 \uC0AC\uB78C\uACFC \uB098\uB204\uB294 \uC2E4\uCC9C', color:'#9B4D3A'},
  {emoji:'\uD83C\uDF05', title:'\uD568\uAED8 \uAC04\uB2E4', en:'We Walk Together', desc:'\uB098\uC640 \uB108\uC758 \uC774\uC57C\uAE30\uAC00 \uD558\uB098\uB85C \uC774\uC5B4\uC9C0\uB294 \uD3C9\uD654', color:'#6B4C8A'}
];

function renderFiveSteps() {
  var list = document.getElementById('fiveStepsList');
  if (!list) return;

  list.innerHTML = fiveSteps.map(function(step, i) {
    return (
      '<div class="five-step-card" data-index="' + i + '" style="border-left:4px solid ' + step.color + ';cursor:pointer">' +
        '<div class="five-step-header" style="display:flex;align-items:center;gap:12px;padding:16px 20px">' +
          '<span class="five-step-emoji" style="font-size:1.8rem">' + step.emoji + '</span>' +
          '<div class="five-step-titles">' +
            '<strong style="color:#1a1a2e;font-size:1.1rem">' + step.title + '</strong>' +
            '<span style="color:#888;font-size:0.85rem;margin-left:0.5rem">' + step.en + '</span>' +
          '</div>' +
          '<span class="five-step-toggle" style="color:#aaa;font-size:1.2rem;margin-left:auto">+</span>' +
        '</div>' +
        '<div class="five-step-detail" style="display:none;padding:0.8rem 1rem 0.5rem 3.2rem;color:#555;line-height:1.6">' +
          step.desc +
        '</div>' +
      '</div>'
    );
  }).join('');

  // Click to expand/collapse
  list.addEventListener('click', function(e) {
    var card = e.target.closest('.five-step-card');
    if (!card) return;
    var detail = card.querySelector('.five-step-detail');
    var toggle = card.querySelector('.five-step-toggle');
    if (!detail || !toggle) return;

    var isOpen = detail.style.display !== 'none';
    detail.style.display = isOpen ? 'none' : 'block';
    toggle.textContent = isOpen ? '+' : '\u2212';
  });
}

/* ============================================================
   20. Total Structure Diagram (총체도)
   ============================================================ */
var totalLayers = [
  {id:'mind', hanja:'\u5FC3', label:'\uB9C8\uC74C', color:'#6B3FA0', radius:50},
  {id:'self', hanja:'\u6211', label:'\uC790\uC544', color:'#1a3a5c', radius:100},
  {id:'relation', hanja:'\u7DE3', label:'\uAD00\uACC4', color:'#2d5016', radius:150},
  {id:'community', hanja:'\u8846', label:'\uACF5\uB3D9\uCCB4', color:'#8B0000', radius:200},
  {id:'world', hanja:'\u754C', label:'\uC138\uACC4', color:'#8B4513', radius:250}
];

var totalDetails = {
  mind: {title:'\u5FC3 \u2014 \uB9C8\uC74C', desc:'\uBAA8\uB4E0 \uAC83\uC758 \uCD9C\uBC1C\uC810. \u6B62\u89C0\uC740 \uB9C8\uC74C\uC5D0\uC11C \uC2DC\uC791\uB41C\uB2E4.', practice:'\uBA85\uC0C1, \uC790\uAE30 \uC131\uCC30'},
  self: {title:'\u6211 \u2014 \uC790\uC544', desc:'\uB9C8\uC74C\uC744 \uB2F4\uB294 \uADF8\uB987. \uB098\uB294 \uB204\uAD6C\uC778\uAC00\uB97C \uBB3B\uB294 \uC790\uB9AC.', practice:'\uC77C\uAE30, \uC790\uAE30 \uC11C\uC0AC'},
  relation: {title:'\u7DE3 \u2014 \uAD00\uACC4', desc:'\uB098\uC640 \uB108\uAC00 \uB9CC\uB098\uB294 \uC790\uB9AC. \uC2E0\uB8B0\uC758 \uC6D0\uCE59\uC774 \uC791\uB3D9\uD55C\uB2E4.', practice:'\uACBD\uCCAD, \uACF5\uAC10, \uB300\uD654'},
  community: {title:'\u8846 \u2014 \uACF5\uB3D9\uCCB4', desc:'\uAD00\uACC4\uAC00 \uBAA8\uC5EC \uD558\uB098\uC758 \uC138\uACC4\uB97C \uC774\uB8EC\uB2E4.', practice:'\uD611\uB825, \uBD09\uC0AC, \uC0AC\uD68C\uCC38\uC5EC'},
  world: {title:'\u754C \u2014 \uC138\uACC4', desc:'\uACF5\uB3D9\uCCB4\uAC00 \uD655\uC7A5\uB418\uC5B4 \uC804\uCCB4\uB97C \uD3EC\uC6A9\uD558\uB294 \uD3C9\uD654.', practice:'\uD654\uD574, \uC5F0\uB300, \uD3C9\uD654 \uC6B4\uB3D9'}
};

function initTotalDiagram() {
  var svg = document.getElementById('totalSvg');
  if (!svg) return;

  var ns = 'http://www.w3.org/2000/svg';
  var cx = 330, cy = 330;

  // Draw layers from outside to inside so inner circles are on top
  var reversed = totalLayers.slice().reverse();
  reversed.forEach(function(layer) {
    // Ring
    var circle = document.createElementNS(ns, 'circle');
    circle.setAttribute('cx', cx);
    circle.setAttribute('cy', cy);
    circle.setAttribute('r', layer.radius);
    circle.setAttribute('fill', layer.color);
    circle.setAttribute('fill-opacity', '0.08');
    circle.setAttribute('stroke', layer.color);
    circle.setAttribute('stroke-width', '1.5');
    circle.setAttribute('stroke-opacity', '0.4');
    circle.setAttribute('style', 'cursor:pointer;transition:fill-opacity 0.3s');
    circle.dataset.layer = layer.id;
    svg.appendChild(circle);

    // Hanja label
    var text = document.createElementNS(ns, 'text');
    text.setAttribute('x', cx);
    text.setAttribute('y', cy - layer.radius + 20);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('fill', '#333');
    text.setAttribute('font-size', '14');
    text.setAttribute('font-weight', 'bold');
    text.setAttribute('style', 'pointer-events:none');
    text.textContent = layer.hanja + ' ' + layer.label;
    svg.appendChild(text);

    // Click handler
    circle.addEventListener('click', function(e) {
      e.stopPropagation();
      showTotalDetail(layer.id);
    });

    // Hover effects
    circle.addEventListener('mouseenter', function() {
      circle.setAttribute('fill-opacity', '0.18');
    });
    circle.addEventListener('mouseleave', function() {
      circle.setAttribute('fill-opacity', '0.08');
    });
  });
}

function showTotalDetail(layerId) {
  var detail = document.getElementById('totalDetail');
  if (!detail) return;

  var info = totalDetails[layerId];
  if (!info) return;

  var layer = totalLayers.find(function(l) { return l.id === layerId; });
  var color = layer ? layer.color : '#64748b';

  detail.innerHTML =
    '<div style="border-left:4px solid ' + color + ';padding:1rem 1.2rem;background:rgba(0,0,0,0.03);border-radius:0 8px 8px 0">' +
      '<h4 style="color:' + color + ';margin:0 0 0.5rem 0;font-size:1.2rem">' + info.title + '</h4>' +
      '<p style="color:#444;margin:0 0 0.5rem 0;line-height:1.6">' + info.desc + '</p>' +
      '<span style="color:#888;font-size:0.85rem">\uC2E4\uCC9C: <strong style="color:#333">' + info.practice + '</strong></span>' +
    '</div>';
  detail.style.display = 'block';
}
