/**
 * 暉映 H.I.T ✕ 呂口 Re!cord ｜ 官方網站互動核心腳本
 * 功能包含：
 * 1. 雙主題切換 (Default Studio ⇄ ZLAB 實驗室深色模式)
 * 2. 首席好奇官小怪人雙眼眼球游標追蹤與語錄點擊
 * 3. 靈感火花粒子特效 (Canvas Particle System)
 * 4. 品牌色票 HEX 一鍵複製與 Toast 提示
 * 5. 手機版選單切換與自動收合
 * 6. 平滑滾動與錨點跳轉
 */

document.addEventListener('DOMContentLoaded', () => {

  // =========================================================================
  // 1. 雙主題切換 (Default Studio ⇄ ZLAB Dark Mode)
  // =========================================================================
  const themeToggle = document.getElementById('themeToggle');
  const toggleIcon = themeToggle ? themeToggle.querySelector('.toggle-icon') : null;
  const toggleText = themeToggle ? themeToggle.querySelector('.toggle-text') : null;
  const htmlEl = document.documentElement;
  const mascotPngImg = document.getElementById('mascotPngImg');

  const savedTheme = localStorage.getItem('hueiinturn_theme') || 'default';
  applyTheme(savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = htmlEl.getAttribute('data-theme');
      const newTheme = currentTheme === 'zlab' ? 'default' : 'zlab';
      applyTheme(newTheme);
      localStorage.setItem('hueiinturn_theme', newTheme);
    });
  }

  function applyTheme(theme) {
    htmlEl.setAttribute('data-theme', theme);
    if (!toggleIcon || !toggleText) return;
    if (theme === 'zlab') {
      toggleIcon.textContent = '☀️';
      toggleText.textContent = '日常模式';
      if (mascotPngImg) {
        mascotPngImg.src = '吉祥物.png';
      }
    } else {
      toggleIcon.textContent = '🧪';
      toggleText.textContent = 'ZLAB 模式';
      if (mascotPngImg) {
        mascotPngImg.src = 'ip orange-02.png';
      }
    }
  }


  // =========================================================================
  // 2. 好奇小怪人雙視圖切換 (靈動互動版 ⇄ 原創手繪版) 與眼球追蹤
  // =========================================================================
  const tabSvg = document.getElementById('tabSvg') || document.getElementById('viewBtnSvg');
  const tabPng = document.getElementById('tabPng') || document.getElementById('viewBtnPng');
  const mascotSvgView = document.getElementById('mascotSvgView') || document.getElementById('mascotInteractive');
  const mascotPngView = document.getElementById('mascotPngView');
  const leftPupil = document.getElementById('leftPupil');
  const rightPupil = document.getElementById('rightPupil');
  const mascotMsg = document.getElementById('mascotMessage');
  const mascotCard = document.querySelector('.mascot-card');

  // 視圖切換 (動態向量 ⇄ 手繪原作)
  if (tabSvg && tabPng && mascotSvgView && mascotPngView) {
    tabSvg.addEventListener('click', () => {
      tabSvg.classList.add('active');
      tabPng.classList.remove('active');
      mascotSvgView.style.display = 'block';
      mascotPngView.style.display = 'none';
      showToast('已切換至 ⚡ 靈動向量版（眼球隨滑鼠移動）');
    });

    tabPng.addEventListener('click', () => {
      tabPng.classList.add('active');
      tabSvg.classList.remove('active');
      mascotSvgView.style.display = 'none';
      mascotPngView.style.display = 'flex';
      showToast('已切換至 🎨 均君原創高精度手繪手稿');
    });
  }

  // 小怪人實戰金句庫
  const mascotQuotes = [
    '「嘿！我們來打破規則，搞點有實質商業價值的名堂！」',
    '「用工程思維拆解演算法，很多問題就被連帶解決了。」',
    '「在重複的賽局中，真實的記錄是最強的信任資產。」',
    '「我們拒絕做外貼式，因為那是在愛車上貼膏藥。」',
    '「別以為我們只會搞技術，行銷與溫度也藏在裡面！」',
    '「保持開放的好奇心，永遠以自學者姿態直面市場。」'
  ];
  let quoteIndex = 0;

  if (mascotCard && mascotMsg) {
    mascotCard.addEventListener('click', (e) => {
      quoteIndex = (quoteIndex + 1) % mascotQuotes.length;
      mascotMsg.textContent = mascotQuotes[quoteIndex];
      mascotCard.classList.add('active-spark');
      setTimeout(() => mascotCard.classList.remove('active-spark'), 400);

      // 觸發靈感火花
      const rect = mascotCard.getBoundingClientRect();
      createSparkBurst(e.clientX || (rect.left + rect.width / 2), e.clientY || (rect.top + rect.height / 2), 40);
    });
  }

  // 眼球追蹤游標與觸控移動
  const maxOffset = 7;

  function updatePupils(clientX, clientY) {
    if (!leftPupil || !rightPupil || (mascotSvgView && mascotSvgView.style.display === 'none')) return;

    const leftRect = leftPupil.getBoundingClientRect();
    const rightRect = rightPupil.getBoundingClientRect();

    const leftCenterX = leftRect.left + leftRect.width / 2;
    const leftCenterY = leftRect.top + leftRect.height / 2;
    const rightCenterX = rightRect.left + rightRect.width / 2;
    const rightCenterY = rightRect.top + rightRect.height / 2;

    const leftAngle = Math.atan2(clientY - leftCenterY, clientX - leftCenterX);
    const rightAngle = Math.atan2(clientY - rightCenterY, clientX - rightCenterX);

    const leftDist = Math.hypot(clientX - leftCenterX, clientY - leftCenterY);
    const rightDist = Math.hypot(clientX - rightCenterX, clientY - rightCenterY);

    const leftR = Math.min(maxOffset, leftDist * 0.04);
    const rightR = Math.min(maxOffset, rightDist * 0.04);

    const leftDx = Math.cos(leftAngle) * leftR;
    const leftDy = Math.sin(leftAngle) * leftR;
    const rightDx = Math.cos(rightAngle) * rightR;
    const rightDy = Math.sin(rightAngle) * rightR;

    // 在 scale(1, -1) 翻轉座標系中，Y 軸反向確保瞳孔精確追隨游標
    leftPupil.style.transform = `translate(${leftDx}px, ${-leftDy}px)`;
    rightPupil.style.transform = `translate(${rightDx}px, ${-rightDy}px)`;
  }

  window.addEventListener('mousemove', (e) => {
    updatePupils(e.clientX, e.clientY);
  });

  window.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches.length > 0) {
      updatePupils(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });


  // =========================================================================
  // 3. 靈感火花畫布粒子系統 (Canvas Particle System)
  // =========================================================================
  const canvas = document.getElementById('sparkCanvas');
  const ctx = canvas ? canvas.getContext('2d') : null;
  let particles = [];
  let animationId = null;

  function resizeCanvas() {
    if (!canvas) return;
    const hero = canvas.parentElement;
    if (hero) {
      canvas.width = hero.clientWidth;
      canvas.height = hero.clientHeight;
    }
  }

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  const sparkColors = ['#ec8726', '#083b87', '#6600ff', '#ffffff', '#ffaa44'];

  class Particle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 6 + 2;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.size = Math.random() * 5 + 3;
      this.color = sparkColors[Math.floor(Math.random() * sparkColors.length)];
      this.alpha = 1;
      this.decay = Math.random() * 0.03 + 0.02;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vy += 0.08;
      this.vx *= 0.98;
      this.alpha -= this.decay;
      if (this.size > 0.4) this.size -= 0.05;
    }

    draw(ctx) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, this.alpha);
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function createSparkBurst(originX, originY, count = 50) {
    if (!canvas || !ctx) return;
    const heroRect = canvas.parentElement.getBoundingClientRect();
    const x = originX - heroRect.left;
    const y = originY - heroRect.top;

    for (let i = 0; i < count; i++) {
      particles.push(new Particle(x, y));
    }

    if (!animationId) {
      loopParticles();
    }
  }

  function loopParticles() {
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.update();
      p.draw(ctx);
      if (p.alpha <= 0) {
        particles.splice(i, 1);
      }
    }

    if (particles.length > 0) {
      animationId = requestAnimationFrame(loopParticles);
    } else {
      cancelAnimationFrame(animationId);
      animationId = null;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }


  // =========================================================================
  // 4. 點擊複製顏色代碼與 Toast 提示
  // =========================================================================
  const colorChips = document.querySelectorAll('.color-chip[data-color], .color-card[data-color]');
  const toast = document.getElementById('toast');
  let toastTimer = null;

  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2400);
  }

  colorChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const hex = chip.getAttribute('data-color');
      if (hex) {
        navigator.clipboard.writeText(hex).then(() => {
          showToast(`已複製色彩碼 ${hex} 到剪貼簿！`);
        }).catch(() => {
          showToast(`色碼：${hex}`);
        });
      }
    });
  });


  // =========================================================================
  // 5. 手機版選單切換與自動收合
  // =========================================================================
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('open');
      mobileToggle.classList.toggle('open', isOpen);
    });

    const menuLinks = navMenu.querySelectorAll('a');
    menuLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        mobileToggle.classList.remove('open');
      });
    });
  }


  // =========================================================================
  // 6. 預約與商務洽詢表單 (Formspree 異步寄信)
  // =========================================================================
  const contactForm = document.getElementById('contactForm');
  const submitBtn = document.getElementById('submitBtn');
  const formStatus = document.getElementById('formStatus');

  if (contactForm && submitBtn && formStatus) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // 按鈕載入狀態反饋
      const originalBtnHtml = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>⏳ 專案需求傳送中，請稍候...</span>';
      formStatus.style.display = 'none';

      const formData = new FormData(contactForm);

      try {
        const response = await fetch(contactForm.action, {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json'
          }
        });

        if (response.ok) {
          contactForm.reset();
          submitBtn.innerHTML = '<span>✅ 需求已成功送達！</span>';
          submitBtn.disabled = false;

          formStatus.className = 'form-status status-success';
          formStatus.innerHTML = '<strong>🎉 感謝您的預約！專案需求已順利寄達蘇哲遠的信箱。</strong><br>我將在 24 小時內仔細評估您的產業需求，並透過 Email 與您聯繫！';
          formStatus.style.display = 'block';

          // 觸發慶祝火花
          const rect = submitBtn.getBoundingClientRect();
          createSparkBurst(rect.left + rect.width / 2, rect.top, 60);

          setTimeout(() => {
            submitBtn.innerHTML = originalBtnHtml;
          }, 5000);
        } else {
          const data = await response.json();
          if (data && data.errors) {
            throw new Error(data.errors.map(err => err.message).join(', '));
          } else {
            throw new Error('伺服器目前忙碌中');
          }
        }
      } catch (err) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>重新送出需求</span>';
        formStatus.className = 'form-status status-error';
        formStatus.innerHTML = `<strong>⚠️ 傳送時發生問題：${err.message || '請稍候再試'}</strong><br>您也可以直接透過 Threads (@record_learning_lab) 或 IG 私訊聯繫哲遠！`;
        formStatus.style.display = 'block';
      }
    });
  }

  // =========================================================================
  // 7. 思考專欄動態輪播與分類篩選 (Records Carousel & Filter System)
  // =========================================================================
  const recordsSlider = document.getElementById('recordsSlider');
  const recordsTrack = document.getElementById('recordsTrack');
  const recordsPrevBtn = document.getElementById('recordsPrevBtn');
  const recordsNextBtn = document.getElementById('recordsNextBtn');
  const filterChips = document.querySelectorAll('#recordsFilterChips .filter-chip');
  const recordCards = document.querySelectorAll('.record-card');
  const recordsDotsContainer = document.getElementById('recordsDots');

  if (recordsSlider && recordsTrack) {
    // 取得當前滾動步進距離 (卡片寬度 + gap)
    const getScrollAmount = () => {
      const firstCard = recordsSlider.querySelector('.record-card:not([style*="display: none"])');
      if (firstCard) {
        return firstCard.offsetWidth + 24;
      }
      return 340;
    };

    if (recordsPrevBtn) {
      recordsPrevBtn.addEventListener('click', () => {
        recordsSlider.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
      });
    }

    if (recordsNextBtn) {
      recordsNextBtn.addEventListener('click', () => {
        recordsSlider.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
      });
    }

    // 建立與更新指示圓點 (Dots)
    function updateDots() {
      if (!recordsDotsContainer) return;
      recordsDotsContainer.innerHTML = '';
      const visibleCards = Array.from(recordCards).filter(c => c.style.display !== 'none');
      if (visibleCards.length <= 1) return;

      visibleCards.forEach((card, idx) => {
        const dot = document.createElement('button');
        dot.className = `carousel-dot ${idx === 0 ? 'active' : ''}`;
        dot.setAttribute('aria-label', `滑動到第 ${idx + 1} 篇文章`);
        dot.addEventListener('click', () => {
          card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
        });
        recordsDotsContainer.appendChild(dot);
      });
    }

    // 滾動同步切換高亮圓點
    let scrollTimeout;
    recordsSlider.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const visibleCards = Array.from(recordCards).filter(c => c.style.display !== 'none');
        const dots = recordsDotsContainer.querySelectorAll('.carousel-dot');
        if (!dots.length) return;

        const sliderRect = recordsSlider.getBoundingClientRect();
        let closestIdx = 0;
        let minDiff = Infinity;

        visibleCards.forEach((card, idx) => {
          const cardRect = card.getBoundingClientRect();
          const diff = Math.abs(cardRect.left - sliderRect.left);
          if (diff < minDiff) {
            minDiff = diff;
            closestIdx = idx;
          }
        });

        dots.forEach((d, i) => d.classList.toggle('active', i === closestIdx));
      }, 60);
    });

    // 專欄分類切換 (Filter Chips)
    filterChips.forEach(chip => {
      chip.addEventListener('click', () => {
        filterChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');

        const filter = chip.getAttribute('data-filter');
        recordCards.forEach(card => {
          const category = card.getAttribute('data-category');
          if (filter === 'all' || category === filter) {
            card.style.display = 'flex';
            card.style.opacity = '1';
          } else {
            card.style.display = 'none';
          }
        });

        recordsSlider.scrollTo({ left: 0, behavior: 'smooth' });
        updateDots();
      });
    });

    updateDots();
  }

});
