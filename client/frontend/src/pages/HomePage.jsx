import { useNavigate } from "react-router-dom";
import { getCards } from "../services/data.service";
import "../styles/pages/home-page.css";
import SearchInput from "../components/SearchInput";

function HomePage() {
  const navigtate = useNavigate();
  const cards = getCards();

  function handleLinkClick(url) {
    navigtate(url);
  }

  return (
    <main className="home-page">
      <div className="cards">
        {cards.map((card) => (
          <div
            className="card"
            onClick={() => handleLinkClick(card.link)}
            key={card.name}
          >
            <div className="card-content">
              <img
                src={`/img/${card.image}`}
                alt={card.alt}
                className="card-img"
              />
              <div>
                <h3 className="card-title">{card.name}</h3>
                <p>{card.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="hero">
        <img src="/img/hero.jpg" className="hero-img" alt="raven-logo" />
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              <img
                src="./img/ravendb-logo.svg"
                className="hero-logo"
                alt="RavenDB"
              />
              offline knowledge base!
            </h1>
            <SearchInput />
          </div>
        </div>
      </div>
    </main>
  );
}

export default HomePage;
