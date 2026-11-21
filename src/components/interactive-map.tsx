"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  MapPin,
  Search,
  Layers,
  Utensils,
  Building2,
  Truck,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  Globe,
} from "lucide-react";

export type MapMarkerItem = {
  id: string;
  name: string;
  role: "RESTAURANT" | "NGO" | "VOLUNTEER";
  city: string;
  state: string;
  lat: number;
  lng: number;
  details: string;
  mealsAvailable?: number;
  contact?: string;
  status?: string;
};

// Major Indian cities and hub coordinates
export const INDIA_HUBS: Record<string, { lat: number; lng: number; zoom: number }> = {
  All: { lat: 21.7679, lng: 78.8718, zoom: 5 },
  Delhi: { lat: 28.6139, lng: 77.209, zoom: 12 },
  Mumbai: { lat: 19.076, lng: 72.8777, zoom: 12 },
  Bengaluru: { lat: 12.9716, lng: 77.5946, zoom: 12 },
  Hyderabad: { lat: 17.385, lng: 78.4867, zoom: 12 },
  Chennai: { lat: 13.0827, lng: 80.2707, zoom: 12 },
  Kolkata: { lat: 22.5726, lng: 88.3639, zoom: 12 },
  Pune: { lat: 18.5204, lng: 73.8567, zoom: 12 },
  Ahmedabad: { lat: 23.0225, lng: 72.5714, zoom: 12 },
};

