# Disaster Response App

Build a browser-based web app that works offline using PouchDB and syncs data to CouchDB when internet is available — ideal for disaster zones or remote areas.

A Flask-based incident reporting tool with offline sync via PouchDB and CouchDB. Includes geolocation capture, systemd integration, and CouchDB setup.
--------------------------------------------------------------------------------------------------------------------------

Disaster Reporting App Setup Guide
==================================

🆘 Overview:
This project sets up a Flask-based disaster incident reporting system with offline-first capabilities using PouchDB and CouchDB. Designed for field use in disaster zones, it enables local data capture and syncs to a central CouchDB server when online.

Features:
- Incident reporting via web form
- Offline storage using PouchDB
- Automatic sync with CouchDB
- CORS-enabled CouchDB backend
- Flask API with CORS support

System Requirements:
- RHEL 8/9 VM (e.g., blrsatprod02)
- Python 3, pip
- CouchDB 3.5+
- firewalld
- Git, curl, wget, vim
=========================================
✅ Deployment-Ready Repo Structure
disaster-response-app/
├── app.py
├── requirements.txt
├── environment.yaml
├── disaster_app.service
├── static/
│   ├── index.html
│   ├── main.js
│   └── pouchdb.min.js
├── .gitignore
├── README.md
=======================================

Installation Steps
==================

1. System Preparation
---------------------
dnf install -y git curl wget vim firewalld
dnf install -y python3 python3-pip
python3 -m venv venv

2. Switch to Deploy User
------------------------
su - deploy
python3 -m venv venv
source venv/bin/activate

3. Enable EPEL & CRB
--------------------
sudo dnf install -y epel-release
sudo rpm -Uvh https://dl.fedoraproject.org/pub/epel/epel-release-latest-8.noarch.rpm
/usr/bin/crb enable
dnf makecache

4. Install CouchDB
------------------
sudo yum-config-manager --add-repo https://couchdb.apache.org/repo/couchdb.repo
sudo dnf install -y couchdb

5. Configure CouchDB CORS
-------------------------
Edit /opt/couchdb/etc/local.ini and add:

[httpd]
enable_cors = true

[cors]
credentials = true
origins = *
headers = accept, authorization, content-type, origin
methods = GET, PUT, POST, HEAD, DELETE

6. Enable CouchDB & Firewall
----------------------------
systemctl enable --now couchdb
firewall-cmd --add-port=5984/tcp --permanent
firewall-cmd --reload

Flask App Setup
===============

1. Create Project Directory
---------------------------
mkdir disaster_app && cd disaster_app
python3 -m venv venv
source venv/bin/activate

2. Install Dependencies
-----------------------
pip install flask flask-cors

3. Download PouchDB
-------------------
mkdir static
wget https://cdn.jsdelivr.net/npm/pouchdb@7.3.1/dist/pouchdb.min.js -O static/pouchdb.min.js

Frontend Logic (static/main.js)
===============================

const db = new PouchDB('disaster_app');

document.getElementById('incidentForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const incident = {
    _id: new Date().toISOString(),
    type: 'incident',
    description: document.getElementById('description').value,
    severity: document.getElementById('severity').value,
    timestamp: new Date().toISOString()
  };

  db.put(incident).then(() => {
    document.getElementById('status').innerText = "Incident saved locally!";
  }).catch(err => {
    console.error(err);
    document.getElementById('status').innerText = "Error saving incident.";
  });
});

// Sync with CouchDB when online
db.sync('http://admin:vmware@192.168.137.5:5984/disaster_app', {
  live: true,
  retry: true
});
