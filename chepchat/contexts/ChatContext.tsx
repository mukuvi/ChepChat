import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

export interface Message {
  _id: string;
  text: string;
  createdAt: Date;
  user: {
    _id: string;
    name: string;
    avatar?: string;
  };
  image?: string;
  audio?: string;
  video?: string;
  pending?: boolean;
  sent?: boolean;
  received?: boolean;
}

export interface Chat {
  id: string;
  name: string;
  avatar?: string;
  lastMessage?: Message;
  unreadCount: number;
  isGroup: boolean;
  participants: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface ChatContextType {
  chats: Chat[];
  messages: { [chatId: string]: Message[] };
  sendMessage: (chatId: string, text: string, image?: string) => Promise<void>;
  createChat: (name: string, participants: string[], isGroup?: boolean) => Promise<string>;
  markAsRead: (chatId: string) => void;
  deleteChat: (chatId: string) => void;
  searchChats: (query: string) => Chat[];
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<{ [chatId: string]: Message[] }>({});
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadChats();
      initializeMockData();
    }
  }, [user]);

  const loadChats = async () => {
    try {
      const storedChats = await AsyncStorage.getItem('chats');
      const storedMessages = await AsyncStorage.getItem('messages');
      
      if (storedChats) {
        setChats(JSON.parse(storedChats));
      }
      
      if (storedMessages) {
        setMessages(JSON.parse(storedMessages));
      }
    } catch (error) {
      console.error('Error loading chats:', error);
    }
  };

  const initializeMockData = async () => {
    const existingChats = await AsyncStorage.getItem('chats');
    if (existingChats) return;

    const mockChats: Chat[] = [
      {
        id: '1',
        name: 'Sarah Johnson',
        avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=sarah',
        unreadCount: 2,
        isGroup: false,
        participants: [user!.id, 'sarah'],
        createdAt: new Date(Date.now() - 86400000),
        updatedAt: new Date(Date.now() - 3600000),
      },
      {
        id: '2',
        name: 'Team Alpha',
        avatar: 'https://api.dicebear.com/7.x/initials/png?seed=TA',
        unreadCount: 0,
        isGroup: true,
        participants: [user!.id, 'john', 'mike', 'lisa'],
        createdAt: new Date(Date.now() - 172800000),
        updatedAt: new Date(Date.now() - 7200000),
      },
      {
        id: '3',
        name: 'Alex Chen',
        avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=alex',
        unreadCount: 1,
        isGroup: false,
        participants: [user!.id, 'alex'],
        createdAt: new Date(Date.now() - 259200000),
        updatedAt: new Date(Date.now() - 1800000),
      }
    ];

    const mockMessages = {
      '1': [
        {
          _id: '1',
          text: 'Hey! How are you doing?',
          createdAt: new Date(Date.now() - 7200000),
          user: {
            _id: 'sarah',
            name: 'Sarah Johnson',
            avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=sarah',
          },
        },
        {
          _id: '2',
          text: 'I\'m doing great! Just finished a big project at work.',
          createdAt: new Date(Date.now() - 3600000),
          user: {
            _id: user!.id,
            name: user!.name,
            avatar: user!.avatar,
          },
        },
        {
          _id: '3',
          text: 'That\'s awesome! We should celebrate 🎉',
          createdAt: new Date(Date.now() - 1800000),
          user: {
            _id: 'sarah',
            name: 'Sarah Johnson',
            avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=sarah',
          },
        }
      ],
      '2': [
        {
          _id: '4',
          text: 'Good morning team! Ready for today\'s sprint?',
          createdAt: new Date(Date.now() - 14400000),
          user: {
            _id: 'john',
            name: 'John Doe',
            avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=john',
          },
        }
      ],
      '3': [
        {
          _id: '5',
          text: 'Check out this cool new feature I\'m working on!',
          createdAt: new Date(Date.now() - 1800000),
          user: {
            _id: 'alex',
            name: 'Alex Chen',
            avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=alex',
          },
        }
      ]
    };

    mockChats.forEach(chat => {
      const chatMessages = mockMessages[chat.id as keyof typeof mockMessages];
      if (chatMessages && chatMessages.length > 0) {
        chat.lastMessage = chatMessages[chatMessages.length - 1];
      }
    });

    setChats(mockChats);
    setMessages(mockMessages);
    
    await AsyncStorage.setItem('chats', JSON.stringify(mockChats));
    await AsyncStorage.setItem('messages', JSON.stringify(mockMessages));
  };

  const sendMessage = async (chatId: string, text: string, image?: string) => {
    if (!user) return;

    const newMessage: Message = {
      _id: Date.now().toString(),
      text,
      createdAt: new Date(),
      user: {
        _id: user.id,
        name: user.name,
        avatar: user.avatar,
      },
      image,
      pending: true,
    };

    const updatedMessages = {
      ...messages,
      [chatId]: [...(messages[chatId] || []), newMessage]
    };

    const updatedChats = chats.map(chat => {
      if (chat.id === chatId) {
        return {
          ...chat,
          lastMessage: newMessage,
          updatedAt: new Date(),
        };
      }
      return chat;
    });

    setMessages(updatedMessages);
    setChats(updatedChats);

    setTimeout(() => {
      const finalMessage = { ...newMessage, pending: false, sent: true };
      const finalMessages = {
        ...updatedMessages,
        [chatId]: updatedMessages[chatId].map(msg => 
          msg._id === newMessage._id ? finalMessage : msg
        )
      };
      setMessages(finalMessages);
      
      AsyncStorage.setItem('messages', JSON.stringify(finalMessages));
      AsyncStorage.setItem('chats', JSON.stringify(updatedChats));
    }, 1000);
  };

  const createChat = async (name: string, participants: string[], isGroup = false): Promise<string> => {
    const newChat: Chat = {
      id: Date.now().toString(),
      name,
      avatar: isGroup 
        ? `https://api.dicebear.com/7.x/initials/png?seed=${name}`
        : `https://api.dicebear.com/7.x/avataaars/png?seed=${name}`,
      unreadCount: 0,
      isGroup,
      participants: [user!.id, ...participants],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedChats = [newChat, ...chats];
    setChats(updatedChats);
    
    await AsyncStorage.setItem('chats', JSON.stringify(updatedChats));
    return newChat.id;
  };

  const markAsRead = (chatId: string) => {
    const updatedChats = chats.map(chat => 
      chat.id === chatId ? { ...chat, unreadCount: 0 } : chat
    );
    setChats(updatedChats);
    AsyncStorage.setItem('chats', JSON.stringify(updatedChats));
  };

  const deleteChat = (chatId: string) => {
    const updatedChats = chats.filter(chat => chat.id !== chatId);
    const updatedMessages = { ...messages };
    delete updatedMessages[chatId];
    
    setChats(updatedChats);
    setMessages(updatedMessages);
    
    AsyncStorage.setItem('chats', JSON.stringify(updatedChats));
    AsyncStorage.setItem('messages', JSON.stringify(updatedMessages));
  };

  const searchChats = (query: string): Chat[] => {
    return chats.filter(chat => 
      chat.name.toLowerCase().includes(query.toLowerCase())
    );
  };

  return (
    <ChatContext.Provider value={{
      chats,
      messages,
      sendMessage,
      createChat,
      markAsRead,
      deleteChat,
      searchChats,
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}