// Seed markers across major Indian cities
export const INITIAL_INDIA_MARKERS: MapMarkerItem[] = [
  // Delhi NCR
  {
    id: "del-1",
    name: "Punjab Grill & Catering",
    role: "RESTAURANT",
    city: "Delhi",
    state: "Delhi",
    lat: 28.6315,
    lng: 77.2167,
    details: "Dal Makhani & Naan (90 meal packets)",
    mealsAvailable: 90,
  },
  {
    id: "del-2",
    name: "Robin Hood Army Delhi Hub",
    role: "NGO",
    city: "Delhi",
    state: "Delhi",
    lat: 28.582,
    lng: 77.234,
    details: "Feeding 250+ individuals daily",
  },
  {
    id: "del-3",
    name: "Aman • Active Delivery",
    role: "VOLUNTEER",
    city: "Delhi",
    state: "Delhi",
    lat: 28.605,
    lng: 77.225,
    details: "En route to Nizamuddin shelter",
    status: "Delivering",
  },

  // Mumbai
  {
    id: "mum-1",
    name: "Bandra Feast Banquet",
    role: "RESTAURANT",
    city: "Mumbai",
    state: "Maharashtra",
    lat: 19.0596,
    lng: 72.8295,
    details: "Veg Pulao & Paneer Curry (120 packets)",
    mealsAvailable: 120,
  },
  {
    id: "mum-2",
    name: "Roti Bank Foundation Mumbai",
    role: "NGO",
    city: "Mumbai",
    state: "Maharashtra",
    lat: 19.0178,
    lng: 72.8478,
    details: "Central kitchen serving slum clusters",
  },
  {
    id: "mum-3",
    name: "Pooja • Fleet Van #2",
    role: "VOLUNTEER",
    city: "Mumbai",
    state: "Maharashtra",
    lat: 19.04,
    lng: 72.85,
    details: "Cold-chain food rescue van on Western Express",
    status: "Active",
  },

  // Bengaluru
  {
    id: "blr-1",
    name: "Indiranagar Club Kitchen",
    role: "RESTAURANT",
    city: "Bengaluru",
    state: "Karnataka",
    lat: 12.9784,
    lng: 77.6408,
    details: "Rice, Sambar & Poriyal (75 packets)",
    mealsAvailable: 75,
  },
  {
    id: "blr-2",
    name: "Akshaya Feed Initiative",
    role: "NGO",
    city: "Bengaluru",
    state: "Karnataka",
    lat: 12.9352,
    lng: 77.6245,
    details: "Koramangala shelter distribution hub",
  },
  {
    id: "blr-3",
    name: "Vikram • Two-Wheeler Express",
    role: "VOLUNTEER",
    city: "Bengaluru",
    state: "Karnataka",
    lat: 12.96,
    lng: 77.63,
    details: "Quick pickup from caterers",
    status: "Available",
  },

  // Hyderabad
  {
    id: "hyd-1",
    name: "Paradise Heritage Banquet",
    role: "RESTAURANT",
    city: "Hyderabad",
    state: "Telangana",
    lat: 17.4435,
    lng: 78.4862,
    details: "Vegetable Biryani & Mirchi Ka Salan (150 meal boxes)",
    mealsAvailable: 150,
  },
  {
    id: "hyd-2",
    name: "Hope Foundation Shelter",
    role: "NGO",
    city: "Hyderabad",
    state: "Telangana",
    lat: 17.4375,
    lng: 78.4482,
    details: "Capacity for 140 persons",
  },
  {
    id: "hyd-3",
    name: "Rahul • Rescue Volunteer",
    role: "VOLUNTEER",
    city: "Hyderabad",
    state: "Telangana",
    lat: 17.443,
    lng: 78.41,
    details: "Transporting insulated containers",
    status: "Delivering",
  },

  // Chennai
  {
    id: "chn-1",
    name: "Ananda Bhavan Sweets & Caterers",
    role: "RESTAURANT",
    city: "Chennai",
    state: "Tamil Nadu",
    lat: 13.0418,
    lng: 80.2341,
    details: "Curd Rice & Sambar Rice (110 packets)",
    mealsAvailable: 110,
  },
  {
    id: "chn-2",
    name: "Madras Care Mission",
    role: "NGO",
    city: "Chennai",
    state: "Tamil Nadu",
    lat: 13.0102,
    lng: 80.2157,
    details: "Old age home food distribution",
  },

  // Kolkata
  {
    id: "kol-1",
    name: "Heritage Park Kitchen",
    role: "RESTAURANT",
    city: "Kolkata",
    state: "West Bengal",
    lat: 22.5512,
    lng: 88.3524,
    details: "Khichdi & Mixed Veg (80 packets)",
    mealsAvailable: 80,
  },
  {
    id: "kol-2",
    name: "Bengal Compassion Society",
    role: "NGO",
    city: "Kolkata",
    state: "West Bengal",
    lat: 22.5726,
    lng: 88.3755,
    details: "Shelter kitchen serving 200+ daily",
  },

  // Pune
  {
    id: "pun-1",
    name: "Maharashtra Caterers Hub",
    role: "RESTAURANT",
    city: "Pune",
    state: "Maharashtra",
    lat: 18.5362,
    lng: 73.8958,
    details: "Pulao & Raita (65 packets)",
    mealsAvailable: 65,
  },
  {
    id: "pun-2",
    name: "Pune Seva Kitchen",
    role: "NGO",
    city: "Pune",
    state: "Maharashtra",
    lat: 18.5089,
    lng: 73.8258,
    details: "Community free meal distribution",
  },
];

const CARTO_API_KEY =
  process.env.NEXT_PUBLIC_CARTO_API_KEY || "cb1_5ded_1_a30695abc133718418a8c126";
const GOOGLE_MAPS_API_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "AIzaSyCXNqSOfxHkoqbGCcYBgva1s7EbmyijeeQ";

interface InteractiveMapProps {
  markers?: MapMarkerItem[];
  height?: string;
  selectedCity?: string;
  enableSelection?: boolean;
  onLocationSelect?: (lat: number, lng: number, address?: string) => void;
  showControls?: boolean;
  routeLine?: { from: [number, number]; to: [number, number] };
  initialCenter?: [number, number];
  initialZoom?: number;
}

// Global script loader for Google Maps
function loadGoogleMapsScript(apiKey: string): Promise<any> {
  if (typeof window === "undefined") return Promise.reject(new Error("SSR"));
  if ((window as any).google?.maps) return Promise.resolve((window as any).google.maps);

  return new Promise((resolve, reject) => {
    const existing = document.getElementById("resqmeal-google-maps-script") as HTMLScriptElement;
    if (existing) {
      if ((window as any).google?.maps) {
        resolve((window as any).google.maps);
        return;
      }
      existing.addEventListener("load", () => resolve((window as any).google.maps));
      existing.addEventListener("error", (e) => reject(e));
      return;
    }

    const script = document.createElement("script");
    script.id = "resqmeal-google-maps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&loading=async`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve((window as any).google.maps);
    script.onerror = (e) => reject(e);
    document.head.appendChild(script);
  });
}

