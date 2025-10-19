import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ThumbsUp, MessageSquare, User, LogOut } from 'lucide-react';
import LoginPage from './components/loginPage.jsx';
import CommentNode from './components/comment.jsx';
import axios from 'axios';
import { useEffect } from 'react';




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


export default function App() {

  const [users,setUsers]=useState([]);
  const [comments, setComments] = useState([]);


  const [isLoading, setIsLoading] = useState(true);

  useEffect(()=>{
    async function getData() {
      try {
        setIsLoading(true);
        const response_user = await axios.get("https://interiit-tech-siyv.vercel.app/api/users");
        const response_comment = await axios.get("https://interiit-tech-siyv.vercel.app/api/comments");
        setUsers(response_user.data);
        setComments(response_comment.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    getData(); 
  }, [])

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  
  const [registeredUsers, setRegisteredUsers] = useState([
    { id: 1, email: 'demo@iit.ac.in', password: 'demo123', name: 'Demo User', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Demo' }
  ]);
  const [sortBy, setSortBy] = useState('recent');
  const [newComment, setNewComment] = useState('');
  
  const commentTree = buildCommentTree(comments);

  const handleLogin = (user) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
  };

  const handleRegister = (newUser) => {
    setRegisteredUsers(prev => [...prev, newUser]);
    setUsers(prev => [...prev, {
      id: newUser.id,
      name: newUser.name,
      avatar: newUser.avatar,
      created_at: newUser.created_at
    }]);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
  };

  const handleUpvote = (commentId) => {
    setComments(prev => prev.map(c => 
      c.id === commentId ? { ...c, upvotes: c.upvotes + 1 } : c
    ));
  };

  const handleReply = (parentId, text) => {
    const newReply = {
      id: Date.now(),
      text,
      upvotes: 0,
      created_at: new Date().toISOString(),
      user_id: currentUser.id,
      parent_id: parentId
    };
    setComments(prev => [...prev, newReply]);
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: Date.now(),
        text: newComment,
        upvotes: 0,
        created_at: new Date().toISOString(),
        user_id: currentUser.id,
        parent_id: null
      };
      setComments(prev => [...prev, comment]);
      setNewComment('');
    }
  };

  const sortedTree = [...commentTree].sort((a, b) => {
    if (sortBy === 'popular') return b.upvotes - a.upvotes;
    if (sortBy === 'replies') return (b.replies?.length || 0) - (a.replies?.length || 0);
    return new Date(b.created_at) - new Date(a.created_at);
  });

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} registeredUsers={registeredUsers} onRegister={handleRegister} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Discussion Forum</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            <User className="w-5 h-5" />
            <span className="hidden sm:inline">{currentUser?.name}</span>
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <article className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Understanding Nested Comment Systems
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            A nested commenting system is essential for creating meaningful discussions in digital platforms. 
            It allows users to respond directly to specific comments, creating threaded conversations that 
            maintain context and improve readability.
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>Published: Oct 18, 2025</span>
            <span>•</span>
            <span>{comments.length} Comments</span>
          </div>
        </article>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              Comments ({comments.filter(c => c.parent_id === null).length})
            </h3>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            >
              <option value="recent">Most Recent</option>
              <option value="popular">Most Popular</option>
              <option value="replies">Most Replies</option>
            </select>
          </div>

          <div className="mb-6 flex gap-3">
            <img 
              src={currentUser?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=current"} 
              alt="You"
              className="w-10 h-10 rounded-full flex-shrink-0"
            />
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
              />
              <button
                onClick={handleAddComment}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition duration-200"
              >
                Comment
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {sortedTree.map(comment => (
              <CommentNode
                key={comment.id}
                comment={comment}
                users={users}
                depth={0}
                onUpvote={handleUpvote}
                onReply={handleReply}
                currentUser={currentUser}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}