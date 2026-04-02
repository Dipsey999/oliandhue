import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendNotification } from '@/lib/email'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return NextResponse.json(null, { status: 204, headers: corsHeaders })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, requirement, message, checkbox_newsletter } = body

    // Validate required fields
    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400, headers: corsHeaders }
      )
    }

    if (!email || typeof email !== 'string' || !email.trim()) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400, headers: corsHeaders }
      )
    }

    const supabase = createAdminClient()

    const insertData: Record<string, unknown> = {
      name: name.trim(),
      email: email.trim(),
      phone: phone?.trim() || null,
      message: message?.trim() || null,
      checkbox_newsletter: !!checkbox_newsletter,
    }
    // Only include requirement if it has a value (column may not exist yet)
    if (requirement?.trim()) {
      insertData.requirement = requirement.trim()
    }

    const { error } = await supabase.from('contact_submissions').insert(insertData)

    if (error) {
      console.error('Supabase insert error (contact_submissions):', error)
      return NextResponse.json(
        { error: 'Failed to save submission' },
        { status: 500, headers: corsHeaders }
      )
    }

    // Fire-and-forget email notification
    sendNotification('submission', { name: name.trim(), email: email.trim(), phone: phone?.trim(), requirement: requirement?.trim(), message: message?.trim() })

    return NextResponse.json({ success: true }, { headers: corsHeaders })
  } catch (err) {
    console.error('Contact submission error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    )
  }
}
