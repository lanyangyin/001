class TalkDataHolder extends DataHolder
{
    constructor()
    {
        super("talkData");
    }

    setup()
    {
        this.setupPath([
            "resources/data/default/scenario/talkData_system_00.csv",

            "resources/data/default/scenario/talkData_main_00.csv",
            "resources/data/default/scenario/talkData_main_01.csv",
            "resources/data/default/scenario/talkData_main_02.csv",
            "resources/data/default/scenario/talkData_main_03.csv",
            "resources/data/default/scenario/talkData_main_04.csv",
            "resources/data/default/scenario/talkData_main_05.csv",
            "resources/data/default/scenario/talkData_main_06.csv",
            "resources/data/default/scenario/talkData_main_07.csv",
            "resources/data/default/scenario/talkData_main_08.csv",
            "resources/data/default/scenario/talkData_main_09.csv",
            "resources/data/default/scenario/talkData_main_10.csv",
            "resources/data/default/scenario/talkData_main_11.csv",
            "resources/data/default/scenario/talkData_main_12.csv",
            "resources/data/default/scenario/talkData_main_13.csv",
            "resources/data/default/scenario/talkData_main_14.csv",
            "resources/data/default/scenario/talkData_main_15.csv",
            "resources/data/default/scenario/talkData_main_16.csv",

            "resources/data/default/scenario/talkData_kiko_01.csv",
            "resources/data/default/scenario/talkData_shino_01.csv",
            "resources/data/default/scenario/talkData_akane_01.csv",
            "resources/data/default/scenario/talkData_minamo_01.csv",
            "resources/data/default/scenario/talkData_hinase_01.csv",
            "resources/data/default/scenario/talkData_itsuka_01.csv",

            "resources/data/default/scenario/talkData_kiko_02.csv",
            "resources/data/default/scenario/talkData_shino_02.csv",
            "resources/data/default/scenario/talkData_minamo_02.csv",
            "resources/data/default/scenario/talkData_hinase_02.csv",

            "resources/data/default/scenario/talkData_sub_01.csv",
            "resources/data/default/scenario/talkData_sub_meguru_01.csv",
            "resources/data/default/scenario/talkData_sub_endless_01.csv",

            "resources/data/default/scenario/talkData_chat_01.csv",

            "resources/data/default/scenario/talkData_repeat_01.csv",
            "resources/data/default/scenario/talkData_repeat_meguru_01.csv",

            "resources/data/default/scenario/talkData_shop_01.csv",

            "resources/data/default/scenario/talkData_mission_01.csv",

            "resources/data/default/scenario/talkData_collection_01.csv",

            "resources/data/default/scenario/talkData_promote_01.csv",
        ]);

        this.setupSubPath([
            "resources/data/eng/scenario/talkData_main_00.csv",
        ]);
    }
}

new TalkDataHolder();
