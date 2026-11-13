import { useState, useEffect, useCallback, useMemo } from 'react';
import { Language, Room } from '../types';
import { getLocalizedRooms, RESORT_ROOMS } from '../data/resortData';

let cachedRooms: Room[] | null = null;

export const useRooms = (lang: Language = 'pl') => {
  const [rawRooms, setRawRooms] = useState<Room[]>(cachedRooms || RESORT_ROOMS);
  const [isLoading, setIsLoading] = useState<boolean>(!cachedRooms);
  const [error, setError] = useState<string | null>(null);

  const fetchRooms = useCallback(async () => {
    try {
      const res = await fetch('/api/rooms');
      if (res.ok) {
        const data: Room[] = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          cachedRooms = data;
          setRawRooms(data);
        }
      }
    } catch (err: any) {
      console.warn('Failed fetching rooms from central API, falling back to local list:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms();

    const handleRoomsUpdate = () => {
      fetchRooms();
    };

    window.addEventListener('rooms_updated', handleRoomsUpdate);
    return () => window.removeEventListener('rooms_updated', handleRoomsUpdate);
  }, [fetchRooms]);

  const rooms = useMemo(() => getLocalizedRooms(lang, rawRooms), [lang, rawRooms]);

  return { rooms, isLoading, error, refetch: fetchRooms };
};
