export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.status = 400;
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends Error {
  constructor(message = 'Not authenticated') {
    super(message);
    this.status = 401;
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  constructor(message = 'Not authorized') {
    super(message);
    this.status = 403;
    this.name = 'AuthorizationError';
  }
}
