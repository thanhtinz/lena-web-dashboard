# Hướng dẫn Setup Discord OAuth2

Để users có thể đăng nhập vào Web Dashboard, bạn cần setup Discord OAuth2 credentials.

## Bước 1: Tạo OAuth2 Application

1. Truy cập [Discord Developer Portal](https://discord.com/developers/applications)
2. Chọn bot application của bạn
3. Vào tab **OAuth2** → **General**

## Bước 2: Lấy Credentials

### Client ID
- Copy **Client ID** từ trang OAuth2 General
- Dán vào Replit Secret: `DISCORD_CLIENT_ID`

### Client Secret
- Click nút **Reset Secret** (hoặc **Copy** nếu chưa reset)
- Copy **Client Secret**
- Dán vào Replit Secret: `DISCORD_CLIENT_SECRET`

## Bước 3: Lấy Replit URL

**Cách 1: Từ Environment Variable**
```bash
env | grep REPLIT_DEV_DOMAIN
```
Output: `REPLIT_DEV_DOMAIN=619fca9a-95f6-4d1b-8426-85aa221d3936-00-fwigizn1b7ct.picard.replit.dev`

**URL của project này:**
```
https://619fca9a-95f6-4d1b-8426-85aa221d3936-00-fwigizn1b7ct.picard.replit.dev
```

**Cách 2: Từ Webview**
- Nhìn vào thanh address bar của Webview/Browser trong Replit
- URL có dạng: `https://[random-id].replit.dev`

## Bước 4: Thêm Redirect URL vào Discord

1. Trong phần **Redirects**, click **Add Redirect**
2. Nhập URL: 
   ```
   https://619fca9a-95f6-4d1b-8426-85aa221d3936-00-fwigizn1b7ct.picard.replit.dev/api/auth/callback
   ```
3. Click **Save Changes**

## Bước 5: Hoàn tất

✅ Xong! Không cần thêm secret nào nữa vì hệ thống tự động lấy URL từ `REPLIT_DEV_DOMAIN`

## Kiểm tra

Sau khi setup xong, restart workflow **Web Dashboard** và truy cập:
- Landing page: `https://[YOUR_REPLIT_URL]`
- Click nút **Dashboard** để test login
- Bạn sẽ được redirect đến Discord để authorize
- Sau khi authorize, sẽ redirect về dashboard với danh sách servers

## Scopes được sử dụng

- `identify`: Lấy thông tin user (username, avatar)
- `guilds`: Lấy danh sách servers mà user là admin

## Troubleshooting

### Lỗi "Discord not configured"
- Kiểm tra secret `DISCORD_CLIENT_ID` đã được thêm chưa

### Lỗi "token_failed"
- Kiểm tra secret `DISCORD_CLIENT_SECRET` có đúng không
- Đảm bảo Redirect URL đã được thêm vào Discord OAuth2 settings

### Lỗi "Forbidden" khi vào server config
- Đảm bảo user có quyền "Administrator" hoặc "Manage Server" trong Discord server đó
