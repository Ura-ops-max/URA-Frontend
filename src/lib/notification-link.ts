// Where tapping a notification goes. Order notices (paid, ready, "Your money
// goes to <shop> in 6 hours", ...) open the order; others keep opening the chat.

export interface LinkableNotification {
  modelType?: string | null;
  relatedId?: string | { _id?: string } | null;
}

export function notificationLink(n: LinkableNotification): string | null {
  const id = typeof n.relatedId === 'object' && n.relatedId ? n.relatedId._id : n.relatedId;
  if (!id) return null;
  if (n.modelType === 'Order') return `/dashboard/orders/${id}`;
  return `/dashboard/chat/${id}`;
}
