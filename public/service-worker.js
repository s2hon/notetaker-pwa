const { response } = require("express");

const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";

const FILES_TO_CACHE = [
    '/',
    '/index.html',
    '/favicon.ico',
    '/manifest.webmanifest',
    '/app.js',
    '/assets/images/icons/icon-72x72.png',
    '/assets/images/icons/icon-96x96.png',
    '/assets/images/icons/icon-128x128.png',
    '/assets/images/icons/icon-144x144.png',
    '/assets/images/icons/icon-152x152.png',
    '/assets/images/icons/icon-192x192.png',
    '/assets/images/icons/icon-384x384.png',
    '/assets/images/icons/icon-512x512.png'
];

//install 
self.addEventListener("install", function(evt) {
    evt.waitUntil(caches.open(DATA_CACHE_NAME)
    .then((cache) => cache.add("/all"))
    );

    evt.waitUntil(
        caches.open(CACHE_NAME)
        .then((cache) => cache.addAll(FILES_TO_CACHE))
    );

    self.skipWaiting();
})

//activate
self.addEventListener("activate", function(evt) {
    evt.waitUntil(
        caches.keys().then(
            keyList => {
                return Promise.all(
                    keyList.map(key => {
                        if (key !== CACHE_NAME && key !== DATA_CACHE_NAME){
                            console.log("removing old cache data", key);
                            return caches.delete(key);
                        }
                    })
                )
            }
        )
    )
    self.clients.claim();
})

self.addEventListener("fetch", function(evt){
    if(evt.request.url.includes("/all")){
        evt.respondWith(
            caches.open(DATA_CACHE_NAME).then(
                cache => {
                    return fetch(evt.request)
                    .then( res=> {
                        if (res.status === 200) {
                            cache.put(cache.match(evt.request.url), res.clone());
                        }
                        return res;
                    })
                    .catch(err =>{
                        return cache.match(evt.request);
                    });
                }
            ).catch(err=> console.log(err))
        );
        return;
    }

    evt.respondWith(
        caches.open(CACHE_NAME).then(cache => {
            return cache.match(evt.request).then(res => {
                return res || fetch(evt.request)
            })
        })
    )
})

