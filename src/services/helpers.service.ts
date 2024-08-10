import { paginatedRequest } from "../utils/paginatedRequest.js";
import { errorHandler } from "../utils/errorHandler.js";

export const getAllEntitiesService = async (
    page,
    limit,
    sortColumn,
    sortDirection,
    search,
    getAllEntitiesFromDB, 
    getCount, 
    entityName 
  ) => {
    try {
      let offset = 0;
  
      page > 1 ? (offset = limit * page - limit) : page;
  
      const entities = await getAllEntitiesFromDB(
        limit,
        offset,
        sortColumn,
        sortDirection,
        search
      );
      
      if (entities.error) {
      
        return entities; // with error details

      }
      const totalCount = await getCount(search);
  
      
      if (totalCount.error) {
        
        return totalCount; // with error details
      }
  
      return await paginatedRequest(totalCount, entities, offset, limit, entityName);
    } catch (err) {
      
      return errorHandler(
        {
          error: `Error occurred getting all ${entityName}`,
          errorMessage: `${err}`,
          errorCode: 500,
          errorSource: `${entityName} service`
        }
        
      );
    }
  };
  