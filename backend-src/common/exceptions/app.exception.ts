import { HttpException, HttpStatus } from '@nestjs/common';

export class ResourceNotFoundException extends HttpException {
  constructor(resource: string, id?: string) {
    const message = id ? `${resource} with id '${id}' not found` : `${resource} not found`;
    super({ success: false, message }, HttpStatus.NOT_FOUND);
  }
}

export class DuplicateResourceException extends HttpException {
  constructor(resource: string, field: string) {
    super(
      { success: false, message: `${resource} with this ${field} already exists` },
      HttpStatus.CONFLICT,
    );
  }
}

export class ForbiddenActionException extends HttpException {
  constructor(action?: string) {
    super(
      { success: false, message: action ? `Forbidden: ${action}` : 'Forbidden' },
      HttpStatus.FORBIDDEN,
    );
  }
}

export class ValidationFailedException extends HttpException {
  constructor(errors: string[]) {
    super({ success: false, message: 'Validation failed', errors }, HttpStatus.BAD_REQUEST);
  }
}
