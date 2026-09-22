
        const ubicacionesSedes = {
            cumana: {
                titulo: "Planta Cumaná (Sector Los Molinos)",
                url: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3923.771624107857!2d-64.19370272584717!3d10.439688689689348!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8c3271f643fe70b5%3A0x4fefac10f0bc55e6!2sPlanta%20de%20llenado%20PDVSA%20GAS!5e0!3m2!1ses!2sve!4v1790005624894!5m2!1ses!2sve"
            },
            carupano1: {
                titulo: "Planta Carúpano 1 (Troncal 10)",
                url: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4663.036488983157!2d-63.26864735919756!3d10.646955562156839!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8c33c356df0b7157%3A0x1a4c01a14628aeba!2sCDT%20Jos%C3%A9%20Francisco%20Berm%C3%BAdez.!5e0!3m2!1ses!2sve!4v1790006151598!5m2!1ses!2sve"
            },
            carupano2: {
                titulo: "Planta Carúpano 2 (Troncal 9)",
                url: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7842.4295510572165!2d-63.277602195739746!3d10.64041617802411!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8c33c337371ec391%3A0x98ca9cf953354a03!2sP.D.V%20Comunal!5e0!3m2!1ses!2sve!4v1790006886284!5m2!1ses!2sve"
            },
            guiria: {
                titulo: "Planta Güiria (Municipio Valdez)",
                url: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3288.5675860367787!2d-62.31763622584456!3d10.597144189540902!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8c3425007d21e049%3A0xbb307fe767f7934b!2sPlanta%20de%20Llenado%20de%20Gas!5e1!3m2!1ses!2sve!4v1790011960924!5m2!1ses!2sve"
            }
        };

        function actualizarMapaSede(sedeKey) {
            const mapIframe = document.getElementById('googleMapIframe');
            const mapTitle = document.getElementById('mapTitle');

            if (ubicacionesSedes[sedeKey]) {
                mapIframe.style.opacity = '0';
                setTimeout(() => {
                    mapTitle.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${ubicacionesSedes[sedeKey].titulo}`;
                    mapIframe.src = ubicacionesSedes[sedeKey].url;
                    mapIframe.style.opacity = '1';
                }, 200);
            }
        }
   