import nunjucks from "nunjucks";

export class ModalActions {
  constructor(selector) {
    /* This class will always append a child to the selector above, and
     * won't change any of the selector's children (except for its own
     * Modal `div`). This was designed this way so the class will know the
     * size of the object to blur (will create a `div` inside the selector
     * with the same width and height). */

    this.container =
      typeof selector === "string"
        ? document.querySelector(selector)
        : selector;

    this.modalOpened = new Event("modalopened", { bubbles: true });
    this.modalClosed = new Event("modalclosed", { bubbles: true });

    this._options = {};
  }

  async _onKeyUp(event) {
    if (event.key == "Escape" && this._options.closeWhenClickOutside) {
      event.preventDefault();
      if (this._options.callback !== undefined) {
        await this._options.callback({ action: "closed" });
      }
      this.close();
    }
  }

  _answersModal() {
    const forms = this._getModalContainer().querySelectorAll("form"),
      formsFilledResult = [];
    for (let form of forms) {
      const params = [];
      for (let field of form) {
        params.push({
          id: field.id,
          value: field.value,
          type: field.type,
          checked: field.type === "checkbox" ? field.checked : undefined,
        });
      }
      formsFilledResult.push({ id: form.id || undefined, fields: params });
    }
    return formsFilledResult;
  }

  _isAnyFieldFilled(forms) {
    for (const form of forms) {
      for (const field of form.fields) {
        if (field.value !== "") {
          return true;
        }
      }
    }

    return false;
  }

  async _onKeyDown(event) {
    if (event.key == "Enter") {
      if (this._options.callback !== undefined) {
        event.preventDefault();
        const answerResult = this._answersModal();
        if (this._isAnyFieldFilled(answerResult)) {
          let result = { action: "answered", answerResult };
          let response;
          const modalSubmit = event.target.closest(".ma-modal")
            ? event.target.closest(".ma-modal").querySelector(".modal-submit")
            : event.target.querySelector(".modal-submit");
          try {
            response = await this._options.callback(result);
          } catch (error) {
            // Ignore error
          }
          if (!modalSubmit && (!response || response.closeModal)) {
            this.close();
          }
        } else {
          document.activeElement.click();
        }
      }
    }

    let isTabPressed = event.key === "Tab" || event.keyCode === 9;

    if (isTabPressed) {
      const [firstFocusableElement, lastFocusableElement] =
        this._focusableElements();
      if (event.shiftKey) {
        if (document.activeElement === firstFocusableElement) {
          event.preventDefault();
          lastFocusableElement.focus();
        }
      } else {
        if (document.activeElement === lastFocusableElement) {
          event.preventDefault();
          firstFocusableElement.focus();
        }
      }
    }
  }

  _focusableElements() {
    const focusableElements = "button, [href], input, select, textarea",
      modal = this._getModalContainer(),
      focusableContent = modal.querySelectorAll(focusableElements);
    return [focusableContent[0], focusableContent[focusableContent.length - 1]];
  }

  async _callbackExecute(closest, action) {
    let callbackReturn;

    if (this._options.callback !== undefined) {
      let result = { action: action };
      if (closest && closest.dataset) {
        result = { action: result.action, ...closest.dataset };
      }
      if (action == "answered") {
        const answerResult = this._answersModal();
        if (this._isAnyFieldFilled(answerResult)) {
          result = { ...result, answerResult };
        }
      }
      try {
        callbackReturn = await this._options.callback(result);
      } catch (error) {
        // Ignore error
      }
    }
    return callbackReturn;
  }

