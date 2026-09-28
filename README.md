# Pio Vuelo

Juego de un pajarito que vuela tocando la pantalla: esquiva obstaculos, gana monedas, sube de nivel y personaliza tu ave. Hecho con HTML5 Canvas + PWA, sin dependencias.

## Jugar
- Web: https://josephtvd0.github.io/piovuelo/
- Android: se genera un APK con `android/build.ps1` (requiere JDK 17 y Android SDK build-tools 34.0.0).
- iPhone: instala desde Safari -> Compartir -> Anadir a pantalla de inicio (la PWA funciona offline).

## Contenido
- 75 aves, 63 sombreros, 59 estelas, 37 herramientas y 45 mapas desbloqueables.
- 45 mapas con efectos ambientales (lluvia, nieve, aurora, relampagos...).
- Sistema semanal: se habilita contenido nuevo cada semana desde el 21/09/2026 (50 semanas de calendario).
- Pase de vuelo y temporada 2026 con recompensas, en pista horizontal con las recompensas a la vista (14 niveles).
- Modos de juego: Libre, Duelo (cruza 12 tubos antes que la IA), Desafio diario (cambia cada dia a las 00:00), Zen (sin obstaculos, puntua por metros), Boss (un jefe con 3 huecos moviles cada 20 tubos) y Viento (rafagas que empujan al ave). El boton JUGAR abre un menu para elegir el modo.
- Herramientas nuevas: Modo Titan, Fenix (revive una vez), Bateria Cosmica, Cristal Magico, Ferro (+2 monedas), Paracaidas (caida lenta), Camara Lenta, Telescopio, Amuleto (+5% XP), Rescate (anula un choque cada 20 s), Ticket Dorado (x2 monedas no recogidas), Radar (+60% gemas y cerezas), Bala de Jade (cada 10 tubos) y Flotador (+1 choque).
- Menu limpio y animado: tu ave aletea en el inicio y acceso directo a Tienda, Mapas, Misiones, Pase, Progreso y Ajustes.
- Meta-juego del hogar: el nido crece con las monedas de cada vuelo, huevos que eclosionan en aves/estelas con tiempo real y decoracion del hogar (fondo, poster, suelo y alfombra).

## Controles
- Tocar la pantalla: volar / flap. Soltar: cerrar alas.
- Panel de administracion (pruebas): pasar 3 dedos y codigo PIN.

## Guardado
El progreso se guarda en `localStorage` (clave `piovuelo_v1`).