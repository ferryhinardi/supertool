// Citation styles supported
export const CITATION_STYLES = {
  apa: {
    id: 'apa',
    name: 'APA 7th Edition',
    description: 'American Psychological Association style, commonly used in social sciences',
  },
  mla: {
    id: 'mla',
    name: 'MLA 9th Edition',
    description: 'Modern Language Association style, commonly used in humanities',
  },
  chicago: {
    id: 'chicago',
    name: 'Chicago 17th Edition',
    description: 'Chicago Manual of Style, used in history and some humanities',
  },
  harvard: {
    id: 'harvard',
    name: 'Harvard',
    description: 'Harvard referencing style, popular in UK and Australia',
  },
  ieee: {
    id: 'ieee',
    name: 'IEEE',
    description: 'Institute of Electrical and Electronics Engineers, used in engineering and CS',
  },
  vancouver: {
    id: 'vancouver',
    name: 'Vancouver',
    description: 'Vancouver style, commonly used in medical and scientific papers',
  },
} as const

export type CitationStyleId = keyof typeof CITATION_STYLES

// Source types supported
export const SOURCE_TYPES = {
  book: {
    id: 'book',
    name: 'Book',
    icon: 'Book',
    fields: ['authors', 'title', 'publisher', 'year', 'edition', 'city', 'doi'],
  },
  journal: {
    id: 'journal',
    name: 'Journal Article',
    icon: 'FileText',
    fields: ['authors', 'title', 'journalName', 'year', 'volume', 'issue', 'pages', 'doi', 'url'],
  },
  website: {
    id: 'website',
    name: 'Website',
    icon: 'Globe',
    fields: ['authors', 'title', 'websiteName', 'url', 'accessDate', 'publishDate'],
  },
  newspaper: {
    id: 'newspaper',
    name: 'Newspaper Article',
    icon: 'Newspaper',
    fields: ['authors', 'title', 'newspaperName', 'publishDate', 'pages', 'url'],
  },
  video: {
    id: 'video',
    name: 'Video/YouTube',
    icon: 'Video',
    fields: ['authors', 'title', 'platform', 'url', 'publishDate', 'accessDate'],
  },
  conference: {
    id: 'conference',
    name: 'Conference Paper',
    icon: 'Users',
    fields: ['authors', 'title', 'conferenceName', 'year', 'city', 'pages', 'doi', 'publisher'],
  },
  thesis: {
    id: 'thesis',
    name: 'Thesis/Dissertation',
    icon: 'GraduationCap',
    fields: ['authors', 'title', 'thesisType', 'university', 'year', 'url'],
  },
  report: {
    id: 'report',
    name: 'Report',
    icon: 'FileBarChart',
    fields: ['authors', 'title', 'organization', 'year', 'reportNumber', 'url'],
  },
  chapter: {
    id: 'chapter',
    name: 'Book Chapter',
    icon: 'BookOpen',
    fields: [
      'authors',
      'chapterTitle',
      'editors',
      'bookTitle',
      'publisher',
      'year',
      'pages',
      'city',
      'doi',
    ],
  },
} as const

export type SourceTypeId = keyof typeof SOURCE_TYPES

// Author interface
export interface Author {
  firstName: string
  lastName: string
  middleName?: string
}

// Source data interface
export interface SourceData {
  sourceType: SourceTypeId
  // Common fields
  authors: Author[]
  title: string
  year?: string
  url?: string
  doi?: string
  accessDate?: string
  publishDate?: string
  pages?: string

  // Book specific
  publisher?: string
  city?: string
  edition?: string

  // Journal specific
  journalName?: string
  volume?: string
  issue?: string

  // Website specific
  websiteName?: string

  // Newspaper specific
  newspaperName?: string

  // Video specific
  platform?: string

  // Conference specific
  conferenceName?: string

  // Thesis specific
  thesisType?: 'doctoral' | 'masters' | 'bachelors'
  university?: string

  // Report specific
  organization?: string
  reportNumber?: string

  // Chapter specific
  chapterTitle?: string
  editors?: Author[]
  bookTitle?: string
}

// Generated citation result
export interface CitationResult {
  fullCitation: string
  inTextCitation: string
  style: CitationStyleId
  sourceType: SourceTypeId
}

// Helper: Format author name based on style
function formatAuthorName(author: Author, style: CitationStyleId, position: number): string {
  const { firstName, lastName, middleName } = author
  const firstInitial = firstName ? `${firstName.charAt(0).toUpperCase()}.` : ''
  const middleInitial = middleName ? `${middleName.charAt(0).toUpperCase()}.` : ''

  switch (style) {
    case 'apa':
      // Last, F. M.
      return `${lastName}, ${firstInitial}${middleInitial ? ` ${middleInitial}` : ''}`

    case 'mla':
      // First author: Last, First Middle. Others: First Middle Last.
      if (position === 0) {
        return `${lastName}, ${firstName}${middleName ? ` ${middleName}` : ''}`
      }
      return `${firstName}${middleName ? ` ${middleName}` : ''} ${lastName}`

    case 'chicago':
      // First author: Last, First Middle. Others: First Middle Last.
      if (position === 0) {
        return `${lastName}, ${firstName}${middleName ? ` ${middleName}` : ''}`
      }
      return `${firstName}${middleName ? ` ${middleName}` : ''} ${lastName}`

    case 'harvard':
      // Last, F.M.
      return `${lastName}, ${firstInitial}${middleInitial}`

    case 'ieee':
      // F. M. Last
      return `${firstInitial}${middleInitial ? ` ${middleInitial}` : ''} ${lastName}`

    case 'vancouver': {
      // Last FM (no periods)
      const firstInit = firstName ? firstName.charAt(0).toUpperCase() : ''
      const middleInit = middleName ? middleName.charAt(0).toUpperCase() : ''
      return `${lastName} ${firstInit}${middleInit}`
    }

    default:
      return `${lastName}, ${firstName}`
  }
}

