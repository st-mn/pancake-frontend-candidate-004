import { useState, useEffect, useMemo } from 'react'
import { useDebounce } from '@pancakeswap/hooks'
import { useTranslation } from '@pancakeswap/localization'
import {
  Box,
  Input,
  Text,
  Flex,
  FlexGap,
  IconButton,
  CloseIcon,
  CheckmarkCircleIcon,
  Skeleton,
  LinkExternal,
} from '@pancakeswap/uikit'
import { styled } from 'styled-components'
import { isAddress } from 'viem'
import { useGetENSAddressByName } from 'hooks/useGetENSAddressByName'
import { useENSProfile } from 'hooks/useENSProfile'

// Styled components for the ENS address input
const InputWrapper = styled(Box)`
  position: relative;
  width: 100%;
`

const ClearButton = styled(IconButton)`
  width: 20px;
  height: 20px;
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
`

const ResolvedAddressContainer = styled(Box)`
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 12px;
  padding: 12px;
  margin-top: 8px;
`

const ErrorMessage = styled(Text)`
  color: ${({ theme }) => theme.colors.failure};
  font-size: 14px;
  margin-top: 4px;
`

const StatusIconWrapper = styled(Box)`
  position: absolute;
  right: 40px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
`

const ProfileCard = styled(Box)`
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 12px;
  padding: 16px;
  margin-top: 8px;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1);
`

const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
`

const DefaultAvatar = styled(Box)`
  width: 40px;
  height: 40px;
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: white;
  font-size: 14px;
`

const SocialLink = styled(LinkExternal)`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`

interface ENSAddressInputProps {
  value: string
  onChange: (value: string) => void
  onResolvedAddressChange?: (address: string | null) => void
  placeholder?: string
  isError?: boolean
  showProfileCard?: boolean
  inputProps?: Record<string, any>
}

/**
 * Enhanced address input component with ENS resolution support
 * Features:
 * - Resolves ENS names to addresses
 * - Shows ENS avatar and additional info for resolved addresses
 * - Visual feedback for successful resolution
 * - Error handling for invalid addresses/names
 * - Clear button for easy input clearing
 */
export const ENSAddressInput: React.FC<ENSAddressInputProps> = ({
  value,
  onChange,
  onResolvedAddressChange,
  placeholder = 'Enter address or ENS name',
  isError = false,
  inputProps = {},
}) => {
  const { t } = useTranslation()

  // Debounce the input value to avoid excessive API calls
  const debouncedValue = useDebounce(value, 500)

  // State for tracking input validation
  const [validationError, setValidationError] = useState<string>('')

  // Resolve ENS name to address
  const resolvedAddress = useGetENSAddressByName(debouncedValue)

  // Get comprehensive ENS profile information
  const ensProfile = useENSProfile(resolvedAddress || (isAddress(debouncedValue) ? debouncedValue : undefined))

  // Determine the final resolved address
  const finalAddress = useMemo(() => {
    // If input is already a valid address, use it directly
    if (isAddress(value)) return value
    // Otherwise use the ENS-resolved address
    return resolvedAddress || null
  }, [value, resolvedAddress])

  // Determine if we're currently resolving
  const isResolving = Boolean(debouncedValue && debouncedValue !== value)

  // Determine if resolution was successful
  const isResolved = Boolean(finalAddress && !isAddress(value))

  // Update parent component when resolved address changes
  useEffect(() => {
    onResolvedAddressChange?.(finalAddress)
  }, [finalAddress, onResolvedAddressChange])

  // Validate input and set error messages
  useEffect(() => {
    if (!debouncedValue) {
      setValidationError('')
      return
    }

    // If it's a valid address, no error
    if (isAddress(debouncedValue)) {
      setValidationError('')
      return
    }

    // If it looks like an ENS name but didn't resolve, show error
    if (debouncedValue.includes('.') && !resolvedAddress) {
      setValidationError(t('ENS name could not be resolved'))
      return
    }

    // If it doesn't look like address or ENS name, show error
    if (!debouncedValue.includes('.')) {
      setValidationError(t('Please enter a valid address or ENS name'))
      return
    }

    setValidationError('')
  }, [debouncedValue, resolvedAddress, t])

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.trim()
    onChange(inputValue)
  }

  // Handle clear button click
  const handleClear = () => {
    onChange('')
    setValidationError('')
  }

  // Determine if we should show the success icon
  const showSuccessIcon = isResolved && !isResolving && !validationError

  // Determine if we should show error state
  const hasError = isError || Boolean(validationError)

  return (
    <Box>
      <InputWrapper>
        <Input
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          isError={hasError}
          style={{
            height: '64px',
            paddingRight: value ? '80px' : '16px', // Make room for icons
          }}
          {...inputProps}
        />

        {/* Loading/Resolving indicator */}
        {isResolving && (
          <Box position="absolute" right="40px" top="50%" style={{ transform: 'translateY(-50%)' }}>
            <Skeleton width="16px" height="16px" variant="circle" />
          </Box>
        )}

        {/* Success icon for resolved ENS names */}
        {showSuccessIcon && <CheckmarkCircleIcon width="16px" height="16px" />}

        {/* Clear button */}
        {value && (
          <ClearButton scale="sm" onClick={handleClear} variant="tertiary">
            <CloseIcon color="textSubtle" />
          </ClearButton>
        )}
      </InputWrapper>

      {/* Error message */}
      {validationError && <ErrorMessage>{validationError}</ErrorMessage>}

      {/* Resolved address display with ENS info */}
      {isResolved && finalAddress && !validationError && (
        <ResolvedAddressContainer>
          <FlexGap gap="12px" alignItems="center">
            {/* ENS Avatar */}
            {avatar ? (
              <Avatar src={avatar} width={32} height={32} />
            ) : (
              <Box
                width="32px"
                height="32px"
                background="linear-gradient(45deg, #667eea 0%, #764ba2 100%)"
                borderRadius="50%"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Text color="white" fontSize="12px" fontWeight="bold">
                  {finalAddress.slice(2, 4).toUpperCase()}
                </Text>
              </Box>
            )}

            <FlexGap flexDirection="column" flex="1" gap="4px">
              {/* ENS name if available */}
              {domainName && (
                <Text fontWeight="600" color="text">
                  {domainName}
                </Text>
              )}

              {/* Resolved address */}
              <Text fontSize="12px" color="textSubtle" style={{ wordBreak: 'break-all' }}>
                {finalAddress}
              </Text>

              {/* Success message */}
              <Text fontSize="11px" color="success">
                ✓ {domainName ? t('ENS name resolved') : t('Valid address')}
              </Text>
            </FlexGap>
          </FlexGap>
        </ResolvedAddressContainer>
      )}
    </Box>
  )
}

export default ENSAddressInput
