import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { httpService } from "../services/http.service";

function HomePage() {
    const navigtate = useNavigate();
    const [cards, setCards] = useState([]);

    // const cards = [
    //     {
    //         name: "Raspberry Pi",
    //         description: "Raspberry Pi Stack Exchange is a question and answer site for users and developers of hardware and software for Raspberry Pi",
    //         image: "raspberry-pi.svg",
    //         alt: "Raspberry Pi logo",
    //         link: "/technology/raspberry-pi"
    //     }, {
    //         name: "Server Fault",
    //         description: "Server Faults is a question and answer site for system and network administrators",
    //         image: "server.svg",
    //         link: "/technology/server-fault"
    //     }, {
    //         name: "Unix & Linux",
    //         description: "Unix & Linux Stack Exchange Is a question and answer site for users of Linux, FreeBSD and other Un*x-like operating systems",
    //         image: "linux.svg",
    //         link: "/technology/unix"
    //     }, {
    //         name: "RavenDB",
    //         description: "Learn more about RavenDB and how to best use it",
    //         image: "ravendb-logo.svg",
    //         link: "/technology/ravendb"
    //     },
    // ]

    function handleLinkClick(url) {
        navigtate(url);
    }

    useEffect(() => {
        async function fetchCards() {
            const res = await httpService.get("cards")
            setCards(res.data);
        }

        fetchCards();
    }, []);

    return (
        <main className="home-page">
            <div className="hero-cards">
                {cards.map((card) => (
                    <div className="card bg-faded-primary" style={{ cursor: "pointer" }} onClick={() => handleLinkClick(card.link)}>
                        <div className="px-4 py-3 hstack gap-4 align-items-start">
                            <img src={`/img/${card.image}`} alt={card.alt} className="hero-cards-img" />
                            <div>
                                <h3 className="m-0">{card.name}</h3>
                                <p>{card.description}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="hero">
                <img src="/img/hero.jpg" className="hero-img" alt="" />
                <div className="hero-container">
                    <div className="hero-content">
                        <h1>
                            <img src="./img/ravendb-logo.svg" className="ravendb-logo" alt="RavenDB" />
                            offline knowledge base!
                        </h1>
                        <div className="hero-input input-group input-group-lg">
                            <input type="text" className="form-control px-4 py-2" placeholder="Search database" />
                            <button className="btn btn-primary px-4" type="button" id="">Search</button>
                        </div>
                    </div>
                </div>
            </div>
        </main>


    );
}

export default HomePage;