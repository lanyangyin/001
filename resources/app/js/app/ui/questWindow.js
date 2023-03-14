class QuestWindow extends UIElement
{
    constructor()
    {
        super("quest");
        this.animator = new Animator();
        this.window = null;
        this.autoButton = null;
        this.hit = null;
        this.hitAnim = null;
        this.damage = null;
        this.damageAnim = null;
        this.heal = null;
        this.healAnim = null;
    }

    setup()
    {
        this.window = document.getElementById("quest");
        this.autoButton = document.getElementById("questTextAuto");
        this.hit = document.getElementById("questHitFilter");
        this.damage = document.getElementById("questDamageFilter");
        this.heal = document.getElementById("questHealFilter");

        globalSystem.textAutoManager.registerButton(this.autoButton);
    }

    update()
    {
        this.animator.update();
    }

    playHitEffect()
    {
        if (this.hitAnim != null)
        {
            this.animator.cancel(this.hitAnim);
        }
        this.hitAnim = this.animator.opacity(this.hit, 0.5, 0, 2, "ease-out");
    }

    playDamageEffect()
    {
        if (this.damageAnim != null)
        {
            this.animator.cancel(this.damageAnim);
        }
        this.damageAnim = this.animator.opacity(this.damage, 0.5, 0, 2, "ease-out");
    }

    playHealEffect()
    {
        if (this.healAnim != null)
        {
            this.animator.cancel(this.healAnim);
        }
        this.healAnim = this.animator.opacity(this.heal, 0.3, 0, 2, "ease-out");
    }

    setOnClickEvent(event)
    {
        this.window.onclick = event;
    }
}

new QuestWindow();
