import { useDebounce } from '@pancakeswap/hooks'
import { useMemo } from 'react'
import { safeGetAddress } from 'utils'
import { useDomainNameForAddress } from './useDomain'
import { useGetENSAddressByName } from './useGetENSAddressByName'

/**
 * Hook for handling address input that supports both regular addresses and ENS names
 * Returns resolved address, validation info, and display data for avatars/names
 */
export function useENSAddressInput(input: string, debounceMs = 500) {
  const debouncedInput = useDebounce(input, debounceMs)
  
  // Try to resolve ENS name to address
  const ensResolvedAddress = useGetENSAddressByName(debouncedInput)
  
  // Determine the final resolved address
  const resolvedAddress = useMemo(() => {
    // If input is already a valid address, use it directly
    if (safeGetAddress(input)) {
      return safeGetAddress(input)
    }
    // Otherwise try to use ENS resolved address
    return safeGetAddress(ensResolvedAddress)
  }, [input, ensResolvedAddress])
  
  // Get ENS info for the resolved address (for display purposes)
  const { domainName, avatar, isLoading: isDomainLoading } = useDomainNameForAddress(resolvedAddress)
  
  // Validation states
  const isValid = useMemo(() => {
    if (!input || input.trim() === '') return true // Empty input is valid
    return Boolean(resolvedAddress) // Valid if we can resolve to an address
  }, [input, resolvedAddress])
  
  const isResolving = useMemo(() => {
    // We're resolving if input is not empty, not a direct address, and we don't have a resolved address yet
    return Boolean(input && !safeGetAddress(input) && !resolvedAddress && input === debouncedInput)
  }, [input, resolvedAddress, debouncedInput])
  
  const isENSName = useMemo(() => {
    return Boolean(input && !safeGetAddress(input) && resolvedAddress)
  }, [input, resolvedAddress])
  
  return {
    // Core data
    input,
    resolvedAddress,
    
    // Validation
    isValid,
    isResolving,
    isENSName,
    
    // Display data
    domainName,
    avatar,
    isDomainLoading,
    
    // Helper for display text
    displayText: domainName || (resolvedAddress ? `${resolvedAddress.slice(0, 6)}...${resolvedAddress.slice(-4)}` : ''),
    
    // Error message
    errorMessage: !isValid && input ? 'Invalid address or ENS name' : undefined,
  }
}