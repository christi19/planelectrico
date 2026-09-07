// PlanEléctrico Pro — service worker (cache-first, offline total)
const C="planelectrico-v64";
// Lo que la app NO puede no tener. Se guarda con addAll: si esto falla, la
// instalacion tiene que fallar de verdad.
const NUCLEO=["./","./index.html"];
// Lo demas es adorno (iconos, manifiesto). addAll es todo-o-nada: un solo icono
// que no llegue tumbaba la instalacion ENTERA y dejaba la PWA sin offline, en
// silencio y sin que nadie se enterara. Va aparte y tolerando fallos.
const ADORNO=["./manifest.webmanifest","./icon-192.png","./icon-512.png","./apple-touch-icon.png"];
// cache:"reload" salta el cache HTTP del navegador. Sin esto, subir el numero de
// version NO curaba nada: GitHub Pages sirve el HTML con max-age=600, asi que el
// service worker nuevo volvia a guardar el HTML VIEJO en el cache nuevo y el
// usuario quedaba clavado igual. Medido publicando una version nueva y viendo
// que el navegador seguia sirviendo la vieja despues del bump.
const fresco=u=>new Request(u,{cache:"reload"});
self.addEventListener("install",e=>{
  e.waitUntil(caches.open(C).then(c=>
    c.addAll(NUCLEO.map(fresco))
     .then(()=>Promise.allSettled(ADORNO.map(u=>c.add(fresco(u)))))
  ).then(()=>self.skipWaiting()));
});
self.addEventListener("activate",e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET")return;
  e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(r=>r||fetch(e.request).then(res=>{
    const cp=res.clone(); caches.open(C).then(c=>c.put(e.request,cp)); return res;
  }).catch(()=>caches.match("./index.html"))));
});
