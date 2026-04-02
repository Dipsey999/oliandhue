import { Resend } from 'resend'
import { createAdminClient } from '@/lib/supabase/admin'

const resend = new Resend(process.env.RESEND_API_KEY)

type NotificationType = 'submission' | 'inquiry' | 'subscriber'

interface SubmissionData {
  name: string
  email: string
  phone?: string
  requirement?: string
  message?: string
}

interface InquiryData {
  name: string
  email: string
  phone?: string
  requirement?: string
  project_details?: string
  project_links?: string
  budget?: string
}

interface SubscriberData {
  email: string
  source?: string
}

/**
 * Send email notifications to all configured recipients.
 * Fire-and-forget — errors are logged but don't block the caller.
 */
export async function sendNotification(
  type: NotificationType,
  data: SubmissionData | InquiryData | SubscriberData
) {
  try {
    const supabase = createAdminClient()

    // Fetch notification preferences
    const { data: notifSetting } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'notifications')
      .single()

    const prefs = (notifSetting?.value ?? {}) as Record<string, boolean>

    // Check if this notification type is enabled
    const prefKey = {
      submission: 'email_on_submission',
      inquiry: 'email_on_inquiry',
      subscriber: 'email_on_subscriber',
    }[type]

    if (!prefs[prefKey]) return // notification disabled

    // Fetch recipient emails
    const { data: emailsSetting } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'notification_emails')
      .single()

    const emails = ((emailsSetting?.value as Record<string, string[]>)?.emails ?? []) as string[]
    if (emails.length === 0) return // no recipients

    // Build email content
    const { subject, html } = buildEmail(type, data)

    // Send to all recipients
    await resend.emails.send({
      from: 'Oli & Hue <notifications@oliandhue.com>',
      to: emails,
      subject,
      html,
    })
  } catch (err) {
    console.error('[email notification error]', err)
    // Don't throw — notifications shouldn't break the form submission
  }
}

function buildEmail(
  type: NotificationType,
  data: SubmissionData | InquiryData | SubscriberData
): { subject: string; html: string } {
  switch (type) {
    case 'submission': {
      const d = data as SubmissionData
      return {
        subject: `New Contact Submission from ${d.name}`,
        html: emailTemplate('New Contact Submission', [
          { label: 'Name', value: d.name },
          { label: 'Email', value: d.email },
          { label: 'Phone', value: d.phone || '—' },
          { label: 'Requirements', value: d.requirement || '—' },
          { label: 'Message', value: d.message || '—' },
        ]),
      }
    }
    case 'inquiry': {
      const d = data as InquiryData
      const reqLabels: Record<string, string> = {
        product_design: 'Product Design',
        website: 'Website',
        branding: 'Branding',
      }
      return {
        subject: `New Project Inquiry from ${d.name}`,
        html: emailTemplate('New Project Inquiry', [
          { label: 'Name', value: d.name },
          { label: 'Email', value: d.email },
          { label: 'Phone', value: d.phone || '—' },
          { label: 'Requirement', value: reqLabels[d.requirement || ''] || d.requirement || '—' },
          { label: 'Budget', value: d.budget || '—' },
          { label: 'Project Details', value: d.project_details || '—' },
          { label: 'Project Links', value: d.project_links || '—' },
        ]),
      }
    }
    case 'subscriber': {
      const d = data as SubscriberData
      return {
        subject: `New Newsletter Subscriber: ${d.email}`,
        html: emailTemplate('New Newsletter Subscriber', [
          { label: 'Email', value: d.email },
          { label: 'Source Page', value: d.source || '—' },
        ]),
      }
    }
  }
}

function emailTemplate(
  title: string,
  fields: { label: string; value: string }[]
): string {
  const rows = fields
    .map(
      (f) => `
        <tr>
          <td style="padding:8px 12px;color:#999;font-size:13px;white-space:nowrap;vertical-align:top;">${f.label}</td>
          <td style="padding:8px 12px;color:#fff;font-size:13px;">${escapeHtml(f.value)}</td>
        </tr>`
    )
    .join('')

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px;">
    <div style="margin-bottom:24px;">
      <span style="font-size:18px;font-weight:700;color:#fff;">Oli & Hue</span>
      <span style="font-size:12px;color:#666;margin-left:8px;">Notification</span>
    </div>
    <div style="background:#161616;border:1px solid #222;border-radius:12px;padding:24px;margin-bottom:20px;">
      <h2 style="margin:0 0 16px;font-size:16px;font-weight:600;color:#fff;">${escapeHtml(title)}</h2>
      <table style="width:100%;border-collapse:collapse;">
        ${rows}
      </table>
    </div>
    <div style="text-align:center;">
      <a href="https://www.oliandhue.com/admin/dashboard" style="display:inline-block;padding:10px 24px;background:#fff;color:#000;text-decoration:none;border-radius:8px;font-size:13px;font-weight:600;">View in Admin Panel</a>
    </div>
    <p style="text-align:center;font-size:11px;color:#555;margin-top:24px;">
      You received this because you're a notification recipient for Oli & Hue.
    </p>
  </div>
</body>
</html>`
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/\n/g, '<br>')
}
