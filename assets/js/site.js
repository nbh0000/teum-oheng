(function () {
  "use strict";
  var D = window.OHENG;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var page = document.body.getAttribute("data-page");

  /* ---------- header hairline on scroll ---------- */
  var header = document.querySelector(".site-header");
  var sentinel = document.createElement("div");
  sentinel.setAttribute("aria-hidden", "true");
  sentinel.style.cssText = "position:absolute;top:0;height:1px;width:1px;";
  document.body.prepend(sentinel);
  if (header && "IntersectionObserver" in window) {
    new IntersectionObserver(function (e) {
      header.classList.toggle("is-scrolled", !e[0].isIntersecting);
    }).observe(sentinel);
  }

  function $(s, r) { return (r || document).querySelector(s); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* =======================================================
     INTRO
     ======================================================= */
  if (page === "intro") {
    buildCycle($(".cycle"));
    initGallery();
    initDock();
  }

  function buildCycle(root) {
    if (!root) return;
    var NS = "http://www.w3.org/2000/svg";
    var C = 300, R = 206, ORB = 72; // viewBox 600, orb radius in units (23% of 600 / 2)
    var pos = {};
    D.ORDER.forEach(function (k, i) {
      var a = (-90 + i * 72) * Math.PI / 180;
      pos[k] = { a: a, x: C + R * Math.cos(a), y: C + R * Math.sin(a) };
    });

    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 600 600");
    svg.setAttribute("aria-hidden", "true");
    svg.innerHTML =
      '<defs>' +
      '<marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="13" markerHeight="13" orient="auto-start-reverse" markerUnits="userSpaceOnUse"><path d="M1 1.5 L8.5 5 L1 8.5" fill="none" stroke="currentColor" stroke-width="1.4"/></marker>' +
      '<marker id="ah2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="11" markerHeight="11" orient="auto" markerUnits="userSpaceOnUse"><path d="M1 2 L8.5 5 L1 8 Z"/></marker>' +
      '</defs>';
    svg.style.color = "var(--ink)";

    var gapA = (ORB + 10) / R; // angular gap at each orb
    D.ORDER.forEach(function (k, i) {
      var n = D.generates(k);
      var a1 = pos[k].a + gapA, a2 = pos[k].a + (72 * Math.PI / 180) - gapA;
      var x1 = C + R * Math.cos(a1), y1 = C + R * Math.sin(a1);
      var x2 = C + R * Math.cos(a2), y2 = C + R * Math.sin(a2);
      var p = document.createElementNS(NS, "path");
      p.setAttribute("d", "M" + x1.toFixed(2) + " " + y1.toFixed(2) + " A" + R + " " + R + " 0 0 1 " + x2.toFixed(2) + " " + y2.toFixed(2));
      p.setAttribute("class", "arc");
      p.setAttribute("marker-end", "url(#ah)");
      p.dataset.from = k; p.dataset.to = n;
      svg.appendChild(p);

      var t = D.controls(k);
      var dx = pos[t].x - pos[k].x, dy = pos[t].y - pos[k].y, L = Math.hypot(dx, dy);
      var g = ORB + 10;
      var l = document.createElementNS(NS, "path");
      l.setAttribute("d", "M" + (pos[k].x + dx / L * g).toFixed(2) + " " + (pos[k].y + dy / L * g).toFixed(2) +
        " L" + (pos[t].x - dx / L * g).toFixed(2) + " " + (pos[t].y - dy / L * g).toFixed(2));
      l.setAttribute("class", "ray");
      l.setAttribute("marker-end", "url(#ah2)");
      l.dataset.from = k; l.dataset.to = t;
      svg.appendChild(l);
    });
    root.prepend(svg);

    // draw-in: 대기 중에는 선과 화살촉을 숨기고, 다 그려진 뒤 화살촉을 붙인다
    if (!reduce) {
      svg.querySelectorAll(".arc,.ray").forEach(function (p) {
        var m = p.getAttribute("marker-end");
        p.removeAttribute("marker-end");
        p.addEventListener("animationend", function () { p.setAttribute("marker-end", m); }, { once: true });
      });
      svg.querySelectorAll(".arc").forEach(function (p, i) {
        var len = p.getTotalLength();
        p.style.setProperty("--len", len.toFixed(1));
        p.style.animationDelay = (0.5 + i * 0.14) + "s";
        p.classList.add("draw");
      });
      svg.querySelectorAll(".ray").forEach(function (p, i) {
        p.style.animationDelay = (1.2 + i * 0.08) + "s";
        p.classList.add("draw");
      });
    }

    var caption = $(".cycle__caption");
    var defaultCaption = caption ? caption.innerHTML : "";

    D.ORDER.forEach(function (k, i) {
      var e = D.EL[k];
      var b = document.createElement("button");
      b.type = "button";
      b.className = "orb";
      b.dataset.el = k;
      b.style.left = (pos[k].x / 6) + "%";
      b.style.top = (pos[k].y / 6) + "%";
      b.style.animationDelay = (reduce ? 0 : 0.1 + i * 0.1) + "s";
      b.setAttribute("aria-label", e.ko + "(" + e.hz + "): " + e.short);
      b.innerHTML = '<img src="' + (document.body.getAttribute("data-base") || "") + 'assets/img/jar-' + k + '.webp" alt="" width="480" height="480" decoding="async">' +
        "<b>" + e.hz + '</b><span class="nm">' + e.ko + "</span>";
      root.appendChild(b);

      function on() {
        root.classList.add("is-focus");
        root.querySelectorAll(".orb").forEach(function (o) {
          o.classList.toggle("on", o.dataset.el === k || o.dataset.el === D.generates(k) || o.dataset.el === D.controls(k));
        });
        svg.querySelectorAll(".arc,.ray").forEach(function (p) {
          p.classList.toggle("on", p.dataset.from === k);
        });
        if (caption) {
          var g = D.EL[D.generates(k)], c = D.EL[D.controls(k)];
          caption.innerHTML = "<b>" + e.ko + "</b>은 " + "<b>" + g.ko + "</b>를 살리고, " + "<b>" + c.ko + "</b>를 누릅니다. " + esc(e.short) + ".";
        }
      }
      function off() {
        root.classList.remove("is-focus");
        root.querySelectorAll(".orb").forEach(function (o) { o.classList.remove("on"); });
        svg.querySelectorAll(".on").forEach(function (p) { p.classList.remove("on"); });
        if (caption) caption.innerHTML = defaultCaption;
      }
      b.addEventListener("mouseenter", on);
      b.addEventListener("focus", on);
      b.addEventListener("mouseleave", off);
      b.addEventListener("blur", off);
      b.addEventListener("click", function () {
        if (root.classList.contains("is-focus") && b.classList.contains("on") && matchMedia("(hover: none)").matches) {
          var el = document.getElementById("el-" + k);
          if (el) el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center", inline: "start" });
        }
        on();
      });
    });
  }

  function initGallery() {
    var track = $(".elements__track"), bar = $(".elements__progress i");
    if (!track || !bar) return;
    var items = track.children;
    if (!("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && en.intersectionRatio > 0.6) {
          var i = Array.prototype.indexOf.call(items, en.target);
          bar.style.transform = "translateX(" + (i * 100) + "%)";
        }
      });
    }, { root: track, threshold: [0.6] });
    Array.prototype.forEach.call(items, function (it) { io.observe(it); });
  }

  function initDock() {
    var dock = $(".dock");
    if (!dock || !("IntersectionObserver" in window)) return;
    document.body.classList.add("has-dock");
    var watch = document.querySelectorAll("[data-dock-hide]");
    var visible = new Set();
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) visible.add(en.target); else visible.delete(en.target);
      });
      dock.classList.toggle("is-on", visible.size === 0);
      dock.setAttribute("aria-hidden", visible.size === 0 ? "false" : "true");
      dock.querySelector("a").tabIndex = visible.size === 0 ? 0 : -1;
    });
    watch.forEach(function (w) { io.observe(w); });
  }

  /* =======================================================
     FORM
     ======================================================= */
  if (page === "form") initForm();

  function initForm() {
    var form = $("#oheng-form");
    var sel = $("#time");
    D.SIJIN.forEach(function (s) {
      var o = document.createElement("option");
      o.value = s.v;
      o.textContent = s.ko + " (" + s.hz + ")  " + s.range;
      sel.appendChild(o);
    });

    var leapWrap = $("#leap-wrap");
    var date = $("#birth");
    var dateHint = $("#birth-hint");

    function cal() { return form.querySelector('input[name="cal"]:checked').value; }
    form.querySelectorAll('input[name="cal"]').forEach(function (r) {
      r.addEventListener("change", function () {
        leapWrap.hidden = cal() !== "l";
        if (cal() !== "l") $("#leap").checked = false;
        validateDate(false);
      });
    });

    date.addEventListener("input", function () {
      var v = date.value.replace(/\D/g, "").slice(0, 8);
      if (v !== date.value) date.value = v;
      if (v.length === 8) validateDate(false); else { dateHint.textContent = ""; setErr("birth", ""); }
    });
    $("#leap").addEventListener("change", function () { validateDate(false); });

    function setErr(id, msg) {
      var input = document.getElementById(id);
      var err = document.getElementById(id + "-error");
      if (err) err.textContent = msg;
      if (input) input.setAttribute("aria-invalid", msg ? "true" : "false");
    }

    function validateDate(strict) {
      var v = date.value;
      if (v.length !== 8) {
        if (strict) setErr("birth", v ? "생년월일 8자리를 숫자로 입력해야 합니다. 예: 19890123" : "생년월일을 입력해야 합니다.");
        dateHint.textContent = "";
        return false;
      }
      var y = +v.slice(0, 4), m = +v.slice(4, 6), d = +v.slice(6, 8);
      var now = new Date().getFullYear();
      if (y < 1900 || y > now) { setErr("birth", "1900년부터 " + now + "년 사이의 날짜만 볼 수 있습니다."); dateHint.textContent = ""; return false; }
      try {
        var solar;
        if (cal() === "l") {
          var leap = $("#leap").checked;
          var lunar = Lunar.fromYmd(y, leap ? -m : m, d);
          if (lunar.getDay() !== d) throw new Error("day");
          solar = lunar.getSolar();
          dateHint.textContent = "양력 " + solar.getYear() + "년 " + solar.getMonth() + "월 " + solar.getDay() + "일";
        } else {
          var dt = new Date(y, m - 1, d);
          if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) throw new Error("solar");
          solar = Solar.fromYmd(y, m, d);
          var l = solar.getLunar();
          var lm = l.getMonth();
          dateHint.textContent = "음력 " + l.getYear() + "년 " + (lm < 0 ? "윤" + (-lm) : lm) + "월 " + l.getDay() + "일";
        }
        setErr("birth", "");
        return true;
      } catch (e) {
        dateHint.textContent = "";
        if (cal() === "l" && $("#leap").checked) setErr("birth", y + "년 음력 " + m + "월에는 윤달이 없습니다.");
        else setErr("birth", "달력에 없는 날짜입니다. 다시 확인해 주십시오.");
        return false;
      }
    }

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var name = $("#name").value.trim();
      var ok = true;
      if (!name) { setErr("name", "이름을 입력해야 합니다."); ok = false; } else setErr("name", "");
      if (!validateDate(true)) ok = false;
      if (sel.value === "") { setErr("time", "태어난 시간을 선택해야 합니다. 모르면 '모름'을 고르면 됩니다."); ok = false; } else setErr("time", "");
      if (!ok) {
        var first = form.querySelector('[aria-invalid="true"]');
        if (first) first.focus();
        return;
      }
      var q = new URLSearchParams({
        n: name.slice(0, 20),
        c: cal(),
        d: date.value,
        lp: $("#leap").checked ? "1" : "0",
        t: sel.value
      });
      location.href = (document.body.getAttribute("data-base") || "../") + "result/?" + q.toString();
    });
    ["name", "time"].forEach(function (id) {
      document.getElementById(id).addEventListener("change", function () { setErr(id, ""); });
    });
  }

  /* =======================================================
     RESULT
     ======================================================= */
  var ARROW = '<svg class="arrow" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><path d="M1 8h13M9.5 3.5 14 8l-4.5 4.5"/></svg>';
  var CHEVRON = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><path d="m3 6 5 5 5-5"/></svg>';
  var GAN_WX = { "甲": "wood", "乙": "wood", "丙": "fire", "丁": "fire", "戊": "earth", "己": "earth", "庚": "metal", "辛": "metal", "壬": "water", "癸": "water" };
  var NUM_KO = ["", "한", "두", "세", "네", "다섯", "여섯"];

  function initResult() {
    var p = new URLSearchParams(location.search);
    var name = (p.get("n") || "").trim().slice(0, 20);
    var c = p.get("c") === "l" ? "l" : "s";
    var d = p.get("d") || "";
    var leap = p.get("lp") === "1";
    var t = parseInt(p.get("t"), 10);
    var loading = $(".loading");
    var main = $("#main");
    var hz = $(".ring__hz");
    var step = $(".loading__step");

    $(".loading__name").textContent = (name || "당신") + "님의";

    var res = null;
    try { res = compute(c, d, leap, t); } catch (e) { res = null; }

    if (!res || !name) {
      main.innerHTML = '<div class="error-state"><h1>결과를 만들 수 없습니다</h1>' +
        "<p>입력 정보가 비어 있거나 달력에 없는 날짜입니다. 정보를 다시 입력하면 바로 확인할 수 있습니다.</p>" +
        '<a class="btn btn--block" href="../form/">다시 입력하기' + ARROW + "</a></div>";
      end(0);
      return;
    }

    render(main, name, res);
    document.title = name + "님의 오행 | TEUM POTTERY";

    var primary = D.EL[res.primary];
    var steps = ["여덟 글자를 세우고 있습니다", "다섯 기운을 헤아리고 있습니다", "부족한 기운을 찾고 있습니다"];
    if (reduce) { end(400); return; }

    // 한자 순환 + 단계 문구
    var i = 0;
    var spin = setInterval(function () {
      i = (i + 1) % 5;
      swap(hz, D.EL[D.ORDER[i]].hz);
    }, 520);
    setTimeout(function () { swap(step, steps[1]); }, 1100);
    setTimeout(function () { swap(step, steps[2]); }, 2200);
    setTimeout(function () {
      clearInterval(spin);
      swap(hz, primary.hz);
      swap(step, primary.ko + "(" + primary.hz + ")의 기운을 찾았습니다");
    }, 3300);
    end(4300);

    function swap(el, text) {
      el.classList.add("is-swap");
      setTimeout(function () { el.textContent = text; el.classList.remove("is-swap"); }, 200);
    }
    function end(ms) {
      setTimeout(function () {
        loading.classList.add("is-leaving");
        document.body.classList.add("is-ready");
        loading.classList.add("is-done");
        loading.setAttribute("aria-hidden", "true");
        main.focus({ preventScroll: true });
        setTimeout(function () { loading.hidden = true; }, 1300);
      }, ms);
    }
  }

  /* ---------- 오행 분석 알고리즘 ----------
     1) 만세력: 절기 기준 연월주, 자정 기준 일주, 12시진 시주 (lunar-javascript, 1900-2100)
     2) 글자 수: 천간 4 + 지지 4 = 8글자(시간 모름이면 6글자)의 오행 개수
     3) 세력 점수: 천간 1점, 지지는 지장간 비율(본기 60/중기 30/여기 10)로 나누고 월지는 2배(월령)
     4) 일간 강약: 비겁+인성 점수 비율로 신강/중화/신약 판정
     5) 부족한 기운: 개수가 가장 적은 오행, 같으면 세력 점수가 낮은 쪽
     6) 억부 도움 기운: 신약이면 인성·비겁, 신강이면 식상·재성·관성 중 점수가 가장 낮은 오행 */
  function compute(c, d, leap, t) {
    if (!/^\d{8}$/.test(d)) return null;
    var y = +d.slice(0, 4), m = +d.slice(4, 6), dd = +d.slice(6, 8);
    var known = !isNaN(t) && t >= 0 && t <= 11;
    var hour = known ? D.SIJIN[t].hour : 12;
    var solar;
    if (c === "l") {
      var l = Lunar.fromYmd(y, leap ? -m : m, dd);
      if (l.getDay() !== dd) return null;
      var s = l.getSolar();
      solar = Solar.fromYmdHms(s.getYear(), s.getMonth(), s.getDay(), hour, 0, 0);
    } else {
      var dt = new Date(y, m - 1, dd);
      if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== dd) return null;
      solar = Solar.fromYmdHms(y, m, dd, hour, 0, 0);
    }
    var ec = solar.getLunar().getEightChar();
    ec.setSect(1);

    var defs = [
      { key: "time", label: "시", gz: known ? ec.getTime() : null, hide: known ? ec.getTimeHideGan() : null, w: 1 },
      { key: "day", label: "일", gz: ec.getDay(), hide: ec.getDayHideGan(), w: 1 },
      { key: "month", label: "월", gz: ec.getMonth(), hide: ec.getMonthHideGan(), w: 2 },
      { key: "year", label: "년", gz: ec.getYear(), hide: ec.getYearHideGan(), w: 1 }
    ];
    var RATIO = { 1: [1], 2: [0.7, 0.3], 3: [0.6, 0.3, 0.1] };
    var count = zero(), score = zero();

    defs.forEach(function (pl) {
      if (!pl.gz) { pl.chars = null; return; }
      var gan = pl.gz.charAt(0), zhi = pl.gz.charAt(1);
      var ganEl = GAN_WX[gan];
      var zhiEl = GAN_WX[pl.hide[0]]; // 지지 오행 = 본기
      count[ganEl]++; count[zhiEl]++;
      score[ganEl] += 1;
      var r = RATIO[pl.hide.length];
      pl.hide.forEach(function (h, i) { score[GAN_WX[h]] += r[i] * pl.w; });
      pl.chars = [
        { hz: gan, ko: D.GAN_KO[gan], el: ganEl },
        { hz: zhi, ko: D.ZHI_KO[zhi], el: zhiEl, hide: pl.hide }
      ];
    });

    var total = 0;
    D.ORDER.forEach(function (k) { total += score[k]; });
    var pct = {};
    D.ORDER.forEach(function (k) { pct[k] = Math.round(score[k] / total * 1000) / 10; });

    var minC = Math.min.apply(null, D.ORDER.map(function (k) { return count[k]; }));
    var maxC = Math.max.apply(null, D.ORDER.map(function (k) { return count[k]; }));
    var low = D.ORDER.filter(function (k) { return count[k] === minC; })
      .sort(function (a, b) { return score[a] - score[b]; });
    var high = D.ORDER.filter(function (k) { return count[k] === maxC; });

    // 일간 강약
    var dm = ec.getDayGan(), me = GAN_WX[dm];
    var parent = D.ORDER[(D.ORDER.indexOf(me) + 4) % 5];   // 나를 생하는 오행(인성)
    var child = D.generates(me);                             // 내가 생하는 오행(식상)
    var wealth = D.controls(me);                             // 내가 극하는 오행(재성)
    var officer = D.ORDER[(D.ORDER.indexOf(me) + 3) % 5];  // 나를 극하는 오행(관성)
    var support = (score[me] + score[parent]) / total * 100;
    var monthMain = GAN_WX[ec.getMonthHideGan()[0]];
    var deukryeong = monthMain === me || monthMain === parent;
    var level = support >= 55 ? "strong" : support <= 42 ? "weak" : "balanced";
    var helpers = level === "weak" ? [parent, me] : level === "strong" ? [child, wealth, officer] : [child, parent];
    var helper = helpers.slice().sort(function (a, b) { return score[a] - score[b]; })[0];

    return {
      solar: solar, cal: c, input: { y: y, m: m, d: dd, leap: leap },
      known: known, sijin: known ? D.SIJIN[t] : null,
      pillars: defs, count: count, score: score, pct: pct,
      low: low, primary: low[0], high: high, min: minC, total: known ? 8 : 6,
      dayMaster: dm, me: me, support: Math.round(support), level: level, deukryeong: deukryeong,
      helper: helper, roles: { parent: parent, child: child, wealth: wealth, officer: officer }
    };
  }
  function zero() { return { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 }; }

  function label(k) { return D.EL[k].ko + "(" + D.EL[k].hz + ")"; }
  function jong(word) {
    var code = word.charCodeAt(word.length - 1) - 0xac00;
    return code >= 0 && code <= 11171 ? code % 28 : 0;
  }
  // ["데일리", "오브제"] -> "데일리와 오브제로"
  function listKo(arr) {
    var out = "";
    arr.forEach(function (w, i) {
      if (i < arr.length - 1) out += w + (jong(w) ? "과 " : "와 ");
      else { var j = jong(w); out += w + (j && j !== 8 ? "으로" : "로"); }
    });
    return out;
  }

  function render(main, name, r) {
    var inp = r.input;
    var base = document.body.getAttribute("data-base") || "../";
    var birth = (r.cal === "l" ? "음력 " + (inp.leap ? "윤" : "") : "양력 ") + inp.y + "." + pad(inp.m) + "." + pad(inp.d);
    var other = r.cal === "l" ? " (양력 " + r.solar.getYear() + "." + pad(r.solar.getMonth()) + "." + pad(r.solar.getDay()) + ")" : "";
    var time = r.known ? r.sijin.ko + " " + r.sijin.range : "태어난 시간 모름";
    var P = D.EL[r.primary];
    var html = "";

    /* 1. 머리 + 사주 원국 */
    html += '<section class="reveal" aria-labelledby="r-title"><div class="r-head">' +
      '<h1 id="r-title">' + esc(name) + "님에게 필요한 기운은<br>" + P.ko + '<span lang="zh-Hant">(' + P.hz + ")</span>입니다</h1>" +
      '<p class="birth">' + birth + other + ", " + time + "</p></div>" +
      '<div class="pillars" role="group" aria-label="사주 여덟 글자">';
    r.pillars.forEach(function (pl) {
      html += '<div class="pillar"><div class="pillar__name">' + pl.label + "주</div>";
      if (pl.chars) {
        pl.chars.forEach(function (ch) {
          html += '<div class="glyph" style="--c:' + D.EL[ch.el].hex + '"><b lang="zh-Hant">' + ch.hz + "</b><span>" + ch.ko + " · " + D.EL[ch.el].ko + "</span></div>";
        });
      } else {
        html += '<div class="glyph is-unknown"><b>?</b><span>모름</span></div><div class="glyph is-unknown"><b>?</b><span>모름</span></div>';
      }
      html += "</div>";
    });
    html += "</div></section>";

    /* 2. 분포 + 일간 강약 */
    var maxPct = Math.max.apply(null, D.ORDER.map(function (k) { return r.pct[k]; })) || 1;
    html += '<section class="block reveal" aria-labelledby="dist-title" style="margin-top:26px"><h2 class="block__title" id="dist-title">다섯 기운의 분포</h2>' +
      '<p class="dist__sum">많은 기운 <b>' + r.high.map(label).join(", ") + "</b>, 부족한 기운 <b>" + r.low.map(label).join(", ") + "</b></p>" +
      '<ul class="dist">';
    D.ORDER.forEach(function (k) {
      var e = D.EL[k], n = r.count[k], isLow = r.low.indexOf(k) > -1, isHigh = r.high.indexOf(k) > -1;
      var h = Math.round(r.pct[k] / maxPct * 100);
      html += '<li style="--c:' + e.hex + '" class="' + (isLow ? "is-low" : isHigh ? "is-high" : "") + '" aria-label="' + e.ko + " " + n + "개, 세력 " + Math.round(r.pct[k]) + '%">' +
        '<span class="pct">' + Math.round(r.pct[k]) + "%</span>" +
        '<span class="meter" aria-hidden="true"><i style="--h:' + Math.max(2, h) + '%"></i></span>' +
        '<span class="hz" lang="zh-Hant">' + e.hz + "</span>" +
        '<span class="nm">' + e.ko + " " + n + "개</span>" +
        '<span class="tag">' + (isLow ? (n === 0 ? "없음" : "부족") : isHigh ? "많음" : "") + "</span></li>";
    });
    html += "</ul>";

    var me = D.EL[r.me];
    var levelKo = { strong: "신강", balanced: "중화", weak: "신약" }[r.level];
    var levelText = {
      strong: "나를 돕는 기운이 강해 추진력이 좋지만 한쪽으로 몰리기 쉽습니다. " + label(r.helper) + "의 기운이 균형을 잡아 줍니다.",
      balanced: "돕는 기운과 쓰는 기운이 고르게 섞여 있습니다. 모자란 기운만 조금씩 더하면 됩니다.",
      weak: "나를 돕는 기운이 약해 쉽게 지치거나 흔들릴 수 있습니다. " + label(r.helper) + "의 기운이 힘이 됩니다."
    }[r.level];
    var x = Math.min(96, Math.max(4, r.support));
    html += '<div class="strength">' +
      "<div><h3>나를 뜻하는 글자</h3>" +
      '<p class="big"><b lang="zh-Hant">' + r.dayMaster + "</b>(" + D.GAN_KO[r.dayMaster] + "), " + me.ko + "(" + me.hz + ")의 사람</p>" +
      "<p>" + esc(me.short) + "을 타고났습니다.</p></div>" +
      "<div><h3>일간의 힘</h3>" +
      '<p class="big">' + levelKo + "<small>돕는 기운 " + r.support + "%" + (r.deukryeong ? ", 월령을 얻음" : "") + "</small></p>" +
      '<div class="scale" style="--x:' + x + '%" aria-hidden="true"><i></i></div>' +
      '<div class="scale-labels" aria-hidden="true"><span>신약</span><span>중화</span><span>신강</span></div>' +
      "<p>" + levelText + "</p></div></div>" +
      '<p class="note">천간 1, 지지는 지장간 비율(본기 60, 중기 30, 여기 10), 태어난 달은 두 배로 계산합니다.</p></section>';

    /* 3. 채우면 좋은 기운 */
    html += '<section class="block" aria-labelledby="need-title"><h2 class="block__title" id="need-title">' +
      (r.low.length > 1 ? "채우면 좋은 기운 " + NUM_KO[r.low.length] + " 가지" : "채우면 좋은 기운") + "</h2>";
    r.low.forEach(function (k) {
      var e = D.EL[k];
      html += '<article class="need" aria-label="' + e.ko + ' 기운">' +
        '<figure class="need__media need__media--card"><img src="' + base + "assets/img/card-" + k + '.webp" alt="' + e.ko + "(" + e.hz + ") 카드, " + e.kw + ", " + e.short + '" width="990" height="1485" loading="lazy" decoding="async"></figure>' +
        '<p class="need__title"><b lang="zh-Hant">' + e.hz + "</b><span>" + e.ko + '</span><span class="need__kw">' + e.kw + "</span></p>" +
        '<p class="need__en" style="--c:' + e.hex + '">' + e.kwEn + "</p>" +
        '<p class="need__lead">' + e.lead + "</p>" +
        '<dl class="facts">' +
        "<div><dt>색</dt><dd>" + e.color + "</dd></div>" +
        "<div><dt>방향</dt><dd>" + e.direction + "</dd></div>" +
        "<div><dt>계절</dt><dd>" + e.season + "</dd></div>" +
        "<div><dt>생활 습관</dt><dd>" + e.habit + "</dd></div></dl></article>";
    });
    html += "</section>";

    /* 4. 처방 아이템 */
    var items = (window.TEUM_PRODUCTS || []).filter(function (it) { return (it.elements || []).indexOf(r.primary) > -1; });
    if (items.length) {
      var cats = [];
      items.forEach(function (it) { if (it.category && cats.indexOf(it.category) < 0) cats.push(it.category); });
      html += '<section class="block" aria-labelledby="items-title">' +
        '<p class="block__for">' + esc(name) + "님을 위한 처방</p>" +
        '<h2 class="block__big" id="items-title">' + P.ko + "(" + P.hz + ")의 기운을 채워 줄<br>" + (NUM_KO[items.length] ? NUM_KO[items.length] + " 가지" : items.length + "가지") + " 아이템</h2>" +
        '<p class="block__lead">' + (cats.length > 1 ? listKo(cats) + " " : "곁에 두는 물건으로 ") + P.ko + "(" + P.hz + ")의 기운을 가까이 둡니다.</p>" +
        '<ul class="items' + (items.length === 1 ? " is-one" : "") + '">';
      items.forEach(function (it) {
        var has = /^https?:\/\//.test(it.url || "");
        html += '<li class="item">' +
          '<div class="item__ph">' + (it.image ? '<img src="' + esc(it.image) + '" alt="' + esc(it.name) + '" loading="lazy" decoding="async">' : "") + "</div>" +
          '<div class="item__body">' + (it.category ? '<span class="item__cat">' + esc(it.category) + "</span>" : "") +
          '<h3 class="item__name">' + esc(it.name) + "</h3>" +
          (it.summary ? '<p class="item__sum">' + esc(it.summary) + "</p>" : "") + "</div>" +
          (has
            ? '<a class="item__link" href="' + esc(it.url) + '" target="_blank" rel="noopener">' + esc(it.button || "바로가기") + ARROW + "</a>"
            : '<span class="item__link" aria-disabled="true">준비 중</span>') +
          "</li>";
      });
      html += "</ul>" + (items.length > 2 ? '<div class="swipe-hint" aria-hidden="true"><i style="width:' + (200 / items.length) + '%"></i></div>' : "") + "</section>";
    }

    /* 5. 전문가 분석 */
    var ex = (window.TEUM_EXPERT || {})[r.primary];
    if (ex && ex.sections && ex.sections.length) {
      html += '<section class="block" aria-labelledby="ex-title">' +
        '<p class="block__for">전문가 분석</p><h2 class="block__big" id="ex-title" style="margin-bottom:14px">' + P.ko + "(" + P.hz + ")에 대해 더 알아보기</h2>" +
        '<div class="acc">';
      ex.sections.forEach(function (s, i) {
        html += "<details" + (i === 0 ? " open" : "") + "><summary>" +
          '<span class="no">' + pad(i + 1) + "</span><span>" + esc(s.title) + "</span>" + CHEVRON + "</summary>" +
          '<div class="acc__body"><div><p>' + esc(s.body) + "</p></div></div></details>";
      });
      html += "</div></section>";
    }

    html += '<p class="disclaimer">전통 명리학의 오행 계산을 바탕으로 한 참고용 결과입니다. 입력한 정보는 이 화면에서만 계산되며 저장되지 않습니다.' +
      (r.known ? "" : " 태어난 시간을 알면 두 글자가 더해져 결과가 달라질 수 있습니다.") + "</p>";

    /* 6. 하단 고정 버튼 */
    html += '<div class="cta" style="margin-inline:calc(var(--pad) * -1)"><div class="actions">' +
      '<span class="copied" role="status" aria-live="polite"></span>' +
      '<a class="btn btn--ghost" href="' + base + 'form/">다시 분석</a>' +
      '<button class="btn" type="button" id="share">결과 공유</button></div></div>';

    main.innerHTML = html;

    // 아코디언: 닫힐 때도 부드럽게
    main.querySelectorAll(".acc summary").forEach(function (sm) {
      sm.addEventListener("click", function (ev) {
        var det = sm.parentElement;
        if (!det.open || reduce) return;
        ev.preventDefault();
        det.querySelector(".acc__body").style.gridTemplateRows = "0fr";
        setTimeout(function () { det.open = false; det.querySelector(".acc__body").style.gridTemplateRows = ""; }, 380);
      });
    });

    // 아이템 스와이프 진행 표시
    var track = main.querySelector(".items"), hint = main.querySelector(".swipe-hint i");
    if (track && hint) {
      track.addEventListener("scroll", function () {
        var max = track.scrollWidth - track.clientWidth;
        var ratio = max > 0 ? track.scrollLeft / max : 0;
        hint.style.transform = "translateX(" + (ratio * (100 / parseFloat(hint.style.width) * 100 - 100)) + "%)";
      }, { passive: true });
    }

    var share = $("#share"), status = $(".copied");
    share.addEventListener("click", function () {
      var url = location.href;
      if (navigator.share && matchMedia("(pointer: coarse)").matches) {
        navigator.share({ title: document.title, url: url }).catch(function () {});
        return;
      }
      (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject())
        .then(function () { status.textContent = "링크를 복사했습니다."; })
        .catch(function () { status.textContent = "주소창의 링크를 복사해 주십시오."; });
      setTimeout(function () { status.textContent = ""; }, 2500);
    });
  }

  function pad(n) { return n < 10 ? "0" + n : "" + n; }

  if (page === "result") initResult();
})();
