# ESPECTRO · Earth Transcendental Ops

Centro de comando planetário 3D em tempo real.  
Base transcendental sobre o [Earth Operations](https://maw-vitrine-plaza.vercel.app/earth-ops.html) do ESPECTRO.

**Single-file · IA-first · APIs abertas · cinematográfico**

## Ao vivo

Abra `index.html` em qualquer servidor estático (ou abra direto no navegador com restrições de CORS em mente para algumas APIs).

Deploy sugerido: Vercel / Netlify / GitHub Pages apontando para a raiz.

## Módulos A–G (ordem iniciática)

| Módulo | Domínio |
|--------|---------|
| **A** | Globo base + Hero planetário |
| **B** | Tráfego aéreo ADS-B (OpenSky) |
| **C** | Sismos USGS 24h |
| **D** | Eventos naturais NASA EONET |
| **E** | ISS ao vivo (seguir câmera) |
| **F** | Satélites (visual CelesTrak) |
| **G** | Google Photorealistic 3D Tiles (requer chave) |

Céu = pré-limite · Atmosfera (medidor de altura) = limite inferior.  
Emanam da tríade operacional 8·9·10.

## Controles

- **H** — Hero view  
- **T** — Tour mundial cinematográfico  
- **I** — Seguir / parar ISS  
- **G** — Toggle Google Photoreal  
- **⌘K / Ctrl+K** — Command palette  
- Arrastar / roda — navegar  
- Clique em entidade — painel de objeto  
- Isolar — uma camada por vez  
- Snapshot — PNG da cena  
- **Origem** — abre o Earth Ops original  

## URL state

```
#layers=flights,quakes,iss&iss=1
```

Compartilhável. Restaura camadas e modo ISS.

## APIs

| Fonte | Uso |
|-------|-----|
| Cesium ion (token avaliação) | Terreno / imagery |
| USGS | Sismos |
| NASA EONET | Eventos naturais |
| OpenSky | Voos |
| where-the-iss.at | ISS |
| CelesTrak | Satélites (visual) |
| Google Maps Platform | Photoreal 3D (opcional, chave própria) |

## Para IAs

- Arquivo único `index.html` — importável.  
- Camadas isoláveis, briefing automático, estado por hash.  
- Pronto para estender: AIS, FIRMS, RainViewer, SGP4 real, WebSocket.  
- Design alinhado ao protocolo IA-first do ESPECTRO.

## Origem

Template e filosofia: [maw-vitrine-plaza / earth-ops](https://maw-vitrine-plaza.vercel.app/earth-ops.html)

---

*v2 · refined · transcendental object online*
