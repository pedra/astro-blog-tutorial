
// INSTALL  -------------------------------------------------------------------
self.addEventListener('install', (e) => {
	if (!ASSETS || ASSETS.length == 0) {
		console.log(`[SWORKER install] caching "${CACHE}"`)
		self.skipWaiting()
	} else {
		e.waitUntil(
			caches
				.open(CACHE)
				.then((cache) => {
					console.log(`[SWORKER install] caching "${CACHE}"`)
					cache.addAll(ASSETS)
				})
				.then(() => {
					sendMessage({ text: 'install' })
					self.skipWaiting()
				}),
		)
	}
})

// ACTIVATE -------------------------------------------------------------------
self.addEventListener('activate', (e) => {
	if (!ASSETS || ASSETS.length == 0) {
		console.log(`[SWORKER activate] caching "${CACHE}"`)
		e.waitUntil(clients.claim())
	} else {
		e.waitUntil(
			caches.keys().then(async (ks) => {
				for (const k of ks) {
					if (k !== CACHE) {
						console.log(`[SWORKER removing] cache "${k}"`)
						await caches.delete(k)
					}
				}
				sendMessage({ text: 'activate' })
				self.clients.claim()
			}),
		)
	}
})