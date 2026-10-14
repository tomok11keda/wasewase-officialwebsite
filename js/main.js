/**
 * main.js
 * サイト全体の振る舞い
 *
 * 主な役割:
 * - App Store URL の一元適用
 * - ヘッダーのスクロール状態
 * - モバイルメニュー
 * - モバイル固定インストール CTA
 * - フッター年号
 */

(function () {
  "use strict";

  /**
   * =========================================================
   * サイト設定（App Store 導線はここだけ変更）
   * =========================================================
   */
  const SITE_CONFIG = {
    /** わせわせ公式 App Store ページ */
    appStoreUrl:
      "https://apps.apple.com/jp/app/%E3%82%8F%E3%81%9B%E3%82%8F%E3%81%9B/id6785786679",
    ctaLabel: "App Store で入手",
  };

  function init() {
    applyAppStoreLinks(SITE_CONFIG);
    initHeaderScroll();
    initMobileMenu();
    initSmoothAnchorClose();
    initMobileInstallBar(SITE_CONFIG);
    setFooterYear();
  }

  /**
   * すべての App Store CTA に正式 URL を適用する
   */
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

  /**
   * スクロールでヘッダーにガラス効果を付与
   */
  function initHeaderScroll() {
    const header = document.getElementById("site-header");
    if (!header) return;

    const update = () => {
      const scrolled = window.scrollY > 12;
      header.classList.toggle("is-scrolled", scrolled);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
  }

  /**
   * モバイルメニュー開閉
   */
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

  /**
   * アンカー遷移時、モバイルメニューが開いていれば閉じる
   */
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

  /**
   * スマートフォン向け固定インストール CTA
   * Hero CTA が画面内にある間、またはダウンロード帯が見えている間は隠す
   */
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
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
