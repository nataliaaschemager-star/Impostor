import { CATEGORIES_BANK } from "./categories";
import { Player } from "./types";

// Names for AI Bots
export const BOT_NAMES = [
  "Bot Carlos", "Bot Sofía", "Bot Mateo", "Bot Valentina",
  "Bot Lucas", "Bot Camila", "Bot Alejandro", "Bot Isabella",
  "Bot Diego", "Bot Mariana", "Bot Sebastián", "Bot Lucía",
  "Bot Daniel", "Bot Gabriela", "Bot Nicolás", "Bot Victoria",
  "Bot Jarvis", "Bot Hal9000", "Bot Wall-E", "Bot R2D2"
];

// Complete clues dictionary for every single word in the CATEGORIES_BANK
export const CLUES_DICTIONARY: Record<string, string[]> = {
  // Alimentos
  "pizza": ["Queso", "Masa", "Salsa", "Horno", "Italia", "Caja", "Redonda", "Porción"],
  "hamburguesa": ["Carne", "Pan", "Queso", "Papas", "Parrilla", "Combo", "Salsa", "Lechuga"],
  "sushi": ["Pescado", "Arroz", "Alga", "Japón", "Palillos", "Roll", "Soya", "Salmón"],
  "taco": ["Tortilla", "Picante", "México", "Carne", "Cilantro", "Limón", "Pastor", "Salsa"],
  "pasta": ["Trigo", "Italia", "Salsa", "Fideos", "Agua", "Espagueti", "Tenedor", "Queso"],
  "ensalada": ["Lechuga", "Verde", "Tomate", "Sana", "Vinagre", "Fresca", "Plato", "Dieta"],
  "sopa": ["Caldo", "Caliente", "Plato", "Cuchara", "Fideos", "Verduras", "Cena", "Invierno"],
  "helado": ["Frío", "Copa", "Dulce", "Cuchara", "Postre", "Cono", "Crema", "Chocolate"],
  "paella": ["Arroz", "España", "Marisco", "Sartén", "Azafrán", "Valencia", "Domingo", "Limón"],
  "chocolate": ["Dulce", "Negro", "Cacao", "Azúcar", "Tableta", "Leche", "Postre", "Suizo"],

  // Tecnología
  "computadora": ["Teclado", "Pantalla", "Mouse", "Oficina", "Procesador", "Trabajo", "Software", "Internet"],
  "celular": ["Llamada", "Bolsillo", "Pantalla", "Batería", "Mensaje", "Móvil", "Cámara", "App"],
  "internet": ["Red", "Web", "Wifi", "Cable", "Conexión", "Mundo", "Navegador", "Buscador"],
  "robot": ["Metal", "Programación", "Hierro", "Futuro", "Cable", "Inteligente", "Androide", "Máquina"],
  "audífonos": ["Música", "Oreja", "Sonido", "Cable", "Silencio", "Cascos", "Ruido", "Escuchar"],
  "televisor": ["Pantalla", "Canal", "Control", "Serie", "Salón", "Película", "Noticias", "Mando"],
  "cámara": ["Foto", "Lente", "Video", "Flash", "Imagen", "Enfoque", "Memoria", "Retrato", "Director", "Grabar", "Cine", "Película", "Acción", "Estudio", "Trípode"],
  "satélite": ["Espacio", "Antena", "Órbita", "Señal", "Tierra", "Espacial", "Cohete", "Transmisión"],
  "consola": ["Mando", "Juego", "Pantalla", "Jugador", "Televisión", "Mando", "Videojuegos", "Nintendo"],
  "teclado": ["Tecla", "Escribir", "Letras", "Mano", "Botón", "Plástico", "Computadora", "Espacio"],

  // Animales
  "perro": ["Ladrido", "Hueso", "Fiel", "Amigo", "Mascota", "Cola", "Paseo", "Cuatro patas"],
  "gato": ["Maullido", "Leche", "Ratón", "Mascota", "Garras", "Ágil", "Bigotes", "Tejado"],
  "león": ["Melena", "Rey", "Selva", "Rugido", "Cazador", "África", "Garra", "Mamífero"],
  "elefante": ["Trompa", "Grande", "Gris", "Orejas", "Colmillos", "Pesado", "África", "Memoria"],
  "tiburón": ["Dientes", "Aleta", "Mar", "Océano", "Peligroso", "Sangre", "Pescador", "Agua"],
  "delfín": ["Inteligente", "Agua", "Mar", "Salto", "Amigable", "Acróbata", "Soplador", "Océano"],
  "águila": ["Vuelo", "Plumas", "Garra", "Cielo", "Pico", "Vista", "Caza", "Nido"],
  "caballo": ["Galope", "Silla", "Carrera", "Crín", "Herradura", "Establo", "Jinete", "Pasto"],
  "oso": ["Miel", "Cueva", "Garras", "Bosque", "Invernar", "Pelo", "Pardo", "Grande"],
  "serpiente": ["Veneno", "Reptil", "Escamas", "Arrastrarse", "Cascabel", "Lengua", "Selva", "Peligro"],

  // Deportes
  "fútbol": ["Balón", "Gol", "Estadio", "Cancha", "Portería", "Camiseta", "Árbitro", "Mundial"],
  "baloncesto": ["Canasta", "Balón", "Aro", "Salto", "Altura", "Pista", "Pase", "NBA"],
  "tenis": ["Raqueta", "Pelota", "Red", "Cancha", "Pista", "Servicio", "Punto", "Mesa"],
  "natación": ["Agua", "Piscina", "Estilo", "Gorro", "Gafas", "Mar", "Buceo", "Cloro"],
  "ciclismo": ["Bicicleta", "Pedal", "Casco", "Ruta", "Rueda", "Carrera", "Montaña", "Tour"],
  "boxeo": ["Guantes", "Ring", "Golpe", "Combate", "Púgil", "Árbitro", "Cinturón", "Cuerdas"],
  "voleibol": ["Red", "Balón", "Saque", "Salto", "Manos", "Playa", "Cancha", "Remate"],
  "atletismo": ["Carrera", "Pista", "Velocidad", "Meta", "Zapatillas", "Saltar", "Cronómetro", "Medalla"],
  "rugby": ["Balón", "Poste", "Placaje", "Equipo", "Fuerza", "Césped", "Patada", "Melé"],
  "golf": ["Hoyo", "Palo", "Pelota", "Césped", "Bolsa", "Verde", "Precisión", "Carrito"],

  // Países
  "españa": ["Europa", "Madrid", "Sol", "Tapas", "Bandera", "Fiesta", "Playas", "Toros"],
  "méxico": ["América", "Mariachi", "Tacos", "Tequila", "Bandera", "Picante", "Pirámides", "Sol"],
  "argentina": ["Messi", "Tango", "Asado", "Mate", "América", "Buenos Aires", "Fútbol", "Glaciar"],
  "japón": ["Tokio", "Sushi", "Tecnología", "Anime", "Asia", "Bandera", "Sake", "Kimono"],
  "francia": ["París", "Torre", "Vino", "Pan", "Europa", "Queso", "Arte", "Moda"],
  "italia": ["Roma", "Pizza", "Pasta", "Arte", "Europa", "Coliseo", "Vino", "Góndola"],
  "brasil": ["Samba", "Fútbol", "Río", "Amazonas", "América", "Carnaval", "Bandera", "Playa"],
  "alemania": ["Europa", "Berlín", "Cerveza", "Salchicha", "Bandera", "Tecnología", "Muro", "Precisión"],
  "canadá": ["América", "Frío", "Nieve", "Maple", "Hoja", "Castor", "Montañas", "Bandera"],
  "australia": ["Canguro", "Koala", "Océano", "Sídney", "Isla", "Bandera", "Desierto", "Surf"],

  // Profesiones
  "médico": ["Hospital", "Salud", "Bata", "Estetoscopio", "Receta", "Medicina", "Enfermo", "Doctor"],
  "profesor": ["Escuela", "Clase", "Libro", "Pizarra", "Alumno", "Enseñar", "Nota", "Tiza"],
  "bombero": ["Fuego", "Agua", "Manguera", "Camión", "Casco", "Sirena", "Emergencia", "Escalera"],
  "policía": ["Placa", "Patrulla", "Sirena", "Uniforme", "Esposas", "Justicia", "Calle", "Multa"],
  "astronauta": ["Espacio", "Traje", "Luna", "Cohete", "Estrellas", "Gravedad", "Nave", "Casco"],
  "abogado": ["Juicio", "Leyes", "Tribunal", "Defensa", "Cliente", "Contrato", "Código", "Juez"],
  "cocinero": ["Cocina", "Plato", "Gorro", "Sartén", "Restaurante", "Cuchillo", "Receta", "Menú"],
  "pintor": ["Pincel", "Cuadro", "Lienzo", "Paleta", "Colores", "Pintura", "Arte", "Exposición"],
  "ingeniero": ["Plano", "Obra", "Casco", "Cálculo", "Diseño", "Fórmula", "Estructura", "Proyecto"],
  "veterinario": ["Animal", "Perro", "Mascota", "Clínica", "Vacuna", "Gato", "Salud", "Cuidado"],

  // Medios de Transporte
  "avión": ["Vuelo", "Nube", "Ala", "Aeropuerto", "Piloto", "Cielo", "Pasajero", "Viaje"],
  "barco": ["Mar", "Agua", "Puerto", "Timón", "Vela", "Ancla", "Océano", "Navegar"],
  "automóvil": ["Rueda", "Motor", "Carretera", "Volante", "Gasolina", "Viaje", "Conductor", "Tráfico"],
  "bicicleta": ["Pedal", "Cadena", "Rueda", "Manillar", "Casco", "Paseo", "Deporte", "Sillín"],
  "tren": ["Vía", "Estación", "Vagón", "Locomotora", "Hierro", "Viaje", "Humo", "Pasajero"],
  "submarino": ["Agua", "Profundo", "Mar", "Sonar", "Metal", "Buceo", "Océano", "Tripulación"],
  "helicóptero": ["Hélice", "Vuelo", "Cielo", "Rotor", "Rescate", "Aire", "Rápido", "Piloto"],
  "motocicleta": ["Casco", "Rueda", "Motor", "Velocidad", "Ruta", "Escape", "Dos ruedas", "Gasolina"],
  "cohete": ["Espacio", "Fuego", "Despegue", "Luna", "Estrellas", "Planeta", "Astronauta", "Velocidad"],
  "metro": ["Subterráneo", "Estación", "Ciudad", "Vagón", "Túnel", "Rápido", "Pasajero", "Vía"],

  // Películas y Cine
  "palomitas": ["Maíz", "Cine", "Sal", "Dulce", "Caja", "Película", "Comer", "Butaca"],
  "pantalla": ["Grande", "Proyección", "Cine", "Luz", "Brillo", "Pared", "Película", "Sala"],
  "director": ["Megáfono", "Silla", "Acción", "Corte", "Guion", "Cine", "Cámara", "Óscar"],
  "actor": ["Papel", "Guion", "Teatro", "Cine", "Fama", "Premios", "Personaje", "Ensayo"],
  "guion": ["Texto", "Papel", "Escribir", "Historia", "Diálogo", "Cine", "Director", "Lectura"],
  "butaca": ["Asiento", "Cine", "Cómodo", "Sala", "Fila", "Roja", "Ver", "Película"],
  "banda sonora": ["Música", "Sonido", "Instrumento", "Película", "Melodía", "Compositor", "Emoción", "Fondo"],
  "efectos especiales": ["Computadora", "Explosión", "Ficción", "Verde", "Truco", "Magia", "Pantalla", "Sonido"],
  "taquilla": ["Entrada", "Boleto", "Pago", "Fila", "Cine", "Dinero", "Estreno", "Venta"],

  // Instrumentos Musicales
  "guitarra": ["Cuerdas", "Madera", "Tocar", "Acústico", "Música", "Mástil", "Concierto", "Acorde"],
  "piano": ["Teclas", "Negras", "Blancas", "Madera", "Tocar", "Música", "Clásico", "Concierto"],
  "batería": ["Baquetas", "Platos", "Ritmo", "Tocar", "Música", "Ruido", "Bombo", "Concierto"],
  "violín": ["Arco", "Cuerdas", "Hombro", "Madera", "Tocar", "Clásico", "Música", "Sinfonía"],
  "flauta": ["Viento", "Agujeros", "Soplar", "Tubo", "Música", "Tocar", "Delgado", "Metal"],
  "trompeta": ["Metal", "Soplar", "Viento", "Botones", "Música", "Tocar", "Brillante", "Jazz"],
  "arpa": ["Cuerdas", "Grande", "Tocar", "Dedos", "Música", "Ángel", "Clásico", "Madera"],
  "saxofón": ["Metal", "Soplar", "Viento", "Jazz", "Música", "Tocar", "Curvo", "Llaves"],
  "acordeón": ["Fuelle", "Teclas", "Música", "Viento", "Tocar", "Tradicional", "Manos", "Caja"],
  "bajo": ["Cuerdas", "Música", "Ritmo", "Tocar", "Grave", "Eléctrico", "Banda", "Amplificador"],

  // Ropa y Vestimenta
  "zapatos": ["Pies", "Caminar", "Suela", "Cuero", "Cordones", "Vestir", "Suelo", "Tacón"],
  "pantalón": ["Piernas", "Cinturón", "Bolsillos", "Jeans", "Cremallera", "Vestir", "Tela", "Largo"],
  "camisa": ["Cuello", "Botones", "Mangas", "Vestir", "Elegante", "Cuerpo", "Tela", "Percha"],
  "chaqueta": ["Frío", "Abrigo", "Cremallera", "Mangas", "Vestir", "Bolsillos", "Cuero", "Invierno"],
  "sombrero": ["Cabeza", "Sol", "Gorra", "Pelo", "Ala", "Elegante", "Sombrear", "Llevar"],
  "vestido": ["Mujer", "Elegante", "Fiesta", "Tela", "Largo", "Boda", "Vestir", "Verano"],
  "bufanda": ["Cuello", "Frío", "Lana", "Largo", "Tejido", "Invierno", "Nieve", "Calentar"],
  "guantes": ["Manos", "Dedos", "Frío", "Lana", "Cuero", "Invierno", "Nieve", "Llevar"],
  "calcetines": ["Pies", "Zapatos", "Lana", "Frío", "Tobillo", "Calentar", "Par", "Dibujos"],
  "cinturón": ["Cintura", "Pantalón", "Hebilla", "Cuero", "Ajustar", "Sostener", "Vestir", "Cuerpo"],

  // Frutas
  "manzana": ["Roja", "Árbol", "Fruta", "Sana", "Jugo", "Blanca", "Dulce", "Pecado"],
  "plátano": ["Amarillo", "Mono", "Fruta", "Curvo", "Potasio", "Pelar", "Dulce", "Árbol"],
  "fresa": ["Roja", "Pequeña", "Fruta", "Dulce", "Postre", "Semillas", "Hojas", "Crema"],
  "naranja": ["Zumo", "Árbol", "Fruta", "Ácido", "Vitamina C", "Naranja", "Pelar", "Gajos"],
  "sandía": ["Verde", "Roja", "Grande", "Agua", "Fruta", "Semillas", "Verano", "Pepitas"],
  "uva": ["Racimo", "Verde", "Morada", "Vino", "Año Nuevo", "Fruta", "Semilla", "Dulce"],
  "mango": ["Amarillo", "Dulce", "Fruta", "Hueso", "Tropical", "Jugo", "Pulpa", "Árbol"],
  "piña": ["Corona", "Marrón", "Ácida", "Fruta", "Tropical", "Jugo", "Rodajas", "Pelar"],
  "limón": ["Ácido", "Verde", "Amarillo", "Zumo", "Fruta", "Aliño", "Tequila", "Exprimir"],
  "cereza": ["Roja", "Par", "Pequeña", "Hueso", "Fruta", "Tallo", "Dulce", "Tarta"],

  // Clima y Naturaleza
  "lluvia": ["Agua", "Nube", "Cielo", "Paraguas", "Mojado", "Tormenta", "Charco", "Gota"],
  "nieve": ["Frío", "Blanco", "Invierno", "Montaña", "Esquí", "Hielo", "Muñeco", "Copo"],
  "tormenta": ["Rayo", "Trueno", "Lluvia", "Cielo", "Nubes", "Peligro", "Viento", "Oscuro"],
  "tornado": ["Viento", "Embudo", "Destrucción", "Giro", "Ciclón", "Tormenta", "Aire", "Peligro"],
  "arcoíris": ["Colores", "Luz", "Lluvia", "Sol", "Cielo", "Siete", "Curva", "Bello"],
  "viento": ["Aire", "Fuerte", "Mover", "Cielo", "Tornado", "Soplar", "Molino", "Frío"],
  "niebla": ["Gris", "Nube", "Cielo", "Bruma", "Frío", "Visibilidad", "Ocultar", "Conducir"],
  "rayo": ["Electricidad", "Luz", "Trueno", "Cielo", "Tormenta", "Peligro", "Fuerza", "Fuego"],
  "granizo": ["Hielo", "Lluvia", "Frío", "Cielo", "Piedras", "Tormenta", "Duro", "Caer"],
  "calor": ["Sol", "Verano", "Temperatura", "Fuego", "Sudor", "Playa", "Ardiente", "Termómetro"],

  // Fantasía y Superhéroes
  "capa": ["Volar", "Héroe", "Espalda", "Vestir", "Roja", "Héroe", "Misterio", "Traje"],
  "máscara": ["Ocultar", "Rostro", "Héroe", "Misterio", "Identidad", "Ojos", "Llevar", "Disfraz"],
  "superpoder": ["Fuerza", "Volar", "Magia", "Increíble", "Héroe", "Energía", "Mente", "Habilidad"],
  "escudo": ["Defensa", "Metal", "Proteger", "Héroe", "Espada", "Guerra", "Armadura", "Brazo"],
  "volar": ["Cielo", "Nubes", "Alas", "Aire", "Gravedad", "Héroe", "Pájaros", "Vuelo"],
  "villano": ["Malo", "Justicia", "Peligro", "Enemigo", "Héroe", "Malvado", "Plan", "Mente"],
  "justicia": ["Leyes", "Héroe", "Bien", "Policía", "Símbolo", "Verdad", "Proteger", "Balanza"],
  "kryptonita": ["Verde", "Debilidad", "Piedra", "Espacio", "Héroe", "Peligro", "Fuerza", "Brillo"],
  "castillo": ["Piedra", "Rey", "Fantasía", "Princesa", "Torre", "Muralla", "Antiguo", "Edad Media"],
  "dragón": ["Fuego", "Volar", "Escamas", "Fantasía", "Monstruo", "Alas", "Cueva", "Leyenda"],

  // Pasatiempos y Hobbies
  "lectura": ["Libro", "Texto", "Páginas", "Historia", "Ocio", "Aprender", "Ojos", "Biblioteca"],
  "fotografía": ["Cámara", "Foto", "Imagen", "Lente", "Recuerdo", "Arte", "Retrato", "Papel"],
  "jardinería": ["Plantas", "Flores", "Tierra", "Agua", "Verde", "Jardín", "Cuidar", "Pala"],
  "ajedrez": ["Tablero", "Rey", "Fichas", "Mesa", "Mente", "Estrategia", "Piezas", "Juego"],
  "dibujo": ["Papel", "Lápiz", "Colores", "Arte", "Línea", "Pintura", "Boceto", "Creativo"],
  "videojuegos": ["Pantalla", "Mando", "Consola", "Diversión", "Ordenador", "Jugar", "Nivel", "Puntos"],
  "senderismo": ["Montaña", "Caminar", "Naturaleza", "Ruta", "Mochila", "Bosque", "Deporte", "Piedras"],
  "pesca": ["Mar", "Río", "Pescado", "Caña", "Anzuelo", "Agua", "Barco", "Paciencia"],
  "baile": ["Música", "Ritmo", "Cuerpo", "Paso", "Movimiento", "Fiesta", "Pista", "Expresión"],
  "tejer": ["Lana", "Agujas", "Ropa", "Manos", "Hilos", "Bufanda", "Paciencia", "Tejido"],

  // Objetos de la Casa
  "espejo": ["Reflejo", "Cristal", "Rostro", "Mirar", "Baño", "Pared", "Ver", "Brillante"],
  "lámpara": ["Luz", "Mesa", "Brillo", "Noche", "Habitación", "Bombilla", "Encender", "Pantalla"],
  "sofá": ["Salón", "Cómodo", "Asiento", "Televisión", "Sentarse", "Cojín", "Mueble", "Descanso"],
  "almohada": ["Cama", "Dormir", "Cabeza", "Blanda", "Sueño", "Noche", "Funda", "Descanso"],
  "reloj": ["Hora", "Tiempo", "Agujas", "Pared", "Muñeca", "Minutos", "Alarma", "Segundos"],
  "silla": ["Sentarse", "Mesa", "Madera", "Patas", "Mueble", "Respaldo", "Comer", "Oficina"],
  "mesa": ["Comer", "Silla", "Madera", "Patas", "Mueble", "Plato", "Escribir", "Salón"],
  "nevera": ["Frío", "Comida", "Cocina", "Hielo", "Electrodoméstico", "Puerta", "Conservar", "Bebida"],
  "estantería": ["Libros", "Pared", "Madera", "Mueble", "Guardar", "Orden", "Adornos", "Estante"],
  "alfombra": ["Suelo", "Salón", "Lana", "Pisar", "Tejido", "Pies", "Decoración", "Casa"],

  // Mitología
  "zeus": ["Olimpo", "Rayo", "Dios", "Grecia", "Antiguo", "Padre", "Poder", "Cielo"],
  "poseidón": ["Mar", "Tridente", "Dios", "Agua", "Grecia", "Océano", "Tormenta", "Olimpo"],
  "hércules": ["Fuerza", "Héroe", "Doce trabajos", "Grecia", "Dios", "Semidiós", "Lucha", "León"],
  "fénix": ["Fuego", "Ave", "Cenizas", "Volar", "Inmortal", "Renacer", "Mitología", "Plumas"],
  "minotauro": ["Laberinto", "Toro", "Monstruo", "Grecia", "Mitología", "Teseo", "Cuerpo", "Cabeza"],
  "pegaso": ["Caballo", "Alas", "Volar", "Grecia", "Mitología", "Blanco", "Cielo", "Héroe"],
  "olimpo": ["Montaña", "Dioses", "Grecia", "Zeus", "Cielo", "Mitología", "Palacio", "Trono"],
  "centauro": ["Caballo", "Humano", "Mitología", "Cuerpo", "Mitad", "Grecia", "Caza", "Arco"],
  "sirena": ["Mar", "Canto", "Pescado", "Mujer", "Mitología", "Océano", "Agua", "Marinero"],
  "esfinge": ["Egipto", "Acertijo", "León", "Mitología", "Pirámides", "Piedra", "Cabeza", "Cuerpo"]
};

