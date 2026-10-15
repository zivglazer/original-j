(function () {
  const data = window.CATALOG;
  const page = document.body.dataset.page;

  // A new page always opens at its top. The back button keeps its place.
  // scrollIntoView also brings the top into view when the site is shown inside another page's frame.
  const navEntry = performance.getEntriesByType && performance.getEntriesByType("navigation")[0];
  if (!location.hash && !(navEntry && navEntry.type === "back_forward")) {
    const toTop = () => {
      scrollTo(0, 0);
      try { document.documentElement.scrollIntoView(true); } catch (e) {}
    };
    toTop();
    requestAnimationFrame(toTop);
    addEventListener("load", toTop, { once: true });
  }
  const METALS = [
    { id: "silver", label: "כסף 925", swatch: "#c9ccd0" },
    { id: "gold", label: "זהב 14K", swatch: "#c9a24a" }
  ];

  // Discounts and photo lists set from the admin page (js/shop.js).
  const SHOP = window.SHOP || {};
  data.categories.forEach((c) => c.items.forEach((it) => {
    const list = (SHOP.photos || {})[it.code];
    if (Array.isArray(list) && list.length) it.photos = list;
  }));
  const pctOff = (code) => Number((SHOP.discounts || {})[code]) || 0;
  const isNum = (v) => /^\d+(\.\d+)?$/.test(String(v || "").trim());
  // The price after the piece's own discount, rounded to whole shekels.
  const withOff = (code, v) => (pctOff(code) && isNum(v) ? String(Math.round(Number(v) * (100 - pctOff(code)) / 100)) : v);


  const waLink = (text) =>
    `https://wa.me/${data.contact.whatsapp}?text=${encodeURIComponent(text)}`;

  // Frame image with a visible fallback while the real photo is missing.
  function frameImage(src, alt, eager) {
    const wrap = document.createElement("div");
    wrap.className = "frame-img";
    const img = new Image();
    img.alt = alt;
    img.decoding = "async";
    if (!eager) img.loading = "lazy";
    img.addEventListener("error", () => {
      wrap.classList.add("is-missing");
      wrap.innerHTML = `<span class="missing-note"><span>תמונה בדרך</span><code>${src}</code></span>`;
    });
    img.src = src;
    wrap.appendChild(img);
    return wrap;
  }

  // Swap any static <img data-fallback> for the same missing-photo treatment.
  document.querySelectorAll("img[data-fallback]").forEach((img) => {
    const fail = () => {
      const box = img.closest(".frame-img");
      if (!box) return;
      box.classList.add("is-missing");
      box.innerHTML = `<span class="missing-note"><span>${img.dataset.fallback}</span><code>${img.getAttribute("src")}</code></span>`;
    };
    if (img.complete && img.naturalWidth === 0) fail();
    else img.addEventListener("error", fail);
  });

  document.querySelectorAll("[data-wa]").forEach((a) => {
    a.href = waLink(a.dataset.wa || "שלום, אשמח לשמוע על התכשיטים");
  });
  document.querySelectorAll("[data-ig]").forEach((a) => {
    a.href = `https://www.instagram.com/${data.contact.instagram}/`;
  });

  // ---------- Cart: kept in this browser, sent as an order over WhatsApp ----------
  const CART_KEY = "original_j_cart";
  const readCart = () => { try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch (e) { return []; } };
  let cart = readCart();
  const saveCart = () => { try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) {} renderCart(); };

  const drawer = document.createElement("dialog");
  drawer.className = "cart";
  drawer.setAttribute("aria-labelledby", "cart-title");
  drawer.innerHTML = `
    <div class="cart-head">
      <h2 id="cart-title">סל הקניות</h2>
      <button class="dialog-close" type="button" aria-label="סגירה" data-cart-close>×</button>
    </div>
    <ul class="cart-list"></ul>
    <p class="cart-empty">הסל ריק. אפשר להוסיף תכשיט מכל קטגוריה.</p>
    <div class="cart-foot">
      <p class="cart-discount" hidden></p>
      <p class="cart-total"></p>
      <a class="ask cart-send" target="_blank" rel="noopener">שליחת ההזמנה בוואטסאפ</a>
      <p class="cart-note">ההזמנה נשלחת בוואטסאפ, ומשם מתאמים תשלום ומשלוח.</p>
    </div>`;
  document.body.appendChild(drawer);
  drawer.addEventListener("click", (e) => { if (e.target === drawer) drawer.close(); });
  drawer.querySelector("[data-cart-close]").addEventListener("click", () => drawer.close());
  document.querySelectorAll("[data-cart-open]").forEach((b) => b.addEventListener("click", () => drawer.showModal()));

  const priceOf = (code, variant) => {
    const P = window.PRICES || {};
    return ((variant && P[`${code}_${variant}`]) || P[code] || "").trim();
  };
  const priceNum = (v) => (/^[\d.,]+$/.test(v) ? parseFloat(v.replace(/,/g, "")) : null);

  // One of a Kind pieces exist in a single copy, so their quantity stays 1.
  const oneOff = (code) => ((data.categories.find((c) => c.id === "unique") || { items: [] }).items).some((it) => it.code === code);

  function renderCart() {
    const count = cart.reduce((n, it) => n + it.qty, 0);
    document.querySelectorAll("[data-cart-count]").forEach((el) => { el.textContent = count; el.hidden = count === 0; });
    const list = drawer.querySelector(".cart-list");
    list.replaceChildren();
    cart.forEach((it, i) => {
      const price = withOff(it.code, it.price || priceOf(it.code, it.variant));
      const li = document.createElement("li");
      li.className = "cart-item";
      li.innerHTML = `
        <img src="${it.img}" alt="">
        <div class="cart-info">
          <span class="cart-name">${it.title}</span>
          <span class="cart-picks">${it.picks || ""}</span>
          <span class="cart-price">${price ? (priceNum(price) !== null ? `${price} ₪${it.qty > 1 ? ` · יחד ${priceNum(price) * it.qty} ₪` : ""}` : price) : "מחיר: ___"}</span>
          ${oneOff(it.code) ? "" : `<span class="cart-qty" role="group" aria-label="כמות">
            <button type="button" class="qty-btn" data-step="1" aria-label="להוסיף אחד">+</button>
            <span class="qty-num" aria-live="polite">${it.qty}</span>
            <button type="button" class="qty-btn" data-step="-1" aria-label="להוריד אחד" ${it.qty <= 1 ? "disabled" : ""}>−</button>
          </span>`}
        </div>
        <button class="cart-remove" type="button">הסרה</button>`;
      li.querySelector(".cart-remove").addEventListener("click", () => { cart.splice(i, 1); saveCart(); });
      li.querySelectorAll(".qty-btn").forEach((btn) => btn.addEventListener("click", () => {
        it.qty = Math.max(1, it.qty + Number(btn.dataset.step));
        saveCart();
      }));
      list.appendChild(li);
    });
    drawer.querySelector(".cart-empty").hidden = cart.length > 0;
    drawer.querySelector(".cart-foot").hidden = cart.length === 0;
    const nums = cart.map((it) => priceNum(withOff(it.code, it.price || priceOf(it.code, it.variant))));
    const subtotal = cart.length && nums.every((n) => n !== null) ? nums.reduce((sum, n, i) => sum + n * cart[i].qty, 0) : null;

    // Set discounts: each complete set (one of every code) takes `off`% off those pieces.
    const discounts = [];
    (window.SETS || []).forEach((set) => {
      const units = set.codes.map((code) => cart.flatMap((it, i) => (it.code === code && nums[i] !== null ? Array(it.qty).fill(nums[i]) : [])));
      const pairs = Math.min(...units.map((u) => u.length));
      if (!pairs) return;
      const amount = Math.round(units.reduce((sum, u) => sum + u.slice(0, pairs).reduce((a, b) => a + b, 0), 0) * set.off / 100);
      if (amount) discounts.push({ label: `הנחת ${set.name} (${set.off}%)${pairs > 1 ? ` ×${pairs}` : ""}`, amount });
    });
    const total = subtotal !== null ? subtotal - discounts.reduce((s, d) => s + d.amount, 0) : null;
    const discountText = discounts.map((d) => `${d.label}: −${d.amount} ₪`);
    drawer.querySelector(".cart-discount").textContent = discountText.join(" · ");
    drawer.querySelector(".cart-discount").hidden = !discounts.length;
    drawer.querySelector(".cart-total").textContent = total !== null ? `סה״כ: ${total} ₪` : "";
    const lines = cart.map((it) => `• ${it.title} (${it.code})${it.picks ? `, ${it.picks}` : ""}${it.qty > 1 ? ` ×${it.qty}` : ""}`);
    const extra = [...discountText, ...(total !== null && discounts.length ? [`סה״כ: ${total} ₪`] : [])];
    drawer.querySelector(".cart-send").href = waLink(`שלום, אשמח להזמין:\n${[...lines, ...extra].join("\n")}`);
  }
  window.addToCart = (entry) => {
    const same = cart.find((it) => it.code === entry.code && it.picks === entry.picks);
    if (same) { if (!oneOff(entry.code)) same.qty += 1; } else cart.push({ ...entry, qty: 1 });
    saveCart();
  };
  renderCart();

  // Amounts with their own price (the gift card) can be edited in prices.js, e.g. GIFT_200.
  data.categories.forEach((c) => c.items.forEach((it) => it.options.forEach((o) => {
    const v = ((window.PRICES || {})[`${it.code}_${o.id}`] || "").trim();
    if ("price" in o && v) o.price = v;
  })));

  if (page === "home") renderHome();
  else if (page) renderCategory(page);

  function renderHome() {
    const tiles = document.getElementById("sheet");
    if (!tiles) return;
    data.categories.forEach((cat, i) => {
      const a = document.createElement("a");
      a.className = `tile tile-${cat.id}`;
      a.href = cat.page;
      a.style.setProperty("--i", i);
      const num = String(i + 1).padStart(2, "0");
      let img;
      if (cat.cover) img = frameImage(cat.cover, "", i < 2);
      else {
        img = document.createElement("div");
        img.className = "frame-img is-empty";
        a.classList.add("tile-empty");
      }
      img.style.viewTransitionName = `cover-${cat.id}`;
      a.appendChild(img);
      a.insertAdjacentHTML(
        "beforeend",
        `<span class="tile-num">${num}</span>
         <span class="tile-title" lang="en" dir="ltr">${cat.titleEn || cat.title}<svg class="pencil" viewBox="0 0 200 80" aria-hidden="true"><path d="M12 44c6-26 70-36 120-30 40 5 64 18 56 34-9 18-74 26-120 20C30 63 6 56 14 38c4-8 14-14 26-18"/></svg></span>`
      );
      tiles.appendChild(a);
    });
  }

  function priceFor(code, variant) {
    const P = window.PRICES || {};
    return ((variant && P[`${code}_${variant}`]) || P[code] || "").trim();
  }

  function priceText(code, variant, fixed) {
    const v = fixed || priceFor(code, variant);
    if (!v) return `מחיר: <span class="price-empty">___</span>`;
    if (pctOff(code) && isNum(v)) {
      return `מחיר: <s class="price-was">${v} ₪</s> <span class="price-value">${withOff(code, v)} ₪</span> <span class="price-off">${pctOff(code)}% הנחה</span>`;
    }
    return `מחיר: <span class="price-value">${/^[\d.,]+$/.test(v) ? `${v} ₪` : v}</span>`;
  }

  // The first photo of a piece for one version (metal), when the admin page set its photo list.
  function photoFor(item, id) {
    const list = item.photos || [];
    return (item.single ? list[0] : list.find((p) => !p.metal || p.metal === id)) || null;
  }

  // Each piece shows once per metal: silver next to gold.
  function variantsOf(item, cat) {
    const list = baseVariants(item, cat);
    if (item.photos) list.forEach((v) => { const p = photoFor(item, v.id); if (p) v.img = p.img; });
    return list;
  }

  function baseVariants(item, cat) {
    if (item.metalIncluded) return item.options.map((o) => ({ ...o }));
    if (item.single) {
      const img = (item.extras.find((x) => x.first) || item.options.find((o) => o.img) || item.extras[0] || {}).img;
      return [{ id: "one", label: item.singleLabel || "", img }];
    }
    const own = item.options.filter((o) => o.id === "silver" || o.id === "gold");
    const anyImg = (item.extras.find((x) => x.first) || item.options.find((o) => o.img) || item.extras[0] || {}).img;
    const allowed = item.metals || (cat && cat.metals);
    const metals = allowed ? METALS.filter((m) => allowed.includes(m.id)) : METALS;
    return metals.map((m) => {
      const o = own.find((x) => x.id === m.id);
      const img = (o && o.img) || (own.find((x) => x.img) || {}).img || anyImg;
      return { ...m, img, borrowed: !(o && o.img) };
    });
  }

  function renderCategory(id) {
    const cat = data.categories.find((c) => c.id === id);
    const list = document.getElementById("pieces");
    if (!cat || !list) return;

    if (!cat.items.length) {
      list.className = "soon";
      list.innerHTML = `<p>${cat.soon || "בקרוב"}</p>`;
      return;
    }

    // A grid of thumbnails; each opens the full piece view in a dialog.
    list.className = "thumbs";
    const dialog = document.createElement("dialog");
    dialog.className = "piece-dialog";
    dialog.innerHTML = `<button class="dialog-close" type="button" aria-label="סגירה">×</button><div class="dialog-body"></div>`;
    document.body.appendChild(dialog);
    const body = dialog.querySelector(".dialog-body");

    const open = (item, idx, variant) => {
      body.replaceChildren(renderPiece(cat, item, idx, variant));
      if (!dialog.open) dialog.showModal();
      dispatchEvent(new Event("resize"));
      body.scrollTop = 0;
      try { history.replaceState(null, "", `#${item.code}-${variant}`); } catch (e) {}
      // Count each opened piece as its own page in the visit stats.
      if (window.goatcounter && window.goatcounter.count) {
        window.goatcounter.count({ path: `${location.pathname}#${item.code}-${variant}`, title: `${cat.title}: ${(window.NAMES || {})[item.code] || item.code}` });
      }
    };
    const close = () => dialog.close();
    dialog.querySelector(".dialog-close").addEventListener("click", close);
    dialog.addEventListener("click", (e) => { if (e.target === dialog) close(); });
    dialog.addEventListener("close", () => {
      try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {}
    });

    let n = 0;
    // Sold pieces always go last; everything still for sale stays on top, in catalog order.
    const isSoldItem = (it) => (window.SOLD || []).includes(it.code);
    const ordered = cat.items.map((item, idx) => ({ item, idx }));
    ordered.sort((a, b) => isSoldItem(a.item) - isSoldItem(b.item) || a.idx - b.idx);
    ordered.forEach(({ item, idx }) => {
      const given = ((window.NAMES || {})[item.code] || "").trim();
      const noun = item.noun || cat.noun;
      const name = given || `${noun} ${item.code}`;
      variantsOf(item, cat).forEach((v) => {
        const a = document.createElement("a");
        a.className = "thumb";
        a.href = `#${item.code}-${v.id}`;
        a.style.setProperty("--i", n);
        a.appendChild(frameImage(v.img, `${name}, ${v.label}`, n < 6));
        a.insertAdjacentHTML("beforeend", `
          <span class="thumb-name">${name}</span>
          <span class="thumb-metal">${v.label}</span>
          ${item.note ? `<span class="thumb-note">${item.note}</span>` : ""}
          ${(window.SOLD || []).includes(item.code) ? `<span class="sold-out">נמכר</span>` : (window.SOLD_OUT || []).includes(item.code) ? `<span class="sold-out">נגמר במלאי</span>` : ""}
          ${(window.SOLD || []).includes(item.code) ? "" : `<span class="thumb-price">${item.options.length && item.options.every((o) => o.price) ? `${[...new Set(item.options.map((o) => withOff(item.code, o.price)))].join(" / ")} ₪` : priceText(item.code, v.id)}</span>`}`);
        a.addEventListener("click", (e) => { e.preventDefault(); open(item, idx, v.id); });
        list.appendChild(a);
        n += 1;
      });
    });

    const m = location.hash.match(/^#([A-Za-z0-9]+)-([a-z-]+)$/);
    if (m) {
      const at = cat.items.findIndex((it) => it.code === m[1]);
      if (at >= 0) open(cat.items[at], at, m[2]);
    }
  }

  function renderPiece(cat, item, idx, variant) {
    const section = document.createElement("section");
    section.className = "piece";
    section.style.setProperty("--i", idx);
    const headingId = `piece-${item.code}`;
    section.setAttribute("aria-labelledby", headingId);

    const noun = item.noun || cat.noun;
    const given = ((window.NAMES || {})[item.code] || "").trim();
    const v = variantsOf(item, cat).find((x) => x.id === variant) || variantsOf(item, cat)[0];
    const title = given || `${noun} ${item.code}`;

    // This view is one version of the piece (one metal). Thread colour stays a choice.
    const groups = [];
    if (item.metalIncluded) {
      groups.push({ label: cat.choiceLabel, options: [v] });
    } else if (item.single && item.options.some((o) => o.id === "silver" || o.id === "gold")) {
      // One piece offered in both metals: the metal is a choice inside the piece.
      groups.push({ label: "חומר", options: item.options });
    } else {
      const others = item.options.filter((o) => o.id !== "silver" && o.id !== "gold");
      if (others.length) groups.push({ label: cat.choiceLabel, options: others });
      if (!item.single) groups.push({ label: "חומר", options: [v] });
    }
    if (item.cords) {
      // A cord instead of the metal chain costs cordDiscount less than the chain.
      const base = priceFor(item.code, v.id);
      const less = /^\d+$/.test(base) ? String(Number(base) - (item.cordDiscount || 0)) : "";
      groups.push({ label: "שרשרת או חוט", options: [
        { id: "chain", label: `שרשרת ${v.id === "gold" ? "זהב" : "כסף"}`, price: base },
        ...item.cords.map((c) => ({ ...c, id: `cord-${c.id}`, label: `חוט ${c.label}`, price: less, goto: "cords" }))
      ] });
    }
    if (item.sizes) {
      const unit = item.sizeUnit ? ` ${item.sizeUnit}` : "";
      groups.push({ label: "מידה", options: item.sizes.map((n, i) => ({ id: `size-${i}`, label: `${n}${unit}`, pick: `מידה ${n}${unit}` })) });
    }
    const allOptions = groups.flatMap((g) => g.options);

    const frames = [];
    if (item.photos) {
      // Photo list from the admin page: a photo shows for every version, or only for its own metal or option.
      item.photos
        .filter((p) => !p.metal || p.metal === v.id || allOptions.some((o) => o.id === p.metal))
        .forEach((p) => frames.push({ img: p.img, label: p.label || "", id: p.id || p.metal || undefined, kind: p.metal && p.metal !== v.id ? "option" : "extra" }));
    } else {
      item.extras.filter((x) => x.first).forEach((x) => frames.push({ ...x, kind: "extra" }));
      allOptions.filter((o) => o.img).forEach((o) => frames.push({ ...o, kind: "option" }));
      item.extras.filter((x) => !x.first && (!x.metal || x.metal === v.id)).forEach((x) => frames.push({ ...x, kind: "extra" }));
    }
    // Never show the same photo twice in one gallery.
    for (let i = frames.length - 1; i >= 0; i--) {
      if (frames.findIndex((f) => f.img === frames[i].img) !== i) frames.splice(i, 1);
    }

    section.innerHTML = `
      <header class="piece-head">
        <h2 id="${headingId}">${given ? given : `<span class="piece-noun">${noun}</span> ${item.code}`}${given ? "" : `<span class="name-empty">שם: ___</span>`}<span class="piece-metal">${v.label}</span></h2>
        <span class="piece-count" aria-live="polite"><span class="now">1</span> / ${frames.length}</span>
      </header>
      <div class="strip-wrap">
        <button class="strip-btn prev" type="button" aria-label="תמונה קודמת">→</button>
        <div class="strip" tabindex="0" aria-label="תמונות של ${title}"></div>
        <button class="strip-btn next" type="button" aria-label="תמונה הבאה">←</button>
      </div>
      <div class="choices"></div>
      ${item.note ? `<p class="piece-note">${item.note}</p>` : ""}
      <p class="price"${(window.SOLD || []).includes(item.code) ? "hidden" : ""}>${item.options[0] && item.options[0].price ? priceText(item.code, "", item.options[0].price) : priceText(item.code, v.id)}</p>
      <div class="piece-actions">
        <button class="add-cart" type="button">הוספה לסל</button>
        <a class="ask ask-ghost" target="_blank" rel="noopener">לשאול על ה${noun} בוואטסאפ</a>
      </div>
    `;

    const strip = section.querySelector(".strip");
    frames.forEach((f, n) => {
      const fig = document.createElement("figure");
      fig.className = "frame";
      fig.dataset.kind = f.kind;
      if (f.id) fig.dataset.id = f.id;
      const code = `${item.code}-${String(n + 1).padStart(2, "0")}`;
      fig.innerHTML = `<span class="edge edge-top"><span>${code}</span><span>${f.kind === "option" ? f.label : ""}</span></span>`;
      fig.appendChild(frameImage(f.img, `${title}, ${f.label}`, idx === 0 && n === 0));
      fig.insertAdjacentHTML("beforeend", `<figcaption class="edge edge-bottom"><span>${f.label}</span><span>${n + 1}/${frames.length}</span></figcaption>`);
      strip.appendChild(fig);
    });

    const choices = section.querySelector(".choices");
    groups.forEach((g, gi) => {
      const fs = document.createElement("fieldset");
      fs.className = "choice";
      fs.innerHTML = `<legend>${g.label}</legend><div class="choice-row"></div>`;
      const row = fs.querySelector(".choice-row");
      g.options.forEach((o, n) => {
        const label = document.createElement("label");
        label.className = "stamp";
        label.innerHTML = `
          <input type="radio" name="choice-${item.code}-${gi}" value="${o.id}" ${n === 0 ? "checked" : ""}>
          ${o.swatch ? `<span class="swatch" style="--sw:${o.swatch}"></span>` : ""}
          <span class="stamp-text">${o.label}</span>
          <svg class="pencil" viewBox="0 0 200 80" aria-hidden="true"><path d="M12 44c6-26 70-36 120-30 40 5 64 18 56 34-9 18-74 26-120 20C30 63 6 56 14 38c4-8 14-14 26-18"/></svg>`;
        row.appendChild(label);
      });
      g.el = fs;
      choices.appendChild(fs);
    });

    const ask = section.querySelector(".ask");
    const now = section.querySelector(".now");
    const figs = [...strip.children];

    const selected = (g) => {
      const input = g.el.querySelector("input:checked");
      return input && g.options.find((o) => o.id === input.value);
    };
    const updateAsk = () => {
      const picks = groups.map((g) => selected(g)).filter(Boolean).map((o) => o.pick || o.label).join(", ");
      ask.href = waLink(`שלום, אשמח לפרטים על ${title} (${item.code}, ${cat.title})${picks ? `, ${picks}` : ""}`);
    };
    updateAsk();

    const addBtn = section.querySelector(".add-cart");
    const isSold = (window.SOLD || []).includes(item.code);
    if (isSold || (window.SOLD_OUT || []).includes(item.code)) {
      addBtn.disabled = true;
      addBtn.textContent = isSold ? "נמכר" : "נגמר במלאי";
    }
    addBtn.addEventListener("click", () => {
      const picks = groups.map((g) => selected(g)).filter(Boolean).map((o) => o.pick || o.label).join(", ");
      const shown = figs[active] ? figs[active].querySelector("img") : null;
      const priced = groups.map((g) => selected(g)).find((o) => o && o.price);
      window.addToCart({ code: item.code, variant: v.id, title, picks, price: priced ? priced.price : "", img: shown ? shown.getAttribute("src") : "" });
      addBtn.textContent = "נוסף לסל ✓";
      setTimeout(() => { addBtn.textContent = "הוספה לסל"; }, 1800);
    });

    const goTo = (fig) => {
      if (!fig) return;
      const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
      fig.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "nearest", inline: "start" });
    };

    groups.forEach((g) => {
      g.el.addEventListener("change", () => {
        const o = selected(g);
        if (o.price) section.querySelector(".price").innerHTML = priceText(item.code, "", o.price);
        const target = o.goto || (o.img ? o.id : null);
        if (target) goTo(figs.find((f) => f.dataset.id === target));
        updateAsk();
      });
    });

    let active = 0;
    const setActive = (n) => {
      active = n;
      now.textContent = n + 1;
      figs.forEach((f, i) => f.classList.toggle("is-active", i === n));
      const id = figs[n].dataset.id;
      if (!id) return;
      groups.forEach((g) => {
        const input = g.el.querySelector(`input[value="${id}"]`);
        if (input && !input.checked) {
          input.checked = true;
          updateAsk();
        }
      });
    };
    // The active frame is the one closest to the strip's reading start (the right edge in RTL).
    const measure = () => {
      const s = strip.getBoundingClientRect();
      const pad = parseFloat(getComputedStyle(strip).paddingInlineStart) || 0;
      const edge = s.right - pad;
      let best = 0, bestD = Infinity;
      figs.forEach((f, i) => {
        const d = Math.abs(f.getBoundingClientRect().right - edge);
        if (d < bestD) { bestD = d; best = i; }
      });
      if (best !== active || !figs[best].classList.contains("is-active")) setActive(best);
    };
    let raf = 0;
    strip.addEventListener("scroll", () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    }, { passive: true });
    setActive(0);
    const wrap = section.querySelector(".strip-wrap");
    const fit = () => wrap.classList.toggle("fits", strip.scrollWidth <= strip.clientWidth + 2);
    fit();
    addEventListener("resize", fit);
    strip.querySelectorAll("img").forEach((i) => i.addEventListener("load", fit));

    section.querySelector(".prev").addEventListener("click", () => goTo(figs[Math.max(0, active - 1)]));
    section.querySelector(".next").addEventListener("click", () => goTo(figs[Math.min(figs.length - 1, active + 1)]));
    strip.addEventListener("keydown", (e) => {
      // RTL: the left arrow moves forward.
      if (e.key === "ArrowLeft") { e.preventDefault(); goTo(figs[Math.min(figs.length - 1, active + 1)]); }
      if (e.key === "ArrowRight") { e.preventDefault(); goTo(figs[Math.max(0, active - 1)]); }
    });

    return section;
  }

  // Visit stats (GoatCounter, dashboard at original.goatcounter.com): counted only on the live site.
  if (location.hostname === "zivglazer.github.io") {
    const gc = document.createElement("script");
    gc.async = true;
    gc.src = "https://gc.zgo.at/count.js";
    gc.dataset.goatcounter = "https://original.goatcounter.com/count";
    document.body.appendChild(gc);
  }
})();
