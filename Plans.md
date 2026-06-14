# repositorysearch Plans.md

作成日: 2026-06-14

---

## Architektur

```
Browser (React UI)
    ↕ HTTP
Node.js Backend (Express) — durchsucht das Filesystem
    ↕ Volume Mount
Lokal ausgechecktes Repository (/repo im Container)
```

Der Benutzer checkt das Repository selbst aus (Git, SVN, egal) und gibt den Pfad
per `docker-compose.yml` als Volume in den Container. Das Backend sucht rein im Filesystem.

---

## Phase 1: Project Setup

| Task | 内容 | DoD | Depends | Status |
|------|------|-----|---------|--------|
| 1.1 | Monorepo-Struktur anlegen: `frontend/` (Vite+React+TS) und `backend/` (Node+Express+TS) | Beide Verzeichnisse vorhanden mit eigenem `package.json` | - | cc:完了 |
| 1.2 | Frontend: Vite + React + TypeScript + Tailwind CSS einrichten | `npm run build` im frontend/ erfolgreich | 1.1 | cc:完了 |
| 1.3 | Backend: Express + TypeScript einrichten | `npm run dev` im backend/ startet Server auf Port 3001 | 1.1 | cc:完了 |

---

## Phase 2: Backend — Filesystem-Suche

| Task | 内容 | DoD | Depends | Status |
|------|------|-----|---------|--------|
| 2.1 | TypeScript-Typen definieren: SearchRequest, SearchResult, SearchMatch | `types.ts` mit allen Typen vorhanden, in Frontend und Backend | 1.3 | cc:完了 |
| 2.2 | Rekursiver Verzeichnis-Traverser mit Ausschluss-Logik | Ordner die einem Glob-Muster entsprechen (z.B. `*_TEST`) werden übersprungen | 2.1 | cc:完了 |
| 2.3 | String-Suche pro Datei: alle Suchstrings gegen jede Zeile prüfen | Liefert Array von {lineNumber, lineContent, matchedString} pro Datei | 2.2 | cc:完了 |
| 2.4 | POST /api/search Endpoint implementieren | Nimmt {basePath, searchStrings, excludePatterns}, liefert SearchResult-Array als JSON | 2.3 | cc:完了 |
| 2.5 | GET /api/validate Endpoint: prüft ob basePath existiert | Gibt {valid: true/false, error?: string} zurück, verhindert sinnlose Suchen | 2.1 | cc:完了 |

---

## Phase 3: Frontend — UI Komponenten

| Task | 内容 | DoD | Depends | Status |
|------|------|-----|---------|--------|
| 3.1 | ConfigForm Komponente: Basispfad, Suchstrings (Textarea), Ausschluss-Muster (Textarea) | Formular rendert, Eingaben werden als State gehalten | 1.2 | cc:完了 |
| 3.2 | API-Client: POST /api/search und GET /api/validate aufrufen | Typsicherer Fetch mit Fehlerbehandlung (Netzwerkfehler, Backend-Fehler) | 2.1, 3.1 | cc:完了 |
| 3.3 | ProgressAnzeige während der Suche (Spinner + Statustext) | Während Suche läuft: Spinner sichtbar, Suche-Button deaktiviert | 3.2 | cc:完了 |
| 3.4 | ResultsTable: Ergebnisse gruppiert nach Datei anzeigen | Tabelle zeigt Dateipfad (Gruppe), Zeilennummer, Suchstring, Zeileninhalt | 3.2 | cc:完了 |
| 3.5 | CSV-Export: alle Treffer als .csv herunterladen | Klick auf Export erzeugt Download mit Spalten: Datei, Zeile, Suchstring, Inhalt | 3.4 | cc:完了 |
| 3.6 | App-Layout: ConfigForm + Progress + Results zusammenführen | Vollständiger Workflow: Pfad eingeben → Suchen → Ergebnisse sehen → CSV exportieren | 3.3, 3.5 | cc:完了 |

---

## Phase 4: Docker & Deployment

| Task | 内容 | DoD | Depends | Status |
|------|------|-----|---------|--------|
| 4.1 | Backend Dockerfile (Node 20 slim, kompiliert TS, startet Express) | `docker build` im backend/ erfolgreich | 2.4 | cc:完了 |
| 4.2 | Frontend Dockerfile (Node 20 Build-Stage → nginx Serve-Stage) | `docker build` im frontend/ erfolgreich, statische Dateien werden von nginx serviert | 3.6 | cc:完了 |
| 4.3 | nginx.conf für SPA-Routing + Proxy zu Backend (/api → backend:3001) | Alle Routen → index.html, /api/* → Backend, kein CORS-Problem | 4.2 | cc:完了 |
| 4.4 | docker-compose.yml: frontend (Port 3000) + backend + Volume Mount für Repo | `docker compose up` startet App auf http://localhost:3000, `/repo` im Container gemountet | 4.1, 4.3 | cc:完了 |
| 4.5 | README aktualisieren: Anleitung für Windows & Mac | README enthält: Docker installieren → Repo auschecken → docker-compose.yml anpassen → starten | 4.4 | cc:完了 |
