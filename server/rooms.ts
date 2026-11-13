import { Request, Response } from 'express';
import { dbGetRooms, dbGetRoomById, dbCreateRoom, dbUpdateRoom, dbDeleteRoom } from '../src/db/repository.ts';
import { Room } from '../src/types';

export const defaultRooms: Room[] = [
  {
    id: 'room-2-standard',
    name: 'Pokój 2-osobowy Standard',
    category: 'double',
    basePrice: 160,
    capacity: 2,
    size: '18 m²',
    bedConfig: '1 łóżko małżeńskie lub 2 pojedyncze',
    images: ['/images/image-22.jpg', '/images/image-23.jpg', '/images/image-26.jpg', '/images/18.jpg'],
    tags: ['Śniadanie w cenie', 'Prywatna łazienka', 'TV LED', 'Wi-Fi', 'Widok na las'],
    description: 'Przytulny, klasyczny pokój wykończony w ciepłym drewnie. Idealny na pobyty we dwoje lub wyjazdy narciarskie ze znajomymi.'
  },
  {
    id: 'room-2-comfort',
    name: 'Pokój 2-osobowy Comfort z Balkonem',
    category: 'double',
    basePrice: 195,
    capacity: 2,
    size: '22 m²',
    bedConfig: '1 łoże małżeńskie King-Size',
    images: ['/images/image-23.jpg', '/images/image-25.jpg', '/images/10.jpg', '/images/image-22.jpg'],
    tags: ['Śniadanie w cenie', 'Balkon z widokiem', 'Prywatna łazienka', 'Zestaw kawowy', 'TV 43"'],
    description: 'Przestronny pokój z prywatnym balkonem wychodzącym na zalesione zbocza Pilska. Wyposażony w wygodne łoże małżeńskie i strefę wypoczynkową.'
  },
  {
    id: 'room-family-3-4',
    name: 'Pokój Rodzinny 3-4 osobowy (Studio)',
    category: 'family',
    basePrice: 280,
    capacity: 4,
    size: '32 m²',
    bedConfig: '1 łóżko podwójne + 2 łóżka pojedyncze',
    images: ['/images/image-24.jpg', '/images/24_small.jpg', '/images/14.jpg', '/images/image-22.jpg'],
    tags: ['Śniadanie w cenie', 'Dla rodzin z dziećmi', 'Prywatna łazienka', 'Lodówka', 'Stolik jadalniany'],
    description: 'Idealny wybór dla rodzin. Osobne strefy do spania, dużo miejsca na bagaż i sprzęt narciarski oraz stół rodzinny do wspólnego spędzania czasu.'
  },
  {
    id: 'room-suite-deluxe',
    name: 'Apartament Górski z Tarasem & Salonem',
    category: 'suite',
    basePrice: 390,
    capacity: 5,
    size: '46 m²',
    bedConfig: 'Główna sypialnia z łożem małżeńskim + rozkładana sofa w salonie',
    images: ['/images/image-25.jpg', '/images/image-24.jpg', '/images/25.jpg', '/images/image-23.jpg'],
    tags: ['Śniadanie w cenie', 'Prywatny taras', 'Salon wypoczynkowy', 'Szlafroki SPA', 'Ekspres do kawy'],
    description: 'Najbardziej luksusowy apartament w obiekcie. Składa się z oddzielnej sypialni, eleganckiego salonu z kącikiem kawowym oraz tarasu z widokiem na panoramę gór.'
  }
];

function mapDbRoomToRoom(row: Awaited<ReturnType<typeof dbGetRoomById>>): Room | null {
  if (!row) return null;
  const images: string[] = typeof row.images === 'string' ? JSON.parse(row.images) : row.images;
  const tags: string[] = typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags;
  return {
    id: row.id,
    name: row.name,
    category: row.category as Room['category'],
    basePrice: Number(row.basePrice),
    capacity: Number(row.capacity),
    size: row.size,
    bedConfig: row.bedConfig,
    images,
    tags,
    description: row.description,
    active: row.active,
    orderIndex: row.orderIndex,
  };
}

