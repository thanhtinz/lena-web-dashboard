# 🎮 GAME INFO SYSTEM - HỆ THỐNG THÔNG TIN GAME

## 🌟 Tổng quan

Lena có thể cung cấp thông tin real-time về các tựa game mobile và PC toàn cầu! Bao gồm builds, combos, guides, tier lists, và nhiều hơn nữa.

- ✅ **23 tựa game phổ biến** - Mobile Legends, LoL, Valorant, Genshin, và nhiều game khác
- ✅ **8 loại thông tin** - Build, Combo, Guide, Tier List, Counter, Tips, Update, Strategy
- ✅ **Tự động nhận diện** - Không cần lệnh đặc biệt
- ✅ **Real-time Updates** - Thông tin luôn mới nhất từ web search
- ✅ **Cute Responses** - Trả lời với phong cách Lena

## 🚀 Cách sử dụng

### Không cần lệnh!

Chỉ cần nói tự nhiên với Lena về game bạn muốn tìm hiểu:

#### 🎯 Hỏi về Build
```
"Lena ơi, build Hayabusa Mobile Legends"
"Cho mình xem build Yasuo LoL"
"Trang bị Jett Valorant"
"Genshin build Raiden Shogun"
```

#### 💥 Hỏi về Combo
```
"Combo skill Fanny MLBB"
"Combo Yasuo League"
"Valorant Jett combo"
"Cách đánh combo Lancelot"
```

#### 📚 Hỏi về Guide/Hướng dẫn
```
"Hướng dẫn chơi Wanwan"
"Guide Zed LoL"
"Cách chơi Sage Valorant"
"Tutorial Zhongli Genshin"
```

#### 📊 Hỏi về Tier List/Meta
```
"Tier list MLBB mới nhất"
"LoL meta 2025"
"Best agents Valorant"
"Top hero Mobile Legends"
```

#### 🛡️ Hỏi về Counter
```
"Counter Hayabusa MLBB"
"Cách chống Yasuo"
"Counter pick Jett"
"Khắc chế Fanny"
```

#### 💡 Hỏi về Tips & Tricks
```
"Tips chơi Lancelot"
"Mẹo Valorant"
"Tricks LoL"
"Bí kíp Mobile Legends"
```

#### 🆕 Hỏi về Update/Patch
```
"MLBB update mới"
"LoL patch notes"
"Valorant buff nerf"
"Cập nhật Genshin"
```

## 🎮 Danh sách Game (23 tựa)

### 🔥 MOBA Games
1. **Mobile Legends: Bang Bang** (MLBB, ML)
2. **League of Legends** (LoL, Liên Minh Huyền Thoại)
3. **Dota 2**
4. **League of Legends: Wild Rift** (Liên Quân Mobile)
5. **Arena of Valor** (AoV, Liên Quân)

### 🎯 Shooter Games
6. **Valorant** (Val)
7. **Counter-Strike 2** (CS2, CSGO)
8. **Overwatch 2** (OW2)
9. **Apex Legends**
10. **Call of Duty Mobile** (CODM)
11. **PUBG Mobile**
12. **Free Fire** (FF)

### ⚔️ Battle Royale & Action
13. **Fortnite** (FN)

### 🌟 RPG & Gacha Games
14. **Genshin Impact** (GI)
15. **Honkai Star Rail** (HSR)
16. **Wuthering Waves** (WuWa)
17. **Zenless Zone Zero** (ZZZ)

### 🃏 Strategy & Card Games
18. **Clash Royale** (CR)
19. **Brawl Stars** (BS)
20. **Clash of Clans** (CoC)

### 🗡️ ARPG Games
21. **Diablo 4** (D4)
22. **Path of Exile** (PoE)
23. **Lost Ark**

## 📋 Loại thông tin (8 types)

### 1. **Build** (Priority 10)
- Trang bị, đồ, items, gear
- Keywords: `build`, `đồ`, `trang bị`, `item`, `lên đồ`

### 2. **Combo** (Priority 10)
- Combo skill, kỹ năng
- Keywords: `combo`, `skill`, `kỹ năng`, `chiêu`, `đánh combo`

### 3. **Guide** (Priority 9)
- Hướng dẫn, cách chơi, tutorial
- Keywords: `guide`, `hướng dẫn`, `cách chơi`, `tutorial`, `how to`

### 4. **Tier List** (Priority 9)
- Meta, ranking, top picks
- Keywords: `tier list`, `tier`, `rank`, `best`, `top`, `meta`, `mạnh nhất`

### 5. **Counter** (Priority 8)
- Counter pick, chống, khắc chế
- Keywords: `counter`, `chống`, `khắc chế`, `đối đầu`, `anti`

### 6. **Tips & Tricks** (Priority 8)
- Mẹo, bí kíp, chiến thuật
- Keywords: `tips`, `tricks`, `mẹo`, `bí kíp`, `pro tips`

### 7. **Update** (Priority 7)
- Patch notes, buff/nerf, changes
- Keywords: `update`, `patch`, `new`, `mới`, `cập nhật`, `buff`, `nerf`

