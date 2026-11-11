// server/geocoding.ts
// Robust Geocoding & Address Resolution Engine
// Supports any real address: capital cities, towns, small mountain villages, hamlets,
// street addresses with house numbers, village house numbers without street names,
// postal codes, and inputs with typos/missing diacritics.

export interface GeocodedLocation {
  name: string;
  fullName: string;
  lat: number;
  lon: number;
  source: "photon" | "nominatim" | "coords" | "fallback";
  isApproximate?: boolean;
  approximateNote?: string;
  type?: string;
}

export interface AddressSuggestion {
  label: string;
  secondaryText: string;
  fullAddress: string;
  lat: number;
  lon: number;
  type?: string;
}

// In-memory caching for performance and rate-limit friendliness
const geocodeCache = new Map<string, GeocodedLocation>();
const suggestCache = new Map<string, AddressSuggestion[]>();
const MAX_CACHE_ITEMS = 500;

function setCache<T>(cache: Map<string, T>, key: string, value: T) {
  if (cache.size > MAX_CACHE_ITEMS) {
    const firstKey = cache.keys().next().value;
    if (firstKey) cache.delete(firstKey);
  }
  cache.set(key, value);
}

function formatAddressParts(props: any): { label: string; secondaryText: string; fullName: string } {
  const parts: string[] = [];
  
  // Street + number
  if (props.street) {
    parts.push(`${props.street}${props.housenumber ? " " + props.housenumber : ""}`);
  } else if (props.name) {
    parts.push(props.housenumber ? `${props.name} ${props.housenumber}` : props.name);
  } else if (props.housenumber) {
    parts.push(`nr ${props.housenumber}`);
  }

  const label = parts.length > 0 ? parts.join(", ") : (props.city || props.village || props.town || "Wybrana lokalizacja");

  const localityParts: string[] = [];
  const placeName = props.city || props.village || props.town || props.locality || props.municipality;
  if (placeName && placeName !== label) {
    localityParts.push(placeName);
  }
  if (props.district && props.district !== placeName) {
    localityParts.push(props.district);
  }
  if (props.postcode) {
    localityParts.push(props.postcode);
  }
  if (props.state && !localityParts.includes(props.state)) {
    localityParts.push(props.state);
  }
  if (props.country) {
    localityParts.push(props.country);
  }

  const secondaryText = localityParts.join(", ");
  const fullName = [label, secondaryText].filter(Boolean).join(", ");

  return { label, secondaryText, fullName };
}

/**
 * Resolves any real address into geographic coordinates.
 * Handles big cities, small villages, hamlets, house numbers, postal codes, and typos.
 */
