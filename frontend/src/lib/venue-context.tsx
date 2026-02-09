"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { getVenues, type Venue } from "@/lib/api";

interface VenueContextType {
  venues: Venue[];
  selectedVenue: Venue | null;
  setSelectedVenue: (venue: Venue) => void;
  refreshVenues: () => Promise<void>;
  isLoading: boolean;
}

const VenueContext = createContext<VenueContextType | undefined>(undefined);

const VENUE_STORAGE_KEY = "kesselops_selected_venue_id";

export function VenueProvider({ children }: { children: ReactNode }) {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [selectedVenue, setSelectedVenueState] = useState<Venue | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshVenues = useCallback(async () => {
    try {
      const res = await getVenues();
      if (res.success && res.data) {
        setVenues(res.data);

        // Restore saved venue or select first
        const savedId = localStorage.getItem(VENUE_STORAGE_KEY);
        const saved = savedId ? res.data.find((v) => v.id === Number(savedId)) : null;

        if (saved) {
          setSelectedVenueState(saved);
        } else if (res.data.length > 0) {
          setSelectedVenueState(res.data[0]);
          localStorage.setItem(VENUE_STORAGE_KEY, String(res.data[0].id));
        }
      }
    } catch {
      // Silently fail — venues will be empty
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshVenues();
  }, [refreshVenues]);

  const setSelectedVenue = useCallback((venue: Venue) => {
    setSelectedVenueState(venue);
    localStorage.setItem(VENUE_STORAGE_KEY, String(venue.id));
  }, []);

  return (
    <VenueContext.Provider
      value={{ venues, selectedVenue, setSelectedVenue, refreshVenues, isLoading }}
    >
      {children}
    </VenueContext.Provider>
  );
}

export function useVenue() {
  const context = useContext(VenueContext);
  if (context === undefined) {
    throw new Error("useVenue must be used within a VenueProvider");
  }
  return context;
}
