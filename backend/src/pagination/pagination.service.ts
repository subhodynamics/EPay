export interface PaginatedResult<T> {
    data: T[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }
  
  export const getPaginatedResults = async <T>(
    model: any,
    query: any = {},
    page: number = 1,
    limit: number = 10,
    sort: any = { createdAt: -1 },
    populate: string[] = [],
  ): Promise<PaginatedResult<T>> => {
    const skip = (page - 1) * limit;
    
    let queryBuilder = model.find(query).skip(skip).limit(limit).sort(sort);
    
    // Apply population if needed
    if (populate.length > 0) {
      populate.forEach(field => {
        queryBuilder = queryBuilder.populate(field);
      });
    }
    
    const [data, total] = await Promise.all([
      queryBuilder.exec(),
      model.countDocuments(query),
    ]);
    
    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  };