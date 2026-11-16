# Auth Handoff: Member 1 → Member 3 (Booking)

Everything you need to use authentication inside the Booking APIs.

## 1. User IDs
Every user is a MongoDB document with an auto-generated `_id` (ObjectId).
Both customers and providers live in the **same `users` collection**.
In JSON responses it appears as `_id` (e.g. `"665f1c2e9b1d4a0012ab34cd"`).

## 2. User schema (`backend/models/User.js`, model name `'User'`)
| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | Auto |
| `name` | String | Required |
| `email` | String | Required, unique, lowercase |
| `password` | String | Hashed (bcrypt), hidden from queries/JSON |
| `role` | `'customer'` \| `'provider'` | Identifies the user type |
| `phone`, `city` | String | Optional |
| `businessName`, `serviceCategory`, `description` | String | Provider only (empty for customers) |
| `createdAt`, `updatedAt` | Date | Auto |

## 3. Authentication middleware (`backend/middleware/authMiddleware.js`)
```js
const { protect, authorize } = require('../middleware/authMiddleware');
```
- `protect` – requires a valid JWT. Returns 401 if missing/invalid/expired.
- `authorize('customer')` / `authorize('provider')` / `authorize('customer','provider')` – must come **after** `protect`. Returns 403 if the role doesn't match.

The client sends the token on every request:
```
Authorization: Bearer <token>
```
(The frontend `src/api/axios.js` already does this automatically.)

## 4. How roles are identified
`req.user.role` is either `'customer'` or `'provider'`. The JWT payload also contains `{ id, role }`, but always read from `req.user` in controllers.

## 5. Getting the logged-in user's ID in a controller
After `protect` runs, the full user document is on `req.user`:
```js
req.user._id   // ObjectId, use this to store references
req.user.role  // 'customer' | 'provider'
req.user.name  // etc.
```
**Never take the user's ID from `req.body`.** Always use `req.user._id` so users can't act as someone else.

## 6. Example for Booking
```js
// models/Booking.js
const bookingSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // ...date, service, status, etc.
}, { timestamps: true });

// routes/bookingRoutes.js
const { protect, authorize } = require('../middleware/authMiddleware');
router.post('/', protect, authorize('customer'), createBooking);
router.get('/my', protect, getMyBookings);
router.patch('/:id/status', protect, authorize('provider'), updateBookingStatus);

// controllers/bookingController.js
const createBooking = async (req, res) => {
  const booking = await Booking.create({
    customer: req.user._id,          // from the token, not the body
    provider: req.body.providerId,   // the provider being booked
    // ...
  });
  res.status(201).json({ success: true, booking });
};

const getMyBookings = async (req, res) => {
  const filter = req.user.role === 'provider'
    ? { provider: req.user._id }
    : { customer: req.user._id };
  const bookings = await Booking.find(filter)
    .populate('customer', 'name email phone')
    .populate('provider', 'name businessName serviceCategory');
  res.json({ success: true, bookings });
};

// In updateBookingStatus, also verify ownership:
// if (!booking.provider.equals(req.user._id)) return res.status(403).json({ ... });
```
Remember to mount the route in `server.js`:
```js
app.use('/api/bookings', require('./routes/bookingRoutes'));
```

## 7. Setup & testing
1. `cd backend && npm install && cp .env.example .env` (set `MONGO_URI`, `JWT_SECRET`; **everyone on the team must use the same `JWT_SECRET`** only if sharing a deployed DB/server, locally each can differ).
2. `npm run dev`. You should see `MongoDB connected`.
3. Register + get a token:
```bash
curl -X POST localhost:5000/api/auth/register/customer \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Cust","email":"c@test.com","password":"123456"}'
```
4. Use the returned `token`:
```bash
curl localhost:5000/api/auth/me -H "Authorization: Bearer <token>"
curl localhost:5000/api/auth/customer-area -H "Authorization: Bearer <token>"   # 200
curl localhost:5000/api/auth/provider-area -H "Authorization: Bearer <token>"   # 403
```

## 8. Response/error format
Success: `{ success: true, ... }`  
Error: `{ success: false, message: "..." }` with 400 / 401 / 403 / 404 / 409 / 500.
