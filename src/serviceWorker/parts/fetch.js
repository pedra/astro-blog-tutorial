// FETCH   --------------------------------------------------------------------
self.addEventListener('fetch', (event) => {
	const {
		request,
		request: { url, method }
	} = event

	// Save||load json data in Cache Storage CONFIG
	if (url.match(CONFIG)) {
		if (method === 'POST') {
			request
				.json()
				.then((body) =>
					caches
						.open(CACHE)
						.then((cache) =>
							cache.put(
								CONFIG,
								new Response(JSON.stringify(body)),
							)
						)
				)
			return event.respondWith(new Response('{}'))
		} else {
			return event.respondWith(
				caches
					.match(CONFIG)
					.then((response) => response || new Response('{}'))
			)
		}
	} else {
		// Get & save request in Cache Storage
		if (method !== 'POST') {
			event.respondWith(
				caches.open(CACHE).then(async (cache) => {					

					let response = await cache.match(event.request)
					if(response) return response
					
					// To fix 'chrome-extension'
					if (url.startsWith('chrome-extension') ||
						url.includes('extension') ||
						!(url.indexOf('http') === 0))
						return response

					response = await cache.match(event.request.url += 'index.html')
					if(response) return response

					response = await cache.match(event.request.url += '/index.html')
					if(response) return response
					
					response = await fetch(event.request)

					// Youtube API requests to cache ...
					if (url.includes('https://www.youtube.com/iframe_api')) return response
					
					if(ASSETS && ASSETS.length > 0) cache.put(event.request, response.clone())

					return response
				})
			)
		}
	}
})