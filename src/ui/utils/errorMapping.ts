import { InvalidTransitionError } from '../../domain/errors/InvalidTransitionError.ts'
import { NotFoundError } from '../../domain/errors/NotFoundError.ts'
import { UnauthorizedActorError } from '../../domain/errors/UnauthorizedActorError.ts'
import { ValidationError } from '../../domain/errors/ValidationError.ts'
import type { UiErrorState } from '../types/WorkflowSnapshot.ts'

export function mapDomainError(error: unknown): UiErrorState {
  if (error instanceof ValidationError) {
    return {
      title: 'Validation error',
      message: error.message,
      details: error.stack,
    }
  }

  if (error instanceof UnauthorizedActorError) {
    return {
      title: 'Unauthorized actor',
      message: error.message,
      details: error.stack,
    }
  }

  if (error instanceof InvalidTransitionError) {
    return {
      title: 'Invalid transition',
      message: error.message,
      details: error.stack,
    }
  }

  if (error instanceof NotFoundError) {
    return {
      title: 'Entity not found',
      message: error.message,
      details: error.stack,
    }
  }

  if (error instanceof Error) {
    return {
      title: 'Unexpected error',
      message: error.message,
      details: error.stack,
    }
  }

  return {
    title: 'Unknown error',
    message: 'An unknown error occurred.',
  }
}
