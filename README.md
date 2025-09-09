# Školní hlasování – PWA

Jednoduchá webová aplikace pro hlasování žáků.  
- Funguje jako PWA (lze ji nainstalovat na mobil).  
- Ukládá hlasy offline a po připojení je odešle.  
- Hlasy se ukládají do Google Sheetu přes Apps Script backend.

## Soubory
- index.html – hlavní stránka aplikace
- app.js – logika aplikace
- sw.js – service worker (offline podpora)
- manifest.webmanifest – PWA manifest
- icons/ – ikony aplikace

## Backend
- `Code.gs` je nahraný v Google Apps Scriptu.
- V `app.js` je nutné nastavit `API_BASE` na URL Apps Scriptu.
