// app/services/daily_report_service.ts

import User from '#models/user'
import TaskManagement from '#models/task_management'
import { DateTime } from 'luxon'
import { chromium } from 'playwright'

export default class DailyReportService {

  async getDailyReportData(employeeId: number, date: string) {
    const reportDate = DateTime.fromISO(date)
    const dateStr = reportDate.toISODate()

    const employee = await User.query()
      .where('id', employeeId)
      .where('role', 'employee')
      .whereNull('deleted_at')
      .first()

    if (!employee) {
      throw new Error('Employee not found')
    }

    const applyEmployeeFilter = (query: any) => {
      query.where((q: any) => {
        q.where('assign_to', employeeId).orWhere('user_id', employeeId)
      })
    }

    // 1. Today's New Assigned Leads
    const todayNewLeads = await TaskManagement.query()
      .where(applyEmployeeFilter)
      .where('lead_date', dateStr)
      .whereNull('deleted_at')
      .orderBy('created_at', 'desc')

    // 2. Pending Follow-Ups / Pending Leads
    const pendingFollowUps = await TaskManagement.query()
      .where(applyEmployeeFilter)
      .where('status', 'pending')
      .whereNull('deleted_at')
      .orderBy('created_at', 'desc')

    // 3. Call Again Leads (Updated Today)
    const callAgainLeads = await TaskManagement.query()
      .where(applyEmployeeFilter)
      .where('status', 'call_again')
      .whereNull('deleted_at')
      .whereRaw('DATE(updated_at) = ?', [dateStr])
      .orderBy('updated_at', 'desc')

    // 4. Follow Up Leads (Updated Today)
    const followUpLeads = await TaskManagement.query()
      .where(applyEmployeeFilter)
      .where('status', 'follow_up')
      .whereNull('deleted_at')
      .whereRaw('DATE(updated_at) = ?', [dateStr])
      .orderBy('updated_at', 'desc')

    // 5. Quote Shared Leads
    const todayLeadsWithQuote = await TaskManagement.query()
      .where(applyEmployeeFilter)
      .where('lead_date', dateStr)
      .where((q: any) => {
        q.where('quote_share', 'yes').orWhere('quote_sent', 'yes')
      })
      .whereNull('deleted_at')

    // 6. Converted Leads
    const todayConverted = await TaskManagement.query()
      .where(applyEmployeeFilter)
      .where('status', 'completed')
      .whereNull('deleted_at')
      .whereRaw('DATE(updated_at) = ?', [dateStr])
      .orderBy('updated_at', 'desc')

    // 7. Not Converted Leads
    const todayNotConverted = await TaskManagement.query()
      .where(applyEmployeeFilter)
      .where('lead_date', dateStr)
      .where('status', '!=', 'completed')
      .whereNull('deleted_at')
      .orderBy('created_at', 'desc')

    // 8. NEW: Overdue Follow-Ups (Follow-up date <= dateStr & still in follow_up status & not handled today)
    const overdueFollowUps = await TaskManagement.query()
      .where(applyEmployeeFilter)
      .where('status', 'follow_up')
      .whereNotNull('follow_up_date')
      .where('follow_up_date', '<=', dateStr)
      .whereRaw('(DATE(updated_at) != ? OR updated_at IS NULL)', [dateStr])
      .whereNull('deleted_at')
      .orderBy('follow_up_date', 'asc')

    // 9. NEW: Call Again Not Done (Status call_again & follow_up_date <= dateStr & not dialed/updated today)
    const callAgainNotDone = await TaskManagement.query()
      .where(applyEmployeeFilter)
      .where('status', 'call_again')
      .whereNotNull('follow_up_date')
      .where('follow_up_date', '<=', dateStr)
      .whereRaw('(DATE(updated_at) != ? OR updated_at IS NULL)', [dateStr])
      .whereNull('deleted_at')
      .orderBy('follow_up_date', 'asc')

    let totalPremium = 0
    for (const lead of todayConverted) {
      if (lead.amount) {
        totalPremium += parseFloat(lead.amount.toString())
      }
    }

    return {
      employee: {
        id: employee.id,
        name: employee.name,
        designation: employee.designation || 'Employee'
      },
      reportDate: reportDate.toFormat('dd MMMM yyyy'),
      todayNewLeadsCount: todayNewLeads.length,
      pendingFollowUpsCount: pendingFollowUps.length,
      callAgainCount: callAgainLeads.length,
      followUpCount: followUpLeads.length,
      quoteSentCount: todayLeadsWithQuote.length,
      todayConvertedCount: todayConverted.length,
      notConvertedCount: todayNotConverted.length,
      overdueFollowUpsCount: overdueFollowUps.length,
      callAgainNotDoneCount: callAgainNotDone.length,
      totalPremium,
      newLeads: todayNewLeads,
      pendingFollowUps,
      callAgainLeads,
      followUpLeads,
      todayLeadsWithQuote,
      todayConverted,
      todayNotConverted,
      overdueFollowUps,
      callAgainNotDone
    }
  }

