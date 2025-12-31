// Device frame dimensions and specifications
export interface DeviceFrame {
  id: string
  name: string
  category: 'phone' | 'tablet' | 'laptop' | 'desktop'
  screenWidth: number
  screenHeight: number
  frameWidth: number
  frameHeight: number
  screenX: number
  screenY: number
  borderRadius: number
  shadowColor: string
  frameColor: string
  notchHeight?: number
  cameraRadius?: number
  popular?: boolean
}

export const DEVICE_FRAMES: DeviceFrame[] = [
  // Phones
  {
    id: 'iphone-15-pro',
    name: 'iPhone 15 Pro',
    category: 'phone',
    screenWidth: 393,
    screenHeight: 852,
    frameWidth: 433,
    frameHeight: 902,
    screenX: 20,
    screenY: 25,
    borderRadius: 55,
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    frameColor: '#1a1a1a',
    notchHeight: 30,
    cameraRadius: 12,
    popular: true,
  },
  {
    id: 'iphone-14',
    name: 'iPhone 14',
    category: 'phone',
    screenWidth: 390,
    screenHeight: 844,
    frameWidth: 430,
    frameHeight: 894,
    screenX: 20,
    screenY: 25,
    borderRadius: 50,
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    frameColor: '#000000',
    notchHeight: 30,
    popular: true,
  },
  {
    id: 'samsung-s24',
    name: 'Samsung Galaxy S24',
    category: 'phone',
    screenWidth: 412,
    screenHeight: 915,
    frameWidth: 450,
    frameHeight: 965,
    screenX: 19,
    screenY: 25,
    borderRadius: 40,
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    frameColor: '#2d2d2d',
    cameraRadius: 8,
    popular: true,
  },
  {
    id: 'pixel-8',
    name: 'Google Pixel 8',
    category: 'phone',
    screenWidth: 412,
    screenHeight: 915,
    frameWidth: 448,
    frameHeight: 961,
    screenX: 18,
    screenY: 23,
    borderRadius: 45,
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    frameColor: '#4a4a4a',
    cameraRadius: 10,
  },

  // Tablets
  {
    id: 'ipad-pro-12',
    name: 'iPad Pro 12.9"',
    category: 'tablet',
    screenWidth: 1024,
    screenHeight: 1366,
    frameWidth: 1084,
    frameHeight: 1426,
    screenX: 30,
    screenY: 30,
    borderRadius: 30,
    shadowColor: 'rgba(0, 0, 0, 0.25)',
    frameColor: '#e0e0e0',
    popular: true,
  },
  {
    id: 'ipad-air',
    name: 'iPad Air',
    category: 'tablet',
    screenWidth: 820,
    screenHeight: 1180,
    frameWidth: 870,
    frameHeight: 1230,
    screenX: 25,
    screenY: 25,
    borderRadius: 25,
    shadowColor: 'rgba(0, 0, 0, 0.25)',
    frameColor: '#d4d4d4',
    popular: true,
  },
  {
    id: 'samsung-tab-s9',
    name: 'Samsung Galaxy Tab S9',
    category: 'tablet',
    screenWidth: 800,
    screenHeight: 1280,
    frameWidth: 850,
    frameHeight: 1330,
    screenX: 25,
    screenY: 25,
    borderRadius: 20,
    shadowColor: 'rgba(0, 0, 0, 0.25)',
    frameColor: '#3a3a3a',
  },

  // Laptops
  {
    id: 'macbook-pro-16',
    name: 'MacBook Pro 16"',
    category: 'laptop',
    screenWidth: 1728,
    screenHeight: 1117,
    frameWidth: 1828,
    frameHeight: 1217,
    screenX: 50,
    screenY: 50,
    borderRadius: 15,
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    frameColor: '#2d2d2d',
    notchHeight: 35,
    popular: true,
  },
  {
    id: 'macbook-air',
    name: 'MacBook Air',
    category: 'laptop',
    screenWidth: 1440,
    screenHeight: 900,
    frameWidth: 1520,
    frameHeight: 980,
    screenX: 40,
    screenY: 40,
    borderRadius: 12,
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    frameColor: '#e8e8e8',
    popular: true,
  },
  {
    id: 'surface-laptop',
    name: 'Surface Laptop 5',
    category: 'laptop',
    screenWidth: 1536,
    screenHeight: 1024,
    frameWidth: 1616,
    frameHeight: 1104,
    screenX: 40,
    screenY: 40,
    borderRadius: 8,
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    frameColor: '#6e6e6e',
  },

  // Desktop
  {
    id: 'imac-24',
    name: 'iMac 24"',
    category: 'desktop',
    screenWidth: 1920,
    screenHeight: 1080,
    frameWidth: 2020,
    frameHeight: 1180,
    screenX: 50,
    screenY: 50,
    borderRadius: 20,
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    frameColor: '#5e5ce6',
    popular: true,
  },
  {
    id: 'studio-display',
    name: 'Studio Display',
    category: 'desktop',
    screenWidth: 2560,
    screenHeight: 1440,
    frameWidth: 2660,
    frameHeight: 1540,
    screenX: 50,
    screenY: 50,
    borderRadius: 15,
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    frameColor: '#e0e0e0',
  },
]

export const getDevicesByCategory = (category: DeviceFrame['category']) => {
  return DEVICE_FRAMES.filter((device) => device.category === category)
}

export const getPopularDevices = () => {
  return DEVICE_FRAMES.filter((device) => device.popular)
}

export const getDeviceById = (id: string) => {
  return DEVICE_FRAMES.find((device) => device.id === id)
}
