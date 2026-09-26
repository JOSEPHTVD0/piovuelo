# Pio Vuelo

Juego de un pajarito que vuela tocando la pantalla: esquiva obstaculos, gana monedas, sube de nivel y personaliza tu ave. Hecho con HTML5 Canvas + PWA, sin dependencias.

## Jugar
- Web: https://josephtvd0.github.io/piovuelo/
- Android: se genera un APK con `android/build.ps1` (requiere JDK 17 y Android SDK build-tools 34.0.0).
- iPhone: instala desde Safari -> Compartir -> Anadir a pantalla de inicio (la PWA funciona offline).

## Contenido
- 51 aves, 47 sombreros, 43 estelas, 27 herramientas y 33 mapas desbloqueables.
- 33 mapas con efectos ambientales (lluvia, nieve, aurora, relampagos...).
- Sistema semanal: se habilita contenido nuevo cada semana desde el 21/09/2026 (38 semanas de calendario).
- Pase de vuelo y temporada 2026 con recompensas, en pista horizontal con las recompensas a la vista (14 niveles).
- Modos de juego: Libre y Contrarreloj (pasa 10 tubos en el menor tiempo); la barra del HUD se llena segun el objetivo del modo.
- Herramientas nuevas: Modo Titan, Fenix (revive una vez), Bateria Cosmica (avanza la barra) y Cristal Magico.
- Menu limpio y animado: tu ave aletea en el inicio y acceso directo a Tienda, Mapas, Misiones, Pase, Progreso y Ajustes.

## Controles
- Tocar la pantalla: volar / flap. Soltar: cerrar alas.
- Panel de administracion (pruebas): pasar 3 dedos y codigo PIN.

## Guardado
El progreso se guarda en `localStorage` (clave `piovuelo_v1`).