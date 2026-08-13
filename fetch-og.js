fetch('https://www.wearimpulsive.site').then(r=>r.text()).then(t=>{ const m = t.match(/<meta property="og:image" content="([^"]+)"/); if (m) console.log(m[1]); })
