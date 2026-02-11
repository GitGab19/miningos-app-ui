import { POOL_PROTOCOLS, type PoolProtocol } from '../PoolManager.constants'

/**
 * Known SV2 pool indicators - hosts, ports, and URL patterns that indicate SV2 support
 */
const SV2_INDICATORS = {
  protocols: ['stratum+sv2://', 'sv2://'],
  ports: [3336, 34255, 34256],
  hosts: [
    'sv2.slushpool.com',
    'stratum.braiins.com',
    'pool.sv2.fi',
    'sv2.dmnd.work',
  ],
  // Port suffixes that typically indicate SV2
  portPatterns: [':3336', ':34255'],
}

/**
 * Detect the Stratum protocol version from a pool URL
 * @param url - The pool URL to analyze
 * @returns 'STRATUM_V1' | 'STRATUM_V2' | 'unknown'
 */
export const detectPoolProtocol = (url: string): PoolProtocol | 'unknown' => {
  const normalizedUrl = url.toLowerCase().trim()

  // Check for explicit SV2 protocol prefix
  if (SV2_INDICATORS.protocols.some((proto) => normalizedUrl.startsWith(proto))) {
    return POOL_PROTOCOLS.STRATUM_V2
  }

  // Check for known SV2 port patterns
  if (SV2_INDICATORS.portPatterns.some((pattern) => normalizedUrl.includes(pattern))) {
    return POOL_PROTOCOLS.STRATUM_V2
  }

  // Check for known SV2 hosts
  if (SV2_INDICATORS.hosts.some((host) => normalizedUrl.includes(host))) {
    return POOL_PROTOCOLS.STRATUM_V2
  }

  // Parse URL to check port
  try {
    // Handle stratum+tcp:// URLs
    const urlToParse = normalizedUrl.replace('stratum+tcp://', 'http://')
    const parsed = new URL(urlToParse)
    const port = parseInt(parsed.port, 10)

    if (SV2_INDICATORS.ports.includes(port)) {
      return POOL_PROTOCOLS.STRATUM_V2
    }
  } catch {
    // URL parsing failed, continue with other checks
  }

  // If it has stratum+tcp:// prefix, it's likely SV1
  if (normalizedUrl.startsWith('stratum+tcp://')) {
    return POOL_PROTOCOLS.STRATUM_V1
  }

  return 'unknown'
}

/**
 * Check if a pool configuration requires the SV2 translator
 * The translator is needed when connecting SV1 miners to an SV2 pool
 * @param protocol - The pool's protocol version
 * @param minersHaveNativeSv2Support - Whether the miners support SV2 natively
 * @returns boolean indicating if translator is required
 */
export const shouldEnableTranslator = (
  protocol: PoolProtocol,
  minersHaveNativeSv2Support = false,
): boolean => {
  // Translator is only needed for SV2 pools with SV1-only miners
  return protocol === POOL_PROTOCOLS.STRATUM_V2 && !minersHaveNativeSv2Support
}

/**
 * Parse a stratum URL into its components
 * @param url - The pool URL
 * @returns Object with host, port, and original URL
 */
export const parseStratumUrl = (
  url: string,
): {
  host: string
  port: number
  protocol: string
  original: string
} | null => {
  try {
    const normalizedUrl = url.trim()

    // Handle stratum+tcp:// URLs by replacing with http:// for parsing
    let urlToParse = normalizedUrl
    let protocol = 'stratum+tcp'

    if (normalizedUrl.startsWith('stratum+tcp://')) {
      urlToParse = normalizedUrl.replace('stratum+tcp://', 'http://')
    } else if (normalizedUrl.startsWith('stratum+sv2://')) {
      urlToParse = normalizedUrl.replace('stratum+sv2://', 'http://')
      protocol = 'stratum+sv2'
    } else if (!normalizedUrl.includes('://')) {
      // If no protocol, assume stratum+tcp
      urlToParse = `http://${normalizedUrl}`
    }

    const parsed = new URL(urlToParse)

    return {
      host: parsed.hostname,
      port: parseInt(parsed.port, 10) || (protocol === 'stratum+sv2' ? 34255 : 3333),
      protocol,
      original: normalizedUrl,
    }
  } catch {
    return null
  }
}

/**
 * Build a stratum URL from components
 * @param host - The pool host
 * @param port - The pool port
 * @param protocol - 'sv1' or 'sv2'
 * @returns The formatted stratum URL
 */
export const buildStratumUrl = (
  host: string,
  port: number,
  protocol: 'sv1' | 'sv2' = 'sv1',
): string => {
  const prefix = protocol === 'sv2' ? 'stratum+sv2' : 'stratum+tcp'
  return `${prefix}://${host}:${port}`
}

/**
 * Get the local translator URL that miners should connect to
 * @param port - The translator's downstream port
 * @returns The local stratum URL
 */
export const getTranslatorConnectionUrl = (port = 34255): string => {
  return `stratum+tcp://localhost:${port}`
}
