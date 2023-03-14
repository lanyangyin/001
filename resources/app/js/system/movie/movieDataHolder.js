class MovieDataHolder extends DataHolder
{
    constructor()
    {
        super("movieData");
    }

    setup()
    {
        this.setupPath(
            [
                "resources/data/default/movie/movieData.csv",
            ]);
    }
}

new MovieDataHolder();
