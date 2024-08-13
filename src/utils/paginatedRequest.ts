import { EntityName, EntitySourceName } from "../types/shared.types";
import { TotalCount } from "../types/shared.types";
import { ErrorResponse, handleError } from "./handleError";
import { PaginatedRequest } from "../types/shared.types";

export const paginatedRequest = async <T>({
  totalCount,
  data,
  offset,
  limit,
  source,
}: {
  totalCount: TotalCount;
  data: T[];
  offset: number;
  limit: number;
  source: EntityName;
}): Promise<PaginatedRequest | ErrorResponse> => {
  try {

    const { total_count } = totalCount;
    const total_number_of_pages = Math.ceil(total_count / limit);
  
    let current_page = (offset + limit) / limit;
    if (offset === 0) {
      current_page = 1;
    }
  
    return {
      [source]: data,
      total_number_of_pages,
      current_page,
      total_items: total_count,
    };
  } catch (err) {
    return handleError({
      error: `Error occurred paginating ${source}`,
      errorCode: 500,
      errorMessage: `${err}`,
      errorSource: "Paginating Request"

    })
  }
};
  