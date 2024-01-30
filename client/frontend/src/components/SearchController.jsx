import "../styles/components/search-controller.css";
import { useSearchParams } from "react-router-dom";
import { IoClose } from "react-icons/io5";

function SearchController() {
  const [searchParams, setSearchParams] = useSearchParams();

  const tags = searchParams.getAll("tag");
  const communities = searchParams.getAll("community");

  function handleRemoveTag(tag) {
    setSearchParams(searchParams => {
      searchParams.delete("tag", tag);
      return searchParams;
    })
  }

  function handleRemoveCommunity(community) {
    setSearchParams(searchParams => {
      searchParams.delete("community", community);
      return searchParams;
    });
  }

  function handleSortByChange(e) {
    setSearchParams(searchParams => {
      searchParams.set("orderBy", e.target.value);
      return searchParams;
    });
  }

  return (
    <div className="card search-controller">
      <div className="search-controller-tags">
        {tags.map((tag) => (
          <div key={tag} className="search-controller-tag">
            <span>{tag}</span>
            <IoClose
              className="search-controller-close"
              onClick={() => handleRemoveTag(tag)}
            />
          </div>
        ))}
      </div>
      <div className="search-controller-communities">
        {communities.map((community) => (
          <div key={community} className="search-controller-community">
            <span>{community}</span>
            <IoClose
              className="search-controller-close"
              onClick={() => handleRemoveCommunity(community)}
            />
          </div>
        ))}
      </div>
      <div className="search-controller-sort-by">
        <h1 className="search-controller-sort-by-title">Sort By</h1>
        <select
          onChange={handleSortByChange}
          className="search-controller-sort-by-select form-control"
        >
          <option
            value="CreationDate"
            className="search-controller-sort-by-option"
          >
            Creation Date
          </option>
          <option value="Score" className="search-controller-sort-by-option">
            Score
          </option>
          <option
            value="ViewCount"
            className="search-controller-sort-by-option"
          >
            View Count
          </option>
        </select>
      </div>
    </div>
  );
}

export default SearchController;
