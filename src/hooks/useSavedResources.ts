import { useState, useEffect, useCallback } from "react";
import type { SavedResource, Resource } from "@/types/resources";

const STORAGE_KEY = "resourcebridge-saved";

function load(): SavedResource[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function useSavedResources() {
  const [saved, setSaved] = useState<SavedResource[]>(load);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  }, [saved]);

  const saveResource = useCallback((resource: Resource, situationSummary: string) => {
    setSaved((prev) => {
      if (prev.some((r) => r.name === resource.name && r.link === resource.link)) return prev;
      return [...prev, { ...resource, savedAt: new Date().toISOString(), situationSummary }];
    });
  }, []);

  const removeResource = useCallback((name: string, link: string) => {
    setSaved((prev) => prev.filter((r) => !(r.name === name && r.link === link)));
  }, []);

  const isSaved = useCallback(
    (name: string, link: string) => saved.some((r) => r.name === name && r.link === link),
    [saved]
  );

  return { saved, saveResource, removeResource, isSaved };
}