  async _onClick(event) {
    /* Handle click events in buttons inside container */
    let target = event.target,
      closest = target.closest("button"),
      action = "answered",
      mainContainer = target.closest("div.ma-container");

    if (
      (this._options.closeWhenClickOutside === true &&
        target == mainContainer) ||
      (closest && closest.classList.contains("ma-modal__close"))
    ) {
      // Clicked on "close" button or outside modal (in blurred area)
      action = "closed";
    } else if (closest && closest.classList.contains("ma-modal__back")) {
      // Clicked on "back"
      closest.closest(".ma-modal").remove();

      // Popping the last callback from the list of callbacks
      this._options.callback = this._options.lastCallbacks.pop();

      const modalContents =
        this._getModalContainer().querySelectorAll(".ma-modal");
      modalContents[modalContents.length - 1].style.display = "flex";
      this._getModalContainer().focus();

      return;
    } else if (closest && closest.classList.contains("modal-submit")) {
      // Clicked on "Submit" button in modal with form expecting next content in the same modal
      await this._callbackExecute(closest, action);
      return;
    } else if (
      // Clicked on anything in modal thats not ma-modal__close or ma-btn
      !closest ||
      (!this._options.closeWhenClickOutside && target == mainContainer) ||
      (!closest.classList.contains("ma-modal__close") &&
        !closest.classList.contains("ma-btn"))
    ) {
      return;
    }
    const response = await this._callbackExecute(closest, action);

    if (!response || response.closeModal) {
      this.close();
    }

    event.preventDefault();
    event.stopPropagation();
  }

  _getModalContainer() {
    return this.container.querySelector(".ma-container");
  }

  close() {
    let self = this;
    this._getModalContainer().style.animation = "fade-out .4s";
    this._getModalContainer().onanimationend = function () {
      self._getModalContainer().dispatchEvent(self.modalClosed);
      self._getModalContainer().remove();
    };
    this._options = {};
  }

  _show(html, callback, onLoad, extra, headerExtraButtons) {
    let self = this,
      div;

    if (extra) {
      // Modal already exists, extra content
      const modalContent =
        this._getModalContainer().querySelectorAll(".ma-modal");
      modalContent[modalContent.length - 1].style.display = "none";
      modalContent[modalContent.length - 1].insertAdjacentHTML(
        "afterend",
        html
      );

      this._getModalContainer().focus();

      // Pushing last callback to a list of callbacks
      if (!this._options.lastCallbacks) {
        this._options.lastCallbacks = [];
      }
      this._options.lastCallbacks.push(this._options.callback);

      // Setting new callback
      this._options.callback = callback;

      if (onLoad) {
        onLoad(this._getModalContainer());
      }

      return;
    }

    if (this._getModalContainer()) {
      // Modal already exists, overwrite
      div = this._getModalContainer();
    } else {
      div = document.createElement("div");
      div.classList = "ma-container";
      div.style.display = "block";
      div.style.animation = "fade-in .4s";
      div.tabIndex = "-1";
      div.addEventListener("click", async function (event) {
        await self._onClick(event);
      });
      div.addEventListener("keyup", async function (event) {
        await self._onKeyUp(event);
      });
      div.addEventListener("keydown", async function (event) {
        await self._onKeyDown(event);
      });
    }

    div.innerHTML = html;
    this._options.callback = callback;
    this.container.appendChild(div);

    // Focus on close button if closeWhenClickOutside
    this._options.closeWhenClickOutside
      ? this._getModalContainer().querySelector("button").focus()
      : this._getModalContainer().focus();

    this._getModalContainer().dispatchEvent(this.modalOpened);
    if (onLoad) {
      onLoad(div);
    }
    if (headerExtraButtons) {
      for (let index = 0; index < headerExtraButtons.length; index++) {
        const element = headerExtraButtons[index];
        const button = self
          ._getModalContainer()
          .querySelector(`.${element.class}`);
        button.addEventListener("click", element.action);
      }
    }
  }

  showMessage(
    title,
    message,
    {
      callback = undefined,
      closeWhenClickOutside = true,
      modalSize = "ma-modal--m",
      html = false,
      onLoad = undefined,
      extra = false,
      headerExtraButtons = undefined,
    } = {}
  ) {
    this._options.closeWhenClickOutside = closeWhenClickOutside;
    let renderedHtml = this.getMessageTemplate().render({
      closeWhenClickOutside: closeWhenClickOutside,
      title: title,
      message: message,
      modal_size: modalSize,
      html: html,
      extra: extra,
      headerExtraButtons: headerExtraButtons,
    });
    this._show(renderedHtml, callback, onLoad, extra, headerExtraButtons);
  }

