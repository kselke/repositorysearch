# Repository Search

Durchsucht lokal ausgecheckte Repositories rekursiv nach Strings.
Funktioniert mit Git, SVN oder jedem anderen Versionierungssystem — es wird nur die Verzeichnisstruktur genutzt.

## Voraussetzungen

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installieren (Windows oder Mac)
- Das zu durchsuchende Repository lokal auschecken

## Schnellstart

### 1. docker-compose.yml anpassen (einmalig)

Öffne `docker-compose.yml` und trage den Pfad zu deinem **lokalen Repos-Ordner** ein — nicht ein einzelnes Repository, sondern den übergeordneten Ordner:

**Windows:**
```yaml
volumes:
  - C:\Users\DeinName\repos:/repos:ro
```

**Mac / Linux:**
```yaml
volumes:
  - /Users/DeinName/repos:/repos:ro
```

> Der Ordner wird als Read-Only (`ro`) gemountet — es werden keine Änderungen vorgenommen.
>
> Nach dieser einmaligen Konfiguration kannst du in der UI frei zwischen Repositories wechseln.

### 2. App starten

```bash
docker compose up --build
```

Beim ersten Start wird das Image gebaut (~2–3 Minuten). Danach:

```
http://localhost:3000
```

### 3. Suche konfigurieren

| Feld | Beispiel | Beschreibung |
|------|----------|--------------|
| **Basispfad** | `/repos/welcome/src/IS/packages` | Pfad eintippen oder per **📁 Durchsuchen** navigieren |
| **Suchstrings** | `MyClass` (einer pro Zeile) | Alle gefundenen Zeilen werden angezeigt |
| **Ausschluss-Muster** | `*_TEST` (einer pro Zeile) | Ordner die dem Glob-Muster entsprechen werden übersprungen |

Der **📁 Durchsuchen**-Button öffnet einen Verzeichnis-Browser zum Navigieren durch deine Repositories.

### 4. Ergebnisse exportieren

Nach der Suche kann das Ergebnis als CSV heruntergeladen werden (Spalten: Datei, Zeile, Suchstring, Inhalt).

## App stoppen

```bash
docker compose down
```

## Tipps

- **Branch wechseln**: Repository lokal auf den gewünschten Branch wechseln (`git checkout develop`), dann erneut suchen — der Container liest immer den aktuellen Stand.
- **Mehrere Repos**: Alle Repositories im selben Repos-Ordner liegen lassen und in der UI per Browser navigieren.
- **Große Repositories**: Die Suche läuft synchron. Bei sehr großen Repos (10.000+ Dateien) kann es einige Sekunden dauern.
