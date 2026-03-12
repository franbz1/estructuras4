import { NotFoundError } from '../errors/NotFoundError.ts'
import { ValidationError } from '../errors/ValidationError.ts'

export interface Identifiable {
  id: string
}

export abstract class BaseInMemoryService<T extends Identifiable> {
  protected readonly items: T[] = []

  public create(entity: T): T {
    const existing = this.items.some((item) => item.id === entity.id)
    if (existing) {
      throw new ValidationError(`Entity with id "${entity.id}" already exists.`)
    }

    this.items.push(entity)
    return entity
  }

  public getById(id: string): T {
    const item = this.items.find((entry) => entry.id === id)
    if (!item) {
      throw new NotFoundError(`Entity with id "${id}" was not found.`)
    }

    return item
  }

  public getAll(): T[] {
    return [...this.items]
  }

  public update(id: string, next: T): T {
    const index = this.items.findIndex((entry) => entry.id === id)
    if (index < 0) {
      throw new NotFoundError(`Entity with id "${id}" was not found.`)
    }

    if (id !== next.id) {
      throw new ValidationError('Entity id cannot be changed during update.')
    }

    this.items[index] = next
    return next
  }

  public delete(id: string): void {
    const index = this.items.findIndex((entry) => entry.id === id)
    if (index < 0) {
      throw new NotFoundError(`Entity with id "${id}" was not found.`)
    }

    this.items.splice(index, 1)
  }
}