  askQuestion(
    title,
    message,
    {
      callback = undefined,
      closeWhenClickOutside = true,
      modalSize = "ma-modal--m",
      html = false,
      onLoad = undefined,
      label = null,
      placeholder = null,
    } = {}
  ) {
    this._options.closeWhenClickOutside = closeWhenClickOutside;
    let renderedHtml = this.getQuestionTemplate().render({
      title: title,
      message: message,
      modal_size: modalSize,
      html: html,
      label: label,
      placeholder: placeholder,
    });
    this._show(renderedHtml, callback, onLoad);
    this.container.querySelector("input.ma-answer").focus();
  }

  askYesNo(
    title,
    message,
    {
      callback = undefined,
      closeWhenClickOutside = true,
      modalSize = "ma-modal--m",
      html = false,
      onLoad = undefined,
      buttonYesLabel = undefined,
      buttonNoLabel = undefined,
    } = {}
  ) {
    this._options.closeWhenClickOutside = closeWhenClickOutside;
    let renderedHtml = this.getYesNoTemplate().render({
      title: title,
      message: message,
      modal_size: modalSize,
      html: html,
      buttonYesLabel: buttonYesLabel,
      buttonNoLabel: buttonNoLabel,
    });
    this._show(renderedHtml, callback, onLoad);
    this._getModalContainer().querySelector("[data-answer='yes']").focus();
  }

  getMessageTemplate() {
    let template = `
        <div class="ma-modal {{ modal_size }}">
          {% if html %}
            <div class="ma-modal__header">
                <div class="header-elements-left">
                    <h1 class="ma-modal__title">{{ title }}</h1>
                    {% if headerExtraButtons %}
                        {% for button in headerExtraButtons %}
                            <button title="{{ button.title }}"
                              class="ma-modal__extra-header {{ button.class }}"
                            ></button>
                        {% endfor %}
                    {% endif %}
                </div>

                {% if extra %}
                    <button class="ma-modal__back"></button>
                {% elif closeWhenClickOutside %}
                    <button class="ma-modal__close"></button>
                {% endif %}
            </div>
            {{ message|safe }}
          {% else %}
            <div class="ma-modal__header">
                <h1 class="ma-modal__title">{{ title }}</h1>
                {% if extra %}
                    <button class="ma-modal__back"><i class="fas fa-arrow-left"></i></button>
                {% else %}
                    <button class="ma-modal__close"><i class="fas fa-times"></i></button>
                {% endif %}
            </div>
            <div class="ma-modal__body">
                {{ message }}
            </div>
          {% endif %}
        </div>
        `;
    return nunjucks.compile(template);
  }

  getQuestionTemplate() {
    let template = `
        <div class="ma-modal {{ modal_size }}">
          <div class="ma-modal__header">
            <h1 class="ma-modal__title">{{ title }}</h1>
            <button class="ma-modal__close"></button>
          </div>
          <div class="ma-modal__body">
            {% if html %}{{ message|safe }}{% else %}{{ message }}{% endif %}
            <form>
              {% if label %}<label for="ma-answer">{{ label }}</label>{% endif %}
              <input type="text" name="ma-answer" id="ma-answer" class="ma-answer"
                {% if placeholder %}placeholder="{{ placeholder }}"{% endif %} maxlength="250"
              />
            </form>
          </div>
          <div class="ma-modal__footer">
            <button class="ma-btn">Ok</button>
            <button class="ma-btn ma-btn--secondary">Cancelar</button>
          </div>
        </div>
        `;
    return nunjucks.compile(template);
  }

  getYesNoTemplate() {
    let template = `
        <div class="ma-modal {{ modal_size }}">
          <div class="ma-modal__header">
            <h1 class="ma-modal__title">{{ title }}</h1>
            <button class="ma-modal__close"></button>
          </div>
          <div class="ma-modal__body">
            {% if html %} {{ message|safe }} {% else %} {{ message }} {% endif %}
          </div>
          <div class="ma-modal__footer">
            <button class="ma-btn" data-answer="yes">
                {% if buttonYesLabel %}{{ buttonYesLabel }}{% else %}Sim{% endif %}
            </button>
            <button class="ma-btn ma-btn--secondary" data-answer="no">
                {% if buttonNoLabel %}{{ buttonNoLabel }}{% else %}Não{% endif %}
            </button>
          </div>
        </div>
        `;
    return nunjucks.compile(template);
  }
}