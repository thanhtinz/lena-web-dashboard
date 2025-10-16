import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { settings } from '@/lib/schema';
import { eq, sql } from 'drizzle-orm';

/**
 * SECURITY NOTE: Admin routes currently have NO authentication for development.
 * See /api/admin/pricing/plans/route.ts for security requirements.
 */

// GET settings - NO AUTH for development
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ 
      error: 'Admin panel not available in production without proper authentication' 
    }, { status: 403 });
  }

  try {
    const result = await db.select().from(settings).limit(1);
    
    if (result.length > 0) {
      return NextResponse.json(result[0]);
    }
    
    // Return default settings
    return NextResponse.json({
      siteName: 'Lena Bot',
      siteDescription: 'Discord AI Bot with multi-personality system',
      supportServerUrl: '',
      defaultPrefix: '!',
      defaultPersonality: 'Lena (Default)',
      statusMessages: '',
      topggToken: '',
      topggWebhookAuth: '',
      topggAutoPost: false,
      rateLimit: 10,
      maxConversationHistory: 20,
      maintenanceMode: false,
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

// POST update settings - NO AUTH for development
export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ 
      error: 'Admin panel not available in production without proper authentication' 
    }, { status: 403 });
  }

  try {
    const body = await request.json();
    
    const settingsData: any = {
      siteName: body.siteName || 'Lena Bot',
      siteDescription: body.siteDescription || '',
      supportServerUrl: body.supportServerUrl || '',
      defaultPrefix: body.defaultPrefix || '!',
      defaultPersonality: body.defaultPersonality || 'Lena (Default)',
      statusMessages: body.statusMessages || '',
      topggToken: body.topggToken || '',
      topggWebhookAuth: body.topggWebhookAuth || '',
      topggAutoPost: body.topggAutoPost || false,
      rateLimit: body.rateLimit || 10,
      maxConversationHistory: body.maxConversationHistory || 20,
      maintenanceMode: body.maintenanceMode || false,
      updatedAt: new Date(),
    };

    // Check if settings exist
    const existing = await db.select().from(settings).limit(1);
    
    if (existing.length > 0) {
      // Update existing settings
      await db
        .update(settings)
        .set(settingsData)
        .where(eq(settings.id, existing[0].id));
    } else {
      // Create new settings
      await db.insert(settings).values(settingsData);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Settings saved successfully' 
    });
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
