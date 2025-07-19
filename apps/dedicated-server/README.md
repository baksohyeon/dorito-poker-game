🎮 Core game system

PokerGameEngine: Complete Texas Holdham Game Logic
HandEvaluator: Accurate Poker Hand Evaluation and Comparison
Deck: Cryptographically secure card shuffle
GameManager: Managing the Game Life Cycle

🔌 Real-time communication

WebSocket Server: Socket.IO-based real-time communication
ConnectionManager:managing player connections, processing reconnection
Event Manager: Game Event System
Authentication Middleware: JWT-based socket authentication

🏓 Table Management

TableManager: Creating a table based on Snowflake ID
Player Sitting: Automatic Positioning
Health Management: Standby → Active → Game Progress

📡 Master server interworking

Auto-registration:registering to the master server at startup
Heartbeat: Send status every 30 seconds
Metric collection: CPU, memory, table/player count