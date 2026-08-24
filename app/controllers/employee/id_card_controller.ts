// app/controllers/employee/id_card_controller.ts

import type { HttpContext } from '@adonisjs/core/http'
import EmployeeIdCardService from '#services/employee_id_card_service'
import User from '#models/user'

export default class EmployeeIdCardController {
  private idCardService = new EmployeeIdCardService()

  /**
   * Download ID Card PDF
   * GET /api/employee/id-card/download
   */
  async download({ auth, response }: HttpContext) {
    try {
      const user = auth.user!
      const pdfDoc = await this.idCardService.generateIdCard(user.id)

      const fileName = `ID-Card-${user.name.replace(/\s/g, '-')}-${user.id}.pdf`
      
      response.header('Content-Type', 'application/pdf')
      response.header('Content-Disposition', `attachment; filename="${fileName}"`)

      return response.send(pdfDoc)
    } catch (error: any) {
      console.error('❌ Download Error:', error)
      return response.badRequest({
        status: false,
        message: error.message
      })
    }
  }

  /**
   * View ID Card - Professional UI with Profile Image
   * GET /api/employee/id-card/view
   */
  async view({ auth, request, response }: HttpContext) {
    try {
      const user = auth.user!
      
      // ✅ Fetch employee with profile image
      const employee = await User.query()
        .where('id', user.id)
        .whereNull('deleted_at')
        .select('id', 'name', 'email', 'designation', 'mobile', 'doj', 'profile_image')
        .first()

      if (!employee) {
        return response.notFound({
          status: false,
          message: 'Employee not found'
        })
      }

      // ✅ Dynamically build base URL & Profile Image URL from request headers
      const protocol = request.protocol()
      const host = request.host()
      
      let profileImageUrl = `${protocol}://${host}/public/profile/person.jpg` // Default image
      if (employee.profileImage) {
        const imagePath = employee.profileImage.startsWith('/') 
          ? employee.profileImage 
          : `/${employee.profileImage}`

        profileImageUrl = `${protocol}://${host}${imagePath}`
      }

      const qrData = await this.idCardService.getQRCode(user.id)

      const html = `
        <!DOCTYPE html>
<html>

<head>
    <title>ID Card - ${employee.name}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
        rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', -apple-system, sans-serif;
            background: #f0f2f5;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 20px;
        }

        .card-wrapper {
            background: white;
            border-radius: 24px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
            padding: 32px;
            max-width: 440px;
            width: 100%;
        }

        .card {
            background: white;
            border: 1px solid #e8ecf0;
            border-radius: 16px;
            overflow: hidden;
            position: relative;
        }

        .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 100%;
            opacity: 0.6;
            pointer-events: none;
            user-select: none;
            z-index: 99999;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .watermark img {
            width: 100%;
            height: auto;
            display: block;
            object-fit: contain;
        }

        .header-strip {
            height: 6px;
            background: linear-gradient(90deg, #1a237e 0%, #3949ab 100%);
        }

        /* Header Styles */
        .header {
            padding: 18px 24px 14px;
            text-align: center;
            border-bottom: 1px solid #f0f2f5;
            background: #ffffff;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            position: relative;
            z-index: 2;
        }

        .logo-img {
            max-height: 45px;
            width: auto;
            object-fit: contain;
            display: block;
            margin-bottom: 4px;
        }

        .logo-sub {
            font-size: 9px;
            color: #666;
            letter-spacing: 2px;
            margin-top: 2px;
            font-weight: 600;
            text-transform: uppercase;
        }

        .photo-section {
            text-align: center;
            padding: 20px 24px 12px;
            position: relative;
            z-index: 2;
        }

        .photo {
            width: 80px;
            height: 80px;
            background: #f0f2f5;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border: 3px solid #1a237e;
            box-shadow: 0 4px 10px rgba(26, 35, 126, 0.15);
            overflow: hidden;
        }

        .photo img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 50%;
        }

        .name {
            font-size: 18px;
            font-weight: 700;
            color: #1a1a1a;
            margin-top: 10px;
            text-transform: capitalize;
        }

        .designation {
            font-size: 12px;
            color: #666;
            font-weight: 500;
            margin-top: 2px;
            text-transform: uppercase;
        }

        .id-badge {
            display: inline-block;
            background: #eef2ff;
            border: 1px solid #c7d2fe;
            border-radius: 20px;
            padding: 4px 16px;
            font-size: 11px;
            font-weight: 600;
            color: #1a237e;
            margin-top: 8px;
        }

        .info-section {
            padding: 14px 20px;
            background: rgba(250, 251, 252, 0.85);
            margin: 12px 20px 20px;
            border-radius: 12px;
            border: 1px solid #f0f2f5;
            position: relative;
            z-index: 2;
        }

        .info-row {
            display: flex;
            justify-content: space-between;
            padding: 6px 0;
            border-bottom: 1px solid #f0f2f5;
        }

        .info-row:last-child {
            border-bottom: none;
        }

        .info-label {
            font-size: 10px;
            font-weight: 600;
            color: #888;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .info-value {
            font-size: 12px;
            color: #1a1a1a;
            font-weight: 600;
        }

        .footer-section {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px 20px;
            background: #ffffff;
            border-top: 1px solid #f0f2f5;
            gap: 16px;
            position: relative;
            z-index: 2;
        }

        .footer-left {
            flex: 1;
            text-align: left;
        }

        .company-title {
            font-size: 12px;
            font-weight: 700;
            color: #1a237e;
            letter-spacing: 0.5px;
            margin-bottom: 3px;
        }

        .footer-text {
            font-size: 11px;
            color: #666;
            line-height: 1.3;
        }

        .company-contact {
            font-size: 10px;
            color: #888;
            margin-top: 4px;
            font-weight: 500;
        }

        .footer-right {
            display: flex;
            flex-direction: column;
            align-items: center;
            flex-shrink: 0;
        }

        .qr-box {
            padding: 6px;
            border: 1px solid #e8ecf0;
            border-radius: 8px;
            background: white;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .qr-box img {
            width: 70px;
            height: 70px;
            display: block;
            object-fit: contain;
        }

        .qr-label {
            font-size: 7px;
            color: #888;
            margin-top: 4px;
            letter-spacing: 0.3px;
            font-weight: 600;
            text-transform: uppercase;
        }

        .btn-download {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            width: 100%;
            padding: 12px;
            background: #1a237e;
            color: white;
            border: none;
            border-radius: 12px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.2s;
            margin-top: 16px;
            font-family: 'Inter', sans-serif;
        }

        .btn-download:hover {
            background: #0d154e;
        }

        .btn-download svg {
            width: 18px;
            height: 18px;
            fill: none;
            stroke: currentColor;
            stroke-width: 2;
        }
    </style>
</head>

<body>
    <div class="card-wrapper">
        <div class="card">
            <div class="watermark">
                <img src="/public/profile/policypdf-watermark.png" alt="DIGIBIMA Watermark" />
            </div>

            <div class="header-strip"></div>

            <div class="header">
                <img src="/public/profile/logo.png" alt="DIGIBIMA" class="logo-img" />
                <div class="logo-sub">Employee Identity Card</div>
            </div>

            <!-- ✅ PHOTO SECTION WITH DYNAMIC PROFILE IMAGE -->
            <div class="photo-section">
                <div class="photo">
                    <img 
                        src="${profileImageUrl}" 
                        alt="Profile Photo"
                        onerror="this.src='https://cdn-icons-png.flaticon.com/512/3135/3135715.png'" 
                    />
                </div>
                <div class="name">${employee.name}</div>
                <div class="designation">${employee.designation || 'Associate'}</div>
                <div class="id-badge">EMP-${String(employee.id).padStart(4, '0')}</div>
            </div>

            <!-- ✅ INFO SECTION WITH EMPLOYEE DATA -->
            <div class="info-section">
                <div class="info-row">
                    <span class="info-label">Employee ID</span>
                    <span class="info-value">EMP-${String(employee.id).padStart(4, '0')}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Name</span>
                    <span class="info-value">${employee.name}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Designation</span>
                    <span class="info-value">${employee.designation || 'Associate'}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Email</span>
                    <span class="info-value">${employee.email}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Mobile</span>
                    <span class="info-value">${employee.mobile || 'N/A'}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Date of Joining</span>
                    <span class="info-value">${employee.doj ? new Date(employee.doj).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}</span>
                </div>
            </div>

            <div class="footer-section">
                <div class="footer-left">
                    <div class="company-title">DIGIBIMA INSURANCE</div>
                    <div class="footer-text">706, Lane No. 6, New Sanganer Road, Devi Nagar, Jaipur, Rajasthan 302019
                    </div>
                    <div class="company-contact">www.digibima.com | info@digibima.com</div>
                </div>

                <!-- Right Side: Working QR Code -->
                <div class="footer-right">
                    <div class="qr-box">
                        <img src="/public/profile/digibimaqrcode.jpeg" alt="QR Code" />
                    </div>
                    <div class="qr-label">Scan to verify</div>
                </div>
            </div>
        </div>

        <button class="btn-download" onclick="downloadCard()">
            <svg viewBox="0 0 24 24">
                <path d="M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3M12 4v12m0 0l-4-4m4 4l4-4" />
            </svg>
            Download ID Card
        </button>
    </div>

    <script>
        function downloadCard() {
            window.open('/api/employee/id-card/download', '_blank');
        }
    </script>
</body>

</html>
      `

      response.header('Content-Type', 'text/html')
      return response.send(html)
    } catch (error: any) {
      console.error('❌ View Error:', error)
      return response.badRequest({
        status: false,
        message: error.message
      })
    }
  }

  /**
   * Get QR Code (JSON)
   * GET /api/employee/qr-code
   */
  async qrCode({ auth, response }: HttpContext) {
    try {
      const user = auth.user!
      const data = await this.idCardService.getQRCode(user.id)

      return response.ok({
        status: true,
        data
      })
    } catch (error: any) {
      return response.badRequest({
        status: false,
        message: error.message
      })
    }
  }

  /**
   * Verify QR Code
   * POST /api/employee/verify-qr
   */
  async verify({ request, response }: HttpContext) {
    try {
      const { qrData } = request.only(['qrData'])

      if (!qrData) {
        return response.badRequest({
          status: false,
          message: 'QR data is required'
        })
      }

      const result = await this.idCardService.verifyQRCode(qrData)

      return response.ok({
        status: true,
        data: result
      })
    } catch (error: any) {
      return response.badRequest({
        status: false,
        message: error.message
      })
    }
  }
}