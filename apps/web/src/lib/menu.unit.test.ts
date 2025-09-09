import { describe, expect, it } from "vitest";

import { useMenu } from "./menu";

describe("Menu Utils", () => {
  it("should return menu items", () => {
    const menuItems = useMenu();

    expect(Array.isArray(menuItems)).toBe(true);
    expect(menuItems.length).toBeGreaterThan(0);
  });

  it("should return valid menu item structure", () => {
    const menuItems = useMenu();

    menuItems.forEach((item) => {
      expect(item).toHaveProperty("label");
      expect(item).toHaveProperty("href");
      expect(typeof item.label).toBe("string");
      expect(typeof item.href).toBe("string");
    });
  });

  it("should include settings menu with submenu", () => {
    const menuItems = useMenu();
    const settingsMenu = menuItems.find((item) => item.href === "settings");

    expect(settingsMenu).toBeDefined();
    expect(settingsMenu?.submenu).toBeDefined();
    expect(Array.isArray(settingsMenu?.submenu)).toBe(true);
    expect(settingsMenu?.submenu?.length).toBeGreaterThan(0);
  });
});
