'use strict';
var UI = (() => {

  var UI = {
    initialized: false,

    presets: {
      "DEFAULT": "Default",
      "TRUSTED": "Trusted",
      "UNTRUSTED": "Untrusted",
      "CUSTOM": "Custom",
    },

    async init(tabId = -1) {
      UI.tabId = tabId;

      await include([
        "/ui/ui.css",
        "/lib/punycode.js",
        "/lib/tld.js",
        "/common/Policy.js",
      ]);

      detectHighContrast();

      let inited = new Promise(resolve => {
        let listener = m => {
          if (m.type === "settings") {
            UI.policy = new Policy(m.policy);
            UI.snapshot = UI.policy.snapshot;
            UI.seen = m.seen;
            UI.xssUserChoices = m.xssUserChoices;
            UI.local = m.local;
            UI.sync = m.sync;
            resolve();
            if (UI.onSettings) UI.onSettings();
          }
        };
        browser.runtime.onMessage.addListener(listener);
        UI.pullSettings();
      });

      await inited;

      this.initialized = true;
      debug("Imported", Policy);
    },
    async pullSettings() {
      browser.runtime.sendMessage({type: "NoScript.broadcastSettings", tabId: UI.tabId});
    },
    async updateSettings({policy, xssUserChoices, local, sync, reloadAffected}) {
      if (policy) policy = policy.dry(true);
      return await browser.runtime.sendMessage({type: "NoScript.updateSettings",
        policy,
        xssUserChoices,
        local,
        sync,
        reloadAffected,
        tabId: UI.tabId,
      });
    },

    async exportSettings() {
      return await browser.runtime.sendMessage({type: "NoScript.exportSettings"});
    },
    async importSettings(data) {
      return await browser.runtime.sendMessage({type: "NoScript.importSettings", data});
    },

    isDirty(reset = false) {
      let currentSnapshot = this.policy.snapshot;
      let dirty = currentSnapshot != this.snapshot;
      if (reset) this.snapshot = currentSnapshot;
      return dirty;
    },

    async openSiteInfo(domain) {
      await include('/common/SafeSync.js');
      let {siteInfoConsent} = await SafeSync.get("siteInfoConsent");
      if (!siteInfoConsent) {
        siteInfoConsent = confirm(_("siteInfo.confirm", [domain, "https://noscript.net/"]));
        if (siteInfoConsent) {
          await SafeSync.set({siteInfoConsent});
        }
      }
      let ace  = punycode.toASCII(domain);
      let url = `https://noscript.net/about/${domain};${ace}`;
      browser.tabs.create({url});
    }
  };

  function detectHighContrast() {
    // detect high contrast
    let canary = document.createElement("input");
    canary.className="https-only";
    canary.style.display = "none";
    document.body.appendChild(canary);
    if (UI.highContrast = window.getComputedStyle(canary).backgroundImage === "none") {
      include("/ui/ui-hc.css");
      document.documentElement.classList.toggle("hc");
    }
    canary.parentNode.removeChild(canary);
  }

  function fireOnChange(sitesUI, data) {
    if (UI.isDirty(true)) {
      UI.updateSettings({policy: UI.policy});
      if (sitesUI.onChange) sitesUI.onChange(data, this);
    }
  }

  function compareBy(prop, a, b) {
    let x = a[prop], y = b[prop];
    return x > y ? 1 : x < y ? -1 : 0;
  }

  const TEMPLATE = `
    <table class="sites">
    <tr class="site">

    <td class="presets">
    <span class="preset">
      <input id="preset" class="preset" type="radio" name="preset"><label for="preset" class="preset">PRESET</label>
      <button class="options tiny">⚙</button>
      <input id="temp" class="temp" type="checkbox"><label for="temp">Temporary</input>
    </span>
    </td>

    <td class="url" data-key="secure">
    <input class="https-only" id="https-only" type="checkbox"><label for="https-only" class="https-only"></label>
    <span class="full-address">
    <span class="protocol">https://</span><span class="sub">www.</span><span class="domain">noscript.net</span><span class="path"></span>
    </span>
    </td>



    </tr>
    <tr class="customizer closed">
    <td colspan="2">
    <fieldset><legend></legend>
    <span class="cap">
      <input class="cap" type="checkbox" value="script" />
      <label class="cap">script</label>
    </span>
    </fieldset>
    </td>
    </tr>
    </table>
  `;

  const TEMP_PRESETS = ["TRUSTED", "CUSTOM"];

  function initRow(table) {
    let row = table.querySelector("tr.site");

    // PRESETS
    {
      let presets = row.querySelector(".presets");
      let [span, input, label, options] = presets.querySelectorAll("span.preset, input.preset, label.preset, .options");
      presets.removeChild(span);
      options.title = _("Options");
      for (let [preset, messageKey] of Object.entries(UI.presets)) {
        input.value = preset;
        label.textContent = label.title = input.title = _(messageKey);
        let clone = span.cloneNode(true);
        clone.classList.add(preset);
        let temp = clone.querySelector(".temp");
        if (TEMP_PRESETS.includes(preset)) {
          temp.title = _("allowTemp", `(${label.title.toUpperCase()})`);
          temp.nextElementSibling.textContent = _("allowTemp", ""); // label;
        } else {
          temp.parentNode.removeChild(temp.nextElementSibling);
          temp.parentNode.removeChild(temp);
        }
        presets.appendChild(clone);
      }
    }

    // URL
    {
      let [input, label] = row.querySelectorAll("input.https-only, label.https-only");
      input.title = label.title = label.textContent = _("httpsOnly");
    }

    // CUSTOMIZER ROW
    {
      let [customizer, legend, cap, capInput, capLabel] = table.querySelectorAll("tr.customizer, legend, span.cap, input.cap, label.cap");
      row._customizer = customizer;
      customizer.parentNode.removeChild(customizer);
      let capParent = cap.parentNode;
      capParent.removeChild(cap);
      legend.textContent = _("allow");
      for (let capability of Permissions.ALL) {
        capInput.id = `capability-${capability}`
        capLabel.setAttribute("for", capInput.id);
        capInput.value = capability;
        capInput.title = capLabel.textContent = _(`cap.${capability}`);
        let clone = capParent.appendChild(cap.cloneNode(true));
        clone.classList.add(capability);
      }
    }

    debug(table.outerHTML);
    return row;
  }

  UI.Sites = class {
    constructor() {
      let policy = UI.policy;
      this.sites = policy.sites;
      this.template = document.createElement("template");
      this.template.innerHTML = TEMPLATE;
      this.fragment = this.template.content;
      this.table = this.fragment.querySelector("table.sites");
      this.rowTemplate = initRow(this.table);
      this.customizing = null;
      this.typesMap = new Map();
      this.clear();
    }

    allSiteRows() {
      return this.table.querySelectorAll("tr.site");
    }
    clear() {
      debug("Clearing list", this.table);
      for (let r of this.allSiteRows()) {
        r.parentNode.removeChild(r);
      }
      this.customize(null);
      this.sitesCount = 0;
    }
    siteNeeds(site, type) {
      let siteTypes = this.typesMap && this.typesMap.get(site);
      return !!siteTypes && siteTypes.has(type);
    }

    handleEvent(ev) {
      let target = ev.target;
      let customizer = target.closest("tr.customizer");
      let row = customizer ? customizer.parentNode.querySelector("tr.customizing") : target.closest("tr.site");
      if (!row) return;
      let isTemp = target.matches("input.temp");
      let preset = target.matches("input.preset") ? target
        : customizer || isTemp ? row.querySelector("input.preset:checked")
          : target.closest("input.preset");
      debug("%s target %o\n\trow %s, perms %o\npreset %s %s",
              ev.type,
              target, row && row.siteMatch, row && row.perms,
              preset && preset.value, preset && preset.checked);

      if (!preset) {
        if (target.matches("input.https-only") && ev.type === "change") {
          this.toggleSecure(row, target.checked);
          fireOnChange(this, row);
        } else if (target.matches(".domain")) {
          UI.openSiteInfo(row.domain);
        }
        return;
      }

      let policy = UI.policy;
      let {siteMatch, contextMatch, perms} = row;  // policy.get(row.siteMatch, row.contextMatch);
      let policyPreset = policy[preset.value];
      if (policyPreset) {
        if (row.perms !== policyPreset) {
          row.perms = policyPreset;
        }
      }


      let isCap = customizer && target.matches("input.cap");
      let tempToggle = preset.parentNode.querySelector("input.temp");

      if (ev.type === "change") {
        if (preset.checked) {
          row.dataset.preset = preset.value;
        }
        if (isCap) {
          perms.set(target.value, target.checked);
        } else if (policyPreset) {
          if (tempToggle && tempToggle.checked) {
            policyPreset = policyPreset.tempTwin;
          }
          policy.set(siteMatch, policyPreset);
          row.contextMatch = null;
          row.perms = policyPreset;
          delete row._customPerms;
        } else if (preset.value === "CUSTOM") {
          if (isTemp) {
            row.perms.temp = target.checked;
          } else {
            let temp = preset.parentNode.querySelector("input.temp").checked;
            let perms = row._customPerms ||
              (row._customPerms = new Permissions(new Set(row.perms.capabilities), temp));
            row.perms = perms;
            policy.set(siteMatch, perms);
            this.customize(perms, preset, row);
          }
        }
        fireOnChange(this, row);
      } else if (!(isCap || isTemp) && ev.type === "click") {
          this.customize(row.perms, preset, row);
      }
    }

    customize(perms, preset, row) {
      debug("Customize preset %s (%o) - Dirty: %s", preset && preset.value, perms, this.dirty);
      for(let r of document.querySelectorAll("tr.customizing")) {
        r.classList.toggle("customizing", false);
      }
      let customizer = this.rowTemplate._customizer;
      customizer.classList.toggle("closed", true);
      if (customizer.parentNode) {
        customizer.parentNode.removeChild(customizer);
      }
      if (!(perms && row && preset &&
        row.dataset.preset === preset.value &&
        preset !== customizer._preset)) {
           delete customizer._preset;
           return;
      }

      customizer._preset = preset;
      row.classList.toggle("customizing", true);
      let immutable = Permissions.IMMUTABLE[preset.value] || {};
      for (let input of customizer.querySelectorAll("input")) {
        let type = input.value;
        if (type in immutable) {
          input.disabled = true;
          input.checked = immutable[type];
        } else {
          input.checked = perms.allowing(type);
          input.disabled = false;
        }
        input.parentNode.classList.toggle("needed", this.siteNeeds(row.siteMatch, type));
        row.parentNode.insertBefore(customizer, row.nextElementSibling);
        customizer.classList.toggle("closed", false);
        customizer.onkeydown = e => {
          switch(e.keyCode) {
            case 38:
            case 8:
            e.preventDefault();
            this.onkeydown = null;
            this.customize(null);
            preset.focus();
            return false;
          }
        }
        window.setTimeout(() => customizer.querySelector("input").focus(), 50);
      }
    }

    render(parentNode, sites = null) {
      debug("Rendering %o inside %o", sites, parentNode);
      if (sites) this.populate(sites);
      parentNode.appendChild(this.fragment);
      let root = parentNode.querySelector("table.sites");
      debug("Wiring", root);
      if (!root.wiredBy) {
        root.addEventListener("click", this, true);
        root.addEventListener("change", this, true);
        root.wiredBy = this;
      }
      return root;
    }

    populate(sites = this.sites, sorter = this.sorter) {
      this.clear();
      if (sites instanceof Sites) {
        for (let [site, perms] of sites) {
          this.append(site, site, perms);
        }
      } else {
        for (let site of sites) {
          let context = null;
          if (site.site) {
            site = site.site;
            context = site.context;
          }
          let {siteMatch, perms, contextMatch} = UI.policy.get(site, context);
          this.append(site, siteMatch, perms, contextMatch);
        }
        this.sites = sites;
      }
      this.sort(sorter);
      window.setTimeout(() => this.focus(), 50);
    }

    focus() {
      let firstPreset = this.table.querySelector("input.preset:checked");
      if (firstPreset) firstPreset.focus();
    }

    sort(sorter = this.sorter) {
      if (this.mainDomain) {
        let md = this.mainDomain;
        let wrappedCompare = sorter;
        sorter = (a, b) => {
          let x = a.domain, y = b.domain;
          if (x === md) {
            if (y !== md) {
              return -1;
            }
          } else if (y === md) {
            return 1;
          }
          return wrappedCompare(a, b);
        }
      }
      let rows = [...this.allSiteRows()].sort(sorter);
      if (this.mainSite) {
        let mainLabel = "." + this.mainDomain;
        let topIdx = rows.findIndex(r => r._label === mainLabel);
        if (topIdx === -1) rows.findIndex(r => r._site === this.mainSite);
        if (topIdx !== -1) {
          // move the row to the top
          let topRow = rows.splice(topIdx, 1)[0];
          rows.unshift(topRow);
          topRow.classList.toggle("main", true);
        }
      }
      this.clear();
      for (let row of rows) this.table.appendChild(row);
    }

    sorter(a, b) {
      return compareBy("domain", a, b) ||  compareBy("_label", a, b);
    }

    async tempAllowAll() {
      let {policy} = UI;
      let changed = 0;
      for (let row of this.allSiteRows()) {
        if (row._preset === "DEFAULT") {
          policy.set(row._site, policy.TRUSTED.tempTwin);
          changed++;
        }
      }
      if (changed && UI.isDirty(true)) {
        await UI.updateSettings({policy, reloadAffected: true});
      }
      return changed;
    }

    async revokeTemp() {
      let policy = UI.policy;
      Policy.hydrate(policy.dry(), policy);
      if (UI.isDirty(true)) {
        await UI.updateSettings({policy, reloadAffected: true});
      }
    }

    createSiteRow(site, siteMatch, perms, contextMatch = null, sitesCount = this.sitesCount++) {
      debug("Creating row for site: %s, matching %s / %s, %o", site, siteMatch, contextMatch, perms);

      let row = this.rowTemplate.cloneNode(true);
      row.sitesCount = sitesCount;
      let url;
      try {
        url = new URL(site);
      } catch (e) {
        let protocol = Sites.isSecureDomainKey(site) ? "https:" : "http:";
        let hostname = Sites.toggleSecureDomainKey(site, false);
        url = {protocol, hostname, origin: `${protocol}://${site}`, pathname: "/"};
      }

      let hostname = Sites.toExternal(url.hostname);
      let domain = tld.getDomain(hostname);

      if (!siteMatch) {
        // siteMatch = url.protocol === "https:" ? Sites.secureDomainKey(domain) : site;
        siteMatch = site;
      }
      let secure = Sites.isSecureDomainKey(siteMatch);
      let keyStyle = secure ? "secure"
        : !domain || /^\w+:/.test(siteMatch) ?
            (url.protocol === "https:" ? "full" : "unsafe")
          : domain === hostname ? "domain" : "host";

      let urlContainer = row.querySelector(".url");
      urlContainer.dataset.key = keyStyle;
      row._site = site;

      row.siteMatch = siteMatch;
      row.contextMatch = contextMatch;
      row.perms = perms;
      row.domain = domain || siteMatch;
      if (domain) { // "normal" URL
        let justDomain = hostname === domain;
        let domainEntry = secure || domain === site;
        row._label =  domainEntry ? "." + domain : site;
        row.querySelector(".protocol").textContent = `${url.protocol}//`;
        row.querySelector(".sub").textContent = justDomain ?
          (keyStyle === "full" || keyStyle == "unsafe"
            ? "" : "…")
            : hostname.substring(0, hostname.length - domain.length);

        row.querySelector(".domain").textContent = domain;
        row.querySelector(".path").textContent = siteMatch.length > url.origin.length ? url.pathname : "";
        let httpsOnly = row.querySelector("input.https-only");
        httpsOnly.checked = keyStyle === "full" || keyStyle === "secure";
      } else {
        row._label = siteMatch;
        urlContainer.querySelector(".full-address").textContent = siteMatch;
      }

      let presets = row.querySelectorAll("input.preset");
      for (let p of presets) {
        p.id = `${p.value}${sitesCount}`;
        p.name = `preset${sitesCount}`;
        let label = p.nextElementSibling;
        label.setAttribute("for", p.id);
        let temp = p.parentNode.querySelector("input.temp");
        if (temp) {
          temp.id = `temp-${p.id}`;
          label = temp.nextElementSibling;
          label.setAttribute("for", temp.id);
        }
      }
      let policy = UI.policy;

      let presetName = "CUSTOM";
      for (let p of ["TRUSTED", "UNTRUSTED", "DEFAULT"]) {
        if (perms === policy[p] || perms === policy[p].tempTwin) presetName = p;
      }
      let tempFirst = true; // TODO: make it a preference
      let unsafeMatch = keyStyle !== "secure" && keyStyle !== "full";
      if (presetName === "DEFAULT" && (tempFirst || unsafeMatch)) {
        // prioritize temporary privileges over permanent
        for (let p of ["TRUSTED", "CUSTOM"]) {
          if (unsafeMatch || tempFirst && p === "TRUSTED") {
            row.querySelector(`.presets input[value="${p}"]`).parentNode.querySelector("input.temp").checked = true;
            perms = policy.DEFAULT.tempTwin;
          }
        }
      }
      let preset = row.querySelector(`.presets input[value="${presetName}"]`);
      if (!preset) {
        debug(`Preset %s not found in %s!`, presetName, row.innerHTML);
      } else {
        preset.checked = true;
        row.dataset.preset = row._preset = presetName;
        if (TEMP_PRESETS.includes(presetName)) {
          let temp = preset.parentNode.querySelector("input.temp");
          if (temp) {
            temp.checked = perms.temp;
          }
        }
      }
      return row;
    }

    append(site, siteMatch, perms, contextMatch) {
      this.table.appendChild(this.createSiteRow(...arguments));
    }

    toggleSecure(row, secure = !!row.querySelector("https-only:checked")) {
      this.customize(null);
      let site = row.siteMatch;
      site = site.replace(/^https?:/, secure ? "https:" : "http:");
      if (site === row.siteMatch) {
        site = Sites.toggleSecureDomainKey(site, secure);
      }
      if (site !== row.siteMatch) {
        let {policy} = UI;
        policy.set(row.siteMatch, policy.DEFAULT);
        policy.set(site, row.perms);
        for(let r of this.allSiteRows()) {
          if (r !== row && r.siteMatch === site && r.contextMatch === row.contextMatch) {
            r.parentNode.removeChild(r);
          }
        }
        let newRow = this.createSiteRow(site, site, row.perms, row.contextMatch, row.sitesCount);
        row.parentNode.replaceChild(newRow, row);
      }
    }

    highlight(key) {
      key = Sites.toExternal(key);
      for (let r of this.allSiteRows()) {
        if (r.querySelector(".full-address").textContent.trim().includes(key)) {
          let url = r.lastElementChild;
          url.style.transition = r.style.transition = "none";
          r.style.backgroundColor = "#850";
          url.style.transform = "scale(2)";
          r.querySelector("input.preset:checked").focus();
          window.setTimeout(() => {
              r.style.transition = "1s background-color";
              url.style.transition = "1s transform";
              r.style.backgroundColor = "";
              url.style.transform = "none";
              r.scrollIntoView();
          }, 50);
        }
      }
    }

    filterSites(key) {
      key = Sites.toExternal(key);
      for (let r of this.allSiteRows()) {
        if (r.querySelector(".full-address").textContent.trim().includes(key)) {
          r.style.display = "";
        } else {
          r.style.display = "none";
        }
      }
    }
  }

  return UI;
})();
