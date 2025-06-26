import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GiftedChat, IMessage, InputToolbar, Send, Bubble } from 'react-native-gifted-chat';
import { Ionicons } from '@expo/vector-icons';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import * as ImagePicker from 'expo-image-picker';

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { chats, messages, sendMessage } = useChat();
  const { user } = useAuth();
  const router = useRouter();
  
  const chat = chats.find(c => c.id === id);
  const chatMessages = messages[id!] || [];

  const [giftedMessages, setGiftedMessages] = useState<IMessage[]>([]);

  useEffect(() => {
    const formattedMessages = chatMessages.map(msg => ({
      ...msg,
      createdAt: new Date(msg.createdAt),
    })).reverse();
    
    setGiftedMessages(formattedMessages);
  }, [chatMessages]);

  const onSend = useCallback((messages: IMessage[] = []) => {
    const message = messages[0];
    sendMessage(id!, message.text, message.image);
  }, [id, sendMessage]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const message: IMessage = {
        _id: Date.now().toString(),
        text: '',
        createdAt: new Date(),
        user: {
          _id: user!.id,
          name: user!.name,
          avatar: user!.avatar,
        },
        image: result.assets[0].uri,
      };
      onSend([message]);
    }
  };

  const renderInputToolbar = (props: any) => (
    <InputToolbar
      {...props}
      containerStyle={styles.inputToolbar}
      primaryStyle={styles.inputPrimary}
    />
  );

  const renderSend = (props: any) => (
    <Send {...props} containerStyle={styles.sendContainer}>
      <View style={styles.sendButton}>
        <Ionicons name="send" size={20} color="#ffffff" />
      </View>
    </Send>
  );

  const renderBubble = (props: any) => (
    <Bubble
      {...props}
      wrapperStyle={{
        right: styles.bubbleRight,
        left: styles.bubbleLeft,
      }}
      textStyle={{
        right: styles.textRight,
        left: styles.textLeft,
      }}
    />
  );

  const renderActions = () => (
    <TouchableOpacity style={styles.actionButton} onPress={pickImage}>
      <Ionicons name="camera" size={24} color="#667eea" />
    </TouchableOpacity>
  );

  if (!chat) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Chat not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        
        <View style={styles.chatInfo}>
          <Image source={{ uri: chat.avatar }} style={styles.avatar} />
          <View style={styles.chatDetails}>
            <Text style={styles.chatName}>{chat.name}</Text>
            <Text style={styles.chatStatus}>
              {chat.isGroup ? `${chat.participants.length} members` : 'Online'}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-vertical" size={20} color="#111827" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <GiftedChat
          messages={giftedMessages}
          onSend={onSend}
          user={{
            _id: user!.id,
            name: user!.name,
            avatar: user!.avatar,
          }}
          renderInputToolbar={renderInputToolbar}
          renderSend={renderSend}
          renderBubble={renderBubble}
          renderActions={renderActions}
          alwaysShowSend
          scrollToBottom
          showUserAvatar
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#ffffff',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  chatInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  chatDetails: {
    flex: 1,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  chatStatus: {
    fontSize: 12,
    color: '#10B981',
    marginTop: 2,
  },
  moreButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatContainer: {
    flex: 1,
  },
  inputToolbar: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  inputPrimary: {
    alignItems: 'center',
  },
  sendContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 8,
  },
  sendButton: {
    backgroundColor: '#667eea',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    marginBottom: 8,
  },
  bubbleRight: {
    backgroundColor: '#667eea',
  },
  bubbleLeft: {
    backgroundColor: '#F3F4F6',
  },
  textRight: {
    color: '#ffffff',
  },
  textLeft: {
    color: '#111827',
  },
});