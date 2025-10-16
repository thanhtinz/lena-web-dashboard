# Complete Role Management System - Database Schema Design

## Overview
Comprehensive database schema for 4 role management modules:
1. Auto Roles (enhanced with reassign + blacklist)
2. Timed Roles (delayed assignment)
3. Reaction Roles (emoji-based role assignment)
4. Temp Roles (temporary role assignments)

## Module 1: Auto Roles Enhancement

### Existing Table (Enhanced)
```javascript
// auto_roles_config - Already exists, keep current structure
{
  id: serial('id').primaryKey(),
  serverId: text('server_id').notNull().unique(),
  enabled: boolean('enabled').default(false),
  joinRoleIds: jsonb('join_role_ids').default([]),     // Roles to assign on join
  enableReassign: boolean('enable_reassign').default(false),  // NEW: Enable role reassignment
  reactionRoles: jsonb('reaction_roles').default([]),  // Keep for now, will migrate to proper tables
  levelRoles: jsonb('level_roles').default([]),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}
```

### New Tables

#### auto_role_reassign_tracking
Track members who left to restore their roles when they rejoin
```javascript
{
  id: serial('id').primaryKey(),
  serverId: text('server_id').notNull(),
  userId: text('user_id').notNull(),
  roleIds: jsonb('role_ids').notNull(),              // Array of role IDs they had
  leftAt: timestamp('left_at').defaultNow(),
  expiresAt: timestamp('expires_at'),                 // Optional: Auto-cleanup after X days
  UNIQUE(serverId, userId)                            // One entry per user per server
}
```

#### auto_role_blacklist
Prevent specific roles from being reassigned
```javascript
{
  id: serial('id').primaryKey(),
  serverId: text('server_id').notNull(),
  roleId: text('role_id').notNull(),
  reason: text('reason'),                             // Why this role is blacklisted
  addedBy: text('added_by').notNull(),                // Admin who added
  createdAt: timestamp('created_at').defaultNow(),
  UNIQUE(serverId, roleId)                            // One entry per role per server
}
```

## Module 2: Timed Roles

### timed_roles
Define roles that should be assigned after a delay
```javascript
{
  id: serial('id').primaryKey(),
  serverId: text('server_id').notNull(),
  roleId: text('role_id').notNull(),
  delayMinutes: integer('delay_minutes').notNull(),   // Delay in minutes
  enabled: boolean('enabled').default(true),
  createdBy: text('created_by').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  UNIQUE(serverId, roleId)                            // One timed config per role per server
}
```

### timed_role_queue
Track pending timed role assignments
```javascript
{
  id: serial('id').primaryKey(),
  serverId: text('server_id').notNull(),
  userId: text('user_id').notNull(),
  roleId: text('role_id').notNull(),
  timedRoleId: integer('timed_role_id').notNull(),    // FK to timed_roles.id
  scheduledFor: timestamp('scheduled_for').notNull(), // When to assign
  status: text('status').default('pending'),          // pending, completed, cancelled
  processedAt: timestamp('processed_at'),
  createdAt: timestamp('created_at').defaultNow(),
  INDEX(status, scheduledFor)                         // For efficient queue processing
}
```

## Module 3: Reaction Roles (Most Complex)

### reaction_role_messages
Master table for reaction role messages
```javascript
{
  id: serial('id').primaryKey(),
  serverId: text('server_id').notNull(),
  channelId: text('channel_id').notNull(),
  messageId: text('message_id').notNull().unique(),   // Discord message ID
  messageType: text('message_type').default('normal'), // normal, unique, verify, temp
  maxRolesPerUser: integer('max_roles_per_user'),     // Optional: Max roles user can have from this message
  selfDestruct: boolean('self_destruct').default(false), // Remove reaction after role assignment
  enabled: boolean('enabled').default(true),
  createdBy: text('created_by').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  UNIQUE(serverId, messageId)
}
```

### reaction_role_options
Emoji -> Role mappings for each message
```javascript
{
  id: serial('id').primaryKey(),
  messageConfigId: integer('message_config_id').notNull(), // FK to reaction_role_messages.id
  serverId: text('server_id').notNull(),
  emoji: text('emoji').notNull(),                     // Unicode emoji or custom emoji ID
  roleId: text('role_id').notNull(),
  maxAssignments: integer('max_assignments'),         // Optional: Limit how many users can get this role
  currentAssignments: integer('current_assignments').default(0),
  tempDurationMinutes: integer('temp_duration_minutes'), // For temp reaction roles
  createdAt: timestamp('created_at').defaultNow(),
  UNIQUE(messageConfigId, emoji)                      // One role per emoji per message
}
```

