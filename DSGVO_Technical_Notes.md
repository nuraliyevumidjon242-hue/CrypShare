# CrypShare – DSGVO-bezogene technische Hinweise (Prototyp)

> **Wichtiger Hinweis:** Dieses Dokument ist eine technische Projektbeschreibung, keine Rechtsberatung, Datenschutz-Folgenabschätzung, Sicherheitszertifizierung oder Bestätigung der DSGVO-Konformität. Das Projekt wurde nicht unabhängig auditiert.

## Aktueller Prototyp

- Dateien werden im Browser mit AES-256-GCM verschlüsselt; Passwörter werden mit PBKDF2/SHA-256 und 100.000 Iterationen abgeleitet.
- Der Server speichert die hochgeladenen Binärpakete sowie Verwaltungsmetadaten. Die Webanwendung verwendet den Dateinamen und weitere Dateimetadaten als authentifizierte Zusatzdaten des verschlüsselten Pakets.
- Der URL-Modus legt das Geheimnis im URL-Fragment ab. Browser senden Fragmente nicht in HTTP-Anfragen; dennoch muss der gesamte Freigabelink geheim gehalten werden.
- Uploads sind auf 50 MiB begrenzt. TTL- und Download-Limits werden serverseitig verwaltet.
- Derzeit sind weder Authentifizierung noch Ratenbegrenzung implementiert. Die Server enthalten keine eigene TLS-Terminierung und sind nicht für den ungeschützten öffentlichen Betrieb vorgesehen.

## Nicht zugesicherte Eigenschaften

- **Keine bestätigte DSGVO-Konformität:** Die tatsächliche Konformität hängt unter anderem von Betreiber, Zweck, Rechtsgrundlage, Aufbewahrung, Auftragsverarbeitung und Betriebsumgebung ab.
- **Keine garantierte Zero-Knowledge-Eigenschaft gegenüber einem aktiven Serverbetreiber:** Ein veränderter oder kompromittierter Webserver könnte manipuliertes Client-JavaScript ausliefern.
- **Keine garantierte physische Löschung:** Überschreiben und Löschen sind best effort. SSD-Wear-Leveling, Snapshots, Backups und Copy-on-Write-Dateisysteme können die Wiederherstellung nicht ausschließen.
- **Keine vollständige Anonymität:** Netzwerk- und Infrastrukturbetreiber können Verbindungsdaten verarbeiten oder protokollieren.
- **Keine QR-Codierung:** Die Matrix in der Oberfläche ist eine dekorative Vorschau und nicht scanbar.

## Vor einem produktiven Einsatz erforderlich

Unabhängige Sicherheitsprüfung, TLS-geschütztes Deployment, Zugriffskontrolle, Raten- und Ressourcenbegrenzungen, belastbares Logging-/Löschkonzept, Abhängigkeits- und Lieferkettenprüfung sowie rechtliche Datenschutzprüfung.
