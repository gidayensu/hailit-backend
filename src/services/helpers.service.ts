import { GetAll, GetAllFromDB } from "../types/getAll.types";
import { EntityName, TotalCount } from "../types/shared.types";
import { ErrorResponse, handleError } from "../utils/handleError";
import { paginatedRequest } from "../utils/paginatedRequest";
import { isErrorResponse } from "../utils/util";

interface GetAllEntities extends GetAll {
  getAllEntitiesFromDB: ({...args}:GetAllFromDB)=>any,
  getCount:  (search:string)=> Promise<ErrorResponse | TotalCount>,
  entityName: EntityName
}

export const getAllEntitiesService = async <T>(
    {page,
    limit,
    sortColumn,
    sortDirection,
    search,
    getAllEntitiesFromDB, 
    getCount, 
    entityName}: GetAllEntities 
  ) => {
    try {
      let offset = 0;
  
      page > 1 ? (offset = limit * page - limit) : page;
  
      const entities: T[] | ErrorResponse = await getAllEntitiesFromDB(
        {limit,
        offset,
        sortColumn,
        sortDirection,
        search}
      );
      
      if (isErrorResponse(entities)) {
      
        return entities; // with error details

      }
      const totalCount = await getCount(search);
  
      
      if (isErrorResponse(totalCount)) {
        
        return totalCount; // with error details
      }
  
      return await paginatedRequest({totalCount, data: entities, offset, limit, source: entityName});
    } catch (err) {
      
      return handleError(
        {
          error: `Error occurred getting all ${entityName}`,
          errorMessage: `${err}`,
          errorCode: 500,
          errorSource: `${entityName} service`
        }
        
      );
    }
  };
  