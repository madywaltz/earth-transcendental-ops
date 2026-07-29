# ARCHITECTURE · Earth Transcendental Ops

## Identity

Planetary command terminal. CesiumJS. Real-time layers. Cinematic. IA-first.
Transcendental evolution of ESPECTRO Earth Operations.

Not a demo. Not a map toy. An operational object.

## Non-negotiables

1. **No Vercel deploy from this agent.** Deploy thrashing risks bans and wastes cycles.
2. **Source of truth:** this GitHub repository.
3. **Modular structure only:**
   - `index.html` — shell, DOM, Cesium CDN
   - `ops.css` — HUD, cinematic chrome
   - `ops.js` — entire engine
4. **Monolith backup** lives only in session artifacts when needed. Never the primary form.
5. **Code only when certain.** What · how · excellence level · why · final form · path.

## Modules A–G (initiatory order)

| Code | Domain | Source |
|------|--------|--------|
| A | Globe base + Hero | Cesium World Terrain |
| B | ADS-B traffic | OpenSky Network |
| C | Earthquakes | USGS 2.5+ 24h |
| D | Natural events | NASA EONET |
| E | ISS live + follow | where-the-iss.at |
| F | Stations visual | CelesTrak (positions illustrative) |
| G | Photoreal 3D | Google tiles (requires API key) |

Sky = pré-limite. Atmosphere height gauge = limite inferior.
Emanate from operational triad 8·9·10.

## State

- Layer visibility + ISS follow → URL hash (`#l=flights,quakes,iss&i=1`)
- Entities held in `S.E.*`, toggled via `show`
- Polling intervals: flights ~15s, ISS ~5s, quakes ~3min, briefing ~45s

## Runtime guarantees

- `Promise.allSettled` on boot feeds — one dead API does not kill the globe
- Empty catch on layer fetches — silent degradation
- Entity remove-before-add on refresh (flights, quakes, eonet)
- ISS entity updated in place
- Cesium ion eval token (expires ~Sep 2026) — replace for production

## Known limits (accepted)

- Sats: visual only, not true SGP4 orbits
- Google Photoreal: needs own Maps Platform key
- OpenSky: rate limits / CORS from some origins
- No backend / WebSocket yet

## Excellence path (ordered)

1. ~~Modular split + full engine on GitHub~~ DONE
2. Architecture freeze (this file) DONE
3. Harden entity lifecycle + loading states
4. True SGP4 for stations (satellite.js)
5. Optional layers: AIS, FIRMS, RainViewer
6. Module H: embed original Earth Ops
7. Production ion token + GitHub Pages (manual, human)

## How to run

Any static host. Or open folder via local server.
GitHub Pages: Settings → Pages → main branch root.

## Origin

Philosophy and template: maw-vitrine-plaza / earth-ops.html

---

Frozen 2026-07-29. Code continues only along the excellence path.
