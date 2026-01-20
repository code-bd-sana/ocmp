"use client";

import Cookies from "js-cookie";
import { ALL_NAVIGATION_LINKS, NavigationLink } from "./repository.types";

const COOKIE_NAME = "dashboard_footer_links";

export class NavigationCookies {
  // Save ONLY enabled/disabled states
  static saveEnabledStates(links: NavigationLink[]): void {
    const enabledStates: Record<string, boolean> = {};

    links.forEach((link) => {
      enabledStates[link.id] = link.enabled;
    });

    Cookies.set(COOKIE_NAME, JSON.stringify(enabledStates), {
      path: "/",
      sameSite: "strict",
    });
  }

  // Get enabled states and merge with ALL_NAVIGATION_LINKS
  static getMergedLinks(): NavigationLink[] {
    try {
      const cookieData = Cookies.get(COOKIE_NAME);

      if (!cookieData) {
        // No cookie: all links disabled
        return ALL_NAVIGATION_LINKS.map((link) => ({
          ...link,
          enabled: false,
        }));
      }

      const enabledStates = JSON.parse(cookieData) as Record<string, boolean>;

      // For each link in ALL_NAVIGATION_LINKS, check if enabled in cookie
      return ALL_NAVIGATION_LINKS.map((link) => ({
        ...link,
        enabled: enabledStates[link.id] || false, // Use saved state or default to false
      }));
    } catch {
      return ALL_NAVIGATION_LINKS.map((link) => ({ ...link, enabled: false }));
    }
  }

  // Get only enabled links for footer
  static getEnabledLinks(): Array<{ label: string; href: string }> {
    const mergedLinks = this.getMergedLinks();

    return mergedLinks
      .filter((link) => link.enabled)
      .map(({ label, href }) => ({ label, href }));
  }
}
