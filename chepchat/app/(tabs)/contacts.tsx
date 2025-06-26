import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useChat } from '../../contexts/ChatContext';

interface Contact {
  id: string;
  name: string;
  email: string;
  avatar: string;
  status: 'online' | 'offline' | 'away';
}

const mockContacts: Contact[] = [
  {
    id: 'sarah',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=sarah',
    status: 'online',
  },
  {
    id: 'alex',
    name: 'Alex Chen',
    email: 'alex@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=alex',
    status: 'away',
  },
  {
    id: 'mike',
    name: 'Mike Wilson',
    email: 'mike@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=mike',
    status: 'offline',
  },
  {
    id: 'lisa',
    name: 'Lisa Brown',
    email: 'lisa@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=lisa',
    status: 'online',
  },
  {
    id: 'john',
    name: 'John Doe',
    email: 'john@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=john',
    status: 'online',
  },
];

export default function ContactsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const { createChat } = useChat();
  const router = useRouter();

  const filteredContacts = mockContacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleContactPress = async (contact: Contact) => {
    try {
      const chatId = await createChat(contact.name, [contact.id]);
      router.push(`/chat/${chatId}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to create chat');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return '#10B981';
      case 'away':
        return '#F59E0B';
      case 'offline':
        return '#9CA3AF';
      default:
        return '#9CA3AF';
    }
  };

  const renderContactItem = ({ item }: { item: Contact }) => (
    <TouchableOpacity
      style={styles.contactItem}
      onPress={() => handleContactPress(item)}
    >
      <View style={styles.avatarContainer}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(item.status) }]} />
      </View>
      
      <View style={styles.contactContent}>
        <Text style={styles.contactName}>{item.name}</Text>
        <Text style={styles.contactEmail}>{item.email}</Text>
      </View>
      
      <TouchableOpacity style={styles.messageButton}>
        <Ionicons name="chatbubble-outline" size={20} color="#667eea" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Contacts</Text>
        
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search contacts..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      <FlatList
        data={filteredContacts}
        renderItem={renderContactItem}
        keyExtractor={(item) => item.id}
        style={styles.contactList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contactListContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 44,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  contactList: {
    flex: 1,
  },
  contactListContent: {
    paddingVertical: 8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F3F4F6',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  contactContent: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  contactEmail: {
    fontSize: 14,
    color: '#6B7280',
  },
  messageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
});