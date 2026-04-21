"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Box, Typography } from "@mui/material";
import { useJsApiLoader, Autocomplete, GoogleMap, Marker } from "@react-google-maps/api";

const defaultCenter = { lat: -6.2088, lng: 106.8456 };
const mapContainerStyle = { width: "100%", height: "320px", borderRadius: 8 };
export interface LocationValue {
  location: string;
  location_lat: number;
  location_lng: number;
}

interface LocationPickerProps {
  value: LocationValue;
  onChange: (value: LocationValue) => void;
  label?: string;
  required?: boolean;
  disabled?: boolean;
}

const libraries: ("places")[] = ["places"];

export default function LocationPicker({
  value,
  onChange,
  label = "Location",
  required = false,
  disabled = false,
}: LocationPickerProps) {
  const [autocompleteRef, setAutocompleteRef] = useState<google.maps.places.Autocomplete | null>(null);
  const [inputValue, setInputValue] = useState(value.location);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>(
    value.location_lat && value.location_lng ? { lat: value.location_lat, lng: value.location_lng } : defaultCenter
  );
  const mapRef = useRef<google.maps.Map | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries,
  });

  useEffect(() => {
    setInputValue(value.location);
  }, [value.location]);

  const onAutocompleteLoad = useCallback((autocomplete: google.maps.places.Autocomplete) => {
    setAutocompleteRef(autocomplete);
  }, []);

  const onPlaceChanged = useCallback(() => {
    if (!autocompleteRef) return;
    const place = autocompleteRef.getPlace();
    if (!place?.geometry?.location) return;
    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();
    const address = place.formatted_address || place.name || "";
    setInputValue(address);
    setMapCenter({ lat, lng });
    onChange({ location: address, location_lat: lat, location_lng: lng });
    if (mapRef.current) {
      mapRef.current.panTo({ lat, lng });
      mapRef.current.setZoom(16);
    }
  }, [autocompleteRef, onChange]);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    geocoderRef.current = new google.maps.Geocoder();
  }, []);

  const onMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      const lat = e.latLng?.lat();
      const lng = e.latLng?.lng();
      if (lat == null || lng == null || !geocoderRef.current) return;
      setMapCenter({ lat, lng });
      if (mapRef.current) {
        mapRef.current.panTo({ lat, lng });
        mapRef.current.setZoom(16);
      }
      geocoderRef.current.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === "OK" && results?.[0]) {
          const address = results[0].formatted_address || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
          setInputValue(address);
          onChange({
            location: address,
            location_lat: lat,
            location_lng: lng,
          });
        } else {
          const address = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
          setInputValue(address);
          onChange({
            location: address,
            location_lat: lat,
            location_lng: lng,
          });
        }
      });
    },
    [onChange]
  );

  if (loadError) {
    return (
      <Box sx={{ mb: 2 }}>
        <Typography color="error">Failed to load Google Maps. Check your API key and network.</Typography>
      </Box>
    );
  }

  if (!apiKey) {
    return (
      <Box sx={{ mb: 2 }}>
        <Typography color="textSecondary">
          Add <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to your .env and enable Maps JavaScript API and Places API
          in Google Cloud Console.
        </Typography>
      </Box>
    );
  }

  if (!isLoaded) {
    return (
      <Box sx={{ mb: 2 }}>
        <Typography color="textSecondary">Loading map…</Typography>
      </Box>
    );
  }

  const center = value.location_lat && value.location_lng
    ? { lat: value.location_lat, lng: value.location_lng }
    : mapCenter;

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
        Search in the box on the map or click the map to set the location. Address, latitude, and longitude are filled automatically.
      </Typography>
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          borderRadius: 1,
          border: "1px solid",
          borderColor: "divider",
          height: mapContainerStyle.height,
        }}
      >
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "100%", borderRadius: 0 }}
          center={center}
          zoom={value.location_lat && value.location_lng ? 16 : 12}
          onLoad={onMapLoad}
          onClick={onMapClick}
          options={{ streetViewControl: false, fullscreenControl: true, zoomControl: true, mapTypeControl: true }}
        >
          {value.location_lat && value.location_lng && <Marker position={{ lat: value.location_lat, lng: value.location_lng }} />}
        </GoogleMap>
        {/* Search bar overlaid on top of the map */}
        <Box sx={{ position: "absolute", top: 12, left: 12, right: 12, zIndex: 10 }}>
          <Autocomplete onLoad={onAutocompleteLoad} onPlaceChanged={onPlaceChanged}>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }}
              placeholder="Search address (e.g. Jl. Sudirman, Jakarta)"
              disabled={disabled}
              required={required}
              aria-label={label}
              style={{
                width: "100%",
                padding: "12px 16px",
                fontSize: "1rem",
                fontFamily: "inherit",
                border: "none",
                borderRadius: "8px",
                boxSizing: "border-box",
                boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                outline: "none",
              }}
            />
          </Autocomplete>
        </Box>
      </Box>
    </Box>
  );
}
