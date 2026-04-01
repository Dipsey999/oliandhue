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
    const { name, email, phone, requirement, project_details, project_links, budget } = body

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

    const { error } = await supabase.from('project_inquiries').insert({
      name: name.trim(),
      email: email.trim(),
      phone: phone?.trim() || null,
      requirement: requirement || null,
      project_details: project_details?.trim() || null,
      project_links: project_links?.trim() || null,
      budget: budget || null,
    })

    if (error) {
      console.error('Supabase insert error (project_inquiries):', error)
      return NextResponse.json(
        { error: 'Failed to save inquiry' },
        { status: 500, headers: corsHeaders }
      )
    }

    // Fire-and-forget email notification
    sendNotification('inquiry', {
      name: name.trim(), email: email.trim(), phone: phone?.trim(),
      requirement, project_details: project_details?.trim(),
      project_links: project_links?.trim(), budget,
    })

    return NextResponse.json({ success: true }, { headers: corsHeaders })
  } catch (err) {
    console.error('Project inquiry error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    )
  }
}
