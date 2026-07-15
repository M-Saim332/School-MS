"use client";

import { useEffect } from "react";

export function BrandingFaviconSync({ faviconUrl }: { faviconUrl: string | null }) {
  useEffect(() => {
    if (!faviconUrl) return;

    const attributeName = "data-school-favicon";
    let link = document.querySelector(`link[${attributeName}="true"]`) as HTMLLinkElement | null;

    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      link.setAttribute(attributeName, "true");
      document.head.appendChild(link);
    }

    link.href = faviconUrl;
  }, [faviconUrl]);

  return null;
}