// Helper: Format multiple authors
function formatAuthors(authors: Author[], style: CitationStyleId, maxAuthors: number = 20): string {
  if (!authors || authors.length === 0) {
    return ''
  }

  const formattedAuthors = authors
    .slice(0, maxAuthors)
    .map((author, index) => formatAuthorName(author, style, index))

  switch (style) {
    case 'apa': {
      if (authors.length === 1) {
        return formattedAuthors[0]
      }
      if (authors.length === 2) {
        return `${formattedAuthors[0]}, & ${formattedAuthors[1]}`
      }
      if (authors.length <= 20) {
        const lastAuthor = formattedAuthors.pop()
        return `${formattedAuthors.join(', ')}, & ${lastAuthor}`
      }
      // More than 20 authors: first 19, ellipsis, last author
      const first19 = formattedAuthors.slice(0, 19).join(', ')
      const last = formatAuthorName(authors[authors.length - 1], style, authors.length - 1)
      return `${first19}, ... ${last}`
    }

    case 'mla':
      if (authors.length === 1) {
        return formattedAuthors[0]
      }
      if (authors.length === 2) {
        return `${formattedAuthors[0]}, and ${formattedAuthors[1]}`
      }
      if (authors.length >= 3) {
        return `${formattedAuthors[0]}, et al.`
      }
      return formattedAuthors[0]

    case 'chicago':
      if (authors.length === 1) {
        return formattedAuthors[0]
      }
      if (authors.length === 2) {
        return `${formattedAuthors[0]} and ${formattedAuthors[1]}`
      }
      if (authors.length === 3) {
        const lastAuthor = formattedAuthors.pop()
        return `${formattedAuthors.join(', ')}, and ${lastAuthor}`
      }
      return `${formattedAuthors[0]} et al.`

    case 'harvard':
      if (authors.length === 1) {
        return formattedAuthors[0]
      }
      if (authors.length === 2) {
        return `${formattedAuthors[0]} and ${formattedAuthors[1]}`
      }
      if (authors.length <= 3) {
        const lastAuthor = formattedAuthors.pop()
        return `${formattedAuthors.join(', ')} and ${lastAuthor}`
      }
      return `${formattedAuthors[0]} et al.`

    case 'ieee':
      if (authors.length === 1) {
        return formattedAuthors[0]
      }
      if (authors.length === 2) {
        return `${formattedAuthors[0]} and ${formattedAuthors[1]}`
      }
      if (authors.length <= 6) {
        const lastAuthor = formattedAuthors.pop()
        return `${formattedAuthors.join(', ')}, and ${lastAuthor}`
      }
      return `${formattedAuthors.slice(0, 3).join(', ')}, et al.`

    case 'vancouver':
      if (authors.length <= 6) {
        return formattedAuthors.join(', ')
      }
      return `${formattedAuthors.slice(0, 6).join(', ')}, et al.`

    default:
      return formattedAuthors.join(', ')
  }
}

// Helper: Format in-text citation authors
function formatInTextAuthors(authors: Author[], style: CitationStyleId): string {
  if (!authors || authors.length === 0) {
    return ''
  }

  const lastNames = authors.map((a) => a.lastName)

  switch (style) {
    case 'apa':
    case 'harvard':
      if (authors.length === 1) {
        return lastNames[0]
      }
      if (authors.length === 2) {
        return `${lastNames[0]} & ${lastNames[1]}`
      }
      return `${lastNames[0]} et al.`

    case 'mla':
      if (authors.length === 1) {
        return lastNames[0]
      }
      if (authors.length === 2) {
        return `${lastNames[0]} and ${lastNames[1]}`
      }
      return `${lastNames[0]} et al.`

    case 'chicago':
      if (authors.length === 1) {
        return lastNames[0]
      }
      if (authors.length === 2) {
        return `${lastNames[0]} and ${lastNames[1]}`
      }
      if (authors.length === 3) {
        return `${lastNames[0]}, ${lastNames[1]}, and ${lastNames[2]}`
      }
      return `${lastNames[0]} et al.`

    case 'ieee':
    case 'vancouver':
      // These use numbered citations
      return ''

    default:
      return lastNames[0]
  }
}

// Helper: Format date
function formatDate(dateStr: string | undefined, format: 'full' | 'year' | 'month-year'): string {
  if (!dateStr) return ''

  try {
    const date = new Date(dateStr)
    if (Number.isNaN(date.getTime())) {
      // If it's just a year, return as-is
      if (/^\d{4}$/.test(dateStr)) {
        return dateStr
      }
      return dateStr
    }

    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ]
    const shortMonths = [
      'Jan.',
      'Feb.',
      'Mar.',
      'Apr.',
      'May',
      'June',
      'July',
      'Aug.',
      'Sept.',
      'Oct.',
      'Nov.',
      'Dec.',
    ]

    const year = date.getFullYear()
    const month = date.getMonth()
    const day = date.getDate()

    switch (format) {
      case 'full':
        return `${months[month]} ${day}, ${year}`
      case 'month-year':
        return `${shortMonths[month]} ${year}`
      default:
        return year.toString()
    }
  } catch {
    return dateStr
  }
}

// Format URL with access date
function _formatUrl(url: string | undefined, accessDate: string | undefined): string {
  if (!url) return ''
  const formattedAccess = accessDate ? ` Retrieved ${formatDate(accessDate, 'full')}` : ''
  return `${url}${formattedAccess}`
}