### reaction_role_groups
Link multiple emojis together for "unique" or "limit" constraints
```javascript
{
  id: serial('id').primaryKey(),
  serverId: text('server_id').notNull(),
  messageConfigId: integer('message_config_id').notNull(),
  groupName: text('group_name').notNull(),
  groupType: text('group_type').default('unique'),    // unique (only 1), limit (max X)
  maxRoles: integer('max_roles').default(1),          // For limit type
  emojiIds: jsonb('emoji_ids').notNull(),             // Array of emoji strings in this group
  createdAt: timestamp('created_at').defaultNow(),
  UNIQUE(serverId, messageConfigId, groupName)
}
```

### reaction_role_whitelist
Whitelist specific roles that can react (optional per message)
```javascript
{
  id: serial('id').primaryKey(),
  messageConfigId: integer('message_config_id').notNull(),
  serverId: text('server_id').notNull(),
  roleId: text('role_id').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  UNIQUE(messageConfigId, roleId)
}
```

### reaction_role_blacklist
Blacklist specific roles from reacting (optional per message)
```javascript
{
  id: serial('id').primaryKey(),
  messageConfigId: integer('message_config_id').notNull(),
  serverId: text('server_id').notNull(),
  roleId: text('role_id').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  UNIQUE(messageConfigId, roleId)
}
```

### reaction_role_assignments
Track who has which reaction roles (for analytics + cleanup)
```javascript
{
  id: serial('id').primaryKey(),
  serverId: text('server_id').notNull(),
  userId: text('user_id').notNull(),
  messageConfigId: integer('message_config_id').notNull(),
  optionId: integer('option_id').notNull(),           // FK to reaction_role_options.id
  roleId: text('role_id').notNull(),
  assignedAt: timestamp('assigned_at').defaultNow(),
  expiresAt: timestamp('expires_at'),                 // For temp reaction roles
  INDEX(serverId, userId),
  INDEX(expiresAt)                                    // For cleanup job
}
```

## Module 4: Temp Roles

### temp_roles
Temporary role assignments with auto-removal
```javascript
{
  id: serial('id').primaryKey(),
  serverId: text('server_id').notNull(),
  userId: text('user_id').notNull(),
  roleId: text('role_id').notNull(),
  durationMinutes: integer('duration_minutes').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  reason: text('reason'),
  assignedBy: text('assigned_by').notNull(),
  status: text('status').default('active'),           // active, expired, removed
  removedAt: timestamp('removed_at'),
  createdAt: timestamp('created_at').defaultNow(),
  INDEX(status, expiresAt)                            // For cleanup scheduler
}
```

## Cross-Module: Audit Logs

### role_audit_logs
Comprehensive audit trail for all role operations
```javascript
{
  id: serial('id').primaryKey(),
  serverId: text('server_id').notNull(),
  userId: text('user_id'),                            // Target user (null for config changes)
  roleId: text('role_id'),                            // Role affected
  action: text('action').notNull(),                   // add, remove, create, delete, update_config
  module: text('module').notNull(),                   // auto_roles, timed_roles, reaction_roles, temp_roles, role_management
  details: jsonb('details'),                          // Additional context
  performedBy: text('performed_by').notNull(),        // Who did it (user or bot)
  timestamp: timestamp('timestamp').defaultNow(),
  INDEX(serverId, timestamp),
  INDEX(userId)
}
```

## Implementation Notes

### Database Files
- **Bot**: `database/schema.js` - Add all new tables, enhance existing autoRolesConfig
- **Web**: `web/lib/schema.ts` - Mirror same structure for TypeScript

### Migration Strategy
1. Add new tables without touching existing data
2. Add new fields to `auto_roles_config` (enableReassign)
3. Keep existing `reactionRoles` JSONB field for backward compatibility
4. Use `npm run db:push --force` to sync schema safely

### Indexing Strategy
- Index foreign keys for joins
- Index (serverId, userId) combinations for fast lookups
- Index timestamp fields for cleanup jobs
- Index status fields for queue processing

### Premium Gating
Use existing `pricingPlans.allowedFeatures` to gate:
- `role_reaction_roles` - Reaction roles feature
- `role_timed_roles` - Timed roles feature
- `role_temp_roles` - Temp roles feature
- `role_advanced_management` - Bulk operations, custom commands

### Cleanup Jobs
Scheduled tasks needed:
1. **Timed Role Processor**: Check `timed_role_queue` every minute
2. **Temp Role Cleanup**: Check `temp_roles` and `reaction_role_assignments` for expired entries
3. **Reassign Tracking Cleanup**: Remove old reassign tracking entries (e.g., >30 days)
