// Initialize Map
const map = L.map('map', {
    zoomControl: false // Let's customize zoom control position
}).setView([39.833, -98.583], 4);

L.control.zoom({ position: 'bottomright' }).addTo(map);

// Map Layers
const darkLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    subdomains: 'abcd',
    maxZoom: 20
});

const lightLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    subdomains: 'abcd',
    maxZoom: 20
});

// Default to Dark theme
let currentTheme = 'dark';
darkLayer.addTo(map);

// Marker and Map Lines
let marker = L.marker([39.833, -98.583], { draggable: true }).addTo(map);
let sunLine, sunriseLine, sunsetLine;

// Elements
const bodyEl = document.body;
const themeBtn = document.getElementById('theme-toggle');
const latInput = document.getElementById('lat-input');
const lngInput = document.getElementById('lng-input');
const dateInput = document.getElementById('date-input');
const hrInput = document.getElementById('hour-input');
const minInput = document.getElementById('min-input');
const secInput = document.getElementById('sec-input');
const tzInput = document.getElementById('tz-input');

const overlayLatLng = document.getElementById('overlay-latlng');
const eqTimeVal = document.getElementById('eq-time-val');
const solarDecVal = document.getElementById('solar-dec-val');
const noonVal = document.getElementById('solar-noon-val');
const riseVal = document.getElementById('sunrise-val');
const setVal = document.getElementById('sunset-val');
const azElVal = document.getElementById('az-el-val');
const currentBtn = document.getElementById('current-time-btn');
const timeInputRow = document.querySelector('.time-row');

// Real-time tracking Element
const realtimeBtn = document.getElementById('realtime-btn');
let realtimeInterval = null;

// Handle Theme Toggle
themeBtn.addEventListener('click', () => {
    if (currentTheme === 'dark') {
        currentTheme = 'light';
        bodyEl.setAttribute('data-theme', 'light');
        themeBtn.innerHTML = '<i class="fas fa-moon"></i>';
        map.removeLayer(darkLayer);
        lightLayer.addTo(map);
    } else {
        currentTheme = 'dark';
        bodyEl.setAttribute('data-theme', 'dark');
        themeBtn.innerHTML = '<i class="fas fa-sun"></i>';
        map.removeLayer(lightLayer);
        darkLayer.addTo(map);
    }
});

// Setup current time
function setCurrentTime() {
    const nowLocal = new Date();
    // Format YYYY-MM-DD
    const yyyy = nowLocal.getFullYear();
    const mm = String(nowLocal.getMonth() + 1).padStart(2, '0');
    const dd = String(nowLocal.getDate()).padStart(2, '0');
    dateInput.value = `${yyyy}-${mm}-${dd}`;

    hrInput.value = nowLocal.getHours();
    minInput.value = nowLocal.getMinutes();
    secInput.value = nowLocal.getSeconds();

    // getTimezoneOffset is in minutes, where positive is behind UTC (e.g. EST is 300)
    const tzOffsetHours = -(nowLocal.getTimezoneOffset() / 60);
    tzInput.value = tzOffsetHours;

    updateAll();
}

// NOAA Math helper functions
const rad = (deg) => deg * Math.PI / 180;
const deg = (rad) => rad * 180 / Math.PI;

function calcJD(year, month, day) {
    if (month <= 2) {
        year -= 1;
        month += 12;
    }
    const A = Math.floor(year / 100);
    const B = 2 - A + Math.floor(A / 4);
    return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + B - 1524.5;
}

function calcTimeJulianCent(jd) {
    return (jd - 2451545.0) / 36525.0;
}

