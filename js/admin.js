/*
  דף ניהול: עורך מחירים, שמות, מלאי, הנחות ותמונות, ושומר ישירות לאתר ב-GitHub.
  המפתח של GitHub נשמר מוצפן בדפדפן (בסיסמה שבחרת) ולא נשלח לשום מקום חוץ מ-GitHub.
*/
(function () {
  const OWNER = "zivglazer";
  const REPO = "original-j";
  const API = "https://api.github.com";
  const params = new URLSearchParams(location.search);
  const BRANCH = params.get("branch") || "main";
  const STORE = "original_j_admin";
  const DATA = { prices: "js/prices.js", names: "js/names.js", stock: "js/stock.js", shop: "js/shop.js" };
  const PAGES = ["index.html", "earrings.html", "rings.html", "bracelets.html", "necklaces.html", "om.html", "men.html", "gift-card.html", "one-of-a-kind.html"];
  const $ = (s) => document.querySelector(s);

  let token = null;
  let demo = false;
  let base = null;      // what was loaded: { head, texts }
  let st = null;        // the editable state
  const uploads = new Map(); // repo path -> { b64, url }

  // ---------- Status line ----------
  const status = (msg, err) => { const el = $("#status"); el.textContent = msg || ""; el.classList.toggle("err", !!err); };

  // ---------- Token, encrypted with the password (WebCrypto) ----------
  const enc = new TextEncoder();
  const toB64 = (buf) => { const b = new Uint8Array(buf); let s = ""; for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000)); return btoa(s); };
  const fromB64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
  async function keyFrom(pass, salt) {
    const raw = await crypto.subtle.importKey("raw", enc.encode(pass), "PBKDF2", false, ["deriveKey"]);
    return crypto.subtle.deriveKey({ name: "PBKDF2", salt, iterations: 250000, hash: "SHA-256" }, raw, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
  }
  async function lockToken(tok, pass) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const data = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await keyFrom(pass, salt), enc.encode(tok));
    localStorage.setItem(STORE, JSON.stringify({ salt: toB64(salt), iv: toB64(iv), data: toB64(data) }));
  }
  async function unlockToken(pass) {
    const saved = JSON.parse(localStorage.getItem(STORE) || "null");
    if (!saved) return null;
    const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: fromB64(saved.iv) }, await keyFrom(pass, fromB64(saved.salt)), fromB64(saved.data));
    return new TextDecoder().decode(plain);
  }
  const hasSaved = () => { try { return !!localStorage.getItem(STORE); } catch (e) { return false; } };

  // ---------- GitHub ----------
  async function gh(path, opts = {}) {
    const res = await fetch(`${API}/repos/${OWNER}/${REPO}${path}`, {
      ...opts,
      cache: "no-store",
      headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", ...(opts.headers || {}) }
    });
    if (!res.ok) {
      const e = new Error(`GitHub ${res.status}`);
      e.status = res.status;
      throw e;
    }
    return res;
  }
  const ghJson = async (path, body, method = "POST") => (await gh(path, { method, body: JSON.stringify(body), headers: { "Content-Type": "application/json" } })).json();
  async function readText(path, ref) {
    if (demo) {
      const res = await fetch(`${path}?t=${Date.now()}`, { cache: "no-store" });
      if (!res.ok) { const e = new Error(`${res.status}`); e.status = res.status; throw e; }
      return res.text();
    }
    const res = await gh(`/contents/${path}?ref=${encodeURIComponent(ref || BRANCH)}`, { headers: { Accept: "application/vnd.github.raw+json" } });
    return res.text();
  }
  async function headSha() {
    const ref = await (await gh(`/git/ref/heads/${encodeURIComponent(BRANCH)}`)).json();
    return ref.object.sha;
  }

  // ---------- Load ----------
  const evalData = (texts) => { const w = {}; texts.forEach((t) => new Function("window", t)(w)); return w; };

  async function load() {
    status("טוען...");
    const head = demo ? "demo" : await headSha();
    const ref = demo ? null : head;
    const names = ["js/catalog.js", DATA.prices, DATA.names, DATA.stock, DATA.shop];
    const texts = {};
    await Promise.all(names.map(async (p) => {
      try { texts[p] = await readText(p, ref); }
      catch (e) { if (p === DATA.shop && e.status === 404) texts[p] = ""; else throw e; }
    }));
    const w = evalData(names.map((p) => texts[p]));
    base = { head, texts };
    st = {
      catalog: w.CATALOG,
      prices: { ...(w.PRICES || {}) },
      sets: JSON.parse(JSON.stringify(w.SETS || [])),
      names: { ...(w.NAMES || {}) },
      soldOut: new Set(w.SOLD_OUT || []),
      sold: new Set(w.SOLD || []),
      discounts: { ...((w.SHOP || {}).discounts || {}) },
      photos: JSON.parse(JSON.stringify((w.SHOP || {}).photos || {}))
    };
    st.items = uniqueItems(st.catalog);
    st.items.forEach((e) => { e.photos = st.photos[e.item.code] ? st.photos[e.item.code].map((p) => ({ ...p })) : derivePhotos(e.item); e.startPhotos = JSON.stringify(e.photos); });
    render();
    status(demo ? "מצב הצצה" : "");
  }

  // One entry per code, in site order; a piece that shows in two categories is listed once.
  function uniqueItems(catalog) {
    const seen = new Map();
    catalog.categories.forEach((cat) => cat.items.forEach((item) => {
      if (!item) return;
      if (seen.has(item.code)) seen.get(item.code).cats.push(cat);
      else seen.set(item.code, { item, cat, cats: [cat] });
    }));
    return [...seen.values()];
  }

  // The gallery as the site builds it today, as one ordered list.
  function derivePhotos(item) {
    const out = [];
    const add = (img, metal, label, id) => {
      if (!img || out.some((p) => p.img === img && (p.metal || "") === (metal || ""))) return;
      const p = { img };
      if (metal) p.metal = metal;
      if (label) p.label = label;
      if (id && id !== metal) p.id = id;
      out.push(p);
    };
    (item.extras || []).filter((x) => x.first).forEach((x) => add(x.img, x.metal, x.label, x.id));
    (item.options || []).filter((o) => o.img).forEach((o) => add(o.img, o.id, o.label));
    (item.extras || []).filter((x) => !x.first).forEach((x) => add(x.img, x.metal, x.label, x.id));
    return out;
  }

  // ---------- Helpers ----------
  const METAL_LABEL = { silver: "כסף", gold: "זהב" };
  function metalsOf(entry) {
    const { item, cat } = entry;
    if (item.metalIncluded || item.single) return null;
    const allowed = item.metals || cat.metals || ["silver", "gold"];
    return ["silver", "gold"].filter((m) => allowed.includes(m));
  }
  function priceKeys(entry) {
    const code = entry.item.code;
    const keys = Object.keys(st.prices).filter((k) => k === code || k.startsWith(`${code}_`));
    if (keys.length) return keys;
    const metals = metalsOf(entry);
    if (entry.item.single && entry.item.options.some((o) => o.id === "silver" || o.id === "gold")) return [`${code}_silver`, `${code}_gold`];
    return metals ? metals.map((m) => `${code}_${m}`) : [code];
  }
  const keyLabel = (key, code) => {
    const s = key.slice(code.length + 1);
    if (!s) return "מחיר";
    return METAL_LABEL[s] ? `מחיר ${METAL_LABEL[s]}` : `מחיר ${s}`;
  };
  function tagsOf(entry) {
    const tags = [["", "לכל הסוגים"]];
    const metals = metalsOf(entry);
    if (metals) metals.forEach((m) => tags.push([m, METAL_LABEL[m]]));
    (entry.item.options || []).forEach((o) => { if (!tags.some((t) => t[0] === o.id) && (o.img || METAL_LABEL[o.id] || entry.item.single)) tags.push([o.id, METAL_LABEL[o.id] || o.label]); });
    return tags;
  }
  const nameOf = (entry) => (st.names[entry.item.code] || "").trim() || `${entry.item.noun || entry.cat.noun || ""} ${entry.item.code}`.trim();
  const stockOf = (code) => (st.sold.has(code) ? "sold" : st.soldOut.has(code) ? "out" : "in");
  const imgUrl = (p) => (uploads.get(p.img) || {}).url || p.img;
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  // ---------- Render ----------
  function render() {
    $("#setup").hidden = true;
    $("#login").hidden = true;
    $("#editor").hidden = false;
    $("#save").hidden = false;
    $("#mode-note").textContent = demo
      ? "מצב הצצה: אפשר לנסות הכל, אבל השמירה לא תפרסם כלום."
      : `מחובר${BRANCH !== "main" ? ` (ענף בדיקה: ${BRANCH})` : ""}. שינויים נשמרים לאתר רק בלחיצה על "שמירה ופרסום".`;
    const wrap = $("#cats");
    wrap.replaceChildren();
    const byCat = new Map();
    st.items.forEach((e) => { if (!byCat.has(e.cat)) byCat.set(e.cat, []); byCat.get(e.cat).push(e); });
    byCat.forEach((list, cat) => {
      const sec = document.createElement("section");
      sec.className = "adm-cat";
      sec.innerHTML = `<h2>${esc(cat.title)}</h2>`;
      list.forEach((e) => sec.appendChild(itemCard(e)));
      wrap.appendChild(sec);
    });
    renderSets();
    refreshDirty();
  }

  function summaryHtml(e) {
    const code = e.item.code;
    const s = stockOf(code);
    const first = e.photos[0];
    const chips = [
      s === "out" ? `<span class="chip out">נגמר במלאי</span>` : "",
      s === "sold" ? `<span class="chip sold">נמכר</span>` : "",
      Number(st.discounts[code]) ? `<span class="chip off">${Number(st.discounts[code])}%</span>` : ""
    ].join("");
    const prices = priceKeys(e).map((k) => st.prices[k]).filter(Boolean).join(" / ");
    return `${first ? `<img class="adm-thumb" src="${esc(imgUrl(first))}" alt="">` : `<span class="adm-thumb"></span>`}
      <span class="adm-sum"><b>${esc(nameOf(e))}</b><span>${esc(code)}${prices ? ` · ${esc(prices)} ₪` : ""}${e.cats.length > 1 ? ` · מופיע גם ב${esc(e.cats.slice(1).map((c) => c.title).join(", "))}` : ""}</span></span>${chips}`;
  }

  function itemCard(e) {
    const code = e.item.code;
    const d = document.createElement("details");
    d.className = "adm-item";
    d.dataset.search = `${code} ${nameOf(e)}`.toLowerCase();
    const sum = document.createElement("summary");
    sum.innerHTML = summaryHtml(e);
    d.appendChild(sum);
    const f = document.createElement("div");
    f.className = "adm-fields";
    const keys = priceKeys(e);
    f.innerHTML = `
      <label>שם<input data-k="name" value="${esc(st.names[code] || "")}" placeholder="${esc(nameOf(e))}"></label>
      <div class="adm-row">${keys.map((k) => `<label>${esc(keyLabel(k, code))} (₪)<input data-price="${esc(k)}" inputmode="numeric" value="${esc(st.prices[k] || "")}"></label>`).join("")}</div>
      ${e.item.cords ? `<p class="adm-note">עם חוט במקום שרשרת: ${e.item.cordDiscount || 0} ₪ פחות, מחושב לבד.</p>` : ""}
      <div class="adm-row">
        <label>מלאי<select data-k="stock">
          <option value="in">במלאי</option>
          <option value="out">נגמר במלאי</option>
          <option value="sold">נמכר</option>
        </select></label>
        <label>הנחה (%)<input data-k="off" inputmode="numeric" value="${esc(st.discounts[code] || "")}" placeholder="אין"></label>
      </div>
      <p class="adm-sub">תמונות (הראשונה היא התמונה בריבוע)</p>
      <div class="adm-photos"></div>
      <label class="adm-add">+ הוספת תמונות<input type="file" accept="image/*" multiple></label>`;
    d.appendChild(f);
    f.querySelector('[data-k="stock"]').value = stockOf(code);

    const refreshSum = () => { sum.innerHTML = summaryHtml(e); d.dataset.search = `${code} ${nameOf(e)}`.toLowerCase(); refreshDirty(); };
    f.querySelector('[data-k="name"]').addEventListener("input", (ev) => { st.names[code] = ev.target.value; refreshSum(); });
    f.querySelectorAll("[data-price]").forEach((inp) => inp.addEventListener("input", () => { st.prices[inp.dataset.price] = inp.value.trim(); refreshSum(); }));
    f.querySelector('[data-k="stock"]').addEventListener("change", (ev) => {
      st.soldOut.delete(code); st.sold.delete(code);
      if (ev.target.value === "out") st.soldOut.add(code);
      if (ev.target.value === "sold") st.sold.add(code);
      refreshSum();
    });
    f.querySelector('[data-k="off"]').addEventListener("input", (ev) => {
      const n = Math.max(0, Math.min(90, Math.round(Number(ev.target.value.replace(/[^\d.]/g, "")) || 0)));
      if (n) st.discounts[code] = n; else delete st.discounts[code];
      refreshSum();
    });

    const box = f.querySelector(".adm-photos");
    const tags = tagsOf(e);
    const drawPhotos = () => {
      box.replaceChildren();
      e.photos.forEach((p, i) => {
        const row = document.createElement("div");
        row.className = "adm-photo";
        row.innerHTML = `
          <img src="${esc(imgUrl(p))}" alt="" loading="lazy">
          <div>
            <select aria-label="לאיזה סוג">${tags.map(([v, l]) => `<option value="${esc(v)}">${esc(l)}</option>`).join("")}</select>
            ${uploads.has(p.img) ? `<div class="new">חדשה, תעלה בשמירה</div>` : ""}
          </div>
          <div class="adm-tools">
            <button type="button" data-a="up" aria-label="להקדים" ${i === 0 ? "disabled" : ""}>↑</button>
            <button type="button" data-a="down" aria-label="לאחר" ${i === e.photos.length - 1 ? "disabled" : ""}>↓</button>
            <button type="button" data-a="del" aria-label="למחוק">✕</button>
          </div>`;
        const sel = row.querySelector("select");
        sel.value = p.metal || "";
        sel.addEventListener("change", () => { if (sel.value) p.metal = sel.value; else delete p.metal; refreshSum(); });
        row.querySelectorAll("[data-a]").forEach((b) => b.addEventListener("click", () => {
          const a = b.dataset.a;
          if (a === "del") {
            if (!confirm("להוריד את התמונה מהתכשיט?")) return;
            e.photos.splice(i, 1);
          } else {
            const j = a === "up" ? i - 1 : i + 1;
            [e.photos[i], e.photos[j]] = [e.photos[j], e.photos[i]];
          }
          drawPhotos(); refreshSum();
        }));
        box.appendChild(row);
      });
    };
    drawPhotos();

    f.querySelector('input[type="file"]').addEventListener("change", async (ev) => {
      const files = [...ev.target.files];
      ev.target.value = "";
      for (const [n, file] of files.entries()) {
        status(`מכין תמונה ${n + 1} מתוך ${files.length}...`);
        try {
          const { b64, url } = await shrink(file);
          const path = `images/uploads/${code.toLowerCase()}-${Date.now().toString(36)}${n}.jpg`;
          uploads.set(path, { b64, url });
          e.photos.push({ img: path });
        } catch (err) {
          status("לא הצלחתי לקרוא את התמונה", true);
        }
      }
      status("");
      drawPhotos(); refreshSum();
    });
    return d;
  }

  // Phone photos are large: scale to 1600px and save as JPEG before upload.
  async function shrink(file) {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.src = url;
    await img.decode();
    const max = 1600;
    const s = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement("canvas");
    c.width = Math.round(img.naturalWidth * s);
    c.height = Math.round(img.naturalHeight * s);
    c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
    URL.revokeObjectURL(url);
    const dataUrl = c.toDataURL("image/jpeg", 0.82);
    return { b64: dataUrl.split(",")[1], url: dataUrl };
  }

  function renderSets() {
    const box = $("#sets");
    box.replaceChildren();
    st.sets.forEach((s, i) => {
      const row = document.createElement("div");
      row.className = "adm-set";
      row.innerHTML = `
        <input aria-label="שם הסט" placeholder="שם, למשל סט דורי" value="${esc(s.name)}">
        <input aria-label="קודים" dir="ltr" placeholder="E02, N02" value="${esc((s.codes || []).join(", "))}">
        <input aria-label="אחוז הנחה" inputmode="numeric" placeholder="%" value="${esc(s.off)}">
        <button type="button" aria-label="למחוק את הסט">✕</button>`;
      const [nm, cd, off] = row.querySelectorAll("input");
      nm.addEventListener("input", () => { s.name = nm.value.trim(); refreshDirty(); });
      cd.addEventListener("input", () => { s.codes = cd.value.toUpperCase().split(/[\s,]+/).filter(Boolean); refreshDirty(); });
      off.addEventListener("input", () => { s.off = Number(off.value.replace(/[^\d.]/g, "")) || 0; refreshDirty(); });
      row.querySelector("button").addEventListener("click", () => { if (confirm("למחוק את הנחת הסט?")) { st.sets.splice(i, 1); renderSets(); refreshDirty(); } });
      box.appendChild(row);
    });
  }
  $("#set-add").addEventListener("click", () => { st.sets.push({ name: "", codes: [], off: 10 }); renderSets(); refreshDirty(); });

  $("#search").addEventListener("input", (ev) => {
    const q = ev.target.value.trim().toLowerCase();
    document.querySelectorAll("details.adm-item").forEach((d) => { d.hidden = q && !d.dataset.search.includes(q); });
  });

  // ---------- Build the data files ----------
  const q = JSON.stringify;
  function orderedKeys(obj, keyFor) {
    // Keys grouped by category in site order, then anything else.
    const groups = [];
    const used = new Set();
    st.catalog.categories.forEach((cat) => {
      const ks = [];
      cat.items.forEach((item) => { if (!item) return; keyFor(item).forEach((k) => { if (k in obj && !used.has(k)) { used.add(k); ks.push(k); } }); });
      if (ks.length) groups.push([cat.title, ks]);
    });
    const rest = Object.keys(obj).filter((k) => !used.has(k));
    if (rest.length) groups.push(["אחר", rest]);
    return groups;
  }
  const objText = (name, obj, keyFor) => {
    const lines = [];
    orderedKeys(obj, keyFor).forEach(([title, ks], gi, all) => {
      lines.push(`  // ${title}`);
      ks.forEach((k, ki) => lines.push(`  ${/^[A-Za-z_][\w]*$/.test(k) ? k : q(k)}: ${q(String(obj[k] == null ? "" : obj[k]))}${gi === all.length - 1 && ki === ks.length - 1 ? "" : ","}`));
      if (gi < all.length - 1) lines.push("");
    });
    return `window.${name} = {\n${lines.join("\n")}\n};\n`;
  };
  const priceKeyFor = (item) => Object.keys(st.prices).filter((k) => k === item.code || k.startsWith(`${item.code}_`));

  function buildFiles() {
    const prices = {};
    Object.keys(st.prices).forEach((k) => { prices[k] = String(st.prices[k] || "").trim(); });
    const sets = st.sets.filter((s) => s.name && s.codes && s.codes.length && Number(s.off) > 0)
      .map((s) => `  { name: ${q(s.name)}, codes: [${s.codes.map((c) => q(c)).join(", ")}], off: ${Number(s.off)} }`);
    const pricesJs = `/*
  מחירים: כאן מעדכנים את המחיר של כל תכשיט (אפשר גם מדף הניהול admin.html).
  לכל תכשיט יש שתי שורות, אחת לכסף ואחת לזהב. למשל:
    E01_silver: "180",   ← עגיל E01 בכסף 925
    E01_gold: "320",     ← עגיל E01 בזהב 14K
  כל עוד המחיר ריק, באתר יופיע "מחיר: ___".
  אפשר לכתוב גם טקסט, למשל: "החל מ-180".
*/
${objText("PRICES", prices, priceKeyFor)}
/*
  הנחות סט: כשקונים את כל התכשיטים של סט יחד, ההנחה יורדת אוטומטית בסל.
  codes = הקודים של התכשיטים בסט, off = אחוז ההנחה על כולם יחד.
*/
window.SETS = [${sets.length ? `\n${sets.join(",\n")}\n` : ""}];
`;
    const names = {};
    Object.keys(st.names).forEach((k) => { names[k] = String(st.names[k] || "").trim(); });
    const namesJs = `/*
  שמות — כאן נותנים שם לכל תכשיט (אפשר גם מדף הניהול admin.html).
  כותבים את השם בין המירכאות, למשל: E01: "עגיל טיפה",
  כל עוד השם ריק, באתר יופיע הקוד של התכשיט (למשל "עגיל E01") ולידו "שם: ___".
*/
${objText("NAMES", names, (item) => [item.code])}`;

    const order = st.items.map((e) => e.item.code);
    const sortCodes = (set) => [...set].sort((a, b) => (order.indexOf(a) + 1 || 999) - (order.indexOf(b) + 1 || 999));
    const unique = (st.catalog.categories.find((c) => c.id === "unique") || { items: [] }).items.filter(Boolean);
    const stockJs = `/*
  מלאי: תכשיטים שנגמרו במלאי (אפשר גם מדף הניהול admin.html).
  כותבים כאן את הקוד של התכשיט בין מירכאות, מופרד בפסיק. למשל: ["E04", "R02"]
  תכשיט שמופיע כאן יציג "נגמר במלאי" ולא יהיה אפשר להוסיף אותו לסל.
  כשהוא חוזר למלאי, מוחקים אותו מהרשימה.
*/
window.SOLD_OUT = [${sortCodes(st.soldOut).map((c) => q(c)).join(", ")}];

/*
  נמכר: תכשיטים בעותק אחד (One of a Kind) שהוזמנו ושולמו.
  כדי לסמן תכשיט כנמכר, מוסיפים את הקוד שלו לרשימה למטה, בין מירכאות ומופרד בפסיק.
  במקום המחיר יופיע "נמכר", ולא יהיה אפשר להוסיף אותו לסל.

  הקודים של One of a Kind:
${unique.map((it) => `    ${it.code.padEnd(5)} - ${(st.names[it.code] || "").trim() || "(עדיין בלי שם)"}`).join("\n")}
*/
window.SOLD = [${sortCodes(st.sold).map((c) => q(c)).join(", ")}];
`;
    const photos = {};
    st.items.forEach((e) => {
      const now = JSON.stringify(e.photos);
      const had = st.photos[e.item.code];
      // Only pieces whose photos were changed get a list here; the rest keep catalog.js.
      if (had || now !== e.startPhotos) photos[e.item.code] = e.photos.map((p) => ({ ...p }));
    });
    const discounts = {};
    Object.keys(st.discounts).sort().forEach((k) => { if (Number(st.discounts[k]) > 0) discounts[k] = Number(st.discounts[k]); });
    const shopJs = `/*
  דף הניהול (admin.html) שומר כאן הנחות ותמונות.
  discounts: אחוז הנחה לתכשיט, למשל { "E01": 10 } = 10% הנחה על עגילי רוני.
  photos: רשימת התמונות של תכשיט לפי הסדר. metal: "silver" / "gold" / שם אפשרות, או ריק = לכל הסוגים.
  תכשיט שלא מופיע ב-photos משתמש בתמונות שב-catalog.js.
*/
window.SHOP = ${JSON.stringify({ discounts, photos }, null, 2)};
`;
    return { [DATA.prices]: pricesJs, [DATA.names]: namesJs, [DATA.stock]: stockJs, [DATA.shop]: shopJs };
  }

  // Same data, whatever the key order.
  const stable = (v) => (Array.isArray(v) ? `[${v.map(stable).join(",")}]` : v && typeof v === "object" ? `{${Object.keys(v).sort().map((k) => `${JSON.stringify(k)}:${stable(v[k])}`).join(",")}}` : JSON.stringify(v));

  // Which data files differ from what was loaded (compared by meaning, so a reload is not a change).
  function changedFiles() {
    if (!st) return {};
    const files = buildFiles();
    const out = {};
    const loaded = evalData(Object.values(DATA).map((p) => base.texts[p] || ""));
    Object.entries(files).forEach(([path, text]) => {
      const now = evalData([text]);
      const keys = Object.keys(now);
      if (stable(keys.map((k) => now[k])) !== stable(keys.map((k) => loaded[k]))) out[path] = text;
    });
    return out;
  }

  function refreshDirty() {
    const n = Object.keys(changedFiles()).length + uploads.size;
    const btn = $("#save");
    btn.disabled = n === 0;
    btn.textContent = n ? "שמירה ופרסום •" : "שמירה ופרסום";
  }

  // ---------- Save: one commit with the data files, new photos and fresh cache versions ----------
  const utf8b64 = (s) => toB64(enc.encode(s));
  async function save() {
    const files = changedFiles();
    const used = new Set(st.items.flatMap((e) => e.photos.map((p) => p.img)));
    const imgs = [...uploads.entries()].filter(([p]) => used.has(p));
    if (!Object.keys(files).length && !imgs.length) { status("אין שינויים לשמור"); return; }
    if (demo) { status("מצב הצצה: לא נשמר כלום. כדי לשמור צריך להתחבר עם המפתח."); return; }
    const btn = $("#save");
    btn.disabled = true;
    try {
      status("שומר...");
      const head = await headSha();
      if (head !== base.head) {
        // Someone else saved meanwhile (another phone, or an update from the computer).
        const cmp = await (await gh(`/compare/${base.head}...${head}`)).json();
        const touched = (cmp.files || []).map((f) => f.filename).filter((f) => Object.values(DATA).includes(f));
        if (touched.length) {
          status("האתר עודכן בינתיים ממקום אחר. צריך לטעון את הדף מחדש ולעשות שוב את השינויים.", true);
          btn.disabled = false;
          return;
        }
      }
      const version = new Date().toISOString().replace(/\D/g, "").slice(0, 12);
      const tree = [];
      const blob = async (content, encoding) => (await ghJson("/git/blobs", { content, encoding })).sha;
      for (const [path, text] of Object.entries(files)) tree.push({ path, mode: "100644", type: "blob", sha: await blob(utf8b64(text), "base64") });
      for (const [n, [path, { b64 }]] of imgs.entries()) {
        status(`מעלה תמונה ${n + 1} מתוך ${imgs.length}...`);
        tree.push({ path, mode: "100644", type: "blob", sha: await blob(b64, "base64") });
      }
      status("מעדכן את הדפים...");
      for (const page of PAGES) {
        let html;
        try { html = await readText(page, head); } catch (e) { continue; }
        const next = html.replace(/\?v=[0-9a-z]+/g, `?v=${version}`);
        if (next !== html) tree.push({ path: page, mode: "100644", type: "blob", sha: await blob(utf8b64(next), "base64") });
      }
      const headCommit = await (await gh(`/git/commits/${head}`)).json();
      const newTree = await ghJson("/git/trees", { base_tree: headCommit.tree.sha, tree });
      const commit = await ghJson("/git/commits", { message: "עדכון מדף הניהול", tree: newTree.sha, parents: [head] });
      await ghJson(`/git/refs/heads/${encodeURIComponent(BRANCH)}`, { sha: commit.sha }, "PATCH");
      // What is now saved becomes the new starting point.
      base = { head: commit.sha, texts: { ...base.texts, ...files } };
      imgs.forEach(([p]) => uploads.delete(p));
      const shop = evalData([files[DATA.shop] || base.texts[DATA.shop] || ""]).SHOP || {};
      st.photos = JSON.parse(JSON.stringify(shop.photos || {}));
      st.items.forEach((e) => { e.startPhotos = JSON.stringify(e.photos); });
      status("נשמר! האתר יתעדכן תוך דקה-שתיים.");
      refreshDirty();
    } catch (err) {
      const why = err.status === 401 ? "המפתח לא תקין או שפג תוקפו" : err.status === 403 || err.status === 404 ? "למפתח אין הרשאת כתיבה לאתר" : "בעיה בחיבור";
      status(`השמירה נכשלה: ${why}. שום דבר לא השתנה באתר.`, true);
      btn.disabled = false;
    }
  }
  $("#save").addEventListener("click", save);
  addEventListener("beforeunload", (ev) => { if (st && !demo && (Object.keys(changedFiles()).length || uploads.size)) { ev.preventDefault(); ev.returnValue = ""; } });

  // ---------- Login ----------
  async function start(tok) {
    token = tok;
    try { await load(); }
    catch (err) {
      token = null;
      status(err.status === 401 ? "המפתח לא תקין או שפג תוקפו" : "לא הצלחתי לטעון את האתר", true);
      showLogin();
    }
  }
  function showLogin() {
    $("#editor").hidden = true;
    $("#save").hidden = true;
    $("#setup").hidden = hasSaved();
    $("#login").hidden = !hasSaved();
  }
  $("#setup-go").addEventListener("click", async () => {
    const tok = $("#setup-token").value.trim();
    const p1 = $("#setup-pass").value;
    if (!/^(github_pat_|ghp_)/.test(tok)) { status("המפתח צריך להתחיל ב-github_pat_", true); return; }
    if (p1.length < 6) { status("הסיסמה צריכה להיות לפחות 6 תווים", true); return; }
    if (p1 !== $("#setup-pass2").value) { status("הסיסמאות לא זהות", true); return; }
    await lockToken(tok, p1);
    $("#setup-token").value = "";
    start(tok);
  });
  const login = async () => {
    try { start(await unlockToken($("#login-pass").value)); }
    catch (e) { status("סיסמה שגויה", true); }
    $("#login-pass").value = "";
  };
  $("#login-go").addEventListener("click", login);
  $("#login-pass").addEventListener("keydown", (ev) => { if (ev.key === "Enter") login(); });
  $("#login-reset").addEventListener("click", () => {
    if (!confirm("למחוק את המפתח השמור בטלפון הזה ולהתחבר מחדש?")) return;
    localStorage.removeItem(STORE);
    showLogin();
  });
  document.querySelectorAll("[data-demo]").forEach((b) => b.addEventListener("click", () => { demo = true; load().catch(() => status("לא הצלחתי לטעון", true)); }));

  if (params.has("demo")) { demo = true; load().catch(() => status("לא הצלחתי לטעון", true)); }
  else showLogin();
})();
