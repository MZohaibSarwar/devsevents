// Central export point for all database models
export { default as Event, type IEvent } from './event.model';
export { default as Booking, type IBooking } from './booking.model';
export { default as User, type IUser } from './user.model';

// Alternative named exports for consistency
export * from './event.model';
export * from './booking.model';
export * from './user.model';
