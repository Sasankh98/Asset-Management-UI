import Pagination from "react-js-pagination";
import "./Pagination.css";

const PaginationBlock = (props) => {
  return (
    <div className={props.parentClassName? "pagination-container" + props.parentClassName : "pagination-container"}>
      <div className="page-part1-space"></div>
      <div className="page-part2-space">
        <Pagination 
            containerClassName={"pagination"}
            subContainerClassName={"pages pagination"}
            activePage={props.activePage}
            totalItemsCount={props.totalItemsCount}
            itemsCountPerPage={props.itemsCountPerPage}
            pageRangeDisplayed={props.pageRangeDisplayed}
            onChange={props.onChange}
            itemClass={"page-item"}
            linkClass={"page-link"}
            linkClassFirst={"first-page"}
            linkClassLast={"last-page"}
        />
      </div>
    </div>
  );
};

export default PaginationBlock;
