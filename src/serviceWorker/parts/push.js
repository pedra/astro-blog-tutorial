// PUSH   ---------------------------------------------------------------------
self.addEventListener('push', (event) => {
	event.waitUntil(
		self.clients.matchAll().then((clientList) => {
			console.log(
				`[SWORKER push] Push had this data: "${event.data.text()}"`,
			)

			var focused = clientList.some((client) => {
				client.postMessage({ msg: event.data.json(), type: 'push' })
				return client.focused
			})

			var msg = {
				title: 'error',
				body: 'Ocorreu um erro no envio de notificação!',
			}
			try {
				msg = event.data.json()
			} finally { /* empty */ }

			// Focus ...
			if (focused) {
				msg.body += "You're still here, thanks!"
			} else if (clientList.length > 0) {
				msg.body +=
					"You haven't closed the page, click here to focus it!"
			} else {
				msg.body +=
					'You have closed the page, click here to re-open it!'
			}

			const title = msg.title
			const options = {
				body: msg.body || 'New message from the server',
				icon: msg.icon || '/icon/android-chrome-192x192.png',
				badge: msg.badge || '/icon/favicon-32x32.png',
				image: msg.image || '/images/headshot.jpg',
				vibrate: msg.vibrate || [],
				data: JSON.parse(
					'undefined' == typeof msg['data'] ? false : msg['data'],
				),
			}

			return self.registration.showNotification(title, options)
		}),
	)
})

// NOTIFICATION CLICK ---------------------------------------------------------
self.addEventListener('notificationclick', (event) => {
	event.waitUntil(
		self.clients.matchAll().then((clientList) => {
			// console.log(
			// 	'[SWORKER notification] Notification click Received.',
			// 	clientList,
			// 	event.notification.data,
			// )

			var data =
				'undefined' !== typeof event.notification['data']
					? event.notification.data
					: {}

			event.notification.close()

			if (clientList.length > 0) {
				clientList[0].focus()
				return clientList[0].postMessage({
					msg: data,
					type: 'clientList[0]',
				})
			} else {
				self.clients
					.openWindow('/profile')
					.then((c) => {
						// console.log('[SWORKER client] OpenWindow: ', c)
						return c
					})
					.then((a) => {
						return a.postMessage({
							msg: data,
							type: 'clientList - clients - c',
						})
					})
			}
		}),
	)
})