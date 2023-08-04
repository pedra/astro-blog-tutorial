// SYNC -----------------------------------------------------------------------

/**
 * TODO: Create a periodic sync.
 * 
 * see: https://learn.microsoft.com/pt-br/microsoft-edge/progressive-web-apps-chromium/how-to/background-syncs#use-the-periodic-background-sync-api-to-regularly-get-fresh-content
 * 
 * This is a simple example of what can be done with Background Sync.
 * Implement this feature yourself according to the needs of your project.
 * 
 */
self.addEventListener('periodicsync', (event) => {
	console.log('[SWORKER sync] Periodic Sync',  event)
	if (event.tag === 'get-daily-news') {
		//event.waitUntil(getDailyNewsInCache())
	}
})