// Generate APA citation
function generateAPACitation(data: SourceData): CitationResult {
  const { sourceType, authors, title, year } = data
  let fullCitation = ''
  let inTextCitation = ''

  const authorStr = formatAuthors(authors, 'apa')
  const inTextAuthor = formatInTextAuthors(authors, 'apa')
  const yearStr = year || 'n.d.'

  switch (sourceType) {
    case 'book': {
      const { publisher, edition } = data
      const editionStr = edition ? ` (${edition} ed.)` : ''
      fullCitation = `${authorStr} (${yearStr}). `
      fullCitation += `*${title}*${editionStr}. `
      if (publisher) {
        fullCitation += `${publisher}.`
      }
      if (data.doi) {
        fullCitation += ` https://doi.org/${data.doi}`
      }
      break
    }

    case 'journal': {
      const { journalName, volume, issue, pages, doi, url } = data
      fullCitation = `${authorStr} (${yearStr}). `
      fullCitation += `${title}. `
      if (journalName) {
        fullCitation += `*${journalName}*`
        if (volume) fullCitation += `, *${volume}*`
        if (issue) fullCitation += `(${issue})`
        if (pages) fullCitation += `, ${pages}`
        fullCitation += '. '
      }
      if (doi) {
        fullCitation += `https://doi.org/${doi}`
      } else if (url) {
        fullCitation += url
      }
      break
    }

    case 'website': {
      const { websiteName, url, accessDate, publishDate } = data
      const pubYear = publishDate ? formatDate(publishDate, 'year') : yearStr
      fullCitation = authorStr ? `${authorStr} (${pubYear}). ` : ''
      fullCitation += `${title}. `
      if (websiteName) fullCitation += `*${websiteName}*. `
      if (accessDate) {
        fullCitation += `Retrieved ${formatDate(accessDate, 'full')}, from `
      }
      if (url) fullCitation += url
      break
    }

    case 'newspaper': {
      const { newspaperName, publishDate, pages, url } = data
      const pubDate = publishDate ? formatDate(publishDate, 'full') : yearStr
      fullCitation = `${authorStr} (${pubDate}). `
      fullCitation += `${title}. `
      if (newspaperName) fullCitation += `*${newspaperName}*`
      if (pages) fullCitation += `, ${pages}`
      fullCitation += '. '
      if (url) fullCitation += url
      break
    }

    case 'video': {
      const { platform, url, publishDate } = data
      const pubDate = publishDate ? formatDate(publishDate, 'full') : yearStr
      fullCitation = authorStr ? `${authorStr}. ` : ''
      fullCitation += `(${pubDate}). `
      fullCitation += `*${title}* [Video]. `
      if (platform) fullCitation += `${platform}. `
      if (url) fullCitation += url
      break
    }

    case 'conference': {
      const { conferenceName, city, pages, doi, publisher } = data
      fullCitation = `${authorStr} (${yearStr}). `
      fullCitation += `${title}. `
      if (conferenceName) fullCitation += `In *${conferenceName}*`
      if (pages) fullCitation += ` (pp. ${pages})`
      fullCitation += '. '
      if (city) fullCitation += `${city}: `
      if (publisher) fullCitation += `${publisher}.`
      if (doi) fullCitation += ` https://doi.org/${doi}`
      break
    }

    case 'thesis': {
      const { thesisType, university, url } = data
      const typeStr =
        thesisType === 'doctoral'
          ? 'Doctoral dissertation'
          : thesisType === 'masters'
            ? "Master's thesis"
            : 'Thesis'
      fullCitation = `${authorStr} (${yearStr}). `
      fullCitation += `*${title}* [${typeStr}, ${university || 'University'}]. `
      if (url) fullCitation += url
      break
    }

    case 'report': {
      const { organization, reportNumber, url } = data
      fullCitation = authorStr ? `${authorStr} (${yearStr}). ` : ''
      fullCitation += `*${title}*`
      if (reportNumber) fullCitation += ` (Report No. ${reportNumber})`
      fullCitation += '. '
      if (organization) fullCitation += `${organization}. `
      if (url) fullCitation += url
      break
    }

    case 'chapter': {
      const { chapterTitle, editors, bookTitle, publisher, pages, doi } = data
      const editorsStr = editors ? formatAuthors(editors, 'apa') : ''
      fullCitation = `${authorStr} (${yearStr}). `
      fullCitation += `${chapterTitle || title}. `
      if (editorsStr)
        fullCitation += `In ${editorsStr} (Ed${editors && editors.length > 1 ? 's' : ''}.), `
      if (bookTitle) fullCitation += `*${bookTitle}*`
      if (pages) fullCitation += ` (pp. ${pages})`
      fullCitation += '. '
      if (publisher) fullCitation += `${publisher}.`
      if (doi) fullCitation += ` https://doi.org/${doi}`
      break
    }
  }

  inTextCitation = `(${inTextAuthor}, ${yearStr})`

  return {
    fullCitation: fullCitation.trim(),
    inTextCitation,
    style: 'apa',
    sourceType,
  }
}

