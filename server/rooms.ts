import { Request, Response } from 'express';
import { dbGetRooms, dbGetRoomById, dbCreateRoom, dbUpdateRoom, dbDeleteRoom } from '../src/db/repository.ts';
import { Room } from '../src/types';

// In-memory fallback if database query is temporarily unavailable
export const fallbackRooms: Room[] = [
  {
    id: "room-2-standard",
    name: "Pokój 2-osobowy Standard",
    category: "double",
    basePrice: 160,
    capacity: 2,
    size: "18 m²",
    bedConfig: "1 łóżko małżeńskie lub 2 pojedyncze",
    images: [
      "/images/image-22.jpg",
      "/images/image-23.jpg",
      "/images/image-26.jpg",
      "/images/18.jpg"
    ],
    tags: ["Śniadanie w cenie", "Prywatna łazienka", "TV LED", "Wi-Fi", "Widok na las"],
    description: "Przytulny, klasyczny pokój wykończony w ciepłym drewnie. Idealny na pobyty we dwoje lub wyjazdy narciarskie ze znajomymi."
  },
  {
    id: "room-2-comfort",
    name: "Pokój 2-osobowy Comfort z Balkonem",
    category: "double",
    basePrice: 195,
    capacity: 2,
    size: "22 m²",
    bedConfig: "1 łoże małżeńskie King-Size",
    images: [
      "/images/image-23.jpg",
      "/images/image-25.jpg",
      "/images/10.jpg",
      "/images/image-22.jpg"
    ],
    tags: ["Śniadanie w cenie", "Balkon z widokiem", "Prywatna łazienka", "Zestaw kawowy", "TV 43\""],
    description: "Przestronny pokój z prywatnym balkonem wychodzącym na zalesione zbocza Pilska. Wyposażony w wygodne łoże małżeńskie i strefę wypoczynkową."
  },
  {
    id: "room-family-3-4",
    name: "Pokój Rodzinny 3-4 osobowy (Studio)",
    category: "family",
    basePrice: 280,
    capacity: 4,
    size: "32 m²",
    bedConfig: "1 łóżko podwójne + 2 łóżka pojedyncze",
    images: [
      "/images/image-24.jpg",
      "/images/24_small.jpg",
      "/images/14.jpg",
      "/images/image-22.jpg"
    ],
    tags: ["Śniadanie w cenie", "Dla rodzin z dziećmi", "Prywatna łazienka", "Lodówka", "Stolik jadalniany"],
    description: "Idealny wybór dla rodzin. Osobne strefy do spania, dużo miejsca na bagaż i sprzęt narciarski oraz stół rodzinny do wspólnego spędzania czasu."
  },
  {
    id: "room-suite-deluxe",
    name: "Apartament Górski z Tarasem & Salonem",
    category: "suite",
    basePrice: 390,
    capacity: 5,
    size: "46 m²",
    bedConfig: "Główna sypialnia z łożem małżeńskim + rozkładana sofa w salonie",
    images: [
      "/images/image-25.jpg",
      "/images/image-24.jpg",
      "/images/25.jpg",
      "/images/image-23.jpg"
    ],
    tags: ["Śniadanie w cenie", "Prywatny taras", "Salon wypoczynkowy", "Szlafroki SPA", "Ekspres do kawy"],
    description: "Najbardziej luksusowy apartament w obiekcie. Składa się z oddzielnej sypialni, eleganckiego salonu z kącikiem kawowym oraz tarasu z widokiem na panoramę gór."
  }
];

let memoryRooms: Room[] = [...fallbackRooms];

// Helper to format DB row to Room object
function mapDbRoomToRoom(row: any): Room {
  let images: string[] = [];
  try {
    images = typeof row.images === 'string' ? JSON.parse(row.images) : row.images || [];
  } catch (_) {
    images = ["/images/image-22.jpg"];
  }

  let tags: string[] = [];
  try {
    tags = typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags || [];
  } catch (_) {
    tags = [];
  }

  return {
    id: row.id,
    name: row.name,
    category: row.category as 'double' | 'family' | 'suite',
    basePrice: Number(row.basePrice || row.base_price || 160),
    capacity: Number(row.capacity || 2),
    size: row.size || "20 m²",
    bedConfig: row.bedConfig || row.bed_config || "1 łóżko małżeńskie",
    images: images.length > 0 ? images : ["/images/image-22.jpg"],
    tags: tags.length > 0 ? tags : ["Wi-Fi", "Prywatna łazienka"],
    description: row.description || "",
    active: row.active !== undefined ? Boolean(row.active) : true,
    orderIndex: Number(row.orderIndex || row.order_index || 0),
  };
}

// GET /api/rooms - Get all active rooms
export async function handleGetRooms(_req: Request, res: Response) {
  try {
    const rows = await dbGetRooms();
    if (rows && rows.length > 0) {
      const mapped = rows.map(mapDbRoomToRoom);
      memoryRooms = mapped;
      return res.json(mapped);
    }
  } catch (err) {
    console.warn("Error fetching rooms from DB, using memory fallback:", err);
  }
  return res.json(memoryRooms);
}

