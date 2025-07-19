import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '../../store'
import { 
  sendMessage, 
  setCurrentMessage, 
  navigateHistory,
  toggleChat,
  sendEmote,
  sendQuickMessage,
  muteUser,
  blockUser,
  setChatMode
} from '../../store/slices/chatSlice'
import { socketService } from '../../services/socketService'
import { ChatMessage } from '../../types'

const ChatPanel: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { 
    messages, 
    currentMessage, 
    isOpen, 
    chatMode, 
    privateTarget,
    emotes,
    quickMessages,
    settings
  } = useSelector((state: RootState) => state.chat)
  const { user } = useSelector((state: RootState) => state.auth)
  const { screenSize } = useSelector((state: RootState) => state.ui)
  
  const [showEmotes, setShowEmotes] = useState(false)
  const [showQuickMessages, setShowQuickMessages] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (currentMessage.trim()) {
      socketService.sendChatMessage(currentMessage.trim())
      dispatch(sendMessage({ message: currentMessage.trim(), type: 'chat' }))
      dispatch(setCurrentMessage(''))
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      dispatch(navigateHistory('up'))
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      dispatch(navigateHistory('down'))
    }
  }

  const handleEmoteClick = (emote: string) => {
    socketService.sendChatMessage(emote, 'emote')
    dispatch(sendEmote(emote))
    setShowEmotes(false)
  }

  const handleQuickMessageClick = (message: string) => {
    socketService.sendChatMessage(message)
    dispatch(sendQuickMessage(message))
    setShowQuickMessages(false)
  }

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case 'system':
        return 'text-yellow-400'
      case 'emote':
        return 'text-purple-400'
      default:
        return 'text-white'
    }
  }

  const MessageItem: React.FC<{ message: ChatMessage; index: number }> = ({ message, index }) => {
    const isOwnMessage = message.playerId === user?.id
    const [showActions, setShowActions] = useState(false)

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ delay: index * 0.05 }}
        className={`flex items-start space-x-2 p-2 rounded-lg hover:bg-poker-dark-600 hover:bg-opacity-50 group relative ${
          isOwnMessage ? 'bg-poker-accent-900 bg-opacity-20' : ''
        }`}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        {/* Avatar */}
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-poker-accent-600 flex items-center justify-center text-white text-xs font-bold">
          {message.playerName.charAt(0).toUpperCase()}
        </div>

        {/* Message content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline space-x-2">
            <span className={`font-medium text-sm ${isOwnMessage ? 'text-poker-accent-300' : 'text-poker-accent-200'}`}>
              {message.playerName}
              {isOwnMessage && ' (You)'}
            </span>
            {settings.showTimestamps && (
              <span className="text-xs text-poker-accent-500">
                {formatTimestamp(message.timestamp)}
              </span>
            )}
          </div>
          
          <div className={`mt-1 text-sm break-words ${getMessageTypeColor(message.type)}`}>
            {message.type === 'emote' ? (
              <span className="text-lg">{message.message}</span>
            ) : (
              message.message
            )}
          </div>
        </div>

        {/* Message actions */}
        <AnimatePresence>
          {showActions && !isOwnMessage && message.type !== 'system' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute right-2 top-2 flex space-x-1"
            >
              <button
                onClick={() => dispatch(muteUser(message.playerId))}
                className="p-1 bg-poker-dark-800 hover:bg-yellow-600 text-poker-accent-400 hover:text-white rounded transition-colors"
                title="Mute user"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
              </button>
              <button
                onClick={() => dispatch(blockUser(message.playerId))}
                className="p-1 bg-poker-dark-800 hover:bg-red-600 text-poker-accent-400 hover:text-white rounded transition-colors"
                title="Block user"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                </svg>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    )
  }

  if (!isOpen) return null

  return (
    <div className="flex flex-col h-full bg-poker-dark-800 border-l border-poker-accent-600">
      {/* Chat header */}
      <div className="flex items-center justify-between p-4 border-b border-poker-accent-600">
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-poker-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <h3 className="text-white font-medium">
            {chatMode === 'table' ? 'Table Chat' : chatMode === 'private' ? `Private: ${privateTarget}` : 'Lobby Chat'}
          </h3>
        </div>

        <div className="flex items-center space-x-2">
          {/* Chat mode selector */}
          <select
            value={chatMode}
            onChange={(e) => dispatch(setChatMode(e.target.value as any))}
            className="bg-poker-dark-600 border border-poker-accent-600 text-white text-xs rounded px-2 py-1"
          >
            <option value="table">Table</option>
            <option value="all">All</option>
            <option value="private">Private</option>
          </select>

          {/* Close button (mobile) */}
          {screenSize === 'mobile' && (
            <button
              onClick={() => dispatch(toggleChat())}
              className="text-poker-accent-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        <AnimatePresence initial={false}>
          {messages.map((message, index) => (
            <MessageItem key={message.id} message={message} index={index} />
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Quick actions */}
      <div className="border-t border-poker-accent-600 p-2">
        <div className="flex space-x-2 mb-2">
          {/* Emotes button */}
          <button
            onClick={() => setShowEmotes(!showEmotes)}
            className="flex-1 bg-poker-dark-600 hover:bg-poker-dark-500 text-poker-accent-300 py-1 px-2 rounded text-xs transition-colors"
          >
            😀 Emotes
          </button>

          {/* Quick messages button */}
          <button
            onClick={() => setShowQuickMessages(!showQuickMessages)}
            className="flex-1 bg-poker-dark-600 hover:bg-poker-dark-500 text-poker-accent-300 py-1 px-2 rounded text-xs transition-colors"
          >
            💬 Quick
          </button>
        </div>

        {/* Emotes panel */}
        <AnimatePresence>
          {showEmotes && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-6 gap-1 mb-2 p-2 bg-poker-dark-700 rounded"
            >
              {emotes.map((emote, index) => (
                <button
                  key={index}
                  onClick={() => handleEmoteClick(emote)}
                  className="text-lg hover:bg-poker-dark-600 p-1 rounded transition-colors"
                >
                  {emote}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick messages panel */}
        <AnimatePresence>
          {showQuickMessages && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-1 mb-2 p-2 bg-poker-dark-700 rounded"
            >
              {quickMessages.map((message, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickMessageClick(message)}
                  className="w-full text-left bg-poker-dark-600 hover:bg-poker-dark-500 text-poker-accent-300 py-1 px-2 rounded text-xs transition-colors"
                >
                  {message}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Message input */}
      <form onSubmit={handleSendMessage} className="p-3 border-t border-poker-accent-600">
        <div className="flex space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={currentMessage}
            onChange={(e) => dispatch(setCurrentMessage(e.target.value))}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${chatMode === 'table' ? 'table' : chatMode === 'private' ? privateTarget : 'all'}...`}
            className="flex-1 bg-poker-dark-600 border border-poker-accent-600 text-white placeholder-poker-accent-400 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-poker-accent-500 focus:border-poker-accent-500 transition-colors"
            maxLength={200}
          />
          <button
            type="submit"
            disabled={!currentMessage.trim()}
            className="bg-poker-accent-600 hover:bg-poker-accent-700 disabled:bg-poker-accent-800 disabled:cursor-not-allowed text-white px-4 py-2 rounded transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        
        {/* Character count */}
        <div className="text-right text-xs text-poker-accent-500 mt-1">
          {currentMessage.length}/200
        </div>
      </form>
    </div>
  )
}

export default ChatPanel