### 8. **Strategy** (Priority 7)
- Chiến thuật, lối chơi, tactic
- Keywords: `strategy`, `chiến thuật`, `tactic`, `playstyle`

## 🎨 Response Format

### Standard Response
```
🎮 Ư-ừm... mình tìm được thông tin game rồi!

**Mobile Legends: Bang Bang - Hayabusa - Build Guide**

[Thông tin build chi tiết từ web search]
- Core Items: Hunter Strike, Blade of Despair, Malefic Roar
- Emblem: Assassin với movement speed
- Combo: Shadow → Ultimate → Basic attacks → Escape

Chúc bạn chơi game vui vẻ! 🎮✨
```

### With Entity Name
```
🎮 Ehehe~ mình có thông tin về game này!

**League of Legends - Yasuo - Combo Guide**

[Chi tiết combo Yasuo]
E → Q → Flash → R combo for surprise engage
Tornado setup: E through minions → Q for stack
...

Good luck trên con đường leo rank! 🚀
```

### Error Response
```
🎮 Ư-ừm... không tìm được thông tin về Mobile Legends... 🥺
(hoặc)
🎮 À... à... có lỗi rồi, bạn thử lại sau nhé! 😢
```

## 🔧 Technical Implementation

### Files
- `utils/gameDetector.js` - Detection patterns, games, query types
- `utils/external/gameFetcher.js` - Web search integration, formatting
- `GAMES.md` - Complete documentation

### Detection Function
```javascript
isGameRequest(message)
// Returns: { isGame: true/false, priority: 0-10 }
// Threshold: priority >= 6
```

### Game Detection
```javascript
detectGame(message)
// Returns: game object or null
// Matches: 23 games with multiple keywords each
```

### Query Type Detection
```javascript
detectQueryType(message)
// Returns: queryType object or null
// Matches: 8 types with priority ranking
```

### Entity Extraction
```javascript
extractEntityName(message, game)
// Returns: hero/champion/agent name or null
// Extracts: character names from query
```

### Search Query Building
```javascript
buildSearchQuery(message, game, queryType, entityName)
// Returns: optimized web search query
// Format: "[Game] [Entity] [Type] 2025"
// Example: "Mobile Legends Hayabusa build guide 2025"
```

### Web Search Integration
```javascript
searchGameInfo(query, webSearchFunction)
// Uses: searchWeb function for real-time data
// Returns: { success, content } or { success: false, error }
```

### Response Formatting
```javascript
formatGameInfo(searchResult, game, queryType, entityName)
// Returns: formatted message string
// Features: cute intros/outros, Discord limit handling
```

## ⚙️ Configuration

### Detection Patterns (10 patterns)
- **Priority 10**: Specific requests với "cho/xem/hướng dẫn + build/combo"
- **Priority 9**: Direct commands "cách chơi/guide + hero"
- **Priority 8**: Counter requests "counter/chống + hero"
- **Priority 7**: Updates "patch/buff/nerf"
- **Priority 6**: General "build/combo/guide/tier"

### Web Search
- Uses: Google Custom Search API (via searchWeb)
- Fallback: DuckDuckGo if Google fails
- Query format: "[Game] [Entity] [Type] 2025"
- Content limit: 1800 chars (leaves room for formatting)

### Discord Limits
- Max message: 2000 characters
- Auto truncation: "..." if exceeds
- Safe formatting: intro + title + content + outro

### No Additional API Keys!
- ✅ Uses existing web search (Google/DuckDuckGo)
- ✅ No game-specific APIs needed
- ✅ Works out of the box

## 📈 Priority Flow

```
Anime/Manga Search (Highest)
   ↓
Video/Music Search
   ↓
News System
   ↓
GAME INFO SYSTEM 🎮 (NEW)
   ↓
Natural Language Games
   ↓
Custom Responses → Database → ...
```

**Lưu ý:** Game info có priority cao hơn natural language games để tránh conflict.

## 🎯 Examples

### Example 1: Build Request
```
User: "Lena ơi, build Hayabusa MLBB"

Bot: 🎮 Ư-ừm... mình tìm được thông tin game rồi!

     **Mobile Legends: Bang Bang - Hayabusa - Build Guide**
     
     Core Items:
     - Hunter Strike (damage + cooldown)
     - Blade of Despair (pure damage)
     - Malefic Roar (armor penetration)
     
     Emblem: Assassin with movement speed
     Playstyle: Farm jungle → Gank → Escape
     
     Chúc bạn chơi game vui vẻ! 🎮✨

React: 🎮 🎯 ✨
```

### Example 2: Combo Request
```
User: "Combo Yasuo LoL"

Bot: 🎮 Ehehe~ mình có thông tin về game này!

     **League of Legends - Yasuo - Combo Guide**
     
     Basic Combo:
     E (dash through minion) → Q → Auto → repeat
     
     Tornado Combo:
     Stack Q twice → E+Q for tornado → R
     
     Advanced:
     E → Q → Flash → R (Beyblade combo)
     
     Hy vọng thông tin này hữu ích nha! 😊🌸

React: 🎮 🎯 ✨
```