// GET /api/rooms/:id - Get single room
export async function handleGetRoomById(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const row = await dbGetRoomById(id);
    if (row) {
      return res.json(mapDbRoomToRoom(row));
    }
  } catch (err) {
    console.warn("DB getRoomById fallback:", err);
  }
  const found = memoryRooms.find(r => r.id === id);
  if (found) return res.json(found);
  return res.status(404).json({ error: "Pokój nie został odnaleziony." });
}

// POST /api/admin/rooms - Create new room
export async function handleCreateRoom(req: Request, res: Response) {
  try {
    const {
      name,
      category = 'double',
      basePrice,
      capacity = 2,
      size = '20 m²',
      bedConfig = '1 łóżko podwójne',
      images = [],
      tags = [],
      description = '',
      active = true,
      orderIndex = 0
    } = req.body;

    if (!name || !basePrice) {
      return res.status(400).json({ error: "Nazwa pokoju oraz cena podstawowa są wymagane." });
    }

    const id = `room-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const imagesJson = JSON.stringify(Array.isArray(images) && images.length > 0 ? images : ["/images/image-22.jpg"]);
    const tagsJson = JSON.stringify(Array.isArray(tags) ? tags : ["Wi-Fi", "Prywatna łazienka"]);

    const newRoomData = {
      id,
      name: name.trim(),
      category,
      basePrice: Number(basePrice),
      capacity: Number(capacity),
      size: size.trim(),
      bedConfig: bedConfig.trim(),
      images: imagesJson,
      tags: tagsJson,
      description: description.trim(),
      active: Boolean(active),
      orderIndex: Number(orderIndex || memoryRooms.length + 1)
    };

    let createdDbRow = null;
    try {
      createdDbRow = await dbCreateRoom(newRoomData);
    } catch (dbErr) {
      console.warn("Failed saving new room to DB, keeping in memory:", dbErr);
    }

    const newRoom: Room = {
      id,
      name: newRoomData.name,
      category: newRoomData.category as any,
      basePrice: newRoomData.basePrice,
      capacity: newRoomData.capacity,
      size: newRoomData.size,
      bedConfig: newRoomData.bedConfig,
      images: JSON.parse(imagesJson),
      tags: JSON.parse(tagsJson),
      description: newRoomData.description,
      active: newRoomData.active,
      orderIndex: newRoomData.orderIndex,
    };

    memoryRooms.push(newRoom);
    return res.status(201).json({ success: true, room: newRoom });
  } catch (err: any) {
    console.error("Create room error:", err);
    return res.status(500).json({ error: err.message || "Błąd podczas tworzenia pokoju." });
  }
}

// PUT /api/admin/rooms/:id - Update existing room
export async function handleUpdateRoom(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const {
      name,
      category,
      basePrice,
      capacity,
      size,
      bedConfig,
      images,
      tags,
      description,
      active,
      orderIndex
    } = req.body;

    const updates: any = {};
    if (name !== undefined) updates.name = name.trim();
    if (category !== undefined) updates.category = category;
    if (basePrice !== undefined) updates.basePrice = Number(basePrice);
    if (capacity !== undefined) updates.capacity = Number(capacity);
    if (size !== undefined) updates.size = size.trim();
    if (bedConfig !== undefined) updates.bedConfig = bedConfig.trim();
    if (images !== undefined) updates.images = JSON.stringify(Array.isArray(images) ? images : [images]);
    if (tags !== undefined) updates.tags = JSON.stringify(Array.isArray(tags) ? tags : [tags]);
    if (description !== undefined) updates.description = description.trim();
    if (active !== undefined) updates.active = Boolean(active);
    if (orderIndex !== undefined) updates.orderIndex = Number(orderIndex);

    try {
      await dbUpdateRoom(id, updates);
    } catch (dbErr) {
      console.warn("Failed updating room in DB, updating memory:", dbErr);
    }

    const index = memoryRooms.findIndex(r => r.id === id);
    if (index !== -1) {
      memoryRooms[index] = {
        ...memoryRooms[index],
        ...updates,
        images: updates.images ? JSON.parse(updates.images) : memoryRooms[index].images,
        tags: updates.tags ? JSON.parse(updates.tags) : memoryRooms[index].tags,
      };
      return res.json({ success: true, room: memoryRooms[index] });
    }

    return res.json({ success: true, message: "Zaktualizowano pokój." });
  } catch (err: any) {
    console.error("Update room error:", err);
    return res.status(500).json({ error: err.message || "Błąd podczas aktualizacji pokoju." });
  }
}

// DELETE /api/admin/rooms/:id - Delete room
export async function handleDeleteRoom(req: Request, res: Response) {
  const { id } = req.params;
  try {
    try {
      await dbDeleteRoom(id);
    } catch (dbErr) {
      console.warn("Failed deleting room from DB, removing from memory:", dbErr);
    }

    memoryRooms = memoryRooms.filter(r => r.id !== id);
    return res.json({ success: true, message: "Pokój został usunięty." });
  } catch (err: any) {
    console.error("Delete room error:", err);
    return res.status(500).json({ error: err.message || "Błąd podczas usuwania pokoju." });
  }
}
