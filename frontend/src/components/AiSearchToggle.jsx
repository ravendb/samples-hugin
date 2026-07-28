import { useDispatch } from "react-redux";
import { getServerResult, setAiEnabled } from "../store/store";
import "../styles/components/ai-search-toggle.css";

export default function AiSearchToggle() {
  const dispatch = useDispatch();
  const { searchResult } = getServerResult();
  return (
    <label className="ai-search-toggle">
      <input
        type="checkbox"
        checked={searchResult.aiEnabled}
        onChange={(event) => dispatch(setAiEnabled(event.target.checked))}
      />
      <span>Refine with AI</span>
    </label>
  );
}
