/**
 * animation.js
 * Intersection Observer によるスクロールアニメーション
 *
 * 使い方:
 * HTML に data-reveal 属性を付ける
 * 任意で data-reveal-delay="80" （ミリ秒）で遅延
 */

(function () {
  "use strict";

  /**
   * スクロール連動の表示アニメーションを初期化
   */
  function initRevealAnimations() {
    const targets = document.querySelectorAll("[data-reveal]");

    if (!targets.length) return;

    // 動きを減らす設定のユーザーには、最初から表示する
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      targets.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    // 遅延を CSS 変数へ反映（HTML の data-reveal-delay を読む）
    targets.forEach((el) => {
      const delay = el.getAttribute("data-reveal-delay");
      if (delay) {
        el.style.setProperty("--reveal-delay", `${delay}ms`);
      }
    });

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("is-visible");
          // 一度表示したら監視を外す（再アニメはしない）
          obs.unobserve(entry.target);
        });
      },
      {
        // 画面に 12% 入ったら発火（早すぎず遅すぎず）
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    targets.forEach((el) => observer.observe(el));
  }

  // DOM 準備完了後に実行
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initRevealAnimations);
  } else {
    initRevealAnimations();
  }
})();
