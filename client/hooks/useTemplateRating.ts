import { useEffect, useState } from "react";

interface TemplateUsage {
  templateId: string;
  templateTitle: string;
  usedAt: string;
  tripId: string;
}

export function useTemplateRating() {
  const [pendingRatings, setPendingRatings] = useState<TemplateUsage[]>([]);

  useEffect(() => {
    // Load pending ratings from localStorage
    const stored = localStorage.getItem("pendingTemplateRatings");
    if (stored) {
      try {
        const ratings = JSON.parse(stored);
        setPendingRatings(ratings);
      } catch (error) {
        console.error("Failed to parse pending ratings:", error);
      }
    }
  }, []);

  const trackTemplateUsage = (
    templateId: string,
    templateTitle: string,
    tripId: string
  ) => {
    const usage: TemplateUsage = {
      templateId,
      templateTitle,
      usedAt: new Date().toISOString(),
      tripId,
    };

    const stored = localStorage.getItem("pendingTemplateRatings");
    const existing = stored ? JSON.parse(stored) : [];
    
    // Avoid duplicates
    const filtered = existing.filter(
      (u: TemplateUsage) => u.templateId !== templateId
    );
    
    const updated = [...filtered, usage];
    localStorage.setItem("pendingTemplateRatings", JSON.stringify(updated));
    setPendingRatings(updated);
  };

  const removeFromPending = (templateId: string) => {
    const filtered = pendingRatings.filter((u) => u.templateId !== templateId);
    localStorage.setItem("pendingTemplateRatings", JSON.stringify(filtered));
    setPendingRatings(filtered);
  };

  const shouldPromptRating = (templateId: string): boolean => {
    const usage = pendingRatings.find((u) => u.templateId === templateId);
    if (!usage) return false;

    // Prompt rating after 24 hours of template usage
    const usedAt = new Date(usage.usedAt);
    const now = new Date();
    const hoursPassed = (now.getTime() - usedAt.getTime()) / (1000 * 60 * 60);
    
    return hoursPassed >= 24;
  };

  return {
    pendingRatings,
    trackTemplateUsage,
    removeFromPending,
    shouldPromptRating,
  };
}