### Example 3: Tier List
```
User: "MLBB tier list mới nhất"

Bot: 🎮 Thông tin game mới nhất đây bạn ơi!

     **Mobile Legends: Bang Bang - Tier List**
     
     S-Tier Heroes (October 2025):
     - Hayabusa (Assassin) - 69.5% ban rate
     - Wanwan (Marksman) - High mobility
     - Floryn (Support) - Global heal
     - Phoveus (Fighter) - Anti-dash
     
     Meta: Fast-paced, mobility focused
     
     Good luck trên con đường leo rank! 🚀

React: 🎮 🎯 ✨
```

### Example 4: Multi-game
```
User: "Valorant Jett guide"

Bot: 🎮 Guide chi tiết đây! ✨

     **Valorant - Jett - Guide**
     
     Abilities:
     - Updraft: Vertical mobility
     - Cloudburst: Smoke for entry
     - Tailwind: Dash (resets after 2 kills)
     - Blade Storm: Throwing knives (ult)
     
     Tips:
     - Save dash for escape after first kill
     - Coordinate with team flashes
     - Best on maps with vertical play
     
     Áp dụng vào game thử xem! 💕

React: 🎮 🎯 ✨
```

### Example 5: Error (No game detected)
```
User: "build nào tốt nhất?"

Bot: [Không trigger vì thiếu tên game]
     → Falls through to AI response
```

### Example 6: Counter Request
```
User: "Counter Fanny MLBB"

Bot: 🎮 Ư-ừm... build và combo đây nha!

     **Mobile Legends: Bang Bang - Fanny - Counter Guide**
     
     Best Counters:
     - Khufra (disable cable)
     - Saber (lock down)
     - Natalia (silence)
     
     Tips:
     - Buy Wind of Nature
     - Stay grouped
     - Control buffs
     
     Nhớ luyện tập nhiều nhé! 🥺💪

React: 🎮 🎯 ✨
```

## ⚠️ Limitations

### Web Search Dependent
- ❌ Phụ thuộc vào web search API
- ❌ Nếu Google/DuckDuckGo down → không fetch được
- ✅ Tuy nhiên có fallback DuckDuckGo

### Content Accuracy
- ⚠️ Thông tin từ web có thể cũ nếu game update gần đây
- ⚠️ Meta thay đổi liên tục, cần verify thông tin
- ✅ Luôn search với "2025" để có info mới nhất

### Entity Detection
- ⚠️ Tên hero/champion phải rõ ràng
- ⚠️ Tên tiếng Việt có thể không match
- ✅ Khuyến khích dùng tên tiếng Anh

### Message Length
- ⚠️ Discord limit 2000 chars
- ⚠️ Thông tin dài sẽ bị truncate
- ✅ Auto "..." nếu quá dài

## 💡 Tips & Best Practices

### Cho users:
- ✅ **Nói rõ game** - "Hayabusa MLBB" thay vì chỉ "Hayabusa"
- ✅ **Dùng tên tiếng Anh** - "Yasuo" thay vì "Gió Lốc"
- ✅ **Chỉ định loại info** - "build", "combo", "guide"
- ✅ **Hỏi ngắn gọn** - "build Jett Valorant" thay vì câu dài
- ❌ **Không hỏi quá chung** - "tier list" (thiếu tên game)

### Cho admins:
- Có thể thêm game mới bằng cách:
  1. Thêm vào `games` array trong `gameDetector.js`
  2. Cung cấp keywords và searchPrefix
  3. Restart bot
- Monitor web search API usage (có rate limit)
- Verify thông tin trước khi trust 100%
- Có thể adjust priority thresholds nếu cần

## 🔒 Privacy & Security

- ✅ **Public Web Search**: Chỉ dùng public web data
- ✅ **No Personal Data**: Không lưu preferences
- ✅ **No Tracking**: Không track user behavior
- ✅ **Safe Content**: Web search results are public info

## 🌟 Ưu điểm

✨ **23 tựa game** - Cover hầu hết game phổ biến  
🎮 **8 loại info** - Build, combo, guide, tier list, counter, tips, update, strategy  
🔍 **Auto detection** - Không cần nhớ lệnh  
🌐 **Real-time** - Web search cho info mới nhất  
😊 **Tự nhiên** - Hỏi như bình thường  
💯 **No extra APIs** - Dùng web search có sẵn  
🚀 **Nhanh** - Web search + format instant  

## 🔮 Future Enhancements (Optional)

**Potential features:**
- [ ] Cache popular queries (reduce API calls)
- [ ] More games (Minecraft, Roblox, etc.)
- [ ] Vietnamese hero names support
- [ ] Image embeds for builds
- [ ] Multiple results (top 3 builds)
- [ ] Pro player builds integration
- [ ] Patch tracking system
- [ ] Build comparison feature
- [ ] Save favorite builds per user
- [ ] Tournament meta analysis

---

**Chơi game giỏi hơn với Lena! 🎮✨**

Made with 💕 by Thanh Tín
