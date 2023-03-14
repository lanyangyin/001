class MonacaSoundManager extends SoundManager
{
    constructor()
    {
        super();
        this.isDeviceReady = false;

        document.addEventListener("deviceready", function (owner)
        {
            return function ()
            {
                owner.isDeviceReady = true;
            };
        }(this), false);
    }

    get isReady()
    {
        return this.isDeviceReady;
    }

    createSoundElement(audio)
    {
        return new MonacaSoundElement(audio, audio.src, audio.id, audio.loop);
    }
}

class MonacaSoundElement extends SoundElement
{
    constructor(element, src, id, loop)
    {
        super(element, src, id, loop);
        this.element = new Media(src);
    }

    get currentTime()
    {
        return this.element.getCurrentPosition();
    }
    set currentTime(value)
    {
        this.element.seekTo(value);
    }

    get volume()
    {
        return 1;
    }
    set volume(value)
    {
        this.element.setVolume(value);
    }

    load()
    {
        /* nop */
    }

    play()
    {
        var arg = null;
        if (this.loop)
        {
            arg = { numberOfLoops: "infinite" };
        }
        this.element.play(arg);
    }

    pause()
    {
        this.element.pause();
    }
}

if (typeof monaca !== 'undefined')
{
    new MonacaSoundManager();
}