// Generate MLA citation
function generateMLACitation(data: SourceData): CitationResult {
  const { sourceType, authors, title, year } = data
  let fullCitation = ''
  let inTextCitation = ''

  const authorStr = formatAuthors(authors, 'mla')
  const inTextAuthor = formatInTextAuthors(authors, 'mla')

  switch (sourceType) {
    case 'book': {
      const { publisher, edition } = data
      fullCitation = authorStr ? `${authorStr}. ` : ''
      fullCitation += `*${title}*. `
      if (edition) fullCitation += `${edition} ed., `
      if (publisher) fullCitation += `${publisher}, `
      if (year) fullCitation += `${year}.`
      break
    }

    case 'journal': {
      const { journalName, volume, issue, pages, doi, url } = data
      fullCitation = authorStr ? `${authorStr}. ` : ''
      fullCitation += `"${title}." `
      if (journalName) fullCitation += `*${journalName}*, `
      if (volume) fullCitation += `vol. ${volume}, `
      if (issue) fullCitation += `no. ${issue}, `
      if (year) fullCitation += `${year}, `
      if (pages) fullCitation += `pp. ${pages}. `
      if (doi) {
        fullCitation += `https://doi.org/${doi}`
      } else if (url) {
        fullCitation += url
      }
      break
    }

    case 'website': {
      const { websiteName, url, accessDate, publishDate } = data
      fullCitation = authorStr ? `${authorStr}. ` : ''
      fullCitation += `"${title}." `
      if (websiteName) fullCitation += `*${websiteName}*, `
      if (publishDate) fullCitation += `${formatDate(publishDate, 'full')}, `
      if (url) fullCitation += `${url}. `
      if (accessDate) fullCitation += `Accessed ${formatDate(accessDate, 'full')}.`
      break
    }

    case 'newspaper': {
      const { newspaperName, publishDate, pages, url } = data
      fullCitation = authorStr ? `${authorStr}. ` : ''
      fullCitation += `"${title}." `
      if (newspaperName) fullCitation += `*${newspaperName}*, `
      if (publishDate) fullCitation += `${formatDate(publishDate, 'full')}, `
      if (pages) fullCitation += `pp. ${pages}. `
      if (url) fullCitation += url
      break
    }

    case 'video': {
      const { platform, url, publishDate } = data
      fullCitation = `"${title}." `
      if (platform) fullCitation += `*${platform}*, `
      if (authorStr) fullCitation += `uploaded by ${authors[0].firstName} ${authors[0].lastName}, `
      if (publishDate) fullCitation += `${formatDate(publishDate, 'full')}, `
      if (url) fullCitation += url
      break
    }

    case 'conference': {
      const { conferenceName, pages } = data
      fullCitation = authorStr ? `${authorStr}. ` : ''
      fullCitation += `"${title}." `
      if (conferenceName) fullCitation += `*${conferenceName}*, `
      if (year) fullCitation += `${year}, `
      if (pages) fullCitation += `pp. ${pages}.`
      break
    }

    case 'thesis': {
      const { thesisType, university } = data
      const typeStr =
        thesisType === 'doctoral' ? 'Dissertation' : thesisType === 'masters' ? 'Thesis' : 'Thesis'
      fullCitation = authorStr ? `${authorStr}. ` : ''
      fullCitation += `*${title}*. `
      if (year) fullCitation += `${year}. `
      if (university) fullCitation += `${university}, `
      fullCitation += `${typeStr}.`
      break
    }

    case 'report': {
      const { organization, reportNumber, url } = data
      fullCitation = authorStr ? `${authorStr}. ` : ''
      fullCitation += `*${title}*. `
      if (reportNumber) fullCitation += `Report no. ${reportNumber}, `
      if (organization) fullCitation += `${organization}, `
      if (year) fullCitation += `${year}. `
      if (url) fullCitation += url
      break
    }

    case 'chapter': {
      const { chapterTitle, editors, bookTitle, publisher, pages } = data
      const editorsStr = editors ? formatAuthors(editors, 'mla') : ''
      fullCitation = authorStr ? `${authorStr}. ` : ''
      fullCitation += `"${chapterTitle || title}." `
      if (bookTitle) fullCitation += `*${bookTitle}*, `
      if (editorsStr) fullCitation += `edited by ${editorsStr}, `
      if (publisher) fullCitation += `${publisher}, `
      if (year) fullCitation += `${year}, `
      if (pages) fullCitation += `pp. ${pages}.`
      break
    }
  }

  inTextCitation = `(${inTextAuthor}${data.pages ? ` ${data.pages}` : ''})`

  return {
    fullCitation: fullCitation.trim(),
    inTextCitation,
    style: 'mla',
    sourceType,
  }
}

// Generate Chicago citation
function generateChicagoCitation(data: SourceData): CitationResult {
  const { sourceType, authors, title, year } = data
  let fullCitation = ''
  let inTextCitation = ''

  const authorStr = formatAuthors(authors, 'chicago')
  const inTextAuthor = formatInTextAuthors(authors, 'chicago')

  switch (sourceType) {
    case 'book': {
      const { publisher, edition, city } = data
      fullCitation = authorStr ? `${authorStr}. ` : ''
      fullCitation += `*${title}*. `
      if (edition) fullCitation += `${edition} ed. `
      if (city) fullCitation += `${city}: `
      if (publisher) fullCitation += `${publisher}, `
      if (year) fullCitation += `${year}.`
      break
    }

    case 'journal': {
      const { journalName, volume, issue, pages, doi, url } = data
      fullCitation = authorStr ? `${authorStr}. ` : ''
      fullCitation += `"${title}." `
      if (journalName) fullCitation += `*${journalName}* `
      if (volume) fullCitation += `${volume}`
      if (issue) fullCitation += `, no. ${issue}`
      if (year) fullCitation += ` (${year})`
      if (pages) fullCitation += `: ${pages}`
      fullCitation += '. '
      if (doi) {
        fullCitation += `https://doi.org/${doi}`
      } else if (url) {
        fullCitation += url
      }
      break
    }

    case 'website': {
      const { websiteName, url, publishDate } = data
      fullCitation = authorStr ? `${authorStr}. ` : ''
      fullCitation += `"${title}." `
      if (websiteName) fullCitation += `${websiteName}. `
      if (publishDate) fullCitation += `${formatDate(publishDate, 'full')}. `
      if (url) fullCitation += url
      break
    }

    case 'newspaper': {
      const { newspaperName, publishDate, pages, url } = data
      fullCitation = authorStr ? `${authorStr}. ` : ''
      fullCitation += `"${title}." `
      if (newspaperName) fullCitation += `*${newspaperName}*, `
      if (publishDate) fullCitation += `${formatDate(publishDate, 'full')}`
      if (pages) fullCitation += `, ${pages}`
      fullCitation += '. '
      if (url) fullCitation += url
      break
    }

    case 'video': {
      const { platform, url, publishDate } = data
      fullCitation = authorStr ? `${authorStr}. ` : ''
      fullCitation += `"${title}." `
      if (platform) fullCitation += `${platform}. `
      if (publishDate) fullCitation += `${formatDate(publishDate, 'full')}. `
      if (url) fullCitation += url
      break
    }

    case 'conference': {
      const { conferenceName, city, pages } = data
      fullCitation = authorStr ? `${authorStr}. ` : ''
      fullCitation += `"${title}." `
      if (conferenceName) fullCitation += `Paper presented at ${conferenceName}, `
      if (city) fullCitation += `${city}, `
      if (year) fullCitation += `${year}. `
      if (pages) fullCitation += `${pages}.`
      break
    }

    case 'thesis': {
      const { thesisType, university } = data
      const typeStr =
        thesisType === 'doctoral'
          ? 'PhD diss.'
          : thesisType === 'masters'
            ? "Master's thesis"
            : 'Thesis'
      fullCitation = authorStr ? `${authorStr}. ` : ''
      fullCitation += `"${title}." `
      fullCitation += `${typeStr}, `
      if (university) fullCitation += `${university}, `
      if (year) fullCitation += `${year}.`
      break
    }

    case 'report': {
      const { organization, reportNumber, url } = data
      fullCitation = authorStr ? `${authorStr}. ` : ''
      fullCitation += `*${title}*. `
      if (reportNumber) fullCitation += `Report No. ${reportNumber}. `
      if (organization) fullCitation += `${organization}, `
      if (year) fullCitation += `${year}. `
      if (url) fullCitation += url
      break
    }

    case 'chapter': {
      const { chapterTitle, editors, bookTitle, publisher, pages, city } = data
      const editorsStr = editors ? formatAuthors(editors, 'chicago') : ''
      fullCitation = authorStr ? `${authorStr}. ` : ''
      fullCitation += `"${chapterTitle || title}." `
      if (bookTitle) fullCitation += `In *${bookTitle}*, `
      if (editorsStr) fullCitation += `edited by ${editorsStr}, `
      if (pages) fullCitation += `${pages}. `
      if (city) fullCitation += `${city}: `
      if (publisher) fullCitation += `${publisher}, `
      if (year) fullCitation += `${year}.`
      break
    }
  }

  inTextCitation = `(${inTextAuthor} ${year || 'n.d.'}${data.pages ? `, ${data.pages}` : ''})`

  return {
    fullCitation: fullCitation.trim(),
    inTextCitation,
    style: 'chicago',
    sourceType,
  }
}

