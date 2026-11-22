// Everything that writes to the page lives here. No booking or filtering rules.
import { minutesToTime } from "../logic/time.js";

function renderList(listEl, items, emptyText, renderItem) {
  listEl.replaceChildren();
  const doc = listEl.ownerDocument;
  if (items.length === 0) {
    const li = doc.createElement("li");
    li.className = "empty";
    li.textContent = emptyText;
    listEl.appendChild(li);
    return;
  }
  for (const item of items) {
    const li = doc.createElement("li");
    renderItem(li, item, doc);
    listEl.appendChild(li);
  }
}

function span(doc, className, text) {
  const el = doc.createElement("span");
  el.className = className;
  el.textContent = text;
  return el;
}

export function renderBookings(listEl, bookings) {
  renderList(listEl, bookings, "No existing bookings.", (li, b, doc) => {
    li.append(
      span(doc, "dot", ""),
      span(doc, "", `${minutesToTime(b.start)} – ${minutesToTime(b.end)}`),
    );
  });
}

export function renderRooms(listEl, rooms, selectedId, emptyText) {
  renderList(listEl, rooms, emptyText, (li, room, doc) => {
    const label = doc.createElement("label");
    label.className = "room-option";

    const radio = doc.createElement("input");
    radio.type = "radio";
    radio.name = "room";
    radio.value = room.id;
    radio.checked = room.id === selectedId;

    const body = span(doc, "room-body", "");
    const title = span(doc, "room-name", room.name);
    if (room.blocked) title.append(" ", span(doc, "badge", "Blocked"));
    body.append(
      title,
      span(doc, "room-meta", `Capacity ${room.capacity} · ${room.equipment.join(", ")}`),
    );
    label.append(radio, body);
    li.appendChild(label);
  });
}

export function renderEquipmentOptions(containerEl, items) {
  const doc = containerEl.ownerDocument;
  containerEl.replaceChildren(
    ...items.map((item) => {
      const label = doc.createElement("label");
      label.className = "equipment-option";
      const box = doc.createElement("input");
      box.type = "checkbox";
      box.name = "equipment";
      box.value = item;
      label.append(box, ` ${item}`);
      return label;
    }),
  );
}

export function showResult(els, state, title, message) {
  els.box.hidden = false;
  els.box.className = `result ${state}`;
  els.title.textContent = title;
  els.message.textContent = message;
}

export function hideResult(els) {
  els.box.hidden = true;
}
