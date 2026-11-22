// Entry point: gives the page its data. Rules and rendering live in src/.
import { NOW, ROOMS } from "./src/data/rooms.js";
import { initApp } from "./src/ui/app.js";

initApp(document, ROOMS, NOW);
