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
    } else {
      toggleIcon.textContent = '🧪';
      toggleText.textContent = 'ZLAB 模式';
    }
  }


  // =========================================================================
  // 2. 好奇小怪人靈動互動版 (眼球游標與觸控追蹤 ＋ 點擊金句)
  // =========================================================================
  const mascotSvgView = document.getElementById('mascotSvgView');
  const leftPupil = document.getElementById('leftPupil');
  const rightPupil = document.getElementById('rightPupil');
  const mascotMsg = document.getElementById('mascotMessage');
  const mascotCard = document.querySelector('.mascot-card');

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
    canvas.style.display = 'block';
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
      canvas.style.display = 'none';
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
  // 6. 思考檔案庫資料夾系統 (The Archive Collections System)
  // =========================================================================
  const archiveTabs = document.querySelectorAll('.tab-ear-btn');
  const archiveFolderDot = document.getElementById('archiveFolderDot');
  const archiveFolderPath = document.getElementById('archiveFolderPath');
  const archiveFolderStatus = document.getElementById('archiveFolderStatus');
  const archiveItemsList = document.getElementById('archiveItemsList');
  const archiveMascotTrigger = document.getElementById('archiveMascotTrigger');
  const archiveMascotHead = document.getElementById('archiveMascotHead');

  const archiveData = {
    cases: {
      path: 'MANUFACTURING CASES · 傳產出海實戰',
      color: '#f89c1e',
      status: '● 旗艦專案檔案',
      items: [
        {
          tag: '傳產出海 · 晴雨窗實錄',
          title: '在台灣，廉價的外貼式晴雨窗是贈品，但我們想把它做成精密工藝',
          desc: '比德堡內嵌式實戰：打破低階贈品心智，以精密骨科手術級導角出海北美，重塑高於市價 3 倍品類。',
          meta: '約 6 分鐘閱讀 · 蘇哲遠',
          url: 'records/car-window-deflector.html'
        },
        {
          tag: '跨境電商 · 官方集訓',
          title: '剛退伍接電商投廣，北上亞馬遜官方集訓：理工人的「開車指標論」',
          desc: '跳脫傳統免洗投流話術，拆解曝光率、點擊率與轉換率的連動矩陣，為傳產建立第一座造血飛輪。',
          meta: '約 5 分鐘閱讀 · 蘇哲遠',
          url: 'records/amazon-algorithm-log.html'
        }
      ]
    },
    books: {
      path: 'BOOK CLUB · 哲遠讀書會',
      color: '#083b87',
      status: '● 每週讀書會精選推薦',
      items: [
        {
          tag: '經典商管 · 鴻溝理論',
          title: '《跨越鴻溝》（Crossing the Chasm）：傳產二代在創新出海時，最容易踩空的死蔭幽谷',
          desc: '早期採用者與主流市場之間的致命斷層。如何用垂直利基點突破保守市場的信任防線？',
          meta: '讀書會第 14 期精華 · 約 8 分鐘',
          url: 'records/article-template.html'
        },
        {
          tag: '商業思維 · 賽局定價',
          title: '《競合理念》讀後感：不要跟對手打零和割喉戰，改寫賽局的五大要素 (PARTS)',
          desc: '製造業老闆最常問：「別人賣 300 我賣 900 怎麼贏？」這本書給出了數學級的優雅答案。',
          meta: '讀書會推薦必讀 · 約 7 分鐘',
          url: 'records/article-template.html'
        }
      ]
    },
    vlogs: {
      path: 'FOUNDER VLOGS · 創業隨錄 ✕ 影音',
      color: '#6600ff',
      status: '● 像朋友圈一樣走心的真實錄像',
      items: [
        {
          tag: '創業真誠隨錄 · 影音',
          title: '【短影 01】中山機電退伍創立暉映的第一年：那些在工廠機台旁沒說出口的焦慮',
          desc: '拋棄包裝過的成功學光環，真實記錄創業初期的碰撞、與傳產長輩溝通的挫折，以及如何找回節奏。',
          meta: '🎬 影片時長 08:24 · 觀看記錄',
          url: 'records/article-template.html'
        },
        {
          tag: '對話實錄 · 創業隨錄',
          title: '【短影 02】為什麼我堅持每週辦讀書會？「向內沉澱」是我在浮躁市場裡唯一的護城河',
          desc: '不是為了打卡社交，而是為了在每天處理雜亂外部資訊時，保有一段絕對冷靜的深度思考時間。',
          meta: '🎬 影片時長 06:15 · 觀看記錄',
          url: 'records/article-template.html'
        }
      ]
    },
    thinking: {
      path: 'MODELS & LOGIC · 賽局與工程思維',
      color: '#21c110',
      status: '● 理工邏輯與決策模型',
      items: [
        {
          tag: '思維模型 · 沉沒成本',
          title: '賽局、記憶與真實：大腦如何面對創傷與影像的膜',
          desc: '在重複發生的賽局中，記憶是打破雙輸困境的唯一解藥。理工人如何做人生與商業決策？',
          meta: '約 7 分鐘閱讀 · 蘇哲遠',
          url: 'records/game-theory-memory.html'
        },
        {
          tag: '工程邏輯 · 營運閉環',
          title: '不用死背語法：為什麼創業家都該具備「系統架構級」的 IT 思維？',
          desc: '將公司業務流程視為一張大型狀態機，降低摩擦力、自動化沉澱資產，拒絕無效外包。',
          meta: '約 4 分鐘閱讀 · 蘇哲遠',
          url: 'records/article-template.html'
        }
      ]
    }
  };

  const panelMap = {
    cases: document.getElementById('panelCases'),
    books: document.getElementById('panelBooks'),
    vlogs: document.getElementById('panelVlogs'),
    thinking: document.getElementById('panelThinking')
  };

  function renderArchiveFolder(key) {
    const folder = archiveData[key];
    if (!folder) return;

    if (archiveFolderDot) archiveFolderDot.style.backgroundColor = folder.color;
    if (archiveFolderPath) archiveFolderPath.textContent = folder.path;
    if (archiveFolderStatus) {
      archiveFolderStatus.textContent = folder.status;
      archiveFolderStatus.style.color = folder.color;
    }

    // 切換靜態面板顯隱 (100% 零空白延遲，Googlebot 秒收錄)
    let panelFound = false;
    Object.keys(panelMap).forEach(k => {
      const panel = panelMap[k];
      if (panel) {
        if (k === key) {
          panel.style.display = 'flex';
          panelFound = true;
        } else {
          panel.style.display = 'none';
        }
      }
    });

    // 若無靜態面板但有動態容器，則動態渲染降級處理
    if (!panelFound && archiveItemsList) {
      archiveItemsList.innerHTML = folder.items.map(item => `
        <a href="${item.url}" class="archive-card">
          <div class="archive-card-meta">
            <span class="archive-card-tag" style="color: ${folder.color}; border-color: ${folder.color}50;">
              ${item.tag}
            </span>
            <span class="archive-card-time">${item.meta}</span>
          </div>
          <h3 class="archive-card-title">${item.title}</h3>
          <p class="archive-card-snippet">${item.desc}</p>
        </a>
      `).join('');
    }
  }

  archiveTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const folderKey = tab.getAttribute('data-folder');
      archiveTabs.forEach(t => {
        t.classList.remove('active');
        t.style.backgroundColor = '#ffffff';
        t.style.color = '#18191f';
        const topMeta = t.querySelector('.tab-top-meta span:first-child');
        const countPill = t.querySelector('.tab-count-pill');
        const titleText = t.querySelector('.tab-title-text');
        if (topMeta) topMeta.style.color = '';
        if (countPill) countPill.style.color = '';
        if (titleText) titleText.style.color = '';
      });

      tab.classList.add('active');
      const targetColor = archiveData[folderKey].color;
      tab.style.backgroundColor = targetColor;
      tab.style.color = '#ffffff';

      const topMeta = tab.querySelector('.tab-top-meta span:first-child');
      const countPill = tab.querySelector('.tab-count-pill');
      const titleText = tab.querySelector('.tab-title-text');
      if (topMeta) topMeta.style.color = '#ffffff';
      if (countPill) {
        countPill.style.color = '#ffffff';
        countPill.style.backgroundColor = 'rgba(0,0,0,0.25)';
      }
      if (titleText) titleText.style.color = '#ffffff';

      renderArchiveFolder(folderKey);
    });
  });

  // 初始化載入 Cases 分類
  renderArchiveFolder('cases');

  if (archiveMascotTrigger && archiveMascotHead) {
    archiveMascotTrigger.addEventListener('click', () => {
      archiveMascotHead.style.transform = 'scale(1.2) rotate(12deg)';
      setTimeout(() => {
        archiveMascotHead.style.transform = 'scale(1) rotate(0deg)';
      }, 250);
    });
  }


  // =========================================================================
  // 7. 雙軌對話模式切換與即時診斷 (Dual Track CTA & Diagnostics)
  // =========================================================================
  window.switchCtaMode = function(mode) {
    const btnCoffee = document.getElementById('btnModeCoffee');
    const btnBiz = document.getElementById('btnModeBiz');
    const panelCoffee = document.getElementById('ctaCoffeePanel');
    const panelBiz = document.getElementById('ctaBizPanel');

    if (mode === 'coffee') {
      if (btnCoffee) {
        btnCoffee.className = 'cta-mode-btn active-coffee';
      }
      if (btnBiz) {
        btnBiz.className = 'cta-mode-btn inactive';
      }
      if (panelCoffee) panelCoffee.style.display = 'block';
      if (panelBiz) panelBiz.style.display = 'none';
    } else {
      if (btnBiz) {
        btnBiz.className = 'cta-mode-btn active-biz';
      }
      if (btnCoffee) {
        btnCoffee.className = 'cta-mode-btn inactive';
      }
      if (panelBiz) panelBiz.style.display = 'block';
      if (panelCoffee) panelCoffee.style.display = 'none';
    }
  };

  window.calcSiteDiagnostic = function() {
    const checked = Array.from(document.querySelectorAll('input[name="bizPain"]:checked'));
    const resultBox = document.getElementById('siteDiagnosticResult');
    const textEl = document.getElementById('siteDiagnosticText');
    const hiddenPains = document.getElementById('bizDiagnosedPains');

    if (!resultBox || !textEl) return;

    if (checked.length === 0) {
      resultBox.style.display = 'none';
      if (hiddenPains) hiddenPains.value = '尚未勾選';
      return;
    }

    resultBox.style.display = 'block';
    const insights = [];
    const values = checked.map(c => c.value);

    if (values.includes('pricing')) {
      insights.push('<strong>【品類重塑】</strong>座標軸放錯市場。建議借鏡比德堡模式，以精密規格出海北美/日本，擺脫國內贈品削價戰。');
    }
    if (values.includes('amazon')) {
      insights.push('<strong>【跨境出海】</strong>建立一套能自主造血的「開車指標」數據飛輪，不盲目依賴外部代操。');
    }
    if (values.includes('agency')) {
      insights.push('<strong>【現場轉譯】</strong>你急需能聽懂 CNC、模具與導角公差的同頻翻譯官，把機台上的硬實力轉譯為國際買家心智。');
    }
    if (values.includes('system')) {
      insights.push('<strong>【數位造血】</strong>以二代陪跑視角導入 AI 工作流與知識庫，讓製造業內部團隊長出軟實力。');
    }

    textEl.innerHTML = insights.join('<br class="my-1">');
    if (hiddenPains) {
      hiddenPains.value = values.join(', ');
    }
  };


  // =========================================================================
  // 8. 雙表單 Formspree 異步寄信處理 (Coffee Form & Biz Form)
  // =========================================================================
  function bindFormspree(formId, submitBtnId, statusId, successMsg) {
    const form = document.getElementById(formId);
    const btn = document.getElementById(submitBtnId);
    const status = document.getElementById(statusId);

    if (!form || !btn || !status) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const origHtml = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = '<span>⏳ 傳送中，請稍候...</span>';
      status.style.display = 'none';

      const formData = new FormData(form);

      try {
        const res = await fetch(form.action, {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/json' }
        });

        if (res.ok) {
          form.reset();
          btn.innerHTML = '<span>✅ 預約已成功送出！</span>';
          btn.disabled = false;

          status.className = 'form-status status-success';
          status.innerHTML = successMsg;
          status.style.display = 'block';

          // 慶祝火花
          const rect = btn.getBoundingClientRect();
          createSparkBurst(rect.left + rect.width / 2, rect.top, 50);

          setTimeout(() => { btn.innerHTML = origHtml; }, 5000);
        } else {
          throw new Error('伺服器忙碌中');
        }
      } catch (err) {
        btn.disabled = false;
        btn.innerHTML = '<span>重新送出</span>';
        status.className = 'form-status status-error';
        status.innerHTML = `<strong>⚠️ 傳送時發生問題：${err.message || '請稍候再試'}</strong><br>您也可以直接私訊 Threads (@record_learning_lab) 聯繫哲遠！`;
        status.style.display = 'block';
      }
    });
  }

  // 綁定 Coffee Chat 表單
  bindFormspree(
    'coffeeForm',
    'coffeeSubmitBtn',
    'coffeeFormStatus',
    '<strong>🎉 感謝你的預約！Coffee Chat 邀請已順利送達哲遠的信箱。</strong><br>哲遠會親自閱讀你的留言，並在 24 小時內回信與你確認線上或喝咖啡的時間！'
  );

  // 綁定製造業體檢表單
  bindFormspree(
    'bizForm',
    'bizSubmitBtn',
    'bizFormStatus',
    '<strong>🎉 感謝您的體檢工單！專案資訊已順利寄達蘇哲遠的信箱。</strong><br>哲遠將以理工思維評估您的工廠瓶頸，並於 24 小時內提供專屬回覆！'
  );

});

