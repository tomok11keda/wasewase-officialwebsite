/**
 * form.js
 * 事前登録フォームのバリデーション & Google Apps Script 送信
 *
 * フォーム側の入力名:
 * - nickname（必須）
 * - instagram（必須）
 * - referrer（任意 → 空なら ""）
 * - wasedaEmail（任意 → 空なら ""）※ HTML の name は維持
 *
 * GAS へ送る JSON キー:
 * { nickname, instagram, referrer, email }
 * ※ wasedaEmail の値は email として送信します
 *
 * 送信成功時のみサンクスカード（#signup-thanks）を表示します。
 * Instagram 導線 URL は INSTAGRAM_URL で変更できます。
 */

(function () {
  "use strict";

  // Google Apps Script Web アプリのエンドポイント
  const GAS_ENDPOINT =
    "https://script.google.com/macros/s/AKfycbw9g6Wk3bV1KXYkZyCVWQ10MbIw7upN6gIbb9yI8LcY-7xei7I2J24Yv21RSp6vTvSeVA/exec";

  // ★ わせわせ公式 Instagram の URL（サンクスカードのシェアボタンで使用）
  const INSTAGRAM_URL = "https://www.instagram.com/";

  // 簡易なメール形式チェック（任意項目が入力されたときだけ使う）
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /**
   * フォーム初期化
   */
  function initForm() {
    const form = document.getElementById("preregister-form");
    if (!form) return;

    const nicknameInput = form.querySelector("#nickname");
    const instagramInput = form.querySelector("#instagram");
    const referrerInput = form.querySelector("#referrer");
    const wasedaEmailInput = form.querySelector("#wasedaEmail");
    const submitBtn = form.querySelector("#submit-btn");
    const messageEl = document.getElementById("form-message");
    const formView = document.getElementById("signup-form-view");
    const thanksView = document.getElementById("signup-thanks");
    const instagramLink = document.getElementById("thanks-instagram-link");

    // Instagram 導線 URL を反映
    if (instagramLink && INSTAGRAM_URL) {
      instagramLink.setAttribute("href", INSTAGRAM_URL);
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      clearErrors(form);
      hideMessage(messageEl);

      // trim した値を使う。任意項目は空欄なら "" のまま送る
      const nickname = nicknameInput.value.trim();
      const instagram = instagramInput.value.trim();
      const referrer = referrerInput.value.trim(); // 任意
      const wasedaEmail = wasedaEmailInput.value.trim(); // 任意

      // --- バリデーション（必須2項目のみ） ---
      let hasError = false;

      if (!nickname) {
        showFieldError(form, "nickname", "ニックネームを入力してください");
        hasError = true;
      }

      if (!instagram) {
        showFieldError(form, "instagram", "Instagram IDを入力してください");
        hasError = true;
      }

      // 任意: 早稲田メールは「入力された場合のみ」形式チェック
      // 空欄はエラーにしない
      if (wasedaEmail && !EMAIL_RE.test(wasedaEmail)) {
        showFieldError(
          form,
          "wasedaEmail",
          "メールアドレスの形式が正しくありません"
        );
        hasError = true;
      }

      // referrer は Instagram ID / メールどちらでも可のため、空欄・入力ともに形式チェックしない
      if (hasError) return;

      // --- GAS へ送信（任意項目は空文字列 ""） ---
      setLoading(submitBtn, true);

      try {
        await submitRegistration({
          nickname,
          instagram,
          referrer: referrer || "",
          email: wasedaEmail || "",
        });
        // 成功時のみサンクス表示
        form.reset();
        showThanksCard(formView, thanksView);
      } catch (err) {
        console.error("[form] submit failed:", err);
        showMessage(
          messageEl,
          "error",
          "送信に失敗しました。時間をおいて再度お試しください。"
        );
      } finally {
        setLoading(submitBtn, false);
      }
    });

    // 入力中にエラー表示を消す
    [nicknameInput, instagramInput, referrerInput, wasedaEmailInput].forEach(
      (input) => {
        input.addEventListener("input", () => {
          clearFieldError(form, input.name);
        });
      }
    );
  }

  /**
   * 送信成功後：フォームを隠し、サンクスカードを表示
   */
  function showThanksCard(formView, thanksView) {
    if (formView) formView.hidden = true;
    if (!thanksView) return;

    thanksView.hidden = false;
    thanksView.classList.add("is-visible");

    // カードが見える位置へスクロール（ヘッダー分を考慮）
    thanksView.scrollIntoView({ behavior: "smooth", block: "center" });
    thanksView.focus({ preventScroll: true });
  }

  /**
   * Google Apps Script へ登録データを POST する
   * @param {{
   *   nickname: string,
   *   instagram: string,
   *   referrer: string,
   *   email: string
   * }} payload
   */
  async function submitRegistration(payload) {
    // GAS が受け取るキーに合わせる（空欄は ""）
    const body = {
      nickname: payload.nickname || "",
      instagram: payload.instagram || "",
      referrer: payload.referrer || "",
      email: payload.email || "",
    };

    // Content-Type を text/plain にすると、CORS プリフライトを避けやすい
    const response = await fetch(GAS_ENDPOINT, {
      method: "POST",
      mode: "cors",
      redirect: "follow",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    // GAS が JSON を返す場合は中身も確認（返さない場合は HTTP 成功で OK）
    const text = await response.text();
    if (!text) return { ok: true };

    try {
      const data = JSON.parse(text);
      // このエンドポイントは { success: true } を返す
      if (data && (data.success === false || data.ok === false)) {
        throw new Error(data.message || "GAS returned failure");
      }
      return data;
    } catch (err) {
      // JSON ではないが HTTP は成功 → 成功扱い
      if (err instanceof SyntaxError) return { ok: true, raw: text };
      throw err;
    }
  }

  /* ---------- UI ヘルパー ---------- */

  function showFieldError(form, fieldName, message) {
    const input = form.querySelector(`[name="${fieldName}"]`);
    const errorEl = form.querySelector(`[data-error-for="${fieldName}"]`);
    if (input) input.classList.add("is-invalid");
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.hidden = false;
    }
  }

  function clearFieldError(form, fieldName) {
    const input = form.querySelector(`[name="${fieldName}"]`);
    const errorEl = form.querySelector(`[data-error-for="${fieldName}"]`);
    if (input) input.classList.remove("is-invalid");
    if (errorEl) {
      errorEl.textContent = "";
      errorEl.hidden = true;
    }
  }

  function clearErrors(form) {
    form.querySelectorAll(".is-invalid").forEach((el) => {
      el.classList.remove("is-invalid");
    });
    form.querySelectorAll("[data-error-for]").forEach((el) => {
      el.textContent = "";
      el.hidden = true;
    });
  }

  function showMessage(el, type, text) {
    if (!el) return;
    el.hidden = false;
    el.className = `form-message form-message--${type}`;
    el.textContent = text;
  }

  function hideMessage(el) {
    if (!el) return;
    el.hidden = true;
    el.textContent = "";
    el.className = "form-message";
  }

  function setLoading(btn, isLoading) {
    if (!btn) return;
    btn.disabled = isLoading;
    const label = btn.querySelector(".btn__label");
    const loading = btn.querySelector(".btn__loading");
    if (label) label.hidden = isLoading;
    if (loading) loading.hidden = !isLoading;
  }

  // 外部からテストできるように公開（任意）
  window.WaseWaseForm = {
    submitRegistration,
    GAS_ENDPOINT,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initForm);
  } else {
    initForm();
  }
})();
