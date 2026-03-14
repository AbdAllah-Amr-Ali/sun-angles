# Modern NOAA Solar Calculator

![NOAA Solar Calculator](https://img.shields.io/badge/Status-Complete-success.svg)
![License](https://img.shields.io/badge/License-MIT-blue.svg)

A modern, highly accurate, and visually stunning web application for real-time solar tracking and astronomical calculations, inspired by the original NOAA (National Oceanic and Atmospheric Administration) Solar Calculator.

## 🌟 Features

*   **Precision Astronomical Algorithms:** Utilizes rigorous Julian date math and algorithms derived from NOAA's models to accurately compute:
    *   Equation of Time
    *   Solar Declination
    *   Solar Noon
    *   Apparent Sunrise and Sunset
*   **Real-Time Solar Tracking:** Activate the "Real-Time Tracker" to automatically observe the sun's sweeping movement across the map by recalculating solar angles every second.
*   **Interactive Cartography:** Powered by Leaflet.js, featuring an interactive map to effortlessly select any latitude and longitude across the globe.
*   **Visualizing Solar Angles:** Dynamically plots Sun Azimuth, Sunrise Azimuth, and Sunset Azimuth directly onto the map as interactive polylines.
*   **Glassmorphism UI:** A sleek, premium, and responsive user interface utilizing CSS variables and backdrop filters.
*   **Theme Engine:** Seamlessly switch between dark mode and light mode, immediately reflecting changes across the map tiles and interface elements.
*   **Timezone Aware:** Automatically parses dates, times, and offsets, allowing accurate tracking of local solar events regardless of your global position.

## 🛠️ Technology Stack

This application is built with a lightweight, completely client-side vanilla stack:

*   **HTML5 & CSS3:** For the structural foundation and advanced aesthetic styling (CSS Variables, Flexbox, Grid).
*   **Vanilla ES6 JavaScript:** Handling all UI interactions and mathematical coordinate parsing without the overhead of heavy SPA frameworks.
*   **Leaflet.js:** An open-source JavaScript library for mobile-friendly interactive maps.
*   **SunCalc:** A miniature, highly effective library for calculating sun position, sunlight phases (times for sunrise, sunset, dusk, etc.), moon position and lunar phase.
*   **FontAwesome:** For rich, scalable vector icons.
*   **Google Fonts:** Utilizing 'Outfit' for a modern, highly legible typographic experience.

## 🚀 Getting Started

Because this application relies entirely on client-side processing, no build steps, servers, or dependencies are required to run it locally.

### Installation & Execution

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/sun-angles.git
    cd sun-angles
    ```

2.  **Run the Application:**
    Simply open the `index.html` file in any modern web browser.
    ```bash
    # (Mac)
    open index.html

    # (Windows)
    start index.html

    # (Linux)
    xdg-open index.html
    ```

## 🗺️ How to Use

1.  **Set Location:** Drag the map marker, click anywhere on the map, or manually type in the Latitude and Longitude to set your observer's coordinates.
2.  **Set Time:** Enter a specific Date, Local Time, and UTC Offset. 
3.  **View Results:** The "Solar Data" panel immediately updates with the exact Equation of Time, Declination, Solar Noon, Apparent Sunrise, Apparent Sunset, and immediate Azimuth/Elevation.
4.  **Visualize:** Observe the map legend; the lines protruding from your marker visually describe the exact compass heading of the sun and its rising/setting vectors.
5.  **Track in Real-Time:** Click the play button icon labeled "Real-Time Tracker" to let the application continuously update to the current second.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! 
Feel free to check the [issues page](https://github.com/yourusername/sun-angles/issues).

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
