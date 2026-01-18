// "use client";

// import Cookies from "js-cookie";
// import {
//   ALL_NAVIGATION_LINKS,
//   NavigationLink,
//   RepositorySettings,
// } from "./repository.types";

// // used js-cookie in frontend, as cookie-parser is for backend only

// const COOKIE_NAME = "dashboard_footer_links";

// export class NavigationCookies {
//   // Save to cookie
//   static save(links: NavigationLink[]): void {
//     const settings: RepositorySettings = { navigationLinks: links };
//     Cookies.set(COOKIE_NAME, JSON.stringify(settings), {
//       path: "/",
//       sameSite: "strict",
//     });
//   }

//   // Get from cookie
//   static get(): NavigationLink[] {
//     try {
//       const cookieData = Cookies.get(COOKIE_NAME);
//       if (!cookieData) return [];

//       const parsedData = JSON.parse(cookieData) as RepositorySettings;
//       return parsedData.navigationLinks || [];
//     } catch {
//       return [];
//     }
//   }

//   // Get only enabled/selected links for footer
//   static getEnabledLinks(): Array<{ label: string; href: string }> {
//     const savedLinks = this.get();

//     return savedLinks
//       .filter((link) => link.enabled)
//       .map(({ label, href }) => ({ label, href }));
//   }

//   // Initialize with all links disabled
//   static initialize(): NavigationLink[] {
//     const saved = this.get();

//     if (saved.length > 0) {
//       return saved;
//     }

//     return ALL_NAVIGATION_LINKS.map((link) => ({ ...link, enabled: false }));
//   }
// }

"use client";

import Cookies from "js-cookie";
import { ALL_NAVIGATION_LINKS, NavigationLink } from "./repository.types";

const COOKIE_NAME = "dashboard_footer_links";

export class NavigationCookies {
  // Save ONLY enabled/disabled states
  static saveEnabledStates(links: NavigationLink[]): void {
    // Create a simple object: { [id]: enabled }
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

      // Merge: For each link in ALL_NAVIGATION_LINKS, check if enabled in cookie
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
