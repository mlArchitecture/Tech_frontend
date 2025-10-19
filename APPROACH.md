# Why I Used DFS for the Nested Comments System


---

## The Problem I Had to Solve

So basically, I needed to build a nested commenting system - you know, like Reddit or YouTube comments where you can reply to replies, and those replies can have their own replies. The tricky part wasn't just showing comments, it was making sure the whole hierarchy looked clean and made sense visually.

---

## Why I Went with DFS

### Initial Thoughts

When I first looked at the problem, I thought "okay, comments are basically a tree structure". Each comment is a node, and replies are child nodes. Pretty straightforward, right?

But then I had to figure out HOW to actually render this tree. I considered a few options:

**Option 1: Just keep everything flat**
- Nah, this would suck. How would I even show which comments are replies to what?
- Can't collapse threads
- Basically defeats the whole point

**Option 2: BFS (Breadth-First Search)**
- This would render level by level
- Like: all depth-0 comments first, then all depth-1, then depth-2, etc.
- Problem: nobody reads comments like that! You want to follow a conversation thread to its end, not jump between different threads

**Option 3: DFS (Depth-First Search)**
- This made the most sense
- Goes deep into each thread before moving to the next one
- Matches how people actually read conversations
- Plus, the code is surprisingly clean with recursion

### The "Aha!" Moment

The moment I realized DFS was perfect was when I thought about how I read Reddit comments myself. I don't read all top-level comments first, then go back to read replies. I read a comment, then immediately check its replies, then replies to those replies, and THEN move to the next top-level comment.

That's literally DFS! Follow the path deep, then backtrack.

---

## How I Actually Implemented It

### Step 1: Converting Flat Data to a Tree

The backend gives me comments as a flat array with `parent_id` references:

```javascript
[
  { id: 1, text: "Cool post!", parent_id: null },
  { id: 2, text: "Thanks!", parent_id: 1 },
  { id: 3, text: "Why though?", parent_id: 1 }
]
```

First thing I did was convert this to an actual tree structure:

```javascript
function buildCommentTree(comments) {
  // Create a quick lookup map
  const commentMap = {};
  const roots = [];
  
  // First pass: put everything in the map with empty replies
  comments.forEach(comment => {
    commentMap[comment.id] = { ...comment, replies: [] };
  });
  
  // Second pass: connect parents and children
  comments.forEach(comment => {
    if (comment.parent_id === null) {
      // Top-level comment
      roots.push(commentMap[comment.id]);
    } else {
      // It's a reply, add it to parent's replies array
      const parent = commentMap[comment.parent_id];
      if (parent) {
        parent.replies.push(commentMap[comment.id]);
      }
    }
  });
  
  return roots;
}
```

This runs in O(n) time - just two loops through the comments. Pretty efficient.

### Step 2: The Recursive Magic

Here's where DFS really shines. Instead of writing complicated loops, I just made a component that calls itself:

```javascript
function CommentNode({ comment, depth = 0 }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  return (
    <div style={{ marginLeft: `${depth * 48}px` }}>
      {/* Show the comment itself */}
      <div>
        <p>{comment.text}</p>
        <button>👍 {comment.upvotes}</button>
        
        {/* Collapse/expand if there are replies */}
        {comment.replies.length > 0 && (
          <button onClick={() => setIsCollapsed(!isCollapsed)}>
            {isCollapsed ? 'Show' : 'Hide'} {comment.replies.length} replies
          </button>
        )}
      </div>
      
      {/* HERE'S THE DFS PART - call myself for each reply */}
      {!isCollapsed && comment.replies.map(reply => (
        <CommentNode
          key={reply.id}
          comment={reply}
          depth={depth + 1}  // increase indentation
        />
      ))}
    </div>
  );
}
```

That's it! The component literally calls itself for nested replies. The JavaScript call stack handles all the backtracking automatically.

### How It Actually Executes

Let's say I have this structure:
```
Comment A
  └─ Reply B
      └─ Reply C
  └─ Reply D
```

Here's what happens:
1. Render Comment A (depth=0)
2. See it has replies, so call CommentNode for Reply B
3. Render Reply B (depth=1)
4. See it has replies, so call CommentNode for Reply C
5. Render Reply C (depth=2)
6. No more replies, function returns (backtrack!)
7. Back to Reply B level, no more replies here either
8. Back to Comment A level
9. Call CommentNode for Reply D
10. Render Reply D (depth=1)
11. Done!

