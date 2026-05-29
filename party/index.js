export default {
  async onConnect(connection, room) {
    const state = await room.storage.get("state");
    if (state) {
      connection.send(JSON.stringify({ type: "init", data: JSON.parse(state) }));
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
      vault: []
    };

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