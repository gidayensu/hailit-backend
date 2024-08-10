export const paginatedRequest = async (
    totalCount,
    data,
    offset,
    limit,
    source
  ) => {
    const {total_count} = totalCount;
    const total_number_of_pages = Math.ceil(total_count / limit);
    
    let  current_page = ((offset +limit) / limit);
    if(offset === 0) {
        current_page = 1;  
    }
    
  
    return {
      [source]: data,
      total_number_of_pages,
      current_page,
      total_items: total_count
    };
  };
  