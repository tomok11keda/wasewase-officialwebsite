/**
 * main.js
 * サイト全体の振る舞い
 *
 * - App Store URL / Social Proof の一元設定
 * - CTA クリック計測（placement 付き）
 * - UTM パラメータの保持
 * - GA4（測定ID設定時のみ読込）
 * - ヘッダー / モバイルメニュー / 固定CTA
 */

(function () {
  "use strict";

  /**
   * =========================================================
   * サイト設定（数値・計測ID・ストアURLはここだけ変更）
   * =========================================================
   */
  const SITE_CONFIG = {
    appStoreUrl:
      "https://apps.apple.com/jp/app/%E3%82%8F%E3%81%9B%E3%82%8F%E3%81%9B/id6785786679",
    ctaLabel: "App Store で入手",
    /** Social Proof（変化しやすいので設定で更新） */
    socialProof: {
      countLabel: "250+",
      text: "早稲田大学生が認証済み",
    },
    /**
     * GA4 測定ID（例: "G-XXXXXXXXXX"）
     * 空文字のときは gtag を読み込まず、dataLayer への push のみ行う
     * ※ ID を捏造しないこと。発行後にここへ設定する
     */
    ga4MeasurementId: "",
  };

  const UTM_KEYS = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
    "fbclid",
  ];
  const UTM_STORAGE_KEY = "wasewase_utm";

  function init() {
    captureUtmParams();
    applySocialProof(SITE_CONFIG);
    applyAppStoreLinks(SITE_CONFIG);
    initAnalytics(SITE_CONFIG);
    initCtaTracking();
    initHeaderScroll();
    initMobileMenu();
    initSmoothAnchorClose();
    initMobileInstallBar(SITE_CONFIG);
    setFooterYear();
  }

  function applySocialProof(config) {
    const proof = config.socialProof || {};
    document.querySelectorAll("[data-social-proof-count]").forEach((el) => {
      if (proof.countLabel) el.textContent = proof.countLabel;
    });
    document.querySelectorAll("[data-social-proof-text]").forEach((el) => {
      if (proof.text) el.textContent = proof.text;
    });
  }

  function applyAppStoreLinks(config) {
    const url = (config.appStoreUrl || "").trim();
    const isValid = /^https:\/\/apps\.apple\.com\//.test(url);
    const links = document.querySelectorAll(
      "[data-store-cta], [data-appstore-link]"
    );

    links.forEach((link) => {
      if (isValid) {
        link.setAttribute("href", url);
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noopener noreferrer");
        link.removeAttribute("data-appstore-pending");
        link.removeAttribute("aria-disabled");
      } else {
        link.setAttribute("href", "#download");
        link.setAttribute("data-appstore-pending", "");
        link.setAttribute("aria-disabled", "true");
        link.addEventListener("click", (event) => {
          event.preventDefault();
        });
      }
    });

    document.querySelectorAll("[data-cta='primary']").forEach((el) => {
      if (el.childElementCount === 0) {
        el.textContent = config.ctaLabel;
      }
      if (el.tagName === "A" && isValid) {
        el.setAttribute("href", url);
        el.setAttribute("target", "_blank");
        el.setAttribute("rel", "noopener noreferrer");
      }
    });
  }

  function captureUtmParams() {
    try {
      const params = new URLSearchParams(window.location.search);
      const found = {};
      let has = false;
      UTM_KEYS.forEach((key) => {
        const value = params.get(key);
        if (value) {
          found[key] = value;
          has = true;
        }
      });
      if (has) {
        sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(found));
      }
    } catch (_) {
      /* ignore */
    }
  }

  function getStoredUtm() {
    try {
      const raw = sessionStorage.getItem(UTM_STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (_) {
      return {};
    }
  }

  function ensureDataLayer() {
    window.dataLayer = window.dataLayer || [];
  }

  function gtag() {
    ensureDataLayer();
    window.dataLayer.push(arguments);
  }

  function initAnalytics(config) {
    ensureDataLayer();
    const id = (config.ga4MeasurementId || "").trim();
    const utm = getStoredUtm();

    // Always record a lightweight page view for future tooling
    window.dataLayer.push({
      event: "lp_page_view",
      page_location: window.location.href,
      page_path: window.location.pathname,
      ...utm,
    });

    if (!id || !/^G-[A-Z0-9]+$/i.test(id)) {
      return;
    }

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(id);
    document.head.appendChild(script);

    window.gtag = window.gtag || gtag;
    gtag("js", new Date());
    gtag("config", id, {
      send_page_view: true,
      campaign_source: utm.utm_source || undefined,
      campaign_medium: utm.utm_medium || undefined,
      campaign_name: utm.utm_campaign || undefined,
      campaign_content: utm.utm_content || undefined,
      campaign_term: utm.utm_term || undefined,
    });
  }

  function trackEvent(eventName, params) {
    ensureDataLayer();
    const payload = {
      event: eventName,
      ...getStoredUtm(),
      ...params,
    };
    window.dataLayer.push(payload);

    if (typeof window.gtag === "function" && SITE_CONFIG.ga4MeasurementId) {
      window.gtag("event", eventName, params);
    }
  }

  function initCtaTracking() {
    document.addEventListener(
      "click",
      (event) => {
        const link = event.target.closest(
          "[data-store-cta], [data-appstore-link]"
        );
        if (!link) return;

        const placement =
          link.getAttribute("data-cta-placement") || "unknown";
        trackEvent("app_store_click", {
          placement,
          event_label: placement + "_appstore_click",
          link_url: link.href,
        });
      },
      true
    );
  }

  function initHeaderScroll() {
    const header = document.getElementById("site-header");
    if (!header) return;

    const update = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 12);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
  }

  function initMobileMenu() {
    const toggle = document.getElementById("menu-toggle");
    const menu = document.getElementById("mobile-menu");
    if (!toggle || !menu) return;

    const closeMenu = () => {
      menu.hidden = true;
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "メニューを開く");
      document.body.classList.remove("menu-open");
    };

    const openMenu = () => {
      menu.hidden = false;
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "メニューを閉じる");
      document.body.classList.add("menu-open");
    };

    toggle.addEventListener("click", () => {
      const isOpen = toggle.getAttribute("aria-expanded") === "true";
      if (isOpen) closeMenu();
      else openMenu();
    });

    menu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => closeMenu());
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });
  }

  function initSmoothAnchorClose() {
    const toggle = document.getElementById("menu-toggle");
    const menu = document.getElementById("mobile-menu");
    if (!toggle || !menu) return;

    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", () => {
        if (toggle.getAttribute("aria-expanded") === "true") {
          menu.hidden = true;
          toggle.setAttribute("aria-expanded", "false");
          document.body.classList.remove("menu-open");
        }
      });
    });
  }

  function initMobileInstallBar(config) {
    const bar = document.getElementById("mobile-install-bar");
    if (!bar) return;

    const url = (config.appStoreUrl || "").trim();
    const link = bar.querySelector("[data-store-cta], [data-appstore-link]");
    if (link && /^https:\/\/apps\.apple\.com\//.test(url)) {
      link.setAttribute("href", url);
    }

    const heroActions = document.querySelector(".hero__actions");
    const downloadSection = document.getElementById("download");
    const mq = window.matchMedia("(max-width: 767px)");

    const update = () => {
      if (!mq.matches || document.body.classList.contains("menu-open")) {
        bar.hidden = true;
        document.body.classList.remove("has-mobile-install-bar");
        return;
      }

      const heroVisible = heroActions
        ? isInViewport(heroActions, 0.15)
        : window.scrollY < 120;
      const downloadVisible = downloadSection
        ? isInViewport(downloadSection, 0.05)
        : false;

      const show = !heroVisible && !downloadVisible && window.scrollY > 80;
      bar.hidden = !show;
      document.body.classList.toggle("has-mobile-install-bar", show);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", update);
    } else if (typeof mq.addListener === "function") {
      mq.addListener(update);
    }
  }

  function isInViewport(el, ratio) {
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const visible = Math.min(rect.bottom, vh) - Math.max(rect.top, 0);
    return visible / Math.max(rect.height, 1) > ratio;
  }

  function setFooterYear() {
    const yearEl = document.getElementById("year");
    if (yearEl) {
      yearEl.textContent = String(new Date().getFullYear());
    }
  }

  window.WaseWase = {
    config: SITE_CONFIG,
    applyAppStoreLinks,
    applySocialProof,
    trackEvent,
    getStoredUtm,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
