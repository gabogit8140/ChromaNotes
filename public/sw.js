/**
 * EMERGENCY KILL SWITCH SERVICE WORKER
 * This script forces the unregistration of any existing Service Workers
 * to resolve the "Broken PWA" state causing 404s/Network Errors.
 */
self.addEventListener('install', () => {
    // Take over immediately
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    // Claim all clients (open tabs)
    event.waitUntil(
        self.clients.claim().then(() => {
            // Unregister this service worker to clean slate
            self.registration.unregister().then(() => {
                console.log('Broken Service Worker unregistered successfully.');
                // Force reload all clients to get fresh network resources
                self.clients.matchAll().then(clients => {
                    clients.forEach(client => client.navigate(client.url));
                });
            });
        })
    );
});

// Pass-through for any requests caught during the brief transition
self.addEventListener('fetch', (event) => {
    event.respondWith(fetch(event.request));
});