export async function initializeRooms(): Promise<void> {
  if ((await dbGetRooms()).length > 0) return;
  for (const room of defaultRooms) {
    await dbCreateRoom({
      ...room,
      images: JSON.stringify(room.images),
      tags: JSON.stringify(room.tags),
      active: room.active ?? true,
      orderIndex: room.orderIndex ?? 0,
    });
  }
}

export async function handleGetRooms(_req: Request, res: Response) {
  try {
    const rooms = await dbGetRooms();
    return res.json(rooms.map(row => mapDbRoomToRoom(row)!));
  } catch (error) {
    console.error('Room list database query failed:', error);
    return res.status(503).json({ error: 'Nie udało się pobrać pokoi z bazy danych.' });
  }
}

export async function handleGetRoomById(req: Request, res: Response) {
  try {
    const room = mapDbRoomToRoom(await dbGetRoomById(req.params.id));
    if (!room) return res.status(404).json({ error: 'Pokój nie został odnaleziony.' });
    return res.json(room);
  } catch (error) {
    console.error('Room query failed:', error);
    return res.status(503).json({ error: 'Nie udało się pobrać pokoju z bazy danych.' });
  }
}

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
      orderIndex
    } = req.body;

    if (typeof name !== 'string' || !name.trim() || !Number.isFinite(Number(basePrice)) || Number(basePrice) <= 0) {
      return res.status(400).json({ error: 'Nazwa pokoju oraz poprawna cena podstawowa są wymagane.' });
    }

    const currentRooms = await dbGetRooms();
    const row = await dbCreateRoom({
      id: `room-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      category,
      basePrice: Number(basePrice),
      capacity: Number(capacity),
      size: String(size).trim(),
      bedConfig: String(bedConfig).trim(),
      images: JSON.stringify(Array.isArray(images) ? images : []),
      tags: JSON.stringify(Array.isArray(tags) ? tags : []),
      description: String(description).trim(),
      active: Boolean(active),
      orderIndex: orderIndex === undefined ? currentRooms.length : Number(orderIndex),
    });
    return res.status(201).json({ success: true, room: mapDbRoomToRoom(row)! });
  } catch (error) {
    console.error('Create room failed:', error);
    return res.status(503).json({ error: 'Nie udało się zapisać pokoju w bazie danych.' });
  }
}

export async function handleUpdateRoom(req: Request, res: Response) {
  try {
    const body = req.body;
    const updates: Record<string, unknown> = {};
    for (const key of ['name', 'category', 'size', 'bedConfig', 'description'] as const) {
      if (body[key] !== undefined) updates[key] = String(body[key]).trim();
    }
    for (const key of ['basePrice', 'capacity', 'orderIndex'] as const) {
      if (body[key] !== undefined) updates[key] = Number(body[key]);
    }
    if (body.images !== undefined) updates.images = JSON.stringify(Array.isArray(body.images) ? body.images : [body.images]);
    if (body.tags !== undefined) updates.tags = JSON.stringify(Array.isArray(body.tags) ? body.tags : [body.tags]);
    if (body.active !== undefined) updates.active = Boolean(body.active);

    const row = await dbUpdateRoom(req.params.id, updates);
    if (!row) return res.status(404).json({ error: 'Pokój nie został odnaleziony.' });
    return res.json({ success: true, room: mapDbRoomToRoom(row)! });
  } catch (error) {
    console.error('Update room failed:', error);
    return res.status(503).json({ error: 'Nie udało się zaktualizować pokoju w bazie danych.' });
  }
}

export async function handleDeleteRoom(req: Request, res: Response) {
  try {
    if (!await dbDeleteRoom(req.params.id)) {
      return res.status(404).json({ error: 'Pokój nie został odnaleziony.' });
    }
    return res.json({ success: true, message: 'Pokój został usunięty.' });
  } catch (error) {
    console.error('Delete room failed:', error);
    return res.status(503).json({ error: 'Nie udało się usunąć pokoju z bazy danych.' });
  }
}
