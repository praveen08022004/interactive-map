 // Initialize the map centered on India
        const map = L.map('map').setView([20.5937, 78.9629], 5);
        
        // Base layers
        const baseLayers = {
            osm: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }),
            satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
            }),
            terrain: L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
                attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
            }),
            dark: L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            })
        };
        
        // Add default base layer
        baseLayers.osm.addTo(map);
        
        // Layer control
        L.control.layers(baseLayers).addTo(map);
        
        // Marker layer
        const markers = L.layerGroup().addTo(map);
        
        // Drawing tools
        let drawnItems = new L.FeatureGroup();
        map.addLayer(drawnItems);
        
        const drawControl = new L.Control.Draw({
            edit: {
                featureGroup: drawnItems
            },
            draw: {
                polygon: {
                    shapeOptions: {
                        color: '#3a86ff'
                    },
                    allowIntersection: false,
                    showArea: true
                },
                polyline: {
                    shapeOptions: {
                        color: '#3a86ff'
                    }
                },
                rectangle: {
                    shapeOptions: {
                        color: '#3a86ff'
                    }
                },
                circle: {
                    shapeOptions: {
                        color: '#3a86ff'
                    }
                },
                marker: false // We'll handle markers separately
            }
        });
        
        // Route planning
        let routeControl = null;
        let routeWaypoints = [];
        
        // Measurement display
        const measurementDisplay = document.getElementById('measurement-display');
        
        // DOM Elements
        const sidebar = document.getElementById('sidebar');
        const sidebarToggle = document.getElementById('sidebar-toggle');
        const fromSearch = document.getElementById('from-search');
        const toSearch = document.getElementById('to-search');
        const fromResults = document.getElementById('from-results');
        const toResults = document.getElementById('to-results');
        const searchRouteBtn = document.getElementById('search-route');
        const searchRouteSidebarBtn = document.getElementById('search-route-btn');
        const routeInfo = document.getElementById('route-info');
        const routeDistance = document.getElementById('route-distance');
        const routeTime = document.getElementById('route-time');
        const weatherWidget = document.getElementById('weather-widget');
        const getWeatherBtn = document.getElementById('get-weather');
        const weatherTemp = document.getElementById('weather-temp');
        const weatherIcon = document.getElementById('weather-icon');
        const weatherHumidity = document.getElementById('weather-humidity');
        const weatherWind = document.getElementById('weather-wind');
        const weatherCondition = document.getElementById('weather-condition');
        
        // Toggle sidebar on mobile
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
        
        // Event listeners for base map buttons
        document.getElementById('base-maps').addEventListener('click', function(e) {
            if (e.target.tagName === 'BUTTON') {
                const layer = e.target.getAttribute('data-layer');
                Object.values(baseLayers).forEach(l => map.removeLayer(l));
                baseLayers[layer].addTo(map);
                
                // Update active button state
                document.querySelectorAll('#base-maps button').forEach(btn => {
                    btn.classList.remove('active');
                });
                e.target.classList.add('active');
            }
        });
        
        // Add marker button
        document.getElementById('add-marker').addEventListener('click', function() {
            alert('Click on the map to place a marker');
            map.once('click', function(e) {
                const marker = L.marker(e.latlng).addTo(markers);
                marker.bindPopup(`Marker at ${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}`).openPopup();
            });
        });
        
        // Clear markers button
        document.getElementById('clear-markers').addEventListener('click', function() {
            markers.clearLayers();
        });
        
        // Drawing tools buttons
        document.getElementById('draw-line').addEventListener('click', function() {
            map.removeControl(drawControl);
            drawControl.options.draw.polyline = true;
            drawControl.options.draw.polygon = false;
            drawControl.options.draw.rectangle = false;
            drawControl.options.draw.circle = false;
            map.addControl(drawControl);
            new L.Draw.Polyline(map, drawControl.options.draw.polyline).enable();
        });
        
        document.getElementById('draw-rectangle').addEventListener('click', function() {
            map.removeControl(drawControl);
            drawControl.options.draw.polyline = false;
            drawControl.options.draw.polygon = false;
            drawControl.options.draw.rectangle = true;
            drawControl.options.draw.circle = false;
            map.addControl(drawControl);
            new L.Draw.Rectangle(map, drawControl.options.draw.rectangle).enable();
        });
        
        document.getElementById('draw-polygon').addEventListener('click', function() {
            map.removeControl(drawControl);
            drawControl.options.draw.polyline = false;
            drawControl.options.draw.polygon = true;
            drawControl.options.draw.rectangle = false;
            drawControl.options.draw.circle = false;
            map.addControl(drawControl);
            new L.Draw.Polygon(map, drawControl.options.draw.polygon).enable();
        });
        
        document.getElementById('draw-circle').addEventListener('click', function() {
            map.removeControl(drawControl);
            drawControl.options.draw.polyline = false;
            drawControl.options.draw.polygon = false;
            drawControl.options.draw.rectangle = false;
            drawControl.options.draw.circle = true;
            map.addControl(drawControl);
            new L.Draw.Circle(map, drawControl.options.draw.circle).enable();
        });
        
        // Clear drawings button
        document.getElementById('clear-drawings').addEventListener('click', function() {
            drawnItems.clearLayers();
            measurementDisplay.style.display = 'none';
        });
        
        // Clear route button
        document.getElementById('clear-route').addEventListener('click', function() {
            if (routeControl) {
                map.removeControl(routeControl);
                routeControl = null;
            }
            routeWaypoints = [];
            routeDistance.textContent = '-';
            routeTime.textContent = '-';
        });
        
        // Function to calculate route
        function calculateRoute(start, end) {
            if (routeControl) {
                map.removeControl(routeControl);
            }
            
            routeControl = L.Routing.control({
                waypoints: [start, end],
                routeWhileDragging: false,
                showAlternatives: false,
                addWaypoints: false,
                draggableWaypoints: false,
                fitSelectedRoutes: true,
                lineOptions: {
                    styles: [{color: '#3a86ff', opacity: 0.7, weight: 5}]
                },
                createMarker: function() { return null; } // Disable default markers
            }).addTo(map);
            
            routeControl.on('routesfound', function(e) {
                const routes = e.routes;
                if (routes && routes.length > 0) {
                    const route = routes[0];
                    
                    // Update route info
                    routeDistance.textContent = `${(route.summary.totalDistance / 1000).toFixed(1)} km`;
                    routeTime.textContent = `${Math.floor(route.summary.totalTime / 60)} min`;
                    
                    // Fit bounds to show the entire route
                    map.fitBounds(route.coordinates);
                }
            });
            
            routeControl.on('routingerror', function(e) {
                console.error('Routing error:', e.error);
                alert('Could not calculate route. Please try different locations.');
            });
        }
        
        // Handle drawing events
        map.on(L.Draw.Event.CREATED, function(e) {
            const layer = e.layer;
            drawnItems.addLayer(layer);
            
            // Calculate and display measurements
            let measurementText = '';
            
            if (layer instanceof L.Polyline) {
                const length = L.GeometryUtil.length(layer) / 1000; // Convert to km
                measurementText = `Length: ${length.toFixed(2)} km`;
            } else if (layer instanceof L.Polygon || layer instanceof L.Rectangle) {
                const area = L.GeometryUtil.geodesicArea(layer.getLatLngs()[0]) / 1000000; // Convert to sq km
                const perimeter = L.GeometryUtil.length(layer) / 1000; // Convert to km
                measurementText = `Area: ${area.toFixed(2)} km² | Perimeter: ${perimeter.toFixed(2)} km`;
            } else if (layer instanceof L.Circle) {
                const area = layer.getRadius() * layer.getRadius() * Math.PI / 1000000; // Convert to sq km
                const circumference = 2 * Math.PI * layer.getRadius() / 1000; // Convert to km
                measurementText = `Area: ${area.toFixed(2)} km² | Circumference: ${circumference.toFixed(2)} km`;
            }
            
            measurementDisplay.textContent = measurementText;
            measurementDisplay.style.display = 'block';
        });
        
        // Search functionality
        function performSearch(query, resultsContainer) {
            if (query.length < 3) {
                resultsContainer.style.display = 'none';
                return;
            }
            
            // Use Nominatim API for search
            fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ', India')}&limit=5`)
                .then(response => response.json())
                .then(data => {
                    resultsContainer.innerHTML = '';
                    
                    if (data.length === 0) {
                        const noResults = document.createElement('div');
                        noResults.className = 'search-result-item';
                        noResults.textContent = 'No results found';
                        resultsContainer.appendChild(noResults);
                    } else {
                        data.forEach(item => {
                            const resultItem = document.createElement('div');
                            resultItem.className = 'search-result-item';
                            resultItem.textContent = item.display_name;
                            resultItem.addEventListener('click', function() {
                                map.setView([item.lat, item.lon], 14);
                                resultsContainer.style.display = 'none';
                                
                                // Set the search input value
                                const searchInput = resultsContainer === fromResults ? fromSearch : toSearch;
                                searchInput.value = item.display_name;
                                
                                // Store the coordinates as a data attribute
                                searchInput.dataset.lat = item.lat;
                                searchInput.dataset.lon = item.lon;
                                
                                // Add marker at the location
                                const marker = L.marker([item.lat, item.lon]).addTo(markers);
                                marker.bindPopup(`<b>${item.display_name}</b><br>Lat: ${item.lat}, Lon: ${item.lon}`).openPopup();
                            });
                            resultsContainer.appendChild(resultItem);
                        });
                    }
                    
                    resultsContainer.style.display = 'block';
                })
                .catch(error => {
                    console.error('Search error:', error);
                });
        }
        
        // From search input
        fromSearch.addEventListener('input', function() {
            performSearch(this.value.trim(), fromResults);
        });
        
        // To search input
        toSearch.addEventListener('input', function() {
            performSearch(this.value.trim(), toResults);
        });
        
        // Search route button (in search container)
        searchRouteBtn.addEventListener('click', function() {
            findAndDisplayRoute();
        });
        
        // Search route button (in sidebar)
        searchRouteSidebarBtn.addEventListener('click', function() {
            findAndDisplayRoute();
        });
        
        // Function to find and display route
        function findAndDisplayRoute() {
            const fromQuery = fromSearch.value.trim();
            const toQuery = toSearch.value.trim();
            
            if (!fromQuery || !toQuery) {
                alert('Please enter both "From" and "To" locations');
                return;
            }
            
            // Check if we already have coordinates from search selection
            if (fromSearch.dataset.lat && fromSearch.dataset.lon && 
                toSearch.dataset.lat && toSearch.dataset.lon) {
                
                const startLatLng = L.latLng(
                    parseFloat(fromSearch.dataset.lat),
                    parseFloat(fromSearch.dataset.lon)
                );
                
                const endLatLng = L.latLng(
                    parseFloat(toSearch.dataset.lat),
                    parseFloat(toSearch.dataset.lon)
                );
                
                // Clear any existing markers and route
                markers.clearLayers();
                if (routeControl) {
                    map.removeControl(routeControl);
                    routeControl = null;
                }
                
                // Add markers for the locations
                const startMarker = L.marker(startLatLng).addTo(markers);
                startMarker.bindPopup(`<b>Start:</b> ${fromQuery}`).openPopup();
                
                const endMarker = L.marker(endLatLng).addTo(markers);
                endMarker.bindPopup(`<b>End:</b> ${toQuery}`).openPopup();
                
                // Calculate route
                calculateRoute(startLatLng, endLatLng);
                return;
            }
            
            // If we don't have coordinates, geocode both locations
            Promise.all([
                fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fromQuery + ', India')}&limit=1`)
                    .then(response => response.json()),
                fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(toQuery + ', India')}&limit=1`)
                    .then(response => response.json())
            ]).then(([fromData, toData]) => {
                if (fromData.length === 0 || toData.length === 0) {
                    alert('Could not find one or both locations. Please try different search terms.');
                    return;
                }
                
                const fromLocation = fromData[0];
                const toLocation = toData[0];
                
                // Store the coordinates in the input fields
                fromSearch.dataset.lat = fromLocation.lat;
                fromSearch.dataset.lon = fromLocation.lon;
                toSearch.dataset.lat = toLocation.lat;
                toSearch.dataset.lon = toLocation.lon;
                
                // Clear any existing markers and route
                markers.clearLayers();
                if (routeControl) {
                    map.removeControl(routeControl);
                    routeControl = null;
                }
                
                // Add markers for the locations
                const startMarker = L.marker([fromLocation.lat, fromLocation.lon]).addTo(markers);
                startMarker.bindPopup(`<b>Start:</b> ${fromLocation.display_name}`).openPopup();
                
                const endMarker = L.marker([toLocation.lat, toLocation.lon]).addTo(markers);
                endMarker.bindPopup(`<b>End:</b> ${toLocation.display_name}`).openPopup();
                
                // Calculate route
                calculateRoute(
                    L.latLng(fromLocation.lat, fromLocation.lon),
                    L.latLng(toLocation.lat, toLocation.lon)
                );
                
            }).catch(error => {
                console.error('Route search error:', error);
                alert('An error occurred while searching for the route. Please try again.');
            });
        }
        
        // Get weather button
        getWeatherBtn.addEventListener('click', function() {
            if (!map.getCenter()) return;
            
            const lat = map.getCenter().lat;
            const lng = map.getCenter().lng;
            
            // Use OpenWeatherMap API (you'll need to get your own API key)
            const apiKey = 'YOUR_OPENWEATHERMAP_API_KEY'; // Replace with your actual API key
            fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&appid=${apiKey}`)
                .then(response => response.json())
                .then(data => {
                    if (data.cod !== 200) {
                        alert('Weather data not available for this location');
                        return;
                    }
                    
                    // Update weather widget
                    weatherTemp.textContent = `${Math.round(data.main.temp)}°C`;
                    weatherHumidity.textContent = `${data.main.humidity}% humidity`;
                    weatherWind.textContent = `${data.wind.speed} m/s wind`;
                    weatherCondition.textContent = data.weather[0].description;
                    
                    // Set weather icon
                    const iconCode = data.weather[0].icon;
                    weatherIcon.innerHTML = `<img src="https://openweathermap.org/img/wn/${iconCode}@2x.png" alt="${data.weather[0].main}">`;
                    
                    // Show weather widget
                    weatherWidget.style.display = 'block';
                })
                .catch(error => {
                    console.error('Weather error:', error);
                    alert('Failed to fetch weather data');
                });
        });
        
        // Close search results when clicking outside
        document.addEventListener('click', function(e) {
            if (!fromSearch.contains(e.target) && !fromResults.contains(e.target)) {
                fromResults.style.display = 'none';
            }
            if (!toSearch.contains(e.target) && !toResults.contains(e.target)) {
                toResults.style.display = 'none';
            }
        });