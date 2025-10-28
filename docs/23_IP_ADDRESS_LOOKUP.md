# IP Address Lookup Tool

## Overview

The IP Address Lookup tool provides comprehensive information about any IP address, including geolocation data, ISP information, timezone, and network details. It supports both IPv4 and IPv6 addresses.

## Features

### 1. Automatic IP Detection
- Automatically detects and displays your current public IP address on page load
- Quick "My IP" button to refresh your current IP information

### 2. IP Lookup
- Enter any IPv4 or IPv6 address to get detailed information
- Real-time validation of IP address format
- Support for Enter key to trigger lookup

### 3. Geolocation Information
- **Country**: Full country name with flag emoji
- **Region/State**: Administrative region
- **City**: City name
- **Postal Code**: Zip/postal code
- **Coordinates**: Latitude and longitude with 4 decimal precision
- **Timezone**: IANA timezone identifier

### 4. Network Information
- **ISP/Organization**: Internet Service Provider name
- **AS Number**: Autonomous System number
- **IP Version**: IPv4 or IPv6

### 5. Security Indicators
- **Mobile**: Whether the IP is from a mobile network
- **Proxy/VPN**: Detection of proxy or VPN usage
- **Hosting**: Whether the IP belongs to a hosting provider

### 6. Map Integration
- Direct link to view the IP location on Google Maps
- Opens in a new tab for easy reference

## API Information

This tool uses the **ipapi.co** free API service:
- **Endpoint**: `https://ipapi.co/{ip}/json/`
- **Rate Limit**: 1,000 requests per day (free tier)
- **No API Key Required**
- **Response Time**: Typically < 200ms

### API Response Format

```json
{
  "ip": "8.8.8.8",
  "version": "IPv4",
  "city": "Mountain View",
  "region": "California",
  "country_name": "United States",
  "country_code": "US",
  "postal": "94035",
  "latitude": 37.386,
  "longitude": -122.0838,
  "timezone": "America/Los_Angeles",
  "org": "Google LLC",
  "asn": "AS15169"
}
```

## Usage Examples

### Example 1: Check Your Own IP
1. Visit the IP Address Lookup page
2. Your IP is automatically loaded on page load
3. View all geolocation and network information

### Example 2: Lookup a Specific IP
1. Enter an IP address (e.g., `8.8.8.8`)
2. Click "Lookup" or press Enter
3. View detailed information about the IP

### Example 3: View Location on Map
1. After looking up an IP address
2. Click the "View on Map" button
3. Opens Google Maps with the IP's coordinates

## Technical Implementation

### Component Structure
```
app/tools/ip-lookup/
├── page.tsx           # Main IP lookup component
├── layout.tsx         # Page layout and metadata
└── __tests__/
    └── page.test.tsx  # Component tests
```

### Key Technologies
- **React**: UI framework
- **Framer Motion**: Animations
- **ipapi.co API**: Geolocation data
- **Web Crypto API**: N/A (no encryption needed)

### State Management
- `ipAddress`: Current IP address being queried
- `ipInfo`: Retrieved IP information object
- `loading`: Loading state during API calls
- `autoLoaded`: Prevents duplicate auto-load on mount

### API Integration

```typescript
const response = await fetch(`https://ipapi.co/${targetIP}/json/`)
const data = await response.json()
```

### IP Validation

The tool validates both IPv4 and IPv6 formats:

```typescript
const ipv4Pattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
const ipv6Pattern = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::1|::)$/
```

## SEO Optimization

### Meta Tags
- **Title**: "IP Address Lookup - Geolocation & ISP Information | SuperTool"
- **Description**: Optimized for IP lookup, geolocation, and ISP information searches
- **Keywords**: ip lookup, geolocation, what is my ip, isp lookup, ipv4, ipv6

### OpenGraph
- Configured for social media sharing
- Clear description of tool functionality

## User Experience

### Copy to Clipboard
- One-click copy for IP address
- Toast notifications for user feedback
- Copy button available for main IP display

### Responsive Design
- Mobile-first approach
- Grid layouts adapt to screen size
- Touch-friendly buttons and inputs

### Loading States
- Disabled buttons during API calls
- Loading text feedback
- Smooth transitions with Framer Motion

## Privacy & Security

### Client-Side Processing
- No data stored on servers
- All API calls made directly from browser
- No tracking or logging of IP lookups

### HTTPS Only
- All API calls use HTTPS
- Secure data transmission

## Alternative APIs (for reference)

If you need more features or higher rate limits, consider:

1. **ip-api.com** (free, 45 req/min)
   ```
   http://ip-api.com/json/{ip}
   ```

2. **ipwhois.app** (free, 10k req/month)
   ```
   http://ipwhois.app/json/{ip}
   ```

3. **ipinfo.io** (paid, requires API key)
   ```
   https://ipinfo.io/{ip}/json?token={token}
   ```

## Future Enhancements

Potential improvements for future versions:
1. **Historical Lookups**: Save and display lookup history
2. **Batch Lookup**: Check multiple IPs at once
3. **Export**: Download IP information as JSON/CSV
4. **Comparison**: Compare two IP addresses side-by-side
5. **Reverse DNS**: Add hostname lookup
6. **WHOIS Data**: Include WHOIS information
7. **Threat Intelligence**: Integrate with threat detection APIs
8. **Network Speed**: Add latency/ping information

## Troubleshooting

### Rate Limit Exceeded
If you see "429 Too Many Requests":
- Free tier allows 1,000 requests per day
- Wait 24 hours or implement API key for higher limits

### Invalid IP Address
If lookup fails:
- Verify IP format (IPv4: xxx.xxx.xxx.xxx, IPv6: xxxx:xxxx:...)
- Check for typos or extra spaces
- Ensure IP is public (not private/local)

### No Location Data
Some IPs may return limited information:
- Private/local IPs (192.168.x.x, 10.x.x.x)
- Recently allocated IPs
- VPN/Proxy IPs with obfuscated location

## Testing

Run tests with:
```bash
npm test app/tools/ip-lookup
```

### Test Coverage
- Component rendering
- Button interactions
- API integration (mocked)
- IP validation
- Copy functionality

## Maintenance

### Regular Updates
- Monitor API changes from ipapi.co
- Update IP validation patterns as needed
- Test with new browser versions

### Performance Monitoring
- Track API response times
- Monitor error rates
- Optimize for Core Web Vitals
