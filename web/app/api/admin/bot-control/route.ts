import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/admin-auth';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET(request: NextRequest) {
  const adminId = await verifyAdmin(request);
  if (!adminId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Check bot process status
    const { stdout } = await execAsync('ps aux | grep "node index.js" | grep -v grep || echo "not_running"');
    
    const isRunning = !stdout.includes('not_running');
    const processInfo = isRunning ? stdout.trim().split('\n')[0] : null;

    // Get bot uptime if running
    let uptime = null;
    if (isRunning && processInfo) {
      const parts = processInfo.split(/\s+/);
      const timeIndex = parts.findIndex(p => p.includes(':'));
      if (timeIndex > 0) {
        uptime = parts[timeIndex];
      }
    }

    return NextResponse.json({
      status: isRunning ? 'online' : 'offline',
      uptime: uptime,
      processInfo: isRunning ? 'Bot is running' : 'Bot is offline',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to get bot status:', error);
    return NextResponse.json({ 
      error: 'Failed to get bot status',
      status: 'unknown' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const adminId = await verifyAdmin(request);
  if (!adminId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { action } = await request.json();

    switch (action) {
      case 'restart':
        // Restart bot by killing process and relying on workflow auto-restart
        try {
          // Kill existing process to trigger workflow auto-restart
          await execAsync('pkill -f "node index.js" || true');
          
          // Wait for process to terminate
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Poll to check if bot restarted (workflow auto-restart feature)
          // Note: start.sh runs npm install which can take >10s on first run
          let attempts = 0;
          const maxAttempts = 15; // 15 attempts * 1s = 15s max wait
          let botStarted = false;
          
          while (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const { stdout: checkOutput } = await execAsync('ps aux | grep "node index.js" | grep -v grep || echo "not_running"');
            
            if (!checkOutput.includes('not_running')) {
              botStarted = true;
              break;
            }
            
            attempts++;
          }
          
          if (!botStarted) {
            // Bot may still be installing dependencies or starting up
            return NextResponse.json({ 
              success: false, 
              message: 'Bot đã dừng. Workflow đang restart (có thể mất 30-60s nếu đang cài dependencies). Vui lòng kiểm tra tab "Discord Bot" workflow trong Replit để xem chi tiết.' 
            }, { status: 202 }); // 202 Accepted - processing
          }
          
          return NextResponse.json({ 
            success: true, 
            message: 'Bot đã được khởi động lại thành công!',
            status: 'online'
          });
        } catch (error: any) {
          console.error('Restart error:', error);
          return NextResponse.json({ 
            success: false, 
            message: error?.message || 'Lỗi khi restart bot. Vui lòng kiểm tra workflow trong Replit.' 
          }, { status: 500 });
        }

      case 'stop':
        // Stop bot process (note: workflow will auto-restart unless disabled)
        try {
          await execAsync('pkill -f "node index.js" || true');
          return NextResponse.json({ 
            success: true, 
            message: '⚠️ Bot process đã dừng. Lưu ý: Workflow "Discord Bot" sẽ tự động restart bot sau vài giây. Để dừng hoàn toàn, vui lòng dừng workflow trong Replit.',
            status: 'stopped',
            warning: 'Workflow auto-restart is enabled. Bot will come back online automatically.'
          });
        } catch (error) {
          console.error('Stop error:', error);
          return NextResponse.json({ 
            success: false, 
            message: 'Không thể dừng bot' 
          }, { status: 500 });
        }

      case 'status':
        // Get detailed status
        const { stdout } = await execAsync('ps aux | grep "node index.js" | grep -v grep || echo "not_running"');
        const isRunning = !stdout.includes('not_running');
        
        return NextResponse.json({
          success: true,
          status: isRunning ? 'online' : 'offline',
          message: isRunning ? 'Bot đang hoạt động' : 'Bot đang offline'
        });

      default:
        return NextResponse.json({ 
          error: 'Invalid action. Use: restart, stop, or status' 
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Bot control error:', error);
    return NextResponse.json({ 
      error: 'Failed to control bot' 
    }, { status: 500 });
  }
}
