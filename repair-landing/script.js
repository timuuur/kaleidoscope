/* =========================================================================
   Ремонт на дому — логика страницы
   Проверка формы заявки и отправка её на почту через сервис Web3Forms
   (POST-запрос fetch, без бэкенда и без библиотек).
   ========================================================================= */

// Ключ доступа Web3Forms. Получить бесплатно и без регистрации на
// https://web3forms.com — ввести адрес deadinside23200821@gmail.com,
// ключ придёт на эту почту. Вставьте его сюда вместо текста-заглушки:
const WEB3FORMS_ACCESS_KEY = "88cc7828-08db-44af-aa58-560dbd46b3ea";

// Запускаемся, когда DOM готов. Если скрипт подключён с defer, DOM обычно уже
// разобран — тогда вызываем init() сразу, иначе ждём событие DOMContentLoaded.
function init() {
  setCurrentYear();
  initLeadForm();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

/* --- Год в футере --------------------------------------------------- */
function setCurrentYear() {
  const el = document.getElementById("year");
  if (el) el.textContent = new Date().getFullYear();
}

/* --- Форма заявки ------------------------------------------------- */
function initLeadForm() {
  const form = document.getElementById("lead-form");
  if (!form) return;

  const statusEl = document.getElementById("form-status");
  const nameInput = form.elements.name;
  const phoneInput = form.elements.phone;
  const commentInput = form.elements.comment;

  // Убираем подсветку ошибки, как только пользователь начал править поле.
  [nameInput, phoneInput].forEach((input) => {
    input.addEventListener("input", () => clearFieldError(input));
  });

  const submitBtn = form.querySelector('button[type="submit"]');
  const submitLabel = submitBtn ? submitBtn.textContent : "";

  form.addEventListener("submit", (event) => {
    event.preventDefault(); // не перезагружаем страницу

    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    const comment = commentInput.value.trim();

    // --- Проверка полей ---
    let valid = true;

    if (name.length < 2) {
      setFieldError(nameInput, "Напишите, как к вам обращаться");
      valid = false;
    }

    // В телефоне должно быть минимум 10 цифр (без учёта +, пробелов, скобок).
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) {
      setFieldError(phoneInput, "Укажите номер телефона полностью");
      valid = false;
    }

    if (!valid) {
      // Ставим фокус на первое поле с ошибкой.
      form.querySelector(".field--error input")?.focus();
      return;
    }

    // Пока не вставлен ключ — форму подключить нельзя.
    if (WEB3FORMS_ACCESS_KEY.startsWith("ВСТАВЬТЕ")) {
      showStatus(statusEl, "Форма ещё не подключена: в script.js не вставлен ключ Web3Forms.", true);
      return;
    }

    // --- Собираем данные заявки ---
    // Поля с русскими названиями придут такими же заголовками в письме.
    const payload = {
      access_key: WEB3FORMS_ACCESS_KEY,
      subject: `Заявка на ремонт — ${name}`,
      from_name: "Сайт «Мастер на дом»",
      Имя: name,
      Телефон: phone,
      "Что сломалось": comment || "—",
      // Honeypot: если это поле заполнено — значит, форму отправил бот.
      botcheck: form.elements.botcheck.checked,
    };

    // --- Отправляем ---
    setSending(true);

    fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          form.reset();
          showStatus(statusEl, "Заявка отправлена. Перезвоню в течение 15 минут.", false);
        } else {
          console.error("Web3Forms вернул ошибку:", data);
          showStatus(
            statusEl,
            "Не получилось отправить заявку. Позвоните или напишите в Telegram — контакты ниже.",
            true
          );
        }
      })
      .catch((error) => {
        console.error("Сбой сети при отправке заявки:", error);
        showStatus(
          statusEl,
          "Нет связи с сервером. Проверьте интернет и попробуйте ещё раз или напишите в Telegram.",
          true
        );
      })
      .finally(() => setSending(false));
  });

  // Блокирует кнопку и меняет её текст на время запроса.
  function setSending(isSending) {
    if (!submitBtn) return;
    submitBtn.disabled = isSending;
    submitBtn.textContent = isSending ? "Отправляю…" : submitLabel;
  }
}

/* --- Вспомогательные функции для ошибок --------------------------- */
function setFieldError(input, message) {
  const field = input.closest(".field");
  field.classList.add("field--error");

  const errorEl = field.querySelector(".field__error");
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.hidden = false;
  }
  input.setAttribute("aria-invalid", "true");
}

function clearFieldError(input) {
  const field = input.closest(".field");
  field.classList.remove("field--error");

  const errorEl = field.querySelector(".field__error");
  if (errorEl) {
    errorEl.hidden = true;
    errorEl.textContent = "";
  }
  input.removeAttribute("aria-invalid");
}

/* --- Показ сообщения под формой --------------------------------- */
function showStatus(el, message, isError) {
  if (!el) return;
  el.textContent = message;
  el.hidden = false;
  el.classList.toggle("form-status--error", Boolean(isError));
}