// Generic clues for Categories when Bot is the Impostor (doesn't know the secret word)
export const CATEGORY_IMPOSTOR_CLUES: Record<string, string[]> = {
  "Alimentos": ["Comida", "Delicioso", "Nutrición", "Ingrediente", "Plato", "Sabor", "Caliente", "Cena", "Almuerzo"],
  "Tecnología": ["Digital", "Dispositivo", "Pantalla", "Moderno", "Circuito", "Futuro", "Electricidad", "Conexión", "Equipo"],
  "Animales": ["Naturaleza", "Vida", "Salvaje", "Pelaje", "Especie", "Criatura", "Moverse", "Instinto", "Mamífero"],
  "Deportes": ["Juego", "Físico", "Equipo", "Pelota", "Esfuerzo", "Competencia", "Puntaje", "Victoria", "Entrenar"],
  "Países": ["Nación", "Frontera", "Bandera", "Tierra", "Cultura", "Capital", "Habitantes", "Mundo", "Geografía"],
  "Profesiones": ["Trabajo", "Oficio", "Sueldo", "Carrera", "Estudio", "Servicio", "Uniforme", "Empresa", "Horario"],
  "Medios de Transporte": ["Viaje", "Vehículo", "Moverse", "Motor", "Ruta", "Pasajero", "Velocidad", "Destino", "Ruedas"],
  "Películas y Cine": ["Espectáculo", "Historia", "Pantalla", "Entretenimiento", "Sonido", "Imagen", "Arte", "Estreno", "Sala"],
  "Instrumentos Musicales": ["Sonido", "Ritmo", "Arte", "Nota", "Melodía", "Acústico", "Tocar", "Concierto", "Armonía"],
  "Ropa y Vestimenta": ["Prenda", "Cuerpo", "Tejido", "Moda", "Vestir", "Estilo", "Tela", "Diseño", "Armario"],
  "Frutas": ["Dulce", "Árbol", "Fresco", "Sano", "Jugo", "Semilla", "Vitamina", "Sabor", "Postre"],
  "Clima y Naturaleza": ["Cielo", "Ambiente", "Fenómeno", "Estación", "Tierra", "Aire", "Efecto", "Planeta", "Tiempo"],
  "Fantasía y Superhéroes": ["Magia", "Ficción", "Poder", "Increíble", "Héroe", "Leyenda", "Súper", "Capa", "Aventura"],
  "Pasatiempos y Hobbies": ["Ocio", "Diversión", "Tiempo libre", "Gusto", "Entretenido", "Actividad", "Disfrutar", "Gusto", "Interés"],
  "Objetos de la Casa": ["Mueble", "Interior", "Habitación", "Uso", "Doméstico", "Decoración", "Espacio", "Utilidad", "Pared"],
  "Mitología": ["Leyenda", "Dios", "Antiguo", "Historia", "Mito", "Fantasía", "Grecia", "Relato", "Poder"]
};

