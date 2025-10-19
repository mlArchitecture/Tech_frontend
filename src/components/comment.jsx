import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ThumbsUp, MessageSquare, User, LogOut } from 'lucide-react';

// Mock data based on the document structure
const mockUsers = [
  { id: 1, name: "Alice Johnson", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice", created_at: "2024-01-15T10:30:00Z" },
  { id: 2, name: "Bob Smith", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob", created_at: "2024-01-16T11:20:00Z" },
  { id: 3, name: "Carol White", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carol", created_at: "2024-02-10T09:15:00Z" },
  { id: 4, name: "David Brown", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David", created_at: "2024-03-05T14:45:00Z" },
  { id: 5, name: "Emma Davis", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma", created_at: "2024-03-20T16:30:00Z" }
];

const mockComments = [
  { id: 1, text: "This is a great article! Really insightful.", upvotes: 15, created_at: "2024-10-01T10:30:00Z", user_id: 1, parent_id: null },
  { id: 2, text: "I completely agree with your points.", upvotes: 8, created_at: "2024-10-01T11:00:00Z", user_id: 2, parent_id: 1 },
  { id: 3, text: "Could you elaborate more on the second point?", upvotes: 5, created_at: "2024-10-01T11:30:00Z", user_id: 3, parent_id: 1 },
  { id: 4, text: "Sure! The second point refers to...", upvotes: 12, created_at: "2024-10-01T12:00:00Z", user_id: 1, parent_id: 3 },
  { id: 5, text: "Thanks for clarifying!", upvotes: 3, created_at: "2024-10-01T12:30:00Z", user_id: 3, parent_id: 4 },
  { id: 6, text: "Interesting perspective on this topic.", upvotes: 20, created_at: "2024-10-02T09:00:00Z", user_id: 4, parent_id: null },
  { id: 7, text: "I have a different opinion though.", upvotes: 7, created_at: "2024-10-02T10:00:00Z", user_id: 5, parent_id: 6 },
  { id: 8, text: "That's fair, what's your take?", upvotes: 4, created_at: "2024-10-02T10:30:00Z", user_id: 4, parent_id: 7 },
  { id: 9, text: "Great discussion happening here!", upvotes: 6, created_at: "2024-10-03T08:00:00Z", user_id: 2, parent_id: null }
];


function buildCommentTree(comments) {
  const commentMap = {};
  const roots = [];
  
  comments.forEach(comment => {
    commentMap[comment.id] = { ...comment, replies: [] };
  });
  
  comments.forEach(comment => {
    if (comment.parent_id === null) {
      roots.push(commentMap[comment.id]);
    } else {
      const parent = commentMap[comment.parent_id];
      if (parent) {
        parent.replies.push(commentMap[comment.id]);
      }
    }
  });
  
  return roots;
}



// Individual Comment Component (DFS node)
function CommentNode({ comment, users, depth = 0, onUpvote, onReply, currentUser }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  
  const user = users.find(u => u.id === comment.user_id);
  const hasReplies = comment.replies && comment.replies.length > 0;
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  const handleReplySubmit = () => {
    if (replyText.trim()) {
      onReply(comment.id, replyText);
      setReplyText('');
      setIsReplying(false);
    }
  };

  return (
    <div className={`${depth > 0 ? 'ml-6 md:ml-12' : ''} transition-all duration-300`}>
      <div className={`${depth > 0 ? 'border-l-2 border-gray-200 pl-4' : ''} py-3`}>
        <div className="flex gap-3">
          <img 
            src={user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'} 
            alt={user?.name}
            className="w-10 h-10 rounded-full flex-shrink-0"
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-gray-900">{user?.name || 'Unknown User'}</span>
              <span className="text-sm text-gray-500">{formatDate(comment.created_at)}</span>
            </div>
            
            <p className="text-gray-700 mt-2 leading-relaxed">{comment.text}</p>
            
            <div className="flex items-center gap-4 mt-3">
              <button
                onClick={() => onUpvote(comment.id)}
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-indigo-600 transition group"
              >
                <ThumbsUp className="w-4 h-4 group-hover:scale-110 transition" />
                <span className="font-medium">{comment.upvotes}</span>
              </button>
              
              <button
                onClick={() => setIsReplying(!isReplying)}
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-indigo-600 transition"
              >
                <MessageSquare className="w-4 h-4" />
                Reply
              </button>
              
              {hasReplies && (
                <button
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="flex items-center gap-1 text-sm text-gray-600 hover:text-indigo-600 transition"
                >
                  {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                  {isCollapsed ? 'Expand' : 'Collapse'} ({comment.replies.length})
                </button>
              )}
            </div>

            {isReplying && (
              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write a reply..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                  onKeyPress={(e) => e.key === 'Enter' && handleReplySubmit()}
                />
                <button
                  onClick={handleReplySubmit}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
                >
                  Post
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {!isCollapsed && hasReplies && (
        <div className="space-y-1">
          {comment.replies.map(reply => (
            <CommentNode
              key={reply.id}
              comment={reply}
              users={users}
              depth={depth + 1}
              onUpvote={onUpvote}
              onReply={onReply}
              currentUser={currentUser}
            />
          ))}
        </div>
      )}
    </div>
  );
}
export default CommentNode;