// Generate Harvard citation
function generateHarvardCitation(data: SourceData): CitationResult {
  const { sourceType, authors, title, year } = data
  let fullCitation = ''
  let inTextCitation = ''

  const authorStr = formatAuthors(authors, 'harvard')
  const inTextAuthor = formatInTextAuthors(authors, 'harvard')
  const yearStr = year || 'n.d.'

  switch (sourceType) {
    case 'book': {
      const { publisher, edition, city } = data
      fullCitation = authorStr ? `${authorStr} ` : ''
      fullCitation += `(${yearStr}) `
      fullCitation += `*${title}*. `
      if (edition) fullCitation += `${edition} edn. `
      if (city) fullCitation += `${city}: `
      if (publisher) fullCitation += `${publisher}.`
      break
    }

    case 'journal': {
      const { journalName, volume, issue, pages, doi, url } = data
      fullCitation = authorStr ? `${authorStr} ` : ''
      fullCitation += `(${yearStr}) `
      fullCitation += `'${title}', `
      if (journalName) fullCitation += `*${journalName}*, `
      if (volume) fullCitation += `${volume}`
      if (issue) fullCitation += `(${issue})`
      if (pages) fullCitation += `, pp. ${pages}`
      fullCitation += '. '
      if (doi) {
        fullCitation += `doi: ${doi}`
      } else if (url) {
        fullCitation += `Available at: ${url}`
      }
      break
    }

    case 'website': {
      const { websiteName, url, accessDate, publishDate } = data
      const pubYear = publishDate ? formatDate(publishDate, 'year') : yearStr
      fullCitation = authorStr ? `${authorStr} ` : ''
      fullCitation += `(${pubYear}) `
      fullCitation += `*${title}*. `
      if (websiteName) fullCitation += `${websiteName}. `
      if (url) fullCitation += `Available at: ${url} `
      if (accessDate) fullCitation += `(Accessed: ${formatDate(accessDate, 'full')}).`
      break
    }

    case 'newspaper': {
      const { newspaperName, publishDate, pages, url } = data
      const pubDate = publishDate ? formatDate(publishDate, 'full') : yearStr
      fullCitation = authorStr ? `${authorStr} ` : ''
      fullCitation += `(${pubDate}) `
      fullCitation += `'${title}', `
      if (newspaperName) fullCitation += `*${newspaperName}*`
      if (pages) fullCitation += `, p. ${pages}`
      fullCitation += '. '
      if (url) fullCitation += `Available at: ${url}`
      break
    }

    case 'video': {
      const { platform, url, publishDate } = data
      const pubYear = publishDate ? formatDate(publishDate, 'year') : yearStr
      fullCitation = `*${title}* `
      fullCitation += `(${pubYear}) `
      if (platform) fullCitation += `${platform}. `
      if (url) fullCitation += `Available at: ${url}`
      break
    }

    case 'conference': {
      const { conferenceName, city, pages, publisher } = data
      fullCitation = authorStr ? `${authorStr} ` : ''
      fullCitation += `(${yearStr}) `
      fullCitation += `'${title}', `
      if (conferenceName) fullCitation += `*${conferenceName}*, `
      if (city) fullCitation += `${city}, `
      if (pages) fullCitation += `pp. ${pages}. `
      if (publisher) fullCitation += `${publisher}.`
      break
    }

    case 'thesis': {
      const { thesisType, university, url } = data
      const typeStr =
        thesisType === 'doctoral'
          ? 'PhD thesis'
          : thesisType === 'masters'
            ? "Master's thesis"
            : 'Thesis'
      fullCitation = authorStr ? `${authorStr} ` : ''
      fullCitation += `(${yearStr}) `
      fullCitation += `*${title}*. `
      fullCitation += `${typeStr}. `
      if (university) fullCitation += `${university}. `
      if (url) fullCitation += `Available at: ${url}`
      break
    }

    case 'report': {
      const { organization, reportNumber, url } = data
      fullCitation = authorStr ? `${authorStr} ` : ''
      fullCitation += `(${yearStr}) `
      fullCitation += `*${title}*. `
      if (reportNumber) fullCitation += `Report No. ${reportNumber}. `
      if (organization) fullCitation += `${organization}. `
      if (url) fullCitation += `Available at: ${url}`
      break
    }

    case 'chapter': {
      const { chapterTitle, editors, bookTitle, publisher, pages, city } = data
      const editorsStr = editors ? formatAuthors(editors, 'harvard') : ''
      fullCitation = authorStr ? `${authorStr} ` : ''
      fullCitation += `(${yearStr}) `
      fullCitation += `'${chapterTitle || title}', `
      if (bookTitle) fullCitation += `in `
      if (editorsStr)
        fullCitation += `${editorsStr} (ed${editors && editors.length > 1 ? 's' : ''}.) `
      if (bookTitle) fullCitation += `*${bookTitle}*. `
      if (city) fullCitation += `${city}: `
      if (publisher) fullCitation += `${publisher}`
      if (pages) fullCitation += `, pp. ${pages}`
      fullCitation += '.'
      break
    }
  }

  inTextCitation = `(${inTextAuthor}, ${yearStr})`

  return {
    fullCitation: fullCitation.trim(),
    inTextCitation,
    style: 'harvard',
    sourceType,
  }
}

