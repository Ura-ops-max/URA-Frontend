import API from './axios-client'; // Your pre-configured axios instance

export const chatAPI = {
  // Get list of chats for the active Tab
  getConversations: (profileId: string) => API.get(`/conversations?profileId=${profileId}`),

  // Get messages for a specific chat
  getMessages: (conversationId: string, profileId: string) =>
    API.get(`/conversations/${conversationId}/messages?profileId=${profileId}`),

  // Send a new message
  sendMessage: (messageData: {
    conversationId: string;
    content: string;
    senderId: string;
    senderModel: 'User' | 'Business';
  }) => API.post('/conversations/messages', messageData),

  // Access or Create a chat
  accessConversation: (payload: {
    senderId: string;
    senderModel: 'User' | 'Business';
    receiverId: string;
    receiverModel: 'User' | 'Business';
  }) => API.post('/conversations', payload),
};
