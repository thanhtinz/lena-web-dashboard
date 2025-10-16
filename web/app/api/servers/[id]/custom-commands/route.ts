import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { customCommands } from '@/lib/schema';
import { eq, and, desc } from 'drizzle-orm';
import { verifySession } from '@/lib/session';

// GET - List all custom commands for a server
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = verifySession(sessionCookie.value);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hasAccess = user.guilds?.some((g: any) => g.id === id);

    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const commands = await db
      .select()
      .from(customCommands)
      .where(eq(customCommands.serverId, id))
      .orderBy(desc(customCommands.createdAt));

    return NextResponse.json({ commands });
  } catch (error) {
    console.error('Error fetching custom commands:', error);
    return NextResponse.json(
      { error: 'Failed to fetch custom commands' },
      { status: 500 }
    );
  }
}

// POST - Create new custom command
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = verifySession(sessionCookie.value);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hasAccess = user.guilds?.some((g: any) => g.id === id);

    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.commandName) {
      return NextResponse.json(
        { error: 'Command name is required' },
        { status: 400 }
      );
    }

    // Validate command name (no spaces, lowercase, alphanumeric)
    const commandNameRegex = /^[a-z0-9_-]+$/;
    if (!commandNameRegex.test(body.commandName)) {
      return NextResponse.json(
        { error: 'Command name must be lowercase alphanumeric (can include _ and -)' },
        { status: 400 }
      );
    }

    // Check if command already exists in this server
    const existing = await db
      .select()
      .from(customCommands)
      .where(
        and(
          eq(customCommands.serverId, id),
          eq(customCommands.commandName, body.commandName)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'A command with this name already exists in this server' },
        { status: 409 }
      );
    }

    // Create command
    const [newCommand] = await db
      .insert(customCommands)
      .values({
        serverId: id,
        commandName: body.commandName,
        description: body.description || null,
        response: body.response || null,
        
        // Basic Options
        enabled: body.enabled ?? true,
        deleteCommand: body.deleteCommand ?? false,
        silentCommand: body.silentCommand ?? false,
        dmResponse: body.dmResponse ?? false,
        disableMentions: body.disableMentions ?? false,
        
        // Permissions
        allowedRoles: body.allowedRoles || [],
        ignoredRoles: body.ignoredRoles || [],
        allowedChannels: body.allowedChannels || [],
        ignoredChannels: body.ignoredChannels || [],
        responseChannel: body.responseChannel || null,
        
        // Advanced Options
        cooldownSeconds: body.cooldownSeconds ?? 0,
        deleteAfter: body.deleteAfter ?? 0,
        requiredArguments: body.requiredArguments ?? 0,
        
        // Additional Responses & Embeds
        additionalResponses: body.additionalResponses || [],
        embedConfig: body.embedConfig || null,
        
        // Meta
        isPremium: body.isPremium ?? true,
        createdBy: user.id,
      })
      .returning();

    return NextResponse.json({ command: newCommand }, { status: 201 });
  } catch (error) {
    console.error('Error creating custom command:', error);
    return NextResponse.json(
      { error: 'Failed to create custom command' },
      { status: 500 }
    );
  }
}

// PATCH - Update existing custom command
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = verifySession(sessionCookie.value);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hasAccess = user.guilds?.some((g: any) => g.id === id);

    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { error: 'Command ID is required' },
        { status: 400 }
      );
    }

    // Validate commandName if being updated
    if (body.commandName !== undefined) {
      const commandNameRegex = /^[a-z0-9_-]+$/;
      if (!commandNameRegex.test(body.commandName)) {
        return NextResponse.json(
          { error: 'Command name must be lowercase alphanumeric (can include _ and -)' },
          { status: 400 }
        );
      }

      const existing = await db
        .select()
        .from(customCommands)
        .where(
          and(
            eq(customCommands.serverId, id),
            eq(customCommands.commandName, body.commandName)
          )
        )
        .limit(1);

      if (existing.length > 0 && existing[0].id !== body.id) {
        return NextResponse.json(
          { error: 'A command with this name already exists in this server' },
          { status: 409 }
        );
      }
    }

    // Build update object
    const updateData: any = {
      updatedAt: new Date(),
    };

    // Update all provided fields
    if (body.commandName !== undefined) updateData.commandName = body.commandName;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.response !== undefined) updateData.response = body.response;
    
    // Basic Options
    if (body.enabled !== undefined) updateData.enabled = body.enabled;
    if (body.deleteCommand !== undefined) updateData.deleteCommand = body.deleteCommand;
    if (body.silentCommand !== undefined) updateData.silentCommand = body.silentCommand;
    if (body.dmResponse !== undefined) updateData.dmResponse = body.dmResponse;
    if (body.disableMentions !== undefined) updateData.disableMentions = body.disableMentions;
    
    // Permissions
    if (body.allowedRoles !== undefined) updateData.allowedRoles = body.allowedRoles;
    if (body.ignoredRoles !== undefined) updateData.ignoredRoles = body.ignoredRoles;
    if (body.allowedChannels !== undefined) updateData.allowedChannels = body.allowedChannels;
    if (body.ignoredChannels !== undefined) updateData.ignoredChannels = body.ignoredChannels;
    if (body.responseChannel !== undefined) updateData.responseChannel = body.responseChannel;
    
    // Advanced Options
    if (body.cooldownSeconds !== undefined) updateData.cooldownSeconds = body.cooldownSeconds;
    if (body.deleteAfter !== undefined) updateData.deleteAfter = body.deleteAfter;
    if (body.requiredArguments !== undefined) updateData.requiredArguments = body.requiredArguments;
    
    // Additional Responses & Embeds
    if (body.additionalResponses !== undefined) updateData.additionalResponses = body.additionalResponses;
    if (body.embedConfig !== undefined) updateData.embedConfig = body.embedConfig;

    const [updatedCommand] = await db
      .update(customCommands)
      .set(updateData)
      .where(
        and(
          eq(customCommands.serverId, id),
          eq(customCommands.id, body.id)
        )
      )
      .returning();

    if (!updatedCommand) {
      return NextResponse.json(
        { error: 'Command not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ command: updatedCommand });
  } catch (error) {
    console.error('Error updating custom command:', error);
    return NextResponse.json(
      { error: 'Failed to update custom command' },
      { status: 500 }
    );
  }
}

// DELETE - Delete custom command
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = verifySession(sessionCookie.value);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hasAccess = user.guilds?.some((g: any) => g.id === id);

    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const commandId = searchParams.get('commandId');

    if (!commandId) {
      return NextResponse.json(
        { error: 'Command ID is required' },
        { status: 400 }
      );
    }

    await db
      .delete(customCommands)
      .where(
        and(
          eq(customCommands.serverId, id),
          eq(customCommands.id, parseInt(commandId))
        )
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting custom command:', error);
    return NextResponse.json(
      { error: 'Failed to delete custom command' },
      { status: 500 }
    );
  }
}
