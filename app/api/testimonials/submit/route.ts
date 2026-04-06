import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

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
    const { client_name, client_email, client_role, company, content, rating } = body

    if (!client_name || typeof client_name !== 'string' || !client_name.trim()) {
      return NextResponse.json(
        { error: 'Client name is required' },
        { status: 400, headers: corsHeaders }
      )
    }

    if (!client_email || typeof client_email !== 'string' || !client_email.trim()) {
      return NextResponse.json(
        { error: 'Client email is required' },
        { status: 400, headers: corsHeaders }
      )
    }

    const supabase = createAdminClient()

    const { error } = await supabase.from('testimonial_submissions').insert({
      client_name: client_name.trim(),
      client_email: client_email.trim(),
      client_role: client_role?.trim() || null,
      company: company?.trim() || null,
      content: content?.trim() || null,
      rating: typeof rating === 'number' ? rating : 5,
      status: 'pending',
    })

    if (error) {
      console.error('Supabase insert error (testimonial_submissions):', error)
      return NextResponse.json(
        { error: 'Failed to save submission' },
        { status: 500, headers: corsHeaders }
      )
    }

    return NextResponse.json({ success: true }, { headers: corsHeaders })
  } catch (err) {
    console.error('Testimonial submission error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    )
  }
}
