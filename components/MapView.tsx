import React, { useEffect, useRef, useState } from 'react';
import { Coordinates, DirectoryItem } from '../types';
import { Search } from 'lucide-react';
import { escapeHTML } from '../utils/security';

declare const L: any; // Leaflet global from CDN

interface MapViewProps {
  userLocation: Coordinates | null;
  items: DirectoryItem[];
  onSelectItem: (item: DirectoryItem) => void;
  onSearchArea?: (center: Coordinates) => void;
}

const MapView: React.FC<MapViewProps> = ({ userLocation, items, onSelectItem, onSearchArea }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const clusterGroup = useRef<any>(null);
  
  const [showSearchHere, setShowSearchHere] = useState(false);
  const [mapCenter, setMapCenter] = useState<Coordinates | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map if not already initialized
    if (!mapInstance.current) {
      const defaultCenter = userLocation 
        ? [userLocation.latitude, userLocation.longitude] 
        : [20, 0]; 
      
      const defaultZoom = userLocation ? 13 : 2;

      mapInstance.current = L.map(mapContainer.current, {
        zoomControl: false, 
        attributionControl: false
      }).setView(defaultCenter, defaultZoom);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(mapInstance.current);

      L.control.attribution({ position: 'bottomright' }).addTo(mapInstance.current);

      // Initialize Cluster Group
      clusterGroup.current = L.markerClusterGroup({
         showCoverageOnHover: false,
         maxClusterRadius: 50,
      });
      mapInstance.current.addLayer(clusterGroup.current);

      // Map Move Listeners for "Search Here"
      mapInstance.current.on('movestart', () => {
         setShowSearchHere(false); 
      });

      mapInstance.current.on('moveend', () => {
         const center = mapInstance.current.getCenter();
         const newCoords = { latitude: center.lat, longitude: center.lng };
         setMapCenter(newCoords);
         
         // Only show button if we moved significantly away from user location or if no user location
         if (onSearchArea) {
             setShowSearchHere(true);
         }
      });
    }

    const map = mapInstance.current;

    // Update Cluster Group
    if (clusterGroup.current) {
        clusterGroup.current.clearLayers();

        const markers: any[] = [];

        // Add User Marker (not clustered usually, but keeping it simple)
        if (userLocation && userLocation.latitude !== undefined && userLocation.longitude !== undefined) {
             const userIcon = L.divIcon({
                className: 'custom-div-icon',
                html: `<div style="background-color: #0ea5e9; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
                iconSize: [16, 16],
                iconAnchor: [8, 8]
            });
            const userMarker = L.marker([userLocation.latitude, userLocation.longitude], { icon: userIcon })
                .bindPopup("<b>You are here</b>");
            
            // Add directly to map, not cluster, so it's always visible
            userMarker.addTo(map); 
        }

        // Add Items to Cluster
        items.forEach((item) => {
            if (item.latitude !== undefined && item.longitude !== undefined) {
                const itemIcon = L.divIcon({
                    className: 'custom-div-icon',
                    html: `<div style="background-color: #ef4444; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-size: 10px; font-weight: bold;"></div>`,
                    iconSize: [24, 24],
                    iconAnchor: [12, 12]
                });

                const marker = L.marker([item.latitude, item.longitude], { icon: itemIcon });

                // SECURITY: Sanitize content before inserting into HTML
                const safeName = escapeHTML(item.name);
                const safeAddress = escapeHTML(item.address);
                const safeRating = item.rating ? `★ ${item.rating}` : '';

                const popupContent = `
                <div style="min-width: 150px;">
                    <h3 style="margin: 0; font-weight: bold; font-size: 14px;">${safeName}</h3>
                    <p style="margin: 4px 0 0; font-size: 12px; color: #666;">${safeRating} ${safeAddress}</p>
                </div>
                `;

                marker.bindPopup(popupContent);
                marker.on('click', () => onSelectItem(item));
                markers.push(marker);
            }
        });

        if (markers.length > 0) {
            clusterGroup.current.addLayers(markers);
        }
        
        // Only fit bounds if we aren't manually exploring (not showing Search Here button yet)
        // AND we have items to show.
        if (items.length > 0 && !showSearchHere) {
             // CRITICAL FIX: Filter items to only those with VALID coordinates before creating bounds
             // This prevents "Invalid LatLng object: (undefined, undefined)" error
             const validItems = items.filter(i => i.latitude !== undefined && i.longitude !== undefined);
             
             if (validItems.length > 0) {
                 const bounds = L.latLngBounds(validItems.map(i => [i.latitude!, i.longitude!]));
                 
                 if (userLocation && userLocation.latitude !== undefined && userLocation.longitude !== undefined) {
                     bounds.extend([userLocation.latitude, userLocation.longitude]);
                 }
                 
                 if(bounds.isValid()) {
                    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
                 }
             }
        }
    }

  }, [userLocation, items, onSelectItem]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full">
        <div ref={mapContainer} className="w-full h-full" style={{ background: '#e5e7eb' }} />
        
        {/* Search This Area Button */}
        {showSearchHere && onSearchArea && mapCenter && (
            <button 
                onClick={() => {
                    onSearchArea(mapCenter);
                    setShowSearchHere(false);
                }}
                className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[400] bg-white text-brand-600 px-4 py-2 rounded-full shadow-lg font-bold text-sm flex items-center animate-slide-up border border-brand-100"
            >
                <Search className="w-4 h-4 mr-2" />
                Search this area
            </button>
        )}
    </div>
  );
};

export default MapView;