/**
 * Returns a clever word selection for a Bot player.
 */
export function getBotWord(
  secretWord: string,
  categoryName: string,
  isImposter: boolean,
  alreadyUsedWords: string[]
): string {
  let listToChooseFrom: string[] = [];

  if (isImposter) {
    // Impostor bot only knows the category!
    listToChooseFrom = CATEGORY_IMPOSTOR_CLUES[categoryName] || ["Misterio", "Secreto", "Oculto", "Infiltrado"];
  } else {
    // Investigator bot knows the secret word
    const lowerSecret = secretWord.toLowerCase();
    listToChooseFrom = CLUES_DICTIONARY[lowerSecret];

    // Fallback if the word is somehow not in our dictionary
    if (!listToChooseFrom || listToChooseFrom.length === 0) {
      // Find the category and pick other words as proxy
      const matchedCategory = CATEGORIES_BANK.find((c) => c.name === categoryName);
      if (matchedCategory) {
        listToChooseFrom = matchedCategory.words.filter(w => w.toLowerCase() !== lowerSecret);
      } else {
        listToChooseFrom = ["Asociado", "Relacionado", "Elemento", "Especie"];
      }
    }
  }

  // Filter out any word that has already been submitted in the room (to prevent exact duplicate clues)
  const cleanUsed = alreadyUsedWords.map(w => w.toLowerCase().trim());
  let available = listToChooseFrom.filter(w => !cleanUsed.includes(w.toLowerCase().trim()));

  // If all are used, reuse from original list
  if (available.length === 0) {
    available = listToChooseFrom;
  }

  const selectedWord = available[Math.floor(Math.random() * available.length)];
  return selectedWord || "Secreto";
}

