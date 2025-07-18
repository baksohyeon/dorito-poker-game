// packages/database/src/types/repository.types.ts
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  orderBy?: Record<string, 'asc' | 'desc'>;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface QueryOptions<T = any> {
  where?: T;
  select?: T;
  include?: T;
  orderBy?: T;
  skip?: number;
  take?: number;
}

export abstract class BaseRepository<T extends BaseEntity> {
  protected abstract model: any;

  async findById(id: string, options?: QueryOptions): Promise<T | null> {
    return this.model.findUnique({
      where: { id },
      ...options,
    });
  }

  async findMany(options?: QueryOptions): Promise<T[]> {
    return this.model.findMany(options);
  }

  async findFirst(options?: QueryOptions): Promise<T | null> {
    return this.model.findFirst(options);
  }

  async create(data: Omit<T, keyof BaseEntity>): Promise<T> {
    return this.model.create({ data });
  }

  async update(
    id: string,
    data: Partial<Omit<T, keyof BaseEntity>>
  ): Promise<T> {
    return this.model.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<T> {
    return this.model.delete({
      where: { id },
    });
  }

  async count(where?: any): Promise<number> {
    return this.model.count({ where });
  }

  async exists(where: any): Promise<boolean> {
    const count = await this.model.count({ where });
    return count > 0;
  }

  async findPaginated(
    options: QueryOptions,
    pagination: PaginationOptions
  ): Promise<PaginatedResult<T>> {
    const { page, limit, orderBy } = pagination;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.model.findMany({
        ...options,
        skip,
        take: limit,
        orderBy,
      }),
      this.model.count({ where: options.where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }
}
