# KI-Nutzung bei der Entwicklung

## Ziel

Dieses Projekt wurde mit punktueller KI-Unterstuetzung entwickelt, um schneller zu iterieren, Fehler frueh zu finden und UI-Verbesserungen konsistent umzusetzen.

## Wo KI konkret eingesetzt wurde

### 1. Frontend-Umsetzung und Refactoring

- Vorschlaege fuer die Struktur der Admin-Seite wurden genutzt, um die Seite von einer grossen Datei in wiederverwendbare Module zu trennen.
- Dialoge (Create/Edit/Confirm) wurden als eigenstaendige Komponenten ausgelagert, damit Logik und UI besser wartbar sind.

### 2. Fehleranalyse und Debugging

- Laufzeitfehler wie JSON-Parsing-Probleme und Null-Zugriffe in Route-Guards wurden mit KI-Hinweisen schneller lokalisiert.
- React-Warnungen (State-Updates waehrend Render) wurden mit KI-Hilfe in saubere Effect-Patterns ueberfuehrt.

### 3. Daten-Mapping zwischen Backend und Frontend

- Die KI half dabei, API-Felder korrekt auf Frontend-Modelle zu mappen (z. B. owner_id zu userId, Status-Normalisierung).
- Dadurch funktionieren Filter- und Anzeige-Logik in der Admin-Ansicht konsistent.

### 4. UX-Verbesserungen

- KI wurde genutzt, um Admin-spezifische Navigation und bestaetigende Loesch-Dialoge umzusetzen.
- Ziel war eine sichere Bedienung bei kritischen Aktionen wie Loeschen.

## Grenzen der KI-Nutzung

- Fachliche Entscheidungen und finale Implementierung wurden manuell geprueft.
- Kritische API- und Sicherheitslogik wurde nicht blind uebernommen, sondern an bestehende Backend-Routen angepasst.
- Alle KI-Vorschlaege wurden als Entwurf betrachtet und in den Projektkontext eingeordnet.

## Nutzen im Projekt

- Schnellere Umsetzung wiederkehrender Muster
- Bessere Lesbarkeit durch modulare Komponenten
- Schnellere Fehlersuche bei Integrationsproblemen
- Konsistentere UI-Interaktionen im Admin-Bereich
