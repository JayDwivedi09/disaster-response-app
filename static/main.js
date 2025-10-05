document.addEventListener('DOMContentLoaded', function () {
  const db = new PouchDB('disaster_app');

  let latitude = null;
  let longitude = null;

  // Request location early
  navigator.geolocation.getCurrentPosition(function(position) {
    latitude = position.coords.latitude;
    longitude = position.coords.longitude;
    console.log("📍 Location acquired:", latitude, longitude);
  }, function(error) {
    console.error("❌ Geolocation error:", error);
  });

  // Handle form submission
  document.getElementById('incidentForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const incident = {
      _id: new Date().toISOString(),
      type: 'incident',
      description: document.getElementById('description').value,
      severity: document.getElementById('severity').value,
      latitude: latitude || "unknown",
      longitude: longitude || "unknown",
      timestamp: new Date().toISOString()
    };

    db.put(incident).then(() => {
      document.getElementById('status').innerText = "✅ Incident saved locally!";
    }).catch(err => {
      console.error("❌ Error saving incident:", err);
      document.getElementById('status').innerText = "❌ Error saving incident.";
    });
  });

  // Sync with CouchDB
  db.sync('http://admin:vmware@192.168.137.5:5984/disaster_app', {
    live: true,
    retry: true
  }).on('change', info => {
    console.log("🔄 Sync change:", info);
  }).on('paused', () => {
    console.log("⏸️ Sync paused (offline or idle)");
  }).on('active', () => {
    console.log("▶️ Sync resumed");
  }).on('error', err => {
    console.error("❌ Sync error:", err);
  });
});