// Generate IEEE citation
function generateIEEECitation(data: SourceData, referenceNumber: number = 1): CitationResult {
  const { sourceType, authors, title, year } = data
  let fullCitation = ''
  const inTextCitation = `[${referenceNumber}]`

  const authorStr = formatAuthors(authors, 'ieee')

  switch (sourceType) {
    case 'book': {
      const { publisher, edition, city } = data
      fullCitation = authorStr ? `${authorStr}, ` : ''
      fullCitation += `*${title}*`
      if (edition) fullCitation += `, ${edition} ed.`
      if (city) fullCitation += ` ${city}:`
      if (publisher) fullCitation += ` ${publisher},`
      if (year) fullCitation += ` ${year}.`
      break
    }

    case 'journal': {
      const { journalName, volume, issue, pages, doi } = data
      fullCitation = authorStr ? `${authorStr}, ` : ''
      fullCitation += `"${title}," `
      if (journalName) fullCitation += `*${journalName}*, `
      if (volume) fullCitation += `vol. ${volume}, `
      if (issue) fullCitation += `no. ${issue}, `
      if (pages) fullCitation += `pp. ${pages}, `
      if (year) fullCitation += `${year}`
      fullCitation += '.'
      if (doi) fullCitation += ` doi: ${doi}.`
      break
    }

    case 'website': {
      const { websiteName, url, accessDate } = data
      fullCitation = authorStr ? `${authorStr}, ` : ''
      fullCitation += `"${title}," `
      if (websiteName) fullCitation += `*${websiteName}*. `
      if (url) fullCitation += `[Online]. Available: ${url}. `
      if (accessDate) fullCitation += `[Accessed: ${formatDate(accessDate, 'full')}].`
      break
    }

    case 'newspaper': {
      const { newspaperName, publishDate, pages } = data
      fullCitation = authorStr ? `${authorStr}, ` : ''
      fullCitation += `"${title}," `
      if (newspaperName) fullCitation += `*${newspaperName}*, `
      if (publishDate) fullCitation += `${formatDate(publishDate, 'month-year')}`
      if (pages) fullCitation += `, pp. ${pages}`
      fullCitation += '.'
      break
    }

    case 'video': {
      const { platform, url, publishDate } = data
      fullCitation = `"${title}," `
      if (platform) fullCitation += `${platform}. `
      if (publishDate) fullCitation += `(${formatDate(publishDate, 'month-year')}). `
      if (url) fullCitation += `[Online Video]. Available: ${url}.`
      break
    }

    case 'conference': {
      const { conferenceName, city, pages, doi } = data
      fullCitation = authorStr ? `${authorStr}, ` : ''
      fullCitation += `"${title}," `
      if (conferenceName) fullCitation += `in *${conferenceName}*, `
      if (city) fullCitation += `${city}, `
      if (year) fullCitation += `${year}, `
      if (pages) fullCitation += `pp. ${pages}`
      fullCitation += '.'
      if (doi) fullCitation += ` doi: ${doi}.`
      break
    }

    case 'thesis': {
      const { thesisType, university } = data
      const typeStr =
        thesisType === 'doctoral'
          ? 'Ph.D. dissertation'
          : thesisType === 'masters'
            ? 'M.S. thesis'
            : 'Thesis'
      fullCitation = authorStr ? `${authorStr}, ` : ''
      fullCitation += `"${title}," `
      fullCitation += `${typeStr}, `
      if (university) fullCitation += `${university}, `
      if (year) fullCitation += `${year}.`
      break
    }

    case 'report': {
      const { organization, reportNumber } = data
      fullCitation = authorStr ? `${authorStr}, ` : ''
      fullCitation += `"${title}," `
      if (organization) fullCitation += `${organization}, `
      if (reportNumber) fullCitation += `Rep. ${reportNumber}, `
      if (year) fullCitation += `${year}.`
      break
    }

    case 'chapter': {
      const { chapterTitle, editors, bookTitle, publisher, pages, city } = data
      const editorsStr = editors ? formatAuthors(editors, 'ieee') : ''
      fullCitation = authorStr ? `${authorStr}, ` : ''
      fullCitation += `"${chapterTitle || title}," `
      if (bookTitle) fullCitation += `in *${bookTitle}*, `
      if (editorsStr)
        fullCitation += `${editorsStr}, Ed${editors && editors.length > 1 ? 's' : ''}. `
      if (city) fullCitation += `${city}: `
      if (publisher) fullCitation += `${publisher}, `
      if (year) fullCitation += `${year}, `
      if (pages) fullCitation += `pp. ${pages}`
      fullCitation += '.'
      break
    }
  }

  return {
    fullCitation: `[${referenceNumber}] ${fullCitation.trim()}`,
    inTextCitation,
    style: 'ieee',
    sourceType,
  }
}

