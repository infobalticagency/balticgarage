export default {
  async onConnect(connection, room) {
    const raw = await room.storage.get("state");
    if (raw) {
      const state = JSON.parse(raw);
      // Sicherstellen, dass neue Felder auch für ältere gespeicherte States existieren
      if (!state.profile)    state.profile = {};
      if (!Array.isArray(state.invoices)) state.invoices = [];
      if (!state.invoiceSeq) state.invoiceSeq = {};
      if (!Array.isArray(state.offers)) state.offers = [];
      if (!state.offerSeq) state.offerSeq = {};
      connection.send(JSON.stringify({ type: "init", data: state }));
    }
  },

  async onMessage(message, connection, room) {
    let msg;
    try { msg = JSON.parse(message); } catch(e) { return; }

    const raw = await room.storage.get("state");
    const state = raw ? JSON.parse(raw) : {
      whiteboard: [],
      kanban: { "Ideen": [], "In Arbeit": [], "Überprüfen": [], "Erledigt": [] },
      checklist: [],
      transfer: [],
      vault: [],
      profile: {},
      invoices: [],
      invoiceSeq: {},
      offers: [],
      offerSeq: {}
    };
    // Sicherstellen, dass neue Felder existieren (Rückwärtskompatibilität)
    if (!state.profile)    state.profile = {};
    if (!Array.isArray(state.invoices)) state.invoices = [];
    if (!state.invoiceSeq) state.invoiceSeq = {};
    if (!Array.isArray(state.offers)) state.offers = [];
    if (!state.offerSeq) state.offerSeq = {};

    // ── Firmenprofil (geteilt) ────────────────────────────
    if (msg.type === "profile") {
      state.profile = msg.data || {};
      await room.storage.put("state", JSON.stringify(state));
      room.broadcast(JSON.stringify({ type: "profile", data: state.profile }), [connection.id]);
      return;
    }

    // ── Rechnung anlegen: server-seitige, atomare Nummernvergabe ──
    if (msg.type === "invoice:create") {
      const inv = (msg.data && typeof msg.data === "object") ? msg.data : {};
      // Jahr aus Rechnungsdatum ableiten, sonst aktuelles Jahr
      let year = new Date().getFullYear();
      if (inv.invoiceDate) {
        const d = new Date(inv.invoiceDate);
        if (!isNaN(d)) year = d.getFullYear();
      }
      const y = String(year);
      // Atomar (pro Raum single-threaded): lesen → inkrementieren → schreiben
      const next = (state.invoiceSeq[y] || 0) + 1;
      state.invoiceSeq[y] = next;
      const number = y + "-" + String(next).padStart(4, "0");

      const saved = { ...inv };
      saved.number = number;
      saved.savedAt = Date.now();

      state.invoices.push(saved);
      await room.storage.put("state", JSON.stringify(state));

      // Direkte Antwort an den Ersteller (mit zugewiesener Nummer)
      connection.send(JSON.stringify({ type: "invoice:created", data: saved, reqId: msg.reqId }));
      // Alle anderen erhalten die vollständige, aktualisierte Liste
      room.broadcast(JSON.stringify({ type: "invoices", data: state.invoices }), [connection.id]);
      return;
    }

    // ── Angebot anlegen: server-seitige, atomare Nummernvergabe ──
    if (msg.type === "offer:create") {
      const off = (msg.data && typeof msg.data === "object") ? msg.data : {};
      let year = new Date().getFullYear();
      if (off.offerDate) {
        const d = new Date(off.offerDate);
        if (!isNaN(d)) year = d.getFullYear();
      }
      const y = String(year);
      const next = (state.offerSeq[y] || 0) + 1;
      state.offerSeq[y] = next;
      const number = "ANG-" + y + "-" + String(next).padStart(3, "0");

      const saved = { ...off };
      saved.number = number;
      if (!saved.status) saved.status = "Entwurf";
      saved.savedAt = Date.now();

      state.offers.push(saved);
      await room.storage.put("state", JSON.stringify(state));

      connection.send(JSON.stringify({ type: "offer:created", data: saved, reqId: msg.reqId }));
      room.broadcast(JSON.stringify({ type: "offers", data: state.offers }), [connection.id]);
      return;
    }

    // ── Angebots-Status setzen ────────────────────────────
    if (msg.type === "offer:status") {
      const num = msg.data && msg.data.number;
      const status = msg.data && msg.data.status;
      if (num && status) {
        const o = state.offers.find(x => x.number === num);
        if (o) {
          o.status = status;
          await room.storage.put("state", JSON.stringify(state));
        }
      }
      room.broadcast(JSON.stringify({ type: "offers", data: state.offers }));
      return;
    }

    // ── Bestehende Tools (unverändert) ────────────────────
    if (msg.type === "whiteboard")    state.whiteboard = msg.data;
    else if (msg.type === "kanban")   state.kanban = msg.data;
    else if (msg.type === "checklist") state.checklist = msg.data;
    else if (msg.type === "transfer") state.transfer = msg.data;
    else if (msg.type === "vault")    state.vault = msg.data;
    else return;

    await room.storage.put("state", JSON.stringify(state));
    room.broadcast(JSON.stringify({ type: msg.type, data: msg.data }), [connection.id]);
  },
};
