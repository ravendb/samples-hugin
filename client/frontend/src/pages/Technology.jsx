function Technology() {
    return (
        /*
            * Technology page
        -------------------
            * header image - as a top bar
            * RavenDB logo on the top right 
            * Technology logo on the top left
            * Name of the technology in the middle
            * search bar for the questions
            * cards of Tags, with a few questions per tag
        
            * Question page
        -------------------
            * Render the question
            * Render the answers + comments    
            * 
        
            * info page
        -------------------
            * pretty static page


            * search page
        --------------------
            * search bar
            * search results (same as Technology page view)
        */
        <div>
            <div className="hero">
                <img src="/img/hero.jpg" className="hero-img" alt="" />
                <div className="hero-container">
                    <div className="hero-content">
                        <h1>
                            <img src="/img/ravendb-logo.svg" className="ravendb-logo" alt="RavenDB" />
                        </h1>
                        <div className="hero-input input-group input-group-lg">
                            <input type="text" className="form-control px-4 py-2" placeholder="Search database" />
                            <button className="btn btn-primary px-4" type="button" id="">Search</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    )
}

export default Technology