// Generate Vancouver citation
function generateVancouverCitation(data: SourceData, referenceNumber: number = 1): CitationResult {
  const { sourceType, authors, title, year } = data
  let fullCitation = ''
  const inTextCitation = `(${referenceNumber})`

  const authorStr = formatAuthors(authors, 'vancouver')

  switch (sourceType) {
    case 'book': {
      const { publisher, edition, city } = data
      fullCitation = authorStr ? `${authorStr}. ` : ''
      fullCitation += `${title}. `
      if (edition) fullCitation += `${edition} ed. `
      if (city) fullCitation += `${city}: `
      if (publisher) fullCitation += `${publisher}; `
      if (year) fullCitation += `${year}.`
      break
    }

    case 'journal': {
      const { journalName, volume, issue, pages, doi } = data
      fullCitation = authorStr ? `${authorStr}. ` : ''
      fullCitation += `${title}. `
      if (journalName) fullCitation += `${journalName}. `
      if (year) fullCitation += `${year};`
      if (volume) fullCitation += `${volume}`
      if (issue) fullCitation += `(${issue})`
      if (pages) fullCitation += `:${pages}`
      fullCitation += '.'
      if (doi) fullCitation += ` doi: ${doi}`
      break
    }

    case 'website': {
      const { websiteName, url, accessDate, publishDate } = data
      fullCitation = authorStr ? `${authorStr}. ` : ''
      fullCitation += `${title} [Internet]. `
      if (websiteName) fullCitation += `${websiteName}; `
      if (publishDate) fullCitation += `${formatDate(publishDate, 'year')} `
      if (accessDate) fullCitation += `[cited ${formatDate(accessDate, 'full')}]. `
      if (url) fullCitation += `Available from: ${url}`
      break
    }

    case 'newspaper': {
      const { newspaperName, publishDate, pages } = data
      fullCitation = authorStr ? `${authorStr}. ` : ''
      fullCitation += `${title}. `
      if (newspaperName) fullCitation += `${newspaperName}. `
      if (publishDate) fullCitation += `${formatDate(publishDate, 'full')}`
      if (pages) fullCitation += `;Sect. ${pages}`
      fullCitation += '.'
      break
    }

    case 'video': {
      const { platform, url, publishDate } = data
      fullCitation = `${title} [Video]. `
      if (platform) fullCitation += `${platform}; `
      if (publishDate) fullCitation += `${formatDate(publishDate, 'year')}. `
      if (url) fullCitation += `Available from: ${url}`
      break
    }

    case 'conference': {
      const { conferenceName, city, pages, publisher } = data
      fullCitation = authorStr ? `${authorStr}. ` : ''
      fullCitation += `${title}. `
      if (conferenceName) fullCitation += `In: ${conferenceName}; `
      if (year) fullCitation += `${year}; `
      if (city) fullCitation += `${city}. `
      if (publisher) fullCitation += `${publisher}; `
      if (pages) fullCitation += `p. ${pages}`
      fullCitation += '.'
      break
    }

    case 'thesis': {
      const { thesisType, university } = data
      const typeStr =
        thesisType === 'doctoral' ? 'dissertation' : thesisType === 'masters' ? 'thesis' : 'thesis'
      fullCitation = authorStr ? `${authorStr}. ` : ''
      fullCitation += `${title} [${typeStr}]. `
      if (university) fullCitation += `${university}; `
      if (year) fullCitation += `${year}.`
      break
    }

    case 'report': {
      const { organization, reportNumber } = data
      fullCitation = authorStr ? `${authorStr}. ` : ''
      fullCitation += `${title}. `
      if (organization) fullCitation += `${organization}; `
      if (year) fullCitation += `${year}. `
      if (reportNumber) fullCitation += `Report No.: ${reportNumber}.`
      break
    }

    case 'chapter': {
      const { chapterTitle, editors, bookTitle, publisher, pages, city } = data
      const editorsStr = editors ? formatAuthors(editors, 'vancouver') : ''
      fullCitation = authorStr ? `${authorStr}. ` : ''
      fullCitation += `${chapterTitle || title}. `
      if (bookTitle) fullCitation += `In: `
      if (editorsStr)
        fullCitation += `${editorsStr}, editor${editors && editors.length > 1 ? 's' : ''}. `
      if (bookTitle) fullCitation += `${bookTitle}. `
      if (city) fullCitation += `${city}: `
      if (publisher) fullCitation += `${publisher}; `
      if (year) fullCitation += `${year}. `
      if (pages) fullCitation += `p. ${pages}`
      fullCitation += '.'
      break
    }
  }

  return {
    fullCitation: `${referenceNumber}. ${fullCitation.trim()}`,
    inTextCitation,
    style: 'vancouver',
    sourceType,
  }
}

/**
 * Generate citation based on style and source data
 */
export function generateCitation(
  data: SourceData,
  style: CitationStyleId,
  referenceNumber: number = 1
): CitationResult {
  switch (style) {
    case 'apa':
      return generateAPACitation(data)
    case 'mla':
      return generateMLACitation(data)
    case 'chicago':
      return generateChicagoCitation(data)
    case 'harvard':
      return generateHarvardCitation(data)
    case 'ieee':
      return generateIEEECitation(data, referenceNumber)
    case 'vancouver':
      return generateVancouverCitation(data, referenceNumber)
    default:
      return generateAPACitation(data)
  }
}