The indentation increases automatically because I just do `depth + 1` each time.

---

## The Cool Parts

### 1. Collapse/Expand Just Works

Each CommentNode has its own `isCollapsed` state. When you collapse a comment, it just doesn't render the recursive part. Super simple.

### 2. Adding New Replies is Easy

When someone adds a reply:
```javascript
const newReply = {
  id: Date.now(),
  text: replyText,
  parent_id: parentCommentId,  // link it to parent
  upvotes: 0,
  replies: []
};

// Just add to the flat array
setComments([...comments, newReply]);

// buildCommentTree() handles the rest
```

The tree rebuilds automatically, DFS renders it, and boom - the new reply shows up in the right spot.

### 3. Visual Hierarchy

I used Tailwind to add indentation and border lines:
```javascript
className={`${depth > 0 ? 'ml-12 border-l-2 border-gray-200 pl-4' : ''}`}
```

So each level gets pushed to the right and has a line connecting it to its parent. Looks pretty clean IMO.

---

## Problems I Ran Into

### Stack Overflow (the bad kind)

DFS uses recursion, which means it uses the call stack. If someone makes a comment thread 10,000 levels deep (why would they?), it could crash.

**My solution**: In a real app, I'd probably limit nesting to like 10-15 levels max. After that, show a "continue thread" button that loads the rest separately. But for this task, I figured it's fine.

### Performance with Lots of Comments

If there are thousands of comments, rebuilding the tree on every update could get slow.

**What I did**: Used React's built-in optimization with keys. Also, the collapse/expand feature means you're not rendering everything at once.

**What I'd do in production**: 
- Memoize the CommentNode component
- Only rebuild the affected subtree, not the whole thing
- Maybe lazy load really deep threads

---

## Why This Approach Works

1. **It's intuitive** - The code literally reads like "render a comment, then render its replies". Easy to understand, easy to debug.

2. **Matches user behavior** - People read comments depth-first, not breadth-first. The DFS order feels natural.

3. **Flexible** - Want to add a feature? Just add it to the CommentNode component and it works at every level automatically.

4. **Clean code** - No messy loops tracking indices and depths. Recursion handles it all.

5. **Easy to extend** - Need admin delete? Just pass a `canDelete` prop. Want to limit depth? Add a check like `if (depth > 10) return null;`

---

## Other Stuff I Added

Beyond just the DFS rendering:

- **Sorting**: You can sort root comments by recent/popular/most replies. The DFS structure stays intact.
- **Upvotes**: Click to upvote any comment at any depth
- **Authentication**: Login with @iit.ac.in email (as per requirements)
- **Responsive design**: Works on mobile, tablet, desktop
- **Smooth animations**: Tailwind transitions for collapse/expand

---

## Tech Stack

- **React** - For the component structure and state management
- **Tailwind CSS** - For styling (those utility classes are amazing)
- **Lucide Icons** - For the UI icons
- **No backend yet** - Using mock data for now, but structured it so connecting to an API is easy

---

## What I Learned

Honestly, this task made me really think about data structures. I've used trees in DSA classes but never really *got* why they're useful until I had to build something real with them.

The DFS approach seemed scary at first (recursion always does), but once I got it working, I was like "oh wow, this is actually elegant". It's one of those cases where the "correct" solution is also the simplest one.

Also learned that sometimes the fancy solution isn't better. I considered using Redux for state management, or building a custom tree traversal system, but keeping it simple with React hooks and basic recursion worked perfectly.

---

## If I Had More Time

Some things I'd add:
- Backend with Express/FastAPI
- Database (probably PostgreSQL)
- Real authentication with JWT
- Edit/delete comments
- Rich text editor for comments
- Image uploads
- Notification system
- Admin panel to moderate comments
- Search functionality
- Pagination for really long threads

But for the selection task, I think this demonstrates the core concept well enough.

---

## Final Thoughts

DFS was definitely the right choice here. It solved the problem elegantly, the code is maintainable, and it actually works like users expect. Not the most complicated solution, but sometimes simple is better.

Plus, it was actually fun to build once I figured out the recursive pattern. There's something satisfying about watching the comments render themselves through recursion.

---

**Submitted by**: Rupesh Sahoo  
**Date**: 19-10-2025
**GitHub**:  https://github.com/mlArchitecture