export async function resolveAddressToCoordinates(rawQuery: string): Promise<GeocodedLocation> {
  const query = rawQuery.trim();
  if (!query) {
    throw new Error("Podaj nazwę miejscowości, wioski lub dokładny adres.");
  }

  const cacheKey = query.toLowerCase();
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey)!;
  }

  // 0. Check if input is direct coordinates (lat, lon)
  const coordMatch = query.match(/^(-?\d{1,2}\.\d+)[,\s]+(-?\d{1,3}\.\d+)$/);
  if (coordMatch) {
    const lat = parseFloat(coordMatch[1]);
    const lon = parseFloat(coordMatch[3]);
    if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
      const loc: GeocodedLocation = {
        name: `Współrzędne GPS (${lat.toFixed(4)}, ${lon.toFixed(4)})`,
        fullName: `Współrzędne: ${lat.toFixed(5)}, ${lon.toFixed(5)}`,
        lat,
        lon,
        source: "coords"
      };
      setCache(geocodeCache, cacheKey, loc);
      return loc;
    }
  }

  // Generate sensible query search variants in priority order
  const variants: string[] = [];
  variants.push(query);

  // Variant A: Replace commas with spaces (helps OSM token matching)
  const noCommas = query.replace(/[,;]/g, " ").replace(/\s+/g, " ").trim();
  if (!variants.includes(noCommas)) variants.push(noCommas);

  // Variant B: Strip Polish street abbreviations ("ul.", "ulica", "al.", "aleja", "os.", "osiedle")
  const noPrefixes = query.replace(/\b(ul\.|ulica|aleja|al\.|os\.|osiedle|pl\.|plac)\b/gi, "").replace(/[,;]/g, " ").replace(/\s+/g, " ").trim();
  if (!variants.includes(noPrefixes)) variants.push(noPrefixes);

  // Variant C: Normalize postal code formatting e.g. "32065" -> "32-065" or vice-versa
  const postalMatch = query.match(/\b(\d{2})[- ]?(\d{3})\b/);
  if (postalMatch) {
    const standardizedZip = `${postalMatch[1]}-${postalMatch[2]}`;
    const withStandardZip = query.replace(/\b\d{2}[- ]?\d{3}\b/, standardizedZip);
    if (!variants.includes(withStandardZip)) variants.push(withStandardZip);
  }

  // 1. Try Photon (Komoot OSM engine) for each variant
  for (const v of variants) {
    try {
      const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(v)}&limit=5`;
      const res = await fetch(photonUrl, {
        headers: {
          "User-Agent": "WatraKorbielowResort/2.0 (biuro@watrakorbielow.pl)"
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.features && data.features.length > 0) {
          const feat = data.features[0];
          const coords = feat.geometry.coordinates; // [lon, lat]
          const { label, fullName } = formatAddressParts(feat.properties);

          const loc: GeocodedLocation = {
            name: label,
            fullName: fullName || query,
            lat: coords[1],
            lon: coords[0],
            source: "photon",
            type: feat.properties.type || feat.properties.osm_value
          };
          setCache(geocodeCache, cacheKey, loc);
          return loc;
        }
      }
    } catch (err) {
      console.warn(`Photon lookup failed for variant "${v}":`, err);
    }
  }

  // 2. Try OpenStreetMap Nominatim with Polish language preference
  for (const v of variants) {
    try {
      const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(v)}&addressdetails=1&limit=3`;
      const res = await fetch(nominatimUrl, {
        headers: {
          "User-Agent": "WatraKorbielowPlanner/2.0 (biuro@watrakorbielow.pl)",
          "Accept-Language": "pl,en"
        }
      });
      if (res.ok) {
        const list = await res.json();
        if (Array.isArray(list) && list.length > 0) {
          const item = list[0];
          const addr = item.address || {};
          const label = addr.road ? `${addr.road}${addr.house_number ? " " + addr.house_number : ""}` : (addr.village || addr.town || addr.city || item.display_name.split(",")[0]);
          const loc: GeocodedLocation = {
            name: label || query,
            fullName: item.display_name || query,
            lat: parseFloat(item.lat),
            lon: parseFloat(item.lon),
            source: "nominatim",
            type: item.type
          };
          setCache(geocodeCache, cacheKey, loc);
          return loc;
        }
      }
    } catch (err) {
      console.warn(`Nominatim lookup failed for variant "${v}":`, err);
    }
  }

  // 3. Progressive Fallback: Strip house number (e.g. if an exact house number is not yet in OSM)
  // This ensures that small villages, hamlets, or newly built houses still get their route calculated to the street/village!
  const noHouseNumber = query.replace(/\b\d+[a-zA-Z]?\b/g, "").replace(/[,;]/g, " ").replace(/\s+/g, " ").trim();
  if (noHouseNumber.length >= 3 && noHouseNumber !== query) {
    try {
      const fallbackPhotonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(noHouseNumber)}&limit=3`;
      const res = await fetch(fallbackPhotonUrl);
      if (res.ok) {
        const data = await res.json();
        if (data.features && data.features.length > 0) {
          const feat = data.features[0];
          const coords = feat.geometry.coordinates;
          const { label, fullName } = formatAddressParts(feat.properties);

          const loc: GeocodedLocation = {
            name: `${query} (okolice: ${label})`,
            fullName: `${fullName} [trasa do centrum/ulicy: ${label}]`,
            lat: coords[1],
            lon: coords[0],
            source: "fallback",
            isApproximate: true,
            approximateNote: `Dokładny numer posesji może być nowo nadany. Trasa została wyznaczona do centrum ulicy lub miejscowości.`
          };
          setCache(geocodeCache, cacheKey, loc);
          return loc;
        }
      }
    } catch (err) {
      console.warn("Progressive fallback geocoding failed:", err);
    }
  }

  // 4. Fallback: If comma-separated, try geocoding just the town or village part
  const parts = query.split(/[,;]/).map(p => p.trim()).filter(Boolean);
  if (parts.length > 1) {
    for (const part of parts.reverse()) {
      if (part.length >= 3) {
        try {
          const partUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(part)}&limit=1`;
          const res = await fetch(partUrl);
          if (res.ok) {
            const data = await res.json();
            if (data.features && data.features.length > 0) {
              const feat = data.features[0];
              const coords = feat.geometry.coordinates;
              const { label, fullName } = formatAddressParts(feat.properties);

              const loc: GeocodedLocation = {
                name: `${query} (${label})`,
                fullName: `${fullName}`,
                lat: coords[1],
                lon: coords[0],
                source: "fallback",
                isApproximate: true,
                approximateNote: `Trasa wyznaczona do miejscowości ${label}.`
              };
              setCache(geocodeCache, cacheKey, loc);
              return loc;
            }
          }
        } catch (err) {
          // ignore and continue
        }
      }
    }
  }

  throw new Error(`Nie udało się znaleźć lokalizacji dla zapytania "${query}". Upewnij się, że wpisana miejscowość lub kod pocztowy są poprawne.`);
}

/**
 * Autocomplete / Suggestions for real-time address searching
 */
export async function suggestAddresses(rawQuery: string): Promise<AddressSuggestion[]> {
  const query = rawQuery.trim();
  if (!query || query.length < 2) {
    return [];
  }

  const cacheKey = query.toLowerCase();
  if (suggestCache.has(cacheKey)) {
    return suggestCache.get(cacheKey)!;
  }

  try {
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=6`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "WatraKorbielowResort/2.0 (biuro@watrakorbielow.pl)"
      }
    });

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    if (!data.features || !Array.isArray(data.features)) {
      return [];
    }

    const suggestions: AddressSuggestion[] = [];
    const seenAddresses = new Set<string>();

    for (const feat of data.features) {
      const p = feat.properties;
      const { label, secondaryText, fullName } = formatAddressParts(p);
      const coords = feat.geometry?.coordinates;

      if (!coords || seenAddresses.has(fullName)) {
        continue;
      }
      seenAddresses.add(fullName);

      suggestions.push({
        label,
        secondaryText,
        fullAddress: fullName,
        lat: coords[1],
        lon: coords[0],
        type: p.type || p.osm_value
      });
    }

    setCache(suggestCache, cacheKey, suggestions);
    return suggestions;
  } catch (err) {
    console.warn("Failed fetching address suggestions:", err);
    return [];
  }
}