function calcEqAndDec(dateObj) {
    const year = dateObj.getUTCFullYear();
    const month = dateObj.getUTCMonth() + 1;
    const day = dateObj.getUTCDate();
    const jd = calcJD(year, month, day);
    // Add fraction of day based on UTC time
    const fracDay = (dateObj.getUTCHours() + dateObj.getUTCMinutes() / 60 + dateObj.getUTCSeconds() / 3600) / 24.0;
    const tnom = calcTimeJulianCent(jd + fracDay);

    const e0 = 23.0 + (26.0 + ((21.448 - tnom * (46.8150 + tnom * (0.00059 - tnom * 0.001813))) / 60.0)) / 60.0;
    const omega = 125.04 - 1934.136 * tnom;
    const epsilon = e0 + 0.00256 * Math.cos(rad(omega));

    let l0 = 280.46646 + tnom * (36000.76983 + tnom * 0.0003032);
    while (l0 > 360) l0 -= 360;
    while (l0 < 0) l0 += 360;

    const m = 357.52911 + tnom * (35999.05029 - 0.0001537 * tnom);
    const e = 0.016708634 - tnom * (0.000042037 + 0.0000001267 * tnom);

    const mrad = rad(m);
    const c = Math.sin(mrad) * (1.914602 - tnom * (0.004817 + 0.000014 * tnom)) + Math.sin(rad(m * 2)) * (0.019993 - 0.000101 * tnom) + Math.sin(rad(m * 3)) * 0.000289;

    const trueLong = l0 + c;
    const appLong = trueLong - 0.00569 - 0.00474 * Math.sin(rad(omega));

    const declination = deg(Math.asin(Math.sin(rad(epsilon)) * Math.sin(rad(appLong))));

    let y = Math.tan(rad(epsilon) / 2.0);
    y *= y;

    const sin2l0 = Math.sin(2.0 * rad(l0));
    const sinm = Math.sin(rad(m));
    const cos2l0 = Math.cos(2.0 * rad(l0));
    const sin4l0 = Math.sin(4.0 * rad(l0));
    const sin2m = Math.sin(2.0 * rad(m));

    const Etime = y * sin2l0 - 2.0 * e * sinm + 4.0 * e * y * sinm * cos2l0 - 0.5 * y * y * sin4l0 - 1.25 * e * e * sin2m;
    const eqOfTimeMin = deg(Etime) * 4.0;

    return { eqTime: eqOfTimeMin, declination: declination };
}

// Utility to format date for display in the timezone of the user offset
function formatTimeInTz(dateParam, tzOffsetHours) {
    if (!dateParam || isNaN(dateParam)) return "--";
    // dateParam is a real UTC Date object. We shift it by offset to show correct strings.
    const shifted = new Date(dateParam.getTime() + (tzOffsetHours * 60 * 60 * 1000));

    const hh = String(shifted.getUTCHours()).padStart(2, '0');
    const mm = String(shifted.getUTCMinutes()).padStart(2, '0');
    const ss = String(shifted.getUTCSeconds()).padStart(2, '0');
    return { hh, mm, ss };
}

function getDestinationPoint(lat, lng, brng, dist) {
    // Calculates destination point from a location, distance and bearing.
    const R = 6371e3; // Earth radius in meters
    const brngRad = brng * Math.PI / 180;
    const latRad = lat * Math.PI / 180;
    const lngRad = lng * Math.PI / 180;

    const lat2 = Math.asin(Math.sin(latRad) * Math.cos(dist / R) +
        Math.cos(latRad) * Math.sin(dist / R) * Math.cos(brngRad));
    const lng2 = lngRad + Math.atan2(Math.sin(brngRad) * Math.sin(dist / R) * Math.cos(latRad),
        Math.cos(dist / R) - Math.sin(latRad) * Math.sin(lat2));

    return [lat2 * 180 / Math.PI, lng2 * 180 / Math.PI];
}

function drawAngles(lat, lng, curAz, srAz, ssAz) {
    if (sunLine) map.removeLayer(sunLine);
    if (sunriseLine) map.removeLayer(sunriseLine);
    if (sunsetLine) map.removeLayer(sunsetLine);

    const dist = 3000000; // 3000 km map line distance radius

    if (srAz != null) {
        let pt = getDestinationPoint(lat, lng, srAz, dist);
        sunriseLine = L.polyline([[lat, lng], pt], { color: '#f59e0b', dashArray: '5, 10', weight: 2 }).addTo(map);
    }

    if (ssAz != null) {
        let pt = getDestinationPoint(lat, lng, ssAz, dist);
        sunsetLine = L.polyline([[lat, lng], pt], { color: '#f43f5e', dashArray: '5, 10', weight: 2 }).addTo(map);
    }

    // Only draw current sun azimuth if sun has an altitude? No, always draw its direction.
    if (curAz != null) {
        let pt = getDestinationPoint(lat, lng, curAz, dist);
        sunLine = L.polyline([[lat, lng], pt], { color: '#ffd700', weight: 4 }).addTo(map);
    }
}


