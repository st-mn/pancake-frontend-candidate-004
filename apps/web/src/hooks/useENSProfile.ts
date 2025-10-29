import { useMemo } from 'react'
import { useEnsText } from 'wagmi'
import { useDomainNameForAddress } from './useDomain'

/**
 * Hook to fetch comprehensive ENS profile information including text records
 * This demonstrates advanced ENS integration by fetching social media profiles
 * and other metadata stored in ENS text records
 */
export const useENSProfile = (address?: string) => {
  // Get basic ENS info (name and avatar)
  const { domainName, avatar, isLoading: isDomainLoading } = useDomainNameForAddress(address)

  // Fetch common ENS text records for enhanced profile information
  const { data: twitterHandle, isLoading: isTwitterLoading } = useEnsText({
    name: domainName || undefined,
    key: 'com.twitter',
    query: { enabled: Boolean(domainName) },
  })

  const { data: githubHandle, isLoading: isGithubLoading } = useEnsText({
    name: domainName || undefined,
    key: 'com.github',
    query: { enabled: Boolean(domainName) },
  })

  const { data: email, isLoading: isEmailLoading } = useEnsText({
    name: domainName || undefined,
    key: 'email',
    query: { enabled: Boolean(domainName) },
  })

  const { data: website, isLoading: isWebsiteLoading } = useEnsText({
    name: domainName || undefined,
    key: 'url',
    query: { enabled: Boolean(domainName) },
  })

  const { data: description, isLoading: isDescriptionLoading } = useEnsText({
    name: domainName || undefined,
    key: 'description',
    query: { enabled: Boolean(domainName) },
  })

  // Custom PancakeSwap-specific text record for user settings
  const { data: pancakeSettings, isLoading: isPancakeSettingsLoading } = useEnsText({
    name: domainName || undefined,
    key: 'pancakeswap.settings',
    query: { enabled: Boolean(domainName) },
  })

  return useMemo(
    () => ({
      // Basic ENS data
      domainName,
      avatar,

      // Social profiles
      twitterHandle,
      githubHandle,
      email,
      website,
      description,

      // PancakeSwap-specific settings (JSON format)
      pancakeSettings: pancakeSettings
        ? (() => {
            try {
              return JSON.parse(pancakeSettings)
            } catch {
              return null
            }
          })()
        : null,

      // Loading states
      isLoading:
        isDomainLoading ||
        isTwitterLoading ||
        isGithubLoading ||
        isEmailLoading ||
        isWebsiteLoading ||
        isDescriptionLoading ||
        isPancakeSettingsLoading,

      // Helper to check if we have any social data
      hasSocialProfiles: Boolean(twitterHandle || githubHandle || email || website),

      // Helper to check if this is a complete ENS profile
      isCompleteProfile: Boolean(domainName && (avatar || twitterHandle || githubHandle || description)),
    }),
    [
      domainName,
      avatar,
      twitterHandle,
      githubHandle,
      email,
      website,
      description,
      pancakeSettings,
      isDomainLoading,
      isTwitterLoading,
      isGithubLoading,
      isEmailLoading,
      isWebsiteLoading,
      isDescriptionLoading,
      isPancakeSettingsLoading,
    ],
  )
}
