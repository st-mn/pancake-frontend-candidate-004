import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useEnsText } from 'wagmi'
import { useDomainNameForAddress } from '../useDomain'
import { useENSProfile } from '../useENSProfile'

// Mock the wagmi hooks
vi.mock('wagmi', () => ({
  useEnsText: vi.fn(),
}))

vi.mock('../useDomain', () => ({
  useDomainNameForAddress: vi.fn(),
}))

const mockUseEnsText = vi.mocked(useEnsText)
const mockUseDomainNameForAddress = vi.mocked(useDomainNameForAddress)

describe('useENSProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return basic ENS profile information', async () => {
    // Mock the domain hook to return basic ENS info
    mockUseDomainNameForAddress.mockReturnValue({
      domainName: 'vitalik.eth',
      avatar: 'https://metadata.ens.domains/mainnet/avatar/vitalik.eth',
      isLoading: false,
    })

    // Mock text records
    mockUseEnsText
      .mockReturnValueOnce({ data: 'VitalikButerin', isLoading: false }) // Twitter
      .mockReturnValueOnce({ data: 'ethereum', isLoading: false }) // GitHub
      .mockReturnValueOnce({ data: 'vitalik@ethereum.org', isLoading: false }) // Email
      .mockReturnValueOnce({ data: 'https://vitalik.ca', isLoading: false }) // Website
      .mockReturnValueOnce({ data: 'Founder of Ethereum', isLoading: false }) // Description
      .mockReturnValueOnce({ data: '{"slippage": "0.5", "theme": "dark"}', isLoading: false }) // PancakeSwap settings

    const { result } = renderHook(() => useENSProfile('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'))

    await waitFor(() => {
      expect(result.current.domainName).toBe('vitalik.eth')
      expect(result.current.avatar).toBe('https://metadata.ens.domains/mainnet/avatar/vitalik.eth')
      expect(result.current.twitterHandle).toBe('VitalikButerin')
      expect(result.current.githubHandle).toBe('ethereum')
      expect(result.current.email).toBe('vitalik@ethereum.org')
      expect(result.current.website).toBe('https://vitalik.ca')
      expect(result.current.description).toBe('Founder of Ethereum')
      expect(result.current.hasSocialProfiles).toBe(true)
      expect(result.current.isCompleteProfile).toBe(true)
      expect(result.current.pancakeSettings).toEqual({ slippage: '0.5', theme: 'dark' })
    })
  })

  it('should handle addresses without ENS names', async () => {
    mockUseDomainNameForAddress.mockReturnValue({
      domainName: null,
      avatar: null,
      isLoading: false,
    })

    // Mock empty text records
    mockUseEnsText.mockReturnValue({ data: undefined, isLoading: false })

    const { result } = renderHook(() => useENSProfile('0x742d35CC6554C1532BA2BEBDE5982A8D2F6d1234'))

    await waitFor(() => {
      expect(result.current.domainName).toBeNull()
      expect(result.current.avatar).toBeNull()
      expect(result.current.hasSocialProfiles).toBe(false)
      expect(result.current.isCompleteProfile).toBe(false)
    })
  })

  it('should handle loading states correctly', () => {
    mockUseDomainNameForAddress.mockReturnValue({
      domainName: null,
      avatar: null,
      isLoading: true,
    })

    mockUseEnsText.mockReturnValue({ data: undefined, isLoading: true })

    const { result } = renderHook(() => useENSProfile('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'))

    expect(result.current.isLoading).toBe(true)
  })

  it('should parse PancakeSwap settings correctly', async () => {
    mockUseDomainNameForAddress.mockReturnValue({
      domainName: 'testuser.eth',
      avatar: null,
      isLoading: false,
    })

    // Mock PancakeSwap settings with valid JSON
    mockUseEnsText
      .mockReturnValueOnce({ data: undefined, isLoading: false }) // Twitter
      .mockReturnValueOnce({ data: undefined, isLoading: false }) // GitHub
      .mockReturnValueOnce({ data: undefined, isLoading: false }) // Email
      .mockReturnValueOnce({ data: undefined, isLoading: false }) // Website
      .mockReturnValueOnce({ data: undefined, isLoading: false }) // Description
      .mockReturnValueOnce({
        data: '{"autoSlippage": true, "expertMode": false, "gasPrice": "standard"}',
        isLoading: false,
      }) // PancakeSwap settings

    const { result } = renderHook(() => useENSProfile('0x1234567890123456789012345678901234567890'))

    await waitFor(() => {
      expect(result.current.pancakeSettings).toEqual({
        autoSlippage: true,
        expertMode: false,
        gasPrice: 'standard',
      })
    })
  })

  it('should handle invalid JSON in PancakeSwap settings', async () => {
    mockUseDomainNameForAddress.mockReturnValue({
      domainName: 'testuser.eth',
      avatar: null,
      isLoading: false,
    })

    // Mock invalid JSON in PancakeSwap settings
    mockUseEnsText
      .mockReturnValueOnce({ data: undefined, isLoading: false })
      .mockReturnValueOnce({ data: undefined, isLoading: false })
      .mockReturnValueOnce({ data: undefined, isLoading: false })
      .mockReturnValueOnce({ data: undefined, isLoading: false })
      .mockReturnValueOnce({ data: undefined, isLoading: false })
      .mockReturnValueOnce({ data: 'invalid json string', isLoading: false })

    const { result } = renderHook(() => useENSProfile('0x1234567890123456789012345678901234567890'))

    await waitFor(() => {
      expect(result.current.pancakeSettings).toBeNull()
    })
  })
})
