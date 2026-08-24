// app/services/employee_id_card_service.ts

import User from '#models/user'
import { DateTime } from 'luxon'
import QRCode from 'qrcode'
import PDFDocument from 'pdfkit'
import fs from 'node:fs'
import path from 'node:path'
import app from '@adonisjs/core/services/app'

export default class EmployeeIdCardService {

  /**
   * Generate Employee ID Card PDF Buffer - Standard Compact CR80 ID Card
   * GET /api/employee/id-card/download
   */
  async generateIdCard(employeeId: number): Promise<Buffer> {
    const employee = await User.query()
      .where('id', employeeId)
      .where('role', 'employee')
      .whereNull('deleted_at')
      .select('id', 'name', 'email', 'designation', 'mobile', 'doj', 'profile_image')
      .first()

    if (!employee) {
      throw new Error('Employee not found')
    }

    // Safely format Date of Joining
    let formattedDoj = 'N/A'
    if (employee.doj) {
      if (employee.doj instanceof Date) {
        formattedDoj = DateTime.fromJSDate(employee.doj).toFormat('dd MMM yyyy')
      } else {
        formattedDoj = DateTime.fromISO(String(employee.doj)).toFormat('dd MMM yyyy')
      }
    }

    const qrData = JSON.stringify({
      id: employee.id,
      name: employee.name,
      email: employee.email,
      designation: employee.designation || 'Employee',
      company: 'Digibima Insurance',
      mobile: employee.mobile || 'N/A',
      doj: formattedDoj,
      timestamp: DateTime.now().toISO()
    })

    const qrCodeBuffer = await QRCode.toBuffer(qrData, {
      width: 80,
      margin: 0,
      color: { dark: '#000000', light: '#ffffff' }
    })

    return new Promise((resolve, reject) => {
      try {
        // Standard ID Card PDF Dimensions [240pt, 380pt] (Compact Scaling)
        const doc = new PDFDocument({
          size: [240, 380],
          margin: 0,
          layout: 'portrait'
        })

        const chunks: Buffer[] = []
        doc.on('data', (chunk) => chunks.push(chunk))
        doc.on('end', () => resolve(Buffer.concat(chunks)))
        doc.on('error', (err) => reject(err))

        // Card Main Background Box
        doc.roundedRect(8, 8, 224, 364, 10).fill('#ffffff').stroke('#e8ecf0')

        // 1. Watermark Image
        const watermarkPath = app.makePath('public/profile/policypdf-watermark.png')
        if (fs.existsSync(watermarkPath)) {
          doc.save()
          doc.opacity(0.12)
          doc.image(watermarkPath, 20, 100, { width: 200 })
          doc.restore()
        }

        // 2. Top Header Gradient Strip
        doc.rect(8, 8, 224, 4).fill('#1a237e')

        // 3. Logo & Title Header
        const logoPath = app.makePath('public/profile/logo.png')
        if (fs.existsSync(logoPath)) {
          doc.image(logoPath, 80, 16, { fit: [80, 24], align: 'center' })
        } else {
          doc.fontSize(12).font('Helvetica-Bold').fillColor('#1a237e').text('DIGIBIMA', 0, 18, { align: 'center' })
        }

        doc.fontSize(5.5).font('Helvetica-Bold').fillColor('#666666').text('EMPLOYEE IDENTITY CARD', 0, 42, { align: 'center' })

        // Divider Line
        doc.moveTo(8, 52).lineTo(232, 52).lineWidth(0.5).stroke('#f0f2f5')

        // 4. Compact Photo Section
        const photoX = 120
        const photoY = 82
        const photoRadius = 24
        let profileImageFound = false

        if (employee.profileImage) {
          try {
            const cleanPath = employee.profileImage.replace(/^\/+/, '')
            const possiblePaths = [
              app.makePath('public', cleanPath),
              app.makePath(cleanPath),
              app.makePath('storage', cleanPath),
              path.join(app.appRoot.pathname, cleanPath)
            ]

            let finalImagePath: string | null = null
            for (const p of possiblePaths) {
              if (fs.existsSync(p)) {
                finalImagePath = p
                break
              }
            }

            if (finalImagePath) {
              doc.save()
              doc.circle(photoX, photoY, photoRadius).clip()
              doc.image(finalImagePath, photoX - photoRadius, photoY - photoRadius, {
                width: photoRadius * 2,
                height: photoRadius * 2,
                fit: [photoRadius * 2, photoRadius * 2]
              })
              doc.restore()

              doc.circle(photoX, photoY, photoRadius).lineWidth(2).stroke('#1a237e')
              profileImageFound = true
            }
          } catch (e) {
            console.error('Profile photo load error:', e)
          }
        }

        if (!profileImageFound) {
          doc.circle(photoX, photoY, photoRadius).fill('#f0f2f5').lineWidth(2).stroke('#1a237e')
        }

        // Employee Name, Designation, ID Badge
        doc.fontSize(11).font('Helvetica-Bold').fillColor('#1a1a1a').text(employee.name, 0, 112, { align: 'center' })
        doc.fontSize(6.5).font('Helvetica').fillColor('#666666').text((employee.designation || 'Associate').toUpperCase(), 0, 126, { align: 'center' })

        // ID Badge Pill
        doc.roundedRect(80, 137, 80, 13, 6.5).fill('#eef2ff').stroke('#c7d2fe')
        doc.fontSize(6.5).font('Helvetica-Bold').fillColor('#1a237e').text(`EMP-${String(employee.id).padStart(4, '0')}`, 0, 140.5, { align: 'center' })

        // 5. Info Section Box
        const infoBoxY = 156
        doc.roundedRect(18, infoBoxY, 204, 115, 6).fill('#fafbfc').stroke('#f0f2f5')

        const infoItems = [
          { label: 'EMPLOYEE ID', value: `EMP-${String(employee.id).padStart(4, '0')}` },
          { label: 'NAME', value: employee.name },
          { label: 'DESIGNATION', value: employee.designation || 'Associate' },
          { label: 'EMAIL', value: employee.email },
          { label: 'MOBILE', value: employee.mobile || 'N/A' },
          { label: 'DATE OF JOINING', value: formattedDoj }
        ]

        let rowY = infoBoxY + 8
        for (const item of infoItems) {
          doc.fontSize(5.5).font('Helvetica-Bold').fillColor('#888888').text(item.label, 26, rowY)
          doc.fontSize(6).font('Helvetica-Bold').fillColor('#1a1a1a').text(item.value, 100, rowY, { width: 114, align: 'right' })
          
          rowY += 16.5
          if (item !== infoItems[infoItems.length - 1]) {
            doc.moveTo(26, rowY - 3).lineTo(214, rowY - 3).lineWidth(0.4).stroke('#f0f2f5')
          }
        }

        // 6. Compact Footer
        const footerY = 280
        doc.moveTo(8, footerY).lineTo(232, footerY).lineWidth(0.5).stroke('#f0f2f5')

        // Left Footer Text
        doc.fontSize(6.5).font('Helvetica-Bold').fillColor('#1a237e').text('DIGIBIMA INSURANCE', 18, footerY + 8)
        doc.fontSize(5).font('Helvetica').fillColor('#666666').text('706, Lane No. 6, New Sanganer Road,', 18, footerY + 17, { width: 135 })
        doc.text('Devi Nagar, Jaipur, Rajasthan 302019', 18, footerY + 24, { width: 135 })
        doc.fontSize(4.5).font('Helvetica-Bold').fillColor('#888888').text('www.digibima.com | info@digibima.com', 18, footerY + 34)

        // Right QR Code
        const qrBoxX = 175
        const qrBoxY = footerY + 8
        doc.roundedRect(qrBoxX, qrBoxY, 44, 44, 4).fill('#ffffff').stroke('#e8ecf0')
        doc.image(qrCodeBuffer, qrBoxX + 4, qrBoxY + 4, { width: 36, height: 36 })
        doc.fontSize(4).font('Helvetica-Bold').fillColor('#888888').text('SCAN TO VERIFY', qrBoxX, qrBoxY + 42, { width: 44, align: 'center' })

        doc.end()
      } catch (error) {
        reject(error)
      }
    })
  }

