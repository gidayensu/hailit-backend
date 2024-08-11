import { paginatedRequest } from "../utils/paginatedRequest";
import { errorHandler } from "../utils/errorHandler";
import { GetAll, GetAllFromDB } from "../types/getAll.types";


type EntityName = "trips" | "riders" | "drivers" | "users" | "vehicles"
interface GetAllEntities extends GetAll {
  getAllEntitiesFromDB: ({...args}:GetAllFromDB)=>any,
  getCount: (search:string)=>any,
  entityName: EntityName
}

export const getAllEntitiesService = async (
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
  
      const entities = await getAllEntitiesFromDB(
        {limit,
        offset,
        sortColumn,
        sortDirection,
        search}
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
  