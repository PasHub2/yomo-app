# Supabase Entity Modules

Complete implementation of all 10 Supabase entity modules for the YoMo app.

## ✅ Implemented Modules

All modules follow these standards:
- **Pagination**: All list/filter functions accept `{ limit: 20, offset: 0 }`
- **Error Handling**: Contextual error messages for debugging
- **JSDoc**: Complete documentation for all functions
- **Async/await**: Modern async patterns throughout

### Available Modules

1. **Profile** (6 functions)
   - `getByEmail`, `getByUsername`, `getById`, `list`, `update`, `filter`
   
2. **Moment** (8 functions)
   - `create`, `getById`, `getByUser`, `getByCircle`, `list`, `filter`, `update`, `deleteById`
   - ⚠️ `deleteById` uses SOFT DELETE (sets `is_deleted: true`)
   
3. **Circle** (7 functions)
   - `create`, `getById`, `getByCreator`, `getPublic`, `list`, `filter`, `update`, `deleteById`
   - 📅 Ordered by `created_at DESC` (newest first)
   
4. **MomentCircle** (4 functions)
   - `create`, `getByMoment`, `getByCircle`, `deleteById`
   - 🔗 Junction table - `getByCircle` returns full moment objects
   - 🔑 `deleteById` uses composite key `(momentId, circleId)`
   
5. **CircleMembership** (6 functions)
   - `create`, `getById`, `getByUser`, `getByCircle`, `update`, `deleteById`
   - 📅 Ordered by `created_at DESC`
   
6. **Like** (4 functions)
   - `create`, `getByMoment`, `getByUser`, `deleteById`
   - 🔄 `create` implements TOGGLE logic (like/unlike)
   
7. **Comment** (6 functions)
   - `create`, `getById`, `getByMoment`, `list`, `update`, `deleteById`
   - 📅 Ordered by `created_at DESC` (newest first)
   
8. **Follow** (5 functions)
   - `create`, `getFollowing`, `getFollowers`, `update`, `deleteById`
   - 📅 Ordered by `created_at DESC`
   
9. **Badge** (7 functions)
   - `create`, `getById`, `getByUser`, `getByCircle`, `getByUserCircle`, `list`, `filter`
   - 📅 Ordered by `created_at DESC`
   
10. **CircleWhitelist** (3 functions)
    - `create`, `getByCircle`, `deleteById`
    - 📅 Ordered by `created_at DESC`
    - 🔑 `deleteById` uses composite key `(circleId, userId)`

## 📖 Usage Examples

### Import Modules

```javascript
// Import all modules
import { Moment, Circle, Like, Profile } from '@/api/entities';

// Or import specific module
import { Moment } from '@/api/entities';
```

### Basic CRUD Operations

```javascript
// Create a moment
const newMoment = await Moment.create({
  created_by: userId,
  front_camera_url: 'https://...',
  back_camera_url: 'https://...',
  title: 'My first moment'
});

// Get moments with pagination
const moments = await Moment.list({ limit: 20, offset: 0 });

// Get moments by user
const userMoments = await Moment.getByUser(userId, { limit: 10, offset: 0 });

// Filter moments
const filteredMoments = await Moment.filter(
  { created_by: userId, title: 'Beach day' },
  { limit: 20, offset: 0 }
);

// Update moment
await Moment.update(momentId, { title: 'Updated title' });

// Soft delete moment
await Moment.deleteById(momentId); // Sets is_deleted: true
```

### Like Toggle

```javascript
// Toggle like (like if not liked, unlike if already liked)
await Like.create(userId, momentId);
```

### Circle Operations

```javascript
// Get public circles (newest first)
const publicCircles = await Circle.getPublic({ limit: 20, offset: 0 });

// Create circle
const circle = await Circle.create({
  name: 'My Circle',
  created_by: userId,
  is_public: true
});

// Get circles by creator
const myCircles = await Circle.getByCreator(userId);
```

### Junction Tables

```javascript
// Link moment to circle
await MomentCircle.create(momentId, circleId);

// Get all moments in a circle (returns full moment objects)
const circleMoments = await MomentCircle.getByCircle(circleId, { limit: 20 });

// Remove moment from circle (composite key)
await MomentCircle.deleteById(momentId, circleId);
```

### Comments

```javascript
// Create comment
const comment = await Comment.create({
  moment_id: momentId,
  user_id: userId,
  content: 'Great moment!'
});

// Get comments for a moment (newest first)
const comments = await Comment.getByMoment(momentId, { limit: 20, offset: 0 });

// Update comment
await Comment.update(commentId, 'Updated comment text');

// Delete comment (hard delete)
await Comment.deleteById(commentId);
```

### Follow System

```javascript
// Follow user
await Follow.create(followerId, followingId);

// Get who user is following
const following = await Follow.getFollowing(userId, { limit: 20 });

// Get user's followers
const followers = await Follow.getFollowers(userId, { limit: 20 });

// Unfollow user
await Follow.deleteById(followerId, followingId);
```

### Profile Updates

```javascript
// Update profile (RLS ensures user can only update their own profile)
await Profile.update(userId, {
  username: 'newusername',
  bio: 'My new bio'
});

// Get profile by username
const profile = await Profile.getByUsername('john');
```

## 🔐 Row Level Security (RLS)

All modules respect Supabase RLS policies:
- Users can only update their own profiles
- Circle visibility controlled by `is_public` flag
- Membership and whitelist checks enforced by database policies

## 🎯 Key Features

### Soft Delete vs Hard Delete
- **Soft Delete**: Moment (sets `is_deleted: true, deleted_at: timestamp`)
- **Hard Delete**: Like, Comment, Follow, Circle, Badges, Whitelist

### Composite Keys
- `MomentCircle.deleteById(momentId, circleId)`
- `CircleWhitelist.deleteById(circleId, userId)`
- `CircleMembership.deleteById(userId, circleId)`
- `Follow.deleteById(followerId, followingId)`

### Pagination Everywhere
All list/filter functions support pagination:
```javascript
const options = {
  limit: 20,  // default: 20
  offset: 0   // default: 0
};
```

### Error Handling
All errors include context for debugging:
```javascript
try {
  await Moment.create(data);
} catch (error) {
  console.error(error.message); // "Failed to create moment: [Supabase error]"
}
```

## 🧪 Testing

To test the modules in your browser console:

```javascript
// Import modules
import { Moment, Circle } from '/src/api/entities/index.js';

// Test fetching data
const moments = await Moment.list({ limit: 5 });
console.log('Moments:', moments);

const circles = await Circle.getPublic({ limit: 5 });
console.log('Public circles:', circles);
```

## 📁 File Structure

```
src/api/entities/
├── profile.js           # Profile management
├── moment.js            # Moments (with soft delete)
├── circle.js            # Circles
├── momentCircle.js      # Moment-Circle junction table
├── circleMembership.js  # Circle memberships
├── like.js              # Likes (with toggle logic)
├── comment.js           # Comments
├── follow.js            # Follow relationships
├── badge.js             # User badges
├── circleWhitelist.js   # Circle whitelist
└── index.js             # Namespace exports
```

## ✅ Implementation Complete

All 10 entity modules are fully implemented with:
- ✅ Complete JSDoc documentation
- ✅ Pagination support
- ✅ Error handling with context
- ✅ Proper ordering (DESC on created_at where needed)
- ✅ Soft delete for moments
- ✅ Like toggle logic
- ✅ Composite key support
- ✅ Junction table joins
- ✅ No linter errors

Ready to use in your YoMo app! 🎉

