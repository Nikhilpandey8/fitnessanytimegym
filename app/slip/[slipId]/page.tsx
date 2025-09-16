'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Download, Printer, ArrowLeft, QrCode } from 'lucide-react'
import { Button } from '@/components/ui/button'
import QRCode from 'react-qr-code'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { formatCurrency, formatDate } from '@/lib/utils'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { useRouter } from 'next/navigation'

interface FeeSlipData {
  id: string
  fee_amount: number
  start_date: string
  end_date: string
  duration_label: string
  gym_name: string
  signed_by: string
  issued_on: string
  members: {
    full_name: string
    phone?: string
  }
}

export default function FeeSlipPage({ params }: { params: { slipId: string } }) {
  const [slip, setSlip] = useState<FeeSlipData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showQR, setShowQR] = useState(false)
  const slipRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    fetchSlip()
    // eslint-disable-next-line
  }, [])

  const fetchSlip = async () => {
    try {
      const response = await fetch(`/api/slips/${params.slipId}`)
      if (response.ok) {
        const data = await response.json()
        setSlip(data)
      }
    } catch (error) {
      console.error('Failed to fetch slip:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadPDF = async () => {
    if (!slipRef.current) return

    try {
      const canvas = await html2canvas(slipRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      })
      
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      
      const imgWidth = 210
      const pageHeight = 295
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight
      
      let position = 0
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }
      
      pdf.save(`fee-slip-${slip?.members.full_name}-${formatDate(slip?.issued_on || '')}.pdf`)
    } catch (error) {
      console.error('Failed to generate PDF:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  if (!slip) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <p className="text-white">Fee slip not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Actions Bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8 no-print"
        >
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex space-x-3">
            <Button
              onClick={handlePrint}
              variant="outline"
              className="border-blue-600 text-blue-400 hover:bg-blue-600/10"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button
              onClick={handleDownloadPDF}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
            <Button
              onClick={() => setShowQR(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <QrCode className="w-4 h-4 mr-2" />
              QR
            </Button>
          </div>
        </motion.div>

        {/* QR Modal */}
        {showQR && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <div className="bg-white rounded-lg shadow-lg p-8 flex flex-col items-center">
              <h2 className="text-xl font-bold mb-2 text-gray-800">Scan this QR code</h2>
              <p className="text-gray-600 mb-4 text-center text-sm">Scanning this QR code on any device will show the fee slip preview instantly.<br/>All other features (print, download, view) remain available here.</p>
              <QRCode value={`https://fitnessanytime.vercel.app/slip/${params.slipId}`} size={180} />
              <Button className="mt-6 bg-purple-600 text-white" onClick={() => setShowQR(false)}>
                Close
              </Button>
            </div>
          </div>
        )}

        {/* Fee Slip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          ref={slipRef}
          className="print-friendly"
        >
          <Card className="glassmorphism border-gray-600/30 bg-white/5 print:bg-white print:text-black">
            <CardHeader className="text-center border-b border-gray-600/30 print:border-gray-300">
              <motion.h1
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="text-3xl font-bold neon-text print:text-black print:shadow-none mb-2"
              >
                {slip.gym_name}
              </motion.h1>
              <div className="text-gray-400 print:text-gray-600 space-y-1">
                <p className="text-lg font-semibold">Fee Receipt</p>
                <p className="text-sm">Shukar Bazar, Chauhanpatti, Delhi-110094</p>
                <p className="text-sm">Contact: 9811008460</p>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-6">
                {/* Receipt Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-semibold mb-1 print:text-black">Receipt Details</h2>
                    <p className="text-gray-400 print:text-gray-600 text-sm">
                      Slip ID: {slip.id.slice(0, 8)}...
                    </p>
                    <p className="text-gray-400 print:text-gray-600 text-sm">
                      Date: {formatDate(slip.issued_on)}
                    </p>
                  </div>
                </div>
                {/* Member Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 print:text-gray-600 mb-2">
                      MEMBER INFORMATION
                    </h3>
                    <div className="space-y-1">
                      <p className="font-semibold text-lg print:text-black">{slip.members.full_name}</p>
                      {slip.members.phone && (
                        <p className="text-gray-300 print:text-gray-600">{slip.members.phone}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 print:text-gray-600 mb-2">
                      MEMBERSHIP DETAILS
                    </h3>
                    <div className="space-y-1">
                      <p className="print:text-black">Duration: <span className="font-semibold">{slip.duration_label}</span></p>
                      <p className="print:text-black">Start: <span className="font-semibold">{formatDate(slip.start_date)}</span></p>
                      <p className="print:text-black">End: <span className="font-semibold">{formatDate(slip.end_date)}</span></p>
                    </div>
                  </div>
                </div>
                {/* Payment Information */}
                <div className="border-t border-gray-600/30 print:border-gray-300 pt-6">
                  <div className="bg-gray-800/30 print:bg-gray-50 rounded-lg p-4 print:border print:border-gray-300">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300 print:text-gray-600">Total Amount Paid:</span>
                      <span className="text-2xl font-bold text-green-400 print:text-green-600">
                        {formatCurrency(slip.fee_amount)}
                      </span>
                    </div>
                  </div>
                </div>
                {/* Signature */}
                <div className="border-t border-gray-600/30 print:border-gray-300 pt-6 text-center">
                  <p className="text-gray-400 print:text-gray-600 mb-6">Authorized Signature</p>
                  <div className="inline-block">
                    <p className="font-semibold text-lg border-b-2 border-gray-600 print:border-gray-400 pb-1 px-4 print:text-black">
                      {slip.signed_by}
                    </p>
                    <p className="text-gray-400 print:text-gray-600 text-sm mt-2">FitnessAnytime Gym</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}