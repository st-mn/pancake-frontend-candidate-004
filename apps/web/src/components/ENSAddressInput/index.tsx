import { useTranslation } from '@pancakeswap/localization'
import { Box, FlexGap, Input, Text } from '@pancakeswap/uikit'
import { useENSAddressInput } from 'hooks/useENSAddressInput'
import { ChangeEvent, useCallback } from 'react'
import { styled } from 'styled-components'

const ENSInfoContainer = styled(Box)`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: 8px;
  padding: 12px;
  margin-top: 8px;
`

const AvatarImage = styled.img`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
`

interface ENSAddressInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  error?: boolean
  id?: string
  style?: React.CSSProperties
}

/**
 * Enhanced address input component with ENS support
 * Shows resolved address info and avatar when ENS name is entered
 */
export function ENSAddressInput({ 
  value, 
  onChange, 
  placeholder, 
  disabled = false, 
  error: externalError = false,
  id,
  style 
}: ENSAddressInputProps) {
  const { t } = useTranslation()
  const {
    resolvedAddress,
    isValid,
    isResolving,
    isENSName,
    domainName,
    avatar,
    displayText,
    errorMessage
  } = useENSAddressInput(value)

  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value)
  }, [onChange])

  const hasError = externalError || (!isValid && value.length > 0)
  const showENSInfo = isENSName && resolvedAddress && value.length > 0

  return (
    <Box>
      <Input
        id={id}
        value={value}
        onChange={handleChange}
        placeholder={placeholder || t('Address or ENS name')}
        disabled={disabled}
        error={hasError}
        style={style}
      />
      
      {isResolving && (
        <Text fontSize="12px" color="textSubtle" mt="4px">
          {t('Resolving ENS name...')}
        </Text>
      )}
      
      {hasError && errorMessage && (
        <Text fontSize="12px" color="failure" mt="4px">
          {t(errorMessage)}
        </Text>
      )}
      
      {showENSInfo && (
        <ENSInfoContainer>
          <FlexGap gap="8px" alignItems="center">
            {avatar && (
              <AvatarImage 
                src={avatar} 
                alt="ENS Avatar"
                onError={(e) => {
                  // Hide avatar on error
                  e.currentTarget.style.display = 'none'
                }}
              />
            )}
            <FlexGap flexDirection="column" gap="2px">
              <Text fontSize="12px" color="textSubtle">
                {t('Resolved to:')}
              </Text>
              <Text fontSize="14px" fontWeight="500">
                {displayText}
              </Text>
              <Text fontSize="11px" color="textSubtle" style={{ fontFamily: 'monospace' }}>
                {resolvedAddress}
              </Text>
            </FlexGap>
          </FlexGap>
        </ENSInfoContainer>
      )}
    </Box>
  )
}