  async getQRCode(employeeId: number, baseUrl?: string) {
    const employee = await User.query()
      .where('id', employeeId)
      .where('role', 'employee')
      .whereNull('deleted_at')
      .select('id', 'name', 'email', 'designation', 'mobile', 'doj', 'profile_image')
      .first()

    if (!employee) {
      throw new Error('Employee not found')
    }

    let formattedDoj = 'N/A'
    if (employee.doj) {
      if (employee.doj instanceof Date) {
        formattedDoj = DateTime.fromJSDate(employee.doj).toFormat('dd MMM yyyy')
      } else {
        formattedDoj = DateTime.fromISO(String(employee.doj)).toFormat('dd MMM yyyy')
      }
    }

    const qrData = JSON.stringify({
      id: employee.id,
      name: employee.name,
      email: employee.email,
      designation: employee.designation || 'Employee',
      company: 'Digibima Insurance',
      mobile: employee.mobile || 'N/A',
      doj: formattedDoj,
      timestamp: DateTime.now().toISO()
    })

    const qrCode = await QRCode.toDataURL(qrData, {
      width: 200,
      margin: 2,
      color: { dark: '#1a237e', light: '#ffffff' }
    })

    let profileImageUrl = null
    if (employee.profileImage) {
      const host = process.env.HOST || 'localhost'
      const port = process.env.PORT || 3333
      const domain = baseUrl || `http://${host}:${port}`
      const imagePath = employee.profileImage.startsWith('/') ? employee.profileImage : `/${employee.profileImage}`
      profileImageUrl = `${domain}${imagePath}`
    }

    return {
      employee: {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        designation: employee.designation,
        mobile: employee.mobile,
        doj: employee.doj,
        profileImage: profileImageUrl,
        profileImageRaw: employee.profileImage
      },
      qrCode,
      qrData
    }
  }

  async verifyQRCode(qrData: string, baseUrl?: string) {
    try {
      const data = JSON.parse(qrData)
      const employee = await User.query()
        .where('id', data.id)
        .where('role', 'employee')
        .whereNull('deleted_at')
        .select('id', 'name', 'email', 'designation', 'mobile', 'doj', 'profile_image')
        .first()

      if (!employee) {
        return { valid: false, message: 'Employee not found or inactive' }
      }

      let profileImageUrl = null
      if (employee.profileImage) {
        const host = process.env.HOST || 'localhost'
        const port = process.env.PORT || 3333
        const domain = baseUrl || `http://${host}:${port}`
        const imagePath = employee.profileImage.startsWith('/') ? employee.profileImage : `/${employee.profileImage}`
        profileImageUrl = `${domain}${imagePath}`
      }

      return {
        valid: true,
        message: 'Employee verified successfully',
        employee: {
          id: employee.id,
          name: employee.name,
          email: employee.email,
          designation: employee.designation,
          mobile: employee.mobile,
          doj: employee.doj,
          profileImage: profileImageUrl,
          company: 'Digibima Insurance'
        }
      }
    } catch (error) {
      return { valid: false, message: 'Invalid QR Code' }
    }
  }

  async getAllEmployees() {
    return await User.query()
      .where('role', 'employee')
      .whereNull('deleted_at')
      .select('id', 'name', 'email', 'designation', 'mobile', 'doj', 'profile_image')
      .orderBy('name', 'asc')
  }
}