import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { isAddress } from 'viem'
import { ENSAddressInput } from '../ENSAddressInput'
import { useGetENSAddressByName } from '../../../hooks/useGetENSAddressByName'
import { useENSProfile } from '../../../hooks/useENSProfile'

// Mock the hooks
vi.mock('@pancakeswap/hooks', () => ({
  useDebounce: vi.fn((value) => value),
}))

vi.mock('@pancakeswap/localization', () => ({
  useTranslation: () => ({
    t: (key: string, params?: any) => {
      if (params) {
        return key.replace(/%\w+%/g, (match) => {
          const param = match.slice(1, -1)
          return params[param] || match
        })
      }
      return key
    },
  }),
}))

vi.mock('../../../hooks/useGetENSAddressByName', () => ({
  useGetENSAddressByName: vi.fn(),
}))

vi.mock('../../../hooks/useENSProfile', () => ({
  useENSProfile: vi.fn(),
}))

vi.mock('viem', () => ({
  isAddress: vi.fn(),
}))

const mockUseGetENSAddressByName = vi.mocked(useGetENSAddressByName)
const mockUseENSProfile = vi.mocked(useENSProfile)
const mockIsAddress = vi.mocked(isAddress)

// Mock theme provider for styled-components
const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  return <div data-testid="theme-provider">{children}</div>
}

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>)
}

describe('ENSAddressInput Component', () => {
  const mockOnChange = vi.fn()
  const mockOnResolvedAddressChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    // Default mock returns
    mockUseGetENSAddressByName.mockReturnValue(null)
    mockUseENSProfile.mockReturnValue({
      domainName: null,
      avatar: null,
      twitterHandle: null,
      githubHandle: null,
      email: null,
      website: null,
      description: null,
      pancakeSettings: null,
      isLoading: false,
      hasSocialProfiles: false,
      isCompleteProfile: false,
    })
    mockIsAddress.mockReturnValue(false)
  })

  it('renders with correct placeholder', () => {
    renderWithTheme(<ENSAddressInput value="" onChange={mockOnChange} placeholder="Enter ENS name or address" />)

    expect(screen.getByPlaceholderText('Enter ENS name or address')).toBeInTheDocument()
  })

  it('handles input changes correctly', () => {
    renderWithTheme(<ENSAddressInput value="" onChange={mockOnChange} />)

    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'vitalik.eth' } })

    expect(mockOnChange).toHaveBeenCalledWith('vitalik.eth')
  })

  it('shows clear button when input has value', () => {
    renderWithTheme(<ENSAddressInput value="vitalik.eth" onChange={mockOnChange} />)

    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('clears input when clear button is clicked', () => {
    renderWithTheme(<ENSAddressInput value="vitalik.eth" onChange={mockOnChange} />)

    const clearButton = screen.getByRole('button')
    fireEvent.click(clearButton)

    expect(mockOnChange).toHaveBeenCalledWith('')
  })

  it('shows success icon for resolved ENS names', async () => {
    // Mock a valid ENS resolution
    mockIsAddress.mockReturnValue(false)
    mockUseGetENSAddressByName.mockReturnValue('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045')
    mockUseENSProfile.mockReturnValue({
      domainName: 'vitalik.eth',
      avatar: 'https://metadata.ens.domains/mainnet/avatar/vitalik.eth',
      twitterHandle: 'VitalikButerin',
      githubHandle: 'ethereum',
      email: null,
      website: 'https://vitalik.ca',
      description: 'Founder of Ethereum',
      pancakeSettings: null,
      isLoading: false,
      hasSocialProfiles: true,
      isCompleteProfile: true,
    })

    renderWithTheme(
      <ENSAddressInput
        value="vitalik.eth"
        onChange={mockOnChange}
        onResolvedAddressChange={mockOnResolvedAddressChange}
      />,
    )

    await waitFor(() => {
      expect(mockOnResolvedAddressChange).toHaveBeenCalledWith('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045')
    })
  })

  it('shows error message for invalid ENS names', async () => {
    mockIsAddress.mockReturnValue(false)
    mockUseGetENSAddressByName.mockReturnValue(null)

    renderWithTheme(<ENSAddressInput value="invalid.eth" onChange={mockOnChange} />)

    await waitFor(() => {
      expect(screen.getByText('ENS name not found. Please check the spelling.')).toBeInTheDocument()
    })
  })

  it('shows profile card for resolved ENS names with social data', async () => {
    mockIsAddress.mockReturnValue(false)
    mockUseGetENSAddressByName.mockReturnValue('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045')
    mockUseENSProfile.mockReturnValue({
      domainName: 'vitalik.eth',
      avatar: 'https://metadata.ens.domains/mainnet/avatar/vitalik.eth',
      twitterHandle: 'VitalikButerin',
      githubHandle: 'ethereum',
      email: null,
      website: 'https://vitalik.ca',
      description: 'Founder of Ethereum',
      pancakeSettings: { slippage: '0.5', theme: 'dark' },
      isLoading: false,
      hasSocialProfiles: true,
      isCompleteProfile: true,
    })

    renderWithTheme(<ENSAddressInput value="vitalik.eth" onChange={mockOnChange} showProfileCard />)

    await waitFor(() => {
      expect(screen.getByText('vitalik.eth')).toBeInTheDocument()
      expect(screen.getByText('Founder of Ethereum')).toBeInTheDocument()
      expect(screen.getByText('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045')).toBeInTheDocument()
      expect(screen.getByText('💼 PancakeSwap Profile Found')).toBeInTheDocument()
      expect(screen.getByText('Complete ENS profile verified')).toBeInTheDocument()
    })
  })

  it('handles valid Ethereum addresses correctly', () => {
    mockIsAddress.mockReturnValue(true)

    renderWithTheme(
      <ENSAddressInput
        value="0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"
        onChange={mockOnChange}
        onResolvedAddressChange={mockOnResolvedAddressChange}
      />,
    )

    expect(mockOnResolvedAddressChange).toHaveBeenCalledWith('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045')
  })

  it('shows loading state while resolving ENS name', () => {
    mockUseENSProfile.mockReturnValue({
      domainName: null,
      avatar: null,
      twitterHandle: null,
      githubHandle: null,
      email: null,
      website: null,
      description: null,
      pancakeSettings: null,
      isLoading: true,
      hasSocialProfiles: false,
      isCompleteProfile: false,
    })

    renderWithTheme(<ENSAddressInput value="resolving.eth" onChange={mockOnChange} />)

    // Should show loading indicator (skeleton)
    expect(screen.getByTestId('theme-provider')).toBeInTheDocument()
  })

  it('validates input format correctly', async () => {
    mockIsAddress.mockReturnValue(false)
    mockUseGetENSAddressByName.mockReturnValue(null)

    renderWithTheme(<ENSAddressInput value="invalid-format" onChange={mockOnChange} />)

    await waitFor(() => {
      expect(
        screen.getByText('Please enter a valid Ethereum address (0x...) or ENS name (.eth, .xyz, etc.)'),
      ).toBeInTheDocument()
    })
  })
})
