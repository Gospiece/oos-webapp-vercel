import { FlutterWaveButton, ClosePaymentModal } from '@flutterwave/flutterwave-react-native'
import { usePaystackPayment } from '@paystack/paystack-react'

export interface DonationData {
  startupId: string
  startupName: string
  amount: number
  donorEmail: string
  donorName: string
}

export async function processDonation(donationData: DonationData) {
  // This will be handled by the client-side components
  // The actual processing happens in the browser
  return { success: true, data: donationData }
}

export function calculateCommission(amount: number): number {
  return amount * 0.16 // 16% commission
}

export function calculateNetAmount(amount: number): number {
  return amount - calculateCommission(amount)
}