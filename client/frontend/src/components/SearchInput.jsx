/* eslint-disable react/prop-types */
import "../styles/components/search-input.css";

function SearchInput({ value, onChange }) {
  return (
    <div className="search-input-container">
      <input
        type="text"
        className="search-input"
        placeholder="Search database"
      />
      <button className="search-btn" type="button">
        Search
      </button>
    </div>
  );
}

export default SearchInput;
