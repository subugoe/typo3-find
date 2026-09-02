var Qr = Object.defineProperty;
var Zr = (i, t, e) => t in i ? Qr(i, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : i[t] = e;
var E = (i, t, e) => Zr(i, typeof t != "symbol" ? t + "" : t, e);
function ta(i) {
  return i && i.__esModule && Object.prototype.hasOwnProperty.call(i, "default") ? i.default : i;
}
var Hi = { exports: {} }, Us;
function ea() {
  return Us || (Us = 1, (function(i) {
    (function() {
      var t = function(l, c) {
        var h = this;
        t.count = (t.count || 0) + 1, this.count = t.count, this.isOpened = !1, this.input = o(l), this.input.setAttribute("autocomplete", "off"), this.input.setAttribute("aria-autocomplete", "list"), this.input.setAttribute("aria-expanded", "false"), this.input.setAttribute("aria-controls", "awesomplete_list_" + this.count), this.input.setAttribute("aria-owns", "awesomplete_list_" + this.count), this.input.setAttribute("role", "combobox"), this.options = c = c || {}, s(this, {
          minChars: 2,
          maxItems: 10,
          autoFirst: !1,
          data: t.DATA,
          filter: t.FILTER_CONTAINS,
          sort: c.sort === !1 ? !1 : t.SORT_BYLENGTH,
          container: t.CONTAINER,
          item: t.ITEM,
          replace: t.REPLACE,
          tabSelect: !1,
          listLabel: "Results List",
          statusNoResults: "No results found",
          statusXResults: "{0} results found",
          // uses index placeholder {0}
          statusTypeXChar: "Type {0} or more characters for results"
        }, c), this.index = -1, this.container = this.container(l), this.ul = o.create("ul", {
          hidden: "hidden",
          role: "listbox",
          id: "awesomplete_list_" + this.count,
          inside: this.container,
          "aria-label": this.listLabel
        }), this.status = o.create("span", {
          className: "visually-hidden",
          role: "status",
          "aria-live": "assertive",
          "aria-atomic": !0,
          inside: this.container,
          textContent: ""
          // live region should start empty. Only when the text is changed it will be read by the screen reader.
        }), this._events = {
          input: {
            input: this.evaluate.bind(this),
            blur: this.close.bind(this, { reason: "blur" }),
            keydown: function(d) {
              var u = d.keyCode;
              h.opened && (u === 13 && h.selected || u === 9 && h.selected && h.tabSelect ? (d.preventDefault(), h.select(void 0, void 0, d)) : u === 27 ? h.close({ reason: "esc" }) : (u === 38 || u === 40) && (d.preventDefault(), h[u === 38 ? "previous" : "next"]()));
            }
          },
          form: {
            submit: this.close.bind(this, { reason: "submit" })
          },
          ul: {
            // Prevent the default mousedowm, which ensures the input is not blurred.
            // The actual selection will happen on click. This also ensures dragging the
            // cursor away from the list item will cancel the selection
            mousedown: function(d) {
              d.preventDefault();
            },
            // The click event is fired even if the corresponding mousedown event has called preventDefault
            click: function(d) {
              var u = d.target;
              if (u !== this) {
                for (; u && !/li/i.test(u.nodeName); )
                  u = u.parentNode;
                u && d.button === 0 && (d.preventDefault(), h.select(u, d.target, d));
              }
            }
          }
        }, o.bind(this.input, this._events.input), o.bind(this.input.form, this._events.form), o.bind(this.ul, this._events.ul), this.input.hasAttribute("list") ? (this.list = "#" + this.input.getAttribute("list"), this.input.removeAttribute("list")) : this.list = this.input.getAttribute("data-list") || c.list || [], t.all.push(this);
      };
      t.prototype = {
        set list(l) {
          if (Array.isArray(l))
            this._list = l;
          else if (typeof l == "string" && l.indexOf(",") > -1)
            this._list = l.split(/\s*,\s*/);
          else if (l = o(l), l && l.children) {
            var c = [];
            n.apply(l.children).forEach(function(h) {
              if (!h.disabled) {
                var d = h.textContent.trim(), u = h.value || d, f = h.label || d;
                u !== "" && c.push({ label: f, value: u });
              }
            }), this._list = c;
          }
          document.activeElement === this.input && this.evaluate();
        },
        get selected() {
          return this.index > -1;
        },
        get opened() {
          return this.isOpened;
        },
        close: function(l) {
          this.opened && (this.input.setAttribute("aria-expanded", "false"), this.ul.setAttribute("hidden", ""), this.isOpened = !1, this.index = -1, this.status.setAttribute("hidden", ""), this.input.setAttribute("aria-activedescendant", ""), o.fire(this.input, "awesomplete-close", l || {}));
        },
        open: function() {
          this.input.setAttribute("aria-expanded", "true"), this.ul.removeAttribute("hidden"), this.isOpened = !0, this.status.removeAttribute("hidden"), this.autoFirst && this.index === -1 && this.goto(0), o.fire(this.input, "awesomplete-open");
        },
        destroy: function() {
          if (o.unbind(this.input, this._events.input), o.unbind(this.input.form, this._events.form), !this.options.container) {
            var l = this.container.parentNode;
            l.insertBefore(this.input, this.container), l.removeChild(this.container);
          }
          this.input.removeAttribute("autocomplete"), this.input.removeAttribute("aria-autocomplete"), this.input.removeAttribute("aria-expanded"), this.input.removeAttribute("aria-controls"), this.input.removeAttribute("aria-owns"), this.input.removeAttribute("role");
          var c = t.all.indexOf(this);
          c !== -1 && t.all.splice(c, 1);
        },
        next: function() {
          var l = this.ul.children.length;
          this.goto(this.index < l - 1 ? this.index + 1 : l ? 0 : -1);
        },
        previous: function() {
          var l = this.ul.children.length, c = this.index - 1;
          this.goto(this.selected && c !== -1 ? c : l - 1);
        },
        // Should not be used, highlights specific item without any checks!
        goto: function(l) {
          var c = this.ul.children;
          this.selected && c[this.index].setAttribute("aria-selected", "false"), this.index = l, l > -1 && c.length > 0 && (c[l].setAttribute("aria-selected", "true"), this.input.setAttribute("aria-activedescendant", this.ul.id + "_item_" + this.index), this.ul.scrollTop = c[l].offsetTop - this.ul.clientHeight + c[l].clientHeight, o.fire(this.input, "awesomplete-highlight", {
            text: this.suggestions[this.index]
          }));
        },
        select: function(l, c, h) {
          if (l ? this.index = o.siblingIndex(l) : l = this.ul.children[this.index], l) {
            var d = this.suggestions[this.index], u = o.fire(this.input, "awesomplete-select", {
              text: d,
              origin: c || l,
              originalEvent: h
            });
            u && (this.replace(d), this.close({ reason: "select" }), o.fire(this.input, "awesomplete-selectcomplete", {
              text: d,
              originalEvent: h
            }));
          }
        },
        evaluate: function() {
          var l = this, c = this.input.value;
          c.length >= this.minChars && this._list && this._list.length > 0 ? (this.index = -1, this.ul.innerHTML = "", this.suggestions = this._list.map(function(h) {
            return new e(l.data(h, c));
          }).filter(function(h) {
            return l.filter(h, c);
          }), this.sort !== !1 && (this.suggestions = this.suggestions.sort(this.sort)), this.suggestions = this.suggestions.slice(0, this.maxItems), this.suggestions.forEach(function(h, d) {
            l.ul.appendChild(l.item(h, c, d));
          }), this.ul.children.length === 0 ? (this.status.textContent = this.statusNoResults, this.close({ reason: "nomatches" })) : (this.input.setAttribute("aria-activedescendant", ""), this.open(), this.status.textContent = this.statusXResults.replaceAll("{0}", this.ul.children.length))) : (this.close({ reason: "nomatches" }), this.minChar <= 1 || c.length >= this.minChars ? this.status.textContent = this.statusNoResults : this.status.textContent = this.statusTypeXChar.replaceAll("{0}", this.minChars));
        }
      }, t.all = [], t.FILTER_CONTAINS = function(l, c) {
        return RegExp(o.regExpEscape(c.trim()), "i").test(l);
      }, t.FILTER_STARTSWITH = function(l, c) {
        return RegExp("^" + o.regExpEscape(c.trim()), "i").test(l);
      }, t.SORT_BYLENGTH = function(l, c) {
        return l.length !== c.length ? l.length - c.length : l < c ? -1 : 1;
      }, t.CONTAINER = function(l) {
        return o.create("div", {
          className: "awesomplete",
          around: l
        });
      }, t.ITEM = function(l, c, h) {
        var d = c.trim() === "" ? l : l.replace(RegExp(o.regExpEscape(c.trim()), "gi"), "<mark>$&</mark>");
        return o.create("li", {
          innerHTML: d,
          role: "option",
          "aria-selected": "false",
          tabindex: "-1",
          // for the Talkback screen reader
          id: "awesomplete_list_" + this.count + "_item_" + h
        });
      }, t.REPLACE = function(l) {
        this.input.value = l.value;
      }, t.DATA = function(l) {
        return l;
      };
      function e(l) {
        var c = Array.isArray(l) ? { label: l[0], value: l[1] } : typeof l == "object" && "label" in l && "value" in l ? l : { label: l, value: l };
        this.label = c.label || c.value, this.value = c.value;
      }
      Object.defineProperty(e.prototype = Object.create(String.prototype), "length", {
        get: function() {
          return this.label.length;
        }
      }), e.prototype.toString = e.prototype.valueOf = function() {
        return "" + this.label;
      };
      function s(l, c, h) {
        for (var d in c) {
          var u = c[d], f = l.input.getAttribute("data-" + d.toLowerCase());
          typeof u == "number" ? l[d] = parseInt(f) : u === !1 ? l[d] = f !== null : u instanceof Function ? l[d] = null : l[d] = f, !l[d] && l[d] !== 0 && (l[d] = d in h ? h[d] : u);
        }
      }
      var n = Array.prototype.slice;
      function o(l, c) {
        return typeof l == "string" ? (c || document).querySelector(l) : l || null;
      }
      function r(l, c) {
        return n.call((c || document).querySelectorAll(l));
      }
      o.create = function(l, c) {
        var h = document.createElement(l);
        for (var d in c) {
          var u = c[d];
          if (d === "inside")
            o(u).appendChild(h);
          else if (d === "around") {
            var f = o(u);
            f.parentNode.insertBefore(h, f), h.appendChild(f), f.getAttribute("autofocus") != null && f.focus();
          } else d in h ? h[d] = u : h.setAttribute(d, u);
        }
        return h;
      }, o.bind = function(l, c) {
        if (l)
          for (var h in c) {
            var d = c[h];
            h.split(/\s+/).forEach(function(u) {
              l.addEventListener(u, d);
            });
          }
      }, o.unbind = function(l, c) {
        if (l)
          for (var h in c) {
            var d = c[h];
            h.split(/\s+/).forEach(function(u) {
              l.removeEventListener(u, d);
            });
          }
      }, o.fire = function(l, c, h) {
        var d = document.createEvent("HTMLEvents");
        d.initEvent(c, !0, !0);
        for (var u in h)
          d[u] = h[u];
        return l.dispatchEvent(d);
      }, o.regExpEscape = function(l) {
        return l.replace(/[-\\^$*+?.()|[\]{}]/g, "\\$&");
      }, o.siblingIndex = function(l) {
        for (var c = 0; l = l.previousElementSibling; c++) ;
        return c;
      };
      function a() {
        r("input.awesomplete").forEach(function(l) {
          new t(l);
        });
      }
      return typeof self < "u" && (self.Awesomplete = t), typeof Document < "u" && (document.readyState !== "loading" ? a() : document.addEventListener("DOMContentLoaded", a)), t.$ = o, t.$$ = r, i.exports && (i.exports = t), t;
    })();
  })(Hi)), Hi.exports;
}
var ia = ea();
const sa = /* @__PURE__ */ ta(ia);
/*! choices.js v11.2.3 | © 2026 Josh Johnson | https://github.com/Choices-js/Choices#readme */
var ns = function(i, t) {
  return ns = Object.setPrototypeOf || {
    __proto__: []
  } instanceof Array && function(e, s) {
    e.__proto__ = s;
  } || function(e, s) {
    for (var n in s) Object.prototype.hasOwnProperty.call(s, n) && (e[n] = s[n]);
  }, ns(i, t);
};
function zo(i, t) {
  if (typeof t != "function" && t !== null) throw new TypeError("Class extends value " + String(t) + " is not a constructor or null");
  ns(i, t);
  function e() {
    this.constructor = i;
  }
  i.prototype = t === null ? Object.create(t) : (e.prototype = t.prototype, new e());
}
var at = function() {
  return at = Object.assign || function(t) {
    for (var e, s = 1, n = arguments.length; s < n; s++) {
      e = arguments[s];
      for (var o in e) Object.prototype.hasOwnProperty.call(e, o) && (t[o] = e[o]);
    }
    return t;
  }, at.apply(this, arguments);
};
function na(i, t, e) {
  for (var s = 0, n = t.length, o; s < n; s++)
    (o || !(s in t)) && (o || (o = Array.prototype.slice.call(t, 0, s)), o[s] = t[s]);
  return i.concat(o || Array.prototype.slice.call(t));
}
var K = {
  ADD_CHOICE: "ADD_CHOICE",
  REMOVE_CHOICE: "REMOVE_CHOICE",
  FILTER_CHOICES: "FILTER_CHOICES",
  ACTIVATE_CHOICES: "ACTIVATE_CHOICES",
  CLEAR_CHOICES: "CLEAR_CHOICES",
  ADD_GROUP: "ADD_GROUP",
  ADD_ITEM: "ADD_ITEM",
  REMOVE_ITEM: "REMOVE_ITEM",
  HIGHLIGHT_ITEM: "HIGHLIGHT_ITEM"
}, ot = {
  showDropdown: "showDropdown",
  hideDropdown: "hideDropdown",
  change: "change",
  choice: "choice",
  search: "search",
  addItem: "addItem",
  removeItem: "removeItem",
  highlightItem: "highlightItem",
  highlightChoice: "highlightChoice",
  unhighlightItem: "unhighlightItem"
}, Z = {
  TAB_KEY: 9,
  SHIFT_KEY: 16,
  BACK_KEY: 46,
  DELETE_KEY: 8,
  ENTER_KEY: 13,
  A_KEY: 65,
  ESC_KEY: 27,
  UP_KEY: 38,
  DOWN_KEY: 40,
  PAGE_UP_KEY: 33,
  PAGE_DOWN_KEY: 34
}, oa = ["fuseOptions", "classNames"], Rt = {
  Text: "text",
  SelectOne: "select-one",
  SelectMultiple: "select-multiple"
}, Xs = function(i) {
  return {
    type: K.ADD_CHOICE,
    choice: i
  };
}, ra = function(i) {
  return {
    type: K.REMOVE_CHOICE,
    choice: i
  };
}, aa = function(i) {
  return {
    type: K.FILTER_CHOICES,
    results: i
  };
}, la = function(i) {
  return {
    type: K.ACTIVATE_CHOICES,
    active: i
  };
}, ca = function(i) {
  return {
    type: K.ADD_GROUP,
    group: i
  };
}, Gs = function(i) {
  return {
    type: K.ADD_ITEM,
    item: i
  };
}, qs = function(i) {
  return {
    type: K.REMOVE_ITEM,
    item: i
  };
}, Qe = function(i, t) {
  return {
    type: K.HIGHLIGHT_ITEM,
    item: i,
    highlighted: t
  };
}, ha = function(i, t) {
  return Math.floor(Math.random() * (t - i) + i);
}, Js = function(i) {
  return Array.from({ length: i }, function() {
    return ha(0, 36).toString(36);
  }).join("");
}, da = function(i, t) {
  var e = i.id || i.name && "".concat(i.name, "-").concat(Js(2)) || Js(4);
  return e = e.replace(/(:|\.|\[|\]|,)/g, ""), e = "".concat(t, "-").concat(e), e;
}, ua = function(i, t, e) {
  e === void 0 && (e = 1);
  for (var s = "".concat(e > 0 ? "next" : "previous", "ElementSibling"), n = i[s]; n; ) {
    if (n.matches(t))
      return n;
    n = n[s];
  }
  return null;
}, Qs = function(i, t, e) {
  e === void 0 && (e = 1);
  var s;
  return e > 0 ? s = t.scrollTop + t.offsetHeight >= i.offsetTop + i.offsetHeight : s = i.offsetTop >= t.scrollTop, s;
}, Xe = function(i) {
  if (typeof i != "string") {
    if (i == null)
      return "";
    if (typeof i == "object") {
      if ("raw" in i)
        return Xe(i.raw);
      if ("trusted" in i)
        return i.trusted;
    }
    return i;
  }
  return i.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/'/g, "&#039;").replace(/"/g, "&quot;");
}, fa = (function() {
  var i = document.createElement("div");
  return function(t) {
    i.innerHTML = t.trim();
    for (var e = i.children[0]; i.firstChild; )
      i.removeChild(i.firstChild);
    return e;
  };
})(), Zs = function(i) {
  return typeof i == "function" ? i() : i;
}, vt = function(i) {
  if (typeof i == "string")
    return i;
  if (typeof i == "object") {
    if ("trusted" in i)
      return i.trusted;
    if ("raw" in i)
      return i.raw;
  }
  return "";
}, Ho = function(i) {
  if (typeof i == "string")
    return i;
  if (typeof i == "object") {
    if ("escaped" in i)
      return i.escaped;
    if ("trusted" in i)
      return i.trusted;
  }
  return "";
}, mt = function(i, t) {
  return {
    id: i.id,
    highlighted: i.highlighted,
    labelClass: i.labelClass,
    labelDescription: vt(i.labelDescription),
    customProperties: i.customProperties,
    disabled: i.disabled,
    active: i.active,
    label: i.label,
    placeholder: i.placeholder,
    value: i.value,
    groupValue: i.group ? i.group.label : void 0,
    element: i.element,
    keyCode: t
  };
}, Ie = function(i, t, e) {
  return typeof i == "function" ? i(Xe(t), vt(t), e) : i;
}, Os = function(i, t) {
  return i ? Ho(t) : Xe(t);
}, wt = function(i, t, e) {
  i.innerHTML = Os(t, e);
}, pa = function(i, t) {
  var e = i.value, s = i.label, n = s === void 0 ? e : s, o = t.value, r = t.label, a = r === void 0 ? o : r;
  return vt(n).localeCompare(vt(a), [], {
    sensitivity: "base",
    ignorePunctuation: !0,
    numeric: !0
  });
}, ga = function(i, t) {
  return i.rank - t.rank;
}, ma = function(i, t, e) {
  e === void 0 && (e = null);
  var s = new CustomEvent(t, {
    detail: e,
    bubbles: !0,
    cancelable: !0
  });
  return i.dispatchEvent(s);
}, ba = function(i, t) {
  var e = Object.keys(i).sort(), s = Object.keys(t).sort();
  return e.filter(function(n) {
    return s.indexOf(n) < 0;
  });
}, Ti = function(i) {
  return Array.isArray(i) ? i : [i];
}, ce = function(i) {
  return i && Array.isArray(i) ? i.map(function(t) {
    return ".".concat(t);
  }).join("") : ".".concat(i);
}, P = function(i, t) {
  var e;
  (e = i.classList).add.apply(e, Ti(t));
}, ft = function(i, t) {
  var e;
  (e = i.classList).remove.apply(e, Ti(t));
}, _a = function(i) {
  if (typeof i < "u")
    try {
      return JSON.parse(i);
    } catch {
      return i;
    }
  return {};
}, ya = function(i, t, e) {
  var s = i.itemEl;
  s && (ft(s, e), P(s, t));
}, va = (
  /** @class */
  (function() {
    function i(t) {
      var e = t.element, s = t.type, n = t.classNames;
      this.element = e, this.classNames = n, this.type = s, this.isActive = !1;
    }
    return i.prototype.show = function() {
      return P(this.element, this.classNames.activeState), this.element.setAttribute("aria-expanded", "true"), this.isActive = !0, this;
    }, i.prototype.hide = function() {
      return ft(this.element, this.classNames.activeState), this.element.setAttribute("aria-expanded", "false"), this.isActive = !1, this;
    }, i;
  })()
), tn = (
  /** @class */
  (function() {
    function i(t) {
      var e = t.element, s = t.type, n = t.classNames, o = t.position;
      this.element = e, this.classNames = n, this.type = s, this.position = o, this.isOpen = !1, this.isFlipped = !1, this.isDisabled = !1, this.isLoading = !1;
    }
    return i.prototype.shouldFlip = function(t, e) {
      var s = !1;
      return this.position === "auto" ? s = this.element.getBoundingClientRect().top - e >= 0 && !window.matchMedia("(min-height: ".concat(t + 1, "px)")).matches : this.position === "top" && (s = !0), s;
    }, i.prototype.setActiveDescendant = function(t) {
      this.element.setAttribute("aria-activedescendant", t);
    }, i.prototype.removeActiveDescendant = function() {
      this.element.removeAttribute("aria-activedescendant");
    }, i.prototype.open = function(t, e) {
      P(this.element, this.classNames.openState), this.element.setAttribute("aria-expanded", "true"), this.isOpen = !0, this.shouldFlip(t, e) && (P(this.element, this.classNames.flippedState), this.isFlipped = !0);
    }, i.prototype.close = function() {
      ft(this.element, this.classNames.openState), this.element.setAttribute("aria-expanded", "false"), this.removeActiveDescendant(), this.isOpen = !1, this.isFlipped && (ft(this.element, this.classNames.flippedState), this.isFlipped = !1);
    }, i.prototype.addFocusState = function() {
      P(this.element, this.classNames.focusState);
    }, i.prototype.removeFocusState = function() {
      ft(this.element, this.classNames.focusState);
    }, i.prototype.addInvalidState = function() {
      P(this.element, this.classNames.invalidState);
    }, i.prototype.removeInvalidState = function() {
      ft(this.element, this.classNames.invalidState);
    }, i.prototype.enable = function() {
      ft(this.element, this.classNames.disabledState), this.element.removeAttribute("aria-disabled"), this.type === Rt.SelectOne && this.element.setAttribute("tabindex", "0"), this.isDisabled = !1;
    }, i.prototype.disable = function() {
      P(this.element, this.classNames.disabledState), this.element.setAttribute("aria-disabled", "true"), this.type === Rt.SelectOne && this.element.setAttribute("tabindex", "-1"), this.isDisabled = !0;
    }, i.prototype.wrap = function(t) {
      var e = this.element, s = t.parentNode;
      s && (t.nextSibling ? s.insertBefore(e, t.nextSibling) : s.appendChild(e)), e.appendChild(t);
    }, i.prototype.unwrap = function(t) {
      var e = this.element, s = e.parentNode;
      s && (s.insertBefore(t, e), s.removeChild(e));
    }, i.prototype.addLoadingState = function() {
      P(this.element, this.classNames.loadingState), this.element.setAttribute("aria-busy", "true"), this.isLoading = !0;
    }, i.prototype.removeLoadingState = function() {
      ft(this.element, this.classNames.loadingState), this.element.removeAttribute("aria-busy"), this.isLoading = !1;
    }, i;
  })()
), xa = (
  /** @class */
  (function() {
    function i(t) {
      var e = t.element, s = t.type, n = t.classNames, o = t.preventPaste;
      this.element = e, this.type = s, this.classNames = n, this.preventPaste = o, this.isFocussed = this.element.isEqualNode(document.activeElement), this.isDisabled = e.disabled, this._onPaste = this._onPaste.bind(this), this._onInput = this._onInput.bind(this), this._onFocus = this._onFocus.bind(this), this._onBlur = this._onBlur.bind(this);
    }
    return Object.defineProperty(i.prototype, "placeholder", {
      set: function(t) {
        this.element.placeholder = t;
      },
      enumerable: !1,
      configurable: !0
    }), Object.defineProperty(i.prototype, "value", {
      get: function() {
        return this.element.value;
      },
      set: function(t) {
        this.element.value = t;
      },
      enumerable: !1,
      configurable: !0
    }), i.prototype.addEventListeners = function() {
      var t = this.element;
      t.addEventListener("paste", this._onPaste), t.addEventListener("input", this._onInput, {
        passive: !0
      }), t.addEventListener("focus", this._onFocus, {
        passive: !0
      }), t.addEventListener("blur", this._onBlur, {
        passive: !0
      });
    }, i.prototype.removeEventListeners = function() {
      var t = this.element;
      t.removeEventListener("input", this._onInput), t.removeEventListener("paste", this._onPaste), t.removeEventListener("focus", this._onFocus), t.removeEventListener("blur", this._onBlur);
    }, i.prototype.enable = function() {
      var t = this.element;
      t.removeAttribute("disabled"), this.isDisabled = !1;
    }, i.prototype.disable = function() {
      var t = this.element;
      t.setAttribute("disabled", ""), this.isDisabled = !0;
    }, i.prototype.focus = function() {
      this.isFocussed || this.element.focus();
    }, i.prototype.blur = function() {
      this.isFocussed && this.element.blur();
    }, i.prototype.clear = function(t) {
      return t === void 0 && (t = !0), this.element.value = "", t && this.setWidth(), this;
    }, i.prototype.setWidth = function() {
      var t = this.element, e = t.value, s = t.placeholder, n = 0, o = 0;
      if (e || s) {
        var r = document.createElement("span");
        r.style.position = "absolute", r.style.visibility = "hidden", r.style.whiteSpace = "pre", r.style.height = "auto", r.style.width = "auto", r.style.minWidth = "1ch", P(r, Array.from(t.classList)), t.after(r);
        var a = parseFloat(getComputedStyle(r).width);
        Number.isNaN(a) ? (n = s.length, o = e.length) : (s && (r.innerText = s, n = parseFloat(getComputedStyle(r).width) / a), e && (r.innerText = e, o = parseFloat(getComputedStyle(r).width) / a)), r.remove();
      }
      t.style.minWidth = "".concat(Math.ceil(n) + 1, "ch"), t.style.width = "".concat(Math.ceil(o) + 1, "ch");
    }, i.prototype.setActiveDescendant = function(t) {
      this.element.setAttribute("aria-activedescendant", t);
    }, i.prototype.removeActiveDescendant = function() {
      this.element.removeAttribute("aria-activedescendant");
    }, i.prototype._onInput = function() {
      this.type !== Rt.SelectOne && this.setWidth();
    }, i.prototype._onPaste = function(t) {
      this.preventPaste && t.preventDefault();
    }, i.prototype._onFocus = function() {
      this.isFocussed = !0;
    }, i.prototype._onBlur = function() {
      this.isFocussed = !1;
    }, i;
  })()
), Sa = 4, en = (
  /** @class */
  (function() {
    function i(t) {
      var e = t.element;
      this.element = e, this.scrollPos = this.element.scrollTop, this.height = this.element.offsetHeight;
    }
    return i.prototype.prepend = function(t) {
      var e = this.element.firstElementChild;
      e ? this.element.insertBefore(t, e) : this.element.append(t);
    }, i.prototype.scrollToTop = function() {
      this.element.scrollTop = 0;
    }, i.prototype.scrollToChildElement = function(t, e) {
      var s = this;
      if (t) {
        var n = this.element.offsetHeight, o = this.element.scrollTop + n, r = t.offsetHeight, a = t.offsetTop + r, l = e > 0 ? this.element.scrollTop + a - o : t.offsetTop;
        requestAnimationFrame(function() {
          s._animateScroll(l, e);
        });
      }
    }, i.prototype._scrollDown = function(t, e, s) {
      var n = (s - t) / e, o = n > 1 ? n : 1;
      this.element.scrollTop = t + o;
    }, i.prototype._scrollUp = function(t, e, s) {
      var n = (t - s) / e, o = n > 1 ? n : 1;
      this.element.scrollTop = t - o;
    }, i.prototype._animateScroll = function(t, e) {
      var s = this, n = Sa, o = this.element.scrollTop, r = !1;
      e > 0 ? (this._scrollDown(o, n, t), o < t && (r = !0)) : (this._scrollUp(o, n, t), o > t && (r = !0)), r && requestAnimationFrame(function() {
        s._animateScroll(t, e);
      });
    }, i;
  })()
), Vo = (
  /** @class */
  (function() {
    function i(t) {
      var e = t.element, s = t.classNames;
      this.element = e, this.classNames = s, this.isDisabled = !1;
    }
    return Object.defineProperty(i.prototype, "isActive", {
      get: function() {
        return this.element.dataset.choice === "active";
      },
      enumerable: !1,
      configurable: !0
    }), Object.defineProperty(i.prototype, "dir", {
      get: function() {
        return this.element.dir;
      },
      enumerable: !1,
      configurable: !0
    }), Object.defineProperty(i.prototype, "value", {
      get: function() {
        return this.element.value;
      },
      set: function(t) {
        this.element.setAttribute("value", t), this.element.value = t;
      },
      enumerable: !1,
      configurable: !0
    }), i.prototype.conceal = function() {
      var t = this.element;
      P(t, this.classNames.input), t.hidden = !0, t.tabIndex = -1;
      var e = t.getAttribute("style");
      e && t.setAttribute("data-choice-orig-style", e), t.setAttribute("data-choice", "active");
    }, i.prototype.reveal = function() {
      var t = this.element;
      ft(t, this.classNames.input), t.hidden = !1, t.removeAttribute("tabindex");
      var e = t.getAttribute("data-choice-orig-style");
      e ? (t.removeAttribute("data-choice-orig-style"), t.setAttribute("style", e)) : t.removeAttribute("style"), t.removeAttribute("data-choice");
    }, i.prototype.enable = function() {
      this.element.removeAttribute("disabled"), this.element.disabled = !1, this.isDisabled = !1;
    }, i.prototype.disable = function() {
      this.element.setAttribute("disabled", ""), this.element.disabled = !0, this.isDisabled = !0;
    }, i.prototype.triggerEvent = function(t, e) {
      ma(this.element, t, e || {});
    }, i;
  })()
), wa = (
  /** @class */
  (function(i) {
    zo(t, i);
    function t() {
      return i !== null && i.apply(this, arguments) || this;
    }
    return t;
  })(Vo)
), Ce = function(i, t) {
  return t === void 0 && (t = !0), typeof i > "u" ? t : !!i;
}, Wo = function(i) {
  if (typeof i == "string" && (i = i.split(" ").filter(function(t) {
    return t.length;
  })), Array.isArray(i) && i.length)
    return i;
}, _t = function(i, t, e) {
  if (e === void 0 && (e = !0), typeof i == "string") {
    var s = Xe(i), n = e || s === i ? i : { escaped: s, raw: i }, o = _t({
      value: i,
      label: n,
      selected: !0
    }, !1);
    return o;
  }
  var r = i;
  if ("choices" in r) {
    if (!t)
      throw new TypeError("optGroup is not allowed");
    var a = r, l = a.choices.map(function(u) {
      return _t(u, !1);
    }), c = {
      id: 0,
      // actual ID will be assigned during _addGroup
      label: vt(a.label) || a.value,
      active: !!l.length,
      disabled: !!a.disabled,
      choices: l
    };
    return c;
  }
  var h = r, d = {
    id: 0,
    // actual ID will be assigned during _addChoice
    group: null,
    // actual group will be assigned during _addGroup but before _addChoice
    score: 0,
    // used in search
    rank: 0,
    // used in search, stable sort order
    value: h.value,
    label: h.label || h.value,
    active: Ce(h.active),
    selected: Ce(h.selected, !1),
    disabled: Ce(h.disabled, !1),
    placeholder: Ce(h.placeholder, !1),
    highlighted: !1,
    labelClass: Wo(h.labelClass),
    labelDescription: h.labelDescription,
    customProperties: h.customProperties
  };
  return d;
}, Ma = function(i) {
  return i.tagName === "INPUT";
}, jo = function(i) {
  return i.tagName === "SELECT";
}, Ea = function(i) {
  return i.tagName === "OPTION";
}, Ca = function(i) {
  return i.tagName === "OPTGROUP";
}, Aa = (
  /** @class */
  (function(i) {
    zo(t, i);
    function t(e) {
      var s = e.element, n = e.classNames, o = e.template, r = e.extractPlaceholder, a = i.call(this, { element: s, classNames: n }) || this;
      return a.template = o, a.extractPlaceholder = r, a;
    }
    return Object.defineProperty(t.prototype, "placeholderOption", {
      get: function() {
        return this.element.querySelector('option[value=""]') || // Backward compatibility layer for the non-standard placeholder attribute supported in older versions.
        this.element.querySelector("option[placeholder]");
      },
      enumerable: !1,
      configurable: !0
    }), t.prototype.addOptions = function(e) {
      var s = this, n = document.createDocumentFragment();
      e.forEach(function(o) {
        var r = o;
        if (!r.element) {
          var a = s.template(r);
          n.appendChild(a), r.element = a;
        }
      }), this.element.appendChild(n);
    }, t.prototype.optionsAsChoices = function() {
      var e = this, s = [];
      return this.element.querySelectorAll(":scope > option, :scope > optgroup").forEach(function(n) {
        Ea(n) ? s.push(e._optionToChoice(n)) : Ca(n) && s.push(e._optgroupToChoice(n));
      }), s;
    }, t.prototype._optionToChoice = function(e) {
      return !e.hasAttribute("value") && e.hasAttribute("placeholder") && (e.setAttribute("value", ""), e.value = ""), {
        id: 0,
        group: null,
        score: 0,
        rank: 0,
        value: e.value,
        // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/option
        // This attribute is text for the label indicating the meaning of the option. If the `label` attribute isn't defined, its value is that of the element text content (ie `innerText`).
        label: e.label,
        element: e,
        active: !0,
        // this returns true if nothing is selected on initial load, which will break placeholder support
        selected: this.extractPlaceholder ? e.selected : e.hasAttribute("selected"),
        disabled: e.disabled,
        highlighted: !1,
        placeholder: this.extractPlaceholder && (!e.value || e.hasAttribute("placeholder")),
        labelClass: typeof e.dataset.labelClass < "u" ? Wo(e.dataset.labelClass) : void 0,
        labelDescription: typeof e.dataset.labelDescription < "u" ? { trusted: e.dataset.labelDescription } : void 0,
        customProperties: _a(e.dataset.customProperties)
      };
    }, t.prototype._optgroupToChoice = function(e) {
      var s = this, n = e.querySelectorAll("option"), o = Array.from(n).map(function(r) {
        return s._optionToChoice(r);
      });
      return {
        id: 0,
        label: e.label || "",
        element: e,
        active: !!o.length,
        disabled: e.disabled,
        choices: o
      };
    }, t;
  })(Vo)
), ka = {
  containerOuter: ["choices"],
  containerInner: ["choices__inner"],
  input: ["choices__input"],
  inputCloned: ["choices__input--cloned"],
  list: ["choices__list"],
  listItems: ["choices__list--multiple"],
  listSingle: ["choices__list--single"],
  listDropdown: ["choices__list--dropdown"],
  item: ["choices__item"],
  itemSelectable: ["choices__item--selectable"],
  itemDisabled: ["choices__item--disabled"],
  itemChoice: ["choices__item--choice"],
  description: ["choices__description"],
  placeholder: ["choices__placeholder"],
  group: ["choices__group"],
  groupHeading: ["choices__heading"],
  button: ["choices__button"],
  activeState: ["is-active"],
  focusState: ["is-focused"],
  openState: ["is-open"],
  disabledState: ["is-disabled"],
  highlightedState: ["is-highlighted"],
  selectedState: ["is-selected"],
  flippedState: ["is-flipped"],
  loadingState: ["is-loading"],
  invalidState: ["is-invalid"],
  notice: ["choices__notice"],
  addChoice: ["choices__item--selectable", "add-choice"],
  noResults: ["has-no-results"],
  noChoices: ["has-no-choices"]
}, sn = {
  items: [],
  choices: [],
  silent: !1,
  renderChoiceLimit: -1,
  maxItemCount: -1,
  closeDropdownOnSelect: "auto",
  singleModeForMultiSelect: !1,
  addChoices: !1,
  addItems: !0,
  addItemFilter: function(i) {
    return !!i && i !== "";
  },
  removeItems: !0,
  removeItemButton: !1,
  removeItemButtonAlignLeft: !1,
  editItems: !1,
  allowHTML: !1,
  allowHtmlUserInput: !1,
  duplicateItemsAllowed: !0,
  delimiter: ",",
  paste: !0,
  searchEnabled: !0,
  searchChoices: !0,
  searchDisabledChoices: !1,
  searchFloor: 1,
  searchResultLimit: 4,
  searchFields: ["label", "value"],
  position: "auto",
  resetScrollPosition: !0,
  shouldSort: !0,
  shouldSortItems: !1,
  sorter: pa,
  shadowRoot: null,
  placeholder: !0,
  placeholderValue: null,
  searchPlaceholderValue: null,
  prependValue: null,
  appendValue: null,
  renderSelectedChoices: "auto",
  searchRenderSelectedChoices: !0,
  loadingText: "Loading...",
  noResultsText: "No results found",
  noChoicesText: "No choices to choose from",
  itemSelectText: "Press to select",
  uniqueItemText: "Only unique values can be added",
  customAddItemText: "Only values matching specific conditions can be added",
  addItemText: function(i) {
    return 'Press Enter to add <b>"'.concat(i, '"</b>');
  },
  removeItemIconText: function() {
    return "Remove item";
  },
  removeItemLabelText: function(i, t, e) {
    return "Remove item: ".concat(e ? Xe(e.label) : i);
  },
  maxItemText: function(i) {
    return "Only ".concat(i, " values can be added");
  },
  valueComparer: function(i, t) {
    return i === t;
  },
  fuseOptions: {
    includeScore: !0
  },
  labelId: "",
  callbackOnInit: null,
  callbackOnCreateTemplates: null,
  classNames: ka,
  appendGroupInSearch: !1
}, nn = function(i) {
  var t = i.itemEl;
  t && (t.remove(), i.itemEl = void 0);
};
function Oa(i, t, e) {
  var s = i, n = !0;
  switch (t.type) {
    case K.ADD_ITEM: {
      t.item.selected = !0;
      var o = t.item.element;
      o && (o.selected = !0, o.setAttribute("selected", "")), s.push(t.item);
      break;
    }
    case K.REMOVE_ITEM: {
      t.item.selected = !1;
      var o = t.item.element;
      if (o) {
        o.selected = !1, o.removeAttribute("selected");
        var r = o.parentElement;
        r && jo(r) && r.type === Rt.SelectOne && (r.value = "");
      }
      nn(t.item), s = s.filter(function(h) {
        return h.id !== t.item.id;
      });
      break;
    }
    case K.REMOVE_CHOICE: {
      nn(t.choice), s = s.filter(function(c) {
        return c.id !== t.choice.id;
      });
      break;
    }
    case K.HIGHLIGHT_ITEM: {
      var a = t.highlighted, l = s.find(function(c) {
        return c.id === t.item.id;
      });
      l && l.highlighted !== a && (l.highlighted = a, e && ya(l, a ? e.classNames.highlightedState : e.classNames.selectedState, a ? e.classNames.selectedState : e.classNames.highlightedState));
      break;
    }
    default: {
      n = !1;
      break;
    }
  }
  return { state: s, update: n };
}
function Pa(i, t) {
  var e = i, s = !0;
  switch (t.type) {
    case K.ADD_GROUP: {
      e.push(t.group);
      break;
    }
    case K.CLEAR_CHOICES: {
      e = [];
      break;
    }
    default: {
      s = !1;
      break;
    }
  }
  return { state: e, update: s };
}
function Da(i, t, e) {
  var s = i, n = !0;
  switch (t.type) {
    case K.ADD_CHOICE: {
      s.push(t.choice);
      break;
    }
    case K.REMOVE_CHOICE: {
      t.choice.choiceEl = void 0, t.choice.group && (t.choice.group.choices = t.choice.group.choices.filter(function(r) {
        return r.id !== t.choice.id;
      })), s = s.filter(function(r) {
        return r.id !== t.choice.id;
      });
      break;
    }
    case K.ADD_ITEM:
    case K.REMOVE_ITEM: {
      t.item.choiceEl = void 0;
      break;
    }
    case K.FILTER_CHOICES: {
      var o = [];
      t.results.forEach(function(r) {
        o[r.item.id] = r;
      }), s.forEach(function(r) {
        var a = o[r.id];
        a !== void 0 ? (r.score = a.score, r.rank = a.rank, r.active = !0) : (r.score = 0, r.rank = 0, r.active = !1), e && e.appendGroupInSearch && (r.choiceEl = void 0);
      });
      break;
    }
    case K.ACTIVATE_CHOICES: {
      s.forEach(function(r) {
        r.active = t.active, e && e.appendGroupInSearch && (r.choiceEl = void 0);
      });
      break;
    }
    case K.CLEAR_CHOICES: {
      s = [];
      break;
    }
    default: {
      n = !1;
      break;
    }
  }
  return { state: s, update: n };
}
var on = {
  groups: Pa,
  items: Oa,
  choices: Da
}, Ta = (
  /** @class */
  (function() {
    function i(t) {
      this._state = this.defaultState, this._listeners = [], this._txn = 0, this._context = t;
    }
    return Object.defineProperty(i.prototype, "defaultState", {
      // eslint-disable-next-line class-methods-use-this
      get: function() {
        return {
          groups: [],
          items: [],
          choices: []
        };
      },
      enumerable: !1,
      configurable: !0
    }), i.prototype.changeSet = function(t) {
      return {
        groups: t,
        items: t,
        choices: t
      };
    }, i.prototype.reset = function() {
      this._state = this.defaultState;
      var t = this.changeSet(!0);
      this._txn ? this._changeSet = t : this._listeners.forEach(function(e) {
        return e(t);
      });
    }, i.prototype.subscribe = function(t) {
      return this._listeners.push(t), this;
    }, i.prototype.dispatch = function(t) {
      var e = this, s = this._state, n = !1, o = this._changeSet || this.changeSet(!1);
      Object.keys(on).forEach(function(r) {
        var a = on[r](s[r], t, e._context);
        a.update && (n = !0, o[r] = !0, s[r] = a.state);
      }), n && (this._txn ? this._changeSet = o : this._listeners.forEach(function(r) {
        return r(o);
      }));
    }, i.prototype.withTxn = function(t) {
      this._txn++;
      try {
        t();
      } finally {
        if (this._txn = Math.max(0, this._txn - 1), !this._txn) {
          var e = this._changeSet;
          e && (this._changeSet = void 0, this._listeners.forEach(function(s) {
            return s(e);
          }));
        }
      }
    }, Object.defineProperty(i.prototype, "state", {
      /**
       * Get store object
       */
      get: function() {
        return this._state;
      },
      enumerable: !1,
      configurable: !0
    }), Object.defineProperty(i.prototype, "items", {
      /**
       * Get items from store
       */
      get: function() {
        return this.state.items;
      },
      enumerable: !1,
      configurable: !0
    }), Object.defineProperty(i.prototype, "highlightedActiveItems", {
      /**
       * Get highlighted items from store
       */
      get: function() {
        return this.items.filter(function(t) {
          return t.active && t.highlighted;
        });
      },
      enumerable: !1,
      configurable: !0
    }), Object.defineProperty(i.prototype, "choices", {
      /**
       * Get choices from store
       */
      get: function() {
        return this.state.choices;
      },
      enumerable: !1,
      configurable: !0
    }), Object.defineProperty(i.prototype, "activeChoices", {
      /**
       * Get active choices from store
       */
      get: function() {
        return this.choices.filter(function(t) {
          return t.active;
        });
      },
      enumerable: !1,
      configurable: !0
    }), Object.defineProperty(i.prototype, "searchableChoices", {
      /**
       * Get choices that can be searched (excluding placeholders or disabled choices)
       */
      get: function() {
        var t = this._context;
        return this.choices.filter(function(e) {
          return !e.placeholder && (t.searchDisabledChoices || !e.disabled);
        });
      },
      enumerable: !1,
      configurable: !0
    }), Object.defineProperty(i.prototype, "groups", {
      /**
       * Get groups from store
       */
      get: function() {
        return this.state.groups;
      },
      enumerable: !1,
      configurable: !0
    }), Object.defineProperty(i.prototype, "activeGroups", {
      /**
       * Get active groups from store
       */
      get: function() {
        var t = this;
        return this.state.groups.filter(function(e) {
          var s = e.active && !e.disabled, n = t.state.choices.some(function(o) {
            return o.active && !o.disabled;
          });
          return s && n;
        }, []);
      },
      enumerable: !1,
      configurable: !0
    }), i.prototype.inTxn = function() {
      return this._txn > 0;
    }, i.prototype.getChoiceById = function(t) {
      return this.activeChoices.find(function(e) {
        return e.id === t;
      });
    }, i.prototype.getGroupById = function(t) {
      return this.groups.find(function(e) {
        return e.id === t;
      });
    }, i;
  })()
), J = {
  noChoices: "no-choices",
  noResults: "no-results",
  addChoice: "add-choice",
  generic: ""
};
function Ia(i, t, e) {
  return (t = Ra(t)) in i ? Object.defineProperty(i, t, {
    value: e,
    enumerable: !0,
    configurable: !0,
    writable: !0
  }) : i[t] = e, i;
}
function rn(i, t) {
  var e = Object.keys(i);
  if (Object.getOwnPropertySymbols) {
    var s = Object.getOwnPropertySymbols(i);
    t && (s = s.filter(function(n) {
      return Object.getOwnPropertyDescriptor(i, n).enumerable;
    })), e.push.apply(e, s);
  }
  return e;
}
function ue(i) {
  for (var t = 1; t < arguments.length; t++) {
    var e = arguments[t] != null ? arguments[t] : {};
    t % 2 ? rn(Object(e), !0).forEach(function(s) {
      Ia(i, s, e[s]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(i, Object.getOwnPropertyDescriptors(e)) : rn(Object(e)).forEach(function(s) {
      Object.defineProperty(i, s, Object.getOwnPropertyDescriptor(e, s));
    });
  }
  return i;
}
function La(i, t) {
  if (typeof i != "object" || !i) return i;
  var e = i[Symbol.toPrimitive];
  if (e !== void 0) {
    var s = e.call(i, t);
    if (typeof s != "object") return s;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(i);
}
function Ra(i) {
  var t = La(i, "string");
  return typeof t == "symbol" ? t : t + "";
}
function Tt(i) {
  return Array.isArray ? Array.isArray(i) : Ko(i) === "[object Array]";
}
function Fa(i) {
  if (typeof i == "string")
    return i;
  let t = i + "";
  return t == "0" && 1 / i == -1 / 0 ? "-0" : t;
}
function Na(i) {
  return i == null ? "" : Fa(i);
}
function xt(i) {
  return typeof i == "string";
}
function $o(i) {
  return typeof i == "number";
}
function Ba(i) {
  return i === !0 || i === !1 || za(i) && Ko(i) == "[object Boolean]";
}
function Yo(i) {
  return typeof i == "object";
}
function za(i) {
  return Yo(i) && i !== null;
}
function ht(i) {
  return i != null;
}
function Vi(i) {
  return !i.trim().length;
}
function Ko(i) {
  return i == null ? i === void 0 ? "[object Undefined]" : "[object Null]" : Object.prototype.toString.call(i);
}
const Ha = "Incorrect 'index' type", Va = (i) => `Invalid value for key ${i}`, Wa = (i) => `Pattern length exceeds max of ${i}.`, ja = (i) => `Missing ${i} property in key`, $a = (i) => `Property 'weight' in key '${i}' must be a positive integer`, an = Object.prototype.hasOwnProperty;
class Ya {
  constructor(t) {
    this._keys = [], this._keyMap = {};
    let e = 0;
    t.forEach((s) => {
      let n = Uo(s);
      this._keys.push(n), this._keyMap[n.id] = n, e += n.weight;
    }), this._keys.forEach((s) => {
      s.weight /= e;
    });
  }
  get(t) {
    return this._keyMap[t];
  }
  keys() {
    return this._keys;
  }
  toJSON() {
    return JSON.stringify(this._keys);
  }
}
function Uo(i) {
  let t = null, e = null, s = null, n = 1, o = null;
  if (xt(i) || Tt(i))
    s = i, t = ln(i), e = os(i);
  else {
    if (!an.call(i, "name"))
      throw new Error(ja("name"));
    const r = i.name;
    if (s = r, an.call(i, "weight") && (n = i.weight, n <= 0))
      throw new Error($a(r));
    t = ln(r), e = os(r), o = i.getFn;
  }
  return {
    path: t,
    id: e,
    weight: n,
    src: s,
    getFn: o
  };
}
function ln(i) {
  return Tt(i) ? i : i.split(".");
}
function os(i) {
  return Tt(i) ? i.join(".") : i;
}
function Ka(i, t) {
  let e = [], s = !1;
  const n = (o, r, a) => {
    if (ht(o))
      if (!r[a])
        e.push(o);
      else {
        let l = r[a];
        const c = o[l];
        if (!ht(c))
          return;
        if (a === r.length - 1 && (xt(c) || $o(c) || Ba(c)))
          e.push(Na(c));
        else if (Tt(c)) {
          s = !0;
          for (let h = 0, d = c.length; h < d; h += 1)
            n(c[h], r, a + 1);
        } else r.length && n(c, r, a + 1);
      }
  };
  return n(i, xt(t) ? t.split(".") : t, 0), s ? e : e[0];
}
const Ua = {
  // Whether the matches should be included in the result set. When `true`, each record in the result
  // set will include the indices of the matched characters.
  // These can consequently be used for highlighting purposes.
  includeMatches: !1,
  // When `true`, the matching function will continue to the end of a search pattern even if
  // a perfect match has already been located in the string.
  findAllMatches: !1,
  // Minimum number of characters that must be matched before a result is considered a match
  minMatchCharLength: 1
}, Xa = {
  // When `true`, the algorithm continues searching to the end of the input even if a perfect
  // match is found before the end of the same input.
  isCaseSensitive: !1,
  // When true, the matching function will continue to the end of a search pattern even if
  includeScore: !1,
  // List of properties that will be searched. This also supports nested properties.
  keys: [],
  // Whether to sort the result list, by score
  shouldSort: !0,
  // Default sort function: sort by ascending score, ascending index
  sortFn: (i, t) => i.score === t.score ? i.idx < t.idx ? -1 : 1 : i.score < t.score ? -1 : 1
}, Ga = {
  // Approximately where in the text is the pattern expected to be found?
  location: 0,
  // At what point does the match algorithm give up. A threshold of '0.0' requires a perfect match
  // (of both letters and location), a threshold of '1.0' would match anything.
  threshold: 0.6,
  // Determines how close the match must be to the fuzzy location (specified above).
  // An exact letter match which is 'distance' characters away from the fuzzy location
  // would score as a complete mismatch. A distance of '0' requires the match be at
  // the exact location specified, a threshold of '1000' would require a perfect match
  // to be within 800 characters of the fuzzy location to be found using a 0.8 threshold.
  distance: 100
}, qa = {
  // When `true`, it enables the use of unix-like search commands
  useExtendedSearch: !1,
  // The get function to use when fetching an object's properties.
  // The default will search nested paths *ie foo.bar.baz*
  getFn: Ka,
  // When `true`, search will ignore `location` and `distance`, so it won't matter
  // where in the string the pattern appears.
  // More info: https://fusejs.io/concepts/scoring-theory.html#fuzziness-score
  ignoreLocation: !1,
  // When `true`, the calculation for the relevance score (used for sorting) will
  // ignore the field-length norm.
  // More info: https://fusejs.io/concepts/scoring-theory.html#field-length-norm
  ignoreFieldNorm: !1,
  // The weight to determine how much field length norm effects scoring.
  fieldNormWeight: 1
};
var A = ue(ue(ue(ue({}, Xa), Ua), Ga), qa);
const Ja = /[^ ]+/g;
function Qa(i = 1, t = 3) {
  const e = /* @__PURE__ */ new Map(), s = Math.pow(10, t);
  return {
    get(n) {
      const o = n.match(Ja).length;
      if (e.has(o))
        return e.get(o);
      const r = 1 / Math.pow(o, 0.5 * i), a = parseFloat(Math.round(r * s) / s);
      return e.set(o, a), a;
    },
    clear() {
      e.clear();
    }
  };
}
class Ps {
  constructor({
    getFn: t = A.getFn,
    fieldNormWeight: e = A.fieldNormWeight
  } = {}) {
    this.norm = Qa(e, 3), this.getFn = t, this.isCreated = !1, this.setIndexRecords();
  }
  setSources(t = []) {
    this.docs = t;
  }
  setIndexRecords(t = []) {
    this.records = t;
  }
  setKeys(t = []) {
    this.keys = t, this._keysMap = {}, t.forEach((e, s) => {
      this._keysMap[e.id] = s;
    });
  }
  create() {
    this.isCreated || !this.docs.length || (this.isCreated = !0, xt(this.docs[0]) ? this.docs.forEach((t, e) => {
      this._addString(t, e);
    }) : this.docs.forEach((t, e) => {
      this._addObject(t, e);
    }), this.norm.clear());
  }
  // Adds a doc to the end of the index
  add(t) {
    const e = this.size();
    xt(t) ? this._addString(t, e) : this._addObject(t, e);
  }
  // Removes the doc at the specified index of the index
  removeAt(t) {
    this.records.splice(t, 1);
    for (let e = t, s = this.size(); e < s; e += 1)
      this.records[e].i -= 1;
  }
  getValueForItemAtKeyId(t, e) {
    return t[this._keysMap[e]];
  }
  size() {
    return this.records.length;
  }
  _addString(t, e) {
    if (!ht(t) || Vi(t))
      return;
    let s = {
      v: t,
      i: e,
      n: this.norm.get(t)
    };
    this.records.push(s);
  }
  _addObject(t, e) {
    let s = {
      i: e,
      $: {}
    };
    this.keys.forEach((n, o) => {
      let r = n.getFn ? n.getFn(t) : this.getFn(t, n.path);
      if (ht(r)) {
        if (Tt(r)) {
          let a = [];
          const l = [{
            nestedArrIndex: -1,
            value: r
          }];
          for (; l.length; ) {
            const {
              nestedArrIndex: c,
              value: h
            } = l.pop();
            if (ht(h))
              if (xt(h) && !Vi(h)) {
                let d = {
                  v: h,
                  i: c,
                  n: this.norm.get(h)
                };
                a.push(d);
              } else Tt(h) && h.forEach((d, u) => {
                l.push({
                  nestedArrIndex: u,
                  value: d
                });
              });
          }
          s.$[o] = a;
        } else if (xt(r) && !Vi(r)) {
          let a = {
            v: r,
            n: this.norm.get(r)
          };
          s.$[o] = a;
        }
      }
    }), this.records.push(s);
  }
  toJSON() {
    return {
      keys: this.keys,
      records: this.records
    };
  }
}
function Xo(i, t, {
  getFn: e = A.getFn,
  fieldNormWeight: s = A.fieldNormWeight
} = {}) {
  const n = new Ps({
    getFn: e,
    fieldNormWeight: s
  });
  return n.setKeys(i.map(Uo)), n.setSources(t), n.create(), n;
}
function Za(i, {
  getFn: t = A.getFn,
  fieldNormWeight: e = A.fieldNormWeight
} = {}) {
  const {
    keys: s,
    records: n
  } = i, o = new Ps({
    getFn: t,
    fieldNormWeight: e
  });
  return o.setKeys(s), o.setIndexRecords(n), o;
}
function Ze(i, {
  errors: t = 0,
  currentLocation: e = 0,
  expectedLocation: s = 0,
  distance: n = A.distance,
  ignoreLocation: o = A.ignoreLocation
} = {}) {
  const r = t / i.length;
  if (o)
    return r;
  const a = Math.abs(s - e);
  return n ? r + a / n : a ? 1 : r;
}
function tl(i = [], t = A.minMatchCharLength) {
  let e = [], s = -1, n = -1, o = 0;
  for (let r = i.length; o < r; o += 1) {
    let a = i[o];
    a && s === -1 ? s = o : !a && s !== -1 && (n = o - 1, n - s + 1 >= t && e.push([s, n]), s = -1);
  }
  return i[o - 1] && o - s >= t && e.push([s, o - 1]), e;
}
const te = 32;
function el(i, t, e, {
  location: s = A.location,
  distance: n = A.distance,
  threshold: o = A.threshold,
  findAllMatches: r = A.findAllMatches,
  minMatchCharLength: a = A.minMatchCharLength,
  includeMatches: l = A.includeMatches,
  ignoreLocation: c = A.ignoreLocation
} = {}) {
  if (t.length > te)
    throw new Error(Wa(te));
  const h = t.length, d = i.length, u = Math.max(0, Math.min(s, d));
  let f = o, p = u;
  const g = a > 1 || l, m = g ? Array(d) : [];
  let b;
  for (; (b = i.indexOf(t, p)) > -1; ) {
    let S = Ze(t, {
      currentLocation: b,
      expectedLocation: u,
      distance: n,
      ignoreLocation: c
    });
    if (f = Math.min(S, f), p = b + h, g) {
      let w = 0;
      for (; w < h; )
        m[b + w] = 1, w += 1;
    }
  }
  p = -1;
  let _ = [], v = 1, x = h + d;
  const y = 1 << h - 1;
  for (let S = 0; S < h; S += 1) {
    let w = 0, C = x;
    for (; w < C; )
      Ze(t, {
        errors: S,
        currentLocation: u + C,
        expectedLocation: u,
        distance: n,
        ignoreLocation: c
      }) <= f ? w = C : x = C, C = Math.floor((x - w) / 2 + w);
    x = C;
    let D = Math.max(1, u - C + 1), O = r ? d : Math.min(u + C, d) + h, T = Array(O + 2);
    T[O + 1] = (1 << S) - 1;
    for (let H = O; H >= D; H -= 1) {
      let R = H - 1, B = e[i.charAt(R)];
      if (g && (m[R] = +!!B), T[H] = (T[H + 1] << 1 | 1) & B, S && (T[H] |= (_[H + 1] | _[H]) << 1 | 1 | _[H + 1]), T[H] & y && (v = Ze(t, {
        errors: S,
        currentLocation: R,
        expectedLocation: u,
        distance: n,
        ignoreLocation: c
      }), v <= f)) {
        if (f = v, p = R, p <= u)
          break;
        D = Math.max(1, 2 * u - p);
      }
    }
    if (Ze(t, {
      errors: S + 1,
      currentLocation: u,
      expectedLocation: u,
      distance: n,
      ignoreLocation: c
    }) > f)
      break;
    _ = T;
  }
  const M = {
    isMatch: p >= 0,
    // Count exact matches (those with a score of 0) to be "almost" exact
    score: Math.max(1e-3, v)
  };
  if (g) {
    const S = tl(m, a);
    S.length ? l && (M.indices = S) : M.isMatch = !1;
  }
  return M;
}
function il(i) {
  let t = {};
  for (let e = 0, s = i.length; e < s; e += 1) {
    const n = i.charAt(e);
    t[n] = (t[n] || 0) | 1 << s - e - 1;
  }
  return t;
}
class Go {
  constructor(t, {
    location: e = A.location,
    threshold: s = A.threshold,
    distance: n = A.distance,
    includeMatches: o = A.includeMatches,
    findAllMatches: r = A.findAllMatches,
    minMatchCharLength: a = A.minMatchCharLength,
    isCaseSensitive: l = A.isCaseSensitive,
    ignoreLocation: c = A.ignoreLocation
  } = {}) {
    if (this.options = {
      location: e,
      threshold: s,
      distance: n,
      includeMatches: o,
      findAllMatches: r,
      minMatchCharLength: a,
      isCaseSensitive: l,
      ignoreLocation: c
    }, this.pattern = l ? t : t.toLowerCase(), this.chunks = [], !this.pattern.length)
      return;
    const h = (u, f) => {
      this.chunks.push({
        pattern: u,
        alphabet: il(u),
        startIndex: f
      });
    }, d = this.pattern.length;
    if (d > te) {
      let u = 0;
      const f = d % te, p = d - f;
      for (; u < p; )
        h(this.pattern.substr(u, te), u), u += te;
      if (f) {
        const g = d - te;
        h(this.pattern.substr(g), g);
      }
    } else
      h(this.pattern, 0);
  }
  searchIn(t) {
    const {
      isCaseSensitive: e,
      includeMatches: s
    } = this.options;
    if (e || (t = t.toLowerCase()), this.pattern === t) {
      let p = {
        isMatch: !0,
        score: 0
      };
      return s && (p.indices = [[0, t.length - 1]]), p;
    }
    const {
      location: n,
      distance: o,
      threshold: r,
      findAllMatches: a,
      minMatchCharLength: l,
      ignoreLocation: c
    } = this.options;
    let h = [], d = 0, u = !1;
    this.chunks.forEach(({
      pattern: p,
      alphabet: g,
      startIndex: m
    }) => {
      const {
        isMatch: b,
        score: _,
        indices: v
      } = el(t, p, g, {
        location: n + m,
        distance: o,
        threshold: r,
        findAllMatches: a,
        minMatchCharLength: l,
        includeMatches: s,
        ignoreLocation: c
      });
      b && (u = !0), d += _, b && v && (h = [...h, ...v]);
    });
    let f = {
      isMatch: u,
      score: u ? d / this.chunks.length : 1
    };
    return u && s && (f.indices = h), f;
  }
}
class $t {
  constructor(t) {
    this.pattern = t;
  }
  static isMultiMatch(t) {
    return cn(t, this.multiRegex);
  }
  static isSingleMatch(t) {
    return cn(t, this.singleRegex);
  }
  search() {
  }
}
function cn(i, t) {
  const e = i.match(t);
  return e ? e[1] : null;
}
class sl extends $t {
  constructor(t) {
    super(t);
  }
  static get type() {
    return "exact";
  }
  static get multiRegex() {
    return /^="(.*)"$/;
  }
  static get singleRegex() {
    return /^=(.*)$/;
  }
  search(t) {
    const e = t === this.pattern;
    return {
      isMatch: e,
      score: e ? 0 : 1,
      indices: [0, this.pattern.length - 1]
    };
  }
}
class nl extends $t {
  constructor(t) {
    super(t);
  }
  static get type() {
    return "inverse-exact";
  }
  static get multiRegex() {
    return /^!"(.*)"$/;
  }
  static get singleRegex() {
    return /^!(.*)$/;
  }
  search(t) {
    const s = t.indexOf(this.pattern) === -1;
    return {
      isMatch: s,
      score: s ? 0 : 1,
      indices: [0, t.length - 1]
    };
  }
}
class ol extends $t {
  constructor(t) {
    super(t);
  }
  static get type() {
    return "prefix-exact";
  }
  static get multiRegex() {
    return /^\^"(.*)"$/;
  }
  static get singleRegex() {
    return /^\^(.*)$/;
  }
  search(t) {
    const e = t.startsWith(this.pattern);
    return {
      isMatch: e,
      score: e ? 0 : 1,
      indices: [0, this.pattern.length - 1]
    };
  }
}
class rl extends $t {
  constructor(t) {
    super(t);
  }
  static get type() {
    return "inverse-prefix-exact";
  }
  static get multiRegex() {
    return /^!\^"(.*)"$/;
  }
  static get singleRegex() {
    return /^!\^(.*)$/;
  }
  search(t) {
    const e = !t.startsWith(this.pattern);
    return {
      isMatch: e,
      score: e ? 0 : 1,
      indices: [0, t.length - 1]
    };
  }
}
class al extends $t {
  constructor(t) {
    super(t);
  }
  static get type() {
    return "suffix-exact";
  }
  static get multiRegex() {
    return /^"(.*)"\$$/;
  }
  static get singleRegex() {
    return /^(.*)\$$/;
  }
  search(t) {
    const e = t.endsWith(this.pattern);
    return {
      isMatch: e,
      score: e ? 0 : 1,
      indices: [t.length - this.pattern.length, t.length - 1]
    };
  }
}
class ll extends $t {
  constructor(t) {
    super(t);
  }
  static get type() {
    return "inverse-suffix-exact";
  }
  static get multiRegex() {
    return /^!"(.*)"\$$/;
  }
  static get singleRegex() {
    return /^!(.*)\$$/;
  }
  search(t) {
    const e = !t.endsWith(this.pattern);
    return {
      isMatch: e,
      score: e ? 0 : 1,
      indices: [0, t.length - 1]
    };
  }
}
class qo extends $t {
  constructor(t, {
    location: e = A.location,
    threshold: s = A.threshold,
    distance: n = A.distance,
    includeMatches: o = A.includeMatches,
    findAllMatches: r = A.findAllMatches,
    minMatchCharLength: a = A.minMatchCharLength,
    isCaseSensitive: l = A.isCaseSensitive,
    ignoreLocation: c = A.ignoreLocation
  } = {}) {
    super(t), this._bitapSearch = new Go(t, {
      location: e,
      threshold: s,
      distance: n,
      includeMatches: o,
      findAllMatches: r,
      minMatchCharLength: a,
      isCaseSensitive: l,
      ignoreLocation: c
    });
  }
  static get type() {
    return "fuzzy";
  }
  static get multiRegex() {
    return /^"(.*)"$/;
  }
  static get singleRegex() {
    return /^(.*)$/;
  }
  search(t) {
    return this._bitapSearch.searchIn(t);
  }
}
class Jo extends $t {
  constructor(t) {
    super(t);
  }
  static get type() {
    return "include";
  }
  static get multiRegex() {
    return /^'"(.*)"$/;
  }
  static get singleRegex() {
    return /^'(.*)$/;
  }
  search(t) {
    let e = 0, s;
    const n = [], o = this.pattern.length;
    for (; (s = t.indexOf(this.pattern, e)) > -1; )
      e = s + o, n.push([s, e - 1]);
    const r = !!n.length;
    return {
      isMatch: r,
      score: r ? 0 : 1,
      indices: n
    };
  }
}
const rs = [sl, Jo, ol, rl, ll, al, nl, qo], hn = rs.length, cl = / +(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/, hl = "|";
function dl(i, t = {}) {
  return i.split(hl).map((e) => {
    let s = e.trim().split(cl).filter((o) => o && !!o.trim()), n = [];
    for (let o = 0, r = s.length; o < r; o += 1) {
      const a = s[o];
      let l = !1, c = -1;
      for (; !l && ++c < hn; ) {
        const h = rs[c];
        let d = h.isMultiMatch(a);
        d && (n.push(new h(d, t)), l = !0);
      }
      if (!l)
        for (c = -1; ++c < hn; ) {
          const h = rs[c];
          let d = h.isSingleMatch(a);
          if (d) {
            n.push(new h(d, t));
            break;
          }
        }
    }
    return n;
  });
}
const ul = /* @__PURE__ */ new Set([qo.type, Jo.type]);
class fl {
  constructor(t, {
    isCaseSensitive: e = A.isCaseSensitive,
    includeMatches: s = A.includeMatches,
    minMatchCharLength: n = A.minMatchCharLength,
    ignoreLocation: o = A.ignoreLocation,
    findAllMatches: r = A.findAllMatches,
    location: a = A.location,
    threshold: l = A.threshold,
    distance: c = A.distance
  } = {}) {
    this.query = null, this.options = {
      isCaseSensitive: e,
      includeMatches: s,
      minMatchCharLength: n,
      findAllMatches: r,
      ignoreLocation: o,
      location: a,
      threshold: l,
      distance: c
    }, this.pattern = e ? t : t.toLowerCase(), this.query = dl(this.pattern, this.options);
  }
  static condition(t, e) {
    return e.useExtendedSearch;
  }
  searchIn(t) {
    const e = this.query;
    if (!e)
      return {
        isMatch: !1,
        score: 1
      };
    const {
      includeMatches: s,
      isCaseSensitive: n
    } = this.options;
    t = n ? t : t.toLowerCase();
    let o = 0, r = [], a = 0;
    for (let l = 0, c = e.length; l < c; l += 1) {
      const h = e[l];
      r.length = 0, o = 0;
      for (let d = 0, u = h.length; d < u; d += 1) {
        const f = h[d], {
          isMatch: p,
          indices: g,
          score: m
        } = f.search(t);
        if (p) {
          if (o += 1, a += m, s) {
            const b = f.constructor.type;
            ul.has(b) ? r = [...r, ...g] : r.push(g);
          }
        } else {
          a = 0, o = 0, r.length = 0;
          break;
        }
      }
      if (o) {
        let d = {
          isMatch: !0,
          score: a / o
        };
        return s && (d.indices = r), d;
      }
    }
    return {
      isMatch: !1,
      score: 1
    };
  }
}
const as = [];
function pl(...i) {
  as.push(...i);
}
function ls(i, t) {
  for (let e = 0, s = as.length; e < s; e += 1) {
    let n = as[e];
    if (n.condition(i, t))
      return new n(i, t);
  }
  return new Go(i, t);
}
const wi = {
  AND: "$and",
  OR: "$or"
}, cs = {
  PATH: "$path",
  PATTERN: "$val"
}, hs = (i) => !!(i[wi.AND] || i[wi.OR]), gl = (i) => !!i[cs.PATH], ml = (i) => !Tt(i) && Yo(i) && !hs(i), dn = (i) => ({
  [wi.AND]: Object.keys(i).map((t) => ({
    [t]: i[t]
  }))
});
function Qo(i, t, {
  auto: e = !0
} = {}) {
  const s = (n) => {
    let o = Object.keys(n);
    const r = gl(n);
    if (!r && o.length > 1 && !hs(n))
      return s(dn(n));
    if (ml(n)) {
      const l = r ? n[cs.PATH] : o[0], c = r ? n[cs.PATTERN] : n[l];
      if (!xt(c))
        throw new Error(Va(l));
      const h = {
        keyId: os(l),
        pattern: c
      };
      return e && (h.searcher = ls(c, t)), h;
    }
    let a = {
      children: [],
      operator: o[0]
    };
    return o.forEach((l) => {
      const c = n[l];
      Tt(c) && c.forEach((h) => {
        a.children.push(s(h));
      });
    }), a;
  };
  return hs(i) || (i = dn(i)), s(i);
}
function bl(i, {
  ignoreFieldNorm: t = A.ignoreFieldNorm
}) {
  i.forEach((e) => {
    let s = 1;
    e.matches.forEach(({
      key: n,
      norm: o,
      score: r
    }) => {
      const a = n ? n.weight : null;
      s *= Math.pow(r === 0 && a ? Number.EPSILON : r, (a || 1) * (t ? 1 : o));
    }), e.score = s;
  });
}
function _l(i, t) {
  const e = i.matches;
  t.matches = [], ht(e) && e.forEach((s) => {
    if (!ht(s.indices) || !s.indices.length)
      return;
    const {
      indices: n,
      value: o
    } = s;
    let r = {
      indices: n,
      value: o
    };
    s.key && (r.key = s.key.src), s.idx > -1 && (r.refIndex = s.idx), t.matches.push(r);
  });
}
function yl(i, t) {
  t.score = i.score;
}
function vl(i, t, {
  includeMatches: e = A.includeMatches,
  includeScore: s = A.includeScore
} = {}) {
  const n = [];
  return e && n.push(_l), s && n.push(yl), i.map((o) => {
    const {
      idx: r
    } = o, a = {
      item: t[r],
      refIndex: r
    };
    return n.length && n.forEach((l) => {
      l(o, a);
    }), a;
  });
}
class be {
  constructor(t, e = {}, s) {
    this.options = ue(ue({}, A), e), this.options.useExtendedSearch, this._keyStore = new Ya(this.options.keys), this.setCollection(t, s);
  }
  setCollection(t, e) {
    if (this._docs = t, e && !(e instanceof Ps))
      throw new Error(Ha);
    this._myIndex = e || Xo(this.options.keys, this._docs, {
      getFn: this.options.getFn,
      fieldNormWeight: this.options.fieldNormWeight
    });
  }
  add(t) {
    ht(t) && (this._docs.push(t), this._myIndex.add(t));
  }
  remove(t = () => !1) {
    const e = [];
    for (let s = 0, n = this._docs.length; s < n; s += 1) {
      const o = this._docs[s];
      t(o, s) && (this.removeAt(s), s -= 1, n -= 1, e.push(o));
    }
    return e;
  }
  removeAt(t) {
    this._docs.splice(t, 1), this._myIndex.removeAt(t);
  }
  getIndex() {
    return this._myIndex;
  }
  search(t, {
    limit: e = -1
  } = {}) {
    const {
      includeMatches: s,
      includeScore: n,
      shouldSort: o,
      sortFn: r,
      ignoreFieldNorm: a
    } = this.options;
    let l = xt(t) ? xt(this._docs[0]) ? this._searchStringList(t) : this._searchObjectList(t) : this._searchLogical(t);
    return bl(l, {
      ignoreFieldNorm: a
    }), o && l.sort(r), $o(e) && e > -1 && (l = l.slice(0, e)), vl(l, this._docs, {
      includeMatches: s,
      includeScore: n
    });
  }
  _searchStringList(t) {
    const e = ls(t, this.options), {
      records: s
    } = this._myIndex, n = [];
    return s.forEach(({
      v: o,
      i: r,
      n: a
    }) => {
      if (!ht(o))
        return;
      const {
        isMatch: l,
        score: c,
        indices: h
      } = e.searchIn(o);
      l && n.push({
        item: o,
        idx: r,
        matches: [{
          score: c,
          value: o,
          norm: a,
          indices: h
        }]
      });
    }), n;
  }
  _searchLogical(t) {
    const e = Qo(t, this.options), s = (a, l, c) => {
      if (!a.children) {
        const {
          keyId: d,
          searcher: u
        } = a, f = this._findMatches({
          key: this._keyStore.get(d),
          value: this._myIndex.getValueForItemAtKeyId(l, d),
          searcher: u
        });
        return f && f.length ? [{
          idx: c,
          item: l,
          matches: f
        }] : [];
      }
      const h = [];
      for (let d = 0, u = a.children.length; d < u; d += 1) {
        const f = a.children[d], p = s(f, l, c);
        if (p.length)
          h.push(...p);
        else if (a.operator === wi.AND)
          return [];
      }
      return h;
    }, n = this._myIndex.records, o = {}, r = [];
    return n.forEach(({
      $: a,
      i: l
    }) => {
      if (ht(a)) {
        let c = s(e, a, l);
        c.length && (o[l] || (o[l] = {
          idx: l,
          item: a,
          matches: []
        }, r.push(o[l])), c.forEach(({
          matches: h
        }) => {
          o[l].matches.push(...h);
        }));
      }
    }), r;
  }
  _searchObjectList(t) {
    const e = ls(t, this.options), {
      keys: s,
      records: n
    } = this._myIndex, o = [];
    return n.forEach(({
      $: r,
      i: a
    }) => {
      if (!ht(r))
        return;
      let l = [];
      s.forEach((c, h) => {
        l.push(...this._findMatches({
          key: c,
          value: r[h],
          searcher: e
        }));
      }), l.length && o.push({
        idx: a,
        item: r,
        matches: l
      });
    }), o;
  }
  _findMatches({
    key: t,
    value: e,
    searcher: s
  }) {
    if (!ht(e))
      return [];
    let n = [];
    if (Tt(e))
      e.forEach(({
        v: o,
        i: r,
        n: a
      }) => {
        if (!ht(o))
          return;
        const {
          isMatch: l,
          score: c,
          indices: h
        } = s.searchIn(o);
        l && n.push({
          score: c,
          key: t,
          value: o,
          idx: r,
          norm: a,
          indices: h
        });
      });
    else {
      const {
        v: o,
        n: r
      } = e, {
        isMatch: a,
        score: l,
        indices: c
      } = s.searchIn(o);
      a && n.push({
        score: l,
        key: t,
        value: o,
        norm: r,
        indices: c
      });
    }
    return n;
  }
}
be.version = "7.0.0";
be.createIndex = Xo;
be.parseIndex = Za;
be.config = A;
be.parseQuery = Qo;
pl(fl);
var xl = (
  /** @class */
  (function() {
    function i(t) {
      this._haystack = [], this._fuseOptions = at(at({}, t.fuseOptions), { keys: na([], t.searchFields), includeMatches: !0 });
    }
    return i.prototype.index = function(t) {
      this._haystack = t, this._fuse && this._fuse.setCollection(t);
    }, i.prototype.reset = function() {
      this._haystack = [], this._fuse = void 0;
    }, i.prototype.isEmptyIndex = function() {
      return !this._haystack.length;
    }, i.prototype.search = function(t) {
      this._fuse || (this._fuse = new be(this._haystack, this._fuseOptions));
      var e = this._fuse.search(t);
      return e.map(function(s, n) {
        return {
          item: s.item,
          score: s.score || 0,
          rank: n + 1
          // If value.score is used for sorting, this can create non-stable sorts!
        };
      });
    }, i;
  })()
);
function Sl(i) {
  return new xl(i);
}
var wl = function(i) {
  for (var t in i)
    if (Object.prototype.hasOwnProperty.call(i, t))
      return !1;
  return !0;
}, Wi = function(i, t, e) {
  var s = i.dataset, n = t.customProperties, o = t.labelClass, r = t.labelDescription;
  o && (s.labelClass = Ti(o).join(" ")), r && (s.labelDescription = vt(r)), e && n && (typeof n == "string" ? s.customProperties = n : typeof n == "object" && !wl(n) && (s.customProperties = JSON.stringify(n)));
}, un = function(i, t, e) {
  var s = t && i.querySelector("label[for='".concat(t, "']")), n = s && s.innerText;
  n && e.setAttribute("aria-label", n);
}, Ml = {
  containerOuter: function(i, t, e, s, n, o, r) {
    var a = i.classNames.containerOuter, l = document.createElement("div");
    return P(l, a), l.dataset.type = o, t && (l.dir = t), s && (l.tabIndex = 0), e && (l.setAttribute("role", n ? "combobox" : "listbox"), n ? l.setAttribute("aria-autocomplete", "list") : r || un(this._docRoot, this.passedElement.element.id, l), l.setAttribute("aria-haspopup", "true"), l.setAttribute("aria-expanded", "false")), r && l.setAttribute("aria-labelledby", r), l;
  },
  containerInner: function(i) {
    var t = i.classNames.containerInner, e = document.createElement("div");
    return P(e, t), e;
  },
  itemList: function(i, t) {
    var e = i.searchEnabled, s = i.classNames, n = s.list, o = s.listSingle, r = s.listItems, a = document.createElement("div");
    return P(a, n), P(a, t ? o : r), this._isSelectElement && e && a.setAttribute("role", "listbox"), a;
  },
  placeholder: function(i, t) {
    var e = i.allowHTML, s = i.classNames.placeholder, n = document.createElement("div");
    return P(n, s), wt(n, e, t), n;
  },
  item: function(i, t, e) {
    var s = i.allowHTML, n = i.removeItemButtonAlignLeft, o = i.removeItemIconText, r = i.removeItemLabelText, a = i.classNames, l = a.item, c = a.button, h = a.highlightedState, d = a.itemSelectable, u = a.placeholder, f = vt(t.value), p = document.createElement("div");
    if (P(p, l), t.labelClass) {
      var g = document.createElement("span");
      wt(g, s, t.label), P(g, t.labelClass), p.appendChild(g);
    } else
      wt(p, s, t.label);
    if (p.dataset.item = "", p.dataset.id = t.id, p.dataset.value = f, Wi(p, t, !0), (t.disabled || this.containerOuter.isDisabled) && p.setAttribute("aria-disabled", "true"), this._isSelectElement && (p.setAttribute("aria-selected", "true"), p.setAttribute("role", "option")), t.placeholder && (P(p, u), p.dataset.placeholder = ""), P(p, t.highlighted ? h : d), e) {
      t.disabled && ft(p, d), p.dataset.deletable = "";
      var m = document.createElement("button");
      m.type = "button", P(m, c);
      var b = mt(t);
      wt(m, !0, Ie(o, t.value, b));
      var _ = Ie(r, t.value, b);
      _ && m.setAttribute("aria-label", _), m.dataset.button = "", n ? p.insertAdjacentElement("afterbegin", m) : p.appendChild(m);
    }
    return p;
  },
  choiceList: function(i, t) {
    var e = i.classNames.list, s = document.createElement("div");
    return P(s, e), t || s.setAttribute("aria-multiselectable", "true"), s.setAttribute("role", "listbox"), s;
  },
  choiceGroup: function(i, t) {
    var e = i.allowHTML, s = i.classNames, n = s.group, o = s.groupHeading, r = s.itemDisabled, a = t.id, l = t.label, c = t.disabled, h = vt(l), d = document.createElement("div");
    P(d, n), c && P(d, r), d.setAttribute("role", "group"), d.dataset.group = "", d.dataset.id = a, d.dataset.value = h, c && d.setAttribute("aria-disabled", "true");
    var u = document.createElement("div");
    return P(u, o), wt(u, e, l || ""), d.appendChild(u), d;
  },
  choice: function(i, t, e, s) {
    var n = i.allowHTML, o = i.classNames, r = o.item, a = o.itemChoice, l = o.itemSelectable, c = o.selectedState, h = o.itemDisabled, d = o.description, u = o.placeholder, f = t.label, p = vt(t.value), g = document.createElement("div");
    g.id = t.elementId, P(g, r), P(g, a), s && typeof f == "string" && (f = Os(n, f), f += " (".concat(s, ")"), f = { trusted: f });
    var m = g;
    if (t.labelClass) {
      var b = document.createElement("span");
      wt(b, n, f), P(b, t.labelClass), m = b, g.appendChild(b);
    } else
      wt(g, n, f);
    if (t.labelDescription) {
      var _ = "".concat(t.elementId, "-description");
      m.setAttribute("aria-describedby", _);
      var v = document.createElement("span");
      wt(v, n, t.labelDescription), v.id = _, P(v, d), g.appendChild(v);
    }
    return t.selected && P(g, c), t.placeholder && P(g, u), g.setAttribute("role", t.group ? "treeitem" : "option"), g.dataset.choice = "", g.dataset.id = t.id, g.dataset.value = p, e && (g.dataset.selectText = e), t.group && (g.dataset.groupId = "".concat(t.group.id)), Wi(g, t, !1), t.disabled ? (P(g, h), g.dataset.choiceDisabled = "", g.setAttribute("aria-disabled", "true")) : (P(g, l), g.dataset.choiceSelectable = "", g.setAttribute("aria-selected", t.selected ? "true" : "false")), g;
  },
  input: function(i, t) {
    var e = i.classNames, s = e.input, n = e.inputCloned, o = i.labelId, r = document.createElement("input");
    return r.type = "search", P(r, s), P(r, n), r.autocomplete = "off", r.autocapitalize = "off", r.spellcheck = !1, r.setAttribute("aria-autocomplete", "list"), t ? r.setAttribute("aria-label", t) : o || un(this._docRoot, this.passedElement.element.id, r), r;
  },
  dropdown: function(i) {
    var t = i.classNames, e = t.list, s = t.listDropdown, n = document.createElement("div");
    return P(n, e), P(n, s), n.setAttribute("aria-expanded", "false"), n;
  },
  notice: function(i, t, e) {
    var s = i.classNames, n = s.item, o = s.itemChoice, r = s.addChoice, a = s.noResults, l = s.noChoices, c = s.notice;
    e === void 0 && (e = J.generic);
    var h = document.createElement("div");
    switch (wt(h, !0, t), P(h, n), P(h, o), P(h, c), e) {
      case J.addChoice:
        P(h, r);
        break;
      case J.noResults:
        P(h, a);
        break;
      case J.noChoices:
        P(h, l);
        break;
    }
    return e === J.addChoice && (h.dataset.choiceSelectable = "", h.dataset.choice = ""), h;
  },
  option: function(i) {
    var t = vt(i.label), e = new Option(t, i.value, !1, i.selected);
    return Wi(e, i, !0), e.disabled = i.disabled, i.selected && e.setAttribute("selected", ""), e;
  }
}, El = "-ms-scroll-limit" in document.documentElement.style && "-ms-ime-align" in document.documentElement.style, Cl = {}, ji = function(i) {
  if (i)
    return i.dataset.id ? parseInt(i.dataset.id, 10) : void 0;
}, ve = "[data-choice-selectable]", Al = (
  /** @class */
  (function() {
    function i(t, e) {
      t === void 0 && (t = "[data-choice]"), e === void 0 && (e = {});
      var s = this;
      this.initialisedOK = void 0, this._hasNonChoicePlaceholder = !1, this._lastAddedChoiceId = 0, this._lastAddedGroupId = 0;
      var n = i.defaults;
      this.config = at(at(at({}, n.allOptions), n.options), e), oa.forEach(function(b) {
        s.config[b] = at(at(at({}, n.allOptions[b]), n.options[b]), e[b]);
      });
      var o = this.config;
      o.silent || this._validateConfig();
      var r = o.shadowRoot || document.documentElement;
      this._docRoot = r;
      var a = typeof t == "string" ? r.querySelector(t) : t;
      if (!a || typeof a != "object" || !(Ma(a) || jo(a)))
        throw TypeError(!a && typeof t == "string" ? "Selector ".concat(t, " failed to find an element") : "Expected one of the following types text|select-one|select-multiple");
      var l = a.type, c = l === Rt.Text;
      (c || o.maxItemCount !== 1) && (o.singleModeForMultiSelect = !1), o.singleModeForMultiSelect && (l = Rt.SelectMultiple);
      var h = l === Rt.SelectOne, d = l === Rt.SelectMultiple, u = h || d;
      if (this._elementType = l, this._isTextElement = c, this._isSelectOneElement = h, this._isSelectMultipleElement = d, this._isSelectElement = h || d, this._canAddUserChoices = c && o.addItems || u && o.addChoices, typeof o.renderSelectedChoices != "boolean" && (o.renderSelectedChoices = o.renderSelectedChoices === "always" || h), o.closeDropdownOnSelect === "auto" ? o.closeDropdownOnSelect = c || h || o.singleModeForMultiSelect : o.closeDropdownOnSelect = Ce(o.closeDropdownOnSelect), o.placeholder && (o.placeholderValue ? this._hasNonChoicePlaceholder = !0 : a.dataset.placeholder && (this._hasNonChoicePlaceholder = !0, o.placeholderValue = a.dataset.placeholder)), e.addItemFilter && typeof e.addItemFilter != "function") {
        var f = e.addItemFilter instanceof RegExp ? e.addItemFilter : new RegExp(e.addItemFilter);
        o.addItemFilter = f.test.bind(f);
      }
      if (this._isTextElement)
        this.passedElement = new wa({
          element: a,
          classNames: o.classNames
        });
      else {
        var p = a;
        this.passedElement = new Aa({
          element: p,
          classNames: o.classNames,
          template: function(b) {
            return s._templates.option(b);
          },
          extractPlaceholder: o.placeholder && !this._hasNonChoicePlaceholder
        });
      }
      if (this.initialised = !1, this._store = new Ta(o), this._currentValue = "", o.searchEnabled = !c && o.searchEnabled, this._canSearch = o.searchEnabled, this._isScrollingOnIe = !1, this._highlightPosition = 0, this._wasTap = !0, this._placeholderValue = this._generatePlaceholderValue(), this._baseId = da(a, "choices-"), this._direction = a.dir, !this._direction) {
        var g = window.getComputedStyle(a).direction, m = window.getComputedStyle(document.documentElement).direction;
        g !== m && (this._direction = g);
      }
      if (this._idNames = {
        itemChoice: "item-choice"
      }, this._templates = n.templates, this._render = this._render.bind(this), this._onFocus = this._onFocus.bind(this), this._onBlur = this._onBlur.bind(this), this._onKeyUp = this._onKeyUp.bind(this), this._onKeyDown = this._onKeyDown.bind(this), this._onInput = this._onInput.bind(this), this._onClick = this._onClick.bind(this), this._onTouchMove = this._onTouchMove.bind(this), this._onTouchEnd = this._onTouchEnd.bind(this), this._onMouseDown = this._onMouseDown.bind(this), this._onMouseOver = this._onMouseOver.bind(this), this._onFormReset = this._onFormReset.bind(this), this._onSelectKey = this._onSelectKey.bind(this), this._onEnterKey = this._onEnterKey.bind(this), this._onEscapeKey = this._onEscapeKey.bind(this), this._onDirectionKey = this._onDirectionKey.bind(this), this._onDeleteKey = this._onDeleteKey.bind(this), this._onChange = this._onChange.bind(this), this._onInvalid = this._onInvalid.bind(this), this.passedElement.isActive) {
        o.silent || console.warn("Trying to initialise Choices on element already initialised", { element: t }), this.initialised = !0, this.initialisedOK = !1;
        return;
      }
      this.init(), this._initialItems = this._store.items.map(function(b) {
        return b.value;
      });
    }
    return Object.defineProperty(i, "defaults", {
      get: function() {
        return Object.preventExtensions({
          get options() {
            return Cl;
          },
          get allOptions() {
            return sn;
          },
          get templates() {
            return Ml;
          }
        });
      },
      enumerable: !1,
      configurable: !0
    }), i.prototype.init = function() {
      if (!(this.initialised || this.initialisedOK !== void 0)) {
        this._searcher = Sl(this.config), this._loadChoices(), this._createTemplates(), this._createElements(), this._createStructure(), this._isTextElement && !this.config.addItems || this.passedElement.element.hasAttribute("disabled") || this.passedElement.element.closest("fieldset:disabled") ? this.disable() : (this.enable(), this._addEventListeners()), this._initStore(), this.initialised = !0, this.initialisedOK = !0;
        var t = this.config.callbackOnInit;
        typeof t == "function" && t.call(this);
      }
    }, i.prototype.destroy = function() {
      this.initialised && (this._removeEventListeners(), this.passedElement.reveal(), this.containerOuter.unwrap(this.passedElement.element), this._store._listeners = [], this.clearStore(!1), this._stopSearch(), this._templates = i.defaults.templates, this.initialised = !1, this.initialisedOK = void 0);
    }, i.prototype.enable = function() {
      return this.passedElement.isDisabled && this.passedElement.enable(), this.containerOuter.isDisabled && (this._addEventListeners(), this.input.enable(), this.containerOuter.enable()), this;
    }, i.prototype.disable = function() {
      return this.passedElement.isDisabled || this.passedElement.disable(), this.containerOuter.isDisabled || (this._removeEventListeners(), this.input.disable(), this.containerOuter.disable()), this;
    }, i.prototype.highlightItem = function(t, e) {
      if (e === void 0 && (e = !0), !t || !t.id)
        return this;
      var s = this._store.items.find(function(n) {
        return n.id === t.id;
      });
      return !s || s.highlighted ? this : (this._store.dispatch(Qe(s, !0)), e && this.passedElement.triggerEvent(ot.highlightItem, mt(s)), this);
    }, i.prototype.unhighlightItem = function(t, e) {
      if (e === void 0 && (e = !0), !t || !t.id)
        return this;
      var s = this._store.items.find(function(n) {
        return n.id === t.id;
      });
      return !s || !s.highlighted ? this : (this._store.dispatch(Qe(s, !1)), e && this.passedElement.triggerEvent(ot.unhighlightItem, mt(s)), this);
    }, i.prototype.highlightAll = function() {
      var t = this;
      return this._store.withTxn(function() {
        t._store.items.forEach(function(e) {
          e.highlighted || (t._store.dispatch(Qe(e, !0)), t.passedElement.triggerEvent(ot.highlightItem, mt(e)));
        });
      }), this;
    }, i.prototype.unhighlightAll = function() {
      var t = this;
      return this._store.withTxn(function() {
        t._store.items.forEach(function(e) {
          e.highlighted && (t._store.dispatch(Qe(e, !1)), t.passedElement.triggerEvent(ot.highlightItem, mt(e)));
        });
      }), this;
    }, i.prototype.removeActiveItemsByValue = function(t) {
      var e = this;
      return this._store.withTxn(function() {
        e._store.items.filter(function(s) {
          return s.value === t;
        }).forEach(function(s) {
          return e._removeItem(s);
        });
      }), this;
    }, i.prototype.removeActiveItems = function(t) {
      var e = this;
      return this._store.withTxn(function() {
        e._store.items.filter(function(s) {
          var n = s.id;
          return n !== t;
        }).forEach(function(s) {
          return e._removeItem(s);
        });
      }), this;
    }, i.prototype.removeHighlightedItems = function(t) {
      var e = this;
      return t === void 0 && (t = !1), this._store.withTxn(function() {
        e._store.highlightedActiveItems.forEach(function(s) {
          e._removeItem(s), t && e._triggerChange(s.value);
        });
      }), this;
    }, i.prototype.showDropdown = function(t) {
      var e = this;
      return this.dropdown.isActive ? this : (t === void 0 && (t = !this._canSearch), requestAnimationFrame(function() {
        e.dropdown.show();
        var s = e.dropdown.element.getBoundingClientRect();
        e.containerOuter.open(s.bottom, s.height), t || e.input.focus(), e.passedElement.triggerEvent(ot.showDropdown);
        var n = e.choiceList.element.querySelector(ce(e.config.classNames.selectedState));
        n !== null && !Qs(n, e.choiceList.element) && (e.choiceList.element.scrollTop = n.offsetTop);
      }), this);
    }, i.prototype.hideDropdown = function(t) {
      var e = this;
      return this.dropdown.isActive ? (this._removeHighlightedChoices(), requestAnimationFrame(function() {
        e.dropdown.hide(), e.containerOuter.close(), !t && e._canSearch && (e.input.removeActiveDescendant(), e.input.blur()), e.passedElement.triggerEvent(ot.hideDropdown);
      }), this) : this;
    }, i.prototype.getValue = function(t) {
      var e = this._store.items.map(function(s) {
        return t ? s.value : mt(s);
      });
      return this._isSelectOneElement || this.config.singleModeForMultiSelect ? e[0] : e;
    }, i.prototype.setValue = function(t) {
      var e = this;
      return this.initialisedOK ? (this._store.withTxn(function() {
        t.forEach(function(s) {
          s && e._addChoice(_t(s, !1));
        });
      }), this._searcher.reset(), this) : (this._warnChoicesInitFailed("setValue"), this);
    }, i.prototype.setChoiceByValue = function(t) {
      var e = this;
      return this.initialisedOK ? this._isTextElement ? this : (this._store.withTxn(function() {
        var s = Array.isArray(t) ? t : [t];
        s.forEach(function(n) {
          return e._findAndSelectChoiceByValue(n);
        }), e.unhighlightAll();
      }), this._searcher.reset(), this) : (this._warnChoicesInitFailed("setChoiceByValue"), this);
    }, i.prototype.setChoices = function(t, e, s, n, o, r) {
      var a = this;
      if (t === void 0 && (t = []), e === void 0 && (e = "value"), s === void 0 && (s = "label"), n === void 0 && (n = !1), o === void 0 && (o = !0), r === void 0 && (r = !1), !this.initialisedOK)
        return this._warnChoicesInitFailed("setChoices"), this;
      if (!this._isSelectElement)
        throw new TypeError("setChoices can't be used with INPUT based Choices");
      if (typeof e != "string" || !e)
        throw new TypeError("value parameter must be a name of 'value' field in passed objects");
      if (typeof t == "function") {
        var l = t(this);
        if (typeof Promise == "function" && l instanceof Promise)
          return new Promise(function(c) {
            return requestAnimationFrame(c);
          }).then(function() {
            return a._handleLoadingState(!0);
          }).then(function() {
            return l;
          }).then(function(c) {
            return a.setChoices(c, e, s, n, o, r);
          }).catch(function(c) {
            a.config.silent || console.error(c);
          }).then(function() {
            return a._handleLoadingState(!1);
          }).then(function() {
            return a;
          });
        if (!Array.isArray(l))
          throw new TypeError(".setChoices first argument function must return either array of choices or Promise, got: ".concat(typeof l));
        t = l;
      }
      if (!Array.isArray(t))
        throw new TypeError(".setChoices must be called either with array of choices with a function resulting into Promise of array of choices");
      return this.containerOuter.removeLoadingState(), this._store.withTxn(function() {
        o && (a._isSearching = !1), n && a.clearChoices(!0, r);
        var c = e === "value", h = s === "label";
        t.forEach(function(d) {
          if ("choices" in d) {
            var u = d;
            h || (u = at(at({}, u), { label: u[s] })), a._addGroup(_t(u, !0));
          } else {
            var f = d;
            (!h || !c) && (f = at(at({}, f), { value: f[e], label: f[s] }));
            var p = _t(f, !1);
            a._addChoice(p), p.placeholder && !a._hasNonChoicePlaceholder && (a._placeholderValue = Ho(p.label));
          }
        }), a.unhighlightAll();
      }), this.dropdown.isActive && this._canAddUserChoices && this._canCreateItem(this.input.value), this._searcher.reset(), this;
    }, i.prototype.refresh = function(t, e, s) {
      var n = this;
      return t === void 0 && (t = !1), e === void 0 && (e = !1), s === void 0 && (s = !1), this._isSelectElement ? (this._store.withTxn(function() {
        var o = n.passedElement.optionsAsChoices(), r = {};
        s || n._store.items.forEach(function(l) {
          l.id && l.active && l.selected && (r[l.value] = !0);
        }), n.clearStore(!1);
        var a = function(l) {
          s ? n._store.dispatch(qs(l)) : r[l.value] && (l.selected = !0);
        };
        o.forEach(function(l) {
          if ("choices" in l) {
            l.choices.forEach(a);
            return;
          }
          a(l);
        }), n._addPredefinedChoices(o, e, t), n._isSearching && n._searchChoices(n.input.value);
      }), this) : (this.config.silent || console.warn("refresh method can only be used on choices backed by a <select> element"), this);
    }, i.prototype.removeChoice = function(t) {
      var e = this._store.choices.find(function(s) {
        return s.value === t;
      });
      return e ? (this._clearNotice(), this._store.dispatch(ra(e)), this._searcher.reset(), e.selected && this.passedElement.triggerEvent(ot.removeItem, mt(e)), this) : this;
    }, i.prototype.clearChoices = function(t, e) {
      var s = this;
      return t === void 0 && (t = !0), e === void 0 && (e = !1), t && (e ? this.passedElement.element.replaceChildren("") : this.passedElement.element.querySelectorAll(":not([selected])").forEach(function(n) {
        n.remove();
      })), this.itemList.element.replaceChildren(""), this.choiceList.element.replaceChildren(""), this._clearNotice(), this._store.withTxn(function() {
        var n = e ? [] : s._store.items;
        s._store.reset(), n.forEach(function(o) {
          s._store.dispatch(Xs(o)), s._store.dispatch(Gs(o));
        });
      }), this._searcher.reset(), this;
    }, i.prototype.clearStore = function(t) {
      return t === void 0 && (t = !0), this.clearChoices(t, !0), this._stopSearch(), this._lastAddedChoiceId = 0, this._lastAddedGroupId = 0, this;
    }, i.prototype.clearInput = function() {
      var t = !this._isSelectOneElement;
      return this.input.clear(t), this._stopSearch(), this;
    }, i.prototype._validateConfig = function() {
      var t = this.config, e = ba(t, sn);
      e.length && console.warn("Unknown config option(s) passed", e.join(", ")), t.allowHTML && t.allowHtmlUserInput && (t.addItems && console.warn("Warning: allowHTML/allowHtmlUserInput/addItems all being true is strongly not recommended and may lead to XSS attacks"), t.addChoices && console.warn("Warning: allowHTML/allowHtmlUserInput/addChoices all being true is strongly not recommended and may lead to XSS attacks"));
    }, i.prototype._render = function(t) {
      t === void 0 && (t = { choices: !0, groups: !0, items: !0 }), !this._store.inTxn() && (this._isSelectElement && (t.choices || t.groups) && this._renderChoices(), t.items && this._renderItems());
    }, i.prototype._renderChoices = function() {
      var t = this;
      if (this._canAddItems()) {
        var e = this, s = e.config, n = e._isSearching, o = this._store, r = o.activeGroups, a = o.activeChoices, l = n ? s.searchResultLimit : s.renderChoiceLimit;
        if (this._isSelectElement) {
          var c = a.filter(function(m) {
            return !m.element;
          });
          c.length && this.passedElement.addOptions(c);
        }
        var h = document.createDocumentFragment(), d = function(m) {
          return m.filter(function(b) {
            return !b.placeholder && (n ? (s.searchRenderSelectedChoices || !b.selected) && !!b.rank : s.renderSelectedChoices || !b.selected);
          });
        }, u = s.appendGroupInSearch && n, f = !1, p = null, g = function(m, b) {
          n ? m.sort(ga) : s.shouldSort && m.sort(s.sorter);
          var _ = m.length;
          _ = !b && l > 0 && _ > l ? l : _, _--, m.every(function(v, x) {
            var y = v.choiceEl || t._templates.choice(s, v, s.itemSelectText, u && v.group ? v.group.label : void 0);
            return v.choiceEl = y, h.appendChild(y), n || !v.selected ? f = !0 : p || (p = y), x < _;
          });
        };
        a.length && (s.resetScrollPosition && requestAnimationFrame(function() {
          return t.choiceList.scrollToTop();
        }), !this._hasNonChoicePlaceholder && !n && this._isSelectOneElement && g(a.filter(function(m) {
          return m.placeholder && !m.group;
        }), !1), r.length && !n ? (s.shouldSort && r.sort(s.sorter), g(a.filter(function(m) {
          return !m.placeholder && !m.group;
        }), !1), r.forEach(function(m) {
          var b = d(m.choices);
          if (b.length) {
            if (m.label) {
              var _ = m.groupEl || t._templates.choiceGroup(t.config, m);
              m.groupEl = _, _.remove(), h.appendChild(_);
            }
            g(b, !0);
          }
        })) : g(d(a), !1)), !f && (n || !h.children.length || !s.renderSelectedChoices) && (this._notice || (this._notice = {
          text: Zs(n ? s.noResultsText : s.noChoicesText),
          type: n ? J.noResults : J.noChoices
        }), h.replaceChildren("")), this._renderNotice(h), this.choiceList.element.replaceChildren(h), this._highlightChoice(p);
      }
    }, i.prototype._renderItems = function() {
      var t = this, e = this._store.items || [], s = this.itemList.element, n = this.config, o = document.createDocumentFragment(), r = function(d) {
        return s.querySelector('[data-item][data-id="'.concat(d.id, '"]'));
      }, a = function(d) {
        var u = d.itemEl;
        u && u.parentElement || (u = r(d) || t._templates.item(n, d, n.removeItemButton), d.itemEl = u, o.appendChild(u));
      };
      e.forEach(a);
      var l = !!o.childNodes.length;
      if (this._isSelectOneElement) {
        var c = s.children.length;
        if (l || c > 1) {
          var h = s.querySelector(ce(n.classNames.placeholder));
          h && h.remove();
        } else !l && !c && this._placeholderValue && (l = !0, a(_t({
          selected: !0,
          value: "",
          label: this._placeholderValue,
          placeholder: !0
        }, !1)));
      }
      l && (s.append(o), n.shouldSortItems && !this._isSelectOneElement && (e.sort(n.sorter), e.forEach(function(d) {
        var u = r(d);
        u && (u.remove(), o.append(u));
      }), s.append(o))), this._isTextElement && (this.passedElement.value = e.map(function(d) {
        var u = d.value;
        return u;
      }).join(n.delimiter));
    }, i.prototype._displayNotice = function(t, e, s) {
      s === void 0 && (s = !0);
      var n = this._notice;
      if (n && (n.type === e && n.text === t || n.type === J.addChoice && (e === J.noResults || e === J.noChoices))) {
        s && this.showDropdown(!0);
        return;
      }
      this._clearNotice(), this._notice = t ? {
        text: t,
        type: e
      } : void 0, this._renderNotice(), s && t && this.showDropdown(!0);
    }, i.prototype._clearNotice = function() {
      if (this._notice) {
        var t = this.choiceList.element.querySelector(ce(this.config.classNames.notice));
        t && t.remove(), this._notice = void 0;
      }
    }, i.prototype._renderNotice = function(t) {
      var e = this._notice;
      if (e) {
        var s = this._templates.notice(this.config, e.text, e.type);
        t ? t.append(s) : this.choiceList.prepend(s);
      }
    }, i.prototype._getChoiceForOutput = function(t, e) {
      return mt(t, e);
    }, i.prototype._triggerChange = function(t) {
      t != null && this.passedElement.triggerEvent(ot.change, {
        value: t
      });
    }, i.prototype._handleButtonAction = function(t) {
      var e = this, s = this._store.items;
      if (!(!s.length || !this.config.removeItems || !this.config.removeItemButton)) {
        var n = t && ji(t.closest("[data-id]")), o = n && s.find(function(r) {
          return r.id === n;
        });
        o && this._store.withTxn(function() {
          if (e._removeItem(o), e._triggerChange(o.value), e._isSelectOneElement && !e._hasNonChoicePlaceholder) {
            var r = (e.config.shouldSort ? e._store.choices.reverse() : e._store.choices).find(function(a) {
              return a.placeholder;
            });
            r && (e._addItem(r), e.unhighlightAll(), r.value && e._triggerChange(r.value));
          }
        });
      }
    }, i.prototype._handleItemAction = function(t, e) {
      var s = this;
      e === void 0 && (e = !1);
      var n = this._store.items;
      if (!(!n.length || !this.config.removeItems || this._isSelectOneElement)) {
        var o = ji(t);
        o && (n.forEach(function(r) {
          r.id === o && !r.highlighted ? s.highlightItem(r) : !e && r.highlighted && s.unhighlightItem(r);
        }), this.input.focus());
      }
    }, i.prototype._handleChoiceAction = function(t) {
      var e = this, s = ji(t), n = s && this._store.getChoiceById(s);
      if (!n || n.disabled)
        return !1;
      var o = this.dropdown.isActive;
      if (!n.selected) {
        if (!this._canAddItems())
          return !0;
        this._store.withTxn(function() {
          e._addItem(n, !0, !0), e.clearInput(), e.unhighlightAll();
        }), this._triggerChange(n.value);
      }
      return o && this.config.closeDropdownOnSelect && (this.hideDropdown(!0), this.containerOuter.element.focus()), !0;
    }, i.prototype._handleBackspace = function(t) {
      var e = this.config;
      if (!(!e.removeItems || !t.length)) {
        var s = t[t.length - 1], n = t.some(function(o) {
          return o.highlighted;
        });
        e.editItems && !n && s ? (this.input.value = s.value, this.input.setWidth(), this._removeItem(s), this._triggerChange(s.value)) : (n || this.highlightItem(s, !1), this.removeHighlightedItems(!0));
      }
    }, i.prototype._loadChoices = function() {
      var t, e = this, s = this.config;
      if (this._isTextElement) {
        if (this._presetChoices = s.items.map(function(r) {
          return _t(r, !1);
        }), this.passedElement.value) {
          var n = this.passedElement.value.split(s.delimiter).map(function(r) {
            return _t(r, !1, e.config.allowHtmlUserInput);
          });
          this._presetChoices = this._presetChoices.concat(n);
        }
        this._presetChoices.forEach(function(r) {
          r.selected = !0;
        });
      } else if (this._isSelectElement) {
        this._presetChoices = s.choices.map(function(r) {
          return _t(r, !0);
        });
        var o = this.passedElement.optionsAsChoices();
        o && (t = this._presetChoices).push.apply(t, o);
      }
    }, i.prototype._handleLoadingState = function(t) {
      t === void 0 && (t = !0);
      var e = this.itemList.element;
      t ? (this.disable(), this.containerOuter.addLoadingState(), this._isSelectOneElement ? e.replaceChildren(this._templates.placeholder(this.config, this.config.loadingText)) : this.input.placeholder = this.config.loadingText) : (this.enable(), this.containerOuter.removeLoadingState(), this._isSelectOneElement ? (e.replaceChildren(""), this._render()) : this.input.placeholder = this._placeholderValue || "");
    }, i.prototype._handleSearch = function(t) {
      if (this.input.isFocussed)
        if (t !== null && typeof t < "u" && t.length >= this.config.searchFloor) {
          var e = this.config.searchChoices ? this._searchChoices(t) : 0;
          e !== null && this.passedElement.triggerEvent(ot.search, {
            value: t,
            resultCount: e
          });
        } else this._store.choices.some(function(s) {
          return !s.active;
        }) && this._stopSearch();
    }, i.prototype._canAddItems = function() {
      var t = this.config, e = t.maxItemCount, s = t.maxItemText;
      return !t.singleModeForMultiSelect && e > 0 && e <= this._store.items.length ? (this.choiceList.element.replaceChildren(""), this._notice = void 0, this._displayNotice(typeof s == "function" ? s(e) : s, J.addChoice, !1), !1) : (this._notice && this._notice.type === J.addChoice && this._clearNotice(), !0);
    }, i.prototype._canCreateItem = function(t) {
      var e = this.config, s = !0, n = "";
      if (s && typeof e.addItemFilter == "function" && !e.addItemFilter(t) && (s = !1, n = Ie(e.customAddItemText, t, void 0)), s) {
        var o = this._store.choices.find(function(r) {
          return e.valueComparer(r.value, t);
        });
        if (o) {
          if (this._isSelectElement)
            return this._displayNotice("", J.addChoice), !1;
          e.duplicateItemsAllowed || (s = !1, n = Ie(e.uniqueItemText, t, void 0));
        }
      }
      return s && (n = Ie(e.addItemText, t, void 0)), n && this._displayNotice(n, J.addChoice), s;
    }, i.prototype._searchChoices = function(t) {
      var e = t.trim().replace(/\s{2,}/, " ");
      if (!e.length || e === this._currentValue)
        return null;
      var s = this._searcher;
      s.isEmptyIndex() && s.index(this._store.searchableChoices);
      var n = s.search(e);
      this._currentValue = e, this._highlightPosition = 0, this._isSearching = !0;
      var o = this._notice, r = o && o.type;
      return r !== J.addChoice && (n.length ? this._clearNotice() : this._displayNotice(Zs(this.config.noResultsText), J.noResults)), this._store.dispatch(aa(n)), n.length;
    }, i.prototype._stopSearch = function() {
      this._isSearching && (this._currentValue = "", this._isSearching = !1, this._clearNotice(), this._store.dispatch(la(!0)), this.passedElement.triggerEvent(ot.search, {
        value: "",
        resultCount: 0
      }));
    }, i.prototype._addEventListeners = function() {
      var t = this._docRoot, e = this.containerOuter.element, s = this.input.element, n = this.passedElement.element;
      t.addEventListener("touchend", this._onTouchEnd, !0), e.addEventListener("keydown", this._onKeyDown, !0), e.addEventListener("mousedown", this._onMouseDown, !0), t.addEventListener("click", this._onClick, { passive: !0 }), t.addEventListener("touchmove", this._onTouchMove, {
        passive: !0
      }), this.dropdown.element.addEventListener("mouseover", this._onMouseOver, {
        passive: !0
      }), this._isSelectOneElement && (e.addEventListener("focus", this._onFocus, {
        passive: !0
      }), e.addEventListener("blur", this._onBlur, {
        passive: !0
      })), s.addEventListener("keyup", this._onKeyUp, {
        passive: !0
      }), s.addEventListener("input", this._onInput, {
        passive: !0
      }), s.addEventListener("focus", this._onFocus, {
        passive: !0
      }), s.addEventListener("blur", this._onBlur, {
        passive: !0
      }), s.form && s.form.addEventListener("reset", this._onFormReset, {
        passive: !0
      }), n.hasAttribute("required") && (n.addEventListener("change", this._onChange, {
        passive: !0
      }), n.addEventListener("invalid", this._onInvalid, {
        passive: !0
      })), this.input.addEventListeners();
    }, i.prototype._removeEventListeners = function() {
      var t = this._docRoot, e = this.containerOuter.element, s = this.input.element, n = this.passedElement.element;
      t.removeEventListener("touchend", this._onTouchEnd, !0), e.removeEventListener("keydown", this._onKeyDown, !0), e.removeEventListener("mousedown", this._onMouseDown, !0), t.removeEventListener("click", this._onClick), t.removeEventListener("touchmove", this._onTouchMove), this.dropdown.element.removeEventListener("mouseover", this._onMouseOver), this._isSelectOneElement && (e.removeEventListener("focus", this._onFocus), e.removeEventListener("blur", this._onBlur)), s.removeEventListener("keyup", this._onKeyUp), s.removeEventListener("input", this._onInput), s.removeEventListener("focus", this._onFocus), s.removeEventListener("blur", this._onBlur), s.form && s.form.removeEventListener("reset", this._onFormReset), n.hasAttribute("required") && (n.removeEventListener("change", this._onChange), n.removeEventListener("invalid", this._onInvalid)), this.input.removeEventListeners();
    }, i.prototype._onKeyDown = function(t) {
      var e = t.keyCode, s = this.dropdown.isActive, n = t.key.length === 1 || t.key.length === 2 && t.key.charCodeAt(0) >= 55296 || t.key === "Unidentified";
      switch (!this._isTextElement && !s && e !== Z.ESC_KEY && e !== Z.TAB_KEY && e !== Z.SHIFT_KEY && (this.showDropdown(), !this.input.isFocussed && n && (this.input.value += t.key, t.key === " " && t.preventDefault())), e) {
        case Z.A_KEY:
          return this._onSelectKey(t, this.itemList.element.hasChildNodes());
        case Z.ENTER_KEY:
          return this._onEnterKey(t, s);
        case Z.ESC_KEY:
          return this._onEscapeKey(t, s);
        case Z.UP_KEY:
        case Z.PAGE_UP_KEY:
        case Z.DOWN_KEY:
        case Z.PAGE_DOWN_KEY:
          return this._onDirectionKey(t, s);
        case Z.DELETE_KEY:
        case Z.BACK_KEY:
          return this._onDeleteKey(t, this._store.items, this.input.isFocussed);
      }
    }, i.prototype._onKeyUp = function() {
      this._canSearch = this.config.searchEnabled;
    }, i.prototype._onInput = function() {
      var t = this.input.value;
      if (!t) {
        this._isTextElement ? this.hideDropdown(!0) : this._stopSearch();
        return;
      }
      this._canAddItems() && (this._canSearch && this._handleSearch(t), this._canAddUserChoices && (this._canCreateItem(t), this._isSelectElement && (this._highlightPosition = 0, this._highlightChoice())));
    }, i.prototype._onSelectKey = function(t, e) {
      if ((t.ctrlKey || t.metaKey) && e) {
        this._canSearch = !1;
        var s = this.config.removeItems && !this.input.value && this.input.element === document.activeElement;
        s && this.highlightAll();
      }
    }, i.prototype._onEnterKey = function(t, e) {
      var s = this, n = this.input.value, o = t.target;
      if (t.preventDefault(), o && o.hasAttribute("data-button")) {
        this._handleButtonAction(o);
        return;
      }
      if (!e) {
        (this._isSelectElement || this._notice) && this.showDropdown();
        return;
      }
      var r = this.dropdown.element.querySelector(ce(this.config.classNames.highlightedState));
      if (!(r && this._handleChoiceAction(r))) {
        if (!o || !n) {
          this.hideDropdown(!0);
          return;
        }
        if (this._canAddItems()) {
          var a = !1;
          this._store.withTxn(function() {
            if (a = s._findAndSelectChoiceByValue(n, !0), !a) {
              if (!s._canAddUserChoices || !s._canCreateItem(n))
                return;
              s._addChoice(_t(n, !1, s.config.allowHtmlUserInput), !0, !0), a = !0;
            }
            s.clearInput(), s.unhighlightAll();
          }), a && (this._triggerChange(n), this.config.closeDropdownOnSelect && this.hideDropdown(!0));
        }
      }
    }, i.prototype._onEscapeKey = function(t, e) {
      e && (t.stopPropagation(), this.hideDropdown(!0), this._stopSearch(), this.containerOuter.element.focus());
    }, i.prototype._onDirectionKey = function(t, e) {
      var s = t.keyCode;
      if (e || this._isSelectOneElement) {
        this.showDropdown(), this._canSearch = !1;
        var n = s === Z.DOWN_KEY || s === Z.PAGE_DOWN_KEY ? 1 : -1, o = t.metaKey || s === Z.PAGE_DOWN_KEY || s === Z.PAGE_UP_KEY, r = void 0;
        if (o)
          n > 0 ? r = this.dropdown.element.querySelector("".concat(ve, ":last-of-type")) : r = this.dropdown.element.querySelector(ve);
        else {
          var a = this.dropdown.element.querySelector(ce(this.config.classNames.highlightedState));
          a ? r = ua(a, ve, n) : r = this.dropdown.element.querySelector(ve);
        }
        r && (Qs(r, this.choiceList.element, n) || this.choiceList.scrollToChildElement(r, n), this._highlightChoice(r)), t.preventDefault();
      }
    }, i.prototype._onDeleteKey = function(t, e, s) {
      !this._isSelectOneElement && !t.target.value && s && (this._handleBackspace(e), t.preventDefault());
    }, i.prototype._onTouchMove = function() {
      this._wasTap && (this._wasTap = !1);
    }, i.prototype._onTouchEnd = function(t) {
      var e = (t || t.touches[0]).target, s = this._wasTap && this.containerOuter.element.contains(e);
      if (s) {
        var n = e === this.containerOuter.element || e === this.containerInner.element;
        n && (this._isTextElement ? this.input.focus() : this._isSelectMultipleElement && this.showDropdown()), t.stopPropagation();
      }
      this._wasTap = !0;
    }, i.prototype._onMouseDown = function(t) {
      var e = t.target;
      if (e instanceof Element) {
        if (El && this.choiceList.element.contains(e)) {
          var s = this.choiceList.element.firstElementChild;
          this._isScrollingOnIe = this._direction === "ltr" ? t.offsetX >= s.offsetWidth : t.offsetX < s.offsetLeft;
        }
        if (e !== this.input.element) {
          var n = e.closest("[data-button],[data-item],[data-choice]");
          n instanceof HTMLElement && ("button" in n.dataset ? this._handleButtonAction(n) : "item" in n.dataset ? this._handleItemAction(n, t.shiftKey) : "choice" in n.dataset && this._handleChoiceAction(n)), t.preventDefault();
        }
      }
    }, i.prototype._onMouseOver = function(t) {
      var e = t.target;
      e instanceof HTMLElement && "choice" in e.dataset && this._highlightChoice(e);
    }, i.prototype._onClick = function(t) {
      var e = t.target, s = this.containerOuter, n = s.element.contains(e);
      n ? !this.dropdown.isActive && !s.isDisabled ? this._isTextElement ? document.activeElement !== this.input.element && this.input.focus() : (this.showDropdown(), s.element.focus()) : this._isSelectOneElement && e !== this.input.element && !this.dropdown.element.contains(e) && this.hideDropdown() : (s.removeFocusState(), this.hideDropdown(!0), this.unhighlightAll());
    }, i.prototype._onFocus = function(t) {
      var e = t.target, s = this.containerOuter, n = e && s.element.contains(e);
      if (n) {
        var o = e === this.input.element;
        this._isTextElement ? o && s.addFocusState() : this._isSelectMultipleElement ? o && (this.showDropdown(!0), s.addFocusState()) : (s.addFocusState(), o && this.showDropdown(!0));
      }
    }, i.prototype._onBlur = function(t) {
      var e = t.target, s = this.containerOuter, n = e && s.element.contains(e);
      n && !this._isScrollingOnIe ? e === this.input.element ? (s.removeFocusState(), this.hideDropdown(!0), (this._isTextElement || this._isSelectMultipleElement) && this.unhighlightAll()) : e === this.containerOuter.element && (s.removeFocusState(), this.config.searchEnabled || this.hideDropdown(!0)) : (this._isScrollingOnIe = !1, this.input.element.focus());
    }, i.prototype._onFormReset = function() {
      var t = this;
      this._store.withTxn(function() {
        t.clearInput(), t.hideDropdown(), t.refresh(!1, !1, !0), t._initialItems.length && t.setChoiceByValue(t._initialItems);
      });
    }, i.prototype._onChange = function(t) {
      t.target.checkValidity() && this.containerOuter.removeInvalidState();
    }, i.prototype._onInvalid = function() {
      this.containerOuter.addInvalidState();
    }, i.prototype._removeHighlightedChoices = function() {
      var t = this.config.classNames.highlightedState, e = Array.from(this.dropdown.element.querySelectorAll(ce(t)));
      e.forEach(function(s) {
        ft(s, t), s.setAttribute("aria-selected", "false");
      });
    }, i.prototype._highlightChoice = function(t) {
      t === void 0 && (t = null);
      var e = Array.from(this.dropdown.element.querySelectorAll(ve));
      if (e.length) {
        var s = t, n = this.config.classNames.highlightedState;
        this._removeHighlightedChoices(), s ? this._highlightPosition = e.indexOf(s) : (e.length > this._highlightPosition ? s = e[this._highlightPosition] : s = e[e.length - 1], s || (s = e[0])), P(s, n), s.setAttribute("aria-selected", "true"), this.passedElement.triggerEvent(ot.highlightChoice, {
          el: s
        }), this.dropdown.isActive && (this.input.setActiveDescendant(s.id), this.containerOuter.setActiveDescendant(s.id));
      }
    }, i.prototype._addItem = function(t, e, s) {
      if (e === void 0 && (e = !0), s === void 0 && (s = !1), !t.id)
        throw new TypeError("item.id must be set before _addItem is called for a choice/item");
      if ((this.config.singleModeForMultiSelect || this._isSelectOneElement) && this.removeActiveItems(t.id), this._store.dispatch(Gs(t)), e) {
        var n = mt(t);
        this.passedElement.triggerEvent(ot.addItem, n), s && this.passedElement.triggerEvent(ot.choice, n);
      }
    }, i.prototype._removeItem = function(t) {
      if (t.id) {
        this._store.dispatch(qs(t));
        var e = this._notice;
        e && e.type === J.noChoices && this._clearNotice(), this.passedElement.triggerEvent(ot.removeItem, mt(t));
      }
    }, i.prototype._addChoice = function(t, e, s) {
      if (e === void 0 && (e = !0), s === void 0 && (s = !1), t.id)
        throw new TypeError("Can not re-add a choice which has already been added");
      var n = this.config;
      if (!(!n.duplicateItemsAllowed && this._store.choices.find(function(a) {
        return n.valueComparer(a.value, t.value);
      }))) {
        this._lastAddedChoiceId++, t.id = this._lastAddedChoiceId, t.elementId = "".concat(this._baseId, "-").concat(this._idNames.itemChoice, "-").concat(t.id);
        var o = n.prependValue, r = n.appendValue;
        o && (t.value = o + t.value), r && (t.value += r.toString()), (o || r) && t.element && (t.element.value = t.value), this._clearNotice(), this._store.dispatch(Xs(t)), t.selected && this._addItem(t, e, s);
      }
    }, i.prototype._addGroup = function(t, e) {
      var s = this;
      if (e === void 0 && (e = !0), t.id)
        throw new TypeError("Can not re-add a group which has already been added");
      this._store.dispatch(ca(t)), t.choices && (this._lastAddedGroupId++, t.id = this._lastAddedGroupId, t.choices.forEach(function(n) {
        n.group = t, t.disabled && (n.disabled = !0), s._addChoice(n, e);
      }));
    }, i.prototype._createTemplates = function() {
      var t = this, e = this.config.callbackOnCreateTemplates, s = {};
      typeof e == "function" && (s = e.call(this, fa, Os, Ti));
      var n = {};
      Object.keys(this._templates).forEach(function(o) {
        o in s ? n[o] = s[o].bind(t) : n[o] = t._templates[o].bind(t);
      }), this._templates = n;
    }, i.prototype._createElements = function() {
      var t = this._templates, e = this, s = e.config, n = e._isSelectOneElement, o = s.position, r = s.classNames, a = this._elementType;
      this.containerOuter = new tn({
        element: t.containerOuter(s, this._direction, this._isSelectElement, n, s.searchEnabled, a, s.labelId),
        classNames: r,
        type: a,
        position: o
      }), this.containerInner = new tn({
        element: t.containerInner(s),
        classNames: r,
        type: a,
        position: o
      }), this.input = new xa({
        element: t.input(s, this._placeholderValue),
        classNames: r,
        type: a,
        preventPaste: !s.paste
      }), this.choiceList = new en({
        element: t.choiceList(s, n)
      }), this.itemList = new en({
        element: t.itemList(s, n)
      }), this.dropdown = new va({
        element: t.dropdown(s),
        classNames: r,
        type: a
      });
    }, i.prototype._createStructure = function() {
      var t = this, e = t.containerInner, s = t.containerOuter, n = t.passedElement, o = this.dropdown.element;
      n.conceal(), e.wrap(n.element), s.wrap(e.element), s.element.appendChild(e.element), s.element.appendChild(o), e.element.appendChild(this.itemList.element), o.appendChild(this.choiceList.element), this._isSelectOneElement ? (this.input.placeholder = this.config.searchPlaceholderValue || "", this.config.searchEnabled && o.insertBefore(this.input.element, o.firstChild)) : ((!this._isSelectMultipleElement || this.config.searchEnabled) && e.element.appendChild(this.input.element), this._placeholderValue && (this.input.placeholder = this._placeholderValue), this.input.setWidth()), this._highlightPosition = 0, this._isSearching = !1;
    }, i.prototype._initStore = function() {
      var t = this;
      this._store.subscribe(this._render).withTxn(function() {
        t._addPredefinedChoices(t._presetChoices, t._isSelectOneElement && !t._hasNonChoicePlaceholder, !1);
      }), (!this._store.choices.length || this._isSelectOneElement && this._hasNonChoicePlaceholder) && this._render();
    }, i.prototype._addPredefinedChoices = function(t, e, s) {
      var n = this;
      if (e === void 0 && (e = !1), s === void 0 && (s = !0), e) {
        var o = t.findIndex(function(r) {
          return r.selected;
        }) === -1;
        o && t.some(function(r) {
          return r.disabled || "choices" in r ? !1 : (r.selected = !0, !0);
        });
      }
      t.forEach(function(r) {
        "choices" in r ? n._isSelectElement && n._addGroup(r, s) : n._addChoice(r, s);
      });
    }, i.prototype._findAndSelectChoiceByValue = function(t, e) {
      var s = this;
      e === void 0 && (e = !1);
      var n = this._store.choices.find(function(o) {
        return s.config.valueComparer(o.value, t);
      });
      return n && !n.disabled && !n.selected ? (this._addItem(n, !0, e), !0) : !1;
    }, i.prototype._generatePlaceholderValue = function() {
      var t = this.config;
      if (!t.placeholder)
        return null;
      if (this._hasNonChoicePlaceholder)
        return t.placeholderValue;
      if (this._isSelectElement) {
        var e = this.passedElement.placeholderOption;
        return e ? e.text : null;
      }
      return null;
    }, i.prototype._warnChoicesInitFailed = function(t) {
      if (!this.config.silent)
        if (this.initialised) {
          if (!this.initialisedOK)
            throw new TypeError("".concat(t, " called for an element which has multiple instances of Choices initialised on it"));
        } else throw new TypeError("".concat(t, " called on a non-initialised instance of Choices"));
    }, i.version = "11.2.3", i;
  })()
);
/*!
 * @kurkle/color v0.3.4
 * https://github.com/kurkle/color#readme
 * (c) 2024 Jukka Kurkela
 * Released under the MIT License
 */
function Ge(i) {
  return i + 0.5 | 0;
}
const Ft = (i, t, e) => Math.max(Math.min(i, e), t);
function Ae(i) {
  return Ft(Ge(i * 2.55), 0, 255);
}
function Vt(i) {
  return Ft(Ge(i * 255), 0, 255);
}
function At(i) {
  return Ft(Ge(i / 2.55) / 100, 0, 1);
}
function fn(i) {
  return Ft(Ge(i * 100), 0, 100);
}
const dt = { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, A: 10, B: 11, C: 12, D: 13, E: 14, F: 15, a: 10, b: 11, c: 12, d: 13, e: 14, f: 15 }, ds = [..."0123456789ABCDEF"], kl = (i) => ds[i & 15], Ol = (i) => ds[(i & 240) >> 4] + ds[i & 15], ti = (i) => (i & 240) >> 4 === (i & 15), Pl = (i) => ti(i.r) && ti(i.g) && ti(i.b) && ti(i.a);
function Dl(i) {
  var t = i.length, e;
  return i[0] === "#" && (t === 4 || t === 5 ? e = {
    r: 255 & dt[i[1]] * 17,
    g: 255 & dt[i[2]] * 17,
    b: 255 & dt[i[3]] * 17,
    a: t === 5 ? dt[i[4]] * 17 : 255
  } : (t === 7 || t === 9) && (e = {
    r: dt[i[1]] << 4 | dt[i[2]],
    g: dt[i[3]] << 4 | dt[i[4]],
    b: dt[i[5]] << 4 | dt[i[6]],
    a: t === 9 ? dt[i[7]] << 4 | dt[i[8]] : 255
  })), e;
}
const Tl = (i, t) => i < 255 ? t(i) : "";
function Il(i) {
  var t = Pl(i) ? kl : Ol;
  return i ? "#" + t(i.r) + t(i.g) + t(i.b) + Tl(i.a, t) : void 0;
}
const Ll = /^(hsla?|hwb|hsv)\(\s*([-+.e\d]+)(?:deg)?[\s,]+([-+.e\d]+)%[\s,]+([-+.e\d]+)%(?:[\s,]+([-+.e\d]+)(%)?)?\s*\)$/;
function Zo(i, t, e) {
  const s = t * Math.min(e, 1 - e), n = (o, r = (o + i / 30) % 12) => e - s * Math.max(Math.min(r - 3, 9 - r, 1), -1);
  return [n(0), n(8), n(4)];
}
function Rl(i, t, e) {
  const s = (n, o = (n + i / 60) % 6) => e - e * t * Math.max(Math.min(o, 4 - o, 1), 0);
  return [s(5), s(3), s(1)];
}
function Fl(i, t, e) {
  const s = Zo(i, 1, 0.5);
  let n;
  for (t + e > 1 && (n = 1 / (t + e), t *= n, e *= n), n = 0; n < 3; n++)
    s[n] *= 1 - t - e, s[n] += t;
  return s;
}
function Nl(i, t, e, s, n) {
  return i === n ? (t - e) / s + (t < e ? 6 : 0) : t === n ? (e - i) / s + 2 : (i - t) / s + 4;
}
function Ds(i) {
  const e = i.r / 255, s = i.g / 255, n = i.b / 255, o = Math.max(e, s, n), r = Math.min(e, s, n), a = (o + r) / 2;
  let l, c, h;
  return o !== r && (h = o - r, c = a > 0.5 ? h / (2 - o - r) : h / (o + r), l = Nl(e, s, n, h, o), l = l * 60 + 0.5), [l | 0, c || 0, a];
}
function Ts(i, t, e, s) {
  return (Array.isArray(t) ? i(t[0], t[1], t[2]) : i(t, e, s)).map(Vt);
}
function Is(i, t, e) {
  return Ts(Zo, i, t, e);
}
function Bl(i, t, e) {
  return Ts(Fl, i, t, e);
}
function zl(i, t, e) {
  return Ts(Rl, i, t, e);
}
function tr(i) {
  return (i % 360 + 360) % 360;
}
function Hl(i) {
  const t = Ll.exec(i);
  let e = 255, s;
  if (!t)
    return;
  t[5] !== s && (e = t[6] ? Ae(+t[5]) : Vt(+t[5]));
  const n = tr(+t[2]), o = +t[3] / 100, r = +t[4] / 100;
  return t[1] === "hwb" ? s = Bl(n, o, r) : t[1] === "hsv" ? s = zl(n, o, r) : s = Is(n, o, r), {
    r: s[0],
    g: s[1],
    b: s[2],
    a: e
  };
}
function Vl(i, t) {
  var e = Ds(i);
  e[0] = tr(e[0] + t), e = Is(e), i.r = e[0], i.g = e[1], i.b = e[2];
}
function Wl(i) {
  if (!i)
    return;
  const t = Ds(i), e = t[0], s = fn(t[1]), n = fn(t[2]);
  return i.a < 255 ? `hsla(${e}, ${s}%, ${n}%, ${At(i.a)})` : `hsl(${e}, ${s}%, ${n}%)`;
}
const pn = {
  x: "dark",
  Z: "light",
  Y: "re",
  X: "blu",
  W: "gr",
  V: "medium",
  U: "slate",
  A: "ee",
  T: "ol",
  S: "or",
  B: "ra",
  C: "lateg",
  D: "ights",
  R: "in",
  Q: "turquois",
  E: "hi",
  P: "ro",
  O: "al",
  N: "le",
  M: "de",
  L: "yello",
  F: "en",
  K: "ch",
  G: "arks",
  H: "ea",
  I: "ightg",
  J: "wh"
}, gn = {
  OiceXe: "f0f8ff",
  antiquewEte: "faebd7",
  aqua: "ffff",
  aquamarRe: "7fffd4",
  azuY: "f0ffff",
  beige: "f5f5dc",
  bisque: "ffe4c4",
  black: "0",
  blanKedOmond: "ffebcd",
  Xe: "ff",
  XeviTet: "8a2be2",
  bPwn: "a52a2a",
  burlywood: "deb887",
  caMtXe: "5f9ea0",
  KartYuse: "7fff00",
  KocTate: "d2691e",
  cSO: "ff7f50",
  cSnflowerXe: "6495ed",
  cSnsilk: "fff8dc",
  crimson: "dc143c",
  cyan: "ffff",
  xXe: "8b",
  xcyan: "8b8b",
  xgTMnPd: "b8860b",
  xWay: "a9a9a9",
  xgYF: "6400",
  xgYy: "a9a9a9",
  xkhaki: "bdb76b",
  xmagFta: "8b008b",
  xTivegYF: "556b2f",
  xSange: "ff8c00",
  xScEd: "9932cc",
  xYd: "8b0000",
  xsOmon: "e9967a",
  xsHgYF: "8fbc8f",
  xUXe: "483d8b",
  xUWay: "2f4f4f",
  xUgYy: "2f4f4f",
  xQe: "ced1",
  xviTet: "9400d3",
  dAppRk: "ff1493",
  dApskyXe: "bfff",
  dimWay: "696969",
  dimgYy: "696969",
  dodgerXe: "1e90ff",
  fiYbrick: "b22222",
  flSOwEte: "fffaf0",
  foYstWAn: "228b22",
  fuKsia: "ff00ff",
  gaRsbSo: "dcdcdc",
  ghostwEte: "f8f8ff",
  gTd: "ffd700",
  gTMnPd: "daa520",
  Way: "808080",
  gYF: "8000",
  gYFLw: "adff2f",
  gYy: "808080",
  honeyMw: "f0fff0",
  hotpRk: "ff69b4",
  RdianYd: "cd5c5c",
  Rdigo: "4b0082",
  ivSy: "fffff0",
  khaki: "f0e68c",
  lavFMr: "e6e6fa",
  lavFMrXsh: "fff0f5",
  lawngYF: "7cfc00",
  NmoncEffon: "fffacd",
  ZXe: "add8e6",
  ZcSO: "f08080",
  Zcyan: "e0ffff",
  ZgTMnPdLw: "fafad2",
  ZWay: "d3d3d3",
  ZgYF: "90ee90",
  ZgYy: "d3d3d3",
  ZpRk: "ffb6c1",
  ZsOmon: "ffa07a",
  ZsHgYF: "20b2aa",
  ZskyXe: "87cefa",
  ZUWay: "778899",
  ZUgYy: "778899",
  ZstAlXe: "b0c4de",
  ZLw: "ffffe0",
  lime: "ff00",
  limegYF: "32cd32",
  lRF: "faf0e6",
  magFta: "ff00ff",
  maPon: "800000",
  VaquamarRe: "66cdaa",
  VXe: "cd",
  VScEd: "ba55d3",
  VpurpN: "9370db",
  VsHgYF: "3cb371",
  VUXe: "7b68ee",
  VsprRggYF: "fa9a",
  VQe: "48d1cc",
  VviTetYd: "c71585",
  midnightXe: "191970",
  mRtcYam: "f5fffa",
  mistyPse: "ffe4e1",
  moccasR: "ffe4b5",
  navajowEte: "ffdead",
  navy: "80",
  Tdlace: "fdf5e6",
  Tive: "808000",
  TivedBb: "6b8e23",
  Sange: "ffa500",
  SangeYd: "ff4500",
  ScEd: "da70d6",
  pOegTMnPd: "eee8aa",
  pOegYF: "98fb98",
  pOeQe: "afeeee",
  pOeviTetYd: "db7093",
  papayawEp: "ffefd5",
  pHKpuff: "ffdab9",
  peru: "cd853f",
  pRk: "ffc0cb",
  plum: "dda0dd",
  powMrXe: "b0e0e6",
  purpN: "800080",
  YbeccapurpN: "663399",
  Yd: "ff0000",
  Psybrown: "bc8f8f",
  PyOXe: "4169e1",
  saddNbPwn: "8b4513",
  sOmon: "fa8072",
  sandybPwn: "f4a460",
  sHgYF: "2e8b57",
  sHshell: "fff5ee",
  siFna: "a0522d",
  silver: "c0c0c0",
  skyXe: "87ceeb",
  UXe: "6a5acd",
  UWay: "708090",
  UgYy: "708090",
  snow: "fffafa",
  sprRggYF: "ff7f",
  stAlXe: "4682b4",
  tan: "d2b48c",
  teO: "8080",
  tEstN: "d8bfd8",
  tomato: "ff6347",
  Qe: "40e0d0",
  viTet: "ee82ee",
  JHt: "f5deb3",
  wEte: "ffffff",
  wEtesmoke: "f5f5f5",
  Lw: "ffff00",
  LwgYF: "9acd32"
};
function jl() {
  const i = {}, t = Object.keys(gn), e = Object.keys(pn);
  let s, n, o, r, a;
  for (s = 0; s < t.length; s++) {
    for (r = a = t[s], n = 0; n < e.length; n++)
      o = e[n], a = a.replace(o, pn[o]);
    o = parseInt(gn[r], 16), i[a] = [o >> 16 & 255, o >> 8 & 255, o & 255];
  }
  return i;
}
let ei;
function $l(i) {
  ei || (ei = jl(), ei.transparent = [0, 0, 0, 0]);
  const t = ei[i.toLowerCase()];
  return t && {
    r: t[0],
    g: t[1],
    b: t[2],
    a: t.length === 4 ? t[3] : 255
  };
}
const Yl = /^rgba?\(\s*([-+.\d]+)(%)?[\s,]+([-+.e\d]+)(%)?[\s,]+([-+.e\d]+)(%)?(?:[\s,/]+([-+.e\d]+)(%)?)?\s*\)$/;
function Kl(i) {
  const t = Yl.exec(i);
  let e = 255, s, n, o;
  if (t) {
    if (t[7] !== s) {
      const r = +t[7];
      e = t[8] ? Ae(r) : Ft(r * 255, 0, 255);
    }
    return s = +t[1], n = +t[3], o = +t[5], s = 255 & (t[2] ? Ae(s) : Ft(s, 0, 255)), n = 255 & (t[4] ? Ae(n) : Ft(n, 0, 255)), o = 255 & (t[6] ? Ae(o) : Ft(o, 0, 255)), {
      r: s,
      g: n,
      b: o,
      a: e
    };
  }
}
function Ul(i) {
  return i && (i.a < 255 ? `rgba(${i.r}, ${i.g}, ${i.b}, ${At(i.a)})` : `rgb(${i.r}, ${i.g}, ${i.b})`);
}
const $i = (i) => i <= 31308e-7 ? i * 12.92 : Math.pow(i, 1 / 2.4) * 1.055 - 0.055, he = (i) => i <= 0.04045 ? i / 12.92 : Math.pow((i + 0.055) / 1.055, 2.4);
function Xl(i, t, e) {
  const s = he(At(i.r)), n = he(At(i.g)), o = he(At(i.b));
  return {
    r: Vt($i(s + e * (he(At(t.r)) - s))),
    g: Vt($i(n + e * (he(At(t.g)) - n))),
    b: Vt($i(o + e * (he(At(t.b)) - o))),
    a: i.a + e * (t.a - i.a)
  };
}
function ii(i, t, e) {
  if (i) {
    let s = Ds(i);
    s[t] = Math.max(0, Math.min(s[t] + s[t] * e, t === 0 ? 360 : 1)), s = Is(s), i.r = s[0], i.g = s[1], i.b = s[2];
  }
}
function er(i, t) {
  return i && Object.assign(t || {}, i);
}
function mn(i) {
  var t = { r: 0, g: 0, b: 0, a: 255 };
  return Array.isArray(i) ? i.length >= 3 && (t = { r: i[0], g: i[1], b: i[2], a: 255 }, i.length > 3 && (t.a = Vt(i[3]))) : (t = er(i, { r: 0, g: 0, b: 0, a: 1 }), t.a = Vt(t.a)), t;
}
function Gl(i) {
  return i.charAt(0) === "r" ? Kl(i) : Hl(i);
}
class ze {
  constructor(t) {
    if (t instanceof ze)
      return t;
    const e = typeof t;
    let s;
    e === "object" ? s = mn(t) : e === "string" && (s = Dl(t) || $l(t) || Gl(t)), this._rgb = s, this._valid = !!s;
  }
  get valid() {
    return this._valid;
  }
  get rgb() {
    var t = er(this._rgb);
    return t && (t.a = At(t.a)), t;
  }
  set rgb(t) {
    this._rgb = mn(t);
  }
  rgbString() {
    return this._valid ? Ul(this._rgb) : void 0;
  }
  hexString() {
    return this._valid ? Il(this._rgb) : void 0;
  }
  hslString() {
    return this._valid ? Wl(this._rgb) : void 0;
  }
  mix(t, e) {
    if (t) {
      const s = this.rgb, n = t.rgb;
      let o;
      const r = e === o ? 0.5 : e, a = 2 * r - 1, l = s.a - n.a, c = ((a * l === -1 ? a : (a + l) / (1 + a * l)) + 1) / 2;
      o = 1 - c, s.r = 255 & c * s.r + o * n.r + 0.5, s.g = 255 & c * s.g + o * n.g + 0.5, s.b = 255 & c * s.b + o * n.b + 0.5, s.a = r * s.a + (1 - r) * n.a, this.rgb = s;
    }
    return this;
  }
  interpolate(t, e) {
    return t && (this._rgb = Xl(this._rgb, t._rgb, e)), this;
  }
  clone() {
    return new ze(this.rgb);
  }
  alpha(t) {
    return this._rgb.a = Vt(t), this;
  }
  clearer(t) {
    const e = this._rgb;
    return e.a *= 1 - t, this;
  }
  greyscale() {
    const t = this._rgb, e = Ge(t.r * 0.3 + t.g * 0.59 + t.b * 0.11);
    return t.r = t.g = t.b = e, this;
  }
  opaquer(t) {
    const e = this._rgb;
    return e.a *= 1 + t, this;
  }
  negate() {
    const t = this._rgb;
    return t.r = 255 - t.r, t.g = 255 - t.g, t.b = 255 - t.b, this;
  }
  lighten(t) {
    return ii(this._rgb, 2, t), this;
  }
  darken(t) {
    return ii(this._rgb, 2, -t), this;
  }
  saturate(t) {
    return ii(this._rgb, 1, t), this;
  }
  desaturate(t) {
    return ii(this._rgb, 1, -t), this;
  }
  rotate(t) {
    return Vl(this._rgb, t), this;
  }
}
/*!
 * Chart.js v4.5.1
 * https://www.chartjs.org
 * (c) 2025 Chart.js Contributors
 * Released under the MIT License
 */
function Mt() {
}
const ql = /* @__PURE__ */ (() => {
  let i = 0;
  return () => i++;
})();
function I(i) {
  return i == null;
}
function W(i) {
  if (Array.isArray && Array.isArray(i))
    return !0;
  const t = Object.prototype.toString.call(i);
  return t.slice(0, 7) === "[object" && t.slice(-6) === "Array]";
}
function L(i) {
  return i !== null && Object.prototype.toString.call(i) === "[object Object]";
}
function $(i) {
  return (typeof i == "number" || i instanceof Number) && isFinite(+i);
}
function ct(i, t) {
  return $(i) ? i : t;
}
function k(i, t) {
  return typeof i > "u" ? t : i;
}
const Jl = (i, t) => typeof i == "string" && i.endsWith("%") ? parseFloat(i) / 100 : +i / t, ir = (i, t) => typeof i == "string" && i.endsWith("%") ? parseFloat(i) / 100 * t : +i;
function z(i, t, e) {
  if (i && typeof i.call == "function")
    return i.apply(e, t);
}
function N(i, t, e, s) {
  let n, o, r;
  if (W(i))
    for (o = i.length, n = 0; n < o; n++)
      t.call(e, i[n], n);
  else if (L(i))
    for (r = Object.keys(i), o = r.length, n = 0; n < o; n++)
      t.call(e, i[r[n]], r[n]);
}
function Mi(i, t) {
  let e, s, n, o;
  if (!i || !t || i.length !== t.length)
    return !1;
  for (e = 0, s = i.length; e < s; ++e)
    if (n = i[e], o = t[e], n.datasetIndex !== o.datasetIndex || n.index !== o.index)
      return !1;
  return !0;
}
function Ei(i) {
  if (W(i))
    return i.map(Ei);
  if (L(i)) {
    const t = /* @__PURE__ */ Object.create(null), e = Object.keys(i), s = e.length;
    let n = 0;
    for (; n < s; ++n)
      t[e[n]] = Ei(i[e[n]]);
    return t;
  }
  return i;
}
function sr(i) {
  return [
    "__proto__",
    "prototype",
    "constructor"
  ].indexOf(i) === -1;
}
function Ql(i, t, e, s) {
  if (!sr(i))
    return;
  const n = t[i], o = e[i];
  L(n) && L(o) ? He(n, o, s) : t[i] = Ei(o);
}
function He(i, t, e) {
  const s = W(t) ? t : [
    t
  ], n = s.length;
  if (!L(i))
    return i;
  e = e || {};
  const o = e.merger || Ql;
  let r;
  for (let a = 0; a < n; ++a) {
    if (r = s[a], !L(r))
      continue;
    const l = Object.keys(r);
    for (let c = 0, h = l.length; c < h; ++c)
      o(l[c], i, r, e);
  }
  return i;
}
function Le(i, t) {
  return He(i, t, {
    merger: Zl
  });
}
function Zl(i, t, e) {
  if (!sr(i))
    return;
  const s = t[i], n = e[i];
  L(s) && L(n) ? Le(s, n) : Object.prototype.hasOwnProperty.call(t, i) || (t[i] = Ei(n));
}
const bn = {
  // Chart.helpers.core resolveObjectKey should resolve empty key to root object
  "": (i) => i,
  // default resolvers
  x: (i) => i.x,
  y: (i) => i.y
};
function tc(i) {
  const t = i.split("."), e = [];
  let s = "";
  for (const n of t)
    s += n, s.endsWith("\\") ? s = s.slice(0, -1) + "." : (e.push(s), s = "");
  return e;
}
function ec(i) {
  const t = tc(i);
  return (e) => {
    for (const s of t) {
      if (s === "")
        break;
      e = e && e[s];
    }
    return e;
  };
}
function Wt(i, t) {
  return (bn[t] || (bn[t] = ec(t)))(i);
}
function Ls(i) {
  return i.charAt(0).toUpperCase() + i.slice(1);
}
const Ve = (i) => typeof i < "u", jt = (i) => typeof i == "function", _n = (i, t) => {
  if (i.size !== t.size)
    return !1;
  for (const e of i)
    if (!t.has(e))
      return !1;
  return !0;
};
function ic(i) {
  return i.type === "mouseup" || i.type === "click" || i.type === "contextmenu";
}
const F = Math.PI, V = 2 * F, sc = V + F, Ci = Number.POSITIVE_INFINITY, nc = F / 180, U = F / 2, Xt = F / 4, yn = F * 2 / 3, Nt = Math.log10, St = Math.sign;
function Re(i, t, e) {
  return Math.abs(i - t) < e;
}
function vn(i) {
  const t = Math.round(i);
  i = Re(i, t, i / 1e3) ? t : i;
  const e = Math.pow(10, Math.floor(Nt(i))), s = i / e;
  return (s <= 1 ? 1 : s <= 2 ? 2 : s <= 5 ? 5 : 10) * e;
}
function oc(i) {
  const t = [], e = Math.sqrt(i);
  let s;
  for (s = 1; s < e; s++)
    i % s === 0 && (t.push(s), t.push(i / s));
  return e === (e | 0) && t.push(e), t.sort((n, o) => n - o).pop(), t;
}
function rc(i) {
  return typeof i == "symbol" || typeof i == "object" && i !== null && !(Symbol.toPrimitive in i || "toString" in i || "valueOf" in i);
}
function pe(i) {
  return !rc(i) && !isNaN(parseFloat(i)) && isFinite(i);
}
function ac(i, t) {
  const e = Math.round(i);
  return e - t <= i && e + t >= i;
}
function nr(i, t, e) {
  let s, n, o;
  for (s = 0, n = i.length; s < n; s++)
    o = i[s][e], isNaN(o) || (t.min = Math.min(t.min, o), t.max = Math.max(t.max, o));
}
function pt(i) {
  return i * (F / 180);
}
function Rs(i) {
  return i * (180 / F);
}
function xn(i) {
  if (!$(i))
    return;
  let t = 1, e = 0;
  for (; Math.round(i * t) / t !== i; )
    t *= 10, e++;
  return e;
}
function or(i, t) {
  const e = t.x - i.x, s = t.y - i.y, n = Math.sqrt(e * e + s * s);
  let o = Math.atan2(s, e);
  return o < -0.5 * F && (o += V), {
    angle: o,
    distance: n
  };
}
function us(i, t) {
  return Math.sqrt(Math.pow(t.x - i.x, 2) + Math.pow(t.y - i.y, 2));
}
function lc(i, t) {
  return (i - t + sc) % V - F;
}
function et(i) {
  return (i % V + V) % V;
}
function We(i, t, e, s) {
  const n = et(i), o = et(t), r = et(e), a = et(o - n), l = et(r - n), c = et(n - o), h = et(n - r);
  return n === o || n === r || s && o === r || a > l && c < h;
}
function q(i, t, e) {
  return Math.max(t, Math.min(e, i));
}
function cc(i) {
  return q(i, -32768, 32767);
}
function Ot(i, t, e, s = 1e-6) {
  return i >= Math.min(t, e) - s && i <= Math.max(t, e) + s;
}
function Fs(i, t, e) {
  e = e || ((r) => i[r] < t);
  let s = i.length - 1, n = 0, o;
  for (; s - n > 1; )
    o = n + s >> 1, e(o) ? n = o : s = o;
  return {
    lo: n,
    hi: s
  };
}
const Pt = (i, t, e, s) => Fs(i, e, s ? (n) => {
  const o = i[n][t];
  return o < e || o === e && i[n + 1][t] === e;
} : (n) => i[n][t] < e), hc = (i, t, e) => Fs(i, e, (s) => i[s][t] >= e);
function dc(i, t, e) {
  let s = 0, n = i.length;
  for (; s < n && i[s] < t; )
    s++;
  for (; n > s && i[n - 1] > e; )
    n--;
  return s > 0 || n < i.length ? i.slice(s, n) : i;
}
const rr = [
  "push",
  "pop",
  "shift",
  "splice",
  "unshift"
];
function uc(i, t) {
  if (i._chartjs) {
    i._chartjs.listeners.push(t);
    return;
  }
  Object.defineProperty(i, "_chartjs", {
    configurable: !0,
    enumerable: !1,
    value: {
      listeners: [
        t
      ]
    }
  }), rr.forEach((e) => {
    const s = "_onData" + Ls(e), n = i[e];
    Object.defineProperty(i, e, {
      configurable: !0,
      enumerable: !1,
      value(...o) {
        const r = n.apply(this, o);
        return i._chartjs.listeners.forEach((a) => {
          typeof a[s] == "function" && a[s](...o);
        }), r;
      }
    });
  });
}
function Sn(i, t) {
  const e = i._chartjs;
  if (!e)
    return;
  const s = e.listeners, n = s.indexOf(t);
  n !== -1 && s.splice(n, 1), !(s.length > 0) && (rr.forEach((o) => {
    delete i[o];
  }), delete i._chartjs);
}
function ar(i) {
  const t = new Set(i);
  return t.size === i.length ? i : Array.from(t);
}
const lr = (function() {
  return typeof window > "u" ? function(i) {
    return i();
  } : window.requestAnimationFrame;
})();
function cr(i, t) {
  let e = [], s = !1;
  return function(...n) {
    e = n, s || (s = !0, lr.call(window, () => {
      s = !1, i.apply(t, e);
    }));
  };
}
function fc(i, t) {
  let e;
  return function(...s) {
    return t ? (clearTimeout(e), e = setTimeout(i, t, s)) : i.apply(this, s), t;
  };
}
const Ns = (i) => i === "start" ? "left" : i === "end" ? "right" : "center", tt = (i, t, e) => i === "start" ? t : i === "end" ? e : (t + e) / 2, pc = (i, t, e, s) => i === (s ? "left" : "right") ? e : i === "center" ? (t + e) / 2 : t;
function hr(i, t, e) {
  const s = t.length;
  let n = 0, o = s;
  if (i._sorted) {
    const { iScale: r, vScale: a, _parsed: l } = i, c = i.dataset && i.dataset.options ? i.dataset.options.spanGaps : null, h = r.axis, { min: d, max: u, minDefined: f, maxDefined: p } = r.getUserBounds();
    if (f) {
      if (n = Math.min(
        // @ts-expect-error Need to type _parsed
        Pt(l, h, d).lo,
        // @ts-expect-error Need to fix types on _lookupByKey
        e ? s : Pt(t, h, r.getPixelForValue(d)).lo
      ), c) {
        const g = l.slice(0, n + 1).reverse().findIndex((m) => !I(m[a.axis]));
        n -= Math.max(0, g);
      }
      n = q(n, 0, s - 1);
    }
    if (p) {
      let g = Math.max(
        // @ts-expect-error Need to type _parsed
        Pt(l, r.axis, u, !0).hi + 1,
        // @ts-expect-error Need to fix types on _lookupByKey
        e ? 0 : Pt(t, h, r.getPixelForValue(u), !0).hi + 1
      );
      if (c) {
        const m = l.slice(g - 1).findIndex((b) => !I(b[a.axis]));
        g += Math.max(0, m);
      }
      o = q(g, n, s) - n;
    } else
      o = s - n;
  }
  return {
    start: n,
    count: o
  };
}
function dr(i) {
  const { xScale: t, yScale: e, _scaleRanges: s } = i, n = {
    xmin: t.min,
    xmax: t.max,
    ymin: e.min,
    ymax: e.max
  };
  if (!s)
    return i._scaleRanges = n, !0;
  const o = s.xmin !== t.min || s.xmax !== t.max || s.ymin !== e.min || s.ymax !== e.max;
  return Object.assign(s, n), o;
}
const si = (i) => i === 0 || i === 1, wn = (i, t, e) => -(Math.pow(2, 10 * (i -= 1)) * Math.sin((i - t) * V / e)), Mn = (i, t, e) => Math.pow(2, -10 * i) * Math.sin((i - t) * V / e) + 1, Fe = {
  linear: (i) => i,
  easeInQuad: (i) => i * i,
  easeOutQuad: (i) => -i * (i - 2),
  easeInOutQuad: (i) => (i /= 0.5) < 1 ? 0.5 * i * i : -0.5 * (--i * (i - 2) - 1),
  easeInCubic: (i) => i * i * i,
  easeOutCubic: (i) => (i -= 1) * i * i + 1,
  easeInOutCubic: (i) => (i /= 0.5) < 1 ? 0.5 * i * i * i : 0.5 * ((i -= 2) * i * i + 2),
  easeInQuart: (i) => i * i * i * i,
  easeOutQuart: (i) => -((i -= 1) * i * i * i - 1),
  easeInOutQuart: (i) => (i /= 0.5) < 1 ? 0.5 * i * i * i * i : -0.5 * ((i -= 2) * i * i * i - 2),
  easeInQuint: (i) => i * i * i * i * i,
  easeOutQuint: (i) => (i -= 1) * i * i * i * i + 1,
  easeInOutQuint: (i) => (i /= 0.5) < 1 ? 0.5 * i * i * i * i * i : 0.5 * ((i -= 2) * i * i * i * i + 2),
  easeInSine: (i) => -Math.cos(i * U) + 1,
  easeOutSine: (i) => Math.sin(i * U),
  easeInOutSine: (i) => -0.5 * (Math.cos(F * i) - 1),
  easeInExpo: (i) => i === 0 ? 0 : Math.pow(2, 10 * (i - 1)),
  easeOutExpo: (i) => i === 1 ? 1 : -Math.pow(2, -10 * i) + 1,
  easeInOutExpo: (i) => si(i) ? i : i < 0.5 ? 0.5 * Math.pow(2, 10 * (i * 2 - 1)) : 0.5 * (-Math.pow(2, -10 * (i * 2 - 1)) + 2),
  easeInCirc: (i) => i >= 1 ? i : -(Math.sqrt(1 - i * i) - 1),
  easeOutCirc: (i) => Math.sqrt(1 - (i -= 1) * i),
  easeInOutCirc: (i) => (i /= 0.5) < 1 ? -0.5 * (Math.sqrt(1 - i * i) - 1) : 0.5 * (Math.sqrt(1 - (i -= 2) * i) + 1),
  easeInElastic: (i) => si(i) ? i : wn(i, 0.075, 0.3),
  easeOutElastic: (i) => si(i) ? i : Mn(i, 0.075, 0.3),
  easeInOutElastic(i) {
    return si(i) ? i : i < 0.5 ? 0.5 * wn(i * 2, 0.1125, 0.45) : 0.5 + 0.5 * Mn(i * 2 - 1, 0.1125, 0.45);
  },
  easeInBack(i) {
    return i * i * ((1.70158 + 1) * i - 1.70158);
  },
  easeOutBack(i) {
    return (i -= 1) * i * ((1.70158 + 1) * i + 1.70158) + 1;
  },
  easeInOutBack(i) {
    let t = 1.70158;
    return (i /= 0.5) < 1 ? 0.5 * (i * i * (((t *= 1.525) + 1) * i - t)) : 0.5 * ((i -= 2) * i * (((t *= 1.525) + 1) * i + t) + 2);
  },
  easeInBounce: (i) => 1 - Fe.easeOutBounce(1 - i),
  easeOutBounce(i) {
    return i < 1 / 2.75 ? 7.5625 * i * i : i < 2 / 2.75 ? 7.5625 * (i -= 1.5 / 2.75) * i + 0.75 : i < 2.5 / 2.75 ? 7.5625 * (i -= 2.25 / 2.75) * i + 0.9375 : 7.5625 * (i -= 2.625 / 2.75) * i + 0.984375;
  },
  easeInOutBounce: (i) => i < 0.5 ? Fe.easeInBounce(i * 2) * 0.5 : Fe.easeOutBounce(i * 2 - 1) * 0.5 + 0.5
};
function Bs(i) {
  if (i && typeof i == "object") {
    const t = i.toString();
    return t === "[object CanvasPattern]" || t === "[object CanvasGradient]";
  }
  return !1;
}
function En(i) {
  return Bs(i) ? i : new ze(i);
}
function Yi(i) {
  return Bs(i) ? i : new ze(i).saturate(0.5).darken(0.1).hexString();
}
const gc = [
  "x",
  "y",
  "borderWidth",
  "radius",
  "tension"
], mc = [
  "color",
  "borderColor",
  "backgroundColor"
];
function bc(i) {
  i.set("animation", {
    delay: void 0,
    duration: 1e3,
    easing: "easeOutQuart",
    fn: void 0,
    from: void 0,
    loop: void 0,
    to: void 0,
    type: void 0
  }), i.describe("animation", {
    _fallback: !1,
    _indexable: !1,
    _scriptable: (t) => t !== "onProgress" && t !== "onComplete" && t !== "fn"
  }), i.set("animations", {
    colors: {
      type: "color",
      properties: mc
    },
    numbers: {
      type: "number",
      properties: gc
    }
  }), i.describe("animations", {
    _fallback: "animation"
  }), i.set("transitions", {
    active: {
      animation: {
        duration: 400
      }
    },
    resize: {
      animation: {
        duration: 0
      }
    },
    show: {
      animations: {
        colors: {
          from: "transparent"
        },
        visible: {
          type: "boolean",
          duration: 0
        }
      }
    },
    hide: {
      animations: {
        colors: {
          to: "transparent"
        },
        visible: {
          type: "boolean",
          easing: "linear",
          fn: (t) => t | 0
        }
      }
    }
  });
}
function _c(i) {
  i.set("layout", {
    autoPadding: !0,
    padding: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    }
  });
}
const Cn = /* @__PURE__ */ new Map();
function yc(i, t) {
  t = t || {};
  const e = i + JSON.stringify(t);
  let s = Cn.get(e);
  return s || (s = new Intl.NumberFormat(i, t), Cn.set(e, s)), s;
}
function qe(i, t, e) {
  return yc(t, e).format(i);
}
const ur = {
  values(i) {
    return W(i) ? i : "" + i;
  },
  numeric(i, t, e) {
    if (i === 0)
      return "0";
    const s = this.chart.options.locale;
    let n, o = i;
    if (e.length > 1) {
      const c = Math.max(Math.abs(e[0].value), Math.abs(e[e.length - 1].value));
      (c < 1e-4 || c > 1e15) && (n = "scientific"), o = vc(i, e);
    }
    const r = Nt(Math.abs(o)), a = isNaN(r) ? 1 : Math.max(Math.min(-1 * Math.floor(r), 20), 0), l = {
      notation: n,
      minimumFractionDigits: a,
      maximumFractionDigits: a
    };
    return Object.assign(l, this.options.ticks.format), qe(i, s, l);
  },
  logarithmic(i, t, e) {
    if (i === 0)
      return "0";
    const s = e[t].significand || i / Math.pow(10, Math.floor(Nt(i)));
    return [
      1,
      2,
      3,
      5,
      10,
      15
    ].includes(s) || t > 0.8 * e.length ? ur.numeric.call(this, i, t, e) : "";
  }
};
function vc(i, t) {
  let e = t.length > 3 ? t[2].value - t[1].value : t[1].value - t[0].value;
  return Math.abs(e) >= 1 && i !== Math.floor(i) && (e = i - Math.floor(i)), e;
}
var Ii = {
  formatters: ur
};
function xc(i) {
  i.set("scale", {
    display: !0,
    offset: !1,
    reverse: !1,
    beginAtZero: !1,
    bounds: "ticks",
    clip: !0,
    grace: 0,
    grid: {
      display: !0,
      lineWidth: 1,
      drawOnChartArea: !0,
      drawTicks: !0,
      tickLength: 8,
      tickWidth: (t, e) => e.lineWidth,
      tickColor: (t, e) => e.color,
      offset: !1
    },
    border: {
      display: !0,
      dash: [],
      dashOffset: 0,
      width: 1
    },
    title: {
      display: !1,
      text: "",
      padding: {
        top: 4,
        bottom: 4
      }
    },
    ticks: {
      minRotation: 0,
      maxRotation: 50,
      mirror: !1,
      textStrokeWidth: 0,
      textStrokeColor: "",
      padding: 3,
      display: !0,
      autoSkip: !0,
      autoSkipPadding: 3,
      labelOffset: 0,
      callback: Ii.formatters.values,
      minor: {},
      major: {},
      align: "center",
      crossAlign: "near",
      showLabelBackdrop: !1,
      backdropColor: "rgba(255, 255, 255, 0.75)",
      backdropPadding: 2
    }
  }), i.route("scale.ticks", "color", "", "color"), i.route("scale.grid", "color", "", "borderColor"), i.route("scale.border", "color", "", "borderColor"), i.route("scale.title", "color", "", "color"), i.describe("scale", {
    _fallback: !1,
    _scriptable: (t) => !t.startsWith("before") && !t.startsWith("after") && t !== "callback" && t !== "parser",
    _indexable: (t) => t !== "borderDash" && t !== "tickBorderDash" && t !== "dash"
  }), i.describe("scales", {
    _fallback: "scale"
  }), i.describe("scale.ticks", {
    _scriptable: (t) => t !== "backdropPadding" && t !== "callback",
    _indexable: (t) => t !== "backdropPadding"
  });
}
const ne = /* @__PURE__ */ Object.create(null), fs = /* @__PURE__ */ Object.create(null);
function Ne(i, t) {
  if (!t)
    return i;
  const e = t.split(".");
  for (let s = 0, n = e.length; s < n; ++s) {
    const o = e[s];
    i = i[o] || (i[o] = /* @__PURE__ */ Object.create(null));
  }
  return i;
}
function Ki(i, t, e) {
  return typeof t == "string" ? He(Ne(i, t), e) : He(Ne(i, ""), t);
}
class Sc {
  constructor(t, e) {
    this.animation = void 0, this.backgroundColor = "rgba(0,0,0,0.1)", this.borderColor = "rgba(0,0,0,0.1)", this.color = "#666", this.datasets = {}, this.devicePixelRatio = (s) => s.chart.platform.getDevicePixelRatio(), this.elements = {}, this.events = [
      "mousemove",
      "mouseout",
      "click",
      "touchstart",
      "touchmove"
    ], this.font = {
      family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
      size: 12,
      style: "normal",
      lineHeight: 1.2,
      weight: null
    }, this.hover = {}, this.hoverBackgroundColor = (s, n) => Yi(n.backgroundColor), this.hoverBorderColor = (s, n) => Yi(n.borderColor), this.hoverColor = (s, n) => Yi(n.color), this.indexAxis = "x", this.interaction = {
      mode: "nearest",
      intersect: !0,
      includeInvisible: !1
    }, this.maintainAspectRatio = !0, this.onHover = null, this.onClick = null, this.parsing = !0, this.plugins = {}, this.responsive = !0, this.scale = void 0, this.scales = {}, this.showLine = !0, this.drawActiveElementsOnTop = !0, this.describe(t), this.apply(e);
  }
  set(t, e) {
    return Ki(this, t, e);
  }
  get(t) {
    return Ne(this, t);
  }
  describe(t, e) {
    return Ki(fs, t, e);
  }
  override(t, e) {
    return Ki(ne, t, e);
  }
  route(t, e, s, n) {
    const o = Ne(this, t), r = Ne(this, s), a = "_" + e;
    Object.defineProperties(o, {
      [a]: {
        value: o[e],
        writable: !0
      },
      [e]: {
        enumerable: !0,
        get() {
          const l = this[a], c = r[n];
          return L(l) ? Object.assign({}, c, l) : k(l, c);
        },
        set(l) {
          this[a] = l;
        }
      }
    });
  }
  apply(t) {
    t.forEach((e) => e(this));
  }
}
var j = /* @__PURE__ */ new Sc({
  _scriptable: (i) => !i.startsWith("on"),
  _indexable: (i) => i !== "events",
  hover: {
    _fallback: "interaction"
  },
  interaction: {
    _scriptable: !1,
    _indexable: !1
  }
}, [
  bc,
  _c,
  xc
]);
function wc(i) {
  return !i || I(i.size) || I(i.family) ? null : (i.style ? i.style + " " : "") + (i.weight ? i.weight + " " : "") + i.size + "px " + i.family;
}
function Ai(i, t, e, s, n) {
  let o = t[n];
  return o || (o = t[n] = i.measureText(n).width, e.push(n)), o > s && (s = o), s;
}
function Mc(i, t, e, s) {
  s = s || {};
  let n = s.data = s.data || {}, o = s.garbageCollect = s.garbageCollect || [];
  s.font !== t && (n = s.data = {}, o = s.garbageCollect = [], s.font = t), i.save(), i.font = t;
  let r = 0;
  const a = e.length;
  let l, c, h, d, u;
  for (l = 0; l < a; l++)
    if (d = e[l], d != null && !W(d))
      r = Ai(i, n, o, r, d);
    else if (W(d))
      for (c = 0, h = d.length; c < h; c++)
        u = d[c], u != null && !W(u) && (r = Ai(i, n, o, r, u));
  i.restore();
  const f = o.length / 2;
  if (f > e.length) {
    for (l = 0; l < f; l++)
      delete n[o[l]];
    o.splice(0, f);
  }
  return r;
}
function Gt(i, t, e) {
  const s = i.currentDevicePixelRatio, n = e !== 0 ? Math.max(e / 2, 0.5) : 0;
  return Math.round((t - n) * s) / s + n;
}
function An(i, t) {
  !t && !i || (t = t || i.getContext("2d"), t.save(), t.resetTransform(), t.clearRect(0, 0, i.width, i.height), t.restore());
}
function ps(i, t, e, s) {
  fr(i, t, e, s, null);
}
function fr(i, t, e, s, n) {
  let o, r, a, l, c, h, d, u;
  const f = t.pointStyle, p = t.rotation, g = t.radius;
  let m = (p || 0) * nc;
  if (f && typeof f == "object" && (o = f.toString(), o === "[object HTMLImageElement]" || o === "[object HTMLCanvasElement]")) {
    i.save(), i.translate(e, s), i.rotate(m), i.drawImage(f, -f.width / 2, -f.height / 2, f.width, f.height), i.restore();
    return;
  }
  if (!(isNaN(g) || g <= 0)) {
    switch (i.beginPath(), f) {
      // Default includes circle
      default:
        n ? i.ellipse(e, s, n / 2, g, 0, 0, V) : i.arc(e, s, g, 0, V), i.closePath();
        break;
      case "triangle":
        h = n ? n / 2 : g, i.moveTo(e + Math.sin(m) * h, s - Math.cos(m) * g), m += yn, i.lineTo(e + Math.sin(m) * h, s - Math.cos(m) * g), m += yn, i.lineTo(e + Math.sin(m) * h, s - Math.cos(m) * g), i.closePath();
        break;
      case "rectRounded":
        c = g * 0.516, l = g - c, r = Math.cos(m + Xt) * l, d = Math.cos(m + Xt) * (n ? n / 2 - c : l), a = Math.sin(m + Xt) * l, u = Math.sin(m + Xt) * (n ? n / 2 - c : l), i.arc(e - d, s - a, c, m - F, m - U), i.arc(e + u, s - r, c, m - U, m), i.arc(e + d, s + a, c, m, m + U), i.arc(e - u, s + r, c, m + U, m + F), i.closePath();
        break;
      case "rect":
        if (!p) {
          l = Math.SQRT1_2 * g, h = n ? n / 2 : l, i.rect(e - h, s - l, 2 * h, 2 * l);
          break;
        }
        m += Xt;
      /* falls through */
      case "rectRot":
        d = Math.cos(m) * (n ? n / 2 : g), r = Math.cos(m) * g, a = Math.sin(m) * g, u = Math.sin(m) * (n ? n / 2 : g), i.moveTo(e - d, s - a), i.lineTo(e + u, s - r), i.lineTo(e + d, s + a), i.lineTo(e - u, s + r), i.closePath();
        break;
      case "crossRot":
        m += Xt;
      /* falls through */
      case "cross":
        d = Math.cos(m) * (n ? n / 2 : g), r = Math.cos(m) * g, a = Math.sin(m) * g, u = Math.sin(m) * (n ? n / 2 : g), i.moveTo(e - d, s - a), i.lineTo(e + d, s + a), i.moveTo(e + u, s - r), i.lineTo(e - u, s + r);
        break;
      case "star":
        d = Math.cos(m) * (n ? n / 2 : g), r = Math.cos(m) * g, a = Math.sin(m) * g, u = Math.sin(m) * (n ? n / 2 : g), i.moveTo(e - d, s - a), i.lineTo(e + d, s + a), i.moveTo(e + u, s - r), i.lineTo(e - u, s + r), m += Xt, d = Math.cos(m) * (n ? n / 2 : g), r = Math.cos(m) * g, a = Math.sin(m) * g, u = Math.sin(m) * (n ? n / 2 : g), i.moveTo(e - d, s - a), i.lineTo(e + d, s + a), i.moveTo(e + u, s - r), i.lineTo(e - u, s + r);
        break;
      case "line":
        r = n ? n / 2 : Math.cos(m) * g, a = Math.sin(m) * g, i.moveTo(e - r, s - a), i.lineTo(e + r, s + a);
        break;
      case "dash":
        i.moveTo(e, s), i.lineTo(e + Math.cos(m) * (n ? n / 2 : g), s + Math.sin(m) * g);
        break;
      case !1:
        i.closePath();
        break;
    }
    i.fill(), t.borderWidth > 0 && i.stroke();
  }
}
function Dt(i, t, e) {
  return e = e || 0.5, !t || i && i.x > t.left - e && i.x < t.right + e && i.y > t.top - e && i.y < t.bottom + e;
}
function Li(i, t) {
  i.save(), i.beginPath(), i.rect(t.left, t.top, t.right - t.left, t.bottom - t.top), i.clip();
}
function Ri(i) {
  i.restore();
}
function Ec(i, t, e, s, n) {
  if (!t)
    return i.lineTo(e.x, e.y);
  if (n === "middle") {
    const o = (t.x + e.x) / 2;
    i.lineTo(o, t.y), i.lineTo(o, e.y);
  } else n === "after" != !!s ? i.lineTo(t.x, e.y) : i.lineTo(e.x, t.y);
  i.lineTo(e.x, e.y);
}
function Cc(i, t, e, s) {
  if (!t)
    return i.lineTo(e.x, e.y);
  i.bezierCurveTo(s ? t.cp1x : t.cp2x, s ? t.cp1y : t.cp2y, s ? e.cp2x : e.cp1x, s ? e.cp2y : e.cp1y, e.x, e.y);
}
function Ac(i, t) {
  t.translation && i.translate(t.translation[0], t.translation[1]), I(t.rotation) || i.rotate(t.rotation), t.color && (i.fillStyle = t.color), t.textAlign && (i.textAlign = t.textAlign), t.textBaseline && (i.textBaseline = t.textBaseline);
}
function kc(i, t, e, s, n) {
  if (n.strikethrough || n.underline) {
    const o = i.measureText(s), r = t - o.actualBoundingBoxLeft, a = t + o.actualBoundingBoxRight, l = e - o.actualBoundingBoxAscent, c = e + o.actualBoundingBoxDescent, h = n.strikethrough ? (l + c) / 2 : c;
    i.strokeStyle = i.fillStyle, i.beginPath(), i.lineWidth = n.decorationWidth || 2, i.moveTo(r, h), i.lineTo(a, h), i.stroke();
  }
}
function Oc(i, t) {
  const e = i.fillStyle;
  i.fillStyle = t.color, i.fillRect(t.left, t.top, t.width, t.height), i.fillStyle = e;
}
function oe(i, t, e, s, n, o = {}) {
  const r = W(t) ? t : [
    t
  ], a = o.strokeWidth > 0 && o.strokeColor !== "";
  let l, c;
  for (i.save(), i.font = n.string, Ac(i, o), l = 0; l < r.length; ++l)
    c = r[l], o.backdrop && Oc(i, o.backdrop), a && (o.strokeColor && (i.strokeStyle = o.strokeColor), I(o.strokeWidth) || (i.lineWidth = o.strokeWidth), i.strokeText(c, e, s, o.maxWidth)), i.fillText(c, e, s, o.maxWidth), kc(i, e, s, c, o), s += Number(n.lineHeight);
  i.restore();
}
function je(i, t) {
  const { x: e, y: s, w: n, h: o, radius: r } = t;
  i.arc(e + r.topLeft, s + r.topLeft, r.topLeft, 1.5 * F, F, !0), i.lineTo(e, s + o - r.bottomLeft), i.arc(e + r.bottomLeft, s + o - r.bottomLeft, r.bottomLeft, F, U, !0), i.lineTo(e + n - r.bottomRight, s + o), i.arc(e + n - r.bottomRight, s + o - r.bottomRight, r.bottomRight, U, 0, !0), i.lineTo(e + n, s + r.topRight), i.arc(e + n - r.topRight, s + r.topRight, r.topRight, 0, -U, !0), i.lineTo(e + r.topLeft, s);
}
const Pc = /^(normal|(\d+(?:\.\d+)?)(px|em|%)?)$/, Dc = /^(normal|italic|initial|inherit|unset|(oblique( -?[0-9]?[0-9]deg)?))$/;
function Tc(i, t) {
  const e = ("" + i).match(Pc);
  if (!e || e[1] === "normal")
    return t * 1.2;
  switch (i = +e[2], e[3]) {
    case "px":
      return i;
    case "%":
      i /= 100;
      break;
  }
  return t * i;
}
const Ic = (i) => +i || 0;
function zs(i, t) {
  const e = {}, s = L(t), n = s ? Object.keys(t) : t, o = L(i) ? s ? (r) => k(i[r], i[t[r]]) : (r) => i[r] : () => i;
  for (const r of n)
    e[r] = Ic(o(r));
  return e;
}
function pr(i) {
  return zs(i, {
    top: "y",
    right: "x",
    bottom: "y",
    left: "x"
  });
}
function ie(i) {
  return zs(i, [
    "topLeft",
    "topRight",
    "bottomLeft",
    "bottomRight"
  ]);
}
function nt(i) {
  const t = pr(i);
  return t.width = t.left + t.right, t.height = t.top + t.bottom, t;
}
function X(i, t) {
  i = i || {}, t = t || j.font;
  let e = k(i.size, t.size);
  typeof e == "string" && (e = parseInt(e, 10));
  let s = k(i.style, t.style);
  s && !("" + s).match(Dc) && (console.warn('Invalid font style specified: "' + s + '"'), s = void 0);
  const n = {
    family: k(i.family, t.family),
    lineHeight: Tc(k(i.lineHeight, t.lineHeight), e),
    size: e,
    style: s,
    weight: k(i.weight, t.weight),
    string: ""
  };
  return n.string = wc(n), n;
}
function ke(i, t, e, s) {
  let n, o, r;
  for (n = 0, o = i.length; n < o; ++n)
    if (r = i[n], r !== void 0 && r !== void 0)
      return r;
}
function Lc(i, t, e) {
  const { min: s, max: n } = i, o = ir(t, (n - s) / 2), r = (a, l) => e && a === 0 ? 0 : a + l;
  return {
    min: r(s, -Math.abs(o)),
    max: r(n, o)
  };
}
function Yt(i, t) {
  return Object.assign(Object.create(i), t);
}
function Hs(i, t = [
  ""
], e, s, n = () => i[0]) {
  const o = e || i;
  typeof s > "u" && (s = _r("_fallback", i));
  const r = {
    [Symbol.toStringTag]: "Object",
    _cacheable: !0,
    _scopes: i,
    _rootScopes: o,
    _fallback: s,
    _getTarget: n,
    override: (a) => Hs([
      a,
      ...i
    ], t, o, s)
  };
  return new Proxy(r, {
    /**
    * A trap for the delete operator.
    */
    deleteProperty(a, l) {
      return delete a[l], delete a._keys, delete i[0][l], !0;
    },
    /**
    * A trap for getting property values.
    */
    get(a, l) {
      return mr(a, l, () => Wc(l, t, i, a));
    },
    /**
    * A trap for Object.getOwnPropertyDescriptor.
    * Also used by Object.hasOwnProperty.
    */
    getOwnPropertyDescriptor(a, l) {
      return Reflect.getOwnPropertyDescriptor(a._scopes[0], l);
    },
    /**
    * A trap for Object.getPrototypeOf.
    */
    getPrototypeOf() {
      return Reflect.getPrototypeOf(i[0]);
    },
    /**
    * A trap for the in operator.
    */
    has(a, l) {
      return On(a).includes(l);
    },
    /**
    * A trap for Object.getOwnPropertyNames and Object.getOwnPropertySymbols.
    */
    ownKeys(a) {
      return On(a);
    },
    /**
    * A trap for setting property values.
    */
    set(a, l, c) {
      const h = a._storage || (a._storage = n());
      return a[l] = h[l] = c, delete a._keys, !0;
    }
  });
}
function ge(i, t, e, s) {
  const n = {
    _cacheable: !1,
    _proxy: i,
    _context: t,
    _subProxy: e,
    _stack: /* @__PURE__ */ new Set(),
    _descriptors: gr(i, s),
    setContext: (o) => ge(i, o, e, s),
    override: (o) => ge(i.override(o), t, e, s)
  };
  return new Proxy(n, {
    /**
    * A trap for the delete operator.
    */
    deleteProperty(o, r) {
      return delete o[r], delete i[r], !0;
    },
    /**
    * A trap for getting property values.
    */
    get(o, r, a) {
      return mr(o, r, () => Fc(o, r, a));
    },
    /**
    * A trap for Object.getOwnPropertyDescriptor.
    * Also used by Object.hasOwnProperty.
    */
    getOwnPropertyDescriptor(o, r) {
      return o._descriptors.allKeys ? Reflect.has(i, r) ? {
        enumerable: !0,
        configurable: !0
      } : void 0 : Reflect.getOwnPropertyDescriptor(i, r);
    },
    /**
    * A trap for Object.getPrototypeOf.
    */
    getPrototypeOf() {
      return Reflect.getPrototypeOf(i);
    },
    /**
    * A trap for the in operator.
    */
    has(o, r) {
      return Reflect.has(i, r);
    },
    /**
    * A trap for Object.getOwnPropertyNames and Object.getOwnPropertySymbols.
    */
    ownKeys() {
      return Reflect.ownKeys(i);
    },
    /**
    * A trap for setting property values.
    */
    set(o, r, a) {
      return i[r] = a, delete o[r], !0;
    }
  });
}
function gr(i, t = {
  scriptable: !0,
  indexable: !0
}) {
  const { _scriptable: e = t.scriptable, _indexable: s = t.indexable, _allKeys: n = t.allKeys } = i;
  return {
    allKeys: n,
    scriptable: e,
    indexable: s,
    isScriptable: jt(e) ? e : () => e,
    isIndexable: jt(s) ? s : () => s
  };
}
const Rc = (i, t) => i ? i + Ls(t) : t, Vs = (i, t) => L(t) && i !== "adapters" && (Object.getPrototypeOf(t) === null || t.constructor === Object);
function mr(i, t, e) {
  if (Object.prototype.hasOwnProperty.call(i, t) || t === "constructor")
    return i[t];
  const s = e();
  return i[t] = s, s;
}
function Fc(i, t, e) {
  const { _proxy: s, _context: n, _subProxy: o, _descriptors: r } = i;
  let a = s[t];
  return jt(a) && r.isScriptable(t) && (a = Nc(t, a, i, e)), W(a) && a.length && (a = Bc(t, a, i, r.isIndexable)), Vs(t, a) && (a = ge(a, n, o && o[t], r)), a;
}
function Nc(i, t, e, s) {
  const { _proxy: n, _context: o, _subProxy: r, _stack: a } = e;
  if (a.has(i))
    throw new Error("Recursion detected: " + Array.from(a).join("->") + "->" + i);
  a.add(i);
  let l = t(o, r || s);
  return a.delete(i), Vs(i, l) && (l = Ws(n._scopes, n, i, l)), l;
}
function Bc(i, t, e, s) {
  const { _proxy: n, _context: o, _subProxy: r, _descriptors: a } = e;
  if (typeof o.index < "u" && s(i))
    return t[o.index % t.length];
  if (L(t[0])) {
    const l = t, c = n._scopes.filter((h) => h !== l);
    t = [];
    for (const h of l) {
      const d = Ws(c, n, i, h);
      t.push(ge(d, o, r && r[i], a));
    }
  }
  return t;
}
function br(i, t, e) {
  return jt(i) ? i(t, e) : i;
}
const zc = (i, t) => i === !0 ? t : typeof i == "string" ? Wt(t, i) : void 0;
function Hc(i, t, e, s, n) {
  for (const o of t) {
    const r = zc(e, o);
    if (r) {
      i.add(r);
      const a = br(r._fallback, e, n);
      if (typeof a < "u" && a !== e && a !== s)
        return a;
    } else if (r === !1 && typeof s < "u" && e !== s)
      return null;
  }
  return !1;
}
function Ws(i, t, e, s) {
  const n = t._rootScopes, o = br(t._fallback, e, s), r = [
    ...i,
    ...n
  ], a = /* @__PURE__ */ new Set();
  a.add(s);
  let l = kn(a, r, e, o || e, s);
  return l === null || typeof o < "u" && o !== e && (l = kn(a, r, o, l, s), l === null) ? !1 : Hs(Array.from(a), [
    ""
  ], n, o, () => Vc(t, e, s));
}
function kn(i, t, e, s, n) {
  for (; e; )
    e = Hc(i, t, e, s, n);
  return e;
}
function Vc(i, t, e) {
  const s = i._getTarget();
  t in s || (s[t] = {});
  const n = s[t];
  return W(n) && L(e) ? e : n || {};
}
function Wc(i, t, e, s) {
  let n;
  for (const o of t)
    if (n = _r(Rc(o, i), e), typeof n < "u")
      return Vs(i, n) ? Ws(e, s, i, n) : n;
}
function _r(i, t) {
  for (const e of t) {
    if (!e)
      continue;
    const s = e[i];
    if (typeof s < "u")
      return s;
  }
}
function On(i) {
  let t = i._keys;
  return t || (t = i._keys = jc(i._scopes)), t;
}
function jc(i) {
  const t = /* @__PURE__ */ new Set();
  for (const e of i)
    for (const s of Object.keys(e).filter((n) => !n.startsWith("_")))
      t.add(s);
  return Array.from(t);
}
function yr(i, t, e, s) {
  const { iScale: n } = i, { key: o = "r" } = this._parsing, r = new Array(s);
  let a, l, c, h;
  for (a = 0, l = s; a < l; ++a)
    c = a + e, h = t[c], r[a] = {
      r: n.parse(Wt(h, o), c)
    };
  return r;
}
const $c = Number.EPSILON || 1e-14, me = (i, t) => t < i.length && !i[t].skip && i[t], vr = (i) => i === "x" ? "y" : "x";
function Yc(i, t, e, s) {
  const n = i.skip ? t : i, o = t, r = e.skip ? t : e, a = us(o, n), l = us(r, o);
  let c = a / (a + l), h = l / (a + l);
  c = isNaN(c) ? 0 : c, h = isNaN(h) ? 0 : h;
  const d = s * c, u = s * h;
  return {
    previous: {
      x: o.x - d * (r.x - n.x),
      y: o.y - d * (r.y - n.y)
    },
    next: {
      x: o.x + u * (r.x - n.x),
      y: o.y + u * (r.y - n.y)
    }
  };
}
function Kc(i, t, e) {
  const s = i.length;
  let n, o, r, a, l, c = me(i, 0);
  for (let h = 0; h < s - 1; ++h)
    if (l = c, c = me(i, h + 1), !(!l || !c)) {
      if (Re(t[h], 0, $c)) {
        e[h] = e[h + 1] = 0;
        continue;
      }
      n = e[h] / t[h], o = e[h + 1] / t[h], a = Math.pow(n, 2) + Math.pow(o, 2), !(a <= 9) && (r = 3 / Math.sqrt(a), e[h] = n * r * t[h], e[h + 1] = o * r * t[h]);
    }
}
function Uc(i, t, e = "x") {
  const s = vr(e), n = i.length;
  let o, r, a, l = me(i, 0);
  for (let c = 0; c < n; ++c) {
    if (r = a, a = l, l = me(i, c + 1), !a)
      continue;
    const h = a[e], d = a[s];
    r && (o = (h - r[e]) / 3, a[`cp1${e}`] = h - o, a[`cp1${s}`] = d - o * t[c]), l && (o = (l[e] - h) / 3, a[`cp2${e}`] = h + o, a[`cp2${s}`] = d + o * t[c]);
  }
}
function Xc(i, t = "x") {
  const e = vr(t), s = i.length, n = Array(s).fill(0), o = Array(s);
  let r, a, l, c = me(i, 0);
  for (r = 0; r < s; ++r)
    if (a = l, l = c, c = me(i, r + 1), !!l) {
      if (c) {
        const h = c[t] - l[t];
        n[r] = h !== 0 ? (c[e] - l[e]) / h : 0;
      }
      o[r] = a ? c ? St(n[r - 1]) !== St(n[r]) ? 0 : (n[r - 1] + n[r]) / 2 : n[r - 1] : n[r];
    }
  Kc(i, n, o), Uc(i, o, t);
}
function ni(i, t, e) {
  return Math.max(Math.min(i, e), t);
}
function Gc(i, t) {
  let e, s, n, o, r, a = Dt(i[0], t);
  for (e = 0, s = i.length; e < s; ++e)
    r = o, o = a, a = e < s - 1 && Dt(i[e + 1], t), o && (n = i[e], r && (n.cp1x = ni(n.cp1x, t.left, t.right), n.cp1y = ni(n.cp1y, t.top, t.bottom)), a && (n.cp2x = ni(n.cp2x, t.left, t.right), n.cp2y = ni(n.cp2y, t.top, t.bottom)));
}
function qc(i, t, e, s, n) {
  let o, r, a, l;
  if (t.spanGaps && (i = i.filter((c) => !c.skip)), t.cubicInterpolationMode === "monotone")
    Xc(i, n);
  else {
    let c = s ? i[i.length - 1] : i[0];
    for (o = 0, r = i.length; o < r; ++o)
      a = i[o], l = Yc(c, a, i[Math.min(o + 1, r - (s ? 0 : 1)) % r], t.tension), a.cp1x = l.previous.x, a.cp1y = l.previous.y, a.cp2x = l.next.x, a.cp2y = l.next.y, c = a;
  }
  t.capBezierPoints && Gc(i, e);
}
function js() {
  return typeof window < "u" && typeof document < "u";
}
function $s(i) {
  let t = i.parentNode;
  return t && t.toString() === "[object ShadowRoot]" && (t = t.host), t;
}
function ki(i, t, e) {
  let s;
  return typeof i == "string" ? (s = parseInt(i, 10), i.indexOf("%") !== -1 && (s = s / 100 * t.parentNode[e])) : s = i, s;
}
const Fi = (i) => i.ownerDocument.defaultView.getComputedStyle(i, null);
function Jc(i, t) {
  return Fi(i).getPropertyValue(t);
}
const Qc = [
  "top",
  "right",
  "bottom",
  "left"
];
function se(i, t, e) {
  const s = {};
  e = e ? "-" + e : "";
  for (let n = 0; n < 4; n++) {
    const o = Qc[n];
    s[o] = parseFloat(i[t + "-" + o + e]) || 0;
  }
  return s.width = s.left + s.right, s.height = s.top + s.bottom, s;
}
const Zc = (i, t, e) => (i > 0 || t > 0) && (!e || !e.shadowRoot);
function th(i, t) {
  const e = i.touches, s = e && e.length ? e[0] : i, { offsetX: n, offsetY: o } = s;
  let r = !1, a, l;
  if (Zc(n, o, i.target))
    a = n, l = o;
  else {
    const c = t.getBoundingClientRect();
    a = s.clientX - c.left, l = s.clientY - c.top, r = !0;
  }
  return {
    x: a,
    y: l,
    box: r
  };
}
function Qt(i, t) {
  if ("native" in i)
    return i;
  const { canvas: e, currentDevicePixelRatio: s } = t, n = Fi(e), o = n.boxSizing === "border-box", r = se(n, "padding"), a = se(n, "border", "width"), { x: l, y: c, box: h } = th(i, e), d = r.left + (h && a.left), u = r.top + (h && a.top);
  let { width: f, height: p } = t;
  return o && (f -= r.width + a.width, p -= r.height + a.height), {
    x: Math.round((l - d) / f * e.width / s),
    y: Math.round((c - u) / p * e.height / s)
  };
}
function eh(i, t, e) {
  let s, n;
  if (t === void 0 || e === void 0) {
    const o = i && $s(i);
    if (!o)
      t = i.clientWidth, e = i.clientHeight;
    else {
      const r = o.getBoundingClientRect(), a = Fi(o), l = se(a, "border", "width"), c = se(a, "padding");
      t = r.width - c.width - l.width, e = r.height - c.height - l.height, s = ki(a.maxWidth, o, "clientWidth"), n = ki(a.maxHeight, o, "clientHeight");
    }
  }
  return {
    width: t,
    height: e,
    maxWidth: s || Ci,
    maxHeight: n || Ci
  };
}
const Bt = (i) => Math.round(i * 10) / 10;
function ih(i, t, e, s) {
  const n = Fi(i), o = se(n, "margin"), r = ki(n.maxWidth, i, "clientWidth") || Ci, a = ki(n.maxHeight, i, "clientHeight") || Ci, l = eh(i, t, e);
  let { width: c, height: h } = l;
  if (n.boxSizing === "content-box") {
    const u = se(n, "border", "width"), f = se(n, "padding");
    c -= f.width + u.width, h -= f.height + u.height;
  }
  return c = Math.max(0, c - o.width), h = Math.max(0, s ? c / s : h - o.height), c = Bt(Math.min(c, r, l.maxWidth)), h = Bt(Math.min(h, a, l.maxHeight)), c && !h && (h = Bt(c / 2)), (t !== void 0 || e !== void 0) && s && l.height && h > l.height && (h = l.height, c = Bt(Math.floor(h * s))), {
    width: c,
    height: h
  };
}
function Pn(i, t, e) {
  const s = t || 1, n = Bt(i.height * s), o = Bt(i.width * s);
  i.height = Bt(i.height), i.width = Bt(i.width);
  const r = i.canvas;
  return r.style && (e || !r.style.height && !r.style.width) && (r.style.height = `${i.height}px`, r.style.width = `${i.width}px`), i.currentDevicePixelRatio !== s || r.height !== n || r.width !== o ? (i.currentDevicePixelRatio = s, r.height = n, r.width = o, i.ctx.setTransform(s, 0, 0, s, 0, 0), !0) : !1;
}
const sh = (function() {
  let i = !1;
  try {
    const t = {
      get passive() {
        return i = !0, !1;
      }
    };
    js() && (window.addEventListener("test", null, t), window.removeEventListener("test", null, t));
  } catch {
  }
  return i;
})();
function Dn(i, t) {
  const e = Jc(i, t), s = e && e.match(/^(\d+)(\.\d+)?px$/);
  return s ? +s[1] : void 0;
}
function Zt(i, t, e, s) {
  return {
    x: i.x + e * (t.x - i.x),
    y: i.y + e * (t.y - i.y)
  };
}
function nh(i, t, e, s) {
  return {
    x: i.x + e * (t.x - i.x),
    y: s === "middle" ? e < 0.5 ? i.y : t.y : s === "after" ? e < 1 ? i.y : t.y : e > 0 ? t.y : i.y
  };
}
function oh(i, t, e, s) {
  const n = {
    x: i.cp2x,
    y: i.cp2y
  }, o = {
    x: t.cp1x,
    y: t.cp1y
  }, r = Zt(i, n, e), a = Zt(n, o, e), l = Zt(o, t, e), c = Zt(r, a, e), h = Zt(a, l, e);
  return Zt(c, h, e);
}
const rh = function(i, t) {
  return {
    x(e) {
      return i + i + t - e;
    },
    setWidth(e) {
      t = e;
    },
    textAlign(e) {
      return e === "center" ? e : e === "right" ? "left" : "right";
    },
    xPlus(e, s) {
      return e - s;
    },
    leftForLtr(e, s) {
      return e - s;
    }
  };
}, ah = function() {
  return {
    x(i) {
      return i;
    },
    setWidth(i) {
    },
    textAlign(i) {
      return i;
    },
    xPlus(i, t) {
      return i + t;
    },
    leftForLtr(i, t) {
      return i;
    }
  };
};
function fe(i, t, e) {
  return i ? rh(t, e) : ah();
}
function xr(i, t) {
  let e, s;
  (t === "ltr" || t === "rtl") && (e = i.canvas.style, s = [
    e.getPropertyValue("direction"),
    e.getPropertyPriority("direction")
  ], e.setProperty("direction", t, "important"), i.prevTextDirection = s);
}
function Sr(i, t) {
  t !== void 0 && (delete i.prevTextDirection, i.canvas.style.setProperty("direction", t[0], t[1]));
}
function wr(i) {
  return i === "angle" ? {
    between: We,
    compare: lc,
    normalize: et
  } : {
    between: Ot,
    compare: (t, e) => t - e,
    normalize: (t) => t
  };
}
function Tn({ start: i, end: t, count: e, loop: s, style: n }) {
  return {
    start: i % e,
    end: t % e,
    loop: s && (t - i + 1) % e === 0,
    style: n
  };
}
function lh(i, t, e) {
  const { property: s, start: n, end: o } = e, { between: r, normalize: a } = wr(s), l = t.length;
  let { start: c, end: h, loop: d } = i, u, f;
  if (d) {
    for (c += l, h += l, u = 0, f = l; u < f && r(a(t[c % l][s]), n, o); ++u)
      c--, h--;
    c %= l, h %= l;
  }
  return h < c && (h += l), {
    start: c,
    end: h,
    loop: d,
    style: i.style
  };
}
function Mr(i, t, e) {
  if (!e)
    return [
      i
    ];
  const { property: s, start: n, end: o } = e, r = t.length, { compare: a, between: l, normalize: c } = wr(s), { start: h, end: d, loop: u, style: f } = lh(i, t, e), p = [];
  let g = !1, m = null, b, _, v;
  const x = () => l(n, v, b) && a(n, v) !== 0, y = () => a(o, b) === 0 || l(o, v, b), M = () => g || x(), S = () => !g || y();
  for (let w = h, C = h; w <= d; ++w)
    _ = t[w % r], !_.skip && (b = c(_[s]), b !== v && (g = l(b, n, o), m === null && M() && (m = a(b, n) === 0 ? w : C), m !== null && S() && (p.push(Tn({
      start: m,
      end: w,
      loop: u,
      count: r,
      style: f
    })), m = null), C = w, v = b));
  return m !== null && p.push(Tn({
    start: m,
    end: d,
    loop: u,
    count: r,
    style: f
  })), p;
}
function Er(i, t) {
  const e = [], s = i.segments;
  for (let n = 0; n < s.length; n++) {
    const o = Mr(s[n], i.points, t);
    o.length && e.push(...o);
  }
  return e;
}
function ch(i, t, e, s) {
  let n = 0, o = t - 1;
  if (e && !s)
    for (; n < t && !i[n].skip; )
      n++;
  for (; n < t && i[n].skip; )
    n++;
  for (n %= t, e && (o += n); o > n && i[o % t].skip; )
    o--;
  return o %= t, {
    start: n,
    end: o
  };
}
function hh(i, t, e, s) {
  const n = i.length, o = [];
  let r = t, a = i[t], l;
  for (l = t + 1; l <= e; ++l) {
    const c = i[l % n];
    c.skip || c.stop ? a.skip || (s = !1, o.push({
      start: t % n,
      end: (l - 1) % n,
      loop: s
    }), t = r = c.stop ? l : null) : (r = l, a.skip && (t = l)), a = c;
  }
  return r !== null && o.push({
    start: t % n,
    end: r % n,
    loop: s
  }), o;
}
function dh(i, t) {
  const e = i.points, s = i.options.spanGaps, n = e.length;
  if (!n)
    return [];
  const o = !!i._loop, { start: r, end: a } = ch(e, n, o, s);
  if (s === !0)
    return In(i, [
      {
        start: r,
        end: a,
        loop: o
      }
    ], e, t);
  const l = a < r ? a + n : a, c = !!i._fullLoop && r === 0 && a === n - 1;
  return In(i, hh(e, r, l, c), e, t);
}
function In(i, t, e, s) {
  return !s || !s.setContext || !e ? t : uh(i, t, e, s);
}
function uh(i, t, e, s) {
  const n = i._chart.getContext(), o = Ln(i.options), { _datasetIndex: r, options: { spanGaps: a } } = i, l = e.length, c = [];
  let h = o, d = t[0].start, u = d;
  function f(p, g, m, b) {
    const _ = a ? -1 : 1;
    if (p !== g) {
      for (p += l; e[p % l].skip; )
        p -= _;
      for (; e[g % l].skip; )
        g += _;
      p % l !== g % l && (c.push({
        start: p % l,
        end: g % l,
        loop: m,
        style: b
      }), h = b, d = g % l);
    }
  }
  for (const p of t) {
    d = a ? d : p.start;
    let g = e[d % l], m;
    for (u = d + 1; u <= p.end; u++) {
      const b = e[u % l];
      m = Ln(s.setContext(Yt(n, {
        type: "segment",
        p0: g,
        p1: b,
        p0DataIndex: (u - 1) % l,
        p1DataIndex: u % l,
        datasetIndex: r
      }))), fh(m, h) && f(d, u - 1, p.loop, h), g = b, h = m;
    }
    d < u - 1 && f(d, u - 1, p.loop, h);
  }
  return c;
}
function Ln(i) {
  return {
    backgroundColor: i.backgroundColor,
    borderCapStyle: i.borderCapStyle,
    borderDash: i.borderDash,
    borderDashOffset: i.borderDashOffset,
    borderJoinStyle: i.borderJoinStyle,
    borderWidth: i.borderWidth,
    borderColor: i.borderColor
  };
}
function fh(i, t) {
  if (!t)
    return !1;
  const e = [], s = function(n, o) {
    return Bs(o) ? (e.includes(o) || e.push(o), e.indexOf(o)) : o;
  };
  return JSON.stringify(i, s) !== JSON.stringify(t, s);
}
function oi(i, t, e) {
  return i.options.clip ? i[e] : t[e];
}
function ph(i, t) {
  const { xScale: e, yScale: s } = i;
  return e && s ? {
    left: oi(e, t, "left"),
    right: oi(e, t, "right"),
    top: oi(s, t, "top"),
    bottom: oi(s, t, "bottom")
  } : t;
}
function Cr(i, t) {
  const e = t._clip;
  if (e.disabled)
    return !1;
  const s = ph(t, i.chartArea);
  return {
    left: e.left === !1 ? 0 : s.left - (e.left === !0 ? 0 : e.left),
    right: e.right === !1 ? i.width : s.right + (e.right === !0 ? 0 : e.right),
    top: e.top === !1 ? 0 : s.top - (e.top === !0 ? 0 : e.top),
    bottom: e.bottom === !1 ? i.height : s.bottom + (e.bottom === !0 ? 0 : e.bottom)
  };
}
/*!
 * Chart.js v4.5.1
 * https://www.chartjs.org
 * (c) 2025 Chart.js Contributors
 * Released under the MIT License
 */
class gh {
  constructor() {
    this._request = null, this._charts = /* @__PURE__ */ new Map(), this._running = !1, this._lastDate = void 0;
  }
  _notify(t, e, s, n) {
    const o = e.listeners[n], r = e.duration;
    o.forEach((a) => a({
      chart: t,
      initial: e.initial,
      numSteps: r,
      currentStep: Math.min(s - e.start, r)
    }));
  }
  _refresh() {
    this._request || (this._running = !0, this._request = lr.call(window, () => {
      this._update(), this._request = null, this._running && this._refresh();
    }));
  }
  _update(t = Date.now()) {
    let e = 0;
    this._charts.forEach((s, n) => {
      if (!s.running || !s.items.length)
        return;
      const o = s.items;
      let r = o.length - 1, a = !1, l;
      for (; r >= 0; --r)
        l = o[r], l._active ? (l._total > s.duration && (s.duration = l._total), l.tick(t), a = !0) : (o[r] = o[o.length - 1], o.pop());
      a && (n.draw(), this._notify(n, s, t, "progress")), o.length || (s.running = !1, this._notify(n, s, t, "complete"), s.initial = !1), e += o.length;
    }), this._lastDate = t, e === 0 && (this._running = !1);
  }
  _getAnims(t) {
    const e = this._charts;
    let s = e.get(t);
    return s || (s = {
      running: !1,
      initial: !0,
      items: [],
      listeners: {
        complete: [],
        progress: []
      }
    }, e.set(t, s)), s;
  }
  listen(t, e, s) {
    this._getAnims(t).listeners[e].push(s);
  }
  add(t, e) {
    !e || !e.length || this._getAnims(t).items.push(...e);
  }
  has(t) {
    return this._getAnims(t).items.length > 0;
  }
  start(t) {
    const e = this._charts.get(t);
    e && (e.running = !0, e.start = Date.now(), e.duration = e.items.reduce((s, n) => Math.max(s, n._duration), 0), this._refresh());
  }
  running(t) {
    if (!this._running)
      return !1;
    const e = this._charts.get(t);
    return !(!e || !e.running || !e.items.length);
  }
  stop(t) {
    const e = this._charts.get(t);
    if (!e || !e.items.length)
      return;
    const s = e.items;
    let n = s.length - 1;
    for (; n >= 0; --n)
      s[n].cancel();
    e.items = [], this._notify(t, e, Date.now(), "complete");
  }
  remove(t) {
    return this._charts.delete(t);
  }
}
var Et = /* @__PURE__ */ new gh();
const Rn = "transparent", mh = {
  boolean(i, t, e) {
    return e > 0.5 ? t : i;
  },
  color(i, t, e) {
    const s = En(i || Rn), n = s.valid && En(t || Rn);
    return n && n.valid ? n.mix(s, e).hexString() : t;
  },
  number(i, t, e) {
    return i + (t - i) * e;
  }
};
class bh {
  constructor(t, e, s, n) {
    const o = e[s];
    n = ke([
      t.to,
      n,
      o,
      t.from
    ]);
    const r = ke([
      t.from,
      o,
      n
    ]);
    this._active = !0, this._fn = t.fn || mh[t.type || typeof r], this._easing = Fe[t.easing] || Fe.linear, this._start = Math.floor(Date.now() + (t.delay || 0)), this._duration = this._total = Math.floor(t.duration), this._loop = !!t.loop, this._target = e, this._prop = s, this._from = r, this._to = n, this._promises = void 0;
  }
  active() {
    return this._active;
  }
  update(t, e, s) {
    if (this._active) {
      this._notify(!1);
      const n = this._target[this._prop], o = s - this._start, r = this._duration - o;
      this._start = s, this._duration = Math.floor(Math.max(r, t.duration)), this._total += o, this._loop = !!t.loop, this._to = ke([
        t.to,
        e,
        n,
        t.from
      ]), this._from = ke([
        t.from,
        n,
        e
      ]);
    }
  }
  cancel() {
    this._active && (this.tick(Date.now()), this._active = !1, this._notify(!1));
  }
  tick(t) {
    const e = t - this._start, s = this._duration, n = this._prop, o = this._from, r = this._loop, a = this._to;
    let l;
    if (this._active = o !== a && (r || e < s), !this._active) {
      this._target[n] = a, this._notify(!0);
      return;
    }
    if (e < 0) {
      this._target[n] = o;
      return;
    }
    l = e / s % 2, l = r && l > 1 ? 2 - l : l, l = this._easing(Math.min(1, Math.max(0, l))), this._target[n] = this._fn(o, a, l);
  }
  wait() {
    const t = this._promises || (this._promises = []);
    return new Promise((e, s) => {
      t.push({
        res: e,
        rej: s
      });
    });
  }
  _notify(t) {
    const e = t ? "res" : "rej", s = this._promises || [];
    for (let n = 0; n < s.length; n++)
      s[n][e]();
  }
}
class Ar {
  constructor(t, e) {
    this._chart = t, this._properties = /* @__PURE__ */ new Map(), this.configure(e);
  }
  configure(t) {
    if (!L(t))
      return;
    const e = Object.keys(j.animation), s = this._properties;
    Object.getOwnPropertyNames(t).forEach((n) => {
      const o = t[n];
      if (!L(o))
        return;
      const r = {};
      for (const a of e)
        r[a] = o[a];
      (W(o.properties) && o.properties || [
        n
      ]).forEach((a) => {
        (a === n || !s.has(a)) && s.set(a, r);
      });
    });
  }
  _animateOptions(t, e) {
    const s = e.options, n = yh(t, s);
    if (!n)
      return [];
    const o = this._createAnimations(n, s);
    return s.$shared && _h(t.options.$animations, s).then(() => {
      t.options = s;
    }, () => {
    }), o;
  }
  _createAnimations(t, e) {
    const s = this._properties, n = [], o = t.$animations || (t.$animations = {}), r = Object.keys(e), a = Date.now();
    let l;
    for (l = r.length - 1; l >= 0; --l) {
      const c = r[l];
      if (c.charAt(0) === "$")
        continue;
      if (c === "options") {
        n.push(...this._animateOptions(t, e));
        continue;
      }
      const h = e[c];
      let d = o[c];
      const u = s.get(c);
      if (d)
        if (u && d.active()) {
          d.update(u, h, a);
          continue;
        } else
          d.cancel();
      if (!u || !u.duration) {
        t[c] = h;
        continue;
      }
      o[c] = d = new bh(u, t, c, h), n.push(d);
    }
    return n;
  }
  update(t, e) {
    if (this._properties.size === 0) {
      Object.assign(t, e);
      return;
    }
    const s = this._createAnimations(t, e);
    if (s.length)
      return Et.add(this._chart, s), !0;
  }
}
function _h(i, t) {
  const e = [], s = Object.keys(t);
  for (let n = 0; n < s.length; n++) {
    const o = i[s[n]];
    o && o.active() && e.push(o.wait());
  }
  return Promise.all(e);
}
function yh(i, t) {
  if (!t)
    return;
  let e = i.options;
  if (!e) {
    i.options = t;
    return;
  }
  return e.$shared && (i.options = e = Object.assign({}, e, {
    $shared: !1,
    $animations: {}
  })), e;
}
function Fn(i, t) {
  const e = i && i.options || {}, s = e.reverse, n = e.min === void 0 ? t : 0, o = e.max === void 0 ? t : 0;
  return {
    start: s ? o : n,
    end: s ? n : o
  };
}
function vh(i, t, e) {
  if (e === !1)
    return !1;
  const s = Fn(i, e), n = Fn(t, e);
  return {
    top: n.end,
    right: s.end,
    bottom: n.start,
    left: s.start
  };
}
function xh(i) {
  let t, e, s, n;
  return L(i) ? (t = i.top, e = i.right, s = i.bottom, n = i.left) : t = e = s = n = i, {
    top: t,
    right: e,
    bottom: s,
    left: n,
    disabled: i === !1
  };
}
function kr(i, t) {
  const e = [], s = i._getSortedDatasetMetas(t);
  let n, o;
  for (n = 0, o = s.length; n < o; ++n)
    e.push(s[n].index);
  return e;
}
function Nn(i, t, e, s = {}) {
  const n = i.keys, o = s.mode === "single";
  let r, a, l, c;
  if (t === null)
    return;
  let h = !1;
  for (r = 0, a = n.length; r < a; ++r) {
    if (l = +n[r], l === e) {
      if (h = !0, s.all)
        continue;
      break;
    }
    c = i.values[l], $(c) && (o || t === 0 || St(t) === St(c)) && (t += c);
  }
  return !h && !s.all ? 0 : t;
}
function Sh(i, t) {
  const { iScale: e, vScale: s } = t, n = e.axis === "x" ? "x" : "y", o = s.axis === "x" ? "x" : "y", r = Object.keys(i), a = new Array(r.length);
  let l, c, h;
  for (l = 0, c = r.length; l < c; ++l)
    h = r[l], a[l] = {
      [n]: h,
      [o]: i[h]
    };
  return a;
}
function Ui(i, t) {
  const e = i && i.options.stacked;
  return e || e === void 0 && t.stack !== void 0;
}
function wh(i, t, e) {
  return `${i.id}.${t.id}.${e.stack || e.type}`;
}
function Mh(i) {
  const { min: t, max: e, minDefined: s, maxDefined: n } = i.getUserBounds();
  return {
    min: s ? t : Number.NEGATIVE_INFINITY,
    max: n ? e : Number.POSITIVE_INFINITY
  };
}
function Eh(i, t, e) {
  const s = i[t] || (i[t] = {});
  return s[e] || (s[e] = {});
}
function Bn(i, t, e, s) {
  for (const n of t.getMatchingVisibleMetas(s).reverse()) {
    const o = i[n.index];
    if (e && o > 0 || !e && o < 0)
      return n.index;
  }
  return null;
}
function zn(i, t) {
  const { chart: e, _cachedMeta: s } = i, n = e._stacks || (e._stacks = {}), { iScale: o, vScale: r, index: a } = s, l = o.axis, c = r.axis, h = wh(o, r, s), d = t.length;
  let u;
  for (let f = 0; f < d; ++f) {
    const p = t[f], { [l]: g, [c]: m } = p, b = p._stacks || (p._stacks = {});
    u = b[c] = Eh(n, h, g), u[a] = m, u._top = Bn(u, r, !0, s.type), u._bottom = Bn(u, r, !1, s.type);
    const _ = u._visualValues || (u._visualValues = {});
    _[a] = m;
  }
}
function Xi(i, t) {
  const e = i.scales;
  return Object.keys(e).filter((s) => e[s].axis === t).shift();
}
function Ch(i, t) {
  return Yt(i, {
    active: !1,
    dataset: void 0,
    datasetIndex: t,
    index: t,
    mode: "default",
    type: "dataset"
  });
}
function Ah(i, t, e) {
  return Yt(i, {
    active: !1,
    dataIndex: t,
    parsed: void 0,
    raw: void 0,
    element: e,
    index: t,
    mode: "default",
    type: "data"
  });
}
function xe(i, t) {
  const e = i.controller.index, s = i.vScale && i.vScale.axis;
  if (s) {
    t = t || i._parsed;
    for (const n of t) {
      const o = n._stacks;
      if (!o || o[s] === void 0 || o[s][e] === void 0)
        return;
      delete o[s][e], o[s]._visualValues !== void 0 && o[s]._visualValues[e] !== void 0 && delete o[s]._visualValues[e];
    }
  }
}
const Gi = (i) => i === "reset" || i === "none", Hn = (i, t) => t ? i : Object.assign({}, i), kh = (i, t, e) => i && !t.hidden && t._stacked && {
  keys: kr(e, !0),
  values: null
};
class gt {
  constructor(t, e) {
    this.chart = t, this._ctx = t.ctx, this.index = e, this._cachedDataOpts = {}, this._cachedMeta = this.getMeta(), this._type = this._cachedMeta.type, this.options = void 0, this._parsing = !1, this._data = void 0, this._objectData = void 0, this._sharedOptions = void 0, this._drawStart = void 0, this._drawCount = void 0, this.enableOptionSharing = !1, this.supportsDecimation = !1, this.$context = void 0, this._syncList = [], this.datasetElementType = new.target.datasetElementType, this.dataElementType = new.target.dataElementType, this.initialize();
  }
  initialize() {
    const t = this._cachedMeta;
    this.configure(), this.linkScales(), t._stacked = Ui(t.vScale, t), this.addElements(), this.options.fill && !this.chart.isPluginEnabled("filler") && console.warn("Tried to use the 'fill' option without the 'Filler' plugin enabled. Please import and register the 'Filler' plugin and make sure it is not disabled in the options");
  }
  updateIndex(t) {
    this.index !== t && xe(this._cachedMeta), this.index = t;
  }
  linkScales() {
    const t = this.chart, e = this._cachedMeta, s = this.getDataset(), n = (d, u, f, p) => d === "x" ? u : d === "r" ? p : f, o = e.xAxisID = k(s.xAxisID, Xi(t, "x")), r = e.yAxisID = k(s.yAxisID, Xi(t, "y")), a = e.rAxisID = k(s.rAxisID, Xi(t, "r")), l = e.indexAxis, c = e.iAxisID = n(l, o, r, a), h = e.vAxisID = n(l, r, o, a);
    e.xScale = this.getScaleForId(o), e.yScale = this.getScaleForId(r), e.rScale = this.getScaleForId(a), e.iScale = this.getScaleForId(c), e.vScale = this.getScaleForId(h);
  }
  getDataset() {
    return this.chart.data.datasets[this.index];
  }
  getMeta() {
    return this.chart.getDatasetMeta(this.index);
  }
  getScaleForId(t) {
    return this.chart.scales[t];
  }
  _getOtherScale(t) {
    const e = this._cachedMeta;
    return t === e.iScale ? e.vScale : e.iScale;
  }
  reset() {
    this._update("reset");
  }
  _destroy() {
    const t = this._cachedMeta;
    this._data && Sn(this._data, this), t._stacked && xe(t);
  }
  _dataCheck() {
    const t = this.getDataset(), e = t.data || (t.data = []), s = this._data;
    if (L(e)) {
      const n = this._cachedMeta;
      this._data = Sh(e, n);
    } else if (s !== e) {
      if (s) {
        Sn(s, this);
        const n = this._cachedMeta;
        xe(n), n._parsed = [];
      }
      e && Object.isExtensible(e) && uc(e, this), this._syncList = [], this._data = e;
    }
  }
  addElements() {
    const t = this._cachedMeta;
    this._dataCheck(), this.datasetElementType && (t.dataset = new this.datasetElementType());
  }
  buildOrUpdateElements(t) {
    const e = this._cachedMeta, s = this.getDataset();
    let n = !1;
    this._dataCheck();
    const o = e._stacked;
    e._stacked = Ui(e.vScale, e), e.stack !== s.stack && (n = !0, xe(e), e.stack = s.stack), this._resyncElements(t), (n || o !== e._stacked) && (zn(this, e._parsed), e._stacked = Ui(e.vScale, e));
  }
  configure() {
    const t = this.chart.config, e = t.datasetScopeKeys(this._type), s = t.getOptionScopes(this.getDataset(), e, !0);
    this.options = t.createResolver(s, this.getContext()), this._parsing = this.options.parsing, this._cachedDataOpts = {};
  }
  parse(t, e) {
    const { _cachedMeta: s, _data: n } = this, { iScale: o, _stacked: r } = s, a = o.axis;
    let l = t === 0 && e === n.length ? !0 : s._sorted, c = t > 0 && s._parsed[t - 1], h, d, u;
    if (this._parsing === !1)
      s._parsed = n, s._sorted = !0, u = n;
    else {
      W(n[t]) ? u = this.parseArrayData(s, n, t, e) : L(n[t]) ? u = this.parseObjectData(s, n, t, e) : u = this.parsePrimitiveData(s, n, t, e);
      const f = () => d[a] === null || c && d[a] < c[a];
      for (h = 0; h < e; ++h)
        s._parsed[h + t] = d = u[h], l && (f() && (l = !1), c = d);
      s._sorted = l;
    }
    r && zn(this, u);
  }
  parsePrimitiveData(t, e, s, n) {
    const { iScale: o, vScale: r } = t, a = o.axis, l = r.axis, c = o.getLabels(), h = o === r, d = new Array(n);
    let u, f, p;
    for (u = 0, f = n; u < f; ++u)
      p = u + s, d[u] = {
        [a]: h || o.parse(c[p], p),
        [l]: r.parse(e[p], p)
      };
    return d;
  }
  parseArrayData(t, e, s, n) {
    const { xScale: o, yScale: r } = t, a = new Array(n);
    let l, c, h, d;
    for (l = 0, c = n; l < c; ++l)
      h = l + s, d = e[h], a[l] = {
        x: o.parse(d[0], h),
        y: r.parse(d[1], h)
      };
    return a;
  }
  parseObjectData(t, e, s, n) {
    const { xScale: o, yScale: r } = t, { xAxisKey: a = "x", yAxisKey: l = "y" } = this._parsing, c = new Array(n);
    let h, d, u, f;
    for (h = 0, d = n; h < d; ++h)
      u = h + s, f = e[u], c[h] = {
        x: o.parse(Wt(f, a), u),
        y: r.parse(Wt(f, l), u)
      };
    return c;
  }
  getParsed(t) {
    return this._cachedMeta._parsed[t];
  }
  getDataElement(t) {
    return this._cachedMeta.data[t];
  }
  applyStack(t, e, s) {
    const n = this.chart, o = this._cachedMeta, r = e[t.axis], a = {
      keys: kr(n, !0),
      values: e._stacks[t.axis]._visualValues
    };
    return Nn(a, r, o.index, {
      mode: s
    });
  }
  updateRangeFromParsed(t, e, s, n) {
    const o = s[e.axis];
    let r = o === null ? NaN : o;
    const a = n && s._stacks[e.axis];
    n && a && (n.values = a, r = Nn(n, o, this._cachedMeta.index)), t.min = Math.min(t.min, r), t.max = Math.max(t.max, r);
  }
  getMinMax(t, e) {
    const s = this._cachedMeta, n = s._parsed, o = s._sorted && t === s.iScale, r = n.length, a = this._getOtherScale(t), l = kh(e, s, this.chart), c = {
      min: Number.POSITIVE_INFINITY,
      max: Number.NEGATIVE_INFINITY
    }, { min: h, max: d } = Mh(a);
    let u, f;
    function p() {
      f = n[u];
      const g = f[a.axis];
      return !$(f[t.axis]) || h > g || d < g;
    }
    for (u = 0; u < r && !(!p() && (this.updateRangeFromParsed(c, t, f, l), o)); ++u)
      ;
    if (o) {
      for (u = r - 1; u >= 0; --u)
        if (!p()) {
          this.updateRangeFromParsed(c, t, f, l);
          break;
        }
    }
    return c;
  }
  getAllParsedValues(t) {
    const e = this._cachedMeta._parsed, s = [];
    let n, o, r;
    for (n = 0, o = e.length; n < o; ++n)
      r = e[n][t.axis], $(r) && s.push(r);
    return s;
  }
  getMaxOverflow() {
    return !1;
  }
  getLabelAndValue(t) {
    const e = this._cachedMeta, s = e.iScale, n = e.vScale, o = this.getParsed(t);
    return {
      label: s ? "" + s.getLabelForValue(o[s.axis]) : "",
      value: n ? "" + n.getLabelForValue(o[n.axis]) : ""
    };
  }
  _update(t) {
    const e = this._cachedMeta;
    this.update(t || "default"), e._clip = xh(k(this.options.clip, vh(e.xScale, e.yScale, this.getMaxOverflow())));
  }
  update(t) {
  }
  draw() {
    const t = this._ctx, e = this.chart, s = this._cachedMeta, n = s.data || [], o = e.chartArea, r = [], a = this._drawStart || 0, l = this._drawCount || n.length - a, c = this.options.drawActiveElementsOnTop;
    let h;
    for (s.dataset && s.dataset.draw(t, o, a, l), h = a; h < a + l; ++h) {
      const d = n[h];
      d.hidden || (d.active && c ? r.push(d) : d.draw(t, o));
    }
    for (h = 0; h < r.length; ++h)
      r[h].draw(t, o);
  }
  getStyle(t, e) {
    const s = e ? "active" : "default";
    return t === void 0 && this._cachedMeta.dataset ? this.resolveDatasetElementOptions(s) : this.resolveDataElementOptions(t || 0, s);
  }
  getContext(t, e, s) {
    const n = this.getDataset();
    let o;
    if (t >= 0 && t < this._cachedMeta.data.length) {
      const r = this._cachedMeta.data[t];
      o = r.$context || (r.$context = Ah(this.getContext(), t, r)), o.parsed = this.getParsed(t), o.raw = n.data[t], o.index = o.dataIndex = t;
    } else
      o = this.$context || (this.$context = Ch(this.chart.getContext(), this.index)), o.dataset = n, o.index = o.datasetIndex = this.index;
    return o.active = !!e, o.mode = s, o;
  }
  resolveDatasetElementOptions(t) {
    return this._resolveElementOptions(this.datasetElementType.id, t);
  }
  resolveDataElementOptions(t, e) {
    return this._resolveElementOptions(this.dataElementType.id, e, t);
  }
  _resolveElementOptions(t, e = "default", s) {
    const n = e === "active", o = this._cachedDataOpts, r = t + "-" + e, a = o[r], l = this.enableOptionSharing && Ve(s);
    if (a)
      return Hn(a, l);
    const c = this.chart.config, h = c.datasetElementScopeKeys(this._type, t), d = n ? [
      `${t}Hover`,
      "hover",
      t,
      ""
    ] : [
      t,
      ""
    ], u = c.getOptionScopes(this.getDataset(), h), f = Object.keys(j.elements[t]), p = () => this.getContext(s, n, e), g = c.resolveNamedOptions(u, f, p, d);
    return g.$shared && (g.$shared = l, o[r] = Object.freeze(Hn(g, l))), g;
  }
  _resolveAnimations(t, e, s) {
    const n = this.chart, o = this._cachedDataOpts, r = `animation-${e}`, a = o[r];
    if (a)
      return a;
    let l;
    if (n.options.animation !== !1) {
      const h = this.chart.config, d = h.datasetAnimationScopeKeys(this._type, e), u = h.getOptionScopes(this.getDataset(), d);
      l = h.createResolver(u, this.getContext(t, s, e));
    }
    const c = new Ar(n, l && l.animations);
    return l && l._cacheable && (o[r] = Object.freeze(c)), c;
  }
  getSharedOptions(t) {
    if (t.$shared)
      return this._sharedOptions || (this._sharedOptions = Object.assign({}, t));
  }
  includeOptions(t, e) {
    return !e || Gi(t) || this.chart._animationsDisabled;
  }
  _getSharedOptions(t, e) {
    const s = this.resolveDataElementOptions(t, e), n = this._sharedOptions, o = this.getSharedOptions(s), r = this.includeOptions(e, o) || o !== n;
    return this.updateSharedOptions(o, e, s), {
      sharedOptions: o,
      includeOptions: r
    };
  }
  updateElement(t, e, s, n) {
    Gi(n) ? Object.assign(t, s) : this._resolveAnimations(e, n).update(t, s);
  }
  updateSharedOptions(t, e, s) {
    t && !Gi(e) && this._resolveAnimations(void 0, e).update(t, s);
  }
  _setStyle(t, e, s, n) {
    t.active = n;
    const o = this.getStyle(e, n);
    this._resolveAnimations(e, s, n).update(t, {
      options: !n && this.getSharedOptions(o) || o
    });
  }
  removeHoverStyle(t, e, s) {
    this._setStyle(t, s, "active", !1);
  }
  setHoverStyle(t, e, s) {
    this._setStyle(t, s, "active", !0);
  }
  _removeDatasetHoverStyle() {
    const t = this._cachedMeta.dataset;
    t && this._setStyle(t, void 0, "active", !1);
  }
  _setDatasetHoverStyle() {
    const t = this._cachedMeta.dataset;
    t && this._setStyle(t, void 0, "active", !0);
  }
  _resyncElements(t) {
    const e = this._data, s = this._cachedMeta.data;
    for (const [a, l, c] of this._syncList)
      this[a](l, c);
    this._syncList = [];
    const n = s.length, o = e.length, r = Math.min(o, n);
    r && this.parse(0, r), o > n ? this._insertElements(n, o - n, t) : o < n && this._removeElements(o, n - o);
  }
  _insertElements(t, e, s = !0) {
    const n = this._cachedMeta, o = n.data, r = t + e;
    let a;
    const l = (c) => {
      for (c.length += e, a = c.length - 1; a >= r; a--)
        c[a] = c[a - e];
    };
    for (l(o), a = t; a < r; ++a)
      o[a] = new this.dataElementType();
    this._parsing && l(n._parsed), this.parse(t, e), s && this.updateElements(o, t, e, "reset");
  }
  updateElements(t, e, s, n) {
  }
  _removeElements(t, e) {
    const s = this._cachedMeta;
    if (this._parsing) {
      const n = s._parsed.splice(t, e);
      s._stacked && xe(s, n);
    }
    s.data.splice(t, e);
  }
  _sync(t) {
    if (this._parsing)
      this._syncList.push(t);
    else {
      const [e, s, n] = t;
      this[e](s, n);
    }
    this.chart._dataChanges.push([
      this.index,
      ...t
    ]);
  }
  _onDataPush() {
    const t = arguments.length;
    this._sync([
      "_insertElements",
      this.getDataset().data.length - t,
      t
    ]);
  }
  _onDataPop() {
    this._sync([
      "_removeElements",
      this._cachedMeta.data.length - 1,
      1
    ]);
  }
  _onDataShift() {
    this._sync([
      "_removeElements",
      0,
      1
    ]);
  }
  _onDataSplice(t, e) {
    e && this._sync([
      "_removeElements",
      t,
      e
    ]);
    const s = arguments.length - 2;
    s && this._sync([
      "_insertElements",
      t,
      s
    ]);
  }
  _onDataUnshift() {
    this._sync([
      "_insertElements",
      0,
      arguments.length
    ]);
  }
}
E(gt, "defaults", {}), E(gt, "datasetElementType", null), E(gt, "dataElementType", null);
function Oh(i, t) {
  if (!i._cache.$bar) {
    const e = i.getMatchingVisibleMetas(t);
    let s = [];
    for (let n = 0, o = e.length; n < o; n++)
      s = s.concat(e[n].controller.getAllParsedValues(i));
    i._cache.$bar = ar(s.sort((n, o) => n - o));
  }
  return i._cache.$bar;
}
function Ph(i) {
  const t = i.iScale, e = Oh(t, i.type);
  let s = t._length, n, o, r, a;
  const l = () => {
    r === 32767 || r === -32768 || (Ve(a) && (s = Math.min(s, Math.abs(r - a) || s)), a = r);
  };
  for (n = 0, o = e.length; n < o; ++n)
    r = t.getPixelForValue(e[n]), l();
  for (a = void 0, n = 0, o = t.ticks.length; n < o; ++n)
    r = t.getPixelForTick(n), l();
  return s;
}
function Dh(i, t, e, s) {
  const n = e.barThickness;
  let o, r;
  return I(n) ? (o = t.min * e.categoryPercentage, r = e.barPercentage) : (o = n * s, r = 1), {
    chunk: o / s,
    ratio: r,
    start: t.pixels[i] - o / 2
  };
}
function Th(i, t, e, s) {
  const n = t.pixels, o = n[i];
  let r = i > 0 ? n[i - 1] : null, a = i < n.length - 1 ? n[i + 1] : null;
  const l = e.categoryPercentage;
  r === null && (r = o - (a === null ? t.end - t.start : a - o)), a === null && (a = o + o - r);
  const c = o - (o - Math.min(r, a)) / 2 * l;
  return {
    chunk: Math.abs(a - r) / 2 * l / s,
    ratio: e.barPercentage,
    start: c
  };
}
function Ih(i, t, e, s) {
  const n = e.parse(i[0], s), o = e.parse(i[1], s), r = Math.min(n, o), a = Math.max(n, o);
  let l = r, c = a;
  Math.abs(r) > Math.abs(a) && (l = a, c = r), t[e.axis] = c, t._custom = {
    barStart: l,
    barEnd: c,
    start: n,
    end: o,
    min: r,
    max: a
  };
}
function Or(i, t, e, s) {
  return W(i) ? Ih(i, t, e, s) : t[e.axis] = e.parse(i, s), t;
}
function Vn(i, t, e, s) {
  const n = i.iScale, o = i.vScale, r = n.getLabels(), a = n === o, l = [];
  let c, h, d, u;
  for (c = e, h = e + s; c < h; ++c)
    u = t[c], d = {}, d[n.axis] = a || n.parse(r[c], c), l.push(Or(u, d, o, c));
  return l;
}
function qi(i) {
  return i && i.barStart !== void 0 && i.barEnd !== void 0;
}
function Lh(i, t, e) {
  return i !== 0 ? St(i) : (t.isHorizontal() ? 1 : -1) * (t.min >= e ? 1 : -1);
}
function Rh(i) {
  let t, e, s, n, o;
  return i.horizontal ? (t = i.base > i.x, e = "left", s = "right") : (t = i.base < i.y, e = "bottom", s = "top"), t ? (n = "end", o = "start") : (n = "start", o = "end"), {
    start: e,
    end: s,
    reverse: t,
    top: n,
    bottom: o
  };
}
function Fh(i, t, e, s) {
  let n = t.borderSkipped;
  const o = {};
  if (!n) {
    i.borderSkipped = o;
    return;
  }
  if (n === !0) {
    i.borderSkipped = {
      top: !0,
      right: !0,
      bottom: !0,
      left: !0
    };
    return;
  }
  const { start: r, end: a, reverse: l, top: c, bottom: h } = Rh(i);
  n === "middle" && e && (i.enableBorderRadius = !0, (e._top || 0) === s ? n = c : (e._bottom || 0) === s ? n = h : (o[Wn(h, r, a, l)] = !0, n = c)), o[Wn(n, r, a, l)] = !0, i.borderSkipped = o;
}
function Wn(i, t, e, s) {
  return s ? (i = Nh(i, t, e), i = jn(i, e, t)) : i = jn(i, t, e), i;
}
function Nh(i, t, e) {
  return i === t ? e : i === e ? t : i;
}
function jn(i, t, e) {
  return i === "start" ? t : i === "end" ? e : i;
}
function Bh(i, { inflateAmount: t }, e) {
  i.inflateAmount = t === "auto" ? e === 1 ? 0.33 : 0 : t;
}
class pi extends gt {
  parsePrimitiveData(t, e, s, n) {
    return Vn(t, e, s, n);
  }
  parseArrayData(t, e, s, n) {
    return Vn(t, e, s, n);
  }
  parseObjectData(t, e, s, n) {
    const { iScale: o, vScale: r } = t, { xAxisKey: a = "x", yAxisKey: l = "y" } = this._parsing, c = o.axis === "x" ? a : l, h = r.axis === "x" ? a : l, d = [];
    let u, f, p, g;
    for (u = s, f = s + n; u < f; ++u)
      g = e[u], p = {}, p[o.axis] = o.parse(Wt(g, c), u), d.push(Or(Wt(g, h), p, r, u));
    return d;
  }
  updateRangeFromParsed(t, e, s, n) {
    super.updateRangeFromParsed(t, e, s, n);
    const o = s._custom;
    o && e === this._cachedMeta.vScale && (t.min = Math.min(t.min, o.min), t.max = Math.max(t.max, o.max));
  }
  getMaxOverflow() {
    return 0;
  }
  getLabelAndValue(t) {
    const e = this._cachedMeta, { iScale: s, vScale: n } = e, o = this.getParsed(t), r = o._custom, a = qi(r) ? "[" + r.start + ", " + r.end + "]" : "" + n.getLabelForValue(o[n.axis]);
    return {
      label: "" + s.getLabelForValue(o[s.axis]),
      value: a
    };
  }
  initialize() {
    this.enableOptionSharing = !0, super.initialize();
    const t = this._cachedMeta;
    t.stack = this.getDataset().stack;
  }
  update(t) {
    const e = this._cachedMeta;
    this.updateElements(e.data, 0, e.data.length, t);
  }
  updateElements(t, e, s, n) {
    const o = n === "reset", { index: r, _cachedMeta: { vScale: a } } = this, l = a.getBasePixel(), c = a.isHorizontal(), h = this._getRuler(), { sharedOptions: d, includeOptions: u } = this._getSharedOptions(e, n);
    for (let f = e; f < e + s; f++) {
      const p = this.getParsed(f), g = o || I(p[a.axis]) ? {
        base: l,
        head: l
      } : this._calculateBarValuePixels(f), m = this._calculateBarIndexPixels(f, h), b = (p._stacks || {})[a.axis], _ = {
        horizontal: c,
        base: g.base,
        enableBorderRadius: !b || qi(p._custom) || r === b._top || r === b._bottom,
        x: c ? g.head : m.center,
        y: c ? m.center : g.head,
        height: c ? m.size : Math.abs(g.size),
        width: c ? Math.abs(g.size) : m.size
      };
      u && (_.options = d || this.resolveDataElementOptions(f, t[f].active ? "active" : n));
      const v = _.options || t[f].options;
      Fh(_, v, b, r), Bh(_, v, h.ratio), this.updateElement(t[f], f, _, n);
    }
  }
  _getStacks(t, e) {
    const { iScale: s } = this._cachedMeta, n = s.getMatchingVisibleMetas(this._type).filter((h) => h.controller.options.grouped), o = s.options.stacked, r = [], a = this._cachedMeta.controller.getParsed(e), l = a && a[s.axis], c = (h) => {
      const d = h._parsed.find((f) => f[s.axis] === l), u = d && d[h.vScale.axis];
      if (I(u) || isNaN(u))
        return !0;
    };
    for (const h of n)
      if (!(e !== void 0 && c(h)) && ((o === !1 || r.indexOf(h.stack) === -1 || o === void 0 && h.stack === void 0) && r.push(h.stack), h.index === t))
        break;
    return r.length || r.push(void 0), r;
  }
  _getStackCount(t) {
    return this._getStacks(void 0, t).length;
  }
  _getAxisCount() {
    return this._getAxis().length;
  }
  getFirstScaleIdForIndexAxis() {
    const t = this.chart.scales, e = this.chart.options.indexAxis;
    return Object.keys(t).filter((s) => t[s].axis === e).shift();
  }
  _getAxis() {
    const t = {}, e = this.getFirstScaleIdForIndexAxis();
    for (const s of this.chart.data.datasets)
      t[k(this.chart.options.indexAxis === "x" ? s.xAxisID : s.yAxisID, e)] = !0;
    return Object.keys(t);
  }
  _getStackIndex(t, e, s) {
    const n = this._getStacks(t, s), o = e !== void 0 ? n.indexOf(e) : -1;
    return o === -1 ? n.length - 1 : o;
  }
  _getRuler() {
    const t = this.options, e = this._cachedMeta, s = e.iScale, n = [];
    let o, r;
    for (o = 0, r = e.data.length; o < r; ++o)
      n.push(s.getPixelForValue(this.getParsed(o)[s.axis], o));
    const a = t.barThickness;
    return {
      min: a || Ph(e),
      pixels: n,
      start: s._startPixel,
      end: s._endPixel,
      stackCount: this._getStackCount(),
      scale: s,
      grouped: t.grouped,
      ratio: a ? 1 : t.categoryPercentage * t.barPercentage
    };
  }
  _calculateBarValuePixels(t) {
    const { _cachedMeta: { vScale: e, _stacked: s, index: n }, options: { base: o, minBarLength: r } } = this, a = o || 0, l = this.getParsed(t), c = l._custom, h = qi(c);
    let d = l[e.axis], u = 0, f = s ? this.applyStack(e, l, s) : d, p, g;
    f !== d && (u = f - d, f = d), h && (d = c.barStart, f = c.barEnd - c.barStart, d !== 0 && St(d) !== St(c.barEnd) && (u = 0), u += d);
    const m = !I(o) && !h ? o : u;
    let b = e.getPixelForValue(m);
    if (this.chart.getDataVisibility(t) ? p = e.getPixelForValue(u + f) : p = b, g = p - b, Math.abs(g) < r) {
      g = Lh(g, e, a) * r, d === a && (b -= g / 2);
      const _ = e.getPixelForDecimal(0), v = e.getPixelForDecimal(1), x = Math.min(_, v), y = Math.max(_, v);
      b = Math.max(Math.min(b, y), x), p = b + g, s && !h && (l._stacks[e.axis]._visualValues[n] = e.getValueForPixel(p) - e.getValueForPixel(b));
    }
    if (b === e.getPixelForValue(a)) {
      const _ = St(g) * e.getLineWidthForValue(a) / 2;
      b += _, g -= _;
    }
    return {
      size: g,
      base: b,
      head: p,
      center: p + g / 2
    };
  }
  _calculateBarIndexPixels(t, e) {
    const s = e.scale, n = this.options, o = n.skipNull, r = k(n.maxBarThickness, 1 / 0);
    let a, l;
    const c = this._getAxisCount();
    if (e.grouped) {
      const h = o ? this._getStackCount(t) : e.stackCount, d = n.barThickness === "flex" ? Th(t, e, n, h * c) : Dh(t, e, n, h * c), u = this.chart.options.indexAxis === "x" ? this.getDataset().xAxisID : this.getDataset().yAxisID, f = this._getAxis().indexOf(k(u, this.getFirstScaleIdForIndexAxis())), p = this._getStackIndex(this.index, this._cachedMeta.stack, o ? t : void 0) + f;
      a = d.start + d.chunk * p + d.chunk / 2, l = Math.min(r, d.chunk * d.ratio);
    } else
      a = s.getPixelForValue(this.getParsed(t)[s.axis], t), l = Math.min(r, e.min * e.ratio);
    return {
      base: a - l / 2,
      head: a + l / 2,
      center: a,
      size: l
    };
  }
  draw() {
    const t = this._cachedMeta, e = t.vScale, s = t.data, n = s.length;
    let o = 0;
    for (; o < n; ++o)
      this.getParsed(o)[e.axis] !== null && !s[o].hidden && s[o].draw(this._ctx);
  }
}
E(pi, "id", "bar"), E(pi, "defaults", {
  datasetElementType: !1,
  dataElementType: "bar",
  categoryPercentage: 0.8,
  barPercentage: 0.9,
  grouped: !0,
  animations: {
    numbers: {
      type: "number",
      properties: [
        "x",
        "y",
        "base",
        "width",
        "height"
      ]
    }
  }
}), E(pi, "overrides", {
  scales: {
    _index_: {
      type: "category",
      offset: !0,
      grid: {
        offset: !0
      }
    },
    _value_: {
      type: "linear",
      beginAtZero: !0
    }
  }
});
class gi extends gt {
  initialize() {
    this.enableOptionSharing = !0, super.initialize();
  }
  parsePrimitiveData(t, e, s, n) {
    const o = super.parsePrimitiveData(t, e, s, n);
    for (let r = 0; r < o.length; r++)
      o[r]._custom = this.resolveDataElementOptions(r + s).radius;
    return o;
  }
  parseArrayData(t, e, s, n) {
    const o = super.parseArrayData(t, e, s, n);
    for (let r = 0; r < o.length; r++) {
      const a = e[s + r];
      o[r]._custom = k(a[2], this.resolveDataElementOptions(r + s).radius);
    }
    return o;
  }
  parseObjectData(t, e, s, n) {
    const o = super.parseObjectData(t, e, s, n);
    for (let r = 0; r < o.length; r++) {
      const a = e[s + r];
      o[r]._custom = k(a && a.r && +a.r, this.resolveDataElementOptions(r + s).radius);
    }
    return o;
  }
  getMaxOverflow() {
    const t = this._cachedMeta.data;
    let e = 0;
    for (let s = t.length - 1; s >= 0; --s)
      e = Math.max(e, t[s].size(this.resolveDataElementOptions(s)) / 2);
    return e > 0 && e;
  }
  getLabelAndValue(t) {
    const e = this._cachedMeta, s = this.chart.data.labels || [], { xScale: n, yScale: o } = e, r = this.getParsed(t), a = n.getLabelForValue(r.x), l = o.getLabelForValue(r.y), c = r._custom;
    return {
      label: s[t] || "",
      value: "(" + a + ", " + l + (c ? ", " + c : "") + ")"
    };
  }
  update(t) {
    const e = this._cachedMeta.data;
    this.updateElements(e, 0, e.length, t);
  }
  updateElements(t, e, s, n) {
    const o = n === "reset", { iScale: r, vScale: a } = this._cachedMeta, { sharedOptions: l, includeOptions: c } = this._getSharedOptions(e, n), h = r.axis, d = a.axis;
    for (let u = e; u < e + s; u++) {
      const f = t[u], p = !o && this.getParsed(u), g = {}, m = g[h] = o ? r.getPixelForDecimal(0.5) : r.getPixelForValue(p[h]), b = g[d] = o ? a.getBasePixel() : a.getPixelForValue(p[d]);
      g.skip = isNaN(m) || isNaN(b), c && (g.options = l || this.resolveDataElementOptions(u, f.active ? "active" : n), o && (g.options.radius = 0)), this.updateElement(f, u, g, n);
    }
  }
  resolveDataElementOptions(t, e) {
    const s = this.getParsed(t);
    let n = super.resolveDataElementOptions(t, e);
    n.$shared && (n = Object.assign({}, n, {
      $shared: !1
    }));
    const o = n.radius;
    return e !== "active" && (n.radius = 0), n.radius += k(s && s._custom, o), n;
  }
}
E(gi, "id", "bubble"), E(gi, "defaults", {
  datasetElementType: !1,
  dataElementType: "point",
  animations: {
    numbers: {
      type: "number",
      properties: [
        "x",
        "y",
        "borderWidth",
        "radius"
      ]
    }
  }
}), E(gi, "overrides", {
  scales: {
    x: {
      type: "linear"
    },
    y: {
      type: "linear"
    }
  }
});
function zh(i, t, e) {
  let s = 1, n = 1, o = 0, r = 0;
  if (t < V) {
    const a = i, l = a + t, c = Math.cos(a), h = Math.sin(a), d = Math.cos(l), u = Math.sin(l), f = (v, x, y) => We(v, a, l, !0) ? 1 : Math.max(x, x * e, y, y * e), p = (v, x, y) => We(v, a, l, !0) ? -1 : Math.min(x, x * e, y, y * e), g = f(0, c, d), m = f(U, h, u), b = p(F, c, d), _ = p(F + U, h, u);
    s = (g - b) / 2, n = (m - _) / 2, o = -(g + b) / 2, r = -(m + _) / 2;
  }
  return {
    ratioX: s,
    ratioY: n,
    offsetX: o,
    offsetY: r
  };
}
class ee extends gt {
  constructor(t, e) {
    super(t, e), this.enableOptionSharing = !0, this.innerRadius = void 0, this.outerRadius = void 0, this.offsetX = void 0, this.offsetY = void 0;
  }
  linkScales() {
  }
  parse(t, e) {
    const s = this.getDataset().data, n = this._cachedMeta;
    if (this._parsing === !1)
      n._parsed = s;
    else {
      let o = (l) => +s[l];
      if (L(s[t])) {
        const { key: l = "value" } = this._parsing;
        o = (c) => +Wt(s[c], l);
      }
      let r, a;
      for (r = t, a = t + e; r < a; ++r)
        n._parsed[r] = o(r);
    }
  }
  _getRotation() {
    return pt(this.options.rotation - 90);
  }
  _getCircumference() {
    return pt(this.options.circumference);
  }
  _getRotationExtents() {
    let t = V, e = -V;
    for (let s = 0; s < this.chart.data.datasets.length; ++s)
      if (this.chart.isDatasetVisible(s) && this.chart.getDatasetMeta(s).type === this._type) {
        const n = this.chart.getDatasetMeta(s).controller, o = n._getRotation(), r = n._getCircumference();
        t = Math.min(t, o), e = Math.max(e, o + r);
      }
    return {
      rotation: t,
      circumference: e - t
    };
  }
  update(t) {
    const e = this.chart, { chartArea: s } = e, n = this._cachedMeta, o = n.data, r = this.getMaxBorderWidth() + this.getMaxOffset(o) + this.options.spacing, a = Math.max((Math.min(s.width, s.height) - r) / 2, 0), l = Math.min(Jl(this.options.cutout, a), 1), c = this._getRingWeight(this.index), { circumference: h, rotation: d } = this._getRotationExtents(), { ratioX: u, ratioY: f, offsetX: p, offsetY: g } = zh(d, h, l), m = (s.width - r) / u, b = (s.height - r) / f, _ = Math.max(Math.min(m, b) / 2, 0), v = ir(this.options.radius, _), x = Math.max(v * l, 0), y = (v - x) / this._getVisibleDatasetWeightTotal();
    this.offsetX = p * v, this.offsetY = g * v, n.total = this.calculateTotal(), this.outerRadius = v - y * this._getRingWeightOffset(this.index), this.innerRadius = Math.max(this.outerRadius - y * c, 0), this.updateElements(o, 0, o.length, t);
  }
  _circumference(t, e) {
    const s = this.options, n = this._cachedMeta, o = this._getCircumference();
    return e && s.animation.animateRotate || !this.chart.getDataVisibility(t) || n._parsed[t] === null || n.data[t].hidden ? 0 : this.calculateCircumference(n._parsed[t] * o / V);
  }
  updateElements(t, e, s, n) {
    const o = n === "reset", r = this.chart, a = r.chartArea, c = r.options.animation, h = (a.left + a.right) / 2, d = (a.top + a.bottom) / 2, u = o && c.animateScale, f = u ? 0 : this.innerRadius, p = u ? 0 : this.outerRadius, { sharedOptions: g, includeOptions: m } = this._getSharedOptions(e, n);
    let b = this._getRotation(), _;
    for (_ = 0; _ < e; ++_)
      b += this._circumference(_, o);
    for (_ = e; _ < e + s; ++_) {
      const v = this._circumference(_, o), x = t[_], y = {
        x: h + this.offsetX,
        y: d + this.offsetY,
        startAngle: b,
        endAngle: b + v,
        circumference: v,
        outerRadius: p,
        innerRadius: f
      };
      m && (y.options = g || this.resolveDataElementOptions(_, x.active ? "active" : n)), b += v, this.updateElement(x, _, y, n);
    }
  }
  calculateTotal() {
    const t = this._cachedMeta, e = t.data;
    let s = 0, n;
    for (n = 0; n < e.length; n++) {
      const o = t._parsed[n];
      o !== null && !isNaN(o) && this.chart.getDataVisibility(n) && !e[n].hidden && (s += Math.abs(o));
    }
    return s;
  }
  calculateCircumference(t) {
    const e = this._cachedMeta.total;
    return e > 0 && !isNaN(t) ? V * (Math.abs(t) / e) : 0;
  }
  getLabelAndValue(t) {
    const e = this._cachedMeta, s = this.chart, n = s.data.labels || [], o = qe(e._parsed[t], s.options.locale);
    return {
      label: n[t] || "",
      value: o
    };
  }
  getMaxBorderWidth(t) {
    let e = 0;
    const s = this.chart;
    let n, o, r, a, l;
    if (!t) {
      for (n = 0, o = s.data.datasets.length; n < o; ++n)
        if (s.isDatasetVisible(n)) {
          r = s.getDatasetMeta(n), t = r.data, a = r.controller;
          break;
        }
    }
    if (!t)
      return 0;
    for (n = 0, o = t.length; n < o; ++n)
      l = a.resolveDataElementOptions(n), l.borderAlign !== "inner" && (e = Math.max(e, l.borderWidth || 0, l.hoverBorderWidth || 0));
    return e;
  }
  getMaxOffset(t) {
    let e = 0;
    for (let s = 0, n = t.length; s < n; ++s) {
      const o = this.resolveDataElementOptions(s);
      e = Math.max(e, o.offset || 0, o.hoverOffset || 0);
    }
    return e;
  }
  _getRingWeightOffset(t) {
    let e = 0;
    for (let s = 0; s < t; ++s)
      this.chart.isDatasetVisible(s) && (e += this._getRingWeight(s));
    return e;
  }
  _getRingWeight(t) {
    return Math.max(k(this.chart.data.datasets[t].weight, 1), 0);
  }
  _getVisibleDatasetWeightTotal() {
    return this._getRingWeightOffset(this.chart.data.datasets.length) || 1;
  }
}
E(ee, "id", "doughnut"), E(ee, "defaults", {
  datasetElementType: !1,
  dataElementType: "arc",
  animation: {
    animateRotate: !0,
    animateScale: !1
  },
  animations: {
    numbers: {
      type: "number",
      properties: [
        "circumference",
        "endAngle",
        "innerRadius",
        "outerRadius",
        "startAngle",
        "x",
        "y",
        "offset",
        "borderWidth",
        "spacing"
      ]
    }
  },
  cutout: "50%",
  rotation: 0,
  circumference: 360,
  radius: "100%",
  spacing: 0,
  indexAxis: "r"
}), E(ee, "descriptors", {
  _scriptable: (t) => t !== "spacing",
  _indexable: (t) => t !== "spacing" && !t.startsWith("borderDash") && !t.startsWith("hoverBorderDash")
}), E(ee, "overrides", {
  aspectRatio: 1,
  plugins: {
    legend: {
      labels: {
        generateLabels(t) {
          const e = t.data, { labels: { pointStyle: s, textAlign: n, color: o, useBorderRadius: r, borderRadius: a } } = t.legend.options;
          return e.labels.length && e.datasets.length ? e.labels.map((l, c) => {
            const d = t.getDatasetMeta(0).controller.getStyle(c);
            return {
              text: l,
              fillStyle: d.backgroundColor,
              fontColor: o,
              hidden: !t.getDataVisibility(c),
              lineDash: d.borderDash,
              lineDashOffset: d.borderDashOffset,
              lineJoin: d.borderJoinStyle,
              lineWidth: d.borderWidth,
              strokeStyle: d.borderColor,
              textAlign: n,
              pointStyle: s,
              borderRadius: r && (a || d.borderRadius),
              index: c
            };
          }) : [];
        }
      },
      onClick(t, e, s) {
        s.chart.toggleDataVisibility(e.index), s.chart.update();
      }
    }
  }
});
class mi extends gt {
  initialize() {
    this.enableOptionSharing = !0, this.supportsDecimation = !0, super.initialize();
  }
  update(t) {
    const e = this._cachedMeta, { dataset: s, data: n = [], _dataset: o } = e, r = this.chart._animationsDisabled;
    let { start: a, count: l } = hr(e, n, r);
    this._drawStart = a, this._drawCount = l, dr(e) && (a = 0, l = n.length), s._chart = this.chart, s._datasetIndex = this.index, s._decimated = !!o._decimated, s.points = n;
    const c = this.resolveDatasetElementOptions(t);
    this.options.showLine || (c.borderWidth = 0), c.segment = this.options.segment, this.updateElement(s, void 0, {
      animated: !r,
      options: c
    }, t), this.updateElements(n, a, l, t);
  }
  updateElements(t, e, s, n) {
    const o = n === "reset", { iScale: r, vScale: a, _stacked: l, _dataset: c } = this._cachedMeta, { sharedOptions: h, includeOptions: d } = this._getSharedOptions(e, n), u = r.axis, f = a.axis, { spanGaps: p, segment: g } = this.options, m = pe(p) ? p : Number.POSITIVE_INFINITY, b = this.chart._animationsDisabled || o || n === "none", _ = e + s, v = t.length;
    let x = e > 0 && this.getParsed(e - 1);
    for (let y = 0; y < v; ++y) {
      const M = t[y], S = b ? M : {};
      if (y < e || y >= _) {
        S.skip = !0;
        continue;
      }
      const w = this.getParsed(y), C = I(w[f]), D = S[u] = r.getPixelForValue(w[u], y), O = S[f] = o || C ? a.getBasePixel() : a.getPixelForValue(l ? this.applyStack(a, w, l) : w[f], y);
      S.skip = isNaN(D) || isNaN(O) || C, S.stop = y > 0 && Math.abs(w[u] - x[u]) > m, g && (S.parsed = w, S.raw = c.data[y]), d && (S.options = h || this.resolveDataElementOptions(y, M.active ? "active" : n)), b || this.updateElement(M, y, S, n), x = w;
    }
  }
  getMaxOverflow() {
    const t = this._cachedMeta, e = t.dataset, s = e.options && e.options.borderWidth || 0, n = t.data || [];
    if (!n.length)
      return s;
    const o = n[0].size(this.resolveDataElementOptions(0)), r = n[n.length - 1].size(this.resolveDataElementOptions(n.length - 1));
    return Math.max(s, o, r) / 2;
  }
  draw() {
    const t = this._cachedMeta;
    t.dataset.updateControlPoints(this.chart.chartArea, t.iScale.axis), super.draw();
  }
}
E(mi, "id", "line"), E(mi, "defaults", {
  datasetElementType: "line",
  dataElementType: "point",
  showLine: !0,
  spanGaps: !1
}), E(mi, "overrides", {
  scales: {
    _index_: {
      type: "category"
    },
    _value_: {
      type: "linear"
    }
  }
});
class Be extends gt {
  constructor(t, e) {
    super(t, e), this.innerRadius = void 0, this.outerRadius = void 0;
  }
  getLabelAndValue(t) {
    const e = this._cachedMeta, s = this.chart, n = s.data.labels || [], o = qe(e._parsed[t].r, s.options.locale);
    return {
      label: n[t] || "",
      value: o
    };
  }
  parseObjectData(t, e, s, n) {
    return yr.bind(this)(t, e, s, n);
  }
  update(t) {
    const e = this._cachedMeta.data;
    this._updateRadius(), this.updateElements(e, 0, e.length, t);
  }
  getMinMax() {
    const t = this._cachedMeta, e = {
      min: Number.POSITIVE_INFINITY,
      max: Number.NEGATIVE_INFINITY
    };
    return t.data.forEach((s, n) => {
      const o = this.getParsed(n).r;
      !isNaN(o) && this.chart.getDataVisibility(n) && (o < e.min && (e.min = o), o > e.max && (e.max = o));
    }), e;
  }
  _updateRadius() {
    const t = this.chart, e = t.chartArea, s = t.options, n = Math.min(e.right - e.left, e.bottom - e.top), o = Math.max(n / 2, 0), r = Math.max(s.cutoutPercentage ? o / 100 * s.cutoutPercentage : 1, 0), a = (o - r) / t.getVisibleDatasetCount();
    this.outerRadius = o - a * this.index, this.innerRadius = this.outerRadius - a;
  }
  updateElements(t, e, s, n) {
    const o = n === "reset", r = this.chart, l = r.options.animation, c = this._cachedMeta.rScale, h = c.xCenter, d = c.yCenter, u = c.getIndexAngle(0) - 0.5 * F;
    let f = u, p;
    const g = 360 / this.countVisibleElements();
    for (p = 0; p < e; ++p)
      f += this._computeAngle(p, n, g);
    for (p = e; p < e + s; p++) {
      const m = t[p];
      let b = f, _ = f + this._computeAngle(p, n, g), v = r.getDataVisibility(p) ? c.getDistanceFromCenterForValue(this.getParsed(p).r) : 0;
      f = _, o && (l.animateScale && (v = 0), l.animateRotate && (b = _ = u));
      const x = {
        x: h,
        y: d,
        innerRadius: 0,
        outerRadius: v,
        startAngle: b,
        endAngle: _,
        options: this.resolveDataElementOptions(p, m.active ? "active" : n)
      };
      this.updateElement(m, p, x, n);
    }
  }
  countVisibleElements() {
    const t = this._cachedMeta;
    let e = 0;
    return t.data.forEach((s, n) => {
      !isNaN(this.getParsed(n).r) && this.chart.getDataVisibility(n) && e++;
    }), e;
  }
  _computeAngle(t, e, s) {
    return this.chart.getDataVisibility(t) ? pt(this.resolveDataElementOptions(t, e).angle || s) : 0;
  }
}
E(Be, "id", "polarArea"), E(Be, "defaults", {
  dataElementType: "arc",
  animation: {
    animateRotate: !0,
    animateScale: !0
  },
  animations: {
    numbers: {
      type: "number",
      properties: [
        "x",
        "y",
        "startAngle",
        "endAngle",
        "innerRadius",
        "outerRadius"
      ]
    }
  },
  indexAxis: "r",
  startAngle: 0
}), E(Be, "overrides", {
  aspectRatio: 1,
  plugins: {
    legend: {
      labels: {
        generateLabels(t) {
          const e = t.data;
          if (e.labels.length && e.datasets.length) {
            const { labels: { pointStyle: s, color: n } } = t.legend.options;
            return e.labels.map((o, r) => {
              const l = t.getDatasetMeta(0).controller.getStyle(r);
              return {
                text: o,
                fillStyle: l.backgroundColor,
                strokeStyle: l.borderColor,
                fontColor: n,
                lineWidth: l.borderWidth,
                pointStyle: s,
                hidden: !t.getDataVisibility(r),
                index: r
              };
            });
          }
          return [];
        }
      },
      onClick(t, e, s) {
        s.chart.toggleDataVisibility(e.index), s.chart.update();
      }
    }
  },
  scales: {
    r: {
      type: "radialLinear",
      angleLines: {
        display: !1
      },
      beginAtZero: !0,
      grid: {
        circular: !0
      },
      pointLabels: {
        display: !1
      },
      startAngle: 0
    }
  }
});
class gs extends ee {
}
E(gs, "id", "pie"), E(gs, "defaults", {
  cutout: 0,
  rotation: 0,
  circumference: 360,
  radius: "100%"
});
class bi extends gt {
  getLabelAndValue(t) {
    const e = this._cachedMeta.vScale, s = this.getParsed(t);
    return {
      label: e.getLabels()[t],
      value: "" + e.getLabelForValue(s[e.axis])
    };
  }
  parseObjectData(t, e, s, n) {
    return yr.bind(this)(t, e, s, n);
  }
  update(t) {
    const e = this._cachedMeta, s = e.dataset, n = e.data || [], o = e.iScale.getLabels();
    if (s.points = n, t !== "resize") {
      const r = this.resolveDatasetElementOptions(t);
      this.options.showLine || (r.borderWidth = 0);
      const a = {
        _loop: !0,
        _fullLoop: o.length === n.length,
        options: r
      };
      this.updateElement(s, void 0, a, t);
    }
    this.updateElements(n, 0, n.length, t);
  }
  updateElements(t, e, s, n) {
    const o = this._cachedMeta.rScale, r = n === "reset";
    for (let a = e; a < e + s; a++) {
      const l = t[a], c = this.resolveDataElementOptions(a, l.active ? "active" : n), h = o.getPointPositionForValue(a, this.getParsed(a).r), d = r ? o.xCenter : h.x, u = r ? o.yCenter : h.y, f = {
        x: d,
        y: u,
        angle: h.angle,
        skip: isNaN(d) || isNaN(u),
        options: c
      };
      this.updateElement(l, a, f, n);
    }
  }
}
E(bi, "id", "radar"), E(bi, "defaults", {
  datasetElementType: "line",
  dataElementType: "point",
  indexAxis: "r",
  showLine: !0,
  elements: {
    line: {
      fill: "start"
    }
  }
}), E(bi, "overrides", {
  aspectRatio: 1,
  scales: {
    r: {
      type: "radialLinear"
    }
  }
});
class _i extends gt {
  getLabelAndValue(t) {
    const e = this._cachedMeta, s = this.chart.data.labels || [], { xScale: n, yScale: o } = e, r = this.getParsed(t), a = n.getLabelForValue(r.x), l = o.getLabelForValue(r.y);
    return {
      label: s[t] || "",
      value: "(" + a + ", " + l + ")"
    };
  }
  update(t) {
    const e = this._cachedMeta, { data: s = [] } = e, n = this.chart._animationsDisabled;
    let { start: o, count: r } = hr(e, s, n);
    if (this._drawStart = o, this._drawCount = r, dr(e) && (o = 0, r = s.length), this.options.showLine) {
      this.datasetElementType || this.addElements();
      const { dataset: a, _dataset: l } = e;
      a._chart = this.chart, a._datasetIndex = this.index, a._decimated = !!l._decimated, a.points = s;
      const c = this.resolveDatasetElementOptions(t);
      c.segment = this.options.segment, this.updateElement(a, void 0, {
        animated: !n,
        options: c
      }, t);
    } else this.datasetElementType && (delete e.dataset, this.datasetElementType = !1);
    this.updateElements(s, o, r, t);
  }
  addElements() {
    const { showLine: t } = this.options;
    !this.datasetElementType && t && (this.datasetElementType = this.chart.registry.getElement("line")), super.addElements();
  }
  updateElements(t, e, s, n) {
    const o = n === "reset", { iScale: r, vScale: a, _stacked: l, _dataset: c } = this._cachedMeta, h = this.resolveDataElementOptions(e, n), d = this.getSharedOptions(h), u = this.includeOptions(n, d), f = r.axis, p = a.axis, { spanGaps: g, segment: m } = this.options, b = pe(g) ? g : Number.POSITIVE_INFINITY, _ = this.chart._animationsDisabled || o || n === "none";
    let v = e > 0 && this.getParsed(e - 1);
    for (let x = e; x < e + s; ++x) {
      const y = t[x], M = this.getParsed(x), S = _ ? y : {}, w = I(M[p]), C = S[f] = r.getPixelForValue(M[f], x), D = S[p] = o || w ? a.getBasePixel() : a.getPixelForValue(l ? this.applyStack(a, M, l) : M[p], x);
      S.skip = isNaN(C) || isNaN(D) || w, S.stop = x > 0 && Math.abs(M[f] - v[f]) > b, m && (S.parsed = M, S.raw = c.data[x]), u && (S.options = d || this.resolveDataElementOptions(x, y.active ? "active" : n)), _ || this.updateElement(y, x, S, n), v = M;
    }
    this.updateSharedOptions(d, n, h);
  }
  getMaxOverflow() {
    const t = this._cachedMeta, e = t.data || [];
    if (!this.options.showLine) {
      let a = 0;
      for (let l = e.length - 1; l >= 0; --l)
        a = Math.max(a, e[l].size(this.resolveDataElementOptions(l)) / 2);
      return a > 0 && a;
    }
    const s = t.dataset, n = s.options && s.options.borderWidth || 0;
    if (!e.length)
      return n;
    const o = e[0].size(this.resolveDataElementOptions(0)), r = e[e.length - 1].size(this.resolveDataElementOptions(e.length - 1));
    return Math.max(n, o, r) / 2;
  }
}
E(_i, "id", "scatter"), E(_i, "defaults", {
  datasetElementType: !1,
  dataElementType: "point",
  showLine: !1,
  fill: !1
}), E(_i, "overrides", {
  interaction: {
    mode: "point"
  },
  scales: {
    x: {
      type: "linear"
    },
    y: {
      type: "linear"
    }
  }
});
var Hh = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  BarController: pi,
  BubbleController: gi,
  DoughnutController: ee,
  LineController: mi,
  PieController: gs,
  PolarAreaController: Be,
  RadarController: bi,
  ScatterController: _i
});
function qt() {
  throw new Error("This method is not implemented: Check that a complete date adapter is provided.");
}
class Ys {
  constructor(t) {
    E(this, "options");
    this.options = t || {};
  }
  /**
  * Override default date adapter methods.
  * Accepts type parameter to define options type.
  * @example
  * Chart._adapters._date.override<{myAdapterOption: string}>({
  *   init() {
  *     console.log(this.options.myAdapterOption);
  *   }
  * })
  */
  static override(t) {
    Object.assign(Ys.prototype, t);
  }
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  init() {
  }
  formats() {
    return qt();
  }
  parse() {
    return qt();
  }
  format() {
    return qt();
  }
  add() {
    return qt();
  }
  diff() {
    return qt();
  }
  startOf() {
    return qt();
  }
  endOf() {
    return qt();
  }
}
var Vh = {
  _date: Ys
};
function Wh(i, t, e, s) {
  const { controller: n, data: o, _sorted: r } = i, a = n._cachedMeta.iScale, l = i.dataset && i.dataset.options ? i.dataset.options.spanGaps : null;
  if (a && t === a.axis && t !== "r" && r && o.length) {
    const c = a._reversePixels ? hc : Pt;
    if (s) {
      if (n._sharedOptions) {
        const h = o[0], d = typeof h.getRange == "function" && h.getRange(t);
        if (d) {
          const u = c(o, t, e - d), f = c(o, t, e + d);
          return {
            lo: u.lo,
            hi: f.hi
          };
        }
      }
    } else {
      const h = c(o, t, e);
      if (l) {
        const { vScale: d } = n._cachedMeta, { _parsed: u } = i, f = u.slice(0, h.lo + 1).reverse().findIndex((g) => !I(g[d.axis]));
        h.lo -= Math.max(0, f);
        const p = u.slice(h.hi).findIndex((g) => !I(g[d.axis]));
        h.hi += Math.max(0, p);
      }
      return h;
    }
  }
  return {
    lo: 0,
    hi: o.length - 1
  };
}
function Ni(i, t, e, s, n) {
  const o = i.getSortedVisibleDatasetMetas(), r = e[t];
  for (let a = 0, l = o.length; a < l; ++a) {
    const { index: c, data: h } = o[a], { lo: d, hi: u } = Wh(o[a], t, r, n);
    for (let f = d; f <= u; ++f) {
      const p = h[f];
      p.skip || s(p, c, f);
    }
  }
}
function jh(i) {
  const t = i.indexOf("x") !== -1, e = i.indexOf("y") !== -1;
  return function(s, n) {
    const o = t ? Math.abs(s.x - n.x) : 0, r = e ? Math.abs(s.y - n.y) : 0;
    return Math.sqrt(Math.pow(o, 2) + Math.pow(r, 2));
  };
}
function Ji(i, t, e, s, n) {
  const o = [];
  return !n && !i.isPointInArea(t) || Ni(i, e, t, function(a, l, c) {
    !n && !Dt(a, i.chartArea, 0) || a.inRange(t.x, t.y, s) && o.push({
      element: a,
      datasetIndex: l,
      index: c
    });
  }, !0), o;
}
function $h(i, t, e, s) {
  let n = [];
  function o(r, a, l) {
    const { startAngle: c, endAngle: h } = r.getProps([
      "startAngle",
      "endAngle"
    ], s), { angle: d } = or(r, {
      x: t.x,
      y: t.y
    });
    We(d, c, h) && n.push({
      element: r,
      datasetIndex: a,
      index: l
    });
  }
  return Ni(i, e, t, o), n;
}
function Yh(i, t, e, s, n, o) {
  let r = [];
  const a = jh(e);
  let l = Number.POSITIVE_INFINITY;
  function c(h, d, u) {
    const f = h.inRange(t.x, t.y, n);
    if (s && !f)
      return;
    const p = h.getCenterPoint(n);
    if (!(!!o || i.isPointInArea(p)) && !f)
      return;
    const m = a(t, p);
    m < l ? (r = [
      {
        element: h,
        datasetIndex: d,
        index: u
      }
    ], l = m) : m === l && r.push({
      element: h,
      datasetIndex: d,
      index: u
    });
  }
  return Ni(i, e, t, c), r;
}
function Qi(i, t, e, s, n, o) {
  return !o && !i.isPointInArea(t) ? [] : e === "r" && !s ? $h(i, t, e, n) : Yh(i, t, e, s, n, o);
}
function $n(i, t, e, s, n) {
  const o = [], r = e === "x" ? "inXRange" : "inYRange";
  let a = !1;
  return Ni(i, e, t, (l, c, h) => {
    l[r] && l[r](t[e], n) && (o.push({
      element: l,
      datasetIndex: c,
      index: h
    }), a = a || l.inRange(t.x, t.y, n));
  }), s && !a ? [] : o;
}
var Kh = {
  modes: {
    index(i, t, e, s) {
      const n = Qt(t, i), o = e.axis || "x", r = e.includeInvisible || !1, a = e.intersect ? Ji(i, n, o, s, r) : Qi(i, n, o, !1, s, r), l = [];
      return a.length ? (i.getSortedVisibleDatasetMetas().forEach((c) => {
        const h = a[0].index, d = c.data[h];
        d && !d.skip && l.push({
          element: d,
          datasetIndex: c.index,
          index: h
        });
      }), l) : [];
    },
    dataset(i, t, e, s) {
      const n = Qt(t, i), o = e.axis || "xy", r = e.includeInvisible || !1;
      let a = e.intersect ? Ji(i, n, o, s, r) : Qi(i, n, o, !1, s, r);
      if (a.length > 0) {
        const l = a[0].datasetIndex, c = i.getDatasetMeta(l).data;
        a = [];
        for (let h = 0; h < c.length; ++h)
          a.push({
            element: c[h],
            datasetIndex: l,
            index: h
          });
      }
      return a;
    },
    point(i, t, e, s) {
      const n = Qt(t, i), o = e.axis || "xy", r = e.includeInvisible || !1;
      return Ji(i, n, o, s, r);
    },
    nearest(i, t, e, s) {
      const n = Qt(t, i), o = e.axis || "xy", r = e.includeInvisible || !1;
      return Qi(i, n, o, e.intersect, s, r);
    },
    x(i, t, e, s) {
      const n = Qt(t, i);
      return $n(i, n, "x", e.intersect, s);
    },
    y(i, t, e, s) {
      const n = Qt(t, i);
      return $n(i, n, "y", e.intersect, s);
    }
  }
};
const Pr = [
  "left",
  "top",
  "right",
  "bottom"
];
function Se(i, t) {
  return i.filter((e) => e.pos === t);
}
function Yn(i, t) {
  return i.filter((e) => Pr.indexOf(e.pos) === -1 && e.box.axis === t);
}
function we(i, t) {
  return i.sort((e, s) => {
    const n = t ? s : e, o = t ? e : s;
    return n.weight === o.weight ? n.index - o.index : n.weight - o.weight;
  });
}
function Uh(i) {
  const t = [];
  let e, s, n, o, r, a;
  for (e = 0, s = (i || []).length; e < s; ++e)
    n = i[e], { position: o, options: { stack: r, stackWeight: a = 1 } } = n, t.push({
      index: e,
      box: n,
      pos: o,
      horizontal: n.isHorizontal(),
      weight: n.weight,
      stack: r && o + r,
      stackWeight: a
    });
  return t;
}
function Xh(i) {
  const t = {};
  for (const e of i) {
    const { stack: s, pos: n, stackWeight: o } = e;
    if (!s || !Pr.includes(n))
      continue;
    const r = t[s] || (t[s] = {
      count: 0,
      placed: 0,
      weight: 0,
      size: 0
    });
    r.count++, r.weight += o;
  }
  return t;
}
function Gh(i, t) {
  const e = Xh(i), { vBoxMaxWidth: s, hBoxMaxHeight: n } = t;
  let o, r, a;
  for (o = 0, r = i.length; o < r; ++o) {
    a = i[o];
    const { fullSize: l } = a.box, c = e[a.stack], h = c && a.stackWeight / c.weight;
    a.horizontal ? (a.width = h ? h * s : l && t.availableWidth, a.height = n) : (a.width = s, a.height = h ? h * n : l && t.availableHeight);
  }
  return e;
}
function qh(i) {
  const t = Uh(i), e = we(t.filter((c) => c.box.fullSize), !0), s = we(Se(t, "left"), !0), n = we(Se(t, "right")), o = we(Se(t, "top"), !0), r = we(Se(t, "bottom")), a = Yn(t, "x"), l = Yn(t, "y");
  return {
    fullSize: e,
    leftAndTop: s.concat(o),
    rightAndBottom: n.concat(l).concat(r).concat(a),
    chartArea: Se(t, "chartArea"),
    vertical: s.concat(n).concat(l),
    horizontal: o.concat(r).concat(a)
  };
}
function Kn(i, t, e, s) {
  return Math.max(i[e], t[e]) + Math.max(i[s], t[s]);
}
function Dr(i, t) {
  i.top = Math.max(i.top, t.top), i.left = Math.max(i.left, t.left), i.bottom = Math.max(i.bottom, t.bottom), i.right = Math.max(i.right, t.right);
}
function Jh(i, t, e, s) {
  const { pos: n, box: o } = e, r = i.maxPadding;
  if (!L(n)) {
    e.size && (i[n] -= e.size);
    const d = s[e.stack] || {
      size: 0,
      count: 1
    };
    d.size = Math.max(d.size, e.horizontal ? o.height : o.width), e.size = d.size / d.count, i[n] += e.size;
  }
  o.getPadding && Dr(r, o.getPadding());
  const a = Math.max(0, t.outerWidth - Kn(r, i, "left", "right")), l = Math.max(0, t.outerHeight - Kn(r, i, "top", "bottom")), c = a !== i.w, h = l !== i.h;
  return i.w = a, i.h = l, e.horizontal ? {
    same: c,
    other: h
  } : {
    same: h,
    other: c
  };
}
function Qh(i) {
  const t = i.maxPadding;
  function e(s) {
    const n = Math.max(t[s] - i[s], 0);
    return i[s] += n, n;
  }
  i.y += e("top"), i.x += e("left"), e("right"), e("bottom");
}
function Zh(i, t) {
  const e = t.maxPadding;
  function s(n) {
    const o = {
      left: 0,
      top: 0,
      right: 0,
      bottom: 0
    };
    return n.forEach((r) => {
      o[r] = Math.max(t[r], e[r]);
    }), o;
  }
  return s(i ? [
    "left",
    "right"
  ] : [
    "top",
    "bottom"
  ]);
}
function Oe(i, t, e, s) {
  const n = [];
  let o, r, a, l, c, h;
  for (o = 0, r = i.length, c = 0; o < r; ++o) {
    a = i[o], l = a.box, l.update(a.width || t.w, a.height || t.h, Zh(a.horizontal, t));
    const { same: d, other: u } = Jh(t, e, a, s);
    c |= d && n.length, h = h || u, l.fullSize || n.push(a);
  }
  return c && Oe(n, t, e, s) || h;
}
function ri(i, t, e, s, n) {
  i.top = e, i.left = t, i.right = t + s, i.bottom = e + n, i.width = s, i.height = n;
}
function Un(i, t, e, s) {
  const n = e.padding;
  let { x: o, y: r } = t;
  for (const a of i) {
    const l = a.box, c = s[a.stack] || {
      placed: 0,
      weight: 1
    }, h = a.stackWeight / c.weight || 1;
    if (a.horizontal) {
      const d = t.w * h, u = c.size || l.height;
      Ve(c.start) && (r = c.start), l.fullSize ? ri(l, n.left, r, e.outerWidth - n.right - n.left, u) : ri(l, t.left + c.placed, r, d, u), c.start = r, c.placed += d, r = l.bottom;
    } else {
      const d = t.h * h, u = c.size || l.width;
      Ve(c.start) && (o = c.start), l.fullSize ? ri(l, o, n.top, u, e.outerHeight - n.bottom - n.top) : ri(l, o, t.top + c.placed, u, d), c.start = o, c.placed += d, o = l.right;
    }
  }
  t.x = o, t.y = r;
}
var it = {
  addBox(i, t) {
    i.boxes || (i.boxes = []), t.fullSize = t.fullSize || !1, t.position = t.position || "top", t.weight = t.weight || 0, t._layers = t._layers || function() {
      return [
        {
          z: 0,
          draw(e) {
            t.draw(e);
          }
        }
      ];
    }, i.boxes.push(t);
  },
  removeBox(i, t) {
    const e = i.boxes ? i.boxes.indexOf(t) : -1;
    e !== -1 && i.boxes.splice(e, 1);
  },
  configure(i, t, e) {
    t.fullSize = e.fullSize, t.position = e.position, t.weight = e.weight;
  },
  update(i, t, e, s) {
    if (!i)
      return;
    const n = nt(i.options.layout.padding), o = Math.max(t - n.width, 0), r = Math.max(e - n.height, 0), a = qh(i.boxes), l = a.vertical, c = a.horizontal;
    N(i.boxes, (g) => {
      typeof g.beforeLayout == "function" && g.beforeLayout();
    });
    const h = l.reduce((g, m) => m.box.options && m.box.options.display === !1 ? g : g + 1, 0) || 1, d = Object.freeze({
      outerWidth: t,
      outerHeight: e,
      padding: n,
      availableWidth: o,
      availableHeight: r,
      vBoxMaxWidth: o / 2 / h,
      hBoxMaxHeight: r / 2
    }), u = Object.assign({}, n);
    Dr(u, nt(s));
    const f = Object.assign({
      maxPadding: u,
      w: o,
      h: r,
      x: n.left,
      y: n.top
    }, n), p = Gh(l.concat(c), d);
    Oe(a.fullSize, f, d, p), Oe(l, f, d, p), Oe(c, f, d, p) && Oe(l, f, d, p), Qh(f), Un(a.leftAndTop, f, d, p), f.x += f.w, f.y += f.h, Un(a.rightAndBottom, f, d, p), i.chartArea = {
      left: f.left,
      top: f.top,
      right: f.left + f.w,
      bottom: f.top + f.h,
      height: f.h,
      width: f.w
    }, N(a.chartArea, (g) => {
      const m = g.box;
      Object.assign(m, i.chartArea), m.update(f.w, f.h, {
        left: 0,
        top: 0,
        right: 0,
        bottom: 0
      });
    });
  }
};
class Tr {
  acquireContext(t, e) {
  }
  releaseContext(t) {
    return !1;
  }
  addEventListener(t, e, s) {
  }
  removeEventListener(t, e, s) {
  }
  getDevicePixelRatio() {
    return 1;
  }
  getMaximumSize(t, e, s, n) {
    return e = Math.max(0, e || t.width), s = s || t.height, {
      width: e,
      height: Math.max(0, n ? Math.floor(e / n) : s)
    };
  }
  isAttached(t) {
    return !0;
  }
  updateConfig(t) {
  }
}
class td extends Tr {
  acquireContext(t) {
    return t && t.getContext && t.getContext("2d") || null;
  }
  updateConfig(t) {
    t.options.animation = !1;
  }
}
const yi = "$chartjs", ed = {
  touchstart: "mousedown",
  touchmove: "mousemove",
  touchend: "mouseup",
  pointerenter: "mouseenter",
  pointerdown: "mousedown",
  pointermove: "mousemove",
  pointerup: "mouseup",
  pointerleave: "mouseout",
  pointerout: "mouseout"
}, Xn = (i) => i === null || i === "";
function id(i, t) {
  const e = i.style, s = i.getAttribute("height"), n = i.getAttribute("width");
  if (i[yi] = {
    initial: {
      height: s,
      width: n,
      style: {
        display: e.display,
        height: e.height,
        width: e.width
      }
    }
  }, e.display = e.display || "block", e.boxSizing = e.boxSizing || "border-box", Xn(n)) {
    const o = Dn(i, "width");
    o !== void 0 && (i.width = o);
  }
  if (Xn(s))
    if (i.style.height === "")
      i.height = i.width / (t || 2);
    else {
      const o = Dn(i, "height");
      o !== void 0 && (i.height = o);
    }
  return i;
}
const Ir = sh ? {
  passive: !0
} : !1;
function sd(i, t, e) {
  i && i.addEventListener(t, e, Ir);
}
function nd(i, t, e) {
  i && i.canvas && i.canvas.removeEventListener(t, e, Ir);
}
function od(i, t) {
  const e = ed[i.type] || i.type, { x: s, y: n } = Qt(i, t);
  return {
    type: e,
    chart: t,
    native: i,
    x: s !== void 0 ? s : null,
    y: n !== void 0 ? n : null
  };
}
function Oi(i, t) {
  for (const e of i)
    if (e === t || e.contains(t))
      return !0;
}
function rd(i, t, e) {
  const s = i.canvas, n = new MutationObserver((o) => {
    let r = !1;
    for (const a of o)
      r = r || Oi(a.addedNodes, s), r = r && !Oi(a.removedNodes, s);
    r && e();
  });
  return n.observe(document, {
    childList: !0,
    subtree: !0
  }), n;
}
function ad(i, t, e) {
  const s = i.canvas, n = new MutationObserver((o) => {
    let r = !1;
    for (const a of o)
      r = r || Oi(a.removedNodes, s), r = r && !Oi(a.addedNodes, s);
    r && e();
  });
  return n.observe(document, {
    childList: !0,
    subtree: !0
  }), n;
}
const $e = /* @__PURE__ */ new Map();
let Gn = 0;
function Lr() {
  const i = window.devicePixelRatio;
  i !== Gn && (Gn = i, $e.forEach((t, e) => {
    e.currentDevicePixelRatio !== i && t();
  }));
}
function ld(i, t) {
  $e.size || window.addEventListener("resize", Lr), $e.set(i, t);
}
function cd(i) {
  $e.delete(i), $e.size || window.removeEventListener("resize", Lr);
}
function hd(i, t, e) {
  const s = i.canvas, n = s && $s(s);
  if (!n)
    return;
  const o = cr((a, l) => {
    const c = n.clientWidth;
    e(a, l), c < n.clientWidth && e();
  }, window), r = new ResizeObserver((a) => {
    const l = a[0], c = l.contentRect.width, h = l.contentRect.height;
    c === 0 && h === 0 || o(c, h);
  });
  return r.observe(n), ld(i, o), r;
}
function Zi(i, t, e) {
  e && e.disconnect(), t === "resize" && cd(i);
}
function dd(i, t, e) {
  const s = i.canvas, n = cr((o) => {
    i.ctx !== null && e(od(o, i));
  }, i);
  return sd(s, t, n), n;
}
class ud extends Tr {
  acquireContext(t, e) {
    const s = t && t.getContext && t.getContext("2d");
    return s && s.canvas === t ? (id(t, e), s) : null;
  }
  releaseContext(t) {
    const e = t.canvas;
    if (!e[yi])
      return !1;
    const s = e[yi].initial;
    [
      "height",
      "width"
    ].forEach((o) => {
      const r = s[o];
      I(r) ? e.removeAttribute(o) : e.setAttribute(o, r);
    });
    const n = s.style || {};
    return Object.keys(n).forEach((o) => {
      e.style[o] = n[o];
    }), e.width = e.width, delete e[yi], !0;
  }
  addEventListener(t, e, s) {
    this.removeEventListener(t, e);
    const n = t.$proxies || (t.$proxies = {}), r = {
      attach: rd,
      detach: ad,
      resize: hd
    }[e] || dd;
    n[e] = r(t, e, s);
  }
  removeEventListener(t, e) {
    const s = t.$proxies || (t.$proxies = {}), n = s[e];
    if (!n)
      return;
    ({
      attach: Zi,
      detach: Zi,
      resize: Zi
    }[e] || nd)(t, e, n), s[e] = void 0;
  }
  getDevicePixelRatio() {
    return window.devicePixelRatio;
  }
  getMaximumSize(t, e, s, n) {
    return ih(t, e, s, n);
  }
  isAttached(t) {
    const e = t && $s(t);
    return !!(e && e.isConnected);
  }
}
function fd(i) {
  return !js() || typeof OffscreenCanvas < "u" && i instanceof OffscreenCanvas ? td : ud;
}
var fi;
let Lt = (fi = class {
  constructor() {
    E(this, "x");
    E(this, "y");
    E(this, "active", !1);
    E(this, "options");
    E(this, "$animations");
  }
  tooltipPosition(t) {
    const { x: e, y: s } = this.getProps([
      "x",
      "y"
    ], t);
    return {
      x: e,
      y: s
    };
  }
  hasValue() {
    return pe(this.x) && pe(this.y);
  }
  getProps(t, e) {
    const s = this.$animations;
    if (!e || !s)
      return this;
    const n = {};
    return t.forEach((o) => {
      n[o] = s[o] && s[o].active() ? s[o]._to : this[o];
    }), n;
  }
}, E(fi, "defaults", {}), E(fi, "defaultRoutes"), fi);
function pd(i, t) {
  const e = i.options.ticks, s = gd(i), n = Math.min(e.maxTicksLimit || s, s), o = e.major.enabled ? bd(t) : [], r = o.length, a = o[0], l = o[r - 1], c = [];
  if (r > n)
    return _d(t, c, o, r / n), c;
  const h = md(o, t, n);
  if (r > 0) {
    let d, u;
    const f = r > 1 ? Math.round((l - a) / (r - 1)) : null;
    for (ai(t, c, h, I(f) ? 0 : a - f, a), d = 0, u = r - 1; d < u; d++)
      ai(t, c, h, o[d], o[d + 1]);
    return ai(t, c, h, l, I(f) ? t.length : l + f), c;
  }
  return ai(t, c, h), c;
}
function gd(i) {
  const t = i.options.offset, e = i._tickSize(), s = i._length / e + (t ? 0 : 1), n = i._maxLength / e;
  return Math.floor(Math.min(s, n));
}
function md(i, t, e) {
  const s = yd(i), n = t.length / e;
  if (!s)
    return Math.max(n, 1);
  const o = oc(s);
  for (let r = 0, a = o.length - 1; r < a; r++) {
    const l = o[r];
    if (l > n)
      return l;
  }
  return Math.max(n, 1);
}
function bd(i) {
  const t = [];
  let e, s;
  for (e = 0, s = i.length; e < s; e++)
    i[e].major && t.push(e);
  return t;
}
function _d(i, t, e, s) {
  let n = 0, o = e[0], r;
  for (s = Math.ceil(s), r = 0; r < i.length; r++)
    r === o && (t.push(i[r]), n++, o = e[n * s]);
}
function ai(i, t, e, s, n) {
  const o = k(s, 0), r = Math.min(k(n, i.length), i.length);
  let a = 0, l, c, h;
  for (e = Math.ceil(e), n && (l = n - s, e = l / Math.floor(l / e)), h = o; h < 0; )
    a++, h = Math.round(o + a * e);
  for (c = Math.max(o, 0); c < r; c++)
    c === h && (t.push(i[c]), a++, h = Math.round(o + a * e));
}
function yd(i) {
  const t = i.length;
  let e, s;
  if (t < 2)
    return !1;
  for (s = i[0], e = 1; e < t; ++e)
    if (i[e] - i[e - 1] !== s)
      return !1;
  return s;
}
const vd = (i) => i === "left" ? "right" : i === "right" ? "left" : i, qn = (i, t, e) => t === "top" || t === "left" ? i[t] + e : i[t] - e, Jn = (i, t) => Math.min(t || i, i);
function Qn(i, t) {
  const e = [], s = i.length / t, n = i.length;
  let o = 0;
  for (; o < n; o += s)
    e.push(i[Math.floor(o)]);
  return e;
}
function xd(i, t, e) {
  const s = i.ticks.length, n = Math.min(t, s - 1), o = i._startPixel, r = i._endPixel, a = 1e-6;
  let l = i.getPixelForTick(n), c;
  if (!(e && (s === 1 ? c = Math.max(l - o, r - l) : t === 0 ? c = (i.getPixelForTick(1) - l) / 2 : c = (l - i.getPixelForTick(n - 1)) / 2, l += n < t ? c : -c, l < o - a || l > r + a)))
    return l;
}
function Sd(i, t) {
  N(i, (e) => {
    const s = e.gc, n = s.length / 2;
    let o;
    if (n > t) {
      for (o = 0; o < n; ++o)
        delete e.data[s[o]];
      s.splice(0, n);
    }
  });
}
function Me(i) {
  return i.drawTicks ? i.tickLength : 0;
}
function Zn(i, t) {
  if (!i.display)
    return 0;
  const e = X(i.font, t), s = nt(i.padding);
  return (W(i.text) ? i.text.length : 1) * e.lineHeight + s.height;
}
function wd(i, t) {
  return Yt(i, {
    scale: t,
    type: "scale"
  });
}
function Md(i, t, e) {
  return Yt(i, {
    tick: e,
    index: t,
    type: "tick"
  });
}
function Ed(i, t, e) {
  let s = Ns(i);
  return (e && t !== "right" || !e && t === "right") && (s = vd(s)), s;
}
function Cd(i, t, e, s) {
  const { top: n, left: o, bottom: r, right: a, chart: l } = i, { chartArea: c, scales: h } = l;
  let d = 0, u, f, p;
  const g = r - n, m = a - o;
  if (i.isHorizontal()) {
    if (f = tt(s, o, a), L(e)) {
      const b = Object.keys(e)[0], _ = e[b];
      p = h[b].getPixelForValue(_) + g - t;
    } else e === "center" ? p = (c.bottom + c.top) / 2 + g - t : p = qn(i, e, t);
    u = a - o;
  } else {
    if (L(e)) {
      const b = Object.keys(e)[0], _ = e[b];
      f = h[b].getPixelForValue(_) - m + t;
    } else e === "center" ? f = (c.left + c.right) / 2 - m + t : f = qn(i, e, t);
    p = tt(s, r, n), d = e === "left" ? -U : U;
  }
  return {
    titleX: f,
    titleY: p,
    maxWidth: u,
    rotation: d
  };
}
class re extends Lt {
  constructor(t) {
    super(), this.id = t.id, this.type = t.type, this.options = void 0, this.ctx = t.ctx, this.chart = t.chart, this.top = void 0, this.bottom = void 0, this.left = void 0, this.right = void 0, this.width = void 0, this.height = void 0, this._margins = {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0
    }, this.maxWidth = void 0, this.maxHeight = void 0, this.paddingTop = void 0, this.paddingBottom = void 0, this.paddingLeft = void 0, this.paddingRight = void 0, this.axis = void 0, this.labelRotation = void 0, this.min = void 0, this.max = void 0, this._range = void 0, this.ticks = [], this._gridLineItems = null, this._labelItems = null, this._labelSizes = null, this._length = 0, this._maxLength = 0, this._longestTextCache = {}, this._startPixel = void 0, this._endPixel = void 0, this._reversePixels = !1, this._userMax = void 0, this._userMin = void 0, this._suggestedMax = void 0, this._suggestedMin = void 0, this._ticksLength = 0, this._borderValue = 0, this._cache = {}, this._dataLimitsCached = !1, this.$context = void 0;
  }
  init(t) {
    this.options = t.setContext(this.getContext()), this.axis = t.axis, this._userMin = this.parse(t.min), this._userMax = this.parse(t.max), this._suggestedMin = this.parse(t.suggestedMin), this._suggestedMax = this.parse(t.suggestedMax);
  }
  parse(t, e) {
    return t;
  }
  getUserBounds() {
    let { _userMin: t, _userMax: e, _suggestedMin: s, _suggestedMax: n } = this;
    return t = ct(t, Number.POSITIVE_INFINITY), e = ct(e, Number.NEGATIVE_INFINITY), s = ct(s, Number.POSITIVE_INFINITY), n = ct(n, Number.NEGATIVE_INFINITY), {
      min: ct(t, s),
      max: ct(e, n),
      minDefined: $(t),
      maxDefined: $(e)
    };
  }
  getMinMax(t) {
    let { min: e, max: s, minDefined: n, maxDefined: o } = this.getUserBounds(), r;
    if (n && o)
      return {
        min: e,
        max: s
      };
    const a = this.getMatchingVisibleMetas();
    for (let l = 0, c = a.length; l < c; ++l)
      r = a[l].controller.getMinMax(this, t), n || (e = Math.min(e, r.min)), o || (s = Math.max(s, r.max));
    return e = o && e > s ? s : e, s = n && e > s ? e : s, {
      min: ct(e, ct(s, e)),
      max: ct(s, ct(e, s))
    };
  }
  getPadding() {
    return {
      left: this.paddingLeft || 0,
      top: this.paddingTop || 0,
      right: this.paddingRight || 0,
      bottom: this.paddingBottom || 0
    };
  }
  getTicks() {
    return this.ticks;
  }
  getLabels() {
    const t = this.chart.data;
    return this.options.labels || (this.isHorizontal() ? t.xLabels : t.yLabels) || t.labels || [];
  }
  getLabelItems(t = this.chart.chartArea) {
    return this._labelItems || (this._labelItems = this._computeLabelItems(t));
  }
  beforeLayout() {
    this._cache = {}, this._dataLimitsCached = !1;
  }
  beforeUpdate() {
    z(this.options.beforeUpdate, [
      this
    ]);
  }
  update(t, e, s) {
    const { beginAtZero: n, grace: o, ticks: r } = this.options, a = r.sampleSize;
    this.beforeUpdate(), this.maxWidth = t, this.maxHeight = e, this._margins = s = Object.assign({
      left: 0,
      right: 0,
      top: 0,
      bottom: 0
    }, s), this.ticks = null, this._labelSizes = null, this._gridLineItems = null, this._labelItems = null, this.beforeSetDimensions(), this.setDimensions(), this.afterSetDimensions(), this._maxLength = this.isHorizontal() ? this.width + s.left + s.right : this.height + s.top + s.bottom, this._dataLimitsCached || (this.beforeDataLimits(), this.determineDataLimits(), this.afterDataLimits(), this._range = Lc(this, o, n), this._dataLimitsCached = !0), this.beforeBuildTicks(), this.ticks = this.buildTicks() || [], this.afterBuildTicks();
    const l = a < this.ticks.length;
    this._convertTicksToLabels(l ? Qn(this.ticks, a) : this.ticks), this.configure(), this.beforeCalculateLabelRotation(), this.calculateLabelRotation(), this.afterCalculateLabelRotation(), r.display && (r.autoSkip || r.source === "auto") && (this.ticks = pd(this, this.ticks), this._labelSizes = null, this.afterAutoSkip()), l && this._convertTicksToLabels(this.ticks), this.beforeFit(), this.fit(), this.afterFit(), this.afterUpdate();
  }
  configure() {
    let t = this.options.reverse, e, s;
    this.isHorizontal() ? (e = this.left, s = this.right) : (e = this.top, s = this.bottom, t = !t), this._startPixel = e, this._endPixel = s, this._reversePixels = t, this._length = s - e, this._alignToPixels = this.options.alignToPixels;
  }
  afterUpdate() {
    z(this.options.afterUpdate, [
      this
    ]);
  }
  beforeSetDimensions() {
    z(this.options.beforeSetDimensions, [
      this
    ]);
  }
  setDimensions() {
    this.isHorizontal() ? (this.width = this.maxWidth, this.left = 0, this.right = this.width) : (this.height = this.maxHeight, this.top = 0, this.bottom = this.height), this.paddingLeft = 0, this.paddingTop = 0, this.paddingRight = 0, this.paddingBottom = 0;
  }
  afterSetDimensions() {
    z(this.options.afterSetDimensions, [
      this
    ]);
  }
  _callHooks(t) {
    this.chart.notifyPlugins(t, this.getContext()), z(this.options[t], [
      this
    ]);
  }
  beforeDataLimits() {
    this._callHooks("beforeDataLimits");
  }
  determineDataLimits() {
  }
  afterDataLimits() {
    this._callHooks("afterDataLimits");
  }
  beforeBuildTicks() {
    this._callHooks("beforeBuildTicks");
  }
  buildTicks() {
    return [];
  }
  afterBuildTicks() {
    this._callHooks("afterBuildTicks");
  }
  beforeTickToLabelConversion() {
    z(this.options.beforeTickToLabelConversion, [
      this
    ]);
  }
  generateTickLabels(t) {
    const e = this.options.ticks;
    let s, n, o;
    for (s = 0, n = t.length; s < n; s++)
      o = t[s], o.label = z(e.callback, [
        o.value,
        s,
        t
      ], this);
  }
  afterTickToLabelConversion() {
    z(this.options.afterTickToLabelConversion, [
      this
    ]);
  }
  beforeCalculateLabelRotation() {
    z(this.options.beforeCalculateLabelRotation, [
      this
    ]);
  }
  calculateLabelRotation() {
    const t = this.options, e = t.ticks, s = Jn(this.ticks.length, t.ticks.maxTicksLimit), n = e.minRotation || 0, o = e.maxRotation;
    let r = n, a, l, c;
    if (!this._isVisible() || !e.display || n >= o || s <= 1 || !this.isHorizontal()) {
      this.labelRotation = n;
      return;
    }
    const h = this._getLabelSizes(), d = h.widest.width, u = h.highest.height, f = q(this.chart.width - d, 0, this.maxWidth);
    a = t.offset ? this.maxWidth / s : f / (s - 1), d + 6 > a && (a = f / (s - (t.offset ? 0.5 : 1)), l = this.maxHeight - Me(t.grid) - e.padding - Zn(t.title, this.chart.options.font), c = Math.sqrt(d * d + u * u), r = Rs(Math.min(Math.asin(q((h.highest.height + 6) / a, -1, 1)), Math.asin(q(l / c, -1, 1)) - Math.asin(q(u / c, -1, 1)))), r = Math.max(n, Math.min(o, r))), this.labelRotation = r;
  }
  afterCalculateLabelRotation() {
    z(this.options.afterCalculateLabelRotation, [
      this
    ]);
  }
  afterAutoSkip() {
  }
  beforeFit() {
    z(this.options.beforeFit, [
      this
    ]);
  }
  fit() {
    const t = {
      width: 0,
      height: 0
    }, { chart: e, options: { ticks: s, title: n, grid: o } } = this, r = this._isVisible(), a = this.isHorizontal();
    if (r) {
      const l = Zn(n, e.options.font);
      if (a ? (t.width = this.maxWidth, t.height = Me(o) + l) : (t.height = this.maxHeight, t.width = Me(o) + l), s.display && this.ticks.length) {
        const { first: c, last: h, widest: d, highest: u } = this._getLabelSizes(), f = s.padding * 2, p = pt(this.labelRotation), g = Math.cos(p), m = Math.sin(p);
        if (a) {
          const b = s.mirror ? 0 : m * d.width + g * u.height;
          t.height = Math.min(this.maxHeight, t.height + b + f);
        } else {
          const b = s.mirror ? 0 : g * d.width + m * u.height;
          t.width = Math.min(this.maxWidth, t.width + b + f);
        }
        this._calculatePadding(c, h, m, g);
      }
    }
    this._handleMargins(), a ? (this.width = this._length = e.width - this._margins.left - this._margins.right, this.height = t.height) : (this.width = t.width, this.height = this._length = e.height - this._margins.top - this._margins.bottom);
  }
  _calculatePadding(t, e, s, n) {
    const { ticks: { align: o, padding: r }, position: a } = this.options, l = this.labelRotation !== 0, c = a !== "top" && this.axis === "x";
    if (this.isHorizontal()) {
      const h = this.getPixelForTick(0) - this.left, d = this.right - this.getPixelForTick(this.ticks.length - 1);
      let u = 0, f = 0;
      l ? c ? (u = n * t.width, f = s * e.height) : (u = s * t.height, f = n * e.width) : o === "start" ? f = e.width : o === "end" ? u = t.width : o !== "inner" && (u = t.width / 2, f = e.width / 2), this.paddingLeft = Math.max((u - h + r) * this.width / (this.width - h), 0), this.paddingRight = Math.max((f - d + r) * this.width / (this.width - d), 0);
    } else {
      let h = e.height / 2, d = t.height / 2;
      o === "start" ? (h = 0, d = t.height) : o === "end" && (h = e.height, d = 0), this.paddingTop = h + r, this.paddingBottom = d + r;
    }
  }
  _handleMargins() {
    this._margins && (this._margins.left = Math.max(this.paddingLeft, this._margins.left), this._margins.top = Math.max(this.paddingTop, this._margins.top), this._margins.right = Math.max(this.paddingRight, this._margins.right), this._margins.bottom = Math.max(this.paddingBottom, this._margins.bottom));
  }
  afterFit() {
    z(this.options.afterFit, [
      this
    ]);
  }
  isHorizontal() {
    const { axis: t, position: e } = this.options;
    return e === "top" || e === "bottom" || t === "x";
  }
  isFullSize() {
    return this.options.fullSize;
  }
  _convertTicksToLabels(t) {
    this.beforeTickToLabelConversion(), this.generateTickLabels(t);
    let e, s;
    for (e = 0, s = t.length; e < s; e++)
      I(t[e].label) && (t.splice(e, 1), s--, e--);
    this.afterTickToLabelConversion();
  }
  _getLabelSizes() {
    let t = this._labelSizes;
    if (!t) {
      const e = this.options.ticks.sampleSize;
      let s = this.ticks;
      e < s.length && (s = Qn(s, e)), this._labelSizes = t = this._computeLabelSizes(s, s.length, this.options.ticks.maxTicksLimit);
    }
    return t;
  }
  _computeLabelSizes(t, e, s) {
    const { ctx: n, _longestTextCache: o } = this, r = [], a = [], l = Math.floor(e / Jn(e, s));
    let c = 0, h = 0, d, u, f, p, g, m, b, _, v, x, y;
    for (d = 0; d < e; d += l) {
      if (p = t[d].label, g = this._resolveTickFontOptions(d), n.font = m = g.string, b = o[m] = o[m] || {
        data: {},
        gc: []
      }, _ = g.lineHeight, v = x = 0, !I(p) && !W(p))
        v = Ai(n, b.data, b.gc, v, p), x = _;
      else if (W(p))
        for (u = 0, f = p.length; u < f; ++u)
          y = p[u], !I(y) && !W(y) && (v = Ai(n, b.data, b.gc, v, y), x += _);
      r.push(v), a.push(x), c = Math.max(v, c), h = Math.max(x, h);
    }
    Sd(o, e);
    const M = r.indexOf(c), S = a.indexOf(h), w = (C) => ({
      width: r[C] || 0,
      height: a[C] || 0
    });
    return {
      first: w(0),
      last: w(e - 1),
      widest: w(M),
      highest: w(S),
      widths: r,
      heights: a
    };
  }
  getLabelForValue(t) {
    return t;
  }
  getPixelForValue(t, e) {
    return NaN;
  }
  getValueForPixel(t) {
  }
  getPixelForTick(t) {
    const e = this.ticks;
    return t < 0 || t > e.length - 1 ? null : this.getPixelForValue(e[t].value);
  }
  getPixelForDecimal(t) {
    this._reversePixels && (t = 1 - t);
    const e = this._startPixel + t * this._length;
    return cc(this._alignToPixels ? Gt(this.chart, e, 0) : e);
  }
  getDecimalForPixel(t) {
    const e = (t - this._startPixel) / this._length;
    return this._reversePixels ? 1 - e : e;
  }
  getBasePixel() {
    return this.getPixelForValue(this.getBaseValue());
  }
  getBaseValue() {
    const { min: t, max: e } = this;
    return t < 0 && e < 0 ? e : t > 0 && e > 0 ? t : 0;
  }
  getContext(t) {
    const e = this.ticks || [];
    if (t >= 0 && t < e.length) {
      const s = e[t];
      return s.$context || (s.$context = Md(this.getContext(), t, s));
    }
    return this.$context || (this.$context = wd(this.chart.getContext(), this));
  }
  _tickSize() {
    const t = this.options.ticks, e = pt(this.labelRotation), s = Math.abs(Math.cos(e)), n = Math.abs(Math.sin(e)), o = this._getLabelSizes(), r = t.autoSkipPadding || 0, a = o ? o.widest.width + r : 0, l = o ? o.highest.height + r : 0;
    return this.isHorizontal() ? l * s > a * n ? a / s : l / n : l * n < a * s ? l / s : a / n;
  }
  _isVisible() {
    const t = this.options.display;
    return t !== "auto" ? !!t : this.getMatchingVisibleMetas().length > 0;
  }
  _computeGridLineItems(t) {
    const e = this.axis, s = this.chart, n = this.options, { grid: o, position: r, border: a } = n, l = o.offset, c = this.isHorizontal(), d = this.ticks.length + (l ? 1 : 0), u = Me(o), f = [], p = a.setContext(this.getContext()), g = p.display ? p.width : 0, m = g / 2, b = function(B) {
      return Gt(s, B, g);
    };
    let _, v, x, y, M, S, w, C, D, O, T, G;
    if (r === "top")
      _ = b(this.bottom), S = this.bottom - u, C = _ - m, O = b(t.top) + m, G = t.bottom;
    else if (r === "bottom")
      _ = b(this.top), O = t.top, G = b(t.bottom) - m, S = _ + m, C = this.top + u;
    else if (r === "left")
      _ = b(this.right), M = this.right - u, w = _ - m, D = b(t.left) + m, T = t.right;
    else if (r === "right")
      _ = b(this.left), D = t.left, T = b(t.right) - m, M = _ + m, w = this.left + u;
    else if (e === "x") {
      if (r === "center")
        _ = b((t.top + t.bottom) / 2 + 0.5);
      else if (L(r)) {
        const B = Object.keys(r)[0], Y = r[B];
        _ = b(this.chart.scales[B].getPixelForValue(Y));
      }
      O = t.top, G = t.bottom, S = _ + m, C = S + u;
    } else if (e === "y") {
      if (r === "center")
        _ = b((t.left + t.right) / 2);
      else if (L(r)) {
        const B = Object.keys(r)[0], Y = r[B];
        _ = b(this.chart.scales[B].getPixelForValue(Y));
      }
      M = _ - m, w = M - u, D = t.left, T = t.right;
    }
    const H = k(n.ticks.maxTicksLimit, d), R = Math.max(1, Math.ceil(d / H));
    for (v = 0; v < d; v += R) {
      const B = this.getContext(v), Y = o.setContext(B), ut = a.setContext(B), Q = Y.lineWidth, ae = Y.color, Je = ut.dash || [], le = ut.dashOffset, _e = Y.tickWidth, Kt = Y.tickColor, ye = Y.tickBorderDash || [], Ut = Y.tickBorderDashOffset;
      x = xd(this, v, l), x !== void 0 && (y = Gt(s, x, Q), c ? M = w = D = T = y : S = C = O = G = y, f.push({
        tx1: M,
        ty1: S,
        tx2: w,
        ty2: C,
        x1: D,
        y1: O,
        x2: T,
        y2: G,
        width: Q,
        color: ae,
        borderDash: Je,
        borderDashOffset: le,
        tickWidth: _e,
        tickColor: Kt,
        tickBorderDash: ye,
        tickBorderDashOffset: Ut
      }));
    }
    return this._ticksLength = d, this._borderValue = _, f;
  }
  _computeLabelItems(t) {
    const e = this.axis, s = this.options, { position: n, ticks: o } = s, r = this.isHorizontal(), a = this.ticks, { align: l, crossAlign: c, padding: h, mirror: d } = o, u = Me(s.grid), f = u + h, p = d ? -h : f, g = -pt(this.labelRotation), m = [];
    let b, _, v, x, y, M, S, w, C, D, O, T, G = "middle";
    if (n === "top")
      M = this.bottom - p, S = this._getXAxisLabelAlignment();
    else if (n === "bottom")
      M = this.top + p, S = this._getXAxisLabelAlignment();
    else if (n === "left") {
      const R = this._getYAxisLabelAlignment(u);
      S = R.textAlign, y = R.x;
    } else if (n === "right") {
      const R = this._getYAxisLabelAlignment(u);
      S = R.textAlign, y = R.x;
    } else if (e === "x") {
      if (n === "center")
        M = (t.top + t.bottom) / 2 + f;
      else if (L(n)) {
        const R = Object.keys(n)[0], B = n[R];
        M = this.chart.scales[R].getPixelForValue(B) + f;
      }
      S = this._getXAxisLabelAlignment();
    } else if (e === "y") {
      if (n === "center")
        y = (t.left + t.right) / 2 - f;
      else if (L(n)) {
        const R = Object.keys(n)[0], B = n[R];
        y = this.chart.scales[R].getPixelForValue(B);
      }
      S = this._getYAxisLabelAlignment(u).textAlign;
    }
    e === "y" && (l === "start" ? G = "top" : l === "end" && (G = "bottom"));
    const H = this._getLabelSizes();
    for (b = 0, _ = a.length; b < _; ++b) {
      v = a[b], x = v.label;
      const R = o.setContext(this.getContext(b));
      w = this.getPixelForTick(b) + o.labelOffset, C = this._resolveTickFontOptions(b), D = C.lineHeight, O = W(x) ? x.length : 1;
      const B = O / 2, Y = R.color, ut = R.textStrokeColor, Q = R.textStrokeWidth;
      let ae = S;
      r ? (y = w, S === "inner" && (b === _ - 1 ? ae = this.options.reverse ? "left" : "right" : b === 0 ? ae = this.options.reverse ? "right" : "left" : ae = "center"), n === "top" ? c === "near" || g !== 0 ? T = -O * D + D / 2 : c === "center" ? T = -H.highest.height / 2 - B * D + D : T = -H.highest.height + D / 2 : c === "near" || g !== 0 ? T = D / 2 : c === "center" ? T = H.highest.height / 2 - B * D : T = H.highest.height - O * D, d && (T *= -1), g !== 0 && !R.showLabelBackdrop && (y += D / 2 * Math.sin(g))) : (M = w, T = (1 - O) * D / 2);
      let Je;
      if (R.showLabelBackdrop) {
        const le = nt(R.backdropPadding), _e = H.heights[b], Kt = H.widths[b];
        let ye = T - le.top, Ut = 0 - le.left;
        switch (G) {
          case "middle":
            ye -= _e / 2;
            break;
          case "bottom":
            ye -= _e;
            break;
        }
        switch (S) {
          case "center":
            Ut -= Kt / 2;
            break;
          case "right":
            Ut -= Kt;
            break;
          case "inner":
            b === _ - 1 ? Ut -= Kt : b > 0 && (Ut -= Kt / 2);
            break;
        }
        Je = {
          left: Ut,
          top: ye,
          width: Kt + le.width,
          height: _e + le.height,
          color: R.backdropColor
        };
      }
      m.push({
        label: x,
        font: C,
        textOffset: T,
        options: {
          rotation: g,
          color: Y,
          strokeColor: ut,
          strokeWidth: Q,
          textAlign: ae,
          textBaseline: G,
          translation: [
            y,
            M
          ],
          backdrop: Je
        }
      });
    }
    return m;
  }
  _getXAxisLabelAlignment() {
    const { position: t, ticks: e } = this.options;
    if (-pt(this.labelRotation))
      return t === "top" ? "left" : "right";
    let n = "center";
    return e.align === "start" ? n = "left" : e.align === "end" ? n = "right" : e.align === "inner" && (n = "inner"), n;
  }
  _getYAxisLabelAlignment(t) {
    const { position: e, ticks: { crossAlign: s, mirror: n, padding: o } } = this.options, r = this._getLabelSizes(), a = t + o, l = r.widest.width;
    let c, h;
    return e === "left" ? n ? (h = this.right + o, s === "near" ? c = "left" : s === "center" ? (c = "center", h += l / 2) : (c = "right", h += l)) : (h = this.right - a, s === "near" ? c = "right" : s === "center" ? (c = "center", h -= l / 2) : (c = "left", h = this.left)) : e === "right" ? n ? (h = this.left + o, s === "near" ? c = "right" : s === "center" ? (c = "center", h -= l / 2) : (c = "left", h -= l)) : (h = this.left + a, s === "near" ? c = "left" : s === "center" ? (c = "center", h += l / 2) : (c = "right", h = this.right)) : c = "right", {
      textAlign: c,
      x: h
    };
  }
  _computeLabelArea() {
    if (this.options.ticks.mirror)
      return;
    const t = this.chart, e = this.options.position;
    if (e === "left" || e === "right")
      return {
        top: 0,
        left: this.left,
        bottom: t.height,
        right: this.right
      };
    if (e === "top" || e === "bottom")
      return {
        top: this.top,
        left: 0,
        bottom: this.bottom,
        right: t.width
      };
  }
  drawBackground() {
    const { ctx: t, options: { backgroundColor: e }, left: s, top: n, width: o, height: r } = this;
    e && (t.save(), t.fillStyle = e, t.fillRect(s, n, o, r), t.restore());
  }
  getLineWidthForValue(t) {
    const e = this.options.grid;
    if (!this._isVisible() || !e.display)
      return 0;
    const n = this.ticks.findIndex((o) => o.value === t);
    return n >= 0 ? e.setContext(this.getContext(n)).lineWidth : 0;
  }
  drawGrid(t) {
    const e = this.options.grid, s = this.ctx, n = this._gridLineItems || (this._gridLineItems = this._computeGridLineItems(t));
    let o, r;
    const a = (l, c, h) => {
      !h.width || !h.color || (s.save(), s.lineWidth = h.width, s.strokeStyle = h.color, s.setLineDash(h.borderDash || []), s.lineDashOffset = h.borderDashOffset, s.beginPath(), s.moveTo(l.x, l.y), s.lineTo(c.x, c.y), s.stroke(), s.restore());
    };
    if (e.display)
      for (o = 0, r = n.length; o < r; ++o) {
        const l = n[o];
        e.drawOnChartArea && a({
          x: l.x1,
          y: l.y1
        }, {
          x: l.x2,
          y: l.y2
        }, l), e.drawTicks && a({
          x: l.tx1,
          y: l.ty1
        }, {
          x: l.tx2,
          y: l.ty2
        }, {
          color: l.tickColor,
          width: l.tickWidth,
          borderDash: l.tickBorderDash,
          borderDashOffset: l.tickBorderDashOffset
        });
      }
  }
  drawBorder() {
    const { chart: t, ctx: e, options: { border: s, grid: n } } = this, o = s.setContext(this.getContext()), r = s.display ? o.width : 0;
    if (!r)
      return;
    const a = n.setContext(this.getContext(0)).lineWidth, l = this._borderValue;
    let c, h, d, u;
    this.isHorizontal() ? (c = Gt(t, this.left, r) - r / 2, h = Gt(t, this.right, a) + a / 2, d = u = l) : (d = Gt(t, this.top, r) - r / 2, u = Gt(t, this.bottom, a) + a / 2, c = h = l), e.save(), e.lineWidth = o.width, e.strokeStyle = o.color, e.beginPath(), e.moveTo(c, d), e.lineTo(h, u), e.stroke(), e.restore();
  }
  drawLabels(t) {
    if (!this.options.ticks.display)
      return;
    const s = this.ctx, n = this._computeLabelArea();
    n && Li(s, n);
    const o = this.getLabelItems(t);
    for (const r of o) {
      const a = r.options, l = r.font, c = r.label, h = r.textOffset;
      oe(s, c, 0, h, l, a);
    }
    n && Ri(s);
  }
  drawTitle() {
    const { ctx: t, options: { position: e, title: s, reverse: n } } = this;
    if (!s.display)
      return;
    const o = X(s.font), r = nt(s.padding), a = s.align;
    let l = o.lineHeight / 2;
    e === "bottom" || e === "center" || L(e) ? (l += r.bottom, W(s.text) && (l += o.lineHeight * (s.text.length - 1))) : l += r.top;
    const { titleX: c, titleY: h, maxWidth: d, rotation: u } = Cd(this, l, e, a);
    oe(t, s.text, 0, 0, o, {
      color: s.color,
      maxWidth: d,
      rotation: u,
      textAlign: Ed(a, e, n),
      textBaseline: "middle",
      translation: [
        c,
        h
      ]
    });
  }
  draw(t) {
    this._isVisible() && (this.drawBackground(), this.drawGrid(t), this.drawBorder(), this.drawTitle(), this.drawLabels(t));
  }
  _layers() {
    const t = this.options, e = t.ticks && t.ticks.z || 0, s = k(t.grid && t.grid.z, -1), n = k(t.border && t.border.z, 0);
    return !this._isVisible() || this.draw !== re.prototype.draw ? [
      {
        z: e,
        draw: (o) => {
          this.draw(o);
        }
      }
    ] : [
      {
        z: s,
        draw: (o) => {
          this.drawBackground(), this.drawGrid(o), this.drawTitle();
        }
      },
      {
        z: n,
        draw: () => {
          this.drawBorder();
        }
      },
      {
        z: e,
        draw: (o) => {
          this.drawLabels(o);
        }
      }
    ];
  }
  getMatchingVisibleMetas(t) {
    const e = this.chart.getSortedVisibleDatasetMetas(), s = this.axis + "AxisID", n = [];
    let o, r;
    for (o = 0, r = e.length; o < r; ++o) {
      const a = e[o];
      a[s] === this.id && (!t || a.type === t) && n.push(a);
    }
    return n;
  }
  _resolveTickFontOptions(t) {
    const e = this.options.ticks.setContext(this.getContext(t));
    return X(e.font);
  }
  _maxDigits() {
    const t = this._resolveTickFontOptions(0).lineHeight;
    return (this.isHorizontal() ? this.width : this.height) / t;
  }
}
class li {
  constructor(t, e, s) {
    this.type = t, this.scope = e, this.override = s, this.items = /* @__PURE__ */ Object.create(null);
  }
  isForType(t) {
    return Object.prototype.isPrototypeOf.call(this.type.prototype, t.prototype);
  }
  register(t) {
    const e = Object.getPrototypeOf(t);
    let s;
    Od(e) && (s = this.register(e));
    const n = this.items, o = t.id, r = this.scope + "." + o;
    if (!o)
      throw new Error("class does not have id: " + t);
    return o in n || (n[o] = t, Ad(t, r, s), this.override && j.override(t.id, t.overrides)), r;
  }
  get(t) {
    return this.items[t];
  }
  unregister(t) {
    const e = this.items, s = t.id, n = this.scope;
    s in e && delete e[s], n && s in j[n] && (delete j[n][s], this.override && delete ne[s]);
  }
}
function Ad(i, t, e) {
  const s = He(/* @__PURE__ */ Object.create(null), [
    e ? j.get(e) : {},
    j.get(t),
    i.defaults
  ]);
  j.set(t, s), i.defaultRoutes && kd(t, i.defaultRoutes), i.descriptors && j.describe(t, i.descriptors);
}
function kd(i, t) {
  Object.keys(t).forEach((e) => {
    const s = e.split("."), n = s.pop(), o = [
      i
    ].concat(s).join("."), r = t[e].split("."), a = r.pop(), l = r.join(".");
    j.route(o, n, l, a);
  });
}
function Od(i) {
  return "id" in i && "defaults" in i;
}
class Pd {
  constructor() {
    this.controllers = new li(gt, "datasets", !0), this.elements = new li(Lt, "elements"), this.plugins = new li(Object, "plugins"), this.scales = new li(re, "scales"), this._typedRegistries = [
      this.controllers,
      this.scales,
      this.elements
    ];
  }
  add(...t) {
    this._each("register", t);
  }
  remove(...t) {
    this._each("unregister", t);
  }
  addControllers(...t) {
    this._each("register", t, this.controllers);
  }
  addElements(...t) {
    this._each("register", t, this.elements);
  }
  addPlugins(...t) {
    this._each("register", t, this.plugins);
  }
  addScales(...t) {
    this._each("register", t, this.scales);
  }
  getController(t) {
    return this._get(t, this.controllers, "controller");
  }
  getElement(t) {
    return this._get(t, this.elements, "element");
  }
  getPlugin(t) {
    return this._get(t, this.plugins, "plugin");
  }
  getScale(t) {
    return this._get(t, this.scales, "scale");
  }
  removeControllers(...t) {
    this._each("unregister", t, this.controllers);
  }
  removeElements(...t) {
    this._each("unregister", t, this.elements);
  }
  removePlugins(...t) {
    this._each("unregister", t, this.plugins);
  }
  removeScales(...t) {
    this._each("unregister", t, this.scales);
  }
  _each(t, e, s) {
    [
      ...e
    ].forEach((n) => {
      const o = s || this._getRegistryForType(n);
      s || o.isForType(n) || o === this.plugins && n.id ? this._exec(t, o, n) : N(n, (r) => {
        const a = s || this._getRegistryForType(r);
        this._exec(t, a, r);
      });
    });
  }
  _exec(t, e, s) {
    const n = Ls(t);
    z(s["before" + n], [], s), e[t](s), z(s["after" + n], [], s);
  }
  _getRegistryForType(t) {
    for (let e = 0; e < this._typedRegistries.length; e++) {
      const s = this._typedRegistries[e];
      if (s.isForType(t))
        return s;
    }
    return this.plugins;
  }
  _get(t, e, s) {
    const n = e.get(t);
    if (n === void 0)
      throw new Error('"' + t + '" is not a registered ' + s + ".");
    return n;
  }
}
var yt = /* @__PURE__ */ new Pd();
class Dd {
  constructor() {
    this._init = void 0;
  }
  notify(t, e, s, n) {
    if (e === "beforeInit" && (this._init = this._createDescriptors(t, !0), this._notify(this._init, t, "install")), this._init === void 0)
      return;
    const o = n ? this._descriptors(t).filter(n) : this._descriptors(t), r = this._notify(o, t, e, s);
    return e === "afterDestroy" && (this._notify(o, t, "stop"), this._notify(this._init, t, "uninstall"), this._init = void 0), r;
  }
  _notify(t, e, s, n) {
    n = n || {};
    for (const o of t) {
      const r = o.plugin, a = r[s], l = [
        e,
        n,
        o.options
      ];
      if (z(a, l, r) === !1 && n.cancelable)
        return !1;
    }
    return !0;
  }
  invalidate() {
    I(this._cache) || (this._oldCache = this._cache, this._cache = void 0);
  }
  _descriptors(t) {
    if (this._cache)
      return this._cache;
    const e = this._cache = this._createDescriptors(t);
    return this._notifyStateChanges(t), e;
  }
  _createDescriptors(t, e) {
    const s = t && t.config, n = k(s.options && s.options.plugins, {}), o = Td(s);
    return n === !1 && !e ? [] : Ld(t, o, n, e);
  }
  _notifyStateChanges(t) {
    const e = this._oldCache || [], s = this._cache, n = (o, r) => o.filter((a) => !r.some((l) => a.plugin.id === l.plugin.id));
    this._notify(n(e, s), t, "stop"), this._notify(n(s, e), t, "start");
  }
}
function Td(i) {
  const t = {}, e = [], s = Object.keys(yt.plugins.items);
  for (let o = 0; o < s.length; o++)
    e.push(yt.getPlugin(s[o]));
  const n = i.plugins || [];
  for (let o = 0; o < n.length; o++) {
    const r = n[o];
    e.indexOf(r) === -1 && (e.push(r), t[r.id] = !0);
  }
  return {
    plugins: e,
    localIds: t
  };
}
function Id(i, t) {
  return !t && i === !1 ? null : i === !0 ? {} : i;
}
function Ld(i, { plugins: t, localIds: e }, s, n) {
  const o = [], r = i.getContext();
  for (const a of t) {
    const l = a.id, c = Id(s[l], n);
    c !== null && o.push({
      plugin: a,
      options: Rd(i.config, {
        plugin: a,
        local: e[l]
      }, c, r)
    });
  }
  return o;
}
function Rd(i, { plugin: t, local: e }, s, n) {
  const o = i.pluginScopeKeys(t), r = i.getOptionScopes(s, o);
  return e && t.defaults && r.push(t.defaults), i.createResolver(r, n, [
    ""
  ], {
    scriptable: !1,
    indexable: !1,
    allKeys: !0
  });
}
function ms(i, t) {
  const e = j.datasets[i] || {};
  return ((t.datasets || {})[i] || {}).indexAxis || t.indexAxis || e.indexAxis || "x";
}
function Fd(i, t) {
  let e = i;
  return i === "_index_" ? e = t : i === "_value_" && (e = t === "x" ? "y" : "x"), e;
}
function Nd(i, t) {
  return i === t ? "_index_" : "_value_";
}
function to(i) {
  if (i === "x" || i === "y" || i === "r")
    return i;
}
function Bd(i) {
  if (i === "top" || i === "bottom")
    return "x";
  if (i === "left" || i === "right")
    return "y";
}
function bs(i, ...t) {
  if (to(i))
    return i;
  for (const e of t) {
    const s = e.axis || Bd(e.position) || i.length > 1 && to(i[0].toLowerCase());
    if (s)
      return s;
  }
  throw new Error(`Cannot determine type of '${i}' axis. Please provide 'axis' or 'position' option.`);
}
function eo(i, t, e) {
  if (e[t + "AxisID"] === i)
    return {
      axis: t
    };
}
function zd(i, t) {
  if (t.data && t.data.datasets) {
    const e = t.data.datasets.filter((s) => s.xAxisID === i || s.yAxisID === i);
    if (e.length)
      return eo(i, "x", e[0]) || eo(i, "y", e[0]);
  }
  return {};
}
function Hd(i, t) {
  const e = ne[i.type] || {
    scales: {}
  }, s = t.scales || {}, n = ms(i.type, t), o = /* @__PURE__ */ Object.create(null);
  return Object.keys(s).forEach((r) => {
    const a = s[r];
    if (!L(a))
      return console.error(`Invalid scale configuration for scale: ${r}`);
    if (a._proxy)
      return console.warn(`Ignoring resolver passed as options for scale: ${r}`);
    const l = bs(r, a, zd(r, i), j.scales[a.type]), c = Nd(l, n), h = e.scales || {};
    o[r] = Le(/* @__PURE__ */ Object.create(null), [
      {
        axis: l
      },
      a,
      h[l],
      h[c]
    ]);
  }), i.data.datasets.forEach((r) => {
    const a = r.type || i.type, l = r.indexAxis || ms(a, t), h = (ne[a] || {}).scales || {};
    Object.keys(h).forEach((d) => {
      const u = Fd(d, l), f = r[u + "AxisID"] || u;
      o[f] = o[f] || /* @__PURE__ */ Object.create(null), Le(o[f], [
        {
          axis: u
        },
        s[f],
        h[d]
      ]);
    });
  }), Object.keys(o).forEach((r) => {
    const a = o[r];
    Le(a, [
      j.scales[a.type],
      j.scale
    ]);
  }), o;
}
function Rr(i) {
  const t = i.options || (i.options = {});
  t.plugins = k(t.plugins, {}), t.scales = Hd(i, t);
}
function Fr(i) {
  return i = i || {}, i.datasets = i.datasets || [], i.labels = i.labels || [], i;
}
function Vd(i) {
  return i = i || {}, i.data = Fr(i.data), Rr(i), i;
}
const io = /* @__PURE__ */ new Map(), Nr = /* @__PURE__ */ new Set();
function ci(i, t) {
  let e = io.get(i);
  return e || (e = t(), io.set(i, e), Nr.add(e)), e;
}
const Ee = (i, t, e) => {
  const s = Wt(t, e);
  s !== void 0 && i.add(s);
};
class Wd {
  constructor(t) {
    this._config = Vd(t), this._scopeCache = /* @__PURE__ */ new Map(), this._resolverCache = /* @__PURE__ */ new Map();
  }
  get platform() {
    return this._config.platform;
  }
  get type() {
    return this._config.type;
  }
  set type(t) {
    this._config.type = t;
  }
  get data() {
    return this._config.data;
  }
  set data(t) {
    this._config.data = Fr(t);
  }
  get options() {
    return this._config.options;
  }
  set options(t) {
    this._config.options = t;
  }
  get plugins() {
    return this._config.plugins;
  }
  update() {
    const t = this._config;
    this.clearCache(), Rr(t);
  }
  clearCache() {
    this._scopeCache.clear(), this._resolverCache.clear();
  }
  datasetScopeKeys(t) {
    return ci(t, () => [
      [
        `datasets.${t}`,
        ""
      ]
    ]);
  }
  datasetAnimationScopeKeys(t, e) {
    return ci(`${t}.transition.${e}`, () => [
      [
        `datasets.${t}.transitions.${e}`,
        `transitions.${e}`
      ],
      [
        `datasets.${t}`,
        ""
      ]
    ]);
  }
  datasetElementScopeKeys(t, e) {
    return ci(`${t}-${e}`, () => [
      [
        `datasets.${t}.elements.${e}`,
        `datasets.${t}`,
        `elements.${e}`,
        ""
      ]
    ]);
  }
  pluginScopeKeys(t) {
    const e = t.id, s = this.type;
    return ci(`${s}-plugin-${e}`, () => [
      [
        `plugins.${e}`,
        ...t.additionalOptionScopes || []
      ]
    ]);
  }
  _cachedScopes(t, e) {
    const s = this._scopeCache;
    let n = s.get(t);
    return (!n || e) && (n = /* @__PURE__ */ new Map(), s.set(t, n)), n;
  }
  getOptionScopes(t, e, s) {
    const { options: n, type: o } = this, r = this._cachedScopes(t, s), a = r.get(e);
    if (a)
      return a;
    const l = /* @__PURE__ */ new Set();
    e.forEach((h) => {
      t && (l.add(t), h.forEach((d) => Ee(l, t, d))), h.forEach((d) => Ee(l, n, d)), h.forEach((d) => Ee(l, ne[o] || {}, d)), h.forEach((d) => Ee(l, j, d)), h.forEach((d) => Ee(l, fs, d));
    });
    const c = Array.from(l);
    return c.length === 0 && c.push(/* @__PURE__ */ Object.create(null)), Nr.has(e) && r.set(e, c), c;
  }
  chartOptionScopes() {
    const { options: t, type: e } = this;
    return [
      t,
      ne[e] || {},
      j.datasets[e] || {},
      {
        type: e
      },
      j,
      fs
    ];
  }
  resolveNamedOptions(t, e, s, n = [
    ""
  ]) {
    const o = {
      $shared: !0
    }, { resolver: r, subPrefixes: a } = so(this._resolverCache, t, n);
    let l = r;
    if ($d(r, e)) {
      o.$shared = !1, s = jt(s) ? s() : s;
      const c = this.createResolver(t, s, a);
      l = ge(r, s, c);
    }
    for (const c of e)
      o[c] = l[c];
    return o;
  }
  createResolver(t, e, s = [
    ""
  ], n) {
    const { resolver: o } = so(this._resolverCache, t, s);
    return L(e) ? ge(o, e, void 0, n) : o;
  }
}
function so(i, t, e) {
  let s = i.get(t);
  s || (s = /* @__PURE__ */ new Map(), i.set(t, s));
  const n = e.join();
  let o = s.get(n);
  return o || (o = {
    resolver: Hs(t, e),
    subPrefixes: e.filter((a) => !a.toLowerCase().includes("hover"))
  }, s.set(n, o)), o;
}
const jd = (i) => L(i) && Object.getOwnPropertyNames(i).some((t) => jt(i[t]));
function $d(i, t) {
  const { isScriptable: e, isIndexable: s } = gr(i);
  for (const n of t) {
    const o = e(n), r = s(n), a = (r || o) && i[n];
    if (o && (jt(a) || jd(a)) || r && W(a))
      return !0;
  }
  return !1;
}
var Yd = "4.5.1";
const Kd = [
  "top",
  "bottom",
  "left",
  "right",
  "chartArea"
];
function no(i, t) {
  return i === "top" || i === "bottom" || Kd.indexOf(i) === -1 && t === "x";
}
function oo(i, t) {
  return function(e, s) {
    return e[i] === s[i] ? e[t] - s[t] : e[i] - s[i];
  };
}
function ro(i) {
  const t = i.chart, e = t.options.animation;
  t.notifyPlugins("afterRender"), z(e && e.onComplete, [
    i
  ], t);
}
function Ud(i) {
  const t = i.chart, e = t.options.animation;
  z(e && e.onProgress, [
    i
  ], t);
}
function Br(i) {
  return js() && typeof i == "string" ? i = document.getElementById(i) : i && i.length && (i = i[0]), i && i.canvas && (i = i.canvas), i;
}
const vi = {}, ao = (i) => {
  const t = Br(i);
  return Object.values(vi).filter((e) => e.canvas === t).pop();
};
function Xd(i, t, e) {
  const s = Object.keys(i);
  for (const n of s) {
    const o = +n;
    if (o >= t) {
      const r = i[n];
      delete i[n], (e > 0 || o > t) && (i[o + e] = r);
    }
  }
}
function Gd(i, t, e, s) {
  return !e || i.type === "mouseout" ? null : s ? t : i;
}
class kt {
  static register(...t) {
    yt.add(...t), lo();
  }
  static unregister(...t) {
    yt.remove(...t), lo();
  }
  constructor(t, e) {
    const s = this.config = new Wd(e), n = Br(t), o = ao(n);
    if (o)
      throw new Error("Canvas is already in use. Chart with ID '" + o.id + "' must be destroyed before the canvas with ID '" + o.canvas.id + "' can be reused.");
    const r = s.createResolver(s.chartOptionScopes(), this.getContext());
    this.platform = new (s.platform || fd(n))(), this.platform.updateConfig(s);
    const a = this.platform.acquireContext(n, r.aspectRatio), l = a && a.canvas, c = l && l.height, h = l && l.width;
    if (this.id = ql(), this.ctx = a, this.canvas = l, this.width = h, this.height = c, this._options = r, this._aspectRatio = this.aspectRatio, this._layers = [], this._metasets = [], this._stacks = void 0, this.boxes = [], this.currentDevicePixelRatio = void 0, this.chartArea = void 0, this._active = [], this._lastEvent = void 0, this._listeners = {}, this._responsiveListeners = void 0, this._sortedMetasets = [], this.scales = {}, this._plugins = new Dd(), this.$proxies = {}, this._hiddenIndices = {}, this.attached = !1, this._animationsDisabled = void 0, this.$context = void 0, this._doResize = fc((d) => this.update(d), r.resizeDelay || 0), this._dataChanges = [], vi[this.id] = this, !a || !l) {
      console.error("Failed to create chart: can't acquire context from the given item");
      return;
    }
    Et.listen(this, "complete", ro), Et.listen(this, "progress", Ud), this._initialize(), this.attached && this.update();
  }
  get aspectRatio() {
    const { options: { aspectRatio: t, maintainAspectRatio: e }, width: s, height: n, _aspectRatio: o } = this;
    return I(t) ? e && o ? o : n ? s / n : null : t;
  }
  get data() {
    return this.config.data;
  }
  set data(t) {
    this.config.data = t;
  }
  get options() {
    return this._options;
  }
  set options(t) {
    this.config.options = t;
  }
  get registry() {
    return yt;
  }
  _initialize() {
    return this.notifyPlugins("beforeInit"), this.options.responsive ? this.resize() : Pn(this, this.options.devicePixelRatio), this.bindEvents(), this.notifyPlugins("afterInit"), this;
  }
  clear() {
    return An(this.canvas, this.ctx), this;
  }
  stop() {
    return Et.stop(this), this;
  }
  resize(t, e) {
    Et.running(this) ? this._resizeBeforeDraw = {
      width: t,
      height: e
    } : this._resize(t, e);
  }
  _resize(t, e) {
    const s = this.options, n = this.canvas, o = s.maintainAspectRatio && this.aspectRatio, r = this.platform.getMaximumSize(n, t, e, o), a = s.devicePixelRatio || this.platform.getDevicePixelRatio(), l = this.width ? "resize" : "attach";
    this.width = r.width, this.height = r.height, this._aspectRatio = this.aspectRatio, Pn(this, a, !0) && (this.notifyPlugins("resize", {
      size: r
    }), z(s.onResize, [
      this,
      r
    ], this), this.attached && this._doResize(l) && this.render());
  }
  ensureScalesHaveIDs() {
    const e = this.options.scales || {};
    N(e, (s, n) => {
      s.id = n;
    });
  }
  buildOrUpdateScales() {
    const t = this.options, e = t.scales, s = this.scales, n = Object.keys(s).reduce((r, a) => (r[a] = !1, r), {});
    let o = [];
    e && (o = o.concat(Object.keys(e).map((r) => {
      const a = e[r], l = bs(r, a), c = l === "r", h = l === "x";
      return {
        options: a,
        dposition: c ? "chartArea" : h ? "bottom" : "left",
        dtype: c ? "radialLinear" : h ? "category" : "linear"
      };
    }))), N(o, (r) => {
      const a = r.options, l = a.id, c = bs(l, a), h = k(a.type, r.dtype);
      (a.position === void 0 || no(a.position, c) !== no(r.dposition)) && (a.position = r.dposition), n[l] = !0;
      let d = null;
      if (l in s && s[l].type === h)
        d = s[l];
      else {
        const u = yt.getScale(h);
        d = new u({
          id: l,
          type: h,
          ctx: this.ctx,
          chart: this
        }), s[d.id] = d;
      }
      d.init(a, t);
    }), N(n, (r, a) => {
      r || delete s[a];
    }), N(s, (r) => {
      it.configure(this, r, r.options), it.addBox(this, r);
    });
  }
  _updateMetasets() {
    const t = this._metasets, e = this.data.datasets.length, s = t.length;
    if (t.sort((n, o) => n.index - o.index), s > e) {
      for (let n = e; n < s; ++n)
        this._destroyDatasetMeta(n);
      t.splice(e, s - e);
    }
    this._sortedMetasets = t.slice(0).sort(oo("order", "index"));
  }
  _removeUnreferencedMetasets() {
    const { _metasets: t, data: { datasets: e } } = this;
    t.length > e.length && delete this._stacks, t.forEach((s, n) => {
      e.filter((o) => o === s._dataset).length === 0 && this._destroyDatasetMeta(n);
    });
  }
  buildOrUpdateControllers() {
    const t = [], e = this.data.datasets;
    let s, n;
    for (this._removeUnreferencedMetasets(), s = 0, n = e.length; s < n; s++) {
      const o = e[s];
      let r = this.getDatasetMeta(s);
      const a = o.type || this.config.type;
      if (r.type && r.type !== a && (this._destroyDatasetMeta(s), r = this.getDatasetMeta(s)), r.type = a, r.indexAxis = o.indexAxis || ms(a, this.options), r.order = o.order || 0, r.index = s, r.label = "" + o.label, r.visible = this.isDatasetVisible(s), r.controller)
        r.controller.updateIndex(s), r.controller.linkScales();
      else {
        const l = yt.getController(a), { datasetElementType: c, dataElementType: h } = j.datasets[a];
        Object.assign(l, {
          dataElementType: yt.getElement(h),
          datasetElementType: c && yt.getElement(c)
        }), r.controller = new l(this, s), t.push(r.controller);
      }
    }
    return this._updateMetasets(), t;
  }
  _resetElements() {
    N(this.data.datasets, (t, e) => {
      this.getDatasetMeta(e).controller.reset();
    }, this);
  }
  reset() {
    this._resetElements(), this.notifyPlugins("reset");
  }
  update(t) {
    const e = this.config;
    e.update();
    const s = this._options = e.createResolver(e.chartOptionScopes(), this.getContext()), n = this._animationsDisabled = !s.animation;
    if (this._updateScales(), this._checkEventBindings(), this._updateHiddenIndices(), this._plugins.invalidate(), this.notifyPlugins("beforeUpdate", {
      mode: t,
      cancelable: !0
    }) === !1)
      return;
    const o = this.buildOrUpdateControllers();
    this.notifyPlugins("beforeElementsUpdate");
    let r = 0;
    for (let c = 0, h = this.data.datasets.length; c < h; c++) {
      const { controller: d } = this.getDatasetMeta(c), u = !n && o.indexOf(d) === -1;
      d.buildOrUpdateElements(u), r = Math.max(+d.getMaxOverflow(), r);
    }
    r = this._minPadding = s.layout.autoPadding ? r : 0, this._updateLayout(r), n || N(o, (c) => {
      c.reset();
    }), this._updateDatasets(t), this.notifyPlugins("afterUpdate", {
      mode: t
    }), this._layers.sort(oo("z", "_idx"));
    const { _active: a, _lastEvent: l } = this;
    l ? this._eventHandler(l, !0) : a.length && this._updateHoverStyles(a, a, !0), this.render();
  }
  _updateScales() {
    N(this.scales, (t) => {
      it.removeBox(this, t);
    }), this.ensureScalesHaveIDs(), this.buildOrUpdateScales();
  }
  _checkEventBindings() {
    const t = this.options, e = new Set(Object.keys(this._listeners)), s = new Set(t.events);
    (!_n(e, s) || !!this._responsiveListeners !== t.responsive) && (this.unbindEvents(), this.bindEvents());
  }
  _updateHiddenIndices() {
    const { _hiddenIndices: t } = this, e = this._getUniformDataChanges() || [];
    for (const { method: s, start: n, count: o } of e) {
      const r = s === "_removeElements" ? -o : o;
      Xd(t, n, r);
    }
  }
  _getUniformDataChanges() {
    const t = this._dataChanges;
    if (!t || !t.length)
      return;
    this._dataChanges = [];
    const e = this.data.datasets.length, s = (o) => new Set(t.filter((r) => r[0] === o).map((r, a) => a + "," + r.splice(1).join(","))), n = s(0);
    for (let o = 1; o < e; o++)
      if (!_n(n, s(o)))
        return;
    return Array.from(n).map((o) => o.split(",")).map((o) => ({
      method: o[1],
      start: +o[2],
      count: +o[3]
    }));
  }
  _updateLayout(t) {
    if (this.notifyPlugins("beforeLayout", {
      cancelable: !0
    }) === !1)
      return;
    it.update(this, this.width, this.height, t);
    const e = this.chartArea, s = e.width <= 0 || e.height <= 0;
    this._layers = [], N(this.boxes, (n) => {
      s && n.position === "chartArea" || (n.configure && n.configure(), this._layers.push(...n._layers()));
    }, this), this._layers.forEach((n, o) => {
      n._idx = o;
    }), this.notifyPlugins("afterLayout");
  }
  _updateDatasets(t) {
    if (this.notifyPlugins("beforeDatasetsUpdate", {
      mode: t,
      cancelable: !0
    }) !== !1) {
      for (let e = 0, s = this.data.datasets.length; e < s; ++e)
        this.getDatasetMeta(e).controller.configure();
      for (let e = 0, s = this.data.datasets.length; e < s; ++e)
        this._updateDataset(e, jt(t) ? t({
          datasetIndex: e
        }) : t);
      this.notifyPlugins("afterDatasetsUpdate", {
        mode: t
      });
    }
  }
  _updateDataset(t, e) {
    const s = this.getDatasetMeta(t), n = {
      meta: s,
      index: t,
      mode: e,
      cancelable: !0
    };
    this.notifyPlugins("beforeDatasetUpdate", n) !== !1 && (s.controller._update(e), n.cancelable = !1, this.notifyPlugins("afterDatasetUpdate", n));
  }
  render() {
    this.notifyPlugins("beforeRender", {
      cancelable: !0
    }) !== !1 && (Et.has(this) ? this.attached && !Et.running(this) && Et.start(this) : (this.draw(), ro({
      chart: this
    })));
  }
  draw() {
    let t;
    if (this._resizeBeforeDraw) {
      const { width: s, height: n } = this._resizeBeforeDraw;
      this._resizeBeforeDraw = null, this._resize(s, n);
    }
    if (this.clear(), this.width <= 0 || this.height <= 0 || this.notifyPlugins("beforeDraw", {
      cancelable: !0
    }) === !1)
      return;
    const e = this._layers;
    for (t = 0; t < e.length && e[t].z <= 0; ++t)
      e[t].draw(this.chartArea);
    for (this._drawDatasets(); t < e.length; ++t)
      e[t].draw(this.chartArea);
    this.notifyPlugins("afterDraw");
  }
  _getSortedDatasetMetas(t) {
    const e = this._sortedMetasets, s = [];
    let n, o;
    for (n = 0, o = e.length; n < o; ++n) {
      const r = e[n];
      (!t || r.visible) && s.push(r);
    }
    return s;
  }
  getSortedVisibleDatasetMetas() {
    return this._getSortedDatasetMetas(!0);
  }
  _drawDatasets() {
    if (this.notifyPlugins("beforeDatasetsDraw", {
      cancelable: !0
    }) === !1)
      return;
    const t = this.getSortedVisibleDatasetMetas();
    for (let e = t.length - 1; e >= 0; --e)
      this._drawDataset(t[e]);
    this.notifyPlugins("afterDatasetsDraw");
  }
  _drawDataset(t) {
    const e = this.ctx, s = {
      meta: t,
      index: t.index,
      cancelable: !0
    }, n = Cr(this, t);
    this.notifyPlugins("beforeDatasetDraw", s) !== !1 && (n && Li(e, n), t.controller.draw(), n && Ri(e), s.cancelable = !1, this.notifyPlugins("afterDatasetDraw", s));
  }
  isPointInArea(t) {
    return Dt(t, this.chartArea, this._minPadding);
  }
  getElementsAtEventForMode(t, e, s, n) {
    const o = Kh.modes[e];
    return typeof o == "function" ? o(this, t, s, n) : [];
  }
  getDatasetMeta(t) {
    const e = this.data.datasets[t], s = this._metasets;
    let n = s.filter((o) => o && o._dataset === e).pop();
    return n || (n = {
      type: null,
      data: [],
      dataset: null,
      controller: null,
      hidden: null,
      xAxisID: null,
      yAxisID: null,
      order: e && e.order || 0,
      index: t,
      _dataset: e,
      _parsed: [],
      _sorted: !1
    }, s.push(n)), n;
  }
  getContext() {
    return this.$context || (this.$context = Yt(null, {
      chart: this,
      type: "chart"
    }));
  }
  getVisibleDatasetCount() {
    return this.getSortedVisibleDatasetMetas().length;
  }
  isDatasetVisible(t) {
    const e = this.data.datasets[t];
    if (!e)
      return !1;
    const s = this.getDatasetMeta(t);
    return typeof s.hidden == "boolean" ? !s.hidden : !e.hidden;
  }
  setDatasetVisibility(t, e) {
    const s = this.getDatasetMeta(t);
    s.hidden = !e;
  }
  toggleDataVisibility(t) {
    this._hiddenIndices[t] = !this._hiddenIndices[t];
  }
  getDataVisibility(t) {
    return !this._hiddenIndices[t];
  }
  _updateVisibility(t, e, s) {
    const n = s ? "show" : "hide", o = this.getDatasetMeta(t), r = o.controller._resolveAnimations(void 0, n);
    Ve(e) ? (o.data[e].hidden = !s, this.update()) : (this.setDatasetVisibility(t, s), r.update(o, {
      visible: s
    }), this.update((a) => a.datasetIndex === t ? n : void 0));
  }
  hide(t, e) {
    this._updateVisibility(t, e, !1);
  }
  show(t, e) {
    this._updateVisibility(t, e, !0);
  }
  _destroyDatasetMeta(t) {
    const e = this._metasets[t];
    e && e.controller && e.controller._destroy(), delete this._metasets[t];
  }
  _stop() {
    let t, e;
    for (this.stop(), Et.remove(this), t = 0, e = this.data.datasets.length; t < e; ++t)
      this._destroyDatasetMeta(t);
  }
  destroy() {
    this.notifyPlugins("beforeDestroy");
    const { canvas: t, ctx: e } = this;
    this._stop(), this.config.clearCache(), t && (this.unbindEvents(), An(t, e), this.platform.releaseContext(e), this.canvas = null, this.ctx = null), delete vi[this.id], this.notifyPlugins("afterDestroy");
  }
  toBase64Image(...t) {
    return this.canvas.toDataURL(...t);
  }
  bindEvents() {
    this.bindUserEvents(), this.options.responsive ? this.bindResponsiveEvents() : this.attached = !0;
  }
  bindUserEvents() {
    const t = this._listeners, e = this.platform, s = (o, r) => {
      e.addEventListener(this, o, r), t[o] = r;
    }, n = (o, r, a) => {
      o.offsetX = r, o.offsetY = a, this._eventHandler(o);
    };
    N(this.options.events, (o) => s(o, n));
  }
  bindResponsiveEvents() {
    this._responsiveListeners || (this._responsiveListeners = {});
    const t = this._responsiveListeners, e = this.platform, s = (l, c) => {
      e.addEventListener(this, l, c), t[l] = c;
    }, n = (l, c) => {
      t[l] && (e.removeEventListener(this, l, c), delete t[l]);
    }, o = (l, c) => {
      this.canvas && this.resize(l, c);
    };
    let r;
    const a = () => {
      n("attach", a), this.attached = !0, this.resize(), s("resize", o), s("detach", r);
    };
    r = () => {
      this.attached = !1, n("resize", o), this._stop(), this._resize(0, 0), s("attach", a);
    }, e.isAttached(this.canvas) ? a() : r();
  }
  unbindEvents() {
    N(this._listeners, (t, e) => {
      this.platform.removeEventListener(this, e, t);
    }), this._listeners = {}, N(this._responsiveListeners, (t, e) => {
      this.platform.removeEventListener(this, e, t);
    }), this._responsiveListeners = void 0;
  }
  updateHoverStyle(t, e, s) {
    const n = s ? "set" : "remove";
    let o, r, a, l;
    for (e === "dataset" && (o = this.getDatasetMeta(t[0].datasetIndex), o.controller["_" + n + "DatasetHoverStyle"]()), a = 0, l = t.length; a < l; ++a) {
      r = t[a];
      const c = r && this.getDatasetMeta(r.datasetIndex).controller;
      c && c[n + "HoverStyle"](r.element, r.datasetIndex, r.index);
    }
  }
  getActiveElements() {
    return this._active || [];
  }
  setActiveElements(t) {
    const e = this._active || [], s = t.map(({ datasetIndex: o, index: r }) => {
      const a = this.getDatasetMeta(o);
      if (!a)
        throw new Error("No dataset found at index " + o);
      return {
        datasetIndex: o,
        element: a.data[r],
        index: r
      };
    });
    !Mi(s, e) && (this._active = s, this._lastEvent = null, this._updateHoverStyles(s, e));
  }
  notifyPlugins(t, e, s) {
    return this._plugins.notify(this, t, e, s);
  }
  isPluginEnabled(t) {
    return this._plugins._cache.filter((e) => e.plugin.id === t).length === 1;
  }
  _updateHoverStyles(t, e, s) {
    const n = this.options.hover, o = (l, c) => l.filter((h) => !c.some((d) => h.datasetIndex === d.datasetIndex && h.index === d.index)), r = o(e, t), a = s ? t : o(t, e);
    r.length && this.updateHoverStyle(r, n.mode, !1), a.length && n.mode && this.updateHoverStyle(a, n.mode, !0);
  }
  _eventHandler(t, e) {
    const s = {
      event: t,
      replay: e,
      cancelable: !0,
      inChartArea: this.isPointInArea(t)
    }, n = (r) => (r.options.events || this.options.events).includes(t.native.type);
    if (this.notifyPlugins("beforeEvent", s, n) === !1)
      return;
    const o = this._handleEvent(t, e, s.inChartArea);
    return s.cancelable = !1, this.notifyPlugins("afterEvent", s, n), (o || s.changed) && this.render(), this;
  }
  _handleEvent(t, e, s) {
    const { _active: n = [], options: o } = this, r = e, a = this._getActiveElements(t, n, s, r), l = ic(t), c = Gd(t, this._lastEvent, s, l);
    s && (this._lastEvent = null, z(o.onHover, [
      t,
      a,
      this
    ], this), l && z(o.onClick, [
      t,
      a,
      this
    ], this));
    const h = !Mi(a, n);
    return (h || e) && (this._active = a, this._updateHoverStyles(a, n, e)), this._lastEvent = c, h;
  }
  _getActiveElements(t, e, s, n) {
    if (t.type === "mouseout")
      return [];
    if (!s)
      return e;
    const o = this.options.hover;
    return this.getElementsAtEventForMode(t, o.mode, o, n);
  }
}
E(kt, "defaults", j), E(kt, "instances", vi), E(kt, "overrides", ne), E(kt, "registry", yt), E(kt, "version", Yd), E(kt, "getChart", ao);
function lo() {
  return N(kt.instances, (i) => i._plugins.invalidate());
}
function qd(i, t, e) {
  const { startAngle: s, x: n, y: o, outerRadius: r, innerRadius: a, options: l } = t, { borderWidth: c, borderJoinStyle: h } = l, d = Math.min(c / r, et(s - e));
  if (i.beginPath(), i.arc(n, o, r - c / 2, s + d / 2, e - d / 2), a > 0) {
    const u = Math.min(c / a, et(s - e));
    i.arc(n, o, a + c / 2, e - u / 2, s + u / 2, !0);
  } else {
    const u = Math.min(c / 2, r * et(s - e));
    if (h === "round")
      i.arc(n, o, u, e - F / 2, s + F / 2, !0);
    else if (h === "bevel") {
      const f = 2 * u * u, p = -f * Math.cos(e + F / 2) + n, g = -f * Math.sin(e + F / 2) + o, m = f * Math.cos(s + F / 2) + n, b = f * Math.sin(s + F / 2) + o;
      i.lineTo(p, g), i.lineTo(m, b);
    }
  }
  i.closePath(), i.moveTo(0, 0), i.rect(0, 0, i.canvas.width, i.canvas.height), i.clip("evenodd");
}
function Jd(i, t, e) {
  const { startAngle: s, pixelMargin: n, x: o, y: r, outerRadius: a, innerRadius: l } = t;
  let c = n / a;
  i.beginPath(), i.arc(o, r, a, s - c, e + c), l > n ? (c = n / l, i.arc(o, r, l, e + c, s - c, !0)) : i.arc(o, r, n, e + U, s - U), i.closePath(), i.clip();
}
function Qd(i) {
  return zs(i, [
    "outerStart",
    "outerEnd",
    "innerStart",
    "innerEnd"
  ]);
}
function Zd(i, t, e, s) {
  const n = Qd(i.options.borderRadius), o = (e - t) / 2, r = Math.min(o, s * t / 2), a = (l) => {
    const c = (e - Math.min(o, l)) * s / 2;
    return q(l, 0, Math.min(o, c));
  };
  return {
    outerStart: a(n.outerStart),
    outerEnd: a(n.outerEnd),
    innerStart: q(n.innerStart, 0, r),
    innerEnd: q(n.innerEnd, 0, r)
  };
}
function de(i, t, e, s) {
  return {
    x: e + i * Math.cos(t),
    y: s + i * Math.sin(t)
  };
}
function Pi(i, t, e, s, n, o) {
  const { x: r, y: a, startAngle: l, pixelMargin: c, innerRadius: h } = t, d = Math.max(t.outerRadius + s + e - c, 0), u = h > 0 ? h + s + e + c : 0;
  let f = 0;
  const p = n - l;
  if (s) {
    const R = h > 0 ? h - s : 0, B = d > 0 ? d - s : 0, Y = (R + B) / 2, ut = Y !== 0 ? p * Y / (Y + s) : p;
    f = (p - ut) / 2;
  }
  const g = Math.max(1e-3, p * d - e / F) / d, m = (p - g) / 2, b = l + m + f, _ = n - m - f, { outerStart: v, outerEnd: x, innerStart: y, innerEnd: M } = Zd(t, u, d, _ - b), S = d - v, w = d - x, C = b + v / S, D = _ - x / w, O = u + y, T = u + M, G = b + y / O, H = _ - M / T;
  if (i.beginPath(), o) {
    const R = (C + D) / 2;
    if (i.arc(r, a, d, C, R), i.arc(r, a, d, R, D), x > 0) {
      const Q = de(w, D, r, a);
      i.arc(Q.x, Q.y, x, D, _ + U);
    }
    const B = de(T, _, r, a);
    if (i.lineTo(B.x, B.y), M > 0) {
      const Q = de(T, H, r, a);
      i.arc(Q.x, Q.y, M, _ + U, H + Math.PI);
    }
    const Y = (_ - M / u + (b + y / u)) / 2;
    if (i.arc(r, a, u, _ - M / u, Y, !0), i.arc(r, a, u, Y, b + y / u, !0), y > 0) {
      const Q = de(O, G, r, a);
      i.arc(Q.x, Q.y, y, G + Math.PI, b - U);
    }
    const ut = de(S, b, r, a);
    if (i.lineTo(ut.x, ut.y), v > 0) {
      const Q = de(S, C, r, a);
      i.arc(Q.x, Q.y, v, b - U, C);
    }
  } else {
    i.moveTo(r, a);
    const R = Math.cos(C) * d + r, B = Math.sin(C) * d + a;
    i.lineTo(R, B);
    const Y = Math.cos(D) * d + r, ut = Math.sin(D) * d + a;
    i.lineTo(Y, ut);
  }
  i.closePath();
}
function tu(i, t, e, s, n) {
  const { fullCircles: o, startAngle: r, circumference: a } = t;
  let l = t.endAngle;
  if (o) {
    Pi(i, t, e, s, l, n);
    for (let c = 0; c < o; ++c)
      i.fill();
    isNaN(a) || (l = r + (a % V || V));
  }
  return Pi(i, t, e, s, l, n), i.fill(), l;
}
function eu(i, t, e, s, n) {
  const { fullCircles: o, startAngle: r, circumference: a, options: l } = t, { borderWidth: c, borderJoinStyle: h, borderDash: d, borderDashOffset: u, borderRadius: f } = l, p = l.borderAlign === "inner";
  if (!c)
    return;
  i.setLineDash(d || []), i.lineDashOffset = u, p ? (i.lineWidth = c * 2, i.lineJoin = h || "round") : (i.lineWidth = c, i.lineJoin = h || "bevel");
  let g = t.endAngle;
  if (o) {
    Pi(i, t, e, s, g, n);
    for (let m = 0; m < o; ++m)
      i.stroke();
    isNaN(a) || (g = r + (a % V || V));
  }
  p && Jd(i, t, g), l.selfJoin && g - r >= F && f === 0 && h !== "miter" && qd(i, t, g), o || (Pi(i, t, e, s, g, n), i.stroke());
}
class Pe extends Lt {
  constructor(e) {
    super();
    E(this, "circumference");
    E(this, "endAngle");
    E(this, "fullCircles");
    E(this, "innerRadius");
    E(this, "outerRadius");
    E(this, "pixelMargin");
    E(this, "startAngle");
    this.options = void 0, this.circumference = void 0, this.startAngle = void 0, this.endAngle = void 0, this.innerRadius = void 0, this.outerRadius = void 0, this.pixelMargin = 0, this.fullCircles = 0, e && Object.assign(this, e);
  }
  inRange(e, s, n) {
    const o = this.getProps([
      "x",
      "y"
    ], n), { angle: r, distance: a } = or(o, {
      x: e,
      y: s
    }), { startAngle: l, endAngle: c, innerRadius: h, outerRadius: d, circumference: u } = this.getProps([
      "startAngle",
      "endAngle",
      "innerRadius",
      "outerRadius",
      "circumference"
    ], n), f = (this.options.spacing + this.options.borderWidth) / 2, p = k(u, c - l), g = We(r, l, c) && l !== c, m = p >= V || g, b = Ot(a, h + f, d + f);
    return m && b;
  }
  getCenterPoint(e) {
    const { x: s, y: n, startAngle: o, endAngle: r, innerRadius: a, outerRadius: l } = this.getProps([
      "x",
      "y",
      "startAngle",
      "endAngle",
      "innerRadius",
      "outerRadius"
    ], e), { offset: c, spacing: h } = this.options, d = (o + r) / 2, u = (a + l + h + c) / 2;
    return {
      x: s + Math.cos(d) * u,
      y: n + Math.sin(d) * u
    };
  }
  tooltipPosition(e) {
    return this.getCenterPoint(e);
  }
  draw(e) {
    const { options: s, circumference: n } = this, o = (s.offset || 0) / 4, r = (s.spacing || 0) / 2, a = s.circular;
    if (this.pixelMargin = s.borderAlign === "inner" ? 0.33 : 0, this.fullCircles = n > V ? Math.floor(n / V) : 0, n === 0 || this.innerRadius < 0 || this.outerRadius < 0)
      return;
    e.save();
    const l = (this.startAngle + this.endAngle) / 2;
    e.translate(Math.cos(l) * o, Math.sin(l) * o);
    const c = 1 - Math.sin(Math.min(F, n || 0)), h = o * c;
    e.fillStyle = s.backgroundColor, e.strokeStyle = s.borderColor, tu(e, this, h, r, a), eu(e, this, h, r, a), e.restore();
  }
}
E(Pe, "id", "arc"), E(Pe, "defaults", {
  borderAlign: "center",
  borderColor: "#fff",
  borderDash: [],
  borderDashOffset: 0,
  borderJoinStyle: void 0,
  borderRadius: 0,
  borderWidth: 2,
  offset: 0,
  spacing: 0,
  angle: void 0,
  circular: !0,
  selfJoin: !1
}), E(Pe, "defaultRoutes", {
  backgroundColor: "backgroundColor"
}), E(Pe, "descriptors", {
  _scriptable: !0,
  _indexable: (e) => e !== "borderDash"
});
function zr(i, t, e = t) {
  i.lineCap = k(e.borderCapStyle, t.borderCapStyle), i.setLineDash(k(e.borderDash, t.borderDash)), i.lineDashOffset = k(e.borderDashOffset, t.borderDashOffset), i.lineJoin = k(e.borderJoinStyle, t.borderJoinStyle), i.lineWidth = k(e.borderWidth, t.borderWidth), i.strokeStyle = k(e.borderColor, t.borderColor);
}
function iu(i, t, e) {
  i.lineTo(e.x, e.y);
}
function su(i) {
  return i.stepped ? Ec : i.tension || i.cubicInterpolationMode === "monotone" ? Cc : iu;
}
function Hr(i, t, e = {}) {
  const s = i.length, { start: n = 0, end: o = s - 1 } = e, { start: r, end: a } = t, l = Math.max(n, r), c = Math.min(o, a), h = n < r && o < r || n > a && o > a;
  return {
    count: s,
    start: l,
    loop: t.loop,
    ilen: c < l && !h ? s + c - l : c - l
  };
}
function nu(i, t, e, s) {
  const { points: n, options: o } = t, { count: r, start: a, loop: l, ilen: c } = Hr(n, e, s), h = su(o);
  let { move: d = !0, reverse: u } = s || {}, f, p, g;
  for (f = 0; f <= c; ++f)
    p = n[(a + (u ? c - f : f)) % r], !p.skip && (d ? (i.moveTo(p.x, p.y), d = !1) : h(i, g, p, u, o.stepped), g = p);
  return l && (p = n[(a + (u ? c : 0)) % r], h(i, g, p, u, o.stepped)), !!l;
}
function ou(i, t, e, s) {
  const n = t.points, { count: o, start: r, ilen: a } = Hr(n, e, s), { move: l = !0, reverse: c } = s || {};
  let h = 0, d = 0, u, f, p, g, m, b;
  const _ = (x) => (r + (c ? a - x : x)) % o, v = () => {
    g !== m && (i.lineTo(h, m), i.lineTo(h, g), i.lineTo(h, b));
  };
  for (l && (f = n[_(0)], i.moveTo(f.x, f.y)), u = 0; u <= a; ++u) {
    if (f = n[_(u)], f.skip)
      continue;
    const x = f.x, y = f.y, M = x | 0;
    M === p ? (y < g ? g = y : y > m && (m = y), h = (d * h + x) / ++d) : (v(), i.lineTo(x, y), p = M, d = 0, g = m = y), b = y;
  }
  v();
}
function _s(i) {
  const t = i.options, e = t.borderDash && t.borderDash.length;
  return !i._decimated && !i._loop && !t.tension && t.cubicInterpolationMode !== "monotone" && !t.stepped && !e ? ou : nu;
}
function ru(i) {
  return i.stepped ? nh : i.tension || i.cubicInterpolationMode === "monotone" ? oh : Zt;
}
function au(i, t, e, s) {
  let n = t._path;
  n || (n = t._path = new Path2D(), t.path(n, e, s) && n.closePath()), zr(i, t.options), i.stroke(n);
}
function lu(i, t, e, s) {
  const { segments: n, options: o } = t, r = _s(t);
  for (const a of n)
    zr(i, o, a.style), i.beginPath(), r(i, t, a, {
      start: e,
      end: e + s - 1
    }) && i.closePath(), i.stroke();
}
const cu = typeof Path2D == "function";
function hu(i, t, e, s) {
  cu && !t.options.segment ? au(i, t, e, s) : lu(i, t, e, s);
}
class zt extends Lt {
  constructor(t) {
    super(), this.animated = !0, this.options = void 0, this._chart = void 0, this._loop = void 0, this._fullLoop = void 0, this._path = void 0, this._points = void 0, this._segments = void 0, this._decimated = !1, this._pointsUpdated = !1, this._datasetIndex = void 0, t && Object.assign(this, t);
  }
  updateControlPoints(t, e) {
    const s = this.options;
    if ((s.tension || s.cubicInterpolationMode === "monotone") && !s.stepped && !this._pointsUpdated) {
      const n = s.spanGaps ? this._loop : this._fullLoop;
      qc(this._points, s, t, n, e), this._pointsUpdated = !0;
    }
  }
  set points(t) {
    this._points = t, delete this._segments, delete this._path, this._pointsUpdated = !1;
  }
  get points() {
    return this._points;
  }
  get segments() {
    return this._segments || (this._segments = dh(this, this.options.segment));
  }
  first() {
    const t = this.segments, e = this.points;
    return t.length && e[t[0].start];
  }
  last() {
    const t = this.segments, e = this.points, s = t.length;
    return s && e[t[s - 1].end];
  }
  interpolate(t, e) {
    const s = this.options, n = t[e], o = this.points, r = Er(this, {
      property: e,
      start: n,
      end: n
    });
    if (!r.length)
      return;
    const a = [], l = ru(s);
    let c, h;
    for (c = 0, h = r.length; c < h; ++c) {
      const { start: d, end: u } = r[c], f = o[d], p = o[u];
      if (f === p) {
        a.push(f);
        continue;
      }
      const g = Math.abs((n - f[e]) / (p[e] - f[e])), m = l(f, p, g, s.stepped);
      m[e] = t[e], a.push(m);
    }
    return a.length === 1 ? a[0] : a;
  }
  pathSegment(t, e, s) {
    return _s(this)(t, this, e, s);
  }
  path(t, e, s) {
    const n = this.segments, o = _s(this);
    let r = this._loop;
    e = e || 0, s = s || this.points.length - e;
    for (const a of n)
      r &= o(t, this, a, {
        start: e,
        end: e + s - 1
      });
    return !!r;
  }
  draw(t, e, s, n) {
    const o = this.options || {};
    (this.points || []).length && o.borderWidth && (t.save(), hu(t, this, s, n), t.restore()), this.animated && (this._pointsUpdated = !1, this._path = void 0);
  }
}
E(zt, "id", "line"), E(zt, "defaults", {
  borderCapStyle: "butt",
  borderDash: [],
  borderDashOffset: 0,
  borderJoinStyle: "miter",
  borderWidth: 3,
  capBezierPoints: !0,
  cubicInterpolationMode: "default",
  fill: !1,
  spanGaps: !1,
  stepped: !1,
  tension: 0
}), E(zt, "defaultRoutes", {
  backgroundColor: "backgroundColor",
  borderColor: "borderColor"
}), E(zt, "descriptors", {
  _scriptable: !0,
  _indexable: (t) => t !== "borderDash" && t !== "fill"
});
function co(i, t, e, s) {
  const n = i.options, { [e]: o } = i.getProps([
    e
  ], s);
  return Math.abs(t - o) < n.radius + n.hitRadius;
}
class xi extends Lt {
  constructor(e) {
    super();
    E(this, "parsed");
    E(this, "skip");
    E(this, "stop");
    this.options = void 0, this.parsed = void 0, this.skip = void 0, this.stop = void 0, e && Object.assign(this, e);
  }
  inRange(e, s, n) {
    const o = this.options, { x: r, y: a } = this.getProps([
      "x",
      "y"
    ], n);
    return Math.pow(e - r, 2) + Math.pow(s - a, 2) < Math.pow(o.hitRadius + o.radius, 2);
  }
  inXRange(e, s) {
    return co(this, e, "x", s);
  }
  inYRange(e, s) {
    return co(this, e, "y", s);
  }
  getCenterPoint(e) {
    const { x: s, y: n } = this.getProps([
      "x",
      "y"
    ], e);
    return {
      x: s,
      y: n
    };
  }
  size(e) {
    e = e || this.options || {};
    let s = e.radius || 0;
    s = Math.max(s, s && e.hoverRadius || 0);
    const n = s && e.borderWidth || 0;
    return (s + n) * 2;
  }
  draw(e, s) {
    const n = this.options;
    this.skip || n.radius < 0.1 || !Dt(this, s, this.size(n) / 2) || (e.strokeStyle = n.borderColor, e.lineWidth = n.borderWidth, e.fillStyle = n.backgroundColor, ps(e, n, this.x, this.y));
  }
  getRange() {
    const e = this.options || {};
    return e.radius + e.hitRadius;
  }
}
E(xi, "id", "point"), /**
* @type {any}
*/
E(xi, "defaults", {
  borderWidth: 1,
  hitRadius: 1,
  hoverBorderWidth: 1,
  hoverRadius: 4,
  pointStyle: "circle",
  radius: 3,
  rotation: 0
}), /**
* @type {any}
*/
E(xi, "defaultRoutes", {
  backgroundColor: "backgroundColor",
  borderColor: "borderColor"
});
function Vr(i, t) {
  const { x: e, y: s, base: n, width: o, height: r } = i.getProps([
    "x",
    "y",
    "base",
    "width",
    "height"
  ], t);
  let a, l, c, h, d;
  return i.horizontal ? (d = r / 2, a = Math.min(e, n), l = Math.max(e, n), c = s - d, h = s + d) : (d = o / 2, a = e - d, l = e + d, c = Math.min(s, n), h = Math.max(s, n)), {
    left: a,
    top: c,
    right: l,
    bottom: h
  };
}
function Ht(i, t, e, s) {
  return i ? 0 : q(t, e, s);
}
function du(i, t, e) {
  const s = i.options.borderWidth, n = i.borderSkipped, o = pr(s);
  return {
    t: Ht(n.top, o.top, 0, e),
    r: Ht(n.right, o.right, 0, t),
    b: Ht(n.bottom, o.bottom, 0, e),
    l: Ht(n.left, o.left, 0, t)
  };
}
function uu(i, t, e) {
  const { enableBorderRadius: s } = i.getProps([
    "enableBorderRadius"
  ]), n = i.options.borderRadius, o = ie(n), r = Math.min(t, e), a = i.borderSkipped, l = s || L(n);
  return {
    topLeft: Ht(!l || a.top || a.left, o.topLeft, 0, r),
    topRight: Ht(!l || a.top || a.right, o.topRight, 0, r),
    bottomLeft: Ht(!l || a.bottom || a.left, o.bottomLeft, 0, r),
    bottomRight: Ht(!l || a.bottom || a.right, o.bottomRight, 0, r)
  };
}
function fu(i) {
  const t = Vr(i), e = t.right - t.left, s = t.bottom - t.top, n = du(i, e / 2, s / 2), o = uu(i, e / 2, s / 2);
  return {
    outer: {
      x: t.left,
      y: t.top,
      w: e,
      h: s,
      radius: o
    },
    inner: {
      x: t.left + n.l,
      y: t.top + n.t,
      w: e - n.l - n.r,
      h: s - n.t - n.b,
      radius: {
        topLeft: Math.max(0, o.topLeft - Math.max(n.t, n.l)),
        topRight: Math.max(0, o.topRight - Math.max(n.t, n.r)),
        bottomLeft: Math.max(0, o.bottomLeft - Math.max(n.b, n.l)),
        bottomRight: Math.max(0, o.bottomRight - Math.max(n.b, n.r))
      }
    }
  };
}
function ts(i, t, e, s) {
  const n = t === null, o = e === null, a = i && !(n && o) && Vr(i, s);
  return a && (n || Ot(t, a.left, a.right)) && (o || Ot(e, a.top, a.bottom));
}
function pu(i) {
  return i.topLeft || i.topRight || i.bottomLeft || i.bottomRight;
}
function gu(i, t) {
  i.rect(t.x, t.y, t.w, t.h);
}
function es(i, t, e = {}) {
  const s = i.x !== e.x ? -t : 0, n = i.y !== e.y ? -t : 0, o = (i.x + i.w !== e.x + e.w ? t : 0) - s, r = (i.y + i.h !== e.y + e.h ? t : 0) - n;
  return {
    x: i.x + s,
    y: i.y + n,
    w: i.w + o,
    h: i.h + r,
    radius: i.radius
  };
}
class Si extends Lt {
  constructor(t) {
    super(), this.options = void 0, this.horizontal = void 0, this.base = void 0, this.width = void 0, this.height = void 0, this.inflateAmount = void 0, t && Object.assign(this, t);
  }
  draw(t) {
    const { inflateAmount: e, options: { borderColor: s, backgroundColor: n } } = this, { inner: o, outer: r } = fu(this), a = pu(r.radius) ? je : gu;
    t.save(), (r.w !== o.w || r.h !== o.h) && (t.beginPath(), a(t, es(r, e, o)), t.clip(), a(t, es(o, -e, r)), t.fillStyle = s, t.fill("evenodd")), t.beginPath(), a(t, es(o, e)), t.fillStyle = n, t.fill(), t.restore();
  }
  inRange(t, e, s) {
    return ts(this, t, e, s);
  }
  inXRange(t, e) {
    return ts(this, t, null, e);
  }
  inYRange(t, e) {
    return ts(this, null, t, e);
  }
  getCenterPoint(t) {
    const { x: e, y: s, base: n, horizontal: o } = this.getProps([
      "x",
      "y",
      "base",
      "horizontal"
    ], t);
    return {
      x: o ? (e + n) / 2 : e,
      y: o ? s : (s + n) / 2
    };
  }
  getRange(t) {
    return t === "x" ? this.width / 2 : this.height / 2;
  }
}
E(Si, "id", "bar"), E(Si, "defaults", {
  borderSkipped: "start",
  borderWidth: 0,
  borderRadius: 0,
  inflateAmount: "auto",
  pointStyle: void 0
}), E(Si, "defaultRoutes", {
  backgroundColor: "backgroundColor",
  borderColor: "borderColor"
});
var mu = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  ArcElement: Pe,
  BarElement: Si,
  LineElement: zt,
  PointElement: xi
});
const ys = [
  "rgb(54, 162, 235)",
  "rgb(255, 99, 132)",
  "rgb(255, 159, 64)",
  "rgb(255, 205, 86)",
  "rgb(75, 192, 192)",
  "rgb(153, 102, 255)",
  "rgb(201, 203, 207)"
  // grey
], ho = /* @__PURE__ */ ys.map((i) => i.replace("rgb(", "rgba(").replace(")", ", 0.5)"));
function Wr(i) {
  return ys[i % ys.length];
}
function jr(i) {
  return ho[i % ho.length];
}
function bu(i, t) {
  return i.borderColor = Wr(t), i.backgroundColor = jr(t), ++t;
}
function _u(i, t) {
  return i.backgroundColor = i.data.map(() => Wr(t++)), t;
}
function yu(i, t) {
  return i.backgroundColor = i.data.map(() => jr(t++)), t;
}
function vu(i) {
  let t = 0;
  return (e, s) => {
    const n = i.getDatasetMeta(s).controller;
    n instanceof ee ? t = _u(e, t) : n instanceof Be ? t = yu(e, t) : n && (t = bu(e, t));
  };
}
function uo(i) {
  let t;
  for (t in i)
    if (i[t].borderColor || i[t].backgroundColor)
      return !0;
  return !1;
}
function xu(i) {
  return i && (i.borderColor || i.backgroundColor);
}
function Su() {
  return j.borderColor !== "rgba(0,0,0,0.1)" || j.backgroundColor !== "rgba(0,0,0,0.1)";
}
var wu = {
  id: "colors",
  defaults: {
    enabled: !0,
    forceOverride: !1
  },
  beforeLayout(i, t, e) {
    if (!e.enabled)
      return;
    const { data: { datasets: s }, options: n } = i.config, { elements: o } = n, r = uo(s) || xu(n) || o && uo(o) || Su();
    if (!e.forceOverride && r)
      return;
    const a = vu(i);
    s.forEach(a);
  }
};
function Mu(i, t, e, s, n) {
  const o = n.samples || s;
  if (o >= e)
    return i.slice(t, t + e);
  const r = [], a = (e - 2) / (o - 2);
  let l = 0;
  const c = t + e - 1;
  let h = t, d, u, f, p, g;
  for (r[l++] = i[h], d = 0; d < o - 2; d++) {
    let m = 0, b = 0, _;
    const v = Math.floor((d + 1) * a) + 1 + t, x = Math.min(Math.floor((d + 2) * a) + 1, e) + t, y = x - v;
    for (_ = v; _ < x; _++)
      m += i[_].x, b += i[_].y;
    m /= y, b /= y;
    const M = Math.floor(d * a) + 1 + t, S = Math.min(Math.floor((d + 1) * a) + 1, e) + t, { x: w, y: C } = i[h];
    for (f = p = -1, _ = M; _ < S; _++)
      p = 0.5 * Math.abs((w - m) * (i[_].y - C) - (w - i[_].x) * (b - C)), p > f && (f = p, u = i[_], g = _);
    r[l++] = u, h = g;
  }
  return r[l++] = i[c], r;
}
function Eu(i, t, e, s) {
  let n = 0, o = 0, r, a, l, c, h, d, u, f, p, g;
  const m = [], b = t + e - 1, _ = i[t].x, x = i[b].x - _;
  for (r = t; r < t + e; ++r) {
    a = i[r], l = (a.x - _) / x * s, c = a.y;
    const y = l | 0;
    if (y === h)
      c < p ? (p = c, d = r) : c > g && (g = c, u = r), n = (o * n + a.x) / ++o;
    else {
      const M = r - 1;
      if (!I(d) && !I(u)) {
        const S = Math.min(d, u), w = Math.max(d, u);
        S !== f && S !== M && m.push({
          ...i[S],
          x: n
        }), w !== f && w !== M && m.push({
          ...i[w],
          x: n
        });
      }
      r > 0 && M !== f && m.push(i[M]), m.push(a), h = y, o = 0, p = g = c, d = u = f = r;
    }
  }
  return m;
}
function $r(i) {
  if (i._decimated) {
    const t = i._data;
    delete i._decimated, delete i._data, Object.defineProperty(i, "data", {
      configurable: !0,
      enumerable: !0,
      writable: !0,
      value: t
    });
  }
}
function fo(i) {
  i.data.datasets.forEach((t) => {
    $r(t);
  });
}
function Cu(i, t) {
  const e = t.length;
  let s = 0, n;
  const { iScale: o } = i, { min: r, max: a, minDefined: l, maxDefined: c } = o.getUserBounds();
  return l && (s = q(Pt(t, o.axis, r).lo, 0, e - 1)), c ? n = q(Pt(t, o.axis, a).hi + 1, s, e) - s : n = e - s, {
    start: s,
    count: n
  };
}
var Au = {
  id: "decimation",
  defaults: {
    algorithm: "min-max",
    enabled: !1
  },
  beforeElementsUpdate: (i, t, e) => {
    if (!e.enabled) {
      fo(i);
      return;
    }
    const s = i.width;
    i.data.datasets.forEach((n, o) => {
      const { _data: r, indexAxis: a } = n, l = i.getDatasetMeta(o), c = r || n.data;
      if (ke([
        a,
        i.options.indexAxis
      ]) === "y" || !l.controller.supportsDecimation)
        return;
      const h = i.scales[l.xAxisID];
      if (h.type !== "linear" && h.type !== "time" || i.options.parsing)
        return;
      let { start: d, count: u } = Cu(l, c);
      const f = e.threshold || 4 * s;
      if (u <= f) {
        $r(n);
        return;
      }
      I(r) && (n._data = c, delete n.data, Object.defineProperty(n, "data", {
        configurable: !0,
        enumerable: !0,
        get: function() {
          return this._decimated;
        },
        set: function(g) {
          this._data = g;
        }
      }));
      let p;
      switch (e.algorithm) {
        case "lttb":
          p = Mu(c, d, u, s, e);
          break;
        case "min-max":
          p = Eu(c, d, u, s);
          break;
        default:
          throw new Error(`Unsupported decimation algorithm '${e.algorithm}'`);
      }
      n._decimated = p;
    });
  },
  destroy(i) {
    fo(i);
  }
};
function ku(i, t, e) {
  const s = i.segments, n = i.points, o = t.points, r = [];
  for (const a of s) {
    let { start: l, end: c } = a;
    c = Bi(l, c, n);
    const h = vs(e, n[l], n[c], a.loop);
    if (!t.segments) {
      r.push({
        source: a,
        target: h,
        start: n[l],
        end: n[c]
      });
      continue;
    }
    const d = Er(t, h);
    for (const u of d) {
      const f = vs(e, o[u.start], o[u.end], u.loop), p = Mr(a, n, f);
      for (const g of p)
        r.push({
          source: g,
          target: u,
          start: {
            [e]: po(h, f, "start", Math.max)
          },
          end: {
            [e]: po(h, f, "end", Math.min)
          }
        });
    }
  }
  return r;
}
function vs(i, t, e, s) {
  if (s)
    return;
  let n = t[i], o = e[i];
  return i === "angle" && (n = et(n), o = et(o)), {
    property: i,
    start: n,
    end: o
  };
}
function Ou(i, t) {
  const { x: e = null, y: s = null } = i || {}, n = t.points, o = [];
  return t.segments.forEach(({ start: r, end: a }) => {
    a = Bi(r, a, n);
    const l = n[r], c = n[a];
    s !== null ? (o.push({
      x: l.x,
      y: s
    }), o.push({
      x: c.x,
      y: s
    })) : e !== null && (o.push({
      x: e,
      y: l.y
    }), o.push({
      x: e,
      y: c.y
    }));
  }), o;
}
function Bi(i, t, e) {
  for (; t > i; t--) {
    const s = e[t];
    if (!isNaN(s.x) && !isNaN(s.y))
      break;
  }
  return t;
}
function po(i, t, e, s) {
  return i && t ? s(i[e], t[e]) : i ? i[e] : t ? t[e] : 0;
}
function Yr(i, t) {
  let e = [], s = !1;
  return W(i) ? (s = !0, e = i) : e = Ou(i, t), e.length ? new zt({
    points: e,
    options: {
      tension: 0
    },
    _loop: s,
    _fullLoop: s
  }) : null;
}
function go(i) {
  return i && i.fill !== !1;
}
function Pu(i, t, e) {
  let n = i[t].fill;
  const o = [
    t
  ];
  let r;
  if (!e)
    return n;
  for (; n !== !1 && o.indexOf(n) === -1; ) {
    if (!$(n))
      return n;
    if (r = i[n], !r)
      return !1;
    if (r.visible)
      return n;
    o.push(n), n = r.fill;
  }
  return !1;
}
function Du(i, t, e) {
  const s = Ru(i);
  if (L(s))
    return isNaN(s.value) ? !1 : s;
  let n = parseFloat(s);
  return $(n) && Math.floor(n) === n ? Tu(s[0], t, n, e) : [
    "origin",
    "start",
    "end",
    "stack",
    "shape"
  ].indexOf(s) >= 0 && s;
}
function Tu(i, t, e, s) {
  return (i === "-" || i === "+") && (e = t + e), e === t || e < 0 || e >= s ? !1 : e;
}
function Iu(i, t) {
  let e = null;
  return i === "start" ? e = t.bottom : i === "end" ? e = t.top : L(i) ? e = t.getPixelForValue(i.value) : t.getBasePixel && (e = t.getBasePixel()), e;
}
function Lu(i, t, e) {
  let s;
  return i === "start" ? s = e : i === "end" ? s = t.options.reverse ? t.min : t.max : L(i) ? s = i.value : s = t.getBaseValue(), s;
}
function Ru(i) {
  const t = i.options, e = t.fill;
  let s = k(e && e.target, e);
  return s === void 0 && (s = !!t.backgroundColor), s === !1 || s === null ? !1 : s === !0 ? "origin" : s;
}
function Fu(i) {
  const { scale: t, index: e, line: s } = i, n = [], o = s.segments, r = s.points, a = Nu(t, e);
  a.push(Yr({
    x: null,
    y: t.bottom
  }, s));
  for (let l = 0; l < o.length; l++) {
    const c = o[l];
    for (let h = c.start; h <= c.end; h++)
      Bu(n, r[h], a);
  }
  return new zt({
    points: n,
    options: {}
  });
}
function Nu(i, t) {
  const e = [], s = i.getMatchingVisibleMetas("line");
  for (let n = 0; n < s.length; n++) {
    const o = s[n];
    if (o.index === t)
      break;
    o.hidden || e.unshift(o.dataset);
  }
  return e;
}
function Bu(i, t, e) {
  const s = [];
  for (let n = 0; n < e.length; n++) {
    const o = e[n], { first: r, last: a, point: l } = zu(o, t, "x");
    if (!(!l || r && a)) {
      if (r)
        s.unshift(l);
      else if (i.push(l), !a)
        break;
    }
  }
  i.push(...s);
}
function zu(i, t, e) {
  const s = i.interpolate(t, e);
  if (!s)
    return {};
  const n = s[e], o = i.segments, r = i.points;
  let a = !1, l = !1;
  for (let c = 0; c < o.length; c++) {
    const h = o[c], d = r[h.start][e], u = r[h.end][e];
    if (Ot(n, d, u)) {
      a = n === d, l = n === u;
      break;
    }
  }
  return {
    first: a,
    last: l,
    point: s
  };
}
class Kr {
  constructor(t) {
    this.x = t.x, this.y = t.y, this.radius = t.radius;
  }
  pathSegment(t, e, s) {
    const { x: n, y: o, radius: r } = this;
    return e = e || {
      start: 0,
      end: V
    }, t.arc(n, o, r, e.end, e.start, !0), !s.bounds;
  }
  interpolate(t) {
    const { x: e, y: s, radius: n } = this, o = t.angle;
    return {
      x: e + Math.cos(o) * n,
      y: s + Math.sin(o) * n,
      angle: o
    };
  }
}
function Hu(i) {
  const { chart: t, fill: e, line: s } = i;
  if ($(e))
    return Vu(t, e);
  if (e === "stack")
    return Fu(i);
  if (e === "shape")
    return !0;
  const n = Wu(i);
  return n instanceof Kr ? n : Yr(n, s);
}
function Vu(i, t) {
  const e = i.getDatasetMeta(t);
  return e && i.isDatasetVisible(t) ? e.dataset : null;
}
function Wu(i) {
  return (i.scale || {}).getPointPositionForValue ? $u(i) : ju(i);
}
function ju(i) {
  const { scale: t = {}, fill: e } = i, s = Iu(e, t);
  if ($(s)) {
    const n = t.isHorizontal();
    return {
      x: n ? s : null,
      y: n ? null : s
    };
  }
  return null;
}
function $u(i) {
  const { scale: t, fill: e } = i, s = t.options, n = t.getLabels().length, o = s.reverse ? t.max : t.min, r = Lu(e, t, o), a = [];
  if (s.grid.circular) {
    const l = t.getPointPositionForValue(0, o);
    return new Kr({
      x: l.x,
      y: l.y,
      radius: t.getDistanceFromCenterForValue(r)
    });
  }
  for (let l = 0; l < n; ++l)
    a.push(t.getPointPositionForValue(l, r));
  return a;
}
function is(i, t, e) {
  const s = Hu(t), { chart: n, index: o, line: r, scale: a, axis: l } = t, c = r.options, h = c.fill, d = c.backgroundColor, { above: u = d, below: f = d } = h || {}, p = n.getDatasetMeta(o), g = Cr(n, p);
  s && r.points.length && (Li(i, e), Yu(i, {
    line: r,
    target: s,
    above: u,
    below: f,
    area: e,
    scale: a,
    axis: l,
    clip: g
  }), Ri(i));
}
function Yu(i, t) {
  const { line: e, target: s, above: n, below: o, area: r, scale: a, clip: l } = t, c = e._loop ? "angle" : t.axis;
  i.save();
  let h = o;
  o !== n && (c === "x" ? (mo(i, s, r.top), ss(i, {
    line: e,
    target: s,
    color: n,
    scale: a,
    property: c,
    clip: l
  }), i.restore(), i.save(), mo(i, s, r.bottom)) : c === "y" && (bo(i, s, r.left), ss(i, {
    line: e,
    target: s,
    color: o,
    scale: a,
    property: c,
    clip: l
  }), i.restore(), i.save(), bo(i, s, r.right), h = n)), ss(i, {
    line: e,
    target: s,
    color: h,
    scale: a,
    property: c,
    clip: l
  }), i.restore();
}
function mo(i, t, e) {
  const { segments: s, points: n } = t;
  let o = !0, r = !1;
  i.beginPath();
  for (const a of s) {
    const { start: l, end: c } = a, h = n[l], d = n[Bi(l, c, n)];
    o ? (i.moveTo(h.x, h.y), o = !1) : (i.lineTo(h.x, e), i.lineTo(h.x, h.y)), r = !!t.pathSegment(i, a, {
      move: r
    }), r ? i.closePath() : i.lineTo(d.x, e);
  }
  i.lineTo(t.first().x, e), i.closePath(), i.clip();
}
function bo(i, t, e) {
  const { segments: s, points: n } = t;
  let o = !0, r = !1;
  i.beginPath();
  for (const a of s) {
    const { start: l, end: c } = a, h = n[l], d = n[Bi(l, c, n)];
    o ? (i.moveTo(h.x, h.y), o = !1) : (i.lineTo(e, h.y), i.lineTo(h.x, h.y)), r = !!t.pathSegment(i, a, {
      move: r
    }), r ? i.closePath() : i.lineTo(e, d.y);
  }
  i.lineTo(e, t.first().y), i.closePath(), i.clip();
}
function ss(i, t) {
  const { line: e, target: s, property: n, color: o, scale: r, clip: a } = t, l = ku(e, s, n);
  for (const { source: c, target: h, start: d, end: u } of l) {
    const { style: { backgroundColor: f = o } = {} } = c, p = s !== !0;
    i.save(), i.fillStyle = f, Ku(i, r, a, p && vs(n, d, u)), i.beginPath();
    const g = !!e.pathSegment(i, c);
    let m;
    if (p) {
      g ? i.closePath() : _o(i, s, u, n);
      const b = !!s.pathSegment(i, h, {
        move: g,
        reverse: !0
      });
      m = g && b, m || _o(i, s, d, n);
    }
    i.closePath(), i.fill(m ? "evenodd" : "nonzero"), i.restore();
  }
}
function Ku(i, t, e, s) {
  const n = t.chart.chartArea, { property: o, start: r, end: a } = s || {};
  if (o === "x" || o === "y") {
    let l, c, h, d;
    o === "x" ? (l = r, c = n.top, h = a, d = n.bottom) : (l = n.left, c = r, h = n.right, d = a), i.beginPath(), e && (l = Math.max(l, e.left), h = Math.min(h, e.right), c = Math.max(c, e.top), d = Math.min(d, e.bottom)), i.rect(l, c, h - l, d - c), i.clip();
  }
}
function _o(i, t, e, s) {
  const n = t.interpolate(e, s);
  n && i.lineTo(n.x, n.y);
}
var Uu = {
  id: "filler",
  afterDatasetsUpdate(i, t, e) {
    const s = (i.data.datasets || []).length, n = [];
    let o, r, a, l;
    for (r = 0; r < s; ++r)
      o = i.getDatasetMeta(r), a = o.dataset, l = null, a && a.options && a instanceof zt && (l = {
        visible: i.isDatasetVisible(r),
        index: r,
        fill: Du(a, r, s),
        chart: i,
        axis: o.controller.options.indexAxis,
        scale: o.vScale,
        line: a
      }), o.$filler = l, n.push(l);
    for (r = 0; r < s; ++r)
      l = n[r], !(!l || l.fill === !1) && (l.fill = Pu(n, r, e.propagate));
  },
  beforeDraw(i, t, e) {
    const s = e.drawTime === "beforeDraw", n = i.getSortedVisibleDatasetMetas(), o = i.chartArea;
    for (let r = n.length - 1; r >= 0; --r) {
      const a = n[r].$filler;
      a && (a.line.updateControlPoints(o, a.axis), s && a.fill && is(i.ctx, a, o));
    }
  },
  beforeDatasetsDraw(i, t, e) {
    if (e.drawTime !== "beforeDatasetsDraw")
      return;
    const s = i.getSortedVisibleDatasetMetas();
    for (let n = s.length - 1; n >= 0; --n) {
      const o = s[n].$filler;
      go(o) && is(i.ctx, o, i.chartArea);
    }
  },
  beforeDatasetDraw(i, t, e) {
    const s = t.meta.$filler;
    !go(s) || e.drawTime !== "beforeDatasetDraw" || is(i.ctx, s, i.chartArea);
  },
  defaults: {
    propagate: !0,
    drawTime: "beforeDatasetDraw"
  }
};
const yo = (i, t) => {
  let { boxHeight: e = t, boxWidth: s = t } = i;
  return i.usePointStyle && (e = Math.min(e, t), s = i.pointStyleWidth || Math.min(s, t)), {
    boxWidth: s,
    boxHeight: e,
    itemHeight: Math.max(t, e)
  };
}, Xu = (i, t) => i !== null && t !== null && i.datasetIndex === t.datasetIndex && i.index === t.index;
class vo extends Lt {
  constructor(t) {
    super(), this._added = !1, this.legendHitBoxes = [], this._hoveredItem = null, this.doughnutMode = !1, this.chart = t.chart, this.options = t.options, this.ctx = t.ctx, this.legendItems = void 0, this.columnSizes = void 0, this.lineWidths = void 0, this.maxHeight = void 0, this.maxWidth = void 0, this.top = void 0, this.bottom = void 0, this.left = void 0, this.right = void 0, this.height = void 0, this.width = void 0, this._margins = void 0, this.position = void 0, this.weight = void 0, this.fullSize = void 0;
  }
  update(t, e, s) {
    this.maxWidth = t, this.maxHeight = e, this._margins = s, this.setDimensions(), this.buildLabels(), this.fit();
  }
  setDimensions() {
    this.isHorizontal() ? (this.width = this.maxWidth, this.left = this._margins.left, this.right = this.width) : (this.height = this.maxHeight, this.top = this._margins.top, this.bottom = this.height);
  }
  buildLabels() {
    const t = this.options.labels || {};
    let e = z(t.generateLabels, [
      this.chart
    ], this) || [];
    t.filter && (e = e.filter((s) => t.filter(s, this.chart.data))), t.sort && (e = e.sort((s, n) => t.sort(s, n, this.chart.data))), this.options.reverse && e.reverse(), this.legendItems = e;
  }
  fit() {
    const { options: t, ctx: e } = this;
    if (!t.display) {
      this.width = this.height = 0;
      return;
    }
    const s = t.labels, n = X(s.font), o = n.size, r = this._computeTitleHeight(), { boxWidth: a, itemHeight: l } = yo(s, o);
    let c, h;
    e.font = n.string, this.isHorizontal() ? (c = this.maxWidth, h = this._fitRows(r, o, a, l) + 10) : (h = this.maxHeight, c = this._fitCols(r, n, a, l) + 10), this.width = Math.min(c, t.maxWidth || this.maxWidth), this.height = Math.min(h, t.maxHeight || this.maxHeight);
  }
  _fitRows(t, e, s, n) {
    const { ctx: o, maxWidth: r, options: { labels: { padding: a } } } = this, l = this.legendHitBoxes = [], c = this.lineWidths = [
      0
    ], h = n + a;
    let d = t;
    o.textAlign = "left", o.textBaseline = "middle";
    let u = -1, f = -h;
    return this.legendItems.forEach((p, g) => {
      const m = s + e / 2 + o.measureText(p.text).width;
      (g === 0 || c[c.length - 1] + m + 2 * a > r) && (d += h, c[c.length - (g > 0 ? 0 : 1)] = 0, f += h, u++), l[g] = {
        left: 0,
        top: f,
        row: u,
        width: m,
        height: n
      }, c[c.length - 1] += m + a;
    }), d;
  }
  _fitCols(t, e, s, n) {
    const { ctx: o, maxHeight: r, options: { labels: { padding: a } } } = this, l = this.legendHitBoxes = [], c = this.columnSizes = [], h = r - t;
    let d = a, u = 0, f = 0, p = 0, g = 0;
    return this.legendItems.forEach((m, b) => {
      const { itemWidth: _, itemHeight: v } = Gu(s, e, o, m, n);
      b > 0 && f + v + 2 * a > h && (d += u + a, c.push({
        width: u,
        height: f
      }), p += u + a, g++, u = f = 0), l[b] = {
        left: p,
        top: f,
        col: g,
        width: _,
        height: v
      }, u = Math.max(u, _), f += v + a;
    }), d += u, c.push({
      width: u,
      height: f
    }), d;
  }
  adjustHitBoxes() {
    if (!this.options.display)
      return;
    const t = this._computeTitleHeight(), { legendHitBoxes: e, options: { align: s, labels: { padding: n }, rtl: o } } = this, r = fe(o, this.left, this.width);
    if (this.isHorizontal()) {
      let a = 0, l = tt(s, this.left + n, this.right - this.lineWidths[a]);
      for (const c of e)
        a !== c.row && (a = c.row, l = tt(s, this.left + n, this.right - this.lineWidths[a])), c.top += this.top + t + n, c.left = r.leftForLtr(r.x(l), c.width), l += c.width + n;
    } else {
      let a = 0, l = tt(s, this.top + t + n, this.bottom - this.columnSizes[a].height);
      for (const c of e)
        c.col !== a && (a = c.col, l = tt(s, this.top + t + n, this.bottom - this.columnSizes[a].height)), c.top = l, c.left += this.left + n, c.left = r.leftForLtr(r.x(c.left), c.width), l += c.height + n;
    }
  }
  isHorizontal() {
    return this.options.position === "top" || this.options.position === "bottom";
  }
  draw() {
    if (this.options.display) {
      const t = this.ctx;
      Li(t, this), this._draw(), Ri(t);
    }
  }
  _draw() {
    const { options: t, columnSizes: e, lineWidths: s, ctx: n } = this, { align: o, labels: r } = t, a = j.color, l = fe(t.rtl, this.left, this.width), c = X(r.font), { padding: h } = r, d = c.size, u = d / 2;
    let f;
    this.drawTitle(), n.textAlign = l.textAlign("left"), n.textBaseline = "middle", n.lineWidth = 0.5, n.font = c.string;
    const { boxWidth: p, boxHeight: g, itemHeight: m } = yo(r, d), b = function(M, S, w) {
      if (isNaN(p) || p <= 0 || isNaN(g) || g < 0)
        return;
      n.save();
      const C = k(w.lineWidth, 1);
      if (n.fillStyle = k(w.fillStyle, a), n.lineCap = k(w.lineCap, "butt"), n.lineDashOffset = k(w.lineDashOffset, 0), n.lineJoin = k(w.lineJoin, "miter"), n.lineWidth = C, n.strokeStyle = k(w.strokeStyle, a), n.setLineDash(k(w.lineDash, [])), r.usePointStyle) {
        const D = {
          radius: g * Math.SQRT2 / 2,
          pointStyle: w.pointStyle,
          rotation: w.rotation,
          borderWidth: C
        }, O = l.xPlus(M, p / 2), T = S + u;
        fr(n, D, O, T, r.pointStyleWidth && p);
      } else {
        const D = S + Math.max((d - g) / 2, 0), O = l.leftForLtr(M, p), T = ie(w.borderRadius);
        n.beginPath(), Object.values(T).some((G) => G !== 0) ? je(n, {
          x: O,
          y: D,
          w: p,
          h: g,
          radius: T
        }) : n.rect(O, D, p, g), n.fill(), C !== 0 && n.stroke();
      }
      n.restore();
    }, _ = function(M, S, w) {
      oe(n, w.text, M, S + m / 2, c, {
        strikethrough: w.hidden,
        textAlign: l.textAlign(w.textAlign)
      });
    }, v = this.isHorizontal(), x = this._computeTitleHeight();
    v ? f = {
      x: tt(o, this.left + h, this.right - s[0]),
      y: this.top + h + x,
      line: 0
    } : f = {
      x: this.left + h,
      y: tt(o, this.top + x + h, this.bottom - e[0].height),
      line: 0
    }, xr(this.ctx, t.textDirection);
    const y = m + h;
    this.legendItems.forEach((M, S) => {
      n.strokeStyle = M.fontColor, n.fillStyle = M.fontColor;
      const w = n.measureText(M.text).width, C = l.textAlign(M.textAlign || (M.textAlign = r.textAlign)), D = p + u + w;
      let O = f.x, T = f.y;
      l.setWidth(this.width), v ? S > 0 && O + D + h > this.right && (T = f.y += y, f.line++, O = f.x = tt(o, this.left + h, this.right - s[f.line])) : S > 0 && T + y > this.bottom && (O = f.x = O + e[f.line].width + h, f.line++, T = f.y = tt(o, this.top + x + h, this.bottom - e[f.line].height));
      const G = l.x(O);
      if (b(G, T, M), O = pc(C, O + p + u, v ? O + D : this.right, t.rtl), _(l.x(O), T, M), v)
        f.x += D + h;
      else if (typeof M.text != "string") {
        const H = c.lineHeight;
        f.y += Ur(M, H) + h;
      } else
        f.y += y;
    }), Sr(this.ctx, t.textDirection);
  }
  drawTitle() {
    const t = this.options, e = t.title, s = X(e.font), n = nt(e.padding);
    if (!e.display)
      return;
    const o = fe(t.rtl, this.left, this.width), r = this.ctx, a = e.position, l = s.size / 2, c = n.top + l;
    let h, d = this.left, u = this.width;
    if (this.isHorizontal())
      u = Math.max(...this.lineWidths), h = this.top + c, d = tt(t.align, d, this.right - u);
    else {
      const p = this.columnSizes.reduce((g, m) => Math.max(g, m.height), 0);
      h = c + tt(t.align, this.top, this.bottom - p - t.labels.padding - this._computeTitleHeight());
    }
    const f = tt(a, d, d + u);
    r.textAlign = o.textAlign(Ns(a)), r.textBaseline = "middle", r.strokeStyle = e.color, r.fillStyle = e.color, r.font = s.string, oe(r, e.text, f, h, s);
  }
  _computeTitleHeight() {
    const t = this.options.title, e = X(t.font), s = nt(t.padding);
    return t.display ? e.lineHeight + s.height : 0;
  }
  _getLegendItemAt(t, e) {
    let s, n, o;
    if (Ot(t, this.left, this.right) && Ot(e, this.top, this.bottom)) {
      for (o = this.legendHitBoxes, s = 0; s < o.length; ++s)
        if (n = o[s], Ot(t, n.left, n.left + n.width) && Ot(e, n.top, n.top + n.height))
          return this.legendItems[s];
    }
    return null;
  }
  handleEvent(t) {
    const e = this.options;
    if (!Qu(t.type, e))
      return;
    const s = this._getLegendItemAt(t.x, t.y);
    if (t.type === "mousemove" || t.type === "mouseout") {
      const n = this._hoveredItem, o = Xu(n, s);
      n && !o && z(e.onLeave, [
        t,
        n,
        this
      ], this), this._hoveredItem = s, s && !o && z(e.onHover, [
        t,
        s,
        this
      ], this);
    } else s && z(e.onClick, [
      t,
      s,
      this
    ], this);
  }
}
function Gu(i, t, e, s, n) {
  const o = qu(s, i, t, e), r = Ju(n, s, t.lineHeight);
  return {
    itemWidth: o,
    itemHeight: r
  };
}
function qu(i, t, e, s) {
  let n = i.text;
  return n && typeof n != "string" && (n = n.reduce((o, r) => o.length > r.length ? o : r)), t + e.size / 2 + s.measureText(n).width;
}
function Ju(i, t, e) {
  let s = i;
  return typeof t.text != "string" && (s = Ur(t, e)), s;
}
function Ur(i, t) {
  const e = i.text ? i.text.length : 0;
  return t * e;
}
function Qu(i, t) {
  return !!((i === "mousemove" || i === "mouseout") && (t.onHover || t.onLeave) || t.onClick && (i === "click" || i === "mouseup"));
}
var Zu = {
  id: "legend",
  _element: vo,
  start(i, t, e) {
    const s = i.legend = new vo({
      ctx: i.ctx,
      options: e,
      chart: i
    });
    it.configure(i, s, e), it.addBox(i, s);
  },
  stop(i) {
    it.removeBox(i, i.legend), delete i.legend;
  },
  beforeUpdate(i, t, e) {
    const s = i.legend;
    it.configure(i, s, e), s.options = e;
  },
  afterUpdate(i) {
    const t = i.legend;
    t.buildLabels(), t.adjustHitBoxes();
  },
  afterEvent(i, t) {
    t.replay || i.legend.handleEvent(t.event);
  },
  defaults: {
    display: !0,
    position: "top",
    align: "center",
    fullSize: !0,
    reverse: !1,
    weight: 1e3,
    onClick(i, t, e) {
      const s = t.datasetIndex, n = e.chart;
      n.isDatasetVisible(s) ? (n.hide(s), t.hidden = !0) : (n.show(s), t.hidden = !1);
    },
    onHover: null,
    onLeave: null,
    labels: {
      color: (i) => i.chart.options.color,
      boxWidth: 40,
      padding: 10,
      generateLabels(i) {
        const t = i.data.datasets, { labels: { usePointStyle: e, pointStyle: s, textAlign: n, color: o, useBorderRadius: r, borderRadius: a } } = i.legend.options;
        return i._getSortedDatasetMetas().map((l) => {
          const c = l.controller.getStyle(e ? 0 : void 0), h = nt(c.borderWidth);
          return {
            text: t[l.index].label,
            fillStyle: c.backgroundColor,
            fontColor: o,
            hidden: !l.visible,
            lineCap: c.borderCapStyle,
            lineDash: c.borderDash,
            lineDashOffset: c.borderDashOffset,
            lineJoin: c.borderJoinStyle,
            lineWidth: (h.width + h.height) / 4,
            strokeStyle: c.borderColor,
            pointStyle: s || c.pointStyle,
            rotation: c.rotation,
            textAlign: n || c.textAlign,
            borderRadius: r && (a || c.borderRadius),
            datasetIndex: l.index
          };
        }, this);
      }
    },
    title: {
      color: (i) => i.chart.options.color,
      display: !1,
      position: "center",
      text: ""
    }
  },
  descriptors: {
    _scriptable: (i) => !i.startsWith("on"),
    labels: {
      _scriptable: (i) => ![
        "generateLabels",
        "filter",
        "sort"
      ].includes(i)
    }
  }
};
class Ks extends Lt {
  constructor(t) {
    super(), this.chart = t.chart, this.options = t.options, this.ctx = t.ctx, this._padding = void 0, this.top = void 0, this.bottom = void 0, this.left = void 0, this.right = void 0, this.width = void 0, this.height = void 0, this.position = void 0, this.weight = void 0, this.fullSize = void 0;
  }
  update(t, e) {
    const s = this.options;
    if (this.left = 0, this.top = 0, !s.display) {
      this.width = this.height = this.right = this.bottom = 0;
      return;
    }
    this.width = this.right = t, this.height = this.bottom = e;
    const n = W(s.text) ? s.text.length : 1;
    this._padding = nt(s.padding);
    const o = n * X(s.font).lineHeight + this._padding.height;
    this.isHorizontal() ? this.height = o : this.width = o;
  }
  isHorizontal() {
    const t = this.options.position;
    return t === "top" || t === "bottom";
  }
  _drawArgs(t) {
    const { top: e, left: s, bottom: n, right: o, options: r } = this, a = r.align;
    let l = 0, c, h, d;
    return this.isHorizontal() ? (h = tt(a, s, o), d = e + t, c = o - s) : (r.position === "left" ? (h = s + t, d = tt(a, n, e), l = F * -0.5) : (h = o - t, d = tt(a, e, n), l = F * 0.5), c = n - e), {
      titleX: h,
      titleY: d,
      maxWidth: c,
      rotation: l
    };
  }
  draw() {
    const t = this.ctx, e = this.options;
    if (!e.display)
      return;
    const s = X(e.font), o = s.lineHeight / 2 + this._padding.top, { titleX: r, titleY: a, maxWidth: l, rotation: c } = this._drawArgs(o);
    oe(t, e.text, 0, 0, s, {
      color: e.color,
      maxWidth: l,
      rotation: c,
      textAlign: Ns(e.align),
      textBaseline: "middle",
      translation: [
        r,
        a
      ]
    });
  }
}
function tf(i, t) {
  const e = new Ks({
    ctx: i.ctx,
    options: t,
    chart: i
  });
  it.configure(i, e, t), it.addBox(i, e), i.titleBlock = e;
}
var ef = {
  id: "title",
  _element: Ks,
  start(i, t, e) {
    tf(i, e);
  },
  stop(i) {
    const t = i.titleBlock;
    it.removeBox(i, t), delete i.titleBlock;
  },
  beforeUpdate(i, t, e) {
    const s = i.titleBlock;
    it.configure(i, s, e), s.options = e;
  },
  defaults: {
    align: "center",
    display: !1,
    font: {
      weight: "bold"
    },
    fullSize: !0,
    padding: 10,
    position: "top",
    text: "",
    weight: 2e3
  },
  defaultRoutes: {
    color: "color"
  },
  descriptors: {
    _scriptable: !0,
    _indexable: !1
  }
};
const hi = /* @__PURE__ */ new WeakMap();
var sf = {
  id: "subtitle",
  start(i, t, e) {
    const s = new Ks({
      ctx: i.ctx,
      options: e,
      chart: i
    });
    it.configure(i, s, e), it.addBox(i, s), hi.set(i, s);
  },
  stop(i) {
    it.removeBox(i, hi.get(i)), hi.delete(i);
  },
  beforeUpdate(i, t, e) {
    const s = hi.get(i);
    it.configure(i, s, e), s.options = e;
  },
  defaults: {
    align: "center",
    display: !1,
    font: {
      weight: "normal"
    },
    fullSize: !0,
    padding: 0,
    position: "top",
    text: "",
    weight: 1500
  },
  defaultRoutes: {
    color: "color"
  },
  descriptors: {
    _scriptable: !0,
    _indexable: !1
  }
};
const De = {
  average(i) {
    if (!i.length)
      return !1;
    let t, e, s = /* @__PURE__ */ new Set(), n = 0, o = 0;
    for (t = 0, e = i.length; t < e; ++t) {
      const a = i[t].element;
      if (a && a.hasValue()) {
        const l = a.tooltipPosition();
        s.add(l.x), n += l.y, ++o;
      }
    }
    return o === 0 || s.size === 0 ? !1 : {
      x: [
        ...s
      ].reduce((a, l) => a + l) / s.size,
      y: n / o
    };
  },
  nearest(i, t) {
    if (!i.length)
      return !1;
    let e = t.x, s = t.y, n = Number.POSITIVE_INFINITY, o, r, a;
    for (o = 0, r = i.length; o < r; ++o) {
      const l = i[o].element;
      if (l && l.hasValue()) {
        const c = l.getCenterPoint(), h = us(t, c);
        h < n && (n = h, a = l);
      }
    }
    if (a) {
      const l = a.tooltipPosition();
      e = l.x, s = l.y;
    }
    return {
      x: e,
      y: s
    };
  }
};
function bt(i, t) {
  return t && (W(t) ? Array.prototype.push.apply(i, t) : i.push(t)), i;
}
function Ct(i) {
  return (typeof i == "string" || i instanceof String) && i.indexOf(`
`) > -1 ? i.split(`
`) : i;
}
function nf(i, t) {
  const { element: e, datasetIndex: s, index: n } = t, o = i.getDatasetMeta(s).controller, { label: r, value: a } = o.getLabelAndValue(n);
  return {
    chart: i,
    label: r,
    parsed: o.getParsed(n),
    raw: i.data.datasets[s].data[n],
    formattedValue: a,
    dataset: o.getDataset(),
    dataIndex: n,
    datasetIndex: s,
    element: e
  };
}
function xo(i, t) {
  const e = i.chart.ctx, { body: s, footer: n, title: o } = i, { boxWidth: r, boxHeight: a } = t, l = X(t.bodyFont), c = X(t.titleFont), h = X(t.footerFont), d = o.length, u = n.length, f = s.length, p = nt(t.padding);
  let g = p.height, m = 0, b = s.reduce((x, y) => x + y.before.length + y.lines.length + y.after.length, 0);
  if (b += i.beforeBody.length + i.afterBody.length, d && (g += d * c.lineHeight + (d - 1) * t.titleSpacing + t.titleMarginBottom), b) {
    const x = t.displayColors ? Math.max(a, l.lineHeight) : l.lineHeight;
    g += f * x + (b - f) * l.lineHeight + (b - 1) * t.bodySpacing;
  }
  u && (g += t.footerMarginTop + u * h.lineHeight + (u - 1) * t.footerSpacing);
  let _ = 0;
  const v = function(x) {
    m = Math.max(m, e.measureText(x).width + _);
  };
  return e.save(), e.font = c.string, N(i.title, v), e.font = l.string, N(i.beforeBody.concat(i.afterBody), v), _ = t.displayColors ? r + 2 + t.boxPadding : 0, N(s, (x) => {
    N(x.before, v), N(x.lines, v), N(x.after, v);
  }), _ = 0, e.font = h.string, N(i.footer, v), e.restore(), m += p.width, {
    width: m,
    height: g
  };
}
function of(i, t) {
  const { y: e, height: s } = t;
  return e < s / 2 ? "top" : e > i.height - s / 2 ? "bottom" : "center";
}
function rf(i, t, e, s) {
  const { x: n, width: o } = s, r = e.caretSize + e.caretPadding;
  if (i === "left" && n + o + r > t.width || i === "right" && n - o - r < 0)
    return !0;
}
function af(i, t, e, s) {
  const { x: n, width: o } = e, { width: r, chartArea: { left: a, right: l } } = i;
  let c = "center";
  return s === "center" ? c = n <= (a + l) / 2 ? "left" : "right" : n <= o / 2 ? c = "left" : n >= r - o / 2 && (c = "right"), rf(c, i, t, e) && (c = "center"), c;
}
function So(i, t, e) {
  const s = e.yAlign || t.yAlign || of(i, e);
  return {
    xAlign: e.xAlign || t.xAlign || af(i, t, e, s),
    yAlign: s
  };
}
function lf(i, t) {
  let { x: e, width: s } = i;
  return t === "right" ? e -= s : t === "center" && (e -= s / 2), e;
}
function cf(i, t, e) {
  let { y: s, height: n } = i;
  return t === "top" ? s += e : t === "bottom" ? s -= n + e : s -= n / 2, s;
}
function wo(i, t, e, s) {
  const { caretSize: n, caretPadding: o, cornerRadius: r } = i, { xAlign: a, yAlign: l } = e, c = n + o, { topLeft: h, topRight: d, bottomLeft: u, bottomRight: f } = ie(r);
  let p = lf(t, a);
  const g = cf(t, l, c);
  return l === "center" ? a === "left" ? p += c : a === "right" && (p -= c) : a === "left" ? p -= Math.max(h, u) + n : a === "right" && (p += Math.max(d, f) + n), {
    x: q(p, 0, s.width - t.width),
    y: q(g, 0, s.height - t.height)
  };
}
function di(i, t, e) {
  const s = nt(e.padding);
  return t === "center" ? i.x + i.width / 2 : t === "right" ? i.x + i.width - s.right : i.x + s.left;
}
function Mo(i) {
  return bt([], Ct(i));
}
function hf(i, t, e) {
  return Yt(i, {
    tooltip: t,
    tooltipItems: e,
    type: "tooltip"
  });
}
function Eo(i, t) {
  const e = t && t.dataset && t.dataset.tooltip && t.dataset.tooltip.callbacks;
  return e ? i.override(e) : i;
}
const Xr = {
  beforeTitle: Mt,
  title(i) {
    if (i.length > 0) {
      const t = i[0], e = t.chart.data.labels, s = e ? e.length : 0;
      if (this && this.options && this.options.mode === "dataset")
        return t.dataset.label || "";
      if (t.label)
        return t.label;
      if (s > 0 && t.dataIndex < s)
        return e[t.dataIndex];
    }
    return "";
  },
  afterTitle: Mt,
  beforeBody: Mt,
  beforeLabel: Mt,
  label(i) {
    if (this && this.options && this.options.mode === "dataset")
      return i.label + ": " + i.formattedValue || i.formattedValue;
    let t = i.dataset.label || "";
    t && (t += ": ");
    const e = i.formattedValue;
    return I(e) || (t += e), t;
  },
  labelColor(i) {
    const e = i.chart.getDatasetMeta(i.datasetIndex).controller.getStyle(i.dataIndex);
    return {
      borderColor: e.borderColor,
      backgroundColor: e.backgroundColor,
      borderWidth: e.borderWidth,
      borderDash: e.borderDash,
      borderDashOffset: e.borderDashOffset,
      borderRadius: 0
    };
  },
  labelTextColor() {
    return this.options.bodyColor;
  },
  labelPointStyle(i) {
    const e = i.chart.getDatasetMeta(i.datasetIndex).controller.getStyle(i.dataIndex);
    return {
      pointStyle: e.pointStyle,
      rotation: e.rotation
    };
  },
  afterLabel: Mt,
  afterBody: Mt,
  beforeFooter: Mt,
  footer: Mt,
  afterFooter: Mt
};
function rt(i, t, e, s) {
  const n = i[t].call(e, s);
  return typeof n > "u" ? Xr[t].call(e, s) : n;
}
class xs extends Lt {
  constructor(t) {
    super(), this.opacity = 0, this._active = [], this._eventPosition = void 0, this._size = void 0, this._cachedAnimations = void 0, this._tooltipItems = [], this.$animations = void 0, this.$context = void 0, this.chart = t.chart, this.options = t.options, this.dataPoints = void 0, this.title = void 0, this.beforeBody = void 0, this.body = void 0, this.afterBody = void 0, this.footer = void 0, this.xAlign = void 0, this.yAlign = void 0, this.x = void 0, this.y = void 0, this.height = void 0, this.width = void 0, this.caretX = void 0, this.caretY = void 0, this.labelColors = void 0, this.labelPointStyles = void 0, this.labelTextColors = void 0;
  }
  initialize(t) {
    this.options = t, this._cachedAnimations = void 0, this.$context = void 0;
  }
  _resolveAnimations() {
    const t = this._cachedAnimations;
    if (t)
      return t;
    const e = this.chart, s = this.options.setContext(this.getContext()), n = s.enabled && e.options.animation && s.animations, o = new Ar(this.chart, n);
    return n._cacheable && (this._cachedAnimations = Object.freeze(o)), o;
  }
  getContext() {
    return this.$context || (this.$context = hf(this.chart.getContext(), this, this._tooltipItems));
  }
  getTitle(t, e) {
    const { callbacks: s } = e, n = rt(s, "beforeTitle", this, t), o = rt(s, "title", this, t), r = rt(s, "afterTitle", this, t);
    let a = [];
    return a = bt(a, Ct(n)), a = bt(a, Ct(o)), a = bt(a, Ct(r)), a;
  }
  getBeforeBody(t, e) {
    return Mo(rt(e.callbacks, "beforeBody", this, t));
  }
  getBody(t, e) {
    const { callbacks: s } = e, n = [];
    return N(t, (o) => {
      const r = {
        before: [],
        lines: [],
        after: []
      }, a = Eo(s, o);
      bt(r.before, Ct(rt(a, "beforeLabel", this, o))), bt(r.lines, rt(a, "label", this, o)), bt(r.after, Ct(rt(a, "afterLabel", this, o))), n.push(r);
    }), n;
  }
  getAfterBody(t, e) {
    return Mo(rt(e.callbacks, "afterBody", this, t));
  }
  getFooter(t, e) {
    const { callbacks: s } = e, n = rt(s, "beforeFooter", this, t), o = rt(s, "footer", this, t), r = rt(s, "afterFooter", this, t);
    let a = [];
    return a = bt(a, Ct(n)), a = bt(a, Ct(o)), a = bt(a, Ct(r)), a;
  }
  _createItems(t) {
    const e = this._active, s = this.chart.data, n = [], o = [], r = [];
    let a = [], l, c;
    for (l = 0, c = e.length; l < c; ++l)
      a.push(nf(this.chart, e[l]));
    return t.filter && (a = a.filter((h, d, u) => t.filter(h, d, u, s))), t.itemSort && (a = a.sort((h, d) => t.itemSort(h, d, s))), N(a, (h) => {
      const d = Eo(t.callbacks, h);
      n.push(rt(d, "labelColor", this, h)), o.push(rt(d, "labelPointStyle", this, h)), r.push(rt(d, "labelTextColor", this, h));
    }), this.labelColors = n, this.labelPointStyles = o, this.labelTextColors = r, this.dataPoints = a, a;
  }
  update(t, e) {
    const s = this.options.setContext(this.getContext()), n = this._active;
    let o, r = [];
    if (!n.length)
      this.opacity !== 0 && (o = {
        opacity: 0
      });
    else {
      const a = De[s.position].call(this, n, this._eventPosition);
      r = this._createItems(s), this.title = this.getTitle(r, s), this.beforeBody = this.getBeforeBody(r, s), this.body = this.getBody(r, s), this.afterBody = this.getAfterBody(r, s), this.footer = this.getFooter(r, s);
      const l = this._size = xo(this, s), c = Object.assign({}, a, l), h = So(this.chart, s, c), d = wo(s, c, h, this.chart);
      this.xAlign = h.xAlign, this.yAlign = h.yAlign, o = {
        opacity: 1,
        x: d.x,
        y: d.y,
        width: l.width,
        height: l.height,
        caretX: a.x,
        caretY: a.y
      };
    }
    this._tooltipItems = r, this.$context = void 0, o && this._resolveAnimations().update(this, o), t && s.external && s.external.call(this, {
      chart: this.chart,
      tooltip: this,
      replay: e
    });
  }
  drawCaret(t, e, s, n) {
    const o = this.getCaretPosition(t, s, n);
    e.lineTo(o.x1, o.y1), e.lineTo(o.x2, o.y2), e.lineTo(o.x3, o.y3);
  }
  getCaretPosition(t, e, s) {
    const { xAlign: n, yAlign: o } = this, { caretSize: r, cornerRadius: a } = s, { topLeft: l, topRight: c, bottomLeft: h, bottomRight: d } = ie(a), { x: u, y: f } = t, { width: p, height: g } = e;
    let m, b, _, v, x, y;
    return o === "center" ? (x = f + g / 2, n === "left" ? (m = u, b = m - r, v = x + r, y = x - r) : (m = u + p, b = m + r, v = x - r, y = x + r), _ = m) : (n === "left" ? b = u + Math.max(l, h) + r : n === "right" ? b = u + p - Math.max(c, d) - r : b = this.caretX, o === "top" ? (v = f, x = v - r, m = b - r, _ = b + r) : (v = f + g, x = v + r, m = b + r, _ = b - r), y = v), {
      x1: m,
      x2: b,
      x3: _,
      y1: v,
      y2: x,
      y3: y
    };
  }
  drawTitle(t, e, s) {
    const n = this.title, o = n.length;
    let r, a, l;
    if (o) {
      const c = fe(s.rtl, this.x, this.width);
      for (t.x = di(this, s.titleAlign, s), e.textAlign = c.textAlign(s.titleAlign), e.textBaseline = "middle", r = X(s.titleFont), a = s.titleSpacing, e.fillStyle = s.titleColor, e.font = r.string, l = 0; l < o; ++l)
        e.fillText(n[l], c.x(t.x), t.y + r.lineHeight / 2), t.y += r.lineHeight + a, l + 1 === o && (t.y += s.titleMarginBottom - a);
    }
  }
  _drawColorBox(t, e, s, n, o) {
    const r = this.labelColors[s], a = this.labelPointStyles[s], { boxHeight: l, boxWidth: c } = o, h = X(o.bodyFont), d = di(this, "left", o), u = n.x(d), f = l < h.lineHeight ? (h.lineHeight - l) / 2 : 0, p = e.y + f;
    if (o.usePointStyle) {
      const g = {
        radius: Math.min(c, l) / 2,
        pointStyle: a.pointStyle,
        rotation: a.rotation,
        borderWidth: 1
      }, m = n.leftForLtr(u, c) + c / 2, b = p + l / 2;
      t.strokeStyle = o.multiKeyBackground, t.fillStyle = o.multiKeyBackground, ps(t, g, m, b), t.strokeStyle = r.borderColor, t.fillStyle = r.backgroundColor, ps(t, g, m, b);
    } else {
      t.lineWidth = L(r.borderWidth) ? Math.max(...Object.values(r.borderWidth)) : r.borderWidth || 1, t.strokeStyle = r.borderColor, t.setLineDash(r.borderDash || []), t.lineDashOffset = r.borderDashOffset || 0;
      const g = n.leftForLtr(u, c), m = n.leftForLtr(n.xPlus(u, 1), c - 2), b = ie(r.borderRadius);
      Object.values(b).some((_) => _ !== 0) ? (t.beginPath(), t.fillStyle = o.multiKeyBackground, je(t, {
        x: g,
        y: p,
        w: c,
        h: l,
        radius: b
      }), t.fill(), t.stroke(), t.fillStyle = r.backgroundColor, t.beginPath(), je(t, {
        x: m,
        y: p + 1,
        w: c - 2,
        h: l - 2,
        radius: b
      }), t.fill()) : (t.fillStyle = o.multiKeyBackground, t.fillRect(g, p, c, l), t.strokeRect(g, p, c, l), t.fillStyle = r.backgroundColor, t.fillRect(m, p + 1, c - 2, l - 2));
    }
    t.fillStyle = this.labelTextColors[s];
  }
  drawBody(t, e, s) {
    const { body: n } = this, { bodySpacing: o, bodyAlign: r, displayColors: a, boxHeight: l, boxWidth: c, boxPadding: h } = s, d = X(s.bodyFont);
    let u = d.lineHeight, f = 0;
    const p = fe(s.rtl, this.x, this.width), g = function(w) {
      e.fillText(w, p.x(t.x + f), t.y + u / 2), t.y += u + o;
    }, m = p.textAlign(r);
    let b, _, v, x, y, M, S;
    for (e.textAlign = r, e.textBaseline = "middle", e.font = d.string, t.x = di(this, m, s), e.fillStyle = s.bodyColor, N(this.beforeBody, g), f = a && m !== "right" ? r === "center" ? c / 2 + h : c + 2 + h : 0, x = 0, M = n.length; x < M; ++x) {
      for (b = n[x], _ = this.labelTextColors[x], e.fillStyle = _, N(b.before, g), v = b.lines, a && v.length && (this._drawColorBox(e, t, x, p, s), u = Math.max(d.lineHeight, l)), y = 0, S = v.length; y < S; ++y)
        g(v[y]), u = d.lineHeight;
      N(b.after, g);
    }
    f = 0, u = d.lineHeight, N(this.afterBody, g), t.y -= o;
  }
  drawFooter(t, e, s) {
    const n = this.footer, o = n.length;
    let r, a;
    if (o) {
      const l = fe(s.rtl, this.x, this.width);
      for (t.x = di(this, s.footerAlign, s), t.y += s.footerMarginTop, e.textAlign = l.textAlign(s.footerAlign), e.textBaseline = "middle", r = X(s.footerFont), e.fillStyle = s.footerColor, e.font = r.string, a = 0; a < o; ++a)
        e.fillText(n[a], l.x(t.x), t.y + r.lineHeight / 2), t.y += r.lineHeight + s.footerSpacing;
    }
  }
  drawBackground(t, e, s, n) {
    const { xAlign: o, yAlign: r } = this, { x: a, y: l } = t, { width: c, height: h } = s, { topLeft: d, topRight: u, bottomLeft: f, bottomRight: p } = ie(n.cornerRadius);
    e.fillStyle = n.backgroundColor, e.strokeStyle = n.borderColor, e.lineWidth = n.borderWidth, e.beginPath(), e.moveTo(a + d, l), r === "top" && this.drawCaret(t, e, s, n), e.lineTo(a + c - u, l), e.quadraticCurveTo(a + c, l, a + c, l + u), r === "center" && o === "right" && this.drawCaret(t, e, s, n), e.lineTo(a + c, l + h - p), e.quadraticCurveTo(a + c, l + h, a + c - p, l + h), r === "bottom" && this.drawCaret(t, e, s, n), e.lineTo(a + f, l + h), e.quadraticCurveTo(a, l + h, a, l + h - f), r === "center" && o === "left" && this.drawCaret(t, e, s, n), e.lineTo(a, l + d), e.quadraticCurveTo(a, l, a + d, l), e.closePath(), e.fill(), n.borderWidth > 0 && e.stroke();
  }
  _updateAnimationTarget(t) {
    const e = this.chart, s = this.$animations, n = s && s.x, o = s && s.y;
    if (n || o) {
      const r = De[t.position].call(this, this._active, this._eventPosition);
      if (!r)
        return;
      const a = this._size = xo(this, t), l = Object.assign({}, r, this._size), c = So(e, t, l), h = wo(t, l, c, e);
      (n._to !== h.x || o._to !== h.y) && (this.xAlign = c.xAlign, this.yAlign = c.yAlign, this.width = a.width, this.height = a.height, this.caretX = r.x, this.caretY = r.y, this._resolveAnimations().update(this, h));
    }
  }
  _willRender() {
    return !!this.opacity;
  }
  draw(t) {
    const e = this.options.setContext(this.getContext());
    let s = this.opacity;
    if (!s)
      return;
    this._updateAnimationTarget(e);
    const n = {
      width: this.width,
      height: this.height
    }, o = {
      x: this.x,
      y: this.y
    };
    s = Math.abs(s) < 1e-3 ? 0 : s;
    const r = nt(e.padding), a = this.title.length || this.beforeBody.length || this.body.length || this.afterBody.length || this.footer.length;
    e.enabled && a && (t.save(), t.globalAlpha = s, this.drawBackground(o, t, n, e), xr(t, e.textDirection), o.y += r.top, this.drawTitle(o, t, e), this.drawBody(o, t, e), this.drawFooter(o, t, e), Sr(t, e.textDirection), t.restore());
  }
  getActiveElements() {
    return this._active || [];
  }
  setActiveElements(t, e) {
    const s = this._active, n = t.map(({ datasetIndex: a, index: l }) => {
      const c = this.chart.getDatasetMeta(a);
      if (!c)
        throw new Error("Cannot find a dataset at index " + a);
      return {
        datasetIndex: a,
        element: c.data[l],
        index: l
      };
    }), o = !Mi(s, n), r = this._positionChanged(n, e);
    (o || r) && (this._active = n, this._eventPosition = e, this._ignoreReplayEvents = !0, this.update(!0));
  }
  handleEvent(t, e, s = !0) {
    if (e && this._ignoreReplayEvents)
      return !1;
    this._ignoreReplayEvents = !1;
    const n = this.options, o = this._active || [], r = this._getActiveElements(t, o, e, s), a = this._positionChanged(r, t), l = e || !Mi(r, o) || a;
    return l && (this._active = r, (n.enabled || n.external) && (this._eventPosition = {
      x: t.x,
      y: t.y
    }, this.update(!0, e))), l;
  }
  _getActiveElements(t, e, s, n) {
    const o = this.options;
    if (t.type === "mouseout")
      return [];
    if (!n)
      return e.filter((a) => this.chart.data.datasets[a.datasetIndex] && this.chart.getDatasetMeta(a.datasetIndex).controller.getParsed(a.index) !== void 0);
    const r = this.chart.getElementsAtEventForMode(t, o.mode, o, s);
    return o.reverse && r.reverse(), r;
  }
  _positionChanged(t, e) {
    const { caretX: s, caretY: n, options: o } = this, r = De[o.position].call(this, t, e);
    return r !== !1 && (s !== r.x || n !== r.y);
  }
}
E(xs, "positioners", De);
var df = {
  id: "tooltip",
  _element: xs,
  positioners: De,
  afterInit(i, t, e) {
    e && (i.tooltip = new xs({
      chart: i,
      options: e
    }));
  },
  beforeUpdate(i, t, e) {
    i.tooltip && i.tooltip.initialize(e);
  },
  reset(i, t, e) {
    i.tooltip && i.tooltip.initialize(e);
  },
  afterDraw(i) {
    const t = i.tooltip;
    if (t && t._willRender()) {
      const e = {
        tooltip: t
      };
      if (i.notifyPlugins("beforeTooltipDraw", {
        ...e,
        cancelable: !0
      }) === !1)
        return;
      t.draw(i.ctx), i.notifyPlugins("afterTooltipDraw", e);
    }
  },
  afterEvent(i, t) {
    if (i.tooltip) {
      const e = t.replay;
      i.tooltip.handleEvent(t.event, e, t.inChartArea) && (t.changed = !0);
    }
  },
  defaults: {
    enabled: !0,
    external: null,
    position: "average",
    backgroundColor: "rgba(0,0,0,0.8)",
    titleColor: "#fff",
    titleFont: {
      weight: "bold"
    },
    titleSpacing: 2,
    titleMarginBottom: 6,
    titleAlign: "left",
    bodyColor: "#fff",
    bodySpacing: 2,
    bodyFont: {},
    bodyAlign: "left",
    footerColor: "#fff",
    footerSpacing: 2,
    footerMarginTop: 6,
    footerFont: {
      weight: "bold"
    },
    footerAlign: "left",
    padding: 6,
    caretPadding: 2,
    caretSize: 5,
    cornerRadius: 6,
    boxHeight: (i, t) => t.bodyFont.size,
    boxWidth: (i, t) => t.bodyFont.size,
    multiKeyBackground: "#fff",
    displayColors: !0,
    boxPadding: 0,
    borderColor: "rgba(0,0,0,0)",
    borderWidth: 0,
    animation: {
      duration: 400,
      easing: "easeOutQuart"
    },
    animations: {
      numbers: {
        type: "number",
        properties: [
          "x",
          "y",
          "width",
          "height",
          "caretX",
          "caretY"
        ]
      },
      opacity: {
        easing: "linear",
        duration: 200
      }
    },
    callbacks: Xr
  },
  defaultRoutes: {
    bodyFont: "font",
    footerFont: "font",
    titleFont: "font"
  },
  descriptors: {
    _scriptable: (i) => i !== "filter" && i !== "itemSort" && i !== "external",
    _indexable: !1,
    callbacks: {
      _scriptable: !1,
      _indexable: !1
    },
    animation: {
      _fallback: !1
    },
    animations: {
      _fallback: "animation"
    }
  },
  additionalOptionScopes: [
    "interaction"
  ]
}, uf = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  Colors: wu,
  Decimation: Au,
  Filler: Uu,
  Legend: Zu,
  SubTitle: sf,
  Title: ef,
  Tooltip: df
});
const ff = (i, t, e, s) => (typeof t == "string" ? (e = i.push(t) - 1, s.unshift({
  index: e,
  label: t
})) : isNaN(t) && (e = null), e);
function pf(i, t, e, s) {
  const n = i.indexOf(t);
  if (n === -1)
    return ff(i, t, e, s);
  const o = i.lastIndexOf(t);
  return n !== o ? e : n;
}
const gf = (i, t) => i === null ? null : q(Math.round(i), 0, t);
function Co(i) {
  const t = this.getLabels();
  return i >= 0 && i < t.length ? t[i] : i;
}
class Ss extends re {
  constructor(t) {
    super(t), this._startValue = void 0, this._valueRange = 0, this._addedLabels = [];
  }
  init(t) {
    const e = this._addedLabels;
    if (e.length) {
      const s = this.getLabels();
      for (const { index: n, label: o } of e)
        s[n] === o && s.splice(n, 1);
      this._addedLabels = [];
    }
    super.init(t);
  }
  parse(t, e) {
    if (I(t))
      return null;
    const s = this.getLabels();
    return e = isFinite(e) && s[e] === t ? e : pf(s, t, k(e, t), this._addedLabels), gf(e, s.length - 1);
  }
  determineDataLimits() {
    const { minDefined: t, maxDefined: e } = this.getUserBounds();
    let { min: s, max: n } = this.getMinMax(!0);
    this.options.bounds === "ticks" && (t || (s = 0), e || (n = this.getLabels().length - 1)), this.min = s, this.max = n;
  }
  buildTicks() {
    const t = this.min, e = this.max, s = this.options.offset, n = [];
    let o = this.getLabels();
    o = t === 0 && e === o.length - 1 ? o : o.slice(t, e + 1), this._valueRange = Math.max(o.length - (s ? 0 : 1), 1), this._startValue = this.min - (s ? 0.5 : 0);
    for (let r = t; r <= e; r++)
      n.push({
        value: r
      });
    return n;
  }
  getLabelForValue(t) {
    return Co.call(this, t);
  }
  configure() {
    super.configure(), this.isHorizontal() || (this._reversePixels = !this._reversePixels);
  }
  getPixelForValue(t) {
    return typeof t != "number" && (t = this.parse(t)), t === null ? NaN : this.getPixelForDecimal((t - this._startValue) / this._valueRange);
  }
  getPixelForTick(t) {
    const e = this.ticks;
    return t < 0 || t > e.length - 1 ? null : this.getPixelForValue(e[t].value);
  }
  getValueForPixel(t) {
    return Math.round(this._startValue + this.getDecimalForPixel(t) * this._valueRange);
  }
  getBasePixel() {
    return this.bottom;
  }
}
E(Ss, "id", "category"), E(Ss, "defaults", {
  ticks: {
    callback: Co
  }
});
function mf(i, t) {
  const e = [], { bounds: n, step: o, min: r, max: a, precision: l, count: c, maxTicks: h, maxDigits: d, includeBounds: u } = i, f = o || 1, p = h - 1, { min: g, max: m } = t, b = !I(r), _ = !I(a), v = !I(c), x = (m - g) / (d + 1);
  let y = vn((m - g) / p / f) * f, M, S, w, C;
  if (y < 1e-14 && !b && !_)
    return [
      {
        value: g
      },
      {
        value: m
      }
    ];
  C = Math.ceil(m / y) - Math.floor(g / y), C > p && (y = vn(C * y / p / f) * f), I(l) || (M = Math.pow(10, l), y = Math.ceil(y * M) / M), n === "ticks" ? (S = Math.floor(g / y) * y, w = Math.ceil(m / y) * y) : (S = g, w = m), b && _ && o && ac((a - r) / o, y / 1e3) ? (C = Math.round(Math.min((a - r) / y, h)), y = (a - r) / C, S = r, w = a) : v ? (S = b ? r : S, w = _ ? a : w, C = c - 1, y = (w - S) / C) : (C = (w - S) / y, Re(C, Math.round(C), y / 1e3) ? C = Math.round(C) : C = Math.ceil(C));
  const D = Math.max(xn(y), xn(S));
  M = Math.pow(10, I(l) ? D : l), S = Math.round(S * M) / M, w = Math.round(w * M) / M;
  let O = 0;
  for (b && (u && S !== r ? (e.push({
    value: r
  }), S < r && O++, Re(Math.round((S + O * y) * M) / M, r, Ao(r, x, i)) && O++) : S < r && O++); O < C; ++O) {
    const T = Math.round((S + O * y) * M) / M;
    if (_ && T > a)
      break;
    e.push({
      value: T
    });
  }
  return _ && u && w !== a ? e.length && Re(e[e.length - 1].value, a, Ao(a, x, i)) ? e[e.length - 1].value = a : e.push({
    value: a
  }) : (!_ || w === a) && e.push({
    value: w
  }), e;
}
function Ao(i, t, { horizontal: e, minRotation: s }) {
  const n = pt(s), o = (e ? Math.sin(n) : Math.cos(n)) || 1e-3, r = 0.75 * t * ("" + i).length;
  return Math.min(t / o, r);
}
class Di extends re {
  constructor(t) {
    super(t), this.start = void 0, this.end = void 0, this._startValue = void 0, this._endValue = void 0, this._valueRange = 0;
  }
  parse(t, e) {
    return I(t) || (typeof t == "number" || t instanceof Number) && !isFinite(+t) ? null : +t;
  }
  handleTickRangeOptions() {
    const { beginAtZero: t } = this.options, { minDefined: e, maxDefined: s } = this.getUserBounds();
    let { min: n, max: o } = this;
    const r = (l) => n = e ? n : l, a = (l) => o = s ? o : l;
    if (t) {
      const l = St(n), c = St(o);
      l < 0 && c < 0 ? a(0) : l > 0 && c > 0 && r(0);
    }
    if (n === o) {
      let l = o === 0 ? 1 : Math.abs(o * 0.05);
      a(o + l), t || r(n - l);
    }
    this.min = n, this.max = o;
  }
  getTickLimit() {
    const t = this.options.ticks;
    let { maxTicksLimit: e, stepSize: s } = t, n;
    return s ? (n = Math.ceil(this.max / s) - Math.floor(this.min / s) + 1, n > 1e3 && (console.warn(`scales.${this.id}.ticks.stepSize: ${s} would result generating up to ${n} ticks. Limiting to 1000.`), n = 1e3)) : (n = this.computeTickLimit(), e = e || 11), e && (n = Math.min(e, n)), n;
  }
  computeTickLimit() {
    return Number.POSITIVE_INFINITY;
  }
  buildTicks() {
    const t = this.options, e = t.ticks;
    let s = this.getTickLimit();
    s = Math.max(2, s);
    const n = {
      maxTicks: s,
      bounds: t.bounds,
      min: t.min,
      max: t.max,
      precision: e.precision,
      step: e.stepSize,
      count: e.count,
      maxDigits: this._maxDigits(),
      horizontal: this.isHorizontal(),
      minRotation: e.minRotation || 0,
      includeBounds: e.includeBounds !== !1
    }, o = this._range || this, r = mf(n, o);
    return t.bounds === "ticks" && nr(r, this, "value"), t.reverse ? (r.reverse(), this.start = this.max, this.end = this.min) : (this.start = this.min, this.end = this.max), r;
  }
  configure() {
    const t = this.ticks;
    let e = this.min, s = this.max;
    if (super.configure(), this.options.offset && t.length) {
      const n = (s - e) / Math.max(t.length - 1, 1) / 2;
      e -= n, s += n;
    }
    this._startValue = e, this._endValue = s, this._valueRange = s - e;
  }
  getLabelForValue(t) {
    return qe(t, this.chart.options.locale, this.options.ticks.format);
  }
}
class ws extends Di {
  determineDataLimits() {
    const { min: t, max: e } = this.getMinMax(!0);
    this.min = $(t) ? t : 0, this.max = $(e) ? e : 1, this.handleTickRangeOptions();
  }
  computeTickLimit() {
    const t = this.isHorizontal(), e = t ? this.width : this.height, s = pt(this.options.ticks.minRotation), n = (t ? Math.sin(s) : Math.cos(s)) || 1e-3, o = this._resolveTickFontOptions(0);
    return Math.ceil(e / Math.min(40, o.lineHeight / n));
  }
  getPixelForValue(t) {
    return t === null ? NaN : this.getPixelForDecimal((t - this._startValue) / this._valueRange);
  }
  getValueForPixel(t) {
    return this._startValue + this.getDecimalForPixel(t) * this._valueRange;
  }
}
E(ws, "id", "linear"), E(ws, "defaults", {
  ticks: {
    callback: Ii.formatters.numeric
  }
});
const Ye = (i) => Math.floor(Nt(i)), Jt = (i, t) => Math.pow(10, Ye(i) + t);
function ko(i) {
  return i / Math.pow(10, Ye(i)) === 1;
}
function Oo(i, t, e) {
  const s = Math.pow(10, e), n = Math.floor(i / s);
  return Math.ceil(t / s) - n;
}
function bf(i, t) {
  const e = t - i;
  let s = Ye(e);
  for (; Oo(i, t, s) > 10; )
    s++;
  for (; Oo(i, t, s) < 10; )
    s--;
  return Math.min(s, Ye(i));
}
function _f(i, { min: t, max: e }) {
  t = ct(i.min, t);
  const s = [], n = Ye(t);
  let o = bf(t, e), r = o < 0 ? Math.pow(10, Math.abs(o)) : 1;
  const a = Math.pow(10, o), l = n > o ? Math.pow(10, n) : 0, c = Math.round((t - l) * r) / r, h = Math.floor((t - l) / a / 10) * a * 10;
  let d = Math.floor((c - h) / Math.pow(10, o)), u = ct(i.min, Math.round((l + h + d * Math.pow(10, o)) * r) / r);
  for (; u < e; )
    s.push({
      value: u,
      major: ko(u),
      significand: d
    }), d >= 10 ? d = d < 15 ? 15 : 20 : d++, d >= 20 && (o++, d = 2, r = o >= 0 ? 1 : r), u = Math.round((l + h + d * Math.pow(10, o)) * r) / r;
  const f = ct(i.max, u);
  return s.push({
    value: f,
    major: ko(f),
    significand: d
  }), s;
}
class Ms extends re {
  constructor(t) {
    super(t), this.start = void 0, this.end = void 0, this._startValue = void 0, this._valueRange = 0;
  }
  parse(t, e) {
    const s = Di.prototype.parse.apply(this, [
      t,
      e
    ]);
    if (s === 0) {
      this._zero = !0;
      return;
    }
    return $(s) && s > 0 ? s : null;
  }
  determineDataLimits() {
    const { min: t, max: e } = this.getMinMax(!0);
    this.min = $(t) ? Math.max(0, t) : null, this.max = $(e) ? Math.max(0, e) : null, this.options.beginAtZero && (this._zero = !0), this._zero && this.min !== this._suggestedMin && !$(this._userMin) && (this.min = t === Jt(this.min, 0) ? Jt(this.min, -1) : Jt(this.min, 0)), this.handleTickRangeOptions();
  }
  handleTickRangeOptions() {
    const { minDefined: t, maxDefined: e } = this.getUserBounds();
    let s = this.min, n = this.max;
    const o = (a) => s = t ? s : a, r = (a) => n = e ? n : a;
    s === n && (s <= 0 ? (o(1), r(10)) : (o(Jt(s, -1)), r(Jt(n, 1)))), s <= 0 && o(Jt(n, -1)), n <= 0 && r(Jt(s, 1)), this.min = s, this.max = n;
  }
  buildTicks() {
    const t = this.options, e = {
      min: this._userMin,
      max: this._userMax
    }, s = _f(e, this);
    return t.bounds === "ticks" && nr(s, this, "value"), t.reverse ? (s.reverse(), this.start = this.max, this.end = this.min) : (this.start = this.min, this.end = this.max), s;
  }
  getLabelForValue(t) {
    return t === void 0 ? "0" : qe(t, this.chart.options.locale, this.options.ticks.format);
  }
  configure() {
    const t = this.min;
    super.configure(), this._startValue = Nt(t), this._valueRange = Nt(this.max) - Nt(t);
  }
  getPixelForValue(t) {
    return (t === void 0 || t === 0) && (t = this.min), t === null || isNaN(t) ? NaN : this.getPixelForDecimal(t === this.min ? 0 : (Nt(t) - this._startValue) / this._valueRange);
  }
  getValueForPixel(t) {
    const e = this.getDecimalForPixel(t);
    return Math.pow(10, this._startValue + e * this._valueRange);
  }
}
E(Ms, "id", "logarithmic"), E(Ms, "defaults", {
  ticks: {
    callback: Ii.formatters.logarithmic,
    major: {
      enabled: !0
    }
  }
});
function Es(i) {
  const t = i.ticks;
  if (t.display && i.display) {
    const e = nt(t.backdropPadding);
    return k(t.font && t.font.size, j.font.size) + e.height;
  }
  return 0;
}
function yf(i, t, e) {
  return e = W(e) ? e : [
    e
  ], {
    w: Mc(i, t.string, e),
    h: e.length * t.lineHeight
  };
}
function Po(i, t, e, s, n) {
  return i === s || i === n ? {
    start: t - e / 2,
    end: t + e / 2
  } : i < s || i > n ? {
    start: t - e,
    end: t
  } : {
    start: t,
    end: t + e
  };
}
function vf(i) {
  const t = {
    l: i.left + i._padding.left,
    r: i.right - i._padding.right,
    t: i.top + i._padding.top,
    b: i.bottom - i._padding.bottom
  }, e = Object.assign({}, t), s = [], n = [], o = i._pointLabels.length, r = i.options.pointLabels, a = r.centerPointLabels ? F / o : 0;
  for (let l = 0; l < o; l++) {
    const c = r.setContext(i.getPointLabelContext(l));
    n[l] = c.padding;
    const h = i.getPointPosition(l, i.drawingArea + n[l], a), d = X(c.font), u = yf(i.ctx, d, i._pointLabels[l]);
    s[l] = u;
    const f = et(i.getIndexAngle(l) + a), p = Math.round(Rs(f)), g = Po(p, h.x, u.w, 0, 180), m = Po(p, h.y, u.h, 90, 270);
    xf(e, t, f, g, m);
  }
  i.setCenterPoint(t.l - e.l, e.r - t.r, t.t - e.t, e.b - t.b), i._pointLabelItems = Mf(i, s, n);
}
function xf(i, t, e, s, n) {
  const o = Math.abs(Math.sin(e)), r = Math.abs(Math.cos(e));
  let a = 0, l = 0;
  s.start < t.l ? (a = (t.l - s.start) / o, i.l = Math.min(i.l, t.l - a)) : s.end > t.r && (a = (s.end - t.r) / o, i.r = Math.max(i.r, t.r + a)), n.start < t.t ? (l = (t.t - n.start) / r, i.t = Math.min(i.t, t.t - l)) : n.end > t.b && (l = (n.end - t.b) / r, i.b = Math.max(i.b, t.b + l));
}
function Sf(i, t, e) {
  const s = i.drawingArea, { extra: n, additionalAngle: o, padding: r, size: a } = e, l = i.getPointPosition(t, s + n + r, o), c = Math.round(Rs(et(l.angle + U))), h = Af(l.y, a.h, c), d = Ef(c), u = Cf(l.x, a.w, d);
  return {
    visible: !0,
    x: l.x,
    y: h,
    textAlign: d,
    left: u,
    top: h,
    right: u + a.w,
    bottom: h + a.h
  };
}
function wf(i, t) {
  if (!t)
    return !0;
  const { left: e, top: s, right: n, bottom: o } = i;
  return !(Dt({
    x: e,
    y: s
  }, t) || Dt({
    x: e,
    y: o
  }, t) || Dt({
    x: n,
    y: s
  }, t) || Dt({
    x: n,
    y: o
  }, t));
}
function Mf(i, t, e) {
  const s = [], n = i._pointLabels.length, o = i.options, { centerPointLabels: r, display: a } = o.pointLabels, l = {
    extra: Es(o) / 2,
    additionalAngle: r ? F / n : 0
  };
  let c;
  for (let h = 0; h < n; h++) {
    l.padding = e[h], l.size = t[h];
    const d = Sf(i, h, l);
    s.push(d), a === "auto" && (d.visible = wf(d, c), d.visible && (c = d));
  }
  return s;
}
function Ef(i) {
  return i === 0 || i === 180 ? "center" : i < 180 ? "left" : "right";
}
function Cf(i, t, e) {
  return e === "right" ? i -= t : e === "center" && (i -= t / 2), i;
}
function Af(i, t, e) {
  return e === 90 || e === 270 ? i -= t / 2 : (e > 270 || e < 90) && (i -= t), i;
}
function kf(i, t, e) {
  const { left: s, top: n, right: o, bottom: r } = e, { backdropColor: a } = t;
  if (!I(a)) {
    const l = ie(t.borderRadius), c = nt(t.backdropPadding);
    i.fillStyle = a;
    const h = s - c.left, d = n - c.top, u = o - s + c.width, f = r - n + c.height;
    Object.values(l).some((p) => p !== 0) ? (i.beginPath(), je(i, {
      x: h,
      y: d,
      w: u,
      h: f,
      radius: l
    }), i.fill()) : i.fillRect(h, d, u, f);
  }
}
function Of(i, t) {
  const { ctx: e, options: { pointLabels: s } } = i;
  for (let n = t - 1; n >= 0; n--) {
    const o = i._pointLabelItems[n];
    if (!o.visible)
      continue;
    const r = s.setContext(i.getPointLabelContext(n));
    kf(e, r, o);
    const a = X(r.font), { x: l, y: c, textAlign: h } = o;
    oe(e, i._pointLabels[n], l, c + a.lineHeight / 2, a, {
      color: r.color,
      textAlign: h,
      textBaseline: "middle"
    });
  }
}
function Gr(i, t, e, s) {
  const { ctx: n } = i;
  if (e)
    n.arc(i.xCenter, i.yCenter, t, 0, V);
  else {
    let o = i.getPointPosition(0, t);
    n.moveTo(o.x, o.y);
    for (let r = 1; r < s; r++)
      o = i.getPointPosition(r, t), n.lineTo(o.x, o.y);
  }
}
function Pf(i, t, e, s, n) {
  const o = i.ctx, r = t.circular, { color: a, lineWidth: l } = t;
  !r && !s || !a || !l || e < 0 || (o.save(), o.strokeStyle = a, o.lineWidth = l, o.setLineDash(n.dash || []), o.lineDashOffset = n.dashOffset, o.beginPath(), Gr(i, e, r, s), o.closePath(), o.stroke(), o.restore());
}
function Df(i, t, e) {
  return Yt(i, {
    label: e,
    index: t,
    type: "pointLabel"
  });
}
class Te extends Di {
  constructor(t) {
    super(t), this.xCenter = void 0, this.yCenter = void 0, this.drawingArea = void 0, this._pointLabels = [], this._pointLabelItems = [];
  }
  setDimensions() {
    const t = this._padding = nt(Es(this.options) / 2), e = this.width = this.maxWidth - t.width, s = this.height = this.maxHeight - t.height;
    this.xCenter = Math.floor(this.left + e / 2 + t.left), this.yCenter = Math.floor(this.top + s / 2 + t.top), this.drawingArea = Math.floor(Math.min(e, s) / 2);
  }
  determineDataLimits() {
    const { min: t, max: e } = this.getMinMax(!1);
    this.min = $(t) && !isNaN(t) ? t : 0, this.max = $(e) && !isNaN(e) ? e : 0, this.handleTickRangeOptions();
  }
  computeTickLimit() {
    return Math.ceil(this.drawingArea / Es(this.options));
  }
  generateTickLabels(t) {
    Di.prototype.generateTickLabels.call(this, t), this._pointLabels = this.getLabels().map((e, s) => {
      const n = z(this.options.pointLabels.callback, [
        e,
        s
      ], this);
      return n || n === 0 ? n : "";
    }).filter((e, s) => this.chart.getDataVisibility(s));
  }
  fit() {
    const t = this.options;
    t.display && t.pointLabels.display ? vf(this) : this.setCenterPoint(0, 0, 0, 0);
  }
  setCenterPoint(t, e, s, n) {
    this.xCenter += Math.floor((t - e) / 2), this.yCenter += Math.floor((s - n) / 2), this.drawingArea -= Math.min(this.drawingArea / 2, Math.max(t, e, s, n));
  }
  getIndexAngle(t) {
    const e = V / (this._pointLabels.length || 1), s = this.options.startAngle || 0;
    return et(t * e + pt(s));
  }
  getDistanceFromCenterForValue(t) {
    if (I(t))
      return NaN;
    const e = this.drawingArea / (this.max - this.min);
    return this.options.reverse ? (this.max - t) * e : (t - this.min) * e;
  }
  getValueForDistanceFromCenter(t) {
    if (I(t))
      return NaN;
    const e = t / (this.drawingArea / (this.max - this.min));
    return this.options.reverse ? this.max - e : this.min + e;
  }
  getPointLabelContext(t) {
    const e = this._pointLabels || [];
    if (t >= 0 && t < e.length) {
      const s = e[t];
      return Df(this.getContext(), t, s);
    }
  }
  getPointPosition(t, e, s = 0) {
    const n = this.getIndexAngle(t) - U + s;
    return {
      x: Math.cos(n) * e + this.xCenter,
      y: Math.sin(n) * e + this.yCenter,
      angle: n
    };
  }
  getPointPositionForValue(t, e) {
    return this.getPointPosition(t, this.getDistanceFromCenterForValue(e));
  }
  getBasePosition(t) {
    return this.getPointPositionForValue(t || 0, this.getBaseValue());
  }
  getPointLabelPosition(t) {
    const { left: e, top: s, right: n, bottom: o } = this._pointLabelItems[t];
    return {
      left: e,
      top: s,
      right: n,
      bottom: o
    };
  }
  drawBackground() {
    const { backgroundColor: t, grid: { circular: e } } = this.options;
    if (t) {
      const s = this.ctx;
      s.save(), s.beginPath(), Gr(this, this.getDistanceFromCenterForValue(this._endValue), e, this._pointLabels.length), s.closePath(), s.fillStyle = t, s.fill(), s.restore();
    }
  }
  drawGrid() {
    const t = this.ctx, e = this.options, { angleLines: s, grid: n, border: o } = e, r = this._pointLabels.length;
    let a, l, c;
    if (e.pointLabels.display && Of(this, r), n.display && this.ticks.forEach((h, d) => {
      if (d !== 0 || d === 0 && this.min < 0) {
        l = this.getDistanceFromCenterForValue(h.value);
        const u = this.getContext(d), f = n.setContext(u), p = o.setContext(u);
        Pf(this, f, l, r, p);
      }
    }), s.display) {
      for (t.save(), a = r - 1; a >= 0; a--) {
        const h = s.setContext(this.getPointLabelContext(a)), { color: d, lineWidth: u } = h;
        !u || !d || (t.lineWidth = u, t.strokeStyle = d, t.setLineDash(h.borderDash), t.lineDashOffset = h.borderDashOffset, l = this.getDistanceFromCenterForValue(e.reverse ? this.min : this.max), c = this.getPointPosition(a, l), t.beginPath(), t.moveTo(this.xCenter, this.yCenter), t.lineTo(c.x, c.y), t.stroke());
      }
      t.restore();
    }
  }
  drawBorder() {
  }
  drawLabels() {
    const t = this.ctx, e = this.options, s = e.ticks;
    if (!s.display)
      return;
    const n = this.getIndexAngle(0);
    let o, r;
    t.save(), t.translate(this.xCenter, this.yCenter), t.rotate(n), t.textAlign = "center", t.textBaseline = "middle", this.ticks.forEach((a, l) => {
      if (l === 0 && this.min >= 0 && !e.reverse)
        return;
      const c = s.setContext(this.getContext(l)), h = X(c.font);
      if (o = this.getDistanceFromCenterForValue(this.ticks[l].value), c.showLabelBackdrop) {
        t.font = h.string, r = t.measureText(a.label).width, t.fillStyle = c.backdropColor;
        const d = nt(c.backdropPadding);
        t.fillRect(-r / 2 - d.left, -o - h.size / 2 - d.top, r + d.width, h.size + d.height);
      }
      oe(t, a.label, 0, -o, h, {
        color: c.color,
        strokeColor: c.textStrokeColor,
        strokeWidth: c.textStrokeWidth
      });
    }), t.restore();
  }
  drawTitle() {
  }
}
E(Te, "id", "radialLinear"), E(Te, "defaults", {
  display: !0,
  animate: !0,
  position: "chartArea",
  angleLines: {
    display: !0,
    lineWidth: 1,
    borderDash: [],
    borderDashOffset: 0
  },
  grid: {
    circular: !1
  },
  startAngle: 0,
  ticks: {
    showLabelBackdrop: !0,
    callback: Ii.formatters.numeric
  },
  pointLabels: {
    backdropColor: void 0,
    backdropPadding: 2,
    display: !0,
    font: {
      size: 10
    },
    callback(t) {
      return t;
    },
    padding: 5,
    centerPointLabels: !1
  }
}), E(Te, "defaultRoutes", {
  "angleLines.color": "borderColor",
  "pointLabels.color": "color",
  "ticks.color": "color"
}), E(Te, "descriptors", {
  angleLines: {
    _fallback: "grid"
  }
});
const zi = {
  millisecond: {
    common: !0,
    size: 1,
    steps: 1e3
  },
  second: {
    common: !0,
    size: 1e3,
    steps: 60
  },
  minute: {
    common: !0,
    size: 6e4,
    steps: 60
  },
  hour: {
    common: !0,
    size: 36e5,
    steps: 24
  },
  day: {
    common: !0,
    size: 864e5,
    steps: 30
  },
  week: {
    common: !1,
    size: 6048e5,
    steps: 4
  },
  month: {
    common: !0,
    size: 2628e6,
    steps: 12
  },
  quarter: {
    common: !1,
    size: 7884e6,
    steps: 4
  },
  year: {
    common: !0,
    size: 3154e7
  }
}, lt = /* @__PURE__ */ Object.keys(zi);
function Do(i, t) {
  return i - t;
}
function To(i, t) {
  if (I(t))
    return null;
  const e = i._adapter, { parser: s, round: n, isoWeekday: o } = i._parseOpts;
  let r = t;
  return typeof s == "function" && (r = s(r)), $(r) || (r = typeof s == "string" ? e.parse(r, s) : e.parse(r)), r === null ? null : (n && (r = n === "week" && (pe(o) || o === !0) ? e.startOf(r, "isoWeek", o) : e.startOf(r, n)), +r);
}
function Io(i, t, e, s) {
  const n = lt.length;
  for (let o = lt.indexOf(i); o < n - 1; ++o) {
    const r = zi[lt[o]], a = r.steps ? r.steps : Number.MAX_SAFE_INTEGER;
    if (r.common && Math.ceil((e - t) / (a * r.size)) <= s)
      return lt[o];
  }
  return lt[n - 1];
}
function Tf(i, t, e, s, n) {
  for (let o = lt.length - 1; o >= lt.indexOf(e); o--) {
    const r = lt[o];
    if (zi[r].common && i._adapter.diff(n, s, r) >= t - 1)
      return r;
  }
  return lt[e ? lt.indexOf(e) : 0];
}
function If(i) {
  for (let t = lt.indexOf(i) + 1, e = lt.length; t < e; ++t)
    if (zi[lt[t]].common)
      return lt[t];
}
function Lo(i, t, e) {
  if (!e)
    i[t] = !0;
  else if (e.length) {
    const { lo: s, hi: n } = Fs(e, t), o = e[s] >= t ? e[s] : e[n];
    i[o] = !0;
  }
}
function Lf(i, t, e, s) {
  const n = i._adapter, o = +n.startOf(t[0].value, s), r = t[t.length - 1].value;
  let a, l;
  for (a = o; a <= r; a = +n.add(a, 1, s))
    l = e[a], l >= 0 && (t[l].major = !0);
  return t;
}
function Ro(i, t, e) {
  const s = [], n = {}, o = t.length;
  let r, a;
  for (r = 0; r < o; ++r)
    a = t[r], n[a] = r, s.push({
      value: a,
      major: !1
    });
  return o === 0 || !e ? s : Lf(i, s, n, e);
}
class Ke extends re {
  constructor(t) {
    super(t), this._cache = {
      data: [],
      labels: [],
      all: []
    }, this._unit = "day", this._majorUnit = void 0, this._offsets = {}, this._normalized = !1, this._parseOpts = void 0;
  }
  init(t, e = {}) {
    const s = t.time || (t.time = {}), n = this._adapter = new Vh._date(t.adapters.date);
    n.init(e), Le(s.displayFormats, n.formats()), this._parseOpts = {
      parser: s.parser,
      round: s.round,
      isoWeekday: s.isoWeekday
    }, super.init(t), this._normalized = e.normalized;
  }
  parse(t, e) {
    return t === void 0 ? null : To(this, t);
  }
  beforeLayout() {
    super.beforeLayout(), this._cache = {
      data: [],
      labels: [],
      all: []
    };
  }
  determineDataLimits() {
    const t = this.options, e = this._adapter, s = t.time.unit || "day";
    let { min: n, max: o, minDefined: r, maxDefined: a } = this.getUserBounds();
    function l(c) {
      !r && !isNaN(c.min) && (n = Math.min(n, c.min)), !a && !isNaN(c.max) && (o = Math.max(o, c.max));
    }
    (!r || !a) && (l(this._getLabelBounds()), (t.bounds !== "ticks" || t.ticks.source !== "labels") && l(this.getMinMax(!1))), n = $(n) && !isNaN(n) ? n : +e.startOf(Date.now(), s), o = $(o) && !isNaN(o) ? o : +e.endOf(Date.now(), s) + 1, this.min = Math.min(n, o - 1), this.max = Math.max(n + 1, o);
  }
  _getLabelBounds() {
    const t = this.getLabelTimestamps();
    let e = Number.POSITIVE_INFINITY, s = Number.NEGATIVE_INFINITY;
    return t.length && (e = t[0], s = t[t.length - 1]), {
      min: e,
      max: s
    };
  }
  buildTicks() {
    const t = this.options, e = t.time, s = t.ticks, n = s.source === "labels" ? this.getLabelTimestamps() : this._generate();
    t.bounds === "ticks" && n.length && (this.min = this._userMin || n[0], this.max = this._userMax || n[n.length - 1]);
    const o = this.min, r = this.max, a = dc(n, o, r);
    return this._unit = e.unit || (s.autoSkip ? Io(e.minUnit, this.min, this.max, this._getLabelCapacity(o)) : Tf(this, a.length, e.minUnit, this.min, this.max)), this._majorUnit = !s.major.enabled || this._unit === "year" ? void 0 : If(this._unit), this.initOffsets(n), t.reverse && a.reverse(), Ro(this, a, this._majorUnit);
  }
  afterAutoSkip() {
    this.options.offsetAfterAutoskip && this.initOffsets(this.ticks.map((t) => +t.value));
  }
  initOffsets(t = []) {
    let e = 0, s = 0, n, o;
    this.options.offset && t.length && (n = this.getDecimalForValue(t[0]), t.length === 1 ? e = 1 - n : e = (this.getDecimalForValue(t[1]) - n) / 2, o = this.getDecimalForValue(t[t.length - 1]), t.length === 1 ? s = o : s = (o - this.getDecimalForValue(t[t.length - 2])) / 2);
    const r = t.length < 3 ? 0.5 : 0.25;
    e = q(e, 0, r), s = q(s, 0, r), this._offsets = {
      start: e,
      end: s,
      factor: 1 / (e + 1 + s)
    };
  }
  _generate() {
    const t = this._adapter, e = this.min, s = this.max, n = this.options, o = n.time, r = o.unit || Io(o.minUnit, e, s, this._getLabelCapacity(e)), a = k(n.ticks.stepSize, 1), l = r === "week" ? o.isoWeekday : !1, c = pe(l) || l === !0, h = {};
    let d = e, u, f;
    if (c && (d = +t.startOf(d, "isoWeek", l)), d = +t.startOf(d, c ? "day" : r), t.diff(s, e, r) > 1e5 * a)
      throw new Error(e + " and " + s + " are too far apart with stepSize of " + a + " " + r);
    const p = n.ticks.source === "data" && this.getDataTimestamps();
    for (u = d, f = 0; u < s; u = +t.add(u, a, r), f++)
      Lo(h, u, p);
    return (u === s || n.bounds === "ticks" || f === 1) && Lo(h, u, p), Object.keys(h).sort(Do).map((g) => +g);
  }
  getLabelForValue(t) {
    const e = this._adapter, s = this.options.time;
    return s.tooltipFormat ? e.format(t, s.tooltipFormat) : e.format(t, s.displayFormats.datetime);
  }
  format(t, e) {
    const n = this.options.time.displayFormats, o = this._unit, r = e || n[o];
    return this._adapter.format(t, r);
  }
  _tickFormatFunction(t, e, s, n) {
    const o = this.options, r = o.ticks.callback;
    if (r)
      return z(r, [
        t,
        e,
        s
      ], this);
    const a = o.time.displayFormats, l = this._unit, c = this._majorUnit, h = l && a[l], d = c && a[c], u = s[e], f = c && d && u && u.major;
    return this._adapter.format(t, n || (f ? d : h));
  }
  generateTickLabels(t) {
    let e, s, n;
    for (e = 0, s = t.length; e < s; ++e)
      n = t[e], n.label = this._tickFormatFunction(n.value, e, t);
  }
  getDecimalForValue(t) {
    return t === null ? NaN : (t - this.min) / (this.max - this.min);
  }
  getPixelForValue(t) {
    const e = this._offsets, s = this.getDecimalForValue(t);
    return this.getPixelForDecimal((e.start + s) * e.factor);
  }
  getValueForPixel(t) {
    const e = this._offsets, s = this.getDecimalForPixel(t) / e.factor - e.end;
    return this.min + s * (this.max - this.min);
  }
  _getLabelSize(t) {
    const e = this.options.ticks, s = this.ctx.measureText(t).width, n = pt(this.isHorizontal() ? e.maxRotation : e.minRotation), o = Math.cos(n), r = Math.sin(n), a = this._resolveTickFontOptions(0).size;
    return {
      w: s * o + a * r,
      h: s * r + a * o
    };
  }
  _getLabelCapacity(t) {
    const e = this.options.time, s = e.displayFormats, n = s[e.unit] || s.millisecond, o = this._tickFormatFunction(t, 0, Ro(this, [
      t
    ], this._majorUnit), n), r = this._getLabelSize(o), a = Math.floor(this.isHorizontal() ? this.width / r.w : this.height / r.h) - 1;
    return a > 0 ? a : 1;
  }
  getDataTimestamps() {
    let t = this._cache.data || [], e, s;
    if (t.length)
      return t;
    const n = this.getMatchingVisibleMetas();
    if (this._normalized && n.length)
      return this._cache.data = n[0].controller.getAllParsedValues(this);
    for (e = 0, s = n.length; e < s; ++e)
      t = t.concat(n[e].controller.getAllParsedValues(this));
    return this._cache.data = this.normalize(t);
  }
  getLabelTimestamps() {
    const t = this._cache.labels || [];
    let e, s;
    if (t.length)
      return t;
    const n = this.getLabels();
    for (e = 0, s = n.length; e < s; ++e)
      t.push(To(this, n[e]));
    return this._cache.labels = this._normalized ? t : this.normalize(t);
  }
  normalize(t) {
    return ar(t.sort(Do));
  }
}
E(Ke, "id", "time"), E(Ke, "defaults", {
  bounds: "data",
  adapters: {},
  time: {
    parser: !1,
    unit: !1,
    round: !1,
    isoWeekday: !1,
    minUnit: "millisecond",
    displayFormats: {}
  },
  ticks: {
    source: "auto",
    callback: !1,
    major: {
      enabled: !1
    }
  }
});
function ui(i, t, e) {
  let s = 0, n = i.length - 1, o, r, a, l;
  e ? (t >= i[s].pos && t <= i[n].pos && ({ lo: s, hi: n } = Pt(i, "pos", t)), { pos: o, time: a } = i[s], { pos: r, time: l } = i[n]) : (t >= i[s].time && t <= i[n].time && ({ lo: s, hi: n } = Pt(i, "time", t)), { time: o, pos: a } = i[s], { time: r, pos: l } = i[n]);
  const c = r - o;
  return c ? a + (l - a) * (t - o) / c : a;
}
class Cs extends Ke {
  constructor(t) {
    super(t), this._table = [], this._minPos = void 0, this._tableRange = void 0;
  }
  initOffsets() {
    const t = this._getTimestampsForTable(), e = this._table = this.buildLookupTable(t);
    this._minPos = ui(e, this.min), this._tableRange = ui(e, this.max) - this._minPos, super.initOffsets(t);
  }
  buildLookupTable(t) {
    const { min: e, max: s } = this, n = [], o = [];
    let r, a, l, c, h;
    for (r = 0, a = t.length; r < a; ++r)
      c = t[r], c >= e && c <= s && n.push(c);
    if (n.length < 2)
      return [
        {
          time: e,
          pos: 0
        },
        {
          time: s,
          pos: 1
        }
      ];
    for (r = 0, a = n.length; r < a; ++r)
      h = n[r + 1], l = n[r - 1], c = n[r], Math.round((h + l) / 2) !== c && o.push({
        time: c,
        pos: r / (a - 1)
      });
    return o;
  }
  _generate() {
    const t = this.min, e = this.max;
    let s = super.getDataTimestamps();
    return (!s.includes(t) || !s.length) && s.splice(0, 0, t), (!s.includes(e) || s.length === 1) && s.push(e), s.sort((n, o) => n - o);
  }
  _getTimestampsForTable() {
    let t = this._cache.all || [];
    if (t.length)
      return t;
    const e = this.getDataTimestamps(), s = this.getLabelTimestamps();
    return e.length && s.length ? t = this.normalize(e.concat(s)) : t = e.length ? e : s, t = this._cache.all = t, t;
  }
  getDecimalForValue(t) {
    return (ui(this._table, t) - this._minPos) / this._tableRange;
  }
  getValueForPixel(t) {
    const e = this._offsets, s = this.getDecimalForPixel(t) / e.factor - e.end;
    return ui(this._table, s * this._tableRange + this._minPos, !0);
  }
}
E(Cs, "id", "timeseries"), E(Cs, "defaults", Ke.defaults);
var Rf = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  CategoryScale: Ss,
  LinearScale: ws,
  LogarithmicScale: Ms,
  RadialLinearScale: Te,
  TimeScale: Ke,
  TimeSeriesScale: Cs
});
const Ff = [
  Hh,
  mu,
  uf,
  Rf
];
kt.register(...Ff);
const Ue = (i, t = document) => t.querySelector(i), It = (i, t = document) => Array.from(t.querySelectorAll(i)), st = Ue(".tx_find"), As = "tx_find_find";
function Fo(i, t, e) {
  const [s, n = ""] = i.split("#"), [o, r = ""] = s.split("?"), a = new URLSearchParams(r);
  a.set(t, e);
  const l = a.toString().replace(/\+/g, "%20");
  return `${o}?${l}${n ? "#" + n : ""}`;
}
function No(i, t) {
  const [e, s = ""] = i.split("#"), [n, o = ""] = e.split("?"), r = new URLSearchParams(o);
  r.delete(t);
  const a = r.toString();
  return `${n}${a ? "?" + a : ""}${s ? "#" + s : ""}`;
}
function Nf(i) {
  var t;
  (t = history.pushState) == null || t.call(history, null, "", i);
}
function ks(i, t) {
  if (!st) return;
  const e = `${As}[${i}]`;
  let s = No(location.href, e);
  t !== void 0 && (s = Fo(s, e, String(t))), Nf(s), It("a:not(.no-change)", st).forEach((n) => {
    n.href = t !== void 0 ? Fo(n.href, e, String(t)) : No(n.href, e);
  }), It(`input.${e}`, st).forEach((n) => {
    n.name = t !== void 0 ? e : "";
  });
}
function Bf() {
  st && It("input[autocompleteURL]", st).forEach((i) => {
    i.addEventListener("input", async () => {
      const t = i.value.trim().toLowerCase();
      if (!t) return;
      const e = i.getAttribute("autocompleteURL");
      if (!e) return;
      const s = e.replace("%25%25%25%25", encodeURIComponent(t)), n = await fetch(s).then((o) => o.json()).catch(() => []);
      i.awesomplete || (i.awesomplete = new sa(i)), i.awesomplete.list = n;
    });
  });
}
function zf() {
  st && It(".facetSearch", st).forEach((i) => {
    new Al(i, {
      searchEnabled: !0,
      shouldSort: !1
    }), i.addEventListener("change", () => {
      var s;
      const t = i.value, e = st.querySelector(`li[value='${t}']`);
      (s = e == null ? void 0 : e.querySelector("a")) == null || s.click();
    });
  });
}
function Hf(i) {
  if (!st) return;
  const t = Ue(".searchForm", st);
  if (!t) return;
  const e = i.target, s = t.classList.contains("search-extended"), n = e.getAttribute("extendedstring") ?? "", o = e.getAttribute("simplestring") ?? "";
  s ? (e.textContent = o, It(".field-mode-extended", t).forEach((r) => {
    r.style.display = "none";
  }), ks("extended")) : (e.textContent = n, It(".field-mode-extended", t).forEach((r) => {
    r.style.display = "";
  }), ks("extended", 1)), t.classList.toggle("search-simple"), t.classList.toggle("search-extended"), i.preventDefault();
}
function Vf() {
  st && It(".facetHistogram-container .histogram", st).forEach((i) => {
    const t = i.dataset.facetConfig;
    if (!t) return;
    const e = JSON.parse(t), { data: s, barWidth: n } = e, o = Object.keys(s).map(Number).sort((l, c) => l - c), r = o.map((l) => s[l]), a = document.createElement("canvas");
    i.appendChild(a), new kt(a, {
      type: "bar",
      data: {
        labels: o,
        datasets: [
          {
            label: "Histogram",
            data: r,
            backgroundColor: "#8884d8"
          }
        ]
      },
      options: {
        responsive: !0,
        plugins: {
          legend: { display: !1 }
        },
        scales: {
          x: { title: { display: !0, text: "Value" } },
          y: { title: { display: !0, text: "Hits" }, beginAtZero: !0 }
        },
        onClick: (l, c) => {
          if (c.length === 0) return;
          const h = c[0].index, d = o[h], u = `RANGE ${d} TO ${d + n - 1}`, f = i.dataset.link;
          f && (location.href = f.replace(
            "%25%25%25%25",
            encodeURIComponent(u)
          ));
        }
      }
    });
  });
}
document.addEventListener("DOMContentLoaded", () => {
  st && (Bf(), zf(), Vf(), It("a.extendedSearch", st).forEach(
    (i) => i.addEventListener("click", Hf)
  ));
});
function Bo(i) {
  return i.style.display === "none" || getComputedStyle(i).display === "none";
}
function Wf(i) {
  const e = i.target.closest("ol");
  if (!e) return;
  const s = Ue(".facetShowAll", e), n = Ue(".facetHideHidden", e);
  It(".hidden", e).forEach((o) => {
    o.style.display = Bo(o) ? "" : "none";
  }), s && n && (Bo(s) ? (s.style.display = "", n.style.display = "none") : (s.style.display = "none", n.style.display = "")), i.preventDefault();
}
function qr(i, t) {
  const e = document.createElement("input");
  return e.name = i, e.value = t, e.type = "hidden", e;
}
function Jr(i, t) {
  return Object.entries(t).flatMap(
    ([e, s]) => s !== null && typeof s == "object" ? Jr(`${i}[${e}]`, s) : [qr(`${i}[${e}]`, String(s))]
  );
}
function jf() {
  const i = document.querySelector("[data-underlying-query]"), t = i == null ? void 0 : i.dataset.underlyingQuery;
  if (t)
    try {
      const e = JSON.parse(t);
      if (typeof e == "object" && e !== null && !Array.isArray(e))
        return e;
    } catch {
      console.warn("find: could not parse the data-underlying-query attribute");
    }
  return window.underlyingQuery;
}
function $f(i, t) {
  const e = jf();
  if (e) {
    const s = i.closest("li"), n = s == null ? void 0 : s.closest("ol");
    e.position = t ?? (n && s ? Number(n.getAttribute("start") ?? 0) + Array.from(n.children).indexOf(s) : void 0);
    const o = document.createElement("form"), r = i.getAttribute("href");
    return r ? (o.action = r, o.method = "POST", o.style.display = "none", document.body.appendChild(o), Jr(
      `${As}[underlyingQuery]`,
      e
    ).forEach((a) => o.appendChild(a)), st && Ue(".searchForm.search-extended", st) && o.appendChild(
      qr(`${As}[extended]`, "1")
    ), o.submit(), !1) : !0;
  }
  return !0;
}
const Uf = {
  showAllFacetsOfType: Wf,
  changeURLParameterForPage: ks,
  detailViewWithPaging: $f
};
export {
  Fo as addURLParameter,
  Uf as default,
  $f as detailViewWithPaging,
  jf as getUnderlyingQuery,
  qr as inputWithNameAndValue,
  Jr as inputsWithPrefixForObject,
  No as removeURLParameter,
  Wf as showAllFacetsOfType
};