function updateAll() {
    const lat = parseFloat(latInput.value);
    const lng = parseFloat(lngInput.value);
    const tzOffsetHours = parseFloat(tzInput.value) || 0;

    // Update map marker
    if (!isNaN(lat) && !isNaN(lng)) {
        marker.setLatLng([lat, lng]);
        overlayLatLng.innerText = `${lat.toFixed(3)}, ${lng.toFixed(3)}`;
    }

    const ymd = dateInput.value.split('-');
    if (ymd.length !== 3) return;
    const hr = parseInt(hrInput.value) || 0;
    const min = parseInt(minInput.value) || 0;
    const sec = parseInt(secInput.value) || 0;

    // Create a real UTC moment
    const d = new Date(Date.UTC(ymd[0], ymd[1] - 1, ymd[2], hr, min, sec));
    const realUTC = new Date(d.getTime() - (tzOffsetHours * 60 * 60 * 1000));

    // Equation of Time & Solar Declination (NOAA Tools exact logic)
    const exactSolarParams = calcEqAndDec(realUTC);
    eqTimeVal.innerText = exactSolarParams.eqTime.toFixed(2);
    solarDecVal.innerText = exactSolarParams.declination.toFixed(2);

    // Using Suncalc for Sun phases and position geometry
    if (typeof SunCalc !== 'undefined' && !isNaN(lat) && !isNaN(lng)) {
        const times = SunCalc.getTimes(realUTC, lat, lng);
        const pos = SunCalc.getPosition(realUTC, lat, lng);

        // Position
        let az = pos.azimuth * 180 / Math.PI + 180; // SunCalc is 0=South, making 0=North
        let el = pos.altitude * 180 / Math.PI;
        azElVal.innerText = `${az.toFixed(2)}° / ${el.toFixed(2)}°`;

        let srAz = null, ssAz = null;

        if (times.solarNoon) {
            const sn = formatTimeInTz(times.solarNoon, tzOffsetHours);
            noonVal.innerText = `${sn.hh}:${sn.mm}:${sn.ss}`;
        }
        if (times.sunrise) {
            const sr = formatTimeInTz(times.sunrise, tzOffsetHours);
            riseVal.innerText = `${sr.hh}:${sr.mm}`;
            srAz = SunCalc.getPosition(times.sunrise, lat, lng).azimuth * 180 / Math.PI + 180;
        } else {
            riseVal.innerText = "--:--";
        }
        if (times.sunset) {
            const ss = formatTimeInTz(times.sunset, tzOffsetHours);
            setVal.innerText = `${ss.hh}:${ss.mm}`;
            ssAz = SunCalc.getPosition(times.sunset, lat, lng).azimuth * 180 / Math.PI + 180;
        } else {
            setVal.innerText = "--:--";
        }

        drawAngles(lat, lng, az, srAz, ssAz);
    }
}


function toggleRealtime() {
    if (realtimeInterval) {
        clearInterval(realtimeInterval);
        realtimeInterval = null;
        realtimeBtn.classList.remove('active');
        realtimeBtn.innerHTML = '<i class="fas fa-play"></i> Real-Time Tracker';
        dateInput.disabled = false;
        hrInput.disabled = false;
        minInput.disabled = false;
        secInput.disabled = false;
        timeInputRow.style.opacity = '1';
    } else {
        dateInput.disabled = true;
        hrInput.disabled = true;
        minInput.disabled = true;
        secInput.disabled = true;
        timeInputRow.style.opacity = '0.5';
        realtimeBtn.classList.add('active');
        realtimeBtn.innerHTML = '<i class="fas fa-stop"></i> Stop Tracker';

        setCurrentTime();
        realtimeInterval = setInterval(() => {
            setCurrentTime();
        }, 1000);
    }
}


// Events
map.on('click', function (e) {
    latInput.value = e.latlng.lat.toFixed(3);
    lngInput.value = e.latlng.lng.toFixed(3);
    updateAll();
});

marker.on('dragend', function (e) {
    const latlng = marker.getLatLng();
    latInput.value = latlng.lat.toFixed(3);
    lngInput.value = latlng.lng.toFixed(3);
    updateAll();
});

const inputs = [latInput, lngInput, dateInput, hrInput, minInput, secInput, tzInput];
inputs.forEach(input => input.addEventListener('input', () => {
    // If user changes something manually, disable realtime tracker automatically
    if (realtimeInterval && (input === dateInput || input === hrInput || input === minInput || input === secInput)) {
        // Disable tracker
    } else {
        updateAll();
    }
}));

currentBtn.addEventListener('click', () => {
    if (realtimeInterval) toggleRealtime(); // stop it if running just to set to now exactly once
    setCurrentTime();
});

realtimeBtn.addEventListener('click', toggleRealtime);

// Init
setCurrentTime();
