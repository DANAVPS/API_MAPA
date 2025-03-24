document.addEventListener("DOMContentLoaded", () => {
    
    const map = L.map('map').setView([7.096819, -73.096419], 13);

    // Agrega un mapa base de OpenStreetMap al mapa de Leaflet
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors' // Atribución obligatoria
    }).addTo(map);

    let marker; 

    // Función para buscar una ciudad utilizando la API de OpenStreetMap (Nominatim)
    function buscarCiudad() {
        const ciudad = document.getElementById("search-input").value.trim(); // Obtiene el valor del input
        const Cargando = document.getElementById("loading"); 
        const MensajeError = document.getElementById("error-message"); 
        const Tarjetadeinfo = document.getElementById("info-card");

        if (!ciudad) return;

        // Muestra el indicador de carga y oculta mensajes anteriores
        Cargando.classList.remove("hidden");
        MensajeError.classList.add("hidden");
        Tarjetadeinfo.classList.add("hidden");

        // Llamada a la API de OpenStreetMap para buscar la ciudad ingresada
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(ciudad)}`)
            .then(response => response.json()) // Convierte la respuesta a JSON
            .then(data => {
                // Oculta el indicador de carga
                Cargando.classList.add("hidden");

                // Si no se encuentran resultados, muestra el mensaje de error
                if (data.length === 0) {
                    MensajeError.classList.remove("hidden");
                    return;
                }

                // Extrae la latitud, longitud y el nombre de la primera coincidencia
                const { lat, lon, display_name } = data[0];

                // Mueve el mapa a la ubicación encontrada
                map.setView([lat, lon], 13);

                // Si ya hay un marcador en el mapa, lo elimina antes de agregar el nuevo
                if (marker) map.removeLayer(marker);

                // Crea un nuevo marcador en la ubicación encontrada y lo añade al mapa
                marker = L.marker([lat, lon]).addTo(map)
                    .bindPopup(`📍 ${display_name}`) 
                    .openPopup(); 

                // Agrega la ciudad al historial de búsqueda
                agregarHistorial(display_name, lat, lon);

                // Muestra la información de la ciudad en la tarjeta lateral
                mostrarInformacion(display_name, lat, lon);
            })
            .catch(error => {
                console.error("Error:", error); 
                Cargando.classList.add("hidden"); 
                MensajeError.classList.remove("hidden"); 
            });
    }

    // Función para agregar la ciudad buscada al historial de búsqueda
    function agregarHistorial(nombre, lat, lon) {
        const lista = document.getElementById("locations-list");
        const item = document.createElement("div"); 
        item.className = "location";
        item.innerHTML = `<span class="icon">📍</span> <div>${nombre}</div>`; 
        item.onclick = () => map.setView([lat, lon], 13);
        lista.appendChild(item); // Agrega el nuevo elemento a la lista
    }

    // Función para mostrar la información de la ciudad seleccionada en la tarjeta lateral
    function mostrarInformacion(nombre, lat, lon) {
        document.getElementById("city-name").textContent = nombre; 
        document.getElementById("latitude").textContent = lat; 
        document.getElementById("longitude").textContent = lon;
        document.getElementById("info-card").classList.remove("hidden");
    }

    // Agrega un evento de clic al botón de búsqueda para ejecutar la función buscarCiudad()
    document.getElementById("search-button").addEventListener("click", buscarCiudad);

    // Permite buscar presionando "Enter" en el campo de entrada de texto
    document.getElementById("search-input").addEventListener("keypress", (e) => {
        if (e.key === "Enter") buscarCiudad();
    });
});
