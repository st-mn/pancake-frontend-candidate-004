/**
 * Integration example: Enhancing SendAssetForm with ENS support
 *
 * This file demonstrates how to integrate the new ENSAddressInput component
 * with the existing SendAssetForm to provide enhanced ENS functionality.
 */

import { useState } from 'react'
import { ENSAddressInput } from 'components/ENS/ENSAddressInput'

// Example of how to enhance the SendAssetForm component
export const EnhancedSendAssetFormExample = () => {
  // State management for address input
  const [addressInput, setAddressInput] = useState<string>('')
  const [resolvedAddress, setResolvedAddress] = useState<string | null>(null)

  // This is how the integration would work in the actual SendAssetForm
  const handleAddressInputChange = (value: string) => {
    setAddressInput(value)
  }

  const handleResolvedAddressChange = (address: string | null) => {
    setResolvedAddress(address)
    // The resolved address would be used for the actual transaction
    // eslint-disable-next-line no-console
    console.log('Address resolved to:', address)
  }

  return (
    <div>
      {/* Replace the existing Input component with ENSAddressInput */}
      <ENSAddressInput
        value={addressInput}
        onChange={handleAddressInputChange}
        onResolvedAddressChange={handleResolvedAddressChange}
        placeholder="Recipient address or ENS name (e.g. vitalik.eth)"
        showProfileCard
        isError={false}
      />

      {/* Display the resolved address for debugging */}
      {resolvedAddress && (
        <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>Resolved to: {resolvedAddress}</div>
      )}
    </div>
  )
}

/**
 * Integration steps for SendAssetForm:
 *
 * 1. Import the ENSAddressInput component
 * 2. Replace the existing address Input component (lines 354-369 in SendAssetForm.tsx)
 * 3. Update state management to handle resolved addresses
 * 4. Use the resolved address for transaction execution
 *
 * The actual integration would look like this:
 *
 * // In SendAssetForm.tsx, replace the address input section with:
 *
 * {isSendGiftOn ? null : (
 *   <Box>
 *     <ENSAddressInput
 *       value={address ?? ''}
 *       onChange={(value) => setAddress(value)}
 *       onResolvedAddressChange={(resolvedAddr) => {
 *         // Update the resolved address for transaction use
 *         if (resolvedAddr && isAddress(resolvedAddr)) {
 *           setAddressError('')
 *         } else if (address && !resolvedAddr) {
 *           setAddressError(t('Invalid wallet address or ENS name'))
 *         }
 *       }}
 *       placeholder="Recipient address or ENS name"
 *       isError={Boolean(addressError)}
 *       showProfileCard={true}
 *     />
 *     {addressError && <ErrorMessage>{addressError}</ErrorMessage>}
 *   </Box>
 * )}
 */

// Example usage in a test or demo component
export const ENSIntegrationDemo = () => {
  return (
    <div style={{ padding: '20px', maxWidth: '500px' }}>
      <h2>🧪 ENS Integration Demo</h2>
      <p>Try entering the following:</p>
      <ul>
        <li>
          <code>vitalik.eth</code> - Should resolve to Vitalik's address
        </li>
        <li>
          <code>0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045</code> - Valid Ethereum address
        </li>
        <li>
          <code>invalid.eth</code> - Should show error message
        </li>
        <li>
          <code>not-an-address</code> - Should show validation error
        </li>
      </ul>

      <EnhancedSendAssetFormExample />

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <h3>Features demonstrated:</h3>
        <ul>
          <li>✅ Real-time ENS resolution with debouncing</li>
          <li>✅ Visual feedback (loading, success, error states)</li>
          <li>✅ Profile card with avatar and social links</li>
          <li>✅ Clear validation messages</li>
          <li>✅ Support for multiple domain types</li>
        </ul>
      </div>
    </div>
  )
}

export default ENSIntegrationDemo