/**
 * Returns a bot's vote selection.
 * Investigators have a decent chance of voting for the real Impostor, and a remaining chance to vote for other suspects.
 * Impostors always vote for a random investigator to save themselves.
 */
export function getBotVote(
  botId: string,
  playersList: Player[],
  imposterId: string,
  isImposter: boolean
): string {
  // Filter out the bot itself
  const voteablePlayers = playersList.filter((p) => p.id !== botId);
  if (voteablePlayers.length === 0) return "";

  if (isImposter) {
    // Bot is Impostor: Vote for a random Investigator (someone other than the imposter)
    const investigators = voteablePlayers.filter((p) => p.id !== imposterId);
    if (investigators.length > 0) {
      return investigators[Math.floor(Math.random() * investigators.length)].id;
    }
    return voteablePlayers[Math.floor(Math.random() * voteablePlayers.length)].id;
  } else {
    // Bot is Investigator:
    // 45% chance to correctly identify the Impostor if the Impostor is in the room.
    // 55% split across other innocent players.
    const hasImposter = voteablePlayers.some((p) => p.id === imposterId);
    
    if (hasImposter && Math.random() < 0.45) {
      return imposterId;
    } else {
      // Choose a random player other than itself
      return voteablePlayers[Math.floor(Math.random() * voteablePlayers.length)].id;
    }
  }
}
