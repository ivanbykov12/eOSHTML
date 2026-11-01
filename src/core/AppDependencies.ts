// App Dependencies System
// Defines relationships between apps and UI elements

export interface AppDependency {
  appId: string;
  uiElements: {
    component: string;
    elementId: string;
  }[];
}

export const APP_DEPENDENCIES: AppDependency[] = [
  {
    appId: 'epple_id',
    uiElements: [
      { component: 'settings', elementId: 'epple-id-section' },
      { component: 'settings', elementId: 'profile-card' },
    ],
  },
  {
    appId: 'appstore_desktop',
    uiElements: [
      { component: 'menubar', elementId: 'appstore-menu-item' },
    ],
  },
  {
    appId: 'about_eos',
    uiElements: [
      { component: 'menubar', elementId: 'about-menu-item' },
    ],
  },
  {
    appId: 'settings_desktop',
    uiElements: [
      { component: 'controlcenter', elementId: 'wifi-toggle' },
      { component: 'controlcenter', elementId: 'bluetooth-toggle' },
      { component: 'controlcenter', elementId: 'brightness-slider' },
      { component: 'controlcenter', elementId: 'volume-slider' },
      { component: 'controlcenter', elementId: 'focus-toggle' },
      { component: 'controlcenter', elementId: 'airplane-toggle' },
      { component: 'menubar', elementId: 'settings-menu-item' },
    ],
  },
  {
    appId: 'calendar_desktop',
    uiElements: [
      { component: 'controlcenter', elementId: 'calendar-widget' },
    ],
  },
  {
    appId: 'calculator_desktop',
    uiElements: [
      { component: 'controlcenter', elementId: 'calculator-widget' },
    ],
  },
  {
    appId: 'clock_desktop',
    uiElements: [
      { component: 'controlcenter', elementId: 'clock-widget' },
    ],
  },
  {
    appId: 'weather_desktop',
    uiElements: [
      { component: 'controlcenter', elementId: 'weather-widget' },
    ],
  },
  {
    appId: 'notes_desktop',
    uiElements: [
      { component: 'controlcenter', elementId: 'notes-widget' },
    ],
  },
  {
    appId: 'photos_desktop',
    uiElements: [
      { component: 'controlcenter', elementId: 'photos-widget' },
    ],
  },
];

/**
 * Check if a UI element should be visible based on installed apps
 */
export function isUIElementVisible(
  component: string,
  elementId: string,
  installedApps: { id: string }[]
): boolean {
  const installedAppIds = installedApps.map(app => app.id);
  
  // Find all dependencies for this UI element
  const dependencies = APP_DEPENDENCIES.filter(
    dep => dep.uiElements.some(el => el.component === component && el.elementId === elementId)
  );
  
  // If no dependencies found, element is always visible
  if (dependencies.length === 0) {
    return true;
  }
  
  // Check if at least one required app is installed
  return dependencies.some(dep => installedAppIds.includes(dep.appId));
}

/**
 * Get all UI elements that depend on a specific app
 */
export function getDependentUIElements(appId: string): { component: string; elementId: string }[] {
  const dependency = APP_DEPENDENCIES.find(dep => dep.appId === appId);
  return dependency ? dependency.uiElements : [];
}
