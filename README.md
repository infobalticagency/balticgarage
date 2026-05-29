# 🛠️ Baltic Garage

Eine lokale Web-App mit Tools für Bildbearbeitung, Planung und Kollaboration.
Läuft komplett im Browser — kein Server, kein Backend nötig.

## Tools (Phase 1)

### Bilder
- **Größen-Converter** — Bilder auf mehrere Größen gleichzeitig skalieren (ZIP-Download)
- **Format-Konverter** — PNG ↔ JPG ↔ WEBP konvertieren
- **Color Picker** — Farben aus Bildern per Klick extrahieren (HEX / RGB)
- **Before / After** — Zwei Bilder mit Schieberegler vergleichen
- **Batch Umbenennen** — Dateien nach Schema umbenennen und als ZIP laden

### Planung
- **Kanban** — Karten per Drag & Drop (wird lokal gespeichert)
- **Checkliste** — Aufgaben abhaken (wird lokal gespeichert)
- **Pomodoro** — Timer mit Fokus- und Pausenphasen

### Visual
- **Whiteboard** — Zeichenfläche mit Stift, Formen, Text, Bild-Import und PNG-Export

---

## Deployment

### Netlify (empfohlen)
1. Dieses Repository auf GitHub pushen
2. [netlify.com](https://netlify.com) → "Import from Git"
3. Repository auswählen → Deploy

Netlify erkennt automatisch dass es eine statische Seite ist.
Keine Build-Einstellungen nötig — `index.html` wird direkt deployed.

### Manuell (Drag & Drop)
1. [netlify.com](https://netlify.com) → einloggen
2. `index.html` in den Drop-Bereich ziehen
3. Fertig — URL wird sofort generiert

---

## Lokale Entwicklung

Einfach `index.html` im Browser öffnen — fertig.
Kein Build-Tool, kein npm, keine Dependencies außer CDN-Links.

---

## Phase 2 (geplant)

- [ ] PartyKit-Sync für Whiteboard (Echtzeit-Kollaboration)
- [ ] PartyKit-Sync für Kanban
- [ ] PartyKit-Sync für Checkliste
- [ ] Copy Doc (geteiltes Textdokument)

---

## Technologie

- Vanilla HTML / CSS / JavaScript
- [JSZip](https://stuk.github.io/jszip/) — ZIP-Erstellung im Browser
- Google Fonts — DM Mono + Syne
- localStorage — für Kanban, Checkliste und Whiteboard
