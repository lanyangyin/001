class AutoPlayGameOver extends AutoPlayFlow
{
    static update()
    {
        globalSystem.uiManager.gameOver.continueButton.onclick();
    }
}
