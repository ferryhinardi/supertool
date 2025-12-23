// QR Code Type Configurations and Utilities

export interface EmailConfig {
  to: string
  subject: string
  body: string
}

export interface SMSConfig {
  phone: string
  message: string
}

export interface PhoneConfig {
  phone: string
}

export interface WhatsAppConfig {
  phone: string
  message: string
}

export interface GeoConfig {
  latitude: string
  longitude: string
  label?: string
}

export interface EventConfig {
  title: string
  location: string
  startDate: string
  startTime: string
  endDate: string
  endTime: string
  description: string
}

export interface AppStoreConfig {
  platform: 'ios' | 'android'
  appId: string
}

export interface SocialConfig {
  platform: 'instagram' | 'twitter' | 'linkedin' | 'facebook' | 'tiktok' | 'youtube'
  handle: string
}

// Generate QR code value for Email type (mailto protocol)
export function generateEmailQR(config: EmailConfig): string {
  const params = new URLSearchParams()
  if (config.subject) params.append('subject', config.subject)
  if (config.body) params.append('body', config.body)

  const queryString = params.toString()
  return `mailto:${config.to}${queryString ? `?${queryString}` : ''}`
}

// Generate QR code value for SMS type
export function generateSMSQR(config: SMSConfig): string {
  // Use smsto: protocol for SMS (works on most platforms)
  return `smsto:${config.phone}:${config.message}`
}

// Generate QR code value for Phone type (tel protocol)
export function generatePhoneQR(config: PhoneConfig): string {
  return `tel:${config.phone}`
}

// Generate QR code value for WhatsApp
export function generateWhatsAppQR(config: WhatsAppConfig): string {
  // Remove any non-digit characters from phone number
  const cleanPhone = config.phone.replace(/\D/g, '')
  const message = encodeURIComponent(config.message)
  return `https://wa.me/${cleanPhone}${message ? `?text=${message}` : ''}`
}

// Generate QR code value for Geo Location (geo protocol)
export function generateGeoQR(config: GeoConfig): string {
  const lat = config.latitude
  const lng = config.longitude
  const label = config.label ? `(${encodeURIComponent(config.label)})` : ''
  return `geo:${lat},${lng}${label}`
}

// Generate QR code value for Calendar Event (iCalendar format)
export function generateEventQR(config: EventConfig): string {
  // Convert dates to iCal format (YYYYMMDDTHHMMSS)
  const formatDateTime = (date: string, time: string) => {
    const dateObj = new Date(`${date}T${time}`)
    return `${dateObj.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`
  }

  const startDateTime = formatDateTime(config.startDate, config.startTime)
  const endDateTime = formatDateTime(config.endDate, config.endTime)

  // iCalendar format for QR codes
  return `BEGIN:VEVENT
SUMMARY:${config.title}
LOCATION:${config.location}
DTSTART:${startDateTime}
DTEND:${endDateTime}
DESCRIPTION:${config.description}
END:VEVENT`
}

// Generate QR code value for App Store links
export function generateAppStoreQR(config: AppStoreConfig): string {
  if (config.platform === 'ios') {
    return `https://apps.apple.com/app/id${config.appId}`
  }
  // Android
  return `https://play.google.com/store/apps/details?id=${config.appId}`
}

// Generate QR code value for Social Media profiles
export function generateSocialQR(config: SocialConfig): string {
  const handle = config.handle.replace('@', '')

  switch (config.platform) {
    case 'instagram':
      return `https://instagram.com/${handle}`
    case 'twitter':
      return `https://twitter.com/${handle}`
    case 'linkedin':
      return `https://linkedin.com/in/${handle}`
    case 'facebook':
      return `https://facebook.com/${handle}`
    case 'tiktok':
      return `https://tiktok.com/@${handle}`
    case 'youtube':
      return `https://youtube.com/@${handle}`
    default:
      return ''
  }
}