  generateHTMLReport(data: any): string {
    const statusColors: Record<string, string> = {
      'pending': '#ff9800',
      'in_progress': '#2196f3',
      'follow_up': '#9c27b0',
      'call_again': '#ff5722',
      'completed': '#4caf50',
      'not_converted': '#f44336'
    }

    const statusMap: Record<string, string> = {
      'pending': 'Pending',
      'in_progress': 'In Progress',
      'follow_up': 'Follow Up',
      'call_again': 'Call Again',
      'completed': 'Converted',
      'not_converted': 'Not Converted'
    }

    const formatStatus = (status: string) => statusMap[status] || status

    const getStatusBadge = (statusKey: string) => {
      const label = formatStatus(statusKey)
      const color = statusColors[statusKey] || '#666'
      return `<span style="background:${color};color:#fff;padding:2px 8px;border-radius:4px;font-size:8px;font-weight:bold;display:inline-block;">${label}</span>`
    }

    const getPriorityBadge = (priorityKey: string) => {
      const priorityColors: Record<string, string> = {
        'high': '#f44336',
        'normal': '#ff9800',
        'low': '#4caf50'
      }
      const prio = (priorityKey || 'normal').toLowerCase()
      const color = priorityColors[prio] || '#666'
      return `<span style="background:${color};color:#fff;padding:2px 6px;border-radius:3px;font-size:7.5px;font-weight:bold;text-transform:uppercase;">${prio}</span>`
    }

    const formatDate = (dateObj: any, format = 'dd MMM yy') => {
      if (!dateObj) return 'N/A'
      if (typeof dateObj.toFormat === 'function') return dateObj.toFormat(format)
      const parsed = DateTime.fromISO(String(dateObj))
      if (parsed.isValid) return parsed.toFormat(format)
      return dateObj
    }

    return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Daily Report - ${data.employee.name}</title>
<style>
  @page { size: A4; margin: 10mm; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { 
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; 
    color: #2c3e50;
    background: #fff;
    -webkit-print-color-adjust: exact;
  }
  .container { width: 100%; margin: 0 auto; }
  .header-table { width: 100%; border-bottom: 2.5px solid #1a237e; padding-bottom: 8px; margin-bottom: 12px; }
  .company-name { font-size: 20px; font-weight: 800; color: #1a237e; letter-spacing: 0.5px; }
  .company-sub { font-size: 8px; font-weight: 600; color: #666; letter-spacing: 0.3px; }
  .report-badge { background: #e8eaf6; border: 1.5px solid #1a237e; padding: 5px 12px; border-radius: 4px; text-align: right; }
  .report-badge .title { font-size: 11px; font-weight: bold; color: #1a237e; }
  .report-badge .date { font-size: 8.5px; color: #37474f; font-weight: 500; }
  .emp-table { width: 100%; background: #f5f7fa; border: 1px solid #cfd8dc; border-radius: 5px; padding: 8px 12px; margin-bottom: 14px; }
  .emp-name { font-size: 11px; font-weight: bold; color: #1a237e; }
  .emp-detail { font-size: 8.5px; color: #546e7a; margin-top: 2px; }
  .emp-right { text-align: right; font-size: 8.5px; color: #455a64; font-weight: 500; }
  .stats-table { width: 100%; margin-bottom: 16px; border-spacing: 6px 0; border-collapse: separate; }
  .stat-card { background: #ffffff; border: 1px solid #e0e0e0; border-radius: 5px; padding: 8px; text-align: left; vertical-align: top; }
  .stat-card .bar { height: 3px; border-radius: 2px; margin-bottom: 4px; }
  .stat-card .val { font-size: 16px; font-weight: bold; line-height: 1.1; }
  .stat-card .lbl { font-size: 7.5px; font-weight: bold; color: #78909c; margin-top: 3px; }
  .section-title { font-size: 10px; font-weight: bold; color: #1a237e; text-transform: uppercase; letter-spacing: 0.4px; }
  .divider { height: 1px; background: #cfd8dc; margin: 4px 0 8px 0; }
  .table-container { margin-bottom: 14px; page-break-inside: auto; }
  .table-header-tb { width: 100%; margin-bottom: 3px; }
  .badge-count { background: #e8eaf6; color: #1a237e; font-size: 8px; font-weight: bold; padding: 2px 8px; border-radius: 10px; border: 1px solid #c5cae9; }
  .badge-danger { background: #ffebee; color: #c62828; border-color: #ef9a9a; }
  .badge-warning { background: #fff3e0; color: #e65100; border-color: #ffe082; }
  table.data-table { width: 100%; border-collapse: collapse; font-size: 8.5px; }
  table.data-table tr { page-break-inside: avoid; }
  table.data-table th { background: #1a237e; color: #ffffff; padding: 5px 6px; text-align: left; font-size: 7.5px; font-weight: bold; text-transform: uppercase; }
  table.data-table td { padding: 5px 6px; border-bottom: 1px solid #eceff1; color: #37474f; vertical-align: middle; }
  table.data-table tr:nth-child(even) td { background: #f8f9fa; }
  .summary-box { margin-top: 15px; padding-top: 10px; border-top: 2px solid #1a237e; page-break-inside: avoid; }
  .summary-table { width: 90%; margin: 0 auto; font-size: 8.5px; }
  .summary-table td { padding: 4px 8px; }
  .summary-table .lbl { color: #546e7a; font-weight: 500; }
  .summary-table .val { color: #1a237e; font-weight: bold; text-align: right; }
  .footer { margin-top: 15px; padding-top: 8px; border-top: 1px solid #cfd8dc; text-align: center; font-size: 7px; color: #90a4ae; page-break-inside: avoid; }
</style>
</head>
<body>
<div class="container">

  <!-- HEADER -->
  <table class="header-table">
    <tr>
      <td>
        <div class="company-name">DIGIBIMA</div>
        <div class="company-sub">INSURANCE WEB AGGREGATOR PVT LTD</div>
      </td>
      <td style="text-align: right;">
        <div class="report-badge">
          <div class="title">DAILY REPORT</div>
          <div class="date">${data.reportDate}</div>
        </div>
      </td>
    </tr>
  </table>

  <!-- EMPLOYEE INFO -->
  <div class="emp-table">
    <table style="width: 100%;">
      <tr>
        <td>
          <div class="emp-name">👤 ${data.employee.name}</div>
          <div class="emp-detail">ID: ${data.employee.id} &nbsp;|&nbsp; Designation: ${data.employee.designation}</div>
        </td>
        <td class="emp-right">
          <div>📅 ${data.reportDate}</div>
          <div>⏰ ${DateTime.now().toFormat('HH:mm')}</div>
        </td>
      </tr>
    </table>
  </div>

  <!-- STATS CARDS -->
  <table class="stats-table">
    <tr>
      <td class="stat-card" style="width: 16.6%;">
        <div class="bar" style="background:#1976d2;"></div>
        <div class="val" style="color:#1976d2;">${data.todayNewLeadsCount}</div>
        <div class="lbl">NEW LEADS</div>
      </td>
      <td class="stat-card" style="width: 16.6%;">
        <div class="bar" style="background:#f57c00;"></div>
        <div class="val" style="color:#f57c00;">${data.followUpCount}</div>
        <div class="lbl">FOLLOW UPS</div>
      </td>
      <td class="stat-card" style="width: 16.6%;">
        <div class="bar" style="background:#d32f2f;"></div>
        <div class="val" style="color:#d32f2f;">${data.overdueFollowUpsCount}</div>
        <div class="lbl">OVERDUE F/U</div>
      </td>
      <td class="stat-card" style="width: 16.6%;">
        <div class="bar" style="background:#7b1fa2;"></div>
        <div class="val" style="color:#7b1fa2;">${data.callAgainCount}</div>
        <div class="lbl">CALL AGAIN</div>
      </td>
      <td class="stat-card" style="width: 16.6%;">
        <div class="bar" style="background:#e65100;"></div>
        <div class="val" style="color:#e65100;">${data.callAgainNotDoneCount}</div>
        <div class="lbl">CALL NOT DONE</div>
      </td>
      <td class="stat-card" style="width: 16.6%;">
        <div class="bar" style="background:#388e3c;"></div>
        <div class="val" style="color:#388e3c;">${data.todayConvertedCount}</div>
        <div class="lbl">CONVERTED</div>
      </td>
    </tr>
  </table>

  <!-- TABLE 1: TODAY'S NEW ASSIGNED LEADS -->
  <div class="table-container">
    <table class="table-header-tb">
      <tr>
        <td class="section-title">1. Today's New Assigned Leads</td>
        <td style="text-align: right;"><span class="badge-count">Total: ${data.todayNewLeadsCount}</span></td>
      </tr>
    </table>
    <div class="divider"></div>
    <table class="data-table">
      <thead>
        <tr><th>#</th><th>Client</th><th>Contact</th><th>Lead Date</th><th>Type</th><th>Status</th><th>Quote</th></tr>
      </thead>
      <tbody>
        ${data.newLeads && data.newLeads.length > 0 ? data.newLeads.map((lead: any, i: number) => `
          <tr>
            <td>${i + 1}</td>
            <td><b>${lead.clientName || lead.client_name || 'N/A'}</b></td>
            <td>${lead.clientContactNumber || lead.client_contact_number || 'N/A'}</td>
            <td>${formatDate(lead.leadDate || lead.lead_date)}</td>
            <td>${lead.insuranceType || lead.insurance_type || 'N/A'}</td>
            <td>${getStatusBadge(lead.status || 'pending')}</td>
            <td>${lead.quoteShare || lead.quote_share || 'No'}</td>
          </tr>
        `).join('') : '<tr><td colspan="7" style="text-align:center; color:#90a4ae; padding:8px;">No records found</td></tr>'}
      </tbody>
    </table>
  </div>

  <!-- TABLE 2: OVERDUE FOLLOW-UPS -->
  <div class="table-container">
    <table class="table-header-tb">
      <tr>
        <td class="section-title" style="color: #c62828;">⚠️ 2. Overdue Follow-Ups</td>
        <td style="text-align: right;"><span class="badge-count badge-danger">Total Overdue: ${data.overdueFollowUpsCount}</span></td>
      </tr>
    </table>
    <div class="divider" style="background: #ef9a9a;"></div>
    <table class="data-table">
      <thead>
        <tr style="background:#c62828;">
          <th style="background:#c62828;">#</th>
          <th style="background:#c62828;">Client</th>
          <th style="background:#c62828;">Contact</th>
          <th style="background:#c62828;">Due Follow-Up Date</th>
          <th style="background:#c62828;">Insurance Type</th>
          <th style="background:#c62828;">Priority</th>
          <th style="background:#c62828;">Last Remark</th>
        </tr>
      </thead>
      <tbody>
        ${data.overdueFollowUps && data.overdueFollowUps.length > 0 ? data.overdueFollowUps.map((lead: any, i: number) => `
          <tr style="background:#fff8f8;">
            <td>${i + 1}</td>
            <td><b>${lead.clientName || lead.client_name || 'N/A'}</b></td>
            <td>${lead.clientContactNumber || lead.client_contact_number || 'N/A'}</td>
            <td style="color:#d32f2f; font-weight:bold;">${formatDate(lead.followUpDate || lead.follow_up_date)}</td>
            <td>${lead.insuranceType || lead.insurance_type || 'N/A'}</td>
            <td>${getPriorityBadge(lead.priority)}</td>
            <td>${(lead.flowComment || lead.flow_comment || 'N/A').substring(0, 20)}</td>
          </tr>
        `).join('') : '<tr><td colspan="7" style="text-align:center; color:#90a4ae; padding:8px;">No overdue follow-ups</td></tr>'}
      </tbody>
    </table>
  </div>

  <!-- TABLE 3: CALL AGAIN NOT DONE -->
  <div class="table-container">
    <table class="table-header-tb">
      <tr>
        <td class="section-title" style="color: #e65100;">📞 3. Call Again Not Done</td>
        <td style="text-align: right;"><span class="badge-count badge-warning">Pending Calls: ${data.callAgainNotDoneCount}</span></td>
      </tr>
    </table>
    <div class="divider" style="background: #ffe082;"></div>
    <table class="data-table">
      <thead>
        <tr style="background:#ef6c00;">
          <th style="background:#ef6c00;">#</th>
          <th style="background:#ef6c00;">Client</th>
          <th style="background:#ef6c00;">Contact</th>
          <th style="background:#ef6c00;">Scheduled Date</th>
          <th style="background:#ef6c00;">Last Response</th>
          <th style="background:#ef6c00;">Priority</th>
          <th style="background:#ef6c00;">Remark</th>
        </tr>
      </thead>
      <tbody>
        ${data.callAgainNotDone && data.callAgainNotDone.length > 0 ? data.callAgainNotDone.map((lead: any, i: number) => `
          <tr style="background:#fffdf8;">
            <td>${i + 1}</td>
            <td><b>${lead.clientName || lead.client_name || 'N/A'}</b></td>
            <td>${lead.clientContactNumber || lead.client_contact_number || 'N/A'}</td>
            <td style="color:#e65100; font-weight:bold;">${formatDate(lead.followUpDate || lead.follow_up_date)}</td>
            <td>${lead.callResponse || lead.call_response || 'N/A'}</td>
            <td>${getPriorityBadge(lead.priority)}</td>
            <td>${(lead.flowComment || lead.flow_comment || 'N/A').substring(0, 20)}</td>
          </tr>
        `).join('') : '<tr><td colspan="7" style="text-align:center; color:#90a4ae; padding:8px;">No pending call-agains</td></tr>'}
      </tbody>
    </table>
  </div>

  <!-- TABLE 4: TODAY'S FOLLOW-UP LIST -->
  <div class="table-container">
    <table class="table-header-tb">
      <tr>
        <td class="section-title">4. Follow-Up Handled Today</td>
        <td style="text-align: right;"><span class="badge-count">Total: ${data.followUpCount}</span></td>
      </tr>
    </table>
    <div class="divider"></div>
    <table class="data-table">
      <thead>
        <tr><th>#</th><th>Client</th><th>Contact</th><th>Follow-Up Date</th><th>Updated At</th><th>Response</th><th>Type</th></tr>
      </thead>
      <tbody>
        ${data.followUpLeads && data.followUpLeads.length > 0 ? data.followUpLeads.map((lead: any, i: number) => `
          <tr>
            <td>${i + 1}</td>
            <td><b>${lead.clientName || lead.client_name || 'N/A'}</b></td>
            <td>${lead.clientContactNumber || lead.client_contact_number || 'N/A'}</td>
            <td>${formatDate(lead.followUpDate || lead.follow_up_date)}</td>
            <td>${formatDate(lead.updatedAt || lead.updated_at, 'dd MMM HH:mm')}</td>
            <td>${lead.callResponse || lead.call_response || 'N/A'}</td>
            <td>${lead.insuranceType || lead.insurance_type || 'N/A'}</td>
          </tr>
        `).join('') : '<tr><td colspan="7" style="text-align:center; color:#90a4ae; padding:8px;">No records found</td></tr>'}
      </tbody>
    </table>
  </div>

  <!-- TABLE 5: TODAY'S CALL AGAIN LIST -->
  <div class="table-container">
    <table class="table-header-tb">
      <tr>
        <td class="section-title">5. Call Again Handled Today</td>
        <td style="text-align: right;"><span class="badge-count">Total: ${data.callAgainCount}</span></td>
      </tr>
    </table>
    <div class="divider"></div>
    <table class="data-table">
      <thead>
        <tr><th>#</th><th>Client</th><th>Contact</th><th>Updated At</th><th>Follow-Up</th><th>Response</th><th>Remark</th></tr>
      </thead>
      <tbody>
        ${data.callAgainLeads && data.callAgainLeads.length > 0 ? data.callAgainLeads.map((lead: any, i: number) => `
          <tr>
            <td>${i + 1}</td>
            <td><b>${lead.clientName || lead.client_name || 'N/A'}</b></td>
            <td>${lead.clientContactNumber || lead.client_contact_number || 'N/A'}</td>
            <td>${formatDate(lead.updatedAt || lead.updated_at, 'dd MMM HH:mm')}</td>
            <td>${formatDate(lead.followUpDate || lead.follow_up_date)}</td>
            <td>${lead.callResponse || lead.call_response || 'N/A'}</td>
            <td>${(lead.flowComment || lead.flow_comment || 'N/A').substring(0, 15)}</td>
          </tr>
        `).join('') : '<tr><td colspan="7" style="text-align:center; color:#90a4ae; padding:8px;">No records found</td></tr>'}
      </tbody>
    </table>
  </div>

  <!-- TABLE 6: TODAY'S CONVERTED -->
  <div class="table-container">
    <table class="table-header-tb">
      <tr>
        <td class="section-title">6. Today's Converted</td>
        <td style="text-align: right;"><span class="badge-count">Total: ${data.todayConvertedCount}</span></td>
      </tr>
    </table>
    <div class="divider"></div>
    <table class="data-table">
      <thead>
        <tr><th>#</th><th>Client</th><th>Contact</th><th>Lead Date</th><th>Policy</th><th>Premium</th><th>Converted At</th></tr>
      </thead>
      <tbody>
        ${data.todayConverted && data.todayConverted.length > 0 ? data.todayConverted.map((lead: any, i: number) => `
          <tr>
            <td>${i + 1}</td>
            <td><b>${lead.clientName || lead.client_name || 'N/A'}</b></td>
            <td>${lead.clientContactNumber || lead.client_contact_number || 'N/A'}</td>
            <td>${formatDate(lead.leadDate || lead.lead_date)}</td>
            <td>${lead.policyNumber || lead.policy_number || 'N/A'}</td>
            <td>${lead.amount ? `₹${parseFloat(lead.amount.toString()).toLocaleString()}` : 'N/A'}</td>
            <td>${formatDate(lead.updatedAt || lead.updated_at, 'dd MMM HH:mm')}</td>
          </tr>
        `).join('') : '<tr><td colspan="7" style="text-align:center; color:#90a4ae; padding:8px;">No records found</td></tr>'}
      </tbody>
    </table>
  </div>

  <!-- SUMMARY SECTION -->
  <div class="summary-box">
    <div class="section-title" style="text-align: center; margin-bottom: 8px;">📋 PERFORMANCE SUMMARY</div>
    <table class="summary-table">
      <tr>
        <td class="lbl">New Assigned Leads</td><td class="val">${data.todayNewLeadsCount}</td>
        <td class="lbl">Converted Leads</td><td class="val">${data.todayConvertedCount}</td>
      </tr>
      <tr>
        <td class="lbl">Overdue Follow-Ups</td><td class="val" style="color:#d32f2f;">${data.overdueFollowUpsCount}</td>
        <td class="lbl">Call Again Not Done</td><td class="val" style="color:#e65100;">${data.callAgainNotDoneCount}</td>
      </tr>
      <tr>
        <td class="lbl">Follow-Ups Handled</td><td class="val">${data.followUpCount}</td>
        <td class="lbl">Call Agains Handled</td><td class="val">${data.callAgainCount}</td>
      </tr>
      <tr>
        <td class="lbl">Quotes Shared</td><td class="val">${data.quoteSentCount}</td>
        <td class="lbl">Total Premium</td><td class="val">₹${(data.totalPremium || 0).toLocaleString()}</td>
      </tr>
    </table>
  </div>

  <!-- FOOTER -->
  <div class="footer">
    Generated On: ${DateTime.now().toFormat('dd MMM yyyy HH:mm')} | Confidential - Digibima Internal Use Only
  </div>

</div>
</body>
</html>
    `
  }

  async generateDailyReportPDF(employeeId: number, date: string): Promise<Buffer> {
    const data = await this.getDailyReportData(employeeId, date)
    const htmlContent = this.generateHTMLReport(data)

    const browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })

    const context = await browser.newContext()
    const page = await context.newPage()

    await page.setContent(htmlContent, { waitUntil: 'networkidle' })

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '8mm', bottom: '8mm', left: '8mm', right: '8mm' }
    })

    await browser.close()
    return pdfBuffer
  }
}