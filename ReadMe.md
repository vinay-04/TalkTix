# TalkTix API

A platform connecting speakers with audiences for booking speaking engagements.

## Technologies Used
- Node.js & TypeScript
- PostgreSQL with Drizzle ORM
- Redis for caching
- JWT for authentication
- Swagger for API documentation
- Zod for validation

## Getting Started

### Prerequisites
- Node.js >= 18
- PostgreSQL
- Redis
- pnpm

### Installation

1. Clone the repository
2. Install dependencies
```shell
pnpm install
```
3. Start services with Docker Compose
```shell
docker-compose up -d
```
4. Create environment file
```shell
cp .env.example .env.local
```
5. Update environment variables in `.env.local`
6. Run database migrations
```shell
pnpm migrate
```
7. Start the development server
```shell
pnpm dev
```


## API Documentation
Swagger documentation is available at: `http://localhost:3000/api-docs`

### Available Endpoints

#### Authentication
- `POST /api/v1/auth/signup` - Register a new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/verify` - Verify user email
- `POST /api/v1/auth/send-otp` - Send verification OTP

#### Users
- `GET /api/v1/user/:userId` - Get user details
- `PUT /api/v1/user/:userId` - Update user details

#### Speakers
- `POST /api/v1/speaker/create` - Create speaker profile
- `GET /api/v1/speaker/:speakerId` - Get speaker details
- `PUT /api/v1/speaker/:speakerId` - Update speaker profile

#### Bookings
- `POST /api/v1/bookings/create` - Create new booking
- `GET /api/v1/bookings/:bookingId` - Get booking details
- `PUT /api/v1/bookings/:bookingId` - Update booking
- `GET /api/v1/user-booking/:userId` - Get user's bookings
- `GET /api/v1/speaker-booking/:speakerId` - Get speaker's bookings

## Project Structure

### Database Schema
The database uses Drizzle ORM with the following main tables:
- users - User information
- speakers - Speaker profiles
- bookings - Booking records

### Authentication
The API uses JWT tokens for authentication. Protected routes require a valid Bearer token.
```shell
Authorization: Bearer <token>
```

### Error Handling
All API endpoints return consistent error responses.

## License
[MIT](LICENSE)
