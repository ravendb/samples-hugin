import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

export function useAddToQueryParams() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  function addToQueryParams({ key, value }) {
    const isSearchPage = location.pathname === "/search";
    if (!isSearchPage) return navigate(`/search?${key}=${value}`);
    const isTagInSearch = searchParams.getAll(key).includes(value);
    if (isTagInSearch) return;
    const hasSearchParams = Array.from(searchParams).length > 0;
    if (!hasSearchParams)
      return navigate(`${location.pathname}?${key}=${value}`);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.append(key, value);
    setSearchParams(newSearchParams);
  }
  return { addToQueryParams };
}