/**
 * Parse author string into Author array
 */
export function parseAuthors(authorString: string): Author[] {
  if (!authorString.trim()) return []

  // Split by common separators
  const authorParts = authorString
    .split(/[,;&]|\band\b/i)
    .map((a) => a.trim())
    .filter((a) => a.length > 0)

  return authorParts.map((authorPart) => {
    const parts = authorPart.split(/\s+/).filter((p) => p.length > 0)

    if (parts.length === 0) {
      return { firstName: '', lastName: '' }
    }

    if (parts.length === 1) {
      return { firstName: '', lastName: parts[0] }
    }

    if (parts.length === 2) {
      return { firstName: parts[0], lastName: parts[1] }
    }

    // 3 or more parts: first, middle(s), last
    return {
      firstName: parts[0],
      middleName: parts.slice(1, -1).join(' '),
      lastName: parts[parts.length - 1],
    }
  })
}

/**
 * Create empty source data with defaults
 */
export function createEmptySourceData(sourceType: SourceTypeId = 'book'): SourceData {
  return {
    sourceType,
    authors: [],
    title: '',
    year: new Date().getFullYear().toString(),
    url: '',
    doi: '',
    accessDate: '',
    publishDate: '',
    pages: '',
    publisher: '',
    city: '',
    edition: '',
    journalName: '',
    volume: '',
    issue: '',
    websiteName: '',
    newspaperName: '',
    platform: '',
    conferenceName: '',
    thesisType: 'doctoral',
    university: '',
    organization: '',
    reportNumber: '',
    chapterTitle: '',
    editors: [],
    bookTitle: '',
  }
}

/**
 * Validate source data and return error messages
 */
export function validateSourceData(data: SourceData): string[] {
  const errors: string[] = []

  if (!data.title.trim()) {
    errors.push('Title is required')
  }

  // Source-specific validations
  switch (data.sourceType) {
    case 'website':
      if (!data.url?.trim()) {
        errors.push('URL is required for website sources')
      }
      break

    case 'journal':
      if (!data.journalName?.trim()) {
        errors.push('Journal name is required')
      }
      break

    case 'newspaper':
      if (!data.newspaperName?.trim()) {
        errors.push('Newspaper name is required')
      }
      break

    case 'video':
      if (!data.url?.trim()) {
        errors.push('Video URL is required')
      }
      break

    case 'thesis':
      if (!data.university?.trim()) {
        errors.push('University is required for thesis')
      }
      break
  }

  return errors
}

/**
 * Format citation with HTML styling (for display)
 */
export function formatCitationWithHtml(citation: string): string {
  // Convert asterisks to italics
  const formatted = citation.replace(/\*([^*]+)\*/g, '<em>$1</em>')

  return formatted
}

/**
 * Format citation as plain text (for copying)
 */
export function formatCitationAsPlainText(citation: string): string {
  // Remove asterisks (which represent italics in our format)
  return citation.replace(/\*/g, '')
}

/**
 * Get field label for display
 */
export function getFieldLabel(field: string): string {
  const labels: Record<string, string> = {
    authors: 'Author(s)',
    title: 'Title',
    year: 'Year',
    url: 'URL',
    doi: 'DOI',
    accessDate: 'Access Date',
    publishDate: 'Publish Date',
    pages: 'Page(s)',
    publisher: 'Publisher',
    city: 'City',
    edition: 'Edition',
    journalName: 'Journal Name',
    volume: 'Volume',
    issue: 'Issue',
    websiteName: 'Website Name',
    newspaperName: 'Newspaper Name',
    platform: 'Platform',
    conferenceName: 'Conference Name',
    thesisType: 'Thesis Type',
    university: 'University',
    organization: 'Organization',
    reportNumber: 'Report Number',
    chapterTitle: 'Chapter Title',
    editors: 'Editor(s)',
    bookTitle: 'Book Title',
  }

  return labels[field] || field.charAt(0).toUpperCase() + field.slice(1)
}

/**
 * Get placeholder text for fields
 */
export function getFieldPlaceholder(field: string): string {
  const placeholders: Record<string, string> = {
    authors: 'e.g., John Smith, Jane Doe',
    title: 'Enter the title',
    year: 'e.g., 2024',
    url: 'https://example.com',
    doi: 'e.g., 10.1000/xyz123',
    accessDate: 'When you accessed the source',
    publishDate: 'When it was published',
    pages: 'e.g., 15-25 or 42',
    publisher: 'e.g., Oxford University Press',
    city: 'e.g., New York',
    edition: 'e.g., 3rd',
    journalName: 'e.g., Nature',
    volume: 'e.g., 12',
    issue: 'e.g., 3',
    websiteName: 'e.g., Wikipedia',
    newspaperName: 'e.g., The New York Times',
    platform: 'e.g., YouTube',
    conferenceName: 'e.g., ACM Conference 2024',
    university: 'e.g., Harvard University',
    organization: 'e.g., World Health Organization',
    reportNumber: 'e.g., WHO-2024-01',
    chapterTitle: 'Enter the chapter title',
    editors: 'e.g., John Smith, Jane Doe',
    bookTitle: 'Title of the book containing the chapter',
  }

  return placeholders[field] || ''
}

/**
 * Check if field is required for source type
 */
export function isFieldRequired(sourceType: SourceTypeId, field: string): boolean {
  const requiredFields: Record<SourceTypeId, string[]> = {
    book: ['title'],
    journal: ['title', 'journalName'],
    website: ['title', 'url'],
    newspaper: ['title', 'newspaperName'],
    video: ['title', 'url'],
    conference: ['title', 'conferenceName'],
    thesis: ['title', 'university'],
    report: ['title'],
    chapter: ['title', 'bookTitle'],
  }

  return requiredFields[sourceType]?.includes(field) || false
}
