export interface Category {
  id: string;
  name: string; // The category name shown to the Impostor (e.g., "Alimento")
  words: string[]; // Words shown to the Investigators (e.g., "Pizza", "Sushi")
}

export const CATEGORIES_BANK: Category[] = [
  {
    id: "alimentos",
    name: "Alimentos",
    words: ["Pizza", "Hamburguesa", "Sushi", "Taco", "Pasta", "Ensalada", "Sopa", "Helado", "Paella", "Chocolate"]
  },
  {
    id: "tecnologia",
    name: "Tecnología",
    words: ["Computadora", "Celular", "Internet", "Robot", "Audífonos", "Televisor", "Cámara", "Satélite", "Consola", "Teclado"]
  },
  {
    id: "animales",
    name: "Animales",
    words: ["Perro", "Gato", "León", "Elefante", "Tiburón", "Delfín", "Águila", "Caballo", "Oso", "Serpiente"]
  },
  {
    id: "deportes",
    name: "Deportes",
    words: ["Fútbol", "Baloncesto", "Tenis", "Natación", "Ciclismo", "Boxeo", "Voleibol", "Atletismo", "Rugby", "Golf"]
  },
  {
    id: "paises",
    name: "Países",
    words: ["España", "México", "Argentina", "Japón", "Francia", "Italia", "Brasil", "Alemania", "Canadá", "Australia"]
  },
  {
    id: "profesiones",
    name: "Profesiones",
    words: ["Médico", "Profesor", "Bombero", "Policía", "Astronauta", "Abogado", "Cocinero", "Pintor", "Ingeniero", "Veterinario"]
  },
  {
    id: "transporte",
    name: "Medios de Transporte",
    words: ["Avión", "Barco", "Automóvil", "Bicicleta", "Tren", "Submarino", "Helicóptero", "Motocicleta", "Cohete", "Metro"]
  },
  {
    id: "cine",
    name: "Películas y Cine",
    words: ["Cámara", "Palomitas", "Pantalla", "Director", "Actor", "Guion", "Butaca", "Banda Sonora", "Efectos Especiales", "Taquilla"]
  },
  {
    id: "instrumentos",
    name: "Instrumentos Musicales",
    words: ["Guitarra", "Piano", "Batería", "Violín", "Flauta", "Trompeta", "Arpa", "Saxofón", "Acordeón", "Bajo"]
  },
  {
    id: "ropa",
    name: "Ropa y Vestimenta",
    words: ["Zapatos", "Pantalón", "Camisa", "Chaqueta", "Sombrero", "Vestido", "Bufanda", "Guantes", "Calcetines", "Cinturón"]
  },
  {
    id: "frutas",
    name: "Frutas",
    words: ["Manzana", "Plátano", "Fresa", "Naranja", "Sandía", "Uva", "Mango", "Piña", "Limón", "Cereza"]
  },
  {
    id: "clima",
    name: "Clima y Naturaleza",
    words: ["Lluvia", "Nieve", "Tormenta", "Tornado", "Arcoíris", "Viento", "Niebla", "Rayo", "Granizo", "Calor"]
  },
  {
    id: "superheroes",
    name: "Fantasía y Superhéroes",
    words: ["Capa", "Máscara", "Superpoder", "Escudo", "Volar", "Villano", "Justicia", "Kryptonita", "Castillo", "Dragón"]
  },
  {
    id: "hobbies",
    name: "Pasatiempos y Hobbies",
    words: ["Lectura", "Fotografía", "Jardinería", "Ajedrez", "Dibujo", "Videojuegos", "Senderismo", "Pesca", "Baile", "Tejer"]
  },
  {
    id: "casa",
    name: "Objetos de la Casa",
    words: ["Espejo", "Lámpara", "Sofá", "Almohada", "Reloj", "Silla", "Mesa", "Nevera", "Estantería", "Alfombra"]
  },
  {
    id: "mitologia",
    name: "Mitología",
    words: ["Zeus", "Poseidón", "Hércules", "Fénix", "Minotauro", "Pegaso", "Olimpo", "Centauro", "Sirena", "Esfinge"]
  }
];

// Helper to select a random category and word
export function getRandomWord(): { category: string; word: string } {
  const randomCategory = CATEGORIES_BANK[Math.floor(Math.random() * CATEGORIES_BANK.length)];
  const randomWord = randomCategory.words[Math.floor(Math.random() * randomCategory.words.length)];
  return {
    category: randomCategory.name,
    word: randomWord
  };
}
