import { Eye, EyeOff, MessageCircle, Send, Star, Trash2 } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../../constants';

const CommentItem = ({ item, onReply, onDelete, onToggleStatus }) => {
  const [replyText, setReplyText] = useState(item.reply || '');
  const [isReplying, setIsReplying] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
      setLoading(true);
      await onReply(item._id, replyText);
      setLoading(false);
      setIsReplying(false);
  };

  return (
    <View style={[styles.card, !item.isActive && styles.hiddenCard]}>
      {/* Header Info */}
      <View style={styles.header}>
          <View style={{flexDirection: 'row', gap: 10}}>
             <View style={styles.avatar}><Text style={styles.avatarText}>{item.user?.name?.charAt(0)}</Text></View>
             <View>
                 <Text style={styles.name}>{item.user?.name}</Text>
                 <View style={{flexDirection: 'row'}}>
                    {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} color={i < item.rating ? "#f59e0b" : "#ddd"} fill={i < item.rating ? "#f59e0b" : "transparent"}/>
                    ))}
                 </View>
             </View>
          </View>
          {item.product?.image && <Image source={{uri: item.product.image[0]}} style={styles.prodImg} />}
      </View>

      <Text style={styles.content}>{item.comment}</Text>
      <Text style={styles.prodName}>Sản phẩm: {item.product?.name}</Text>

      {/* Admin Reply */}
      {(item.reply || isReplying) && (
          <View style={styles.replyBox}>
              <Text style={styles.replyLabel}>Phản hồi của Admin:</Text>
              {isReplying ? (
                  <View style={{flexDirection: 'row', alignItems: 'center', gap: 5}}>
                      <TextInput style={styles.input} value={replyText} onChangeText={setReplyText} placeholder="Nhập câu trả lời..." />
                      <TouchableOpacity onPress={handleSend}>
                          {loading ? <ActivityIndicator size="small" color={COLORS.primary}/> : <Send size={20} color={COLORS.primary}/>}
                      </TouchableOpacity>
                  </View>
              ) : (
                  <Text style={{fontSize: 13}}>{item.reply}</Text>
              )}
          </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
          <TouchableOpacity onPress={() => setIsReplying(!isReplying)} style={styles.btn}>
              <MessageCircle size={16} color="#666"/>
              <Text style={styles.btnText}>Trả lời</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onToggleStatus(item._id, !item.isActive)} style={styles.btn}>
              {item.isActive ? <Eye size={16} color="green"/> : <EyeOff size={16} color="red"/>}
              <Text style={[styles.btnText, {color: item.isActive ? 'green' : 'red'}]}>
                  {item.isActive ? 'Hiển thị' : 'Đã ẩn'}
              </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onDelete(item._id)}>
              <Trash2 size={16} color="red"/>
          </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#eee' },
  hiddenCard: { backgroundColor: '#fff1f2', borderColor: '#fda4af' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  avatar: { width: 35, height: 35, borderRadius: 17.5, backgroundColor: '#e0f2fe', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontWeight: 'bold', color: '#0284c7' },
  name: { fontWeight: '600', fontSize: 13 },
  prodImg: { width: 40, height: 40, borderRadius: 5, backgroundColor: '#eee' },
  content: { fontSize: 14, color: '#333', marginVertical: 5 },
  prodName: { fontSize: 11, color: '#888', fontStyle: 'italic' },
  replyBox: { backgroundColor: '#f9fafb', padding: 10, borderRadius: 8, marginTop: 10 },
  replyLabel: { fontSize: 11, fontWeight: 'bold', color: COLORS.primary, marginBottom: 4 },
  input: { flex: 1, height: 35, borderWidth: 1, borderColor: '#ddd', borderRadius: 5, paddingHorizontal: 8, backgroundColor: '#fff' },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 15, marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderColor: '#f0f0f0' },
  btn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  btnText: { fontSize: 12, fontWeight: '500', color: '#666' }
});

export default CommentItem;