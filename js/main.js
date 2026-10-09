/**
 * main.js
 * サイト全体の振る舞い
 *
 * 主な役割:
 * - サイトモード切替（事前登録 ↔ App Store）
 * - ヘッダーのスクロール状態
 * - モバイルメニュー
 * - フッター年号
 * - CTA テキストの同期
 */

(function () {
  "use strict";

  /**
   * =========================================================
   * サイトモード設定
   * ---------------------------------------------------------
   * "preregister" … 事前登録フォームを表示（現在）
   * "appstore"    … App Store への導線を表示（正式リリース後）
   *
   * 切り替え方:
   * 1. 下の SITE_MODE を書き換える
   * 2. appstore のときは APP_STORE_URL も設定する
   * =========================================================
   */
  const SITE_CONFIG = {
    mode: "preregister", // "preregister" | "appstore"
    // 正式な App Store URL が確認できるまで未設定（ルートや仮URLは使わない）
    appStoreUrl: "",
    ctaLabels: {
      preregister: "事前登録する",
      appstore: "App Store で入手",
    },
  };

  function init() {
    applySiteMode(SITE_CONFIG);
    initPendingStoreCtas();
    initHeaderScroll();
    initMobileMenu();
    initSmoothAnchorClose();
    setFooterYear();
  }

  /**
   * Hero / Header の App Store CTA
   * 正式 URL 未設定時は遷移させず、設定後は target=_blank で開く
   */
  function initPendingStoreCtas() {
    const url = (SITE_CONFIG.appStoreUrl || "").trim();
    const links = document.querySelectorAll("[data-store-cta]");

    links.forEach((link) => {
      if (url && /^https:\/\/apps\.apple\.com\//.test(url)) {
        link.setAttribute("href", url);
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noopener noreferrer");
        link.removeAttribute("data-appstore-pending");
        link.removeAttribute("aria-disabled");
      } else {
        link.setAttribute("href", "#");
        link.setAttribute("data-appstore-pending", "");
        link.setAttribute("aria-disabled", "true");
        link.addEventListener("click", (event) => {
          event.preventDefault();
        });
      }
    });
  }

  /**
   * 事前登録 / App Store の表示切替
   * HTML 内の [data-mode] と [data-cta] をまとめて更新します
   */
  function applySiteMode(config) {
    const mode = config.mode === "appstore" ? "appstore" : "preregister";

    // セクション内の CTA ブロックを切替
    document.querySelectorAll(".cta-block").forEach((block) => {
      const blockMode = block.getAttribute("data-mode");
      block.hidden = blockMode !== mode;
    });

    // ヘッダー・フッターなどの CTA 文言を揃える
    const label = config.ctaLabels[mode];
    document.querySelectorAll("[data-cta='primary']").forEach((el) => {
      // ボタン内に子要素がある場合はテキストノードだけ更新しにくいので textContent で統一
      if (el.childElementCount === 0) {
        el.textContent = label;
      } else if (!el.querySelector(".btn__label")) {
        el.textContent = label;
      }

      // App Store モードでは #signup 内フォームではなくストアへ
      if (mode === "appstore" && el.tagName === "A") {
        // ヘッダー等は signup セクション（ストア CTA）へスクロールのまま
        el.setAttribute("href", "#signup");
      }
    });

    // 既存の signup 内 App Store リンク（Hero/Header の data-store-cta とは別）
    const storeLinks = document.querySelectorAll("[data-appstore-link]");
    storeLinks.forEach((link) => {
      const url = (config.appStoreUrl || "").trim();
      if (url && /^https:\/\/apps\.apple\.com\//.test(url)) {
        link.setAttribute("href", url);
      } else {
        link.setAttribute("href", "#");
      }
      if (mode === "appstore") {
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noopener noreferrer");
      }
    });

    // フッターの「事前登録」リンク文言も同期
    document.querySelectorAll('.site-footer__nav [data-cta="primary"]').forEach((el) => {
      el.textContent = mode === "appstore" ? "ダウンロード" : "事前登録する";
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
    };

    const openMenu = () => {
      menu.hidden = false;
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "メニューを閉じる");
    };

    toggle.addEventListener("click", () => {
      const isOpen = toggle.getAttribute("aria-expanded") === "true";
      if (isOpen) closeMenu();
      else openMenu();
    });

    // リンクタップで閉じる
    menu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => closeMenu());
    });

    // Escape で閉じる
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });
  }

  /**
   * アンカー遷移時、モバイルメニューが開いていれば閉じる
   * （ヘッダー外のリンク用の保険）
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
        }
      });
    });
  }

  function setFooterYear() {
    const yearEl = document.getElementById("year");
    if (yearEl) {
      yearEl.textContent = String(new Date().getFullYear());
    }
  }

  // 設定を外から変えられるように公開（コンソール検証用）
  window.WaseWase = {
    config: SITE_CONFIG,
    applySiteMode,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