export function InteractiveMap({
  markers = INITIAL_INDIA_MARKERS,
  height = "560px",
  selectedCity = "All",
  enableSelection = false,
  onLocationSelect,
  showControls = true,
  routeLine,
  initialCenter = [21.7679, 78.8718],
  initialZoom = 5,
}: InteractiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapProvider, setMapProvider] = useState<"google" | "carto">("carto");

  // Instances
  const googleMapInstanceRef = useRef<any>(null);
  const googleMarkersRef = useRef<any[]>([]);
  const googleRouteRef = useRef<any>(null);
  const googleSelectMarkerRef = useRef<any>(null);

  const leafletMapInstanceRef = useRef<any>(null);
  const leafletMarkersLayerRef = useRef<any>(null);
  const leafletSelectMarkerRef = useRef<any>(null);

  const [activeCity, setActiveCity] = useState(selectedCity);
  const [activeRoleFilter, setActiveRoleFilter] = useState<"ALL" | "RESTAURANT" | "NGO" | "VOLUNTEER">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPin, setSelectedPin] = useState<MapMarkerItem | null>(null);

  // ─────────────────────────────────────────────
  // 1. Google Maps Engine
  // ─────────────────────────────────────────────
  const initGoogleMap = useCallback(() => {
    if (!mapContainerRef.current) return;

    // Listen for auth failure fallback
    (window as any).gm_authFailure = () => {
      console.warn("Google Maps Auth issue. Seamlessly switching to CARTO Basemap.");
      setMapProvider("carto");
    };

    loadGoogleMapsScript(GOOGLE_MAPS_API_KEY)
      .then((googleMaps) => {
        if (!mapContainerRef.current) return;

        // Clear container DOM if leaflet was there
        mapContainerRef.current.innerHTML = "";

        const map = new googleMaps.Map(mapContainerRef.current, {
          center: { lat: initialCenter[0], lng: initialCenter[1] },
          zoom: initialZoom,
          mapTypeId: googleMaps.MapTypeId.ROADMAP,
          mapTypeControl: true,
          mapTypeControlOptions: {
            style: googleMaps.MapTypeControlStyle.HORIZONTAL_BAR,
            position: googleMaps.ControlPosition.TOP_LEFT,
          },
          zoomControl: true,
          zoomControlOptions: {
            position: googleMaps.ControlPosition.RIGHT_CENTER,
          },
          streetViewControl: true,
          streetViewControlOptions: {
            position: googleMaps.ControlPosition.RIGHT_BOTTOM,
          },
          fullscreenControl: true,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }],
            },
          ],
        });

        googleMapInstanceRef.current = map;

        // Selection pin
        if (enableSelection) {
          map.addListener("click", (e: any) => {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();

            if (googleSelectMarkerRef.current) {
              googleSelectMarkerRef.current.setPosition({ lat, lng });
            } else {
              googleSelectMarkerRef.current = new googleMaps.Marker({
                position: { lat, lng },
                map,
                title: "Selected Location",
                animation: googleMaps.Animation.DROP,
              });
            }

            if (onLocationSelect) {
              onLocationSelect(lat, lng);
            }
          });
        }

        // Route line
        if (routeLine) {
          googleRouteRef.current = new googleMaps.Polyline({
            path: [
              { lat: routeLine.from[0], lng: routeLine.from[1] },
              { lat: routeLine.to[0], lng: routeLine.to[1] },
            ],
            geodesic: true,
            strokeColor: "#138A36",
            strokeOpacity: 0.9,
            strokeWeight: 5,
            map,
          });

          const bounds = new googleMaps.LatLngBounds();
          bounds.extend({ lat: routeLine.from[0], lng: routeLine.from[1] });
          bounds.extend({ lat: routeLine.to[0], lng: routeLine.to[1] });
          map.fitBounds(bounds, 60);
        }

        renderGoogleMarkers(googleMaps, map);
      })
      .catch((err) => {
        console.warn("Failed to load Google Maps script. Falling back to CARTO.", err);
        setMapProvider("carto");
      });
  }, [enableSelection, initialCenter, initialZoom, onLocationSelect, routeLine]);

  // Render Google Markers
  const renderGoogleMarkers = (googleMaps: any, map: any) => {
    // Clear old markers
    googleMarkersRef.current.forEach((m) => m.setMap(null));
    googleMarkersRef.current = [];

    const filtered = markers.filter((item) => {
      const matchRole = activeRoleFilter === "ALL" || item.role === activeRoleFilter;
      const matchQuery =
        !searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.details.toLowerCase().includes(searchQuery.toLowerCase());
      return matchRole && matchQuery;
    });

    const infoWindow = new googleMaps.InfoWindow();

    filtered.forEach((item) => {
      let fillColor = "#138A36";
      let glyph = "🍲";
      if (item.role === "NGO") {
        fillColor = "#0284C7";
        glyph = "🏢";
      } else if (item.role === "VOLUNTEER") {
        fillColor = "#F59E0B";
        glyph = "🚚";
      }

      // High-res SVG Pin
      const svgIcon = {
        url:
          "data:image/svg+xml;charset=UTF-8," +
          encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" width="38" height="46" viewBox="0 0 38 46">
            <defs>
              <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="4" stdDeviation="3" flood-opacity="0.35"/>
              </filter>
            </defs>
            <path d="M19 0 C8.5 0 0 8.5 0 19 C0 31 19 46 19 46 C19 46 38 31 38 19 C38 8.5 29.5 0 19 0 Z" fill="${fillColor}" filter="url(#shadow)" stroke="#FFFFFF" stroke-width="2.5"/>
            <circle cx="19" cy="18" r="12" fill="#FFFFFF"/>
            <text x="19" y="23" font-size="14" text-anchor="middle">${glyph}</text>
          </svg>
        `),
        scaledSize: new googleMaps.Size(38, 46),
        anchor: new googleMaps.Point(19, 46),
      };

      const marker = new googleMaps.Marker({
        position: { lat: item.lat, lng: item.lng },
        map,
        title: item.name,
        icon: svgIcon,
      });

      const popupHtml = `
        <div style="font-family:system-ui,-apple-system,sans-serif; padding:6px 4px; max-width:230px;">
          <div style="display:inline-block; font-size:10px; font-weight:800; text-transform:uppercase; color:${fillColor}; background:#F8FAFC; padding:2px 8px; border-radius:999px; margin-bottom:4px; border:1px solid #E2E8F0;">
            ${item.role} • ${item.city}
          </div>
          <h4 style="margin:2px 0 4px; font-size:14px; font-weight:800; color:#0F172A;">${item.name}</h4>
          <p style="margin:0 0 6px; font-size:12px; color:#475569; line-height:1.3;">${item.details}</p>
          ${
            item.mealsAvailable
              ? `<div style="font-size:12px; font-weight:800; color:#138A36; background:#E8F7EA; padding:4px 8px; border-radius:8px;">
                  ✨ ${item.mealsAvailable} Meals Available Now
                </div>`
              : ""
          }
        </div>
      `;

      marker.addListener("click", () => {
        infoWindow.setContent(popupHtml);
        infoWindow.open(map, marker);
        setSelectedPin(item);
      });

      googleMarkersRef.current.push(marker);
    });
  };

  // ─────────────────────────────────────────────
  // 2. CARTO Basemap Engine (Leaflet)
  // ─────────────────────────────────────────────
  const initCartoMap = useCallback(() => {
    if (!mapContainerRef.current) return;

    import("leaflet").then((L) => {
      if (!mapContainerRef.current) return;

      // Clean up previous Leaflet instance
      if (leafletMapInstanceRef.current) {
        leafletMapInstanceRef.current.remove();
        leafletMapInstanceRef.current = null;
      }
      mapContainerRef.current.innerHTML = "";

      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: initialZoom,
        zoomControl: false,
        attributionControl: false,
      });

      // CARTO Voyager High-Definition Raster Tiles with User API Key & Retina @2x
      // NOTE: CARTO new API requires ?key= (not ?api_key=)
      const cartoTileUrl = `https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key=${CARTO_API_KEY}`;
      L.tileLayer(cartoTileUrl, {
        maxZoom: 20,
        attribution:
          '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      L.control.zoom({ position: "topright" }).addTo(map);

      const markersLayer = L.layerGroup().addTo(map);
      leafletMarkersLayerRef.current = markersLayer;
      leafletMapInstanceRef.current = map;

      // Selection Marker
      if (enableSelection) {
        map.on("click", (e: any) => {
          const { lat, lng } = e.latlng;
          if (leafletSelectMarkerRef.current) {
            leafletSelectMarkerRef.current.setLatLng([lat, lng]);
          } else {
            const pinIcon = L.divIcon({
              className: "custom-leaflet-icon",
              html: `
                <div style="background:#138A36; width:34px; height:34px; border-radius:50%; border:3px solid white; box-shadow:0 6px 16px rgba(0,0,0,0.3); display:flex; align-items:center; justify-content:center; color:white; font-size:16px;">
                  📍
                </div>
              `,
              iconSize: [34, 34],
              iconAnchor: [17, 34],
            });
            leafletSelectMarkerRef.current = L.marker([lat, lng], { icon: pinIcon }).addTo(map);
          }
          if (onLocationSelect) {
            onLocationSelect(lat, lng);
          }
        });
      }

      // Route Line
      if (routeLine) {
        const polyline = L.polyline([routeLine.from, routeLine.to], {
          color: "#138A36",
          weight: 5,
          dashArray: "6, 8",
        }).addTo(map);
        map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
      }

      renderCartoMarkers(L, map, markersLayer);
    });
  }, [enableSelection, initialCenter, initialZoom, onLocationSelect, routeLine]);

  // Render Leaflet/CARTO Markers
  const renderCartoMarkers = (L: any, map: any, layer: any) => {
    layer.clearLayers();

    const filtered = markers.filter((item) => {
      const matchRole = activeRoleFilter === "ALL" || item.role === activeRoleFilter;
      const matchQuery =
        !searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.details.toLowerCase().includes(searchQuery.toLowerCase());
      return matchRole && matchQuery;
    });

    filtered.forEach((item) => {
      let bg = "#138A36";
      let icon = "🍲";
      let ringColor = "rgba(19, 138, 54, 0.4)";

      if (item.role === "NGO") {
        bg = "#0284C7";
        icon = "🏢";
        ringColor = "rgba(2, 132, 199, 0.4)";
      } else if (item.role === "VOLUNTEER") {
        bg = "#F59E0B";
        icon = "🚚";
        ringColor = "rgba(245, 158, 11, 0.4)";
      }

      const customIcon = L.divIcon({
        className: "custom-pulse-marker",
        html: `
          <div style="position:relative; width:36px; height:36px;">
            <div style="position:absolute; inset:-4px; border-radius:50%; background:${ringColor}; animation:ping 2s cubic-bezier(0,0,0.2,1) infinite;"></div>
            <div style="position:relative; width:36px; height:36px; border-radius:50%; background:${bg}; border:2.5px solid white; box-shadow:0 8px 18px rgba(0,0,0,0.25); display:flex; align-items:center; justify-content:center; color:white; font-size:16px;">
              ${icon}
            </div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const marker = L.marker([item.lat, item.lng], { icon: customIcon });

      const popupContent = `
        <div style="font-family:system-ui,sans-serif; padding:4px; max-width:230px;">
          <div style="display:inline-block; font-size:10px; font-weight:800; text-transform:uppercase; color:${bg}; background:#F0FDF4; padding:2px 8px; border-radius:999px; margin-bottom:4px; border:1px solid #DCFCE7;">
            ${item.role} • ${item.city}
          </div>
          <h4 style="margin:2px 0 4px; font-size:14px; font-weight:800; color:#0F172A;">${item.name}</h4>
          <p style="margin:0 0 6px; font-size:12px; color:#475569; line-height:1.3;">${item.details}</p>
          ${
            item.mealsAvailable
              ? `<div style="font-size:12px; font-weight:800; color:#138A36; background:#E8F7EA; padding:4px 8px; border-radius:8px;">
                  ✨ ${item.mealsAvailable} Meals Available Now
                </div>`
              : ""
          }
        </div>
      `;

      marker.bindPopup(popupContent, {
        closeButton: false,
        className: "custom-leaflet-popup",
      });

      marker.on("click", () => {
        setSelectedPin(item);
      });

      marker.addTo(layer);
    });
  };

  // Mount/Switch map engine
  useEffect(() => {
    if (mapProvider === "google") {
      initGoogleMap();
    } else {
      initCartoMap();
    }

    return () => {
      if (leafletMapInstanceRef.current) {
        leafletMapInstanceRef.current.remove();
        leafletMapInstanceRef.current = null;
      }
    };
  }, [mapProvider, initGoogleMap, initCartoMap]);

  // Update markers when filters change
  useEffect(() => {
    if (mapProvider === "google" && googleMapInstanceRef.current && (window as any).google?.maps) {
      renderGoogleMarkers((window as any).google.maps, googleMapInstanceRef.current);
    } else if (mapProvider === "carto" && leafletMapInstanceRef.current && leafletMarkersLayerRef.current) {
      import("leaflet").then((L) => {
        renderCartoMarkers(L, leafletMapInstanceRef.current, leafletMarkersLayerRef.current);
      });
    }
  }, [activeRoleFilter, searchQuery, markers, mapProvider]);

  // Pan to selected Indian city
  function handleCityChange(city: string) {
    setActiveCity(city);
    const target = INDIA_HUBS[city];
    if (!target) return;

    if (mapProvider === "google" && googleMapInstanceRef.current) {
      googleMapInstanceRef.current.panTo({ lat: target.lat, lng: target.lng });
      googleMapInstanceRef.current.setZoom(target.zoom);
    } else if (mapProvider === "carto" && leafletMapInstanceRef.current) {
      leafletMapInstanceRef.current.flyTo([target.lat, target.lng], target.zoom, {
        duration: 1.2,
      });
    }
  }

  // ── Search bar: geocode on Enter key (Nominatim) ──
  const [isGeoSearching, setIsGeoSearching] = useState(false);
  const [geoError, setGeoError] = useState("");

  async function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return;
    const query = searchQuery.trim();
    if (!query) return;

    // 1. First try matching one of our city pill buttons (case-insensitive)
    const cityMatch = Object.keys(INDIA_HUBS).find(
      (c) => c.toLowerCase() === query.toLowerCase()
    );
    if (cityMatch) {
      handleCityChange(cityMatch);
      setGeoError("");
      return;
    }

    // 2. Fall back to Nominatim geocoding for free-text addresses
    setIsGeoSearching(true);
    setGeoError("");
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + " India")}&format=json&limit=1&countrycodes=in`,
        { headers: { "Accept-Language": "en" } }
      );
      const results = await res.json();
      if (!results || results.length === 0) {
        setGeoError(`"${query}" not found. Try a city name or landmark.`);
        return;
      }
      const { lat, lon } = results[0];
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lon);

      if (mapProvider === "google" && googleMapInstanceRef.current) {
        googleMapInstanceRef.current.panTo({ lat: latitude, lng: longitude });
        googleMapInstanceRef.current.setZoom(13);
      } else if (mapProvider === "carto" && leafletMapInstanceRef.current) {
        leafletMapInstanceRef.current.flyTo([latitude, longitude], 13, { duration: 1.2 });
      }
      setGeoError("");
    } catch {
      setGeoError("Search failed. Check your connection and try again.");
    } finally {
      setIsGeoSearching(false);
    }
  }

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-slate-200/90 bg-white shadow-xl">
      {/* ── Top Bar with Filters, City Selector & Map Engine Switcher ── */}
      {showControls && (
        <div className="p-4 bg-white/95 border-b border-slate-200/80 backdrop-blur flex flex-wrap items-center justify-between gap-3 z-10 relative">
          {/* City Selector Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 max-w-full">
            <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-[#138A36]" />
              City:
            </span>
            {Object.keys(INDIA_HUBS).map((city) => (
              <button
                key={city}
                onClick={() => handleCityChange(city)}
                className={`rounded-full px-3 py-1 text-xs font-bold transition whitespace-nowrap ${
                  activeCity === city
                    ? "bg-[#138A36] text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {city}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2.5">
            {/* Map Engine Toggle (Google Maps vs CARTO Basemap) */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-full border border-slate-200 text-[11px] font-black">
              <button
                onClick={() => setMapProvider("google")}
                className={`px-3 py-1 rounded-full transition flex items-center gap-1.5 ${
                  mapProvider === "google"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
                title="Official Google Maps Platform"
              >
                <span>🗺️</span>
                <span>Google Maps</span>
              </button>
              <button
                onClick={() => setMapProvider("carto")}
                className={`px-3 py-1 rounded-full transition flex items-center gap-1.5 ${
                  mapProvider === "carto"
                    ? "bg-[#138A36] text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
                title="CARTO Basemaps Ultra HD Voyager"
              >
                <span>⚡</span>
                <span>CARTO HD</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative min-w-[180px] max-w-xs">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search city or place... (Enter)"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setGeoError(""); }}
                onKeyDown={handleSearchKeyDown}
                className="w-full rounded-full border border-slate-200 bg-slate-50 pl-8 pr-8 py-1.5 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:border-[#138A36] focus:bg-white focus:outline-none"
              />
              {isGeoSearching && (
                <span className="absolute right-3 top-2 h-3.5 w-3.5 border-2 border-[#138A36] border-t-transparent rounded-full animate-spin inline-block" />
              )}
              {geoError && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-red-50 border border-red-200 text-red-600 text-[10px] font-bold rounded-xl px-3 py-1.5 z-50 shadow-sm">
                  {geoError}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Map Viewport Container ── */}
      <div className="relative w-full" style={{ height }}>
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Floating Role Filter Badges on Map (Bottom-Left) */}
        {showControls && (
          <div className="absolute bottom-5 left-5 z-[500] flex flex-wrap items-center gap-2 bg-white/95 p-2 rounded-2xl shadow-lg border border-slate-200/80 backdrop-blur">
            <button
              onClick={() => setActiveRoleFilter("ALL")}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                activeRoleFilter === "ALL"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              All Pins
            </button>
            <button
              onClick={() => setActiveRoleFilter("RESTAURANT")}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 transition ${
                activeRoleFilter === "RESTAURANT"
                  ? "bg-[#138A36] text-white"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-[#138A36]" />
              <span>Restaurants</span>
            </button>
            <button
              onClick={() => setActiveRoleFilter("NGO")}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 transition ${
                activeRoleFilter === "NGO"
                  ? "bg-[#0284C7] text-white"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-[#0284C7]" />
              <span>NGOs</span>
            </button>
            <button
              onClick={() => setActiveRoleFilter("VOLUNTEER")}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 transition ${
                activeRoleFilter === "VOLUNTEER"
                  ? "bg-[#F59E0B] text-white"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-[#F59E0B]" />
              <span>Volunteers</span>
            </button>
          </div>
        )}

        {/* Selected Pin Sidecard (if any pin clicked) */}
        {selectedPin && (
          <div className="absolute top-5 right-5 z-[500] w-72 rounded-2xl bg-white p-4 shadow-2xl border border-slate-200/90 animate-in fade-in slide-in-from-right-4">
            <div className="flex items-start justify-between">
              <span
                className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                  selectedPin.role === "RESTAURANT"
                    ? "bg-[#E8F7EA] text-[#138A36]"
                    : selectedPin.role === "NGO"
                    ? "bg-sky-50 text-sky-700"
                    : "bg-amber-50 text-amber-700"
                }`}
              >
                {selectedPin.role} • {selectedPin.city}
              </span>
              <button
                onClick={() => setSelectedPin(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <h4 className="mt-2 text-base font-black text-slate-900">{selectedPin.name}</h4>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">{selectedPin.details}</p>

            {selectedPin.mealsAvailable && (
              <div className="mt-3 flex items-center justify-between rounded-xl bg-[#E8F7EA] p-2.5 text-xs font-extrabold text-[#138A36]">
                <span>Surplus Meals Available:</span>
                <span className="text-sm font-black">{selectedPin.mealsAvailable}</span>
              </div>
            )}

            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-400">
              <span>{selectedPin.state}, India</span>
              <span className="text-[#138A36] hover:underline cursor-pointer">Live Verified